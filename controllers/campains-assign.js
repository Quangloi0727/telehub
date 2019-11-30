//_Users.create({
//    name: "aaa",
//    password: "aaa",
//    displayName: "Leader group 5",
//    agentGroupLeaders: [
//        {
//            group: '56b31f245c76cf410a99f385'
//        }
//    ],
//});
//
//for(var i = 1; i <= 10; i++){
//    _Users.create({
//        name: "aaa",
//        password: "aaa",
//        displayName: "Agent "+i+" group 5",
//        agentGroupMembers: [
//            {
//                group: '56b31f245c76cf410a99f385'
//            }
//        ],
//    });
//}


exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var _campainId = req.query['campainId'];

        _Campains.findById(_campainId, function(err, campain){
            if(err){
                res.json({code: 500});
                return;
            }

            if(_.isEqual(req.query['type'], 'getAddedAgent')){
                // Lấy danh sách agent đã được phân ticket
                _async.waterfall([
                    function (next) {
                        var aggregate = [];
                        var _query = {idCampain: new mongodb.ObjectId(_campainId)};
                        aggregate.push({$match: _query});
                        aggregate.push({$sort: {created: -1}});
                        aggregate.push({ $project: {
                            idAgent: '$idAgent',
                            status: {$cond: [{$gt: ['$status', 0]},1,0]}
                        }});
                        aggregate.push({$group: {
                            _id: '$idAgent',
                            count :{$sum:1},
                            called : {$sum: '$status'}
                        }});

                        _Tickets.aggregate(aggregate, function (err, tickets) {
                            next(err, {
                                tickets: tickets
                            });
                        });
                    },
                    function (result,next) {
                        _Users.populate(result.tickets,{path: '_id', select: 'displayName agentGroupLeaders'},function(err, users){
                            var searchKey = req.query['searchKey'] ? _.stringRegex(req.query['searchKey']) : '';
                            var agents = _.chain(users)
                                .map(function(agent){
                                    return (_.isEqual(searchKey, '') || (!_.isEqual(searchKey, '') && agent._id && agent._id.displayName.toLowerCase().match(searchKey))) ? agent : null ;
                                })
                                .compact()
                                .value();
                            var paginator = new pagination.SearchPaginator({prelink: '', current: page, rowsPerPage: rows, totalResult: agents.length});
                            var agentsPaging = agents.slice((page - 1)*rows , page*rows);
                            next(err, {agents: agentsPaging, paging: paginator.getPaginationData(), count: agents.length});
                        });
                    }
                ],function(err, result){
                    res.json({code: err ? 500: 200, message: err ? err : result});
                });
            }else if(_.isEqual(req.query['type'], 'getGroup')){
                // Lấy danh sách nhóm agent phục vụ chiến dịch
                _async.waterfall([
                    function(next){
                        _CampaignAgent.find({idCampaign: campain._id}).populate('idAgent').exec(next);
                    },
                    function(agents, next){
                        var gids = [];
                        _.each(agents, function(agent){
                            gids = _.union(_.pluck(agent.idAgent.agentGroupLeaders, 'group'), gids);
                            gids = _.union(gids, _.pluck(agent.idAgent.agentGroupMembers, 'group'));
                        });

                        var aggregate = _AgentGroups.aggregate();
                        aggregate._pipeline = [];
                        aggregate._pipeline.push({$match: {_id: {$in: gids}}});
                        var _query = {idParent: campain.idCompany};
                        aggregate._pipeline.push({$match: _query});

                        _AgentGroups.aggregatePaginate(aggregate, {page: page, limit: rows}, function (err, groups, pageCount, count) {
                            var result = _.chain(groups).map(function(group){
                                group.agents = 0;
                                _.each(agents, function(agent){
                                    _.each(_.union(agent.idAgent.agentGroupLeaders, agent.idAgent.agentGroupMembers), function(el){
                                        if(_.isEqual(el.group.toString(), group._id.toString())){
                                            group.agents++;
                                        }
                                    });
                                });
                                return group;
                            }).compact().value();
                            var paginator = new pagination.SearchPaginator({prelink: '', current: page, rowsPerPage: rows, totalResult: count});
                            res.json({code: err ? 500: 200, message: err ? err : {groups: result, paging: paginator.getPaginationData(), count: count}});
                        });
                    }
                ], function(err, result){

                });
            }else if(_.isEqual(req.query['type'], 'getCampainData')){
                // Lấy thông tin của chiến dịch
                _async.parallel({
                    count: function(next){
                        _CampainCustomer.count({idCampain: _campainId} , next);
                    },
                    called: function(next){
                        _Tickets.count({idCampain: _campainId} , next);
                    }
                }, function(err, result){
                    res.json({code: err ? 500: 200, message: err ? err : {
                        data: campain,
                        count: result.count,
                        called: result.called}});
                });
            }else if(_.isEqual(req.query['type'], 'getToAddAgent')){
                // Lấy danh sách agent có thể phân ticket
                _async.waterfall([
                    function (next) {
                        _CampaignAgent.find({idCampaign: campain._id}, next);
                    },
                    function (result, next) {
                        var _agentIds = _.pluck(result, 'idAgent');
                        var aggregate = _Users.aggregate();
                        aggregate._pipeline = [];
                        var _query = {_id: {$in : _agentIds}};
                        _query['displayName'] = {$regex: new RegExp(_.stringRegex(req.query['searchKey'] ? req.query['searchKey'] : ''), 'i')};
                        aggregate._pipeline.push({$match: _query});
                        _Users.aggregatePaginate(aggregate, {page: page, limit: rows}, function (err, agents, pageCount, count) {
                            var paginator = new pagination.SearchPaginator({prelink: '', current: page, rowsPerPage: rows, totalResult: count});
                            _async.eachSeries(agents, function(agent, cb){
                                _Tickets.count({idCampain: campain._id.toString(), idAgent: agent._id}, function(err2, count){
                                    agent.tickets = count;
                                    cb();
                                });
                            }, function(err){
                                next(err, {
                                    agents: agents,
                                    paging: paginator.getPaginationData(),
                                    count: count}
                                );
                            });
                        });
                    }
                ],function(err, result){
                    res.json({code: err ? 500: 200, message: err ? err : result});
                });
            }else if(_.isEqual(req.query['type'], 'getLeaders')){
                // Lấy danh sách leader
                _async.waterfall([
                    function (next) {
                        var aggregate = [];
                        aggregate.push({$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupLeaders.group', as: 'leaders'}});
                        var _query = {idParent: campain.idCompany};
                        aggregate.push({$match: _query});
                        _AgentGroups.aggregate(aggregate, next);
                    },
                    function (groups, next) {
                        var agents = _.chain(groups)
                            .reduce(function(memo, group){
                                return _.union(memo, group.leaders);
                            },0)
                            .compact()
                            .value();
                        next(null, _.pluck(agents, '_id'));
                    }
                ],function(err, result){
                    res.json({code: err ? 500: 200, message: err ? err : result});
                });
            }

        });
    },
    html: function (req, res) {
        if(!_.has(req.query, 'campainId')){
            res.render('404', {title: '404 | Page not found'});
            return;
        }

        _.render(req, res, 'campains-assign', {
            title: 'Phân danh sách số',
            plugins: [['bootstrap-duallistbox'],'moment',['bootstrap-datetimepicker'],['bootstrap-select']],
        }, true);
    }
}

// POST
exports.create = function (req, res) {
    if(!req.body['campain']) {
        res.json({code: 500});
        return;
    }

    var _idCampain = req.body['campain'];

    if(_.has(req.body, 'groups')){
        // Phân khách hàng cho nhóm
        var groups = JSON.parse(req.body['groups']);
        var batch = mongoClient.collection('tickets').initializeUnorderedBulkOp({useLegacyOps: true});

        _async.waterfall([
            function (next) {
                // Danh sách khách hàng đã phân
                _Tickets.find({idCampain: _idCampain}, next);
            },
            function (tickets, next) {
                _async.parallel({
                    agents: function(next2){
                        // Tìm danh sách agent
                        _CampaignAgent.find({idCampaign: _idCampain}, next2);
                    },
                    campainCustomers: function(next2){
                        // Tìm danh sách khách hàng được đưa vào chiến dịch
                        var _ticketIds = _.pluck(tickets, 'idCustomer');
                        _CampainCustomer.find({idCampain: _idCampain ,idCustomer: {$nin: _ticketIds}}, next2);
                    },
                    groups: function(next2){
                        // Query dữ liệu của nhóm
                        var _selectGroupIds = _.pluck(groups, 'groupId');
                        var aggregate = _AgentGroups.aggregate();
                        aggregate._pipeline = [];
                        aggregate._pipeline.push({$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupMembers.group', as: 'members'}});
                        aggregate._pipeline.push({$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupLeaders.group', as: 'leaders'}});
                        var _query = {_id: {$in: _.arrayObjectId(_selectGroupIds)}};
                        aggregate._pipeline.push({$match: _query});

                        _AgentGroups.aggregate(aggregate._pipeline, next2);
                    }
                }, function(err, result){
                    // Phân ticket cho agent trong nhóm
                    var test = [];
                    var ccs = result.campainCustomers;
                    var agentIds = _.chain(result.agents)
                        .map(function(ag){
                            return ag.idAgent.toString();
                        }).compact().value();

                    _.each(result.groups ,function (g) {
                        var agents = _.chain(_.union(g.members, g.leaders))
                            .map(function(ag){
                                return agentIds.indexOf(ag._id.toString()) >= 0 ? ag : null;
                            })
                            .compact().value();

                        _.each(groups, function(e, i){
                            if(_.isEqual(e.groupId.toString(), g._id.toString())){
                                var _cutomers = ccs.slice(0, e.numCall);
                                ccs = ccs.slice(e.numCall, ccs.length);
                                _.each(_cutomers, function(e2, j){
                                    var _index = j%agents.length;
                                    var _ticket = new _Tickets({
                                        idCustomer: e2.idCustomer,
                                        idCampain: e2.idCampain,
                                        idAgent: agents[_index]._id,
                                        status : 0,
                                        createBy : req.session.user._id,
                                        created : Date.now()
                                    });
                                    batch.insert(_ticket.toObject());
                                });
                            }
                        });
                    })
                    next(err, batch);
                });
            }
        ], function(err, newBatch){
            if(newBatch.s.currentInsertBatch) {
                newBatch.execute(function (err2, result) {
                    res.json({code: (err2 ? 500 : 200)});
                });
            }else {
                res.json({code: 500});
            }
        });
    }else if(_.has(req.body, 'removeagents')){
        // Hủy bỏ việc phân khách hàng cho agent
        var _agents = [];
        _.each(JSON.parse(req.body['removeagents']), function(agentId){
            _agents.push(_.isEqual(agentId, '') ? null : agentId);
        });
        var batch = mongoClient.collection('tickets').initializeUnorderedBulkOp({useLegacyOps: true});
        batch.find({
            idCampain: new mongodb.ObjectId(_idCampain),
            status: 0,
            idAgent : {$in : _.arrayObjectId(_agents) }
        }).remove();

        batch.execute(function (err, result) {
            res.json({code: err ? 500: 200, message: err ? err : result});
        });
    }else if(_.has(req.body, 'agents')){
        // Phân khách hàng cho agent
        var _agents = JSON.parse(req.body['agents']);
        var batch = mongoClient.collection('tickets').initializeUnorderedBulkOp({useLegacyOps: true});
        _async.waterfall([
            function (next) {
                _Tickets.find({idCampain: req.body['campain']}, next);
            },
            function (tickets, next) {
                var _ticketIds = _.pluck(tickets, 'idCustomer');
                _CampainCustomer.find({idCampain: _idCampain, idCustomer: {$nin: _ticketIds}}, next);
            }, function(campainCustomers, next){
                var ccs = campainCustomers;
                _.each(_agents, function(e, i){
                    var _cutomers = ccs.slice(0, e.numCall);
                    ccs = ccs.slice(e.numCall, ccs.length);
                    _.each(_cutomers, function(e2, j){
                        var _ticket = new _Tickets({
                            idCustomer: e2.idCustomer,
                            idCampain: e2.idCampain,
                            idAgent: e.agentId,
                            status : 0,
                            createBy : req.session.user._id,
                            created : Date.now()
                        });
                        batch.insert(_ticket.toObject());
                    });
                });
                next(null, batch);
            }
        ], function(err, newBatch){
            if(newBatch.s.currentInsertBatch) {
                newBatch.execute(function (err2, result) {
                    res.json({code: (err2 ? 500 : 200)});
                });
            }else {
                res.json({code: 500});
            }
        });
    }
};
