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
            var companyId = _.convertObjectId(req.query.idCompany)||req.session.auth.company._id;
            _CompanyChannel.find(companyId?{idCompany: companyId, status: 1}:{status:1}, function (err, channels) {
                _ServicesChat.distinct("_id", {idChannel: req.query.idChannel ? _.convertObjectId(req.query.idChannel):{$in:channels}}, function(err,r2){
                    _TicketsChat.distinct('threadId',{idService:{$in:r2},status:{$ne:-1}}, function(err,r3){
                        var threadQuery = {}; //tính tất cả các cuộc chat đã nhận (status = 0, 1)
                        threadQuery['_id'] = {$in: r3};
                        if (_.has(req.query, 'startTime') && _.has(req.query, 'endTime')){
                            threadQuery['created'] = {
                                $gte: _moment(req.query['startTime'], 'DD/MM/YYYY').startOf('day')._d,
                                $lte: _moment(req.query['endTime'], 'DD/MM/YYYY').endOf('day')._d
                            }
                        }
                        else{
                            if (_.has(req.query, 'startTime')){
                                threadQuery['created'] = {
                                    $gte: _moment(req.query['startTime'], 'DD/MM/YYYY').startOf('day')._d,
                                }
                            }
                            if (_.has(req.query, 'endTime')){
                                threadQuery['created'] = {
                                    $lte: _moment(req.query['endTime'], 'DD/MM/YYYY').endOf('day')._d
                                }
                            }
                        }

                        var agg = [
                            {$match: threadQuery},
                            {$unwind:{path:"$agentMessage",preserveNullAndEmptyArrays:true}},
                            {$group:{
                                _id:"$_id",
                                message1:{$sum:"$agentMessage.send"},
                                message2:{$sum:"$agentMessage.receive"}
                            }},
                            {$project:{
                                _id:1,
                                message:{$add:['$message1','$message2']}
                            }},
                            {$group:{
                                _id:null,
                                count:{$sum:1},
                                message:{$sum:"$message"},
                                avgMessage:{$avg:"$message"}
                            }}
                        ];
                        _ChatThread.aggregate(agg, function (error, threads) {
                            res.json({code: _.isNull(error) ? 200 : 500, data: threads.length?threads[0]:{}});
                        });
                    });
                });
            });
        }
    },
    html: function (req, res) {
        var companyIds = [];
        if (req.session.auth.company) {
            companyIds.push(new mongoose.Types.ObjectId(req.session.auth.company._id))
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-message-chat', {
                    title: "Báo cáo số lượng tin nhắn chat",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    company: [],
                    users: []
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }

        _async.parallel({
            getCompany: function(next){
                _Company.find( req.session.auth.company ? {_id: req.session.auth.company, status: 1} : {status: 1}, next);
            }
        }, function(err, resp){
            if (!err){
                return _.render(req, res, 'report-message-chat', {
                    title: "Báo cáo số lượng tin nhắn chat",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    company: resp.getCompany
                }, true, err);
            }
        });
    }
}
