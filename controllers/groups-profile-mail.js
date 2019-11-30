exports.index = {
    json: function (req, res) {
        _GroupsProfileMail.find(_.cleanRequest(req.body)).exec(function (error, profile) {
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
        if(query['status']) _query['status'] = query['status'];

        _async.waterfall([
            function (next) {
                _SkillsMail.find({status: 1}, next);
            }
        ],function(err, skills){
            _GroupsProfileMail
                .find(_query)
                .populate('skills.idSkill','skillName')
                .populate('idCompany','name')
                .populate('createBy','name')
                .populate('updateBy','name')
                .sort(sort)
                .paginate(page, rows, function (error, gps, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/groups-profile-mail', current: page, rowsPerPage: rows, totalResult: total});
                    _.render(req, res, 'groups-profile-mail',
                        {
                            title: 'Danh sách nhóm kỹ năng mail',
                            searchData: query,
                            categories: gps,
                            plugins: [['bootstrap-select']],
                            skills: skills,
                            paging: paginator.getPaginationData()
                        }, true, error);
                });
        });
    }
}

// GET : http://domain.com/groups-profile-mail/:_id/edit
exports.edit = function (req, res) {
    _async.waterfall([
        // Lấy dữ liệu kỹ năng mail
        function (next) {
            _ServicesMail.distinct( "idSkill", next);
        },
        function (idSkills ,next) {
            _SkillsMail.find({status: 1, _id: {$in: idSkills}}, next);
        }
    ],function(err, skills){
        _GroupsProfileMail.findById(req.params.groupsprofilemail, function (error, profile) {
            if(profile){
                _.render(req, res, 'groups-profile-mail-edit', {plugins: ['jquery-ui', ['bootstrap-duallistbox']], title: 'Chỉnh sửa nhóm kỹ năng', currentProfile: profile, skills: skills}, !_.isNull(profile), error);
            }else{
                res.json({code: 404, message: 'Page not found'});
            }
        });
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
            _GroupsProfileMail.count({name: body.name}, next); // check trùng
        },
        function(count,next){
            (count == 0) ? _GroupsProfileMail.create(body, next) : next(count, null);
        }
    ],function(err, result){
        if(!err) _.genTree(); // cập nhật tới CORE
        res.json({code: (err ? 500 : 200), message: err? 'Có lỗi xảy ra' : ''});
    });
};

// PUT : http://domain.com/groups-profile-mail/:_id
exports.update = function (req, res) {
    var body = JSON.parse(req.body['data']);

    body['skills'] = _.has(body,'skills') ? body['skills'] : [];
    body['updateBy'] = req.session.user._id;
    body['updated'] = Date.now();

    _GroupsProfileMail.findByIdAndUpdate(req.params.groupsprofilemail, body, {new: true}, function (error, gp) {
        if(!error) _.genTree();
        res.json({code: (error ? 500 : 200), message: error ? error : gp});
    });
};

// GET : http://domain.com/groups-profile-mail/new
exports.new = function (req, res) {
    _async.waterfall([
        function (next) {
            _ServicesMail.distinct( "idSkill", next);
        },
        function (idSkills ,next) {
            _SkillsMail.find({status: 1, _id: {$in: idSkills}}, next);
        }
    ],function(err, skills){
        _.render(req, res, 'groups-profile-mail-new', {plugins: ['jquery-ui', ['bootstrap-select'], ['bootstrap-duallistbox'], ['mrblack-table']], title: 'Tạo mới nhóm kỹ năng', skills:skills}, true);
    });
};

// Validation engine
exports.validate = function (req, res) {
    if(req.query.updateId){
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId']);
        var _query = {$and: [_query1, _query2]};
        _GroupsProfileMail.findOne(_query).exec(function (error, gp) {
            res.json([req.query.fieldId, _.isNull(gp)]);
        });
    }else {
        var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
        _GroupsProfileMail.findOne(_query).exec(function (error, gp) {
            res.json([req.query.fieldId, _.isNull(gp)]);
        });
    }
};

// DELETE http://domain.com/groups-profile-mail/:_id
exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.groupsprofilemail, 'all')) {
        _GroupsProfileMail._deleteAll({$in:[req.params.groupsprofilemail]}, function (result) {
            if(result.length == 0){
                _.genTree();
                res.json({code: 200, message: ""});
            }else {
                res.json({code: 500 , message: result});
            }
        });
    }else{
        _GroupsProfileMail._deleteAll({$in:req.body.ids.split(',')}, function (result) {
            if(result.length == 0){
                _.genTree();
                res.json({code: 200, message: ""});
            }else {
                res.json({code: 500 , message: result});
            }
        });
    }
};