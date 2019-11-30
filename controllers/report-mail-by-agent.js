/**
 * Created by sonth on 7/7/2016.
 */

exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'queryMail')) {
            _async.waterfall([
                function(cb){
                    var companyId = _.convertObjectId(req.query.idCompany)||req.session.auth.company;
                    _ServicesMail.distinct("_id", companyId ? {idCompany: companyId} : {}, function (err, r) {
                        _MailCampaigns.distinct("_id", {setting: {$in:r}}, function (err, r2) {
                            _TicketsMail.distinct('mailId',{idService:{$in:r}, status:{$ne:-1}}, function(err,r3){
                                cb(err, [{service:{$in:r}},{campaign:{$in:r2}},{replyTo:{$in:r3}}])
                            })
                        });
                    });
                }
            ], function(err, resp){
                var query = {$or:resp};
                if (_.has(req.query, 'agents')){
                    query.agent = {$in:_.arrayObjectId(req.query.agents)};
                }
                if (_.has(req.query, 'startTime') && _.has(req.query, 'endTime')){
                    query['created'] = {
                        $gte: _moment(req.query['startTime'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d,
                        $lte: _moment(req.query['endTime'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                    }
                }
                else{
                    if (_.has(req.query, 'startTime')){
                        query['created'] = {
                            $gte: _moment(req.query['startTime'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d
                        }
                    }
                    if (_.has(req.query, 'endTime')){
                        query['created'] = {
                            $lte: _moment(req.query['endTime'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                        }
                    }
                }
                //Todo: aggregate, nhóm threads + logs theo agent id
                var agg = [
                    {$match: query},
                    {$group: {
                        _id: '$agent',
                        total:{$sum:1},
                        send:{$sum:{$cond:[{$eq:['mail_type',1]},1,0]}},
                        receive:{$sum:{$cond:[{$eq:['mail_type',1]},0,1]}},
                    }},
                    {$lookup: {from: 'users', localField: "_id", foreignField: '_id', as: 'agent'}},
                    {$unwind: "$agent"}
                ];
                _Mail.aggregate(agg, function (error, users) {
                    res.json({code: _.isNull(err) ? 200 : 500, users: users});
                });
            });
        }
    },
    html: function (req, res) {
        var companyIds = [];
        if (req.session.auth.company) {
            companyIds.push(new mongoose.Types.ObjectId(req.session.auth.company._id))
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-mail-by-agent', {
                    title: "Báo cáo số lượng mail gửi, nhận theo agent",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    /*company: [],*/
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
                return _.render(req, res, 'report-mail-by-agent', {
                    title: "Báo cáo số lượng mail gửi, nhận theo agent",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    users: resp.getUser,
                    company: resp.getCompany
                }, true, err);
            }
        });
    }
}
