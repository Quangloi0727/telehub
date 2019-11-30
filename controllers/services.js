
var manager = require(path.join(_rootPath, 'monitor', 'manager.js'));
var syncAcd = require(path.join(_rootPath, 'monitor', 'sync-acd.js'));

exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        _async.parallel({
            companies: function(next) {
                var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: req.session.auth.company._id}) : {};
                _Company.find(_query, next);
            },
            skills: function(next) {
                var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {idCompany: req.session.auth.company._id}) : {};
                _Skills.find(_query, next);
            }
        }, function(err, result){

            var sort = _.cleanSort(req.query,'');
            var query = _.cleanRequest(req.query);

            var _query = {};
            if(query['name']) _query['name'] = {$regex: new RegExp(_.stringRegex(query['name']), 'i')};
            if(query['skills']) _query['skills'] = {$in: [new mongodb.ObjectId(query['skills'])]};
            if(query['idCompany']) _query['idCompany'] = query['idCompany'];
            if(query['routeCall']) _query['routeCall'] = query['routeCall'];
            if(query['idSkill']) _query['idSkill'] = query['idSkill'];
            if(query['status']) _query['status'] = query['status'];
            if(query['queueNumber']) _query['queueNumber'] = query['queueNumber'];

            var _query2 = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {idCompany: req.session.auth.company._id}) : {};

            _Services
                .find({$and: [_query, _query2]})
                .populate('idServiceAddress','name')
                .populate('idCompany','name')
                .populate('idSkill','skillName')
                .populate('createBy','name')
                .populate('updateBy','name')
                .sort(sort)
                .paginate(page, rows, function (error, items, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/services', current: page, rowsPerPage: rows, totalResult: total});
                    _.render(req, res, 'services',
                        {
                            title: 'Danh sách chiến dịch gọi vào',
                            searchData: query,
                            categories: items,
                            orgs: result.companies,
                            skills: result.skills,
                            paging: paginator.getPaginationData(),
                            plugins: [['bootstrap-select']]
                        }, true, error);
                });
        });
    }
}
// GET : http://domain.com/services/new
exports.new = function (req, res) {
    _async.parallel({
        companies: function(next) {
            // Truy vấn danh sách công ty và kỹ năng liên quan
            var aggregate = [];
            var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: new mongodb.ObjectId(req.session.auth.company._id)}) : {};
            aggregate.push({$match: {$and:[_query, {status: 1}]}});
            aggregate.push({$lookup: {from: 'skills', localField: '_id', foreignField: 'idCompany', as: 'skills'}});

            _Company.aggregate(aggregate, next);
        }
    }, function(err, result){
        _.render(req, res, 'services-new', {
            title: 'Tạo mới chiến dịch gọi vào',
            orgs: _.chain(result.companies)
                .map(function(com){
                    com.skills = _.chain(com.skills)
                        .filter(function(skill){
                            return skill.status == 1;
                        })
                        .value();
                    return com;
                })
                .value(),
            addressList: result.serviceAddress,
            plugins: [['bootstrap-select']]
        }, true);
    });
};
// GET : http://domain.com/services/:_id/edit
exports.edit = function (req, res) {
    _async.parallel({
        companies: function(next) {
            // Truy vấn danh sách công ty và kỹ năng liên quan
            var aggregate = [];
            var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: new mongodb.ObjectId(req.session.auth.company._id)}) : {};
            aggregate.push({$match: {$and:[_query, {status: 1}]}});
            aggregate.push({$lookup: {from: 'skills', localField: '_id', foreignField: 'idCompany', as: 'skills'}});
            _Company.aggregate(aggregate, next);
        },
        service: function(next){
            // Truy vấn dữ liệu của chiến dịch
            _Services.findById(req.params.service).populate('idSkill').exec(next);
        },
        ticket: function(next){
            // Kiểm tra chiến dịch đã phát sinh ticket hay chưa
            _Tickets.findOne({idService: req.params.service}, next);
        }
    }, function(err, result){
        if(result.service){
            _.render(req, res, 'services-edit', {
                title: 'Chỉnh sửa chiến dịch gọi vào',
                currentService: result.service,
                orgs: _.chain(result.companies)
                    .map(function(com){
                        com.skills = _.chain(com.skills)
                            .filter(function(skill){
                                return skill.status == 1;
                            })
                            .value();
                        return com;
                    })
                    .value(),
                canEdit: result.ticket ? 0 : 1,
                plugins: [['bootstrap-select']]
            }, !_.isNull(result.service), err);
        }else{
            res.json({code: 404, message: 'Page not found'});
        }
    });
};
// POST
exports.create = function (req, res) {
    req.body['createBy'] = req.session.user._id;
    req.body['created'] = new Date();
    _Services.create(req.body, function(err, result){
        _.genTree();
        if(!err){
            syncAcd.syncService();
            manager.addService(result);
        }
        res.json({code: (err ? 500 : 200), message: err ? err : ''});
    });
};

// PUT : http://domain.com/services/:_id
exports.update = function (req, res) {
    req.body['updateBy'] = req.session.user._id;
    req.body['updated'] = Date.now();
    _Services.findByIdAndUpdate(req.params.service, req.body, {new: true}, function (error, sv) {
        _.genTree();
        if(!error){
            syncAcd.syncService();
            manager.updateService(sv);
        }
        res.json({code: (error ? 500 : 200), message: error ? error : sv});
    });
};

// Validation engine
exports.validate = function (req, res) {
    if(req.query.updateId){
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId']);
        var _query = {$and: [_query1, _query2]};
        _Services.findOne(_query).exec(function (error, sv) {
            res.json([req.query.fieldId, _.isNull(sv)]);
        });
    }else {
        if(req.query.idCompany != ''){
            var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
            _Services.findOne(_query).exec(function (error, sv) {
                res.json([req.query.fieldId, _.isNull(sv)]);
            });
        }
        else {
            res.json([req.query.fieldId, true]);
        }
    }
};

// DELETE http://domain.com/services/:_id
exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.service, 'all')) {
        _Services._deleteAll({$in: [req.params.service]}, function (error, _noDelete) {
            _.genTree();
            if(!error){
                syncAcd.syncService();
                manager.removeService(req.params.service);
            }
            res.json({code: (error ? 500 : 200), message: error ? error : _noDelete});
        });
    }else{
        _Services._deleteAll({$in:req.body.ids.split(',')}, function (error, _noDelete) {
            _.genTree();
            syncAcd.syncService();
            _.each(req.body.ids.split(','), function(idService){
                if(!_noDelete.toString().indexOf(idService) >= 0){
                    manager.removeService(idService);
                }
            });
            res.json({code: (error ? 500 : 200), message: error ? error : _noDelete});
        });
    }
};