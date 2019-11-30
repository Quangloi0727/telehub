/**
 * Created by NghiaTM on 6/24/2016.
 */

exports.index={
    json:function(req, res){
        var unit='week';
        var unitGroup= {week: { $week: {$add:["$created", 7*60*60*1000]}}, year:{$year: {$add:["$created", 7*60*60*1000]}}};
        var dateQuery = {};
        if(req.query.startDate||req.query.endDate){
            dateQuery.created = {}
            if (req.query.startDate) {
                dateQuery.created.$gte = moment(req.query.startDate, "DD/MM/YYYY").startOf(unit)._d;
            }
            if (req.query.endDate) {
                dateQuery.created.$lte =  moment(req.query.endDate, "DD/MM/YYYY").endOf(unit)._d;
            }
        }
        //if(!req.query.channelId){
        //    return res.json({code: 500});
        //}
        var channelQuery = {};
        _async.waterfall([function(cb){
            _CompanyChannel.distinct('_id', req.query.idCompany ? {idCompany: _.convertObjectId(req.query.idCompany)} : {}, function (err, r) {
                if (req.query.channelId) channelQuery = {
                    idChannel: {
                        $in: _.arrayObjectId(req.query.channelId)
                    }
                };
                else channelQuery = {idChannel: {$in: r}};
                _ServicesChat.distinct("_id", channelQuery, function(err,r2){
                    _TicketsChat.distinct('threadId',{idService:{$in:r2},status:{$ne:-1}}, function(err,r3){
                        cb(err, r3)
                    })
                })
            });
        }], function(err,a){
            var agg = [
                {$match:{status:0,_id:{$in:a}}},
                {$match: dateQuery},
                {$unwind: {path: "$agentMessage", preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id:"$_id",
                        created: {$max:"$created"},
                        agentReplyCount:{$sum:{$cond:[{$gt:['$agentMessage.send',0]},1,0]}}
                    }
                },
                {
                    $lookup: {from: "ticketchats", localField: "_id", foreignField: "threadId", as: "ticket"}
                },
                {
                    $unwind: "$ticket",
                },
                {$match: {'ticket.status':{$ne:-1}}},
                {
                    $group: {
                        _id: unitGroup,
                        answer: {
                            $sum: {
                                $cond: [{$gt: ["$agentReplyCount", 0]},1,0]
                            }
                        },
                        receive: {$sum: 1},
                        progressing: {$sum:{$cond:[{$eq:["$ticket.status",1]},1,0]}},
                        waiting: {$sum:{$cond:[{$eq:["$ticket.status",0]},1,0]}},
                        finish:{$sum:{$cond:[{$eq:["$ticket.status",2]},1,0]}}
                    }
                },
                {$sort: {'_id.year': 1,'_id.week': 1}}
            ]
            if(err) return res.json({code: 500, data: err.message});
            _ChatThread.aggregate(agg).allowDiskUse(true).exec(function (err, result) {
                res.json({code: (err) ? 500 : 200, data: result});
            })
        })
    },
    html:function(req, res){
        var companyIds = [];
        if (req.session.auth.company) {
            companyIds.push(new mongoose.Types.ObjectId(req.session.auth.company._id))
            if (!req.session.auth.company.leader) {


                _.render(req, res, 'report-chat-by-week', {
                    title: "Báo cáo theo tuần",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']]

                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }
        //log.debug(req.session);
        _async.waterfall([
            function (next) {
                _Company.find( req.session.auth.company ? {_id: req.session.auth.company} : {}, function (err, com) {
                    next(err, com);
                });
            }
        ], function (err, com) {
            return _.render(req, res, 'report-chat-by-week', {
                title: "Báo cáo theo tuần",
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: com
            }, true, err);
        })
    }
}