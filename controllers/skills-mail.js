/**
 * Created by sonth on 13/01/2016.
 */
// GET
exports.index = {
    json: function (req, res) {
        var _query = req.query;
        if (_.has(req.query, 'idCompany') && !_.isEmpty(req.query['idCompany'])) _query['idCompany'] = new mongodb.ObjectId(req.query['idCompany']);
        if(_.has(_query, 'type')){
            if(_.isEqual(_query.type, 'groupsprofile')){
                _ServicesMail.aggregate([
                    {$match: {idCompany: _query.idCompany}},
                    {$group: {_id:"$idSkill"}},
                    {$lookup: {
                        from: 'skillmails',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'skillmail'}},
                    {$unwind: '$skillmail'}
                ]).exec(function(err, skills){
                    res.json(skills);
                })
            }
        }else{
            if (_.has(req.query, 'status')) {
                if(!_.isUndefined(req.query)){
                    _query['status'] = req.query['status'];
                }

            }
            //_query = param nhận được theo query string
            _SkillsMail.find(_query, function (error, skills) {
                res.json(skills);
            });
        }


    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = req.query;

        var aggregate = _SkillsMail.aggregate();
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

        _SkillsMail.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, skills, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink: '/skills-mail', current: page, rowsPerPage: rows, totalResult: count});
            _.render(req, res, 'skills-mail', {title: 'Danh sách kỹ năng mail', skillLists: skills, paging: paginator.getPaginationData(), sort: {name: req.query.name}, plugins: [['bootstrap-select']]}, true, error);
        });
    }
};

exports.new = function (req, res) {
    _Company.find().exec(function(err, resp){
        _.render(req, res, 'skills-mail-new', {title: 'Tạo mới kỹ năng mail', companies: resp, plugins: [['bootstrap-select'], ['mrblack-table']]}, true);
    });

};

exports.create = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    req.body['status'] = _.has(req.body,'status') ? req.body['status'] : 0;
    req.body['skillName'] = _.chain(req.body.skillName).trimValueNotLower().value();
    req.body.idCompany = new mongodb.ObjectId(req.body.company);
    delete  req.body.company;
    _SkillsMail.create(req.body, function (error, sk) {
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
            _SkillsMail.findById(req.params.skillsmail, function (error, skill) {
                cb(null, skill);
            });
        }
    }, function(err, resp){
        _.render(req, res, 'skills-mail-edit', {title: 'Chỉnh sửa kỹ năng', currentSkill: resp.two, companies: resp.one, plugins: [['bootstrap-select'], ['mrblack-table']]}, true);
    });
};
// PUT : http://domain.com/skills/:_id
exports.update = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    req.body['status'] = _.has(req.body,'status') ? req.body['status'] : 0;
    req.body['name'] = _.chain(req.body.skillName).trimValueNotLower().value();

    if(req.body['status']==0&& req.body['oStatus']==1){
        _ServicesMail.find({idSkill: new mongoose.Types.ObjectId(req.params['skillsmail'])}, function(e, services){
            if(e) return res.json({code: e, message: JSON.stringify(e) });
            if(services.length==0){
                _SkillsMail.findByIdAndUpdate(req.params['skillsmail'], req.body, {new: true}, function (error1, ca) {
                        _.genTree();
                        res.json({code: (error1 ? 500 : 200), message: error1 ? error1 : ca});
                    });
            }else{
                _ServicesMail.update({idSkill: new mongoose.Types.ObjectId(req.params['skillsmail'])}, {$set: { status:0}}, {multi: true}, function(error){
                    if(error) return res.json({code: error, message: JSON.stringify(error) });

                    QUEUE_Mail.updateService(services);
                    _SkillsMail.findByIdAndUpdate(req.params['skillsmail'], req.body, {new: true}, function (error1, ca) {
                        _.genTree();
                        res.json({code: (error1 ? 500 : 200), message: error1 ? error1 : ca});
                    });
                });
            }
        });

    }else{
        _SkillsMail.findByIdAndUpdate(req.params['skillsmail'], req.body, {new: true}, function (error1, ca) {
            _.genTree();
            res.json({code: (error1 ? 500 : 200), message: error1 ? error1 : ca});
        });
    }

};

exports.validate = function (req, res) {
    req.query.idCompany = new mongodb.ObjectId(req.query.company);
    if (_.has(req.query, 'name')){
        req.query['name'] = _.chain(req.query.name).trimValueNotLower().value();
        if (!_.has(req.query, 'currName') || !_.isEqual(req.query.name, req.query.currName)){
            _SkillsMail.findOne({idCompany: req.query.idCompany, skillName: req.query.name}).exec(function (error, ca) {
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
};

exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.skillsmail, 'all')){
        _async.waterfall([
            function(callback){
                _ServicesMail.update({idSkill: {$in:req.params['skillsmail']}}, {$set:{idSkill:null, status:0}}, function(err){
                    callback(err)
                })
            },
            function(callback){
                _GroupsProfileMail.find({"skills.idSkill": {$in:req.params['skillsmail']}}, function(err, groupProfiles){
                    callback(err, groupProfiles);
                });
            },
            function(groupProfiles, callback){
                _GroupsProfileMail.remove({"skills.idSkill": {$in:req.params['skillsmail']}}, function(err){
                    callback(err, groupProfiles);
                });
            },
            function(groupProfiles, callback){
                _AgentGroups.update({idProfileMail:{$in: _.pluck(groupProfiles, '_id')}}, {$set:{idProfileMail:null}}, function(err){
                    callback(err);
                })
            }
        ], function(err){
            if(err) return res.json({code:500, message: JSON.stringify(err)});
            _SkillsMail._deleteAll({$in:req.params['skillsmail']}, function (error) {
                _.genTree();
                res.json({code: (error ? 500 : 200), message: error ? error :""});
            });
        })


    }
    else{

        _async.waterfall([
            function(callback){
                _ServicesMail.update({idSkill: {$in:req.body.ids.split(',')}}, {$set:{idSkill:null, status:0}}, function(err){
                    callback(err)
                })
            },
            function(callback){
                _GroupsProfileMail.find({"skills.idSkill": {$in:req.params['skillsmail']}}, function(err, groupProfiles){
                    callback(err, groupProfiles);
                });
            },
            function(groupProfiles, callback){
                _GroupsProfileMail.remove({"skills.idSkill": {$in:req.params['skillsmail']}}, function(err){
                    callback(err, groupProfiles);
                });
            },
            function(groupProfiles, callback){
                _AgentGroups.update({idProfileMail:{$in: _.pluck(groupProfiles, '_id')}}, {$set:{idProfileMail:null}}, function(err){
                    callback(err);
                })
            }
        ], function(err){
            if(err) return res.json({code:500, message: JSON.stringify(err)});
            _SkillsMail._deleteAll({$in:req.body.ids.split(',')}, function (error, ca) {
                _.genTree();
                res.json({code: (error ? 500 : 200), message: error ? error : ''});
            });
        })


    }
};