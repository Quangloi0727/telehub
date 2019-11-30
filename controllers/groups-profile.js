
var syncAcd = require(path.join(_rootPath, 'monitor', 'sync-acd.js'));

exports.index = {
    json: function (req, res) {
        _GroupsProfile.find(_.cleanRequest(req.body)).exec(function (error, profile) {
            res.status(200).json(profile);
        });
    },
    html: function (req, res) {

        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var sort = _.cleanSort(req.query,'');
        var query = _.cleanRequest(req.query);

        var _query = {};
        if(query['name']) _query['name'] = {$regex: new RegExp(_.stringRegex(query['name']), 'i')};
        if(query['recordingState']) _query['recordingState'] = query['recordingState'];
        if(query['idCompany']) _query['idCompany'] = query['idCompany'];
        if(query['status']) _query['status'] = query['status'];

        _async.parallel({
            companies: function(next) {
                // Lấy dữ liệu công ty
                var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: req.session.auth.company._id}) : {};
                _Company.find(_query, next);
            },
            skills: function (next) {
                // Lấy dữ liệu kỹ năng call
                var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {idCompany: req.session.auth.company._id}) : {};
                _Skills.find(_query, next);
            }
        },function(err, result){
            var _query2 = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {idCompany: req.session.auth.company._id}) : {};

            _GroupsProfile
                .find({$and: [_query, _query2]})
                .populate('skills.idSkill','skillName')
                .populate('createBy','name')
                .populate('idCompany','name')
                .populate('updateBy','name')
                .sort(sort)
                .paginate(page, rows, function (error, gps, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/groups-profile', current: page, rowsPerPage: rows, totalResult: total});
                    _.render(req, res, 'groups-profile',
                        {
                            title: 'Danh sách Profile',
                            searchData: query,
                            categories: gps,
                            plugins: [['bootstrap-select']],
                            skills: result.skills,
                            companies: result.companies,
                            paging: paginator.getPaginationData()
                        }, true, error);
                });
        });
    }
}

// GET : http://domain.com/groups-profile/new
exports.new = function (req, res) {
    _async.parallel({
        companies: function(next) {
            // Lấy dữ liệu công ty và kỹ năng phục vụ chiến dịch của công ty đó
            _async.waterfall([
                function (next2) {
                    _Services.distinct( "idSkill", {status: 1}, next2);
                },
                function (idSkills ,next2) {
                    var aggregate = [];
                    var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: new mongodb.ObjectId(req.session.auth.company._id)}) : {};
                    aggregate.push({$match: {$and:[_query, {status: 1}]}});
                    aggregate.push({$lookup: {from: 'skills', localField: '_id', foreignField: 'idCompany', as: 'skills'}});

                    _Company.aggregate(aggregate, function(err, companies){
                        next(err,_.chain(companies)
                            .map(function(com){
                                com.skills = _.chain(com.skills)
                                    .filter(function(skill){
                                        return skill.status == 1 && JSON.stringify(idSkills).indexOf(skill._id.toString()) >= 0;
                                    })
                                    .value();
                                return com;
                            })
                            .value()
                        );
                    });
                }
            ]);
        }
    }, function(err, result){
        _.render(req, res, 'groups-profile-new', {
            plugins: ['jquery-ui', ['bootstrap-select'], ['bootstrap-duallistbox']],
            title: 'Tạo mới nhóm kỹ năng',
            companies: result.companies
        }, true);
    });
};

// GET : http://domain.com/groups-profile/:_id/edit
exports.edit = function (req, res) {
    _async.parallel({
        companies: function(next) {
            // Lấy dữ liệu công ty và kỹ năng phục vụ chiến dịch của công ty đó
            _async.waterfall([
                function (next2) {
                    _Services.distinct( "idSkill", {status: 1}, next2);
                },
                function (idSkills ,next2) {
                    var aggregate = [];
                    var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: new mongodb.ObjectId(req.session.auth.company._id)}) : {};
                    aggregate.push({$match: {$and:[_query, {status: 1}]}});
                    aggregate.push({$lookup: {from: 'skills', localField: '_id', foreignField: 'idCompany', as: 'skills'}});

                    _Company.aggregate(aggregate, function(err, companies){
                        next(err,_.chain(companies)
                            .map(function(com){
                                com.skills = _.chain(com.skills)
                                    .filter(function(skill){
                                        return skill.status == 1 && JSON.stringify(idSkills).indexOf(skill._id.toString()) >= 0;
                                    })
                                    .value();
                                return com;
                            })
                            .value()
                        );
                    });
                }
            ]);
        },
        profile: function(next){
            // Lấy dữ liệu nhóm kỹ năng call
            _GroupsProfile.findById(req.params.groupsprofile,next);
        }
    }, function(err, result){
        _.render(req, res, 'groups-profile-edit', {
            plugins: ['jquery-ui', ['bootstrap-duallistbox'],['bootstrap-select']],
            title: 'Chỉnh sửa nhóm kỹ năng',
            currentProfile: result.profile,
            companies: result.companies
        }, !_.isNull(result.profile), err);
    });
};

// POST
exports.create = function (req, res) {
    var body = JSON.parse(req.body['data']);

    body['skills'] = _.has(body,'skills') ? body['skills'] : [];
    body['createBy'] = req.session.user._id;
    body['created'] = new Date();

    _async.waterfall([
        function(next){
            _GroupsProfile.count({name: body.name}, next); // Check trùng
        },
        function(count,next){
            (count == 0) ? _GroupsProfile.create(body, next) : next(count, null);
        }
    ],function(err, result){
        if(!err) _.genTree(); // Cập nhật dữ liệu tới CORE
        res.json({code: (err ? 500 : 200), message: err? 'Có lỗi xảy ra' : ''});
    });
};

// PUT : http://domain.com/groups-profile/:_id
exports.update = function (req, res) {
    var body = JSON.parse(req.body['data']);

    body['skills'] = _.has(body,'skills') ? body['skills'] : [];
    body['updateBy'] = req.session.user._id;
    body['updated'] = Date.now();

    _GroupsProfile.findByIdAndUpdate(req.params.groupsprofile, body, {new: true}, function (error, gp) {
        if(!error) {
            _.genTree();
            syncAcd.syncGroupProfile(req.params.groupsprofile); // Cập nhật lại dữ liệu tới ACD
        }

        res.json({code: (error ? 500 : 200), message: error ? error : gp});
    });
};

// Validation engine
exports.validate = function (req, res) {
    if(req.query.updateId){
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId']);
        var _query = {$and: [_query1, _query2]};
        _GroupsProfile.findOne(_query).exec(function (error, gp) {
            res.json([req.query.fieldId, _.isNull(gp)]);
        });
    }else {
        var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
        _GroupsProfile.findOne(_query).exec(function (error, gp) {
            res.json([req.query.fieldId, _.isNull(gp)]);
        });
    }
};

// DELETE http://domain.com/groups-profile/:_id
exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.groupsprofile, 'all')) {
        _GroupsProfile._deleteAll({$in:[req.params.groupsprofile]}, function (result) {
            if(result.length == 0){
                _.genTree();
                res.json({code: 200, message: ""});
            }else {
                res.json({code: 500 , message: result});
            }
        });
    }else{
        _GroupsProfile._deleteAll({$in:req.body.ids.split(',')}, function (result) {
            if(result.length == 0){
                _.genTree();
                res.json({code: 200, message: ""});
            }else {
                res.json({code: 500 , message: result});
            }
        });
    }
};