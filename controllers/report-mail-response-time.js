/**
 * Created by Đại Đồng on 06/07/2016.
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
        var title = "Báo cáo mail - Báo cáo thời gian phản hồi";
        var view = 'report-mail-response-time';
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
                query.mail_type = 2;
                query.service = {$in: a};
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
                if (req.query.agentId) query.agent = {
                    $in: _.map(req.query.agentId, function (o) {
                        return _.convertObjectId(o)
                    })
                };
                if (!_.isEmpty(req.query)) {
                    _Mail.distinct('_id', query).lean(true).exec(function (err, r) {
                        _async.parallel({
                            count: function (callback) {
                                _Mail.aggregate([{$match: {_id: {$in: r}}},
                                    {$group: {_id: '$agent', count: {$sum: 1}}},
                                    {$lookup: {from: 'users', localField: "_id", foreignField: '_id', as: 'agent'}},
                                    {$unwind: "$agent"},
                                    {$group:{_id:0,total:{$sum:"$count"},agent:{$push:{name:"$agent.displayName",total:"$count"}}}}
                                ],function(err,r){
                                    callback(err, r.length ? r[0]:{total:0,agent:[]})
                                });
                            },
                            time: function(callback){
                                _Mail.aggregate([{$match: {replyTo: {$in: r}}},
                                    {$group: {_id: {agent:'$agent',replyTo:'$replyTo'}, created:{$min:'$created'}}},
                                    {$lookup: {from: 'mails', localField: "_id.replyTo", foreignField: '_id', as: 'replyTo'}},
                                    {$unwind: {path:"$replyTo",preserveNullAndEmptyArrays:true}},
                                    {$project:{_id:'$_id.agent',response:{$subtract:['$created','$replyTo.created']}}},
                                    {$group:{_id:'$_id',totalTime:{$sum:"$response"},avgTime:{$avg:'$response'}}},
                                    {$lookup: {from: 'users', localField: "_id", foreignField: '_id', as: 'agent'}},
                                    {$unwind: "$agent"},
                                    {$project:{_id:0,name:'$agent.displayName',totalTime:1,avgTime:1}}
                                ],function(err,r){
                                    callback(err, r)
                                });
                            },
                            totalTime: function(callback){
                                _Mail.aggregate([{$match: {replyTo: {$in: r}}},
                                    {$group: {_id: '$replyTo', created:{$min:'$created'}}},
                                    {$lookup: {from: 'mails', localField: "_id", foreignField: '_id', as: 'replyTo'}},
                                    {$unwind: {path:"$replyTo",preserveNullAndEmptyArrays:true}},
                                    {$project:{_id:1,response:{$subtract:['$created','$replyTo.created']}}},
                                    {$group:{_id:0,totalTime:{$sum:"$response"},avgTime:{$avg:'$response'}}}
                                ],function(err,r){
                                    callback(err, r.length ? r[0]:{totalTime:0,avgTime:0})
                                });
                            }
                        },function(err,result){
                            total = _.extend(result.totalTime,{total:result.count.total});
                            _.each(result.count.agent, function(o){
                                var obj = _.findWhere(result.time,{name: o.name});
                                data.push({name: o.name,total: o.total,totalTime: obj ? obj.totalTime:0,avgTime: obj?obj.avgTime:0})
                            })
                            next(err)
                        })
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
//var total = {};
//var data = [];
//var date = moment().valueOf();
//_Mail.distinct('_id', {mail_type : 2}).lean(true).exec(function (err, r) {
//    _async.parallel({
//        count: function (callback) {
//            _Mail.aggregate([{$match: {_id: {$in: r}}},
//                {$group: {_id: '$agent', count: {$sum: 1}}},
//                {$lookup: {from: 'users', localField: "_id", foreignField: '_id', as: 'agent'}},
//                {$unwind: "$agent"},
//                {$group:{_id:0,total:{$sum:"$count"},agent:{$push:{name:"$agent.displayName",total:"$count"}}}}
//            ],function(err,r){
//                callback(err, r.length ? r[0]:{total:0,agent:[]})
//            });
//        },
//        time: function(callback){
//            _Mail.aggregate([{$match: {replyTo: {$in: r}}},
//                {$group: {_id: {agent:'$agent',replyTo:'$replyTo'}, created:{$min:'$created'}}},
//                {$lookup: {from: 'mails', localField: "_id.replyTo", foreignField: '_id', as: 'replyTo'}},
//                {$unwind: {path:"$replyTo",preserveNullAndEmptyArrays:true}},
//                {$project:{_id:'$_id.agent',response:{$subtract:['$created','$replyTo.created']}}},
//                {$group:{_id:'$_id',totalTime:{$sum:"$response"},avgTime:{$avg:'$response'}}},
//                {$lookup: {from: 'users', localField: "_id", foreignField: '_id', as: 'agent'}},
//                {$unwind: "$agent"},
//                {$group:{_id:0,totalTime:{$sum:"$totalTime"},avgTime:{$sum:'$avgTime'}, agent:{$push:{name:"$agent.displayName",totalTime:"$totalTime",avgTime:'$avgTime'}}}},
//                {$project:{_id:0,total:{totalTime:"$totalTime",avgTime:'$avgTime'},agent:1}}
//            ],function(err,r){
//                callback(err, r.length ? r[0]:{total:{totalTime:0,avgTime:0},agent:[]})
//            });
//        }
//    },function(err,result){
//        total = _.extend(result.time.total,{total:result.count.total});
//        _.each(result.count.agent, function(o){
//            var obj = _.findWhere(result.time.agent,{name: o.name});
//            data.push({name: o.name,total: o.total,totalTime: obj.totalTime?obj.totalTime:0,avgTime: obj.avgTime?obj.avgTime:0})
//        })
//        console.log(total, data, moment().valueOf()-date)
//    })
//});