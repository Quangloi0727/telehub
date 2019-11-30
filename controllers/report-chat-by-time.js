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
        var channel = {};
        var coms = [];
        var agents = [];
        if (req.session.auth.company) {
            companyQuery._id = _.convertObjectId(req.session.auth.company._id);
            channel.idCompany = _.convertObjectId(req.session.auth.company._id);
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-chat-by-time', {
                    title: "Báo cáo chat - Báo cáo theo khung giờ",
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
                if (req.query.idCompany) channel.idCompany = _.convertObjectId(req.query.idCompany);
                _CompanyChannel.distinct("_id", channel, function (err, r) {
                    _ServicesChat.distinct("_id", {idChannel:{$in:r}}, function(err,r2){
                        _TicketsChat.distinct('threadId',{idService:{$in:r2},status:{$ne:-1}}, function(err,r3){
                            next(err, r3)
                        })
                    })
                });
            },
            function (a, next) {
                var query = {};
                query.status = 0;
                var query2 = {};
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
                if(req.query.agentId) query2['agentId.id'] = {$in: _.arrayObjectId(req.query.agentId)};
                var agg = [
                    {$match: query},
                    {$project: {_id: 0, hours: {$hour: {$add:["$created", 7*60*60*1000]}}, agentId:"$agentMessage"}},
                    {$unwind:"$agentId"},
                    {$match: query2},
                    {$group:{_id:{id:"$agentId.id", hour:"$hours"}, total:{$sum:1}, missed:{$sum:{$cond:[{$gt:["$agentId.send",0]},0,1]}},accept:{$sum:{$cond:[{$gt:["$agentId.send",0]},1,0]}}}},
                    {$lookup:{from:'users', localField:'_id.id', foreignField:"_id", as:"agent"}},
                    {$unwind:"$agent"},
                    {$group:{_id:"$agent.displayName", hours:{$push:{block:"$_id.hour", total:"$total", missed:"$missed", accept:"$accept"}}}}
                ];

                if(!_.isEmpty(req.query)){
                    _ChatThread.aggregate(agg).allowDiskUse(true).exec(function (err, r) {
                        next(err, r)
                    });
                }else{
                    next(null, [])
                }
            }
        ], function (err, data) {
            return _.render(req, res, 'report-chat-by-time', {
                title: "Báo cáo chat - Báo cáo theo khung giờ",
                plugins: ['moment', ['bootstrap-select'], 'export-excel', ['chosen']],
                company: coms,
                agents: agents,
                data: data
            }, true, err);
        })
    }
};