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
        _async.waterfall([
            function(cb){
                var id = req.query.idCompany||req.session.auth.company;
                _ServicesMail.distinct("_id",id ? {idCompany: id}:{}, function(err, r){
                    _MailCampaigns.distinct("_id", {setting: {$in:r}}, function (err, r2) {
                        _TicketsMail.distinct('mailId',{idService:{$in:r}, status:{$ne:-1}}, function(err,r3){
                            cb(err, [{service:{$in:r}},{campaign:{$in:r2}},{replyTo:{$in:r3}}])
                        })
                    });
                })
            }
        ], function(err, result){
            _Mail.aggregate([
                {$match: dateQuery},
                {$match: {$or: result}},
                {$group: {
                    _id: unitGroup,
                    send:{$sum:{$cond:[{$eq:['$mail_type',1]},1,0]}},
                    receive:{$sum:{$cond:[{$eq:['$mail_type',2]},1,0]}},
                    total:{$sum:1}
                }},
                {$sort: {'_id.year': 1,'_id.week': 1}}
            ]).allowDiskUse(true).exec(function(err, result){
                res.json({code: (err)?500:200, data: result});
            })
        })
    },
    html:function(req, res){
        var companyIds = [];
        if (req.session.auth.company) {
            companyIds.push(new mongoose.Types.ObjectId(req.session.auth.company._id))
            if (!req.session.auth.company.leader) {


                _.render(req, res, 'report-mail-by-week', {
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
            return _.render(req, res, 'report-mail-by-week', {
                title: "Báo cáo theo tuần",
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: com
            }, true, err);
        })
    }
}