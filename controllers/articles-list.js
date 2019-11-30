// GET
exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 4;
        var sort = _.cleanSort(req.query, '');
        var aggregate = _Articles.aggregate();
        aggregate._pipeline = [{$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: 'author'}},
            {$lookup: {from: 'users', localField: 'updater', foreignField: '_id', as: 'updater'}}];
        aggregate._pipeline.push({$unwind: "$author"});
        aggregate._pipeline.push({$unwind: "$updater"});
//        aggregate._pipeline.push({$unwind: "$category"});
//        aggregate._pipeline.push({$lookup: {from: 'articlecategories', localField: 'category', foreignField: '_id', as: 'category'}});
        var _query = _.chain([{name: 'title', type: 1}, {name: 'raw', type: 1}, {name: 'category', type: 4}, {name: 'author', type: 1}, {name: 'updater', type: 1}, {name: 'created', type: 6}])
            .map(function (o) {
                if (_.isEqual(o.name, 'category')){
                    return _.has(req.query, o.name) ? _.object([o.name], [_.switchAgg(o.type, _.isEqual(req.query[o.name], '0') ? req.query[o.name] : new mongodb.ObjectId(req.query[o.name]))]) : null;
                }
                else if (_.isEqual(o.name, 'author') || _.isEqual(o.name, 'updater')){
                    return _.has(req.query, o.name) ? _.object([o.name + '.displayName'], [_.switchAgg(o.type, req.query[o.name])]) : null;
                }
                else{
                    return _.has(req.query, o.name) ? _.object([o.name], [_.switchAgg(o.type, req.query[o.name])]) : null;
                }
            })
            .compact()
            .reduce(function (memo, item) {
                memo[_.keys(item)] = _.values(item)[0];
                return memo;
            }, {})
            .value();
        if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});
        if (!_.isEmpty(sort)) aggregate._pipeline.push({$sort: sort});
        _Articles.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, tk, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink: '/articles-list', current: page, rowsPerPage: rows, totalResult: count});
            _ArticlesCategory.populate(tk, {path: 'category', select: 'name group'}, function(err, newItems){
                res.json({data: newItems, paging: paginator.getPaginationData()});
            });
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = {};
        var agentInfoVoice = [];
        var agentInfoChat = [];
        var agentInfoMail = [];
        var groups = [];

        _async.waterfall([
            function(next){
                // Lấy dữ liệu của user
                _Users.findById(req.session.user._id, next);
            },
            function(result, next){
                // Lấy thông tin queue call agent phục vụ
                groups = _.union(_.pluck(result.agentGroupLeaders, 'group'), _.pluck(result.agentGroupMembers, 'group'));
                var aggs = [];
                aggs.push({$match: {_id: {$in: groups}}});
                aggs.push({$lookup: {from: 'companies', localField: 'idParent', foreignField: '_id', as: 'companies'}});
                aggs.push({$unwind: "$companies"});
                aggs.push({$lookup: {from: 'groupprofiles', localField: 'idProfile', foreignField: '_id', as: 'profile'}});
                aggs.push({$unwind: "$profile"});
                aggs.push({$project: {
                    companyId : '$companies._id',
                    companyName: '$companies.name',
                    skills: '$profile.skills'
                }});
                aggs.push({$unwind: "$skills"});
                aggs.push({$lookup: {from: 'skills', localField: 'skills.idSkill', foreignField: '_id', as: 'skill'}});
                aggs.push({$unwind: "$skill"});
                aggs.push({$lookup: {from: 'services', localField: 'skills.idSkill', foreignField: 'idSkill', as: 'services'}});
                aggs.push({$unwind: "$services"});
                aggs.push({$group: {
                    _id: {
                        serviceId : '$services._id',
                        serviceName: '$services.name',
                        companyId: '$companyId',
                        companyName: '$companyName',
                        skillId: '$skill._id',
                        skillName: '$skill.skillName',
                    }
                }});

                aggs.push({$group: {
                    _id: {companyId: '$_id.companyId', companyName: '$_id.companyName'},
                    services: {$push: {
                        serviceId: '$_id.serviceId',
                        serviceName: '$_id.serviceName',
                        skillId: '$_id.skillId',
                        skillName: '$_id.skillName'}}
                }});

                _AgentGroups.aggregate(aggs, next);
            },
            function(result, next){
                // Lấy thông tin queue chat agent phục vụ
                agentInfoVoice = result;
                var aggs = [];
                aggs.push({$match: {_id: {$in: groups}}});
                aggs.push({$lookup: {from: 'companies', localField: 'idParent', foreignField: '_id', as: 'companies'}});
                aggs.push({$unwind: "$companies"});
                aggs.push({$lookup: {from: 'groupprofilechats', localField: 'idProfileChat', foreignField: '_id', as: 'profile'}});
                aggs.push({$unwind: "$profile"});
                aggs.push({$project: {
                    companyId : '$companies._id',
                    companyName: '$companies.name',
                    skills: '$profile.skills'
                }});
                aggs.push({$unwind: "$skills"});
                aggs.push({$lookup: {from: 'skillchats', localField: 'skills.idSkill', foreignField: '_id', as: 'skill'}});
                aggs.push({$unwind: "$skill"});
                aggs.push({$lookup: {from: 'servicechats', localField: 'skills.idSkill', foreignField: 'idSkill', as: 'services'}});
                aggs.push({$unwind: "$services"});
                aggs.push({$group: {
                    _id: {
                        serviceId : '$services._id',
                        serviceName: '$services.name',
                        companyId: '$companyId',
                        companyName: '$companyName',
                        skillId: '$skill._id',
                        skillName: '$skill.skillName',
                    }
                }});

                aggs.push({$group: {
                    _id: {companyId: '$_id.companyId', companyName: '$_id.companyName'},
                    services: {$push: {
                        serviceId: '$_id.serviceId',
                        serviceName: '$_id.serviceName',
                        skillId: '$_id.skillId',
                        skillName: '$_id.skillName'}}
                }});

                _AgentGroups.aggregate(aggs, next);
            },
            function(result, next){
                // Lấy thông tin queue mail agent phục vụ
                agentInfoChat = result;

                var aggs = [];
                aggs.push({$match: {_id: {$in: groups}}});
                aggs.push({$lookup: {from: 'companies', localField: 'idParent', foreignField: '_id', as: 'companies'}});
                aggs.push({$unwind: "$companies"});
                aggs.push({$lookup: {from: 'groupprofilemails', localField: 'idProfileMail', foreignField: '_id', as: 'profile'}});
                aggs.push({$unwind: "$profile"});
                aggs.push({$project: {
                    companyId : '$companies._id',
                    companyName: '$companies.name',
                    skills: '$profile.skills'
                }});
                aggs.push({$unwind: "$skills"});
                aggs.push({$lookup: {from: 'skillmails', localField: 'skills.idSkill', foreignField: '_id', as: 'skill'}});
                aggs.push({$unwind: "$skill"});
                aggs.push({$lookup: {from: 'servicemails', localField: 'skills.idSkill', foreignField: 'idSkill', as: 'services'}});
                aggs.push({$unwind: "$services"});
                aggs.push({$group: {
                    _id: {
                        serviceId : '$services._id',
                        serviceName: '$services.name',
                        companyId: '$companyId',
                        companyName: '$companyName',
                        skillId: '$skill._id',
                        skillName: '$skill.skillName',
                    }
                }});

                aggs.push({$group: {
                    _id: {companyId: '$_id.companyId', companyName: '$_id.companyName'},
                    services: {$push: {
                        serviceId: '$_id.serviceId',
                        serviceName: '$_id.serviceName',
                        skillId: '$_id.skillId',
                        skillName: '$_id.skillName'}}
                }});

                _AgentGroups.aggregate(aggs, next);
            },
            function(result, next){
                agentInfoMail = result;
                _Articles
                    .find(req.query)
                    .sort(_.cleanSort(req.query))
                    .paginate(page, rows, next);
            }
        ], function(error, result, pageCount){
            var paginator = new pagination.SearchPaginator({prelink: '/articles-list', current: page, rowsPerPage: rows, totalResult: pageCount});
            _.render(req, res, 'articles-list', {title: 'Danh sách bài viết', agentInfoVoice: agentInfoVoice, agentInfoChat: agentInfoChat, agentInfoMail: agentInfoMail, articles: result, paging: paginator.getPaginationData(), plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']]}, true, error);
        });
    }
}