/**
 * Created by Đại Đồng on 11/10/2016.
 */
var title = 'Báo cáo tổng hợp Call Center';
var view = 'report-call-center';
exports.index = {
    json: function (req, res) {
        var start = req.query.startTime ? moment(req.query.startTime, "DD/MM/YYYY") : null;
        var end = req.query.endTime ? moment(req.query.endTime, "DD/MM/YYYY").endOf('day') : null;
        var onlineQuery = {};
        var callQuery = {};
        if(start||end){
            callQuery.startTime = {};
            onlineQuery.startTime = {};
            if(start){
                callQuery.startTime.$gte = start.valueOf();
                onlineQuery.startTime.$gte = start._d;
            }
            if(end){
                callQuery.startTime.$gte = end.valueOf();
                onlineQuery.startTime.$gte = end._d;
            }
        }
        var companyId = null;
        if(req.session.auth.company && req.session.auth.company._id){
            companyId = req.session.auth.company._id
        }else if(req.query.idCompany){
            companyId = _.convertObjectId(req.query.idCompany)
        }
        _Company.distinct('_id', companyId ? {_id:companyId}:{}, function(err,company){
            if(err) return res.json({code:500,message:err.message});
            _Campains.distinct('_id', {idCompany:{$in:company}}, function(err,campaign){
                if(err) return res.json({code:500,message:err.message});
                _Services.distinct('_id', {idCompany:{$in:company}}, function(err,service){
                    if(err) return res.json({code:500,message:err.message});
                    _AgentGroups.distinct("_id", {idParent:{$in:company}}, function (err, group) {
                        _CampaignAgent.distinct('idAgent', {idCampaign:{$in:campaign}}, function(err,agent){
                            if(err) return res.json({code:500,message:err.message});
                            _Users.distinct('_id',{$or:[{'agentGroupLeaders.group': {$in: group}}, {'agentGroupMembers.group': {$in: group}}, {'companyLeaders.company': {$in:company}},{_id:{$in:agent}}]}).lean(true).exec(function (err, agents) {
                                if(err) return res.json({code:500,message:err.message});
                                onlineQuery.agentId = {$in:agents};
                                callQuery.$or = [{serviceId:{$in:service}},{idCampain:{$in:campaign}},{agentId:{$in:agents}}];
                                _async.parallel({
                                    onlineTime: function (callback) {
                                        _AgentStatusLog.aggregate([{
                                            $match:onlineQuery
                                        },{
                                            $project: {
                                                startTime: {$add: [{$multiply: [{$hour: {$add: ['$startTime', 7 * 60 * 60 * 1000]}}, 60, 60, 1000]}, {$multiply: [{$minute: {$add: ['$startTime', 7 * 60 * 60 * 1000]}}, 60, 1000]}, {$multiply: [{$second: {$add: ['$startTime', 7 * 60 * 60 * 1000]}}, 1000]}, {$millisecond: {$add: ['$startTime', 7 * 60 * 60 * 1000]}}]},
                                                endTime: {$add: [{$multiply: [{$hour: {$add: ['$endTime', 7 * 60 * 60 * 1000]}}, 60, 60, 1000]}, {$multiply: [{$minute: {$add: ['$endTime', 7 * 60 * 60 * 1000]}}, 60, 1000]}, {$multiply: [{$second: {$add: ['$endTime', 7 * 60 * 60 * 1000]}}, 1000]}, {$millisecond: {$add: ['$endTime', 7 * 60 * 60 * 1000]}}, 7 * 60 * 60 * 1000]}
                                            }
                                        },
                                            {$group: timeSeriesGrouping(getTimeSeries())}
                                        ], function(err,r){
                                            var emptyObj = {};
                                            _.each(_.range(24), function(o){
                                                emptyObj[o] = 0;
                                            })
                                            callback(err, r.length? r[0]:emptyObj)
                                        })
                                    },
                                    call: function (callback) {
                                        _CdrTransInfo.aggregate([
                                            {
                                                $match:callQuery
                                            },
                                            {
                                                $group: {
                                                    _id: {callId: '$callId', hour: {$hour: {$add: [new Date(7 * 60 * 60 * 1000), '$startTime']}}},
                                                    type: {$sum: {$cond: [{$or: [{$eq: ['$transType', 1]}, {$eq: ['$transType', 7]}, {$eq: ['$transType', 8]}]}, 0, 1]}},
                                                    callInDuration: {$sum: {$cond: [{$and: [{$eq: ['$serviceType', 3]}, {$or: [{$eq: ['$transType', 1]}, {$eq: ['$transType', 7]}, {$eq: ['$transType', 8]}]}]}, {$add: ['$waitDuration', '$callDuration']}, null]}},
                                                    callOutDuration: {$sum: {$cond: [{$and: [{$eq: ['$serviceType', 3]}, {$eq: ['$transType', 6]}]}, {$add: ['$waitDuration', '$callDuration']}, null]}},
                                                    agent: {$addToSet: '$agentId'}
                                                }
                                            },
                                            {
                                                $group: {
                                                    _id: '$_id.hour',
                                                    total: {$sum: 1},
                                                    callIn: {$sum: {$cond: [{$eq: ['$type', 0]}, 1, 0]}},
                                                    callOut: {$sum: {$cond: [{$eq: ['$type', 0]}, 0, 1]}},
                                                    missedCallIn: {$sum: {$cond: [{$eq: ['$type', 0]}, {$cond: [{$gt: ['$callInDuration', 0]}, 0, 1]}, 0]}},
                                                    missedCallOut: {$sum: {$cond: [{$eq: ['$type', 0]}, 0, {$cond: [{$gt: ['$callOutDuration', 0]}, 0, 1]}]}},
                                                    callInDuration: {$sum: '$callInDuration'},
                                                    callOutDuration: {$sum: '$callOutDuration'},
                                                    agent: {$push: '$agent'}
                                                }
                                            },
                                            {$unwind:'$agent'},
                                            {$unwind:'$agent'},
                                            {
                                                $group: {
                                                    _id: '$_id',
                                                    total: {$first:'$total'},
                                                    callIn: {$first:'$callIn'},
                                                    callOut: {$first:'$callOut'},
                                                    missedCallIn: {$first:'$missedCallIn'},
                                                    missedCallOut: {$first:'$missedCallOut'},
                                                    callInDuration: {$first:'$callInDuration'},
                                                    callOutDuration: {$first:'$callOutDuration'},
                                                    agent: {$addToSet: '$agent'}
                                                }
                                            }
                                        ], function(err,r){
                                            var obj = {};
                                            _.each(_.range(24), function(o){
                                                obj[o] = _.findWhere(r, {_id: o})?_.findWhere(r, {_id: o}):{total:0,callIn:0,callOut:0,missedCallIn:0,missedCallOut:0,callInDuration:0,callOutDuration:0,avgCallInDuration:0,avgCallOutDuration:0,agent:[]};
                                                obj[o].agent = obj[o].agent.length;
                                                delete obj[o]._id
                                            });
                                           callback(err,obj);
                                        })
                                    }
                                }, function(err,result){
                                    _.log(callQuery,onlineQuery)
                                    var result2 = {};
                                    _.each(_.range(24), function(o){
                                        result2[o] = _.extend({onlineTime:result.onlineTime[o]},result.call[o]);
                                    });
                                    var total = {};
                                    _.each(_.keys(result2['0']), function(o){
                                        total[o] = 0;
                                    });
                                    _.each(_.range(24), function(o){
                                        _.each(_.keys(total), function(o2){
                                            total[o2] += result2[o][o2];
                                        })
                                    });
                                    res.json({code:200,data:result2,total:total})
                                })
                            })
                        })
                    })
                })
            });
        })
    },
    html: function (req, res) {
        if (req.session.auth.company) {
            if (!req.session.auth.company.leader) {
                _.render(req, res, view, {
                    title: title,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    company: []
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }
        _Company.find(req.session.auth.company ? {
            _id: req.session.auth.company,
            status: 1
        } : {status: 1}, function (err, r) {
            _.render(req, res, view, {
                title: title,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: r
            }, true, err);
        });
    }
};
function timeSeriesGrouping(array) {
    var obj = {};
    obj._id = null;
    _.each(_.range(24), function (o) {
        obj[o] = {
            $sum: {
                $cond: [{$or: [{$lte: ['$endTime', array[o].start]}, {$gte: ['$startTime', array[o].end]}]},
                    0,
                    {
                        $cond: [{$lte: ['$startTime', array[o].start]},
                            {
                                $cond: [{$lte: ['$endTime', array[o].end]},
                                    {$subtract: ['$endTime', array[o.start]]},
                                    3600000]
                            },
                            {
                                $cond: [{$lte: ['$endTime', array[o].end]},
                                    {$subtract: ['$endTime', '$startTime']},
                                    {$subtract: [array[o].end, '$startTime']}]
                            }]
                    }]
            }
        }
    });
    return obj;
}
function getTimeSeries() {
    var obj = {};
    _.each(_.range(24), function (o) {
        obj[o] = {start: o * 3600000, end: (o + 1) * 3600000}
    });
    return obj;
}