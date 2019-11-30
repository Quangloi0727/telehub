/**
 * Created by Đại Đồng on 10/05/2016.
 */
exports.index = {
    json: function (req, res) {
        _Campains.find({idCompany: req.query.company}, function (err, r) {
            _AgentGroups.distinct("_id", {idParent: req.query.company}, function (err, r2) {
                _Users.find({$or: [{'agentGroupLeaders.group': {$in: r2}}, {'agentGroupMembers.group': {$in: r2}}, {'companyLeaders.company': {$in: r}}]}, function (err, r3) {
                    res.status(200).json({campaign: r, agent: r3});
                })
            })
        })
    },
    html: function (req, res) {
        var query = {};
        query = _.cleanRequest(req.query, ['startDate', 'endDate', 'idAgent']);
        var company = {};
        var groupQuery = {};
        var campaign = {};
        var userQuery = {};
        var ticketQuery = {status: {$ne: -1}};
        userQuery.$or = [];
        if (_.has(req.query, "startDate") || _.has(req.query, "endDate")) {
            query.startTime = {};
            query.created = {};
            if (_.has(req.query, "startDate")) {
                query.startTime.$gte = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day').valueOf();
                query.created.$gte = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day')._d;
            };
            if (_.has(req.query, "endDate")) {
                query.startTime.$lte = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day').valueOf();
                query.created.$lte = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day')._d;
            }
            ;
        }
        if (req.session.auth.company) {
            // Phân quyền
            campaign = {idCompany: req.session.auth.company._id};
            groupQuery.idParent = req.session.auth.company._id;
            company._id = _.convertObjectId(req.session.auth.company._id);
            userQuery.$or.push({'companyLeaders.company': {$in: [_.convertObjectId(req.session.auth.company._id)]}});
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-outbound-overall-agent-productivity', {
                    title: 'Báo cáo gọi ra - Báo tổng quát năng suất điện thoại viên',
                    result: [],
                    company: [],
                    campaign: [],
                    agent: [],
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }
        _async.parallel({
            cam: function (cb) {
                _Campains.find(campaign, cb)
            }, agent: function (cb) {
                _async.waterfall([
                    function (callback) {
                        _Company.distinct("_id", company, function (err, com) {
                            _AgentGroups.distinct("_id", groupQuery, function (err, result) {
                                if (err) return callback(err, null);
                                userQuery.$or.push({'agentGroupLeaders.group': {$in: result}}, {'agentGroupMembers.group': {$in: result}}, {'companyLeaders.company': {$in: com}});
                                _Users.find(userQuery, callback);
                            });
                        })
                    }
                ], cb);
            }, company: function (cb) {
                _Company.find(company, cb)
            }
        }, function (err, result) {
            _.isEmpty(req.query) ? (_.render(req, res, 'report-outbound-overall-agent-productivity', {
                title: 'Báo cáo gọi ra - Báo tổng quát năng suất điện thoại viên',
                result: [],
                company: result.company,
                campaign: result.cam,
                agent: result.agent,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
            }, true, err)) : (
                // Query báo cáo
                _async.waterfall([
                    function (cb) {
                        if (req.query.idCompany) campaign = {idCompany: _.convertObjectId(req.query.idCompany)}
                        _Campains.distinct("_id", campaign, cb)
                    },
                    function (a, cb) {
                        // Truy vấn dữ liệu call
                        var aggregate = [];
                        var transQuery = {};
                        transQuery.transType = 6;
                        transQuery.serviceType = 3;
                        transQuery.idCampain = {$in: a};
                        ticketQuery.idCampain = {$in: a};
                        if (_.has(query, 'startTime')) {
                            transQuery.startTime = query.startTime;
                        }
                        if (_.has(query, 'created')) {
                            ticketQuery.$or = [];
                            ticketQuery.$or.push({created:query.created});
                            ticketQuery.$or.push({updated:query.created});
                        }
                        if (_.has(req.query, 'agentId')) {
                            transQuery.agentId = {$in: _.arrayObjectId(req.query.agentId)};
                            ticketQuery.idAgent = {$in: _.arrayObjectId(req.query.agentId)};
                        }
                        if (_.has(req.query, 'idCampain')) {
                            transQuery.idCampain = _.convertObjectId(req.query.idCampain);
                            ticketQuery.idCampain = _.convertObjectId(req.query.idCampain);
                        }
                        aggregate.push({$match: transQuery});
                        aggregate.push({
                            $group: {
                                _id: "$agentId",
                                totalCall: {$sum: 1},
                                totalDuration: {$sum: {$subtract: ['$endTime', '$startTime']}},
                                avgDuration: {$avg: {$subtract: ['$endTime', '$startTime']}},
                                connected: {$sum: {$cond: [{$gt: ["$answerTime", 0]}, 1, 0]}},
                                waitDuration: {$sum: "$waitDuration"},
                                callDuration: {$sum: "$callDuration"},
                                avgCallDuration: {$avg: "$callDuration"}
                            }
                        });
                        aggregate.push({
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "agentInfo"
                            }
                        });
                        aggregate.push({$unwind: {path: "$agentInfo", preserveNullAndEmptyArrays: true}});
                        aggregate.push({
                            $project: {
                                _id: 1,
                                totalCall: 1,
                                totalDuration: 1,
                                avgDuration: 1,
                                connected: 1,
                                waitDuration: 1,
                                callDuration: 1,
                                avgCallDuration: 1,
                                agent: {$concat: ['$agentInfo.displayName', ' (', '$agentInfo.name', ')']},
                            }
                        });
                        aggregate.push({$sort: {agent : 1}});
                        _CdrTransInfo.aggregate(aggregate, cb);
                    },
                    function(trans, next){
                        // Truy vấn dữ liệu trạng thái làm việc của agent
                        var aggs = [];
                        aggs.push({$match: {agentId: {$in: _.pluck(trans, '_id')}}});
                        if (_.has(query, 'startTime')) {
                            aggs.push({$match: {startTime: query.created}});
                        }
                        aggs.push({$project: {
                            agentId: 1,
                            duration: {$subtract: ["$endTime", "$startTime"]}
                        }});
                        aggs.push({$group: {
                            _id: "$agentId",
                            duration: {$sum: "$duration"}
                        }});
                        _AgentStatusLog.aggregate(aggs, function(err, data){
                            _.each(trans, function(tran){
                                _.each(data, function(log){
                                    if(!_.isEmpty(tran._id) && _.isEqual(tran._id.toString(), log._id.toString())){
                                        tran.statusDuration = log.duration;
                                    };
                                });
                            });
                            next(err, trans);
                        });
                    },

                    function(r, next){
                        ticketQuery.idService = null;
                        _Tickets.aggregate([
                            {$match: ticketQuery},
                            {
                                $group: {
                                    _id: '$idAgent',
                                    total: {$sum: 1},
                                    done: {$sum: {$cond: [{$eq: ['$status', 2]}, 1, 0]}}
                                }
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    localField: "_id",
                                    foreignField: "_id",
                                    as: "agentInfo"
                                }
                            },
                            {
                                $unwind: {path: '$agentInfo', preserveNullAndEmptyArrays: true}
                            },
                            {
                                $project: {
                                    _id: 1,
                                    agent: '$agentInfo.displayName',
                                    total: 1,
                                    done: 1
                                }
                            }
                        ], function (err, r2) {
                            r = _.each(r, function(o){
                                if(o._id) o._id = o._id.toString();
                            });
                            r2 = _.each(r2, function(o){
                                if(o._id) o._id = o._id.toString();
                            });
                            var result = [];
                            _.each(_.union(_.pluck(r, '_id'), _.pluck(r2, '_id')), function (o) {
                                var obj1 = _.findWhere(r, {_id: o}) ? _.findWhere(r, {_id: o}) : {
                                    _id: o,
                                    totalCall: 0,
                                    totalDuration: 0,
                                    avgDuration: 0,
                                    callDuration: 0,
                                    connected: 0,
                                    waitDuration: 0,
                                    avgCallDuration: 0
                                };
                                var obj2 = _.findWhere(r2, {_id: o}) ? _.findWhere(r2, {_id: o}) : {
                                    _id: o,
                                    total: 0,
                                    done: 0
                                };
                                result.push(_.extend(obj1, obj2));
                            });
                            next(err, result);
                        });
                    }
                ], function (err, results) {
                    _.render(req, res, 'report-outbound-overall-agent-productivity', {
                        title: 'Báo cáo gọi ra - Báo tổng quát năng suất điện thoại viên',
                        result: results,
                        company: result.company,
                        campaign: result.cam,
                        agent: result.agent,
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                    }, true, err)
                })
            )
        })
    }
}