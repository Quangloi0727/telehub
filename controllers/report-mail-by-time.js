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
        var companyQuery = {};
        var service = {};
        var coms = [];
        var agents = [];
        if (req.session.auth.company) {
            companyQuery._id = _.convertObjectId(req.session.auth.company._id);
            service.idCompany = _.convertObjectId(req.session.auth.company._id);
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-mail-by-time', {
                    title: "Báo cáo mail - Báo cáo theo khung giờ",
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
                            agents = agent;
                            next(err);
                        });
                    });
                });
            },
            function (next) {
                _ServicesMail.distinct("_id", req.query.idCompany ? {idCompany: req.query.idCompany} : service, function (err, r) {
                    _MailCampaigns.distinct("_id", {setting: {$in:r}}, function (err, r2) {
                        _TicketsMail.distinct('mailId',{idService:{$in:r}, status:{$ne:-1}}, function(err,r3){
                            next(err, [{service:{$in:r}},{campaign:{$in:r2}},{replyTo:{$in:r3}}])
                        })
                    });
                });
            },
            function (a, next) {
                var query = {};
                query.$or = a;
                if (req.query.startDate || req.query.endDate) {
                    query.created = {};
                    if (req.query.startDate) {
                        query.created.$gte = moment(req.query.startDate, "DD/MM/YYYY").startOf('day')._d;
                    };
                    if (req.query.endDate) {
                        query.created.$lte = moment(req.query.endDate, "DD/MM/YYYY").endOf('day')._d;
                    };
                }
                if (req.query.agentId) query.agent = {
                    $in: _.arrayObjectId(req.query.agentId)
                };
                var agg = [];
                agg.push();
                if (!_.isEmpty(req.query)) {
                    var obj = {_id:"$agent.displayName"};
                    var obj2 = {_id:1};
                    _.each(_.range(12), function(o){
                        obj['send' + o] = {$sum:{$cond:[{$eq:[{$trunc:{$divide:["$_id.hour",2]}},o]},"$send",0]}};
                        obj['receive' + o] = {$sum:{$cond:[{$eq:[{$trunc:{$divide:["$_id.hour",2]}},o]},"$receive",0]}};
                        obj2[o] = {
                            receive: "$receive" + o,
                            send: '$send' + o
                        }
                    })
                    _Mail.aggregate([
                        {$match: query},
                        {
                            $project: {
                                _id: 0,
                                hours: {$hour: {$add: ["$created", 7 * 60 * 60 * 1000]}},
                                agent: "$agent",
                                receive: {$cond: [{$eq: ["$mail_type", 2]}, 1, 0]},
                                send: {$cond: [{$eq: ["$mail_type", 1]}, {$cond:[{$eq: ["$status", 3]},1, 0]}, 0]}
                            }
                        },
                        {$group: {_id: {agent: "$agent", hour: "$hours"}, receive:{$sum:"$receive"}, send:{$sum:"$send"}}},
                        {$lookup: {from: 'users', localField: "_id.agent", foreignField: '_id', as: 'agent'}},
                        {$unwind: "$agent"},
                        {$group:obj},
                        {$project:obj2}
                    ]).allowDiskUse(true).exec(function (err, r) {
                        console.log(r)
                        next(err,r)
                    });
                } else {
                    next(null, [])
                }
            }
        ], function (err, result) {
            return _.render(req, res, 'report-mail-by-time', {
                title: "Báo cáo mail - Báo cáo theo khung giờ",
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: coms,
                agents: agents,
                data: result
            }, true, err);
        })
    }
}
