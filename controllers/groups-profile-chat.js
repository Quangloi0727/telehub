//_ServiceAddress.count(function(err, count){
//    if(count <= 0){
//        _ServiceAddress.create({name: '1111'});
//        _ServiceAddress.create({name: '2222'});
//        _ServiceAddress.create({name: '3333'});
//        _ServiceAddress.create({name: '4444'});
//        _ServiceAddress.create({name: '5555'});
//    }
//});

//var voiceCtrl = require(path.join(_rootPath, 'queue', 'common', 'voice-controller.js'));
//_Users.find({name: 'quanly1'}).exec(function(err, user){
//    voiceCtrl.createLoginRequest(user[0], function(mess){
//        console.log(mess);
//    });
//});

exports.index = {
    json: function (req, res) {
        if (_.has(req.query, 'idCompany')){
            _async.waterfall([
                function (next) {
                    _ServicesChat.distinct( "idSkill", next);
                },
                function (idSkills ,next) {
                    _SkillsChat.find({status: 1, _id: {$in: idSkills}, idCompany: req.query.idCompany}, next);
                }
            ],function(err, skills){
                if (!err) res.json(skills);
                else{
                    res.json([]);
                }
            });
        }
        else{
            _GroupsProfileChat.find(_.cleanRequest(req.body)).exec(function (error, profile) {
                res.status(200).json(profile);
            });
        }

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
                _SkillsChat.find({status: 1}, next);
            }
        ],function(err, skills){
            _GroupsProfileChat
                .find(_query)
                .populate('skills.idSkill','skillName')
                .populate('idCompany','name')
                .populate('createBy','name')
                .populate('updateBy','name')
                .sort(sort)
                .paginate(page, rows, function (error, gps, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/groups-profile-chat', current: page, rowsPerPage: rows, totalResult: total});
                    _.render(req, res, 'groups-profile-chat',
                        {
                            title: 'Danh sách nhóm kỹ năng chat',
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

// GET : http://domain.com/groups-profile-chat/:_id/edit
exports.edit = function (req, res) {
    _GroupsProfileChat.findById(req.params.groupsprofilechat, function (error, profile) {
        if(profile){
            // Lấy danh sách kỹ năng phục vụ chat
            _async.waterfall([
                function (next) {
                    _ServicesChat.distinct( "idSkill", next);
                },
                function (idSkills ,next) {
                    _SkillsChat.find({status: 1, _id: {$in: idSkills}, idCompany: profile.idCompany}, next);
                }
            ],function(err, skills){
                _.render(req, res, 'groups-profile-chat-edit', {plugins: ['jquery-ui', ['bootstrap-duallistbox']], title: 'Chỉnh sửa nhóm kỹ năng', currentProfile: profile, skills: skills}, !_.isNull(profile), error);
            });
        }else{
            res.json({code: 404, message: 'Page not found'});
        }
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
            _GroupsProfileChat.count({name: body.name}, next); // Check trùng
        },
        function(count,next){
            (count == 0) ? _GroupsProfileChat.create(body, next) : next(count, null);
        }
    ],function(err, result){
        if(!err) _.genTree(); // Cập nhật tới CORE
        res.json({code: (err ? 500 : 200), message: err? 'Có lỗi xảy ra' : ''});
    });
};

// PUT : http://domain.com/groups-profile-chat/:_id
exports.update = function (req, res) {
    var body = JSON.parse(req.body['data']);

    body['skills'] = _.has(body,'skills') ? body['skills'] : [];
    body['updateBy'] = req.session.user._id;
    body['updated'] = Date.now();

    _GroupsProfileChat.findByIdAndUpdate(req.params.groupsprofilechat, body, {new: true}, function (error, gp) {
        if(!error) _.genTree();
        res.json({code: (error ? 500 : 200), message: error ? error : gp});
    });
};

// GET : http://domain.com/groups-profile-chat/new
exports.new = function (req, res) {
    // Lấy dữ liệu kỹ năng phục vụ chat
    _async.waterfall([
        function (next) {
            _ServicesChat.distinct( "idSkill", next);
        },
        function (idSkills ,next) {
            _SkillsChat.find({status: 1, _id: {$in: idSkills}}, next);
        }
    ],function(err, skills){
        _.render(req, res, 'groups-profile-chat-new', {plugins: ['jquery-ui', ['bootstrap-select'], ['bootstrap-duallistbox'], ['mrblack-table']], title: 'Tạo mới nhóm kỹ năng', skills:skills}, true);
    });
};

// Validation engine
exports.validate = function (req, res) {
    if(req.query.updateId){
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId']);
        var _query = {$and: [_query1, _query2]};
        _GroupsProfileChat.findOne(_query).exec(function (error, gp) {
            res.json([req.query.fieldId, _.isNull(gp)]);
        });
    }else {
        var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
        _GroupsProfileChat.findOne(_query).exec(function (error, gp) {
            res.json([req.query.fieldId, _.isNull(gp)]);
        });
    }
};

// DELETE http://domain.com/groups-profile-chat/:_id
exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.groupsprofilechat, 'all')) {
        _GroupsProfileChat._deleteAll({$in:[req.params.groupsprofilechat]}, function (result) {
            if(result.length == 0){
                _.genTree();
                res.json({code: 200, message: ""});
            }else {
                res.json({code: 500 , message: result});
            }
        });
    }else{
        _GroupsProfileChat._deleteAll({$in:req.body.ids.split(',')}, function (result) {
            if(result.length == 0){
                _.genTree();
                res.json({code: 200, message: ""});
            }else {
                res.json({code: 500 , message: result});
            }
        });
    }
};