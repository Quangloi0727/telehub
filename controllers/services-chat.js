var crmPublish = require(path.join(_rootPath, 'queue', 'publish', 'chat.js'));

exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = req.query;

        var aggregate = _ServicesChat.aggregate();
        aggregate._pipeline = [{$lookup: {from: 'skillchats', localField: 'idSkill', foreignField: '_id', as: 'idSkill'}},
            {$unwind: '$idSkill'},
            {$lookup: {from: 'companychannels', localField: 'idChannel', foreignField: '_id', as: 'idChannel'}},
            {$lookup: {from: 'companies', localField: 'idSkill.idCompany', foreignField: '_id', as: 'idCompany'}},
            {$unwind: '$idChannel'},
            {$unwind: '$idCompany'}];
        var _query = {};
        if (_.has(query, 'idCompany')) _query['idCompany._id'] = new mongodb.ObjectId(query.idCompany);
        if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});

        _ServicesChat.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, service, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink: '/services-chat', current: page, rowsPerPage: rows, totalResult: count});
            res.json(service);
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        _async.parallel({
            companies: function(next) {
                _Company.find({status: 1}, next);
            },
            skills: function(next) {
                _SkillsChat.find({status: 1}, next);
            }
        }, function(err, result){

            var sort = _.cleanSort(req.query,'');
            var query = _.cleanRequest(req.query);

            var _query = {};
            if(query['name']) _query['name'] = {$regex: new RegExp(_.stringRegex(query['name']), 'i')};
            if(query['skills']) _query['skills'] = {$in: [new mongodb.ObjectId(query['skills'])]};
            if(query['idChannel'] && !_.isEqual(query['idChannel'], '0')) _query['idChannel'] = query['idChannel'];
            if(query['routeChat']) _query['routeChat'] = query['routeChat'];
            if(query['idSkill'] && !_.isEqual(query['idSkill'], '0')) _query['idSkill'] = query['idSkill'];
            if(query['status']) _query['status'] = query['status'];
            _ServicesChat
                .find(_query)
                .populate('idSkill','skillName')
                .populate('createBy','name')
                .populate('updateBy','name')
                .populate({
                    path: 'idChannel',
                    model: _CompanyChannel,
                    populate: {
                        path: 'idCompany',
                        model: _Company
                    }
                })
                .sort(sort)
                .paginate(page, rows, function (error, items, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/services-chat', current: page, rowsPerPage: rows, totalResult: total});
                    _.render(req, res, 'services-chat',
                        {
                            title: 'Danh sách chiến dịch chat',
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

// GET : http://domain.com/services-chat/:_id/edit
exports.edit = function (req, res) {
    _async.parallel({
        service: function(next){
            // Truy vấn dữ liệu chiến dịch
            _ServicesChat.findById(req.params.serviceschat, next).populate('idSkill','skillName')
                .populate('createBy','name')
                .populate('updateBy','name')
                .populate('idChannel','name idCompany')
                .populate({
                    path: 'idChannel',
                    model: _CompanyChannel,
                    populate: {
                        path: 'idCompany',
                        model: _Company
                    }
                });
        }
    }, function(err, result){
        if(result.service){
            _.render(req, res, 'services-chat-edit', {
                title: 'Chỉnh sửa chiến dịch chat',
                currentService: result.service,
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

    _ServicesChat.create(req.body, function(err, result){
        if(!err)_.genTree(); // Cập nhật lại CORE
        res.json({code: (err ? 500 : 200), message: err? 'Có lỗi xảy ra' : ''});
    });
};

// PUT : http://domain.com/services-chat/:_id
exports.update = function (req, res) {
    req.body['updateBy'] = req.session.user._id;
    req.body['updated'] = Date.now();

    _ServicesChat.findByIdAndUpdate(req.params.serviceschat, req.body, {new: true}, function (error, sv) {
        if(!error){
            _.genTree(); // Cập nhật lại CORE
            //if (_.has(req.body, 'routeChat')){
            //    crmPublish.publishData('ResEditRouteChat', req.body);
            //}
        }
        res.json({code: (error ? 500 : 200), message: error ? error : sv});
    });
};

// GET : http://domain.com/customer/new
exports.new = function (req, res) {
    _async.parallel({
        companies: function(next) {
            _Company.find({status: 1}, next);
        },
        skills: function(next) {
            _SkillsChat.find({status: 1}, next);
        }
    }, function(err, result){
        _.render(req, res, 'services-chat-new', {
            title: 'Tạo mới chiến dịch chat',
            skills: result.skills,
            orgs: result.companies,
            plugins: [['bootstrap-select']]
        }, true);
    });
};

// Validation engine
exports.validate = function (req, res) {
    if(req.query.updateId){
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId']);
        var _query = {$and: [_query1, _query2]};
        _ServicesChat.findOne(_query).exec(function (error, sv) {
            res.json([req.query.fieldId, _.isNull(sv)]);
        });
    }else {
        if(req.query.idChannel != ''){
            var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
            _ServicesChat.findOne(_query).exec(function (error, sv) {
                res.json([req.query.fieldId, _.isNull(sv)]);
            });
        }
        else {
            res.json([req.query.fieldId, true]);
        }
    }
};

// DELETE http://domain.com/customer/:_id
exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.serviceschat, 'all')) {
        _ServicesChat.findByIdAndRemove(req.params.serviceschat, function (error, sv) {
            if(!error)_.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ''});
        });
    }else{
        _ServicesChat._deleteAll({$in:req.body.ids.split(',')}, function (error) {
            if(!error)_.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ""});
        });
    }
};

// Seach
exports.search = {
    json : function(req, res){
        var name = req.query.name;

        _ServicesChat
            .find({name: new RegExp('^'+name+'$')}, function(error, result){
                res.json({code: (error ? 500 : 200), message: error ? error : result});
            });
    },
    html : function(req, res){
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var _sort = {};
        if(req.query['sortField'])
            _sort[req.query['sortField']] = _.isEqual(req.query['sortValue'], 'asc') ? 1 : -1;

        var _query = {};
        var searchData = {};

        var addSearch = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = req.query[fieldName];
            searchData[fieldName] = req.query[fieldName];
        }

        var addSearchText = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = {$regex: new RegExp(_.stringRegex(req.query[fieldName]), 'i')};
            searchData[fieldName] = req.query[fieldName];
        }

        addSearchText('name');
        addSearch('idChannel');
        addSearch('routeCall');
        if (!_.isEqual(req.query.idSkill, '0')) addSearch('idSkill');
        addSearch('status');
        _async.parallel({
            companies: function(next) {
                _Company.find({status: 1}, next);
            },
            skills: function(next) {
                _SkillsChat.find({status: 1}, next);
            }
        }, function(err, result){
            _ServicesChat
                .find(_query)
                .populate('idSkill','skillName')
                .populate('createBy','name')
                .populate('updateBy','name')
                .populate('idChannel','name idCompany')
                .populate({
                    path: 'idChannel',
                    model: _CompanyChannel,
                    populate: {
                        path: 'idCompany',
                        model: _Company
                    }
                })
                .sort(_sort)
                .paginate(page, rows, function (error, items, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/services', current: page, rowsPerPage: rows, totalResult: total});
                    searchData.dataLength = items.length;
                    _.render(req, res, 'services',
                        {
                            title: 'Danh sách chiến dịch chat',
                            searchData: searchData,
                            sortData: _sort,
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