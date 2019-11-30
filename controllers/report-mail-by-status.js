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
        var title = "Báo cáo mail - Báo cáo trạng thái";
        var view = 'report-mail-by-status';
        var companyQuery = {};
        var service = {};
        var coms = [];
        var agents = [];
        var total = {};
        var data = [];
        if (req.session.auth.company) {
            companyQuery._id = _.convertObjectId(req.session.auth.company._id);
            service.idCompany = _.convertObjectId(req.session.auth.company._id);
            if (!req.session.auth.company.leader) {
                _.render(req, res, view, {
                    title: title,
                    plugins: [['bootstrap-select'], 'export-excel', ['chosen']],
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
                    next(err, r)
                });
            },
            function (a, next) {
                var query = {};
                query.idService = {$in: a};
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
                if (req.query.agentId) query.idAgent = {
                    $in: _.map(req.query.agentId, function (o) {
                        return _.convertObjectId(o)
                    })
                };
                var agg = [];
                agg.push();
                if (!_.isEmpty(req.query)) {
                    _TicketsMail.aggregate([
                        {$match: query},
                        {$group:{_id:"$idAgent", total:{$sum:1}, default:{$sum:{$cond:[{$eq:["$status",0]},1,0]}}, progress:{$sum:{$cond:[{$eq:["$status",1]},1,0]}}, finished:{$sum:{$cond:[{$eq:["$status",2]},1,0]}}}},
                        {$lookup: {from: 'users', localField: "_id", foreignField: '_id', as: 'agent'}},
                        {$unwind:"$agent"},
                        {$group:{_id:0,total:{$sum:"$total"}, default:{$sum:"$default"}, progress:{$sum:"$progress"}, finished:{$sum:"$finished"}, agent:{$push:{name:"$agent.displayName",total:"$total", default:"$default", progress:"$progress", finished:"$finished"}}}}
                    ]).allowDiskUse(true).exec(function (err, r) {
                        if(r.length){
                            total = r[0];
                            data = total.agent;
                            delete total.agent;
                        }
                        next(err)
                    });
                } else {
                    next(null)
                }
            }
        ], function (err) {
            return _.render(req, res, view, {
                title: title,
                plugins: [['bootstrap-select'], 'export-excel', ['chosen']],
                company: coms,
                agents: agents,
                data: data,
                total: total
            }, true, err);
        })
    }
}
