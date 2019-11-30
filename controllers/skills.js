/**
 * Created by sonth on 13/01/2016.
 */
// GET
exports.index = {
    json: function (req, res) {
        var _query = req.query;
        //_query = param nhận được theo query string
        _Skills.find(_query, function (error, users) {
            res.json(users);
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var _sort = {};
        var addSortText = function(fieldName){
            if(_.has(req.query, fieldName)) _sort[fieldName] = (_.isEqual(req.query[fieldName], 'asc')) ? 1 : -1;
        }
        addSortText('skillName');
        addSortText('alarmDurHigh');
        addSortText('alarmDurLow');

        _async.parallel({
            companies: function(next) {
                _Company.find({}, next);
            }
        }, function(err, result){
            var _query = req.session.auth.company ? (req.session.auth.company.group ? {skillName: 'Ko co quyen xem'} : {idCompany: req.session.auth.company._id}) : {};
            _Skills
                .find(_query)
                .populate('idCompany')
                .sort(_sort)
                .paginate(page, rows, function (error, skill, total) {
                    var paginator = new pagination.SearchPaginator({prelink: '/skills', current: page, rowsPerPage: rows, totalResult: total});
                    _.render(req, res, 'skills', {
                        title: 'Danh sách kỹ năng',
                        skillLists: skill,
                        companies: result.companies,
                        paging: paginator.getPaginationData(),
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']] ,
                        sort: {skillName: req.query.skillName, alarmDurHigh: req.query.alarmDurHigh, alarmDurLow: req.query.alarmDurLow}
                    }, true, error);
                });
        });
    }
};

exports.new = function (req, res) {
    var _query = {};
    _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {status: 1, _id: req.session.auth.company._id}) : {status: 1};

    _async.parallel({
        companies: function(next) {
            _Company.find(_query, next);
        }
    }, function(err, result){
        //binding dữ liệu xuống view thông qua
        //nếu ko tìm thấy sẽ trả về trang 404 thông qua  !_.isNull(user)
        _.render(req, res, 'skills-new', {title: 'Tạo mới kỹ năng', companies: result.companies, plugins: [['bootstrap-select']]}, !_.isNull(result.currSkill), err);
    });
};

exports.create = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    if (_.has(req.body, 'recordingState') && _.isEqual(req.body['recordingState'], 'on')) req.body['recordingState'] = 1;
    req.body['status'] = _.has(req.body,'status') ? req.body['status'] : 0;
    req.body['recordingState'] = _.has(req.body,'recordingState') ? req.body['recordingState'] : 0;
    req.body['skillName'] = _.chain(req.body.skillName).trimValueNotLower().value();
    _Skills.create(req.body, function (error, sk) {
        _.genTree();
        res.json({code: (error ? 500 : 200), message: error ? error : sk});
    });
//    _Skills.findOne({skillName: req.body['skillName']}).exec(function (error, gp) {
//        if(gp){
//            res.json({code: 500, message: "Đã tồn tại"});
//        }else {
//            res.json({code: (error ? 500 : 200), message: error ? error : "Tạo mới thành công"});
//        }
//    });
};

// GET : http://domain.com/users/:_id/edit
exports.edit = function (req, res) {
    //trỏ đến file user-edit.ejs trong thư mục /views/layout/

    var _query = {};
    _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {status: 1, _id: req.session.auth.company._id}) : {status: 1};

    _async.parallel({
        companies: function(next) {
            _Company.find(_query, next);
        },
        currSkill : function(next){
            _Skills.findById(req.params.skill, next);
        }
    }, function(err, result){
        //binding dữ liệu xuống view thông qua
        //nếu ko tìm thấy sẽ trả về trang 404 thông qua  !_.isNull(user)
        _.render(req, res, 'skills-edit', {title: 'Chỉnh sửa kỹ năng',plugins: [['bootstrap-select']], currentSkill: result.currSkill, companies: result.companies}, !_.isNull(result.currSkill), err);
    });
};
// PUT : http://domain.com/skills/:_id
exports.update = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    if (_.has(req.body, 'recordingState') && _.isEqual(req.body['recordingState'], 'on')) req.body['recordingState'] = 1;
    req.body['status'] = _.has(req.body,'status') ? req.body['status'] : 0;
    req.body['recordingState'] = _.has(req.body,'recordingState') ? req.body['recordingState'] : 0;
    _Skills.findByIdAndUpdate(req.params['skill'], _.chain(req.body).cleanRequest(['_', 'fieldId', 'fieldValue']).mapObject(_.trimValueNotLower).value(), {new: true}, function (error, ca) {
        _.genTree();
        res.json({code: (error ? 500 : 200), message: error ? error : ca});
    });
};

exports.validate = function (req, res) {
    if(req.query.updateId){
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId']);
        var _query = {$and: [_query1, _query2]};

        _Skills.findOne(_query).exec(function (error, skill) {
            res.json([req.query.fieldId, _.isNull(skill)]);
        });
    }else {
        if(req.query.idCompany != ''){
            var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
            _Skills.findOne(_query).exec(function (error, skill) {
                res.json([req.query.fieldId, _.isNull(skill)]);
            });
        }
        else {
            res.json([req.query.fieldId, true]);
        }
    }
};

exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.skill, 'all')){
//        _Skills.findByIdAndRemove(req.params['skill'], function (error, ca) {
//            res.json({code: (error ? 500 : 200), message: error ? error : ''});
//        });
        _Skills._deleteAll({$in:req.params['skill']}, function (error, skills) {
            _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error :"", skills: skills});
        });
    }
    else{
//        _Skills.remove({_id: {$in:req.body.ids.split(',')}}, function (error, ca) {
//            res.json({code: (error ? 500 : 200), message: error ? error : ''});
//        });
        _Skills._deleteAll(req.body.ids.split(','), function (error, skills) {
            _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : "", skills: skills});
        });
    }
};

exports.search = {
    json : function(req, res){
        var skillName = req.query.skillName;
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = {skillName: {$regex: new RegExp(_.stringRegex(req.query.skillName), 'i')}};

        if (_.has(req.query, 'alarmDurHigh') && !_.isEqual(req.query.alarmDurHigh, 'desc') && !_.isEqual(req.query.alarmDurHigh, 'asc')){
            query.alarmDurHigh = Number(req.query.alarmDurHigh);
        }
        if (_.has(req.query, 'alarmDurLow') && !_.isEqual(req.query.alarmDurLow, 'desc') && !_.isEqual(req.query.alarmDurLow, 'asc')){
            query.alarmDurLow = Number(req.query.alarmDurLow);
        }
        if (_.has(req.query, 'status')){
            query.status = Number(req.query.status);//{$regex: new RegExp(_.stringRegex(req.query.status), 'i')};
        }
        if (_.has(req.query, 'recordingState')){
            query.recordingState = Number(req.query.recordingState);//{$regex: new RegExp(_.stringRegex(req.query.status), 'i')};
        }
        _Skills
            .find(query, function (error, result){
                res.json({code: (error ? 500 : 200), message: error ? error : result});
            });
    },
    html : function(req, res){
        var skillName = req.query.skillName;
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = {};
        if (_.has(req.query, 'skillName') && !_.isEqual(req.query.skillName, 'desc') && !_.isEqual(req.query.skillName, 'asc')){
            query.skillName = {$regex: new RegExp(_.stringRegex(req.query['skillName']), 'i')};
        }

        if (_.has(req.query, 'idCompany') && !_.isEqual(req.query.idCompany, 'desc') && !_.isEqual(req.query.idCompany, 'asc')){
            query.idCompany = req.query['idCompany'];
        }

        if (_.has(req.query, 'alarmDurHigh') && !_.isEqual(req.query.alarmDurHigh, 'desc') && !_.isEqual(req.query.alarmDurHigh, 'asc')){
            query.alarmDurHigh = Number(req.query.alarmDurHigh);
        }
        if (_.has(req.query, 'alarmDurLow') && !_.isEqual(req.query.alarmDurLow, 'desc') && !_.isEqual(req.query.alarmDurLow, 'asc')){
            query.alarmDurLow = Number(req.query.alarmDurLow);
        }
        if (_.has(req.query, 'status')){
            query.status = Number(req.query.status);//{$regex: new RegExp(_.stringRegex(req.query.status), 'i')};
        }
        if (_.has(req.query, 'recordingState')){
            query.recordingState = Number(req.query.recordingState);
        }


        _async.parallel({
            companies: function(next) {
                _Company.find({}, next);
            }
        }, function(err, data){
            var _query2 = req.session.auth.company ? (req.session.auth.company.group ? {skillName: 'Ko co quyen xem'} : {idCompany: req.session.auth.company._id}) : {};

            _Skills
                .find({$and: [query, _query2]})
                .populate('idCompany')
                .sort(_.cleanSort(req.query))
                .paginate(page, rows, function (error, result, pageCount) {
                    var paginator = new pagination.SearchPaginator({prelink: '/skills', current: page, rowsPerPage: rows, totalResult: pageCount});
                    _.render(req, res, 'skills', {
                        title: 'Danh sách kỹ năng',
                        skillLists: result,
                        companies: data.companies,
                        paging: paginator.getPaginationData(),
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']],
                        sort: {skillName: req.query.skillName, alarmDurHigh: req.query.alarmDurHigh, alarmDurLow: req.query.alarmDurLow}
                    }, true, error);
                });
        });
    }
}