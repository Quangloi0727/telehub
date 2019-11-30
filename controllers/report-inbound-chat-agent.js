/**
 * Created by sonth on 6/23/2016.
 */

exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'queryChannel')) {
            if (_.has(req.query, 'idCompany')){
                _CompanyChannel.find({idCompany: _.convertObjectId(req.query.idCompany), status: 1}, function (err, channels) {
                    res.json({code: err ? 500 : 200, channels: channels});
                });
            }
            else{
                res.status(404).json({});
            }
        }
        else {
            _async.waterfall([
                function(cb){
                    var id = _.convertObjectId(req.query.idCompany) || req.session.auth.company
                    _Company.find(id ?{_id: id}:{}, function (err, com) {
                        _CompanyChannel.distinct("_id", {idCompany:{$in:com}}, function (err, r) {
                            _ServicesChat.distinct("_id", {idChannel:req.query.channelId?_.convertObjectId(req.query.channelId):{$in:r}}, function(err,r2){
                                _TicketsChat.distinct('threadId',{idService:{$in:r2},status:{$ne:-1}}, function(err,r3){
                                    cb(err, r3)
                                })
                            })
                        });
                    });
                }
            ], function(err, resp){
                var threadQuery = {_id:{$in:resp}, status:0};
                if(req.query.agents){
                    threadQuery.agentId = {$in: _.arrayObjectId(req.query.agents)};
                };
                if (_.has(req.query, 'startTime') && _.has(req.query, 'endTime')){
                    threadQuery['created'] = {
                        $gte: _moment(req.query['startTime'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d,
                        $lte: _moment(req.query['endTime'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                    }
                }
                else{
                    if (_.has(req.query, 'startTime')){
                        threadQuery['created'] = {
                            $gte: _moment(req.query['startTime'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d
                        }
                    }
                    if (_.has(req.query, 'endTime')){
                        threadQuery['created'] = {
                            $lte: _moment(req.query['endTime'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                        }
                    }
                }
                //Todo: aggregate, nhóm threads + logs theo agent id
                var agg = [
                    {$match: threadQuery},
                    {$unwind: {path: '$agentMessage', preserveNullAndEmptyArrays: true}},
                    {$group: {
                        _id: '$agentMessage.id',
                        total:{$sum:1},
                        connected:{$sum:{$cond:[{$gt:['$agentMessage.send',0]},1,0]}},
                        missed:{$sum:{$cond:[{$gt:['$agentMessage.send',0]},0,1]}}
                    }},
                    {$lookup: {from: 'users', localField: "_id", foreignField: '_id', as: 'agent'}},
                    {$unwind: "$agent"}
                ];

                _ChatThread.aggregate(agg, function (error, users) {
                    res.json({code: _.isNull(error) ? 200 : 500, users: users});
                });
            });
        }
    },
    html: function (req, res) {
        var companyIds = [];
        if (req.session.auth.company) {
            companyIds.push(new mongoose.Types.ObjectId(req.session.auth.company._id))
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-inbound-chat-agent', {
                    title: "Báo cáo theo điện thoại viên",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    company: [],
                    users: []
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }

        _async.parallel({
            getUser: function(next){
                _Users.find({status: 1}, next);
            },
            getCompany: function(next){
                _Company.find( req.session.auth.company ? {_id: req.session.auth.company, status: 1} : {status: 1}, next);
            }
        }, function(err, resp){
            if (!err){
                return _.render(req, res, 'report-inbound-chat-agent', {
                    title: "Báo cáo theo điện thoại viên",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    users: resp.getUser,
                    company: resp.getCompany
                }, true, err);
            }
        });
    }
}
