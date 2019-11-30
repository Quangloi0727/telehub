/**
 * Created by Đại Đồng on 24/06/2016.
 */
exports.index = {
    json: function (req, res) {
        _AgentGroups.distinct("_id", req.query, function (err, r) {
            _Users.find({$or: [{'agentGroupLeaders.group': {$in: r}}, {'agentGroupMembers.group': {$in: r}}, {'companyLeaders.company': {$in: [_.convertObjectId(req.query.idParent)]}}]}, function (err, r2) {
                res.status(200).json(r2);
            })
        })
    },
    html: function (req, res) {
        var title = "Báo cáo chat - Báo cáo thời gian phản hồi";
        var view = 'report-chat-response-time';
        var companyQuery = {};
        var service = {};
        var coms = [];
        var agents = [];
        var agent = [];
        var sla = 15;
        if (req.session.auth.company) {
            companyQuery._id = _.convertObjectId(req.session.auth.company._id);
            service.idCompany = _.convertObjectId(req.session.auth.company._id);
            if (!req.session.auth.company.leader) {
                _.render(req, res, view, {
                    title: title,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    agents: agents,
                    company: coms,
                    data: [],
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }
        _async.waterfall([
            function (next) {
                _Company.find(companyQuery, function (err, com) {
                    coms = com;
                    _AgentGroups.find({idParent: {$in: _.pluck(com, "_id")}}, {_id: 1}, function (err, result) {
                        if (err) return callback(err, null);
                        var ag = _.pluck(result, '_id');
                        _Users.find({$or: [{'agentGroupLeaders.group': {$in: ag}}, {'agentGroupMembers.group': {$in: ag}}, {'companyLeaders.company': {$in: com}}]}, function (err, agent) {
                            agents = _.pluck(agent, "_id");
                            next(err);
                        });
                    });
                });
            },
            function (next) {
                _Company.findById(req.query.idCompany, function (err, r) {
                    if (!_.isEmpty(req.query) && r.recipeSLAChat) sla = r.recipeSLAChat;
                    _CompanyChannel.distinct("_id", req.query.idCompany ? {idCompany: req.query.idCompany} : service, function (err, r2) {
                        _ServicesChat.distinct("_id", {idChannel: {$in: r2}}, function (err, r3) {
                            _TicketsChat.distinct('threadId', {
                                idService: {$in: r3},
                                status: {$ne: -1}
                            }, function (err, r4) {
                                next(err, r4)
                            })
                        })
                    });
                })
            },
            function (a, next) {
                if (!_.isEmpty(req.query)) {
                    var data = [];
                    if (req.query.agentId) agents = _.arrayObjectId(req.query.agentId);
                        var query = {};
                        query.status = 0;
                        query._id = {$in: a};
                        if (req.query.startDate || req.query.endDate) {
                            query.created = {};
                            if (req.query.startDate) {
                                query.created.$gte = moment(req.query.startDate, "DD/MM/YYYY").startOf('day')._d;
                            }
                            ;
                            if (req.query.endDate) {
                                query.created.$lte = moment(req.query.endDate, "DD/MM/YYYY").endOf('day')._d;
                            }
                            ;
                        }
                        query.agentId = {$in: agents};
                        var agg = [
                            {$match: query},
                            {$unwind: "$agentMessage"},
                            {
                                $group: {
                                    _id: "$agentMessage.id",
                                    response: {$sum: {$cond: [{$gt: ["$agentMessage.response", 0]}, "$agentMessage.response", 0]}},
                                    count: {$sum: 1},
                                    answered: {$sum: {$cond: [{$gt: ["$agentMessage.response", 0]}, 1, 0]}},
                                    sla: {$sum: {$cond: [{$lte: ["$agentMessage.response", sla]}, 1, 0]}}
                                }
                            },
                            {$lookup: {from: "users", localField: "_id", foreignField: "_id", as: "agent"}},
                            {$unwind: "$agent"}
                        ];
                        _ChatThread.aggregate(agg).allowDiskUse(true).exec(next);
                } else {
                    next(null, [])
                }
            }
        ], function (err, result) {
            return _.render(req, res, view, {
                title: title,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: coms,
                agents: agents,
                sla: sla,
                data: result
            }, true, err);
        })
    }
}
