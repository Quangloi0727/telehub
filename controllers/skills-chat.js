/**
 * Created by sonth on 13/01/2016.
 */
// GET
exports.index = {
    json: function (req, res) {
        var _query = req.query;
        if (_.has(req.query), 'idCompany') _query['idCompany'] = new mongodb.ObjectId(req.query['idCompany']);
        if (_.has(req.query), 'status') _query['status'] = req.query['status'];
        //_query = param nhận được theo query string
        _SkillsChat.find(_query, function (error, skills) {
            res.json(skills);
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = req.query;

        var aggregate = _SkillsChat.aggregate();
        aggregate._pipeline = [{$lookup: {from: 'companies', localField: 'idCompany', foreignField: '_id', as: 'company'}}, {$unwind: '$company'}];

        var _query = _.chain([{name: 'company', type: 1}, {name: 'status', type: 2}, {name: 'skillName', type: 1}])
            .map(function (o) {
                if (_.isEqual(o.name, 'company')){
                    return _.has(query, o.name) ? _.object(['company.name'], [_.switchAgg(o.type, query[o.name])]) : null;
                }
                else{
                    return _.has(query, o.name) ? _.object([o.name], [_.switchAgg(o.type, query[o.name])]) : null;
                }
            })
            .compact()
            .reduce(function (memo, item) {
                memo[_.keys(item)] = _.values(item)[0];
                return memo;
            }, {})
            .value();
        if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});

        _SkillsChat.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, skills, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink: '/skills-chat', current: page, rowsPerPage: rows, totalResult: count});
            _.render(req, res, 'skills-chat', {title: 'Danh sách kỹ năng chat', skillLists: skills, paging: paginator.getPaginationData(), sort: {name: req.query.name}, plugins: [['bootstrap-select']]}, true, error);
        });

//        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
//        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
//        var _sort = {};
//        var addSortText = function(fieldName){
//            if(_.has(req.query, fieldName)) _sort[fieldName] = (_.isEqual(req.query[fieldName], 'asc')) ? 1 : -1;
//        }
//        addSortText('skillName');
//        _SkillsChat
//            .find()
//            .sort(_sort)
//            .paginate(page, rows, function (error, skill, total) {
//                var paginator = new pagination.SearchPaginator({prelink: '/skills-chat', current: page, rowsPerPage: rows, totalResult: total});
//                _.render(req, res, 'skills-chat', {title: 'Danh sách kỹ năng chat', skillLists: skill, paging: paginator.getPaginationData(), plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']] ,  sort: {skillName: req.query.skillName}}, true, error);
//            });
    }
};

exports.new = function (req, res) {
    _Company.find().exec(function(err, resp){
        _.render(req, res, 'skills-chat-new', {title: 'Tạo mới kỹ năng chat', companies: resp, plugins: [['bootstrap-select'], ['mrblack-table']]}, true);
    });
    
};

exports.create = function (req, res) {
//    _.pushNotification(3, 'xxx.com', req.session.user._id);
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    req.body['status'] = _.has(req.body,'status') ? req.body['status'] : 0;
    req.body['skillName'] = _.chain(req.body.skillName).trimValueNotLower().value();
    req.body.idCompany = new mongodb.ObjectId(req.body.company);
    delete  req.body.company;
    _SkillsChat.create(req.body, function (error, sk) {
        _.genTree();
        res.json({code: (error ? 500 : 200), message: error ? error : sk});
    });
};

// GET : http://domain.com/users/:_id/edit
exports.edit = function (req, res) {
    _async.parallel({
        one: function (cb) {
            _Company.find().exec(function(err, resp){
                cb(null, resp);
            });
        },
        two: function(cb){
            _SkillsChat.findById(req.params.skillschat, function (error, skill) {
                cb(null, skill);
            });
        }
    }, function(err, resp){
        _.render(req, res, 'skills-chat-edit', {title: 'Chỉnh sửa kỹ năng', currentSkill: resp.two, companies: resp.one, plugins: [['bootstrap-select'], ['mrblack-table']]}, true);
    });
};
// PUT : http://domain.com/skills/:_id
exports.update = function (req, res) {
    console.log(98, req.body);
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    req.body['status'] = _.has(req.body,'status') ? req.body['status'] : 0;
    req.body['name'] = _.chain(req.body.skillName).trimValueNotLower().value();
    _SkillsChat.findByIdAndUpdate(req.params['skillschat'], req.body, {new: true}, function (error, ca) {
        _.genTree();
        res.json({code: (error ? 500 : 200), message: error ? error : ca});
    });
};

exports.validate = function (req, res) {
    req.query.idCompany = new mongodb.ObjectId(req.query.company);
    if (_.has(req.query, 'name')){
        req.query['name'] = _.chain(req.query.name).trimValueNotLower().value();
        if (!_.has(req.query, 'currName') || !_.isEqual(req.query.name, req.query.currName)){
            _SkillsChat.findOne({idCompany: req.query.idCompany, skillName: req.query.name}).exec(function (error, ca) {
                res.json({code: _.isNull(ca)});
            });
        }
        else{
            res.json({code: true});
        }
    }
    else{
        res.json({code: false});
    }

//    var _queryExtra = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
//    if (_.has(req.query, 'skillName')){
//        var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue', 'currSkillName']).toLower().value();
//        if (!_.isEqual(_queryExtra.skillName, _queryExtra.currSkillName)){
//            _SkillsChat.findOne(_query).exec(function (error, ca) {
//                res.json([req.query.fieldId, _.isNull(ca)]);
//            });
//        }
//        else{
//            res.json([req.query.fieldId, true]);
//        }
//    }
//    else{
//        res.json([req.query.fieldId, false]);
//    }
};

exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.skillschat, 'all')){
        _SkillsChat._deleteAll({$in:req.params['skillschat']}, function (error) {
            _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error :""});
        });
    }
    else{
        _SkillsChat._deleteAll({$in:req.body.ids.split(',')}, function (error, ca) {
            _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ''});
        });
    }
};
