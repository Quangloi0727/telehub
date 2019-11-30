/**
 * Created by Đại Đồng on 12/05/2016.
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
        var listMonth = [];
        var cond = {};
        cond.$or = [];
        var startDate = req.query.startDate ? moment(req.query.startDate, 'DD/MM/YYYY').startOf('day'):moment().startOf('day');
        var endDate = req.query.endDate ? moment(req.query.endDate, 'DD/MM/YYYY').endOf('day'):moment().endOf('day');
        var comQuery = {};
        var agentQuery = {};
        agentQuery.$or = [];
        var total = {totalCall:0,totalDuration: 0, avgDuration: 0, connected: 0, waitDuration: 0, callDuration: 0, avgCallDuration: 0, total: 0,done: 0};
        if (req.session.auth.company) {
            comQuery._id = _.convertObjectId(req.session.auth.company._id);
            agentQuery.$or.push({'companyLeaders.company': {$in: [_.convertObjectId(req.session.auth.company._id)]}});
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-outbound-by-time', {
                    title: 'Báo cáo gọi ra - Báo cáo theo thời gian',
                    result: [],
                    company: [],
                    agent: [],
                    total: total,
                    sDate: false,
                    eDate: false,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                }, true, new Error("Không đủ quyền truy cập"))
                return;
            }
        }
        _async.parallel({
                com: function (cb) {
                    _Company.find(comQuery, function (err, r) {
                        cb(err, r)
                    });
                }, agent: function (cb) {
                    _async.waterfall([
                        function (callback) {
                            _Company.distinct("_id", comQuery, callback);
                        },
                        function (a, callback) {
                            _AgentGroups.distinct("_id", {idParent: {$in: a}}, function (err, result) {
                                if (err) return callback(err, null);
                                agentQuery.$or.push({'agentGroupLeaders.group': {$in: result}}, {'agentGroupMembers.group': {$in: result}});
                                _Users.find(agentQuery, callback);
                            });
                        }
                    ], cb);
                }
            }, function (err, result) {
                _.isEmpty(req.query) ? (_.render(req, res, 'report-outbound-by-time', {
                    title: 'Báo cáo gọi ra - Báo cáo theo thời gian',
                    result: [],
                    company: result.com,
                    agent: result.agent,
                    total: total,
                    sDate: false,
                    eDate: false,
                    listMonth:listMonth,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                }, true, err)) :
                    (_async.waterfall([function (cb) {
                            if (req.query.startDate) {
                                cb()
                            } else {
                                _CdrTransInfo.findOne().sort({startTime: 1}).exec(function (err, r) {
                                    if (r) startDate = moment(r.startTime);
                                    cb(err)
                                })
                            }
                        },
                            function (cb) {
                                if (req.query.idCompany) comQuery._id = _.convertObjectId(req.query.idCompany);
                                _Company.distinct("_id", comQuery, function (err, r) {
                                    _Campains.distinct("_id", {idCompany: {$in: r}},cb);
                                })
                            }, function (a,cb) {
                                var aggregate = [];
                                var transQuery = {transType:6, serviceType:3,idCampain : {$in:a},startTime : {$gte:startDate.valueOf(),$lte:endDate.valueOf()}};
                                var ticketQuery = {idCampain : {$in:a},status : {$ne:-1},created : {$gte:startDate._d,$lte:endDate._d}};
                                if (_.has(req.query, 'agentId')) {
                                    transQuery.agentId = {$in: _.arrayObjectId(req.query.agentId)};
                                    ticketQuery.idAgent = {$in: _.arrayObjectId(req.query.agentId)};
                                }
                                aggregate.push({$match: transQuery});
                                aggregate.push({
                                    $group: {
                                        _id: {
                                            month: {$month: {$add: [new Date(7 * 60 * 60 * 1000), "$startTime"]}},
                                            year: {$year: {$add: [new Date(7 * 60 * 60 * 1000), "$startTime"]}}
                                        },
                                        totalCall: {$sum: 1},
                                        totalDuration: {$sum: {$cond: [{$ne: ["$answerTime", null]}, {$subtract: ['$endTime', '$ringTime']}, 0]}},
                                        avgDuration: {$avg: {$cond: [{$ne: ["$answerTime", null]}, {$subtract: ['$endTime', '$ringTime']}, 0]}},
                                        connected: {$sum: {$cond: [{$ne: ["$answerTime", null]}, 1, 0]}},
                                        waitDuration: {$sum: {$cond: [{$ne: ["$answerTime", null]}, "$waitDuration", 0]}},
                                        callDuration: {$sum: {$cond: [{$ne: ["$answerTime", null]}, "$callDuration", 0]}},
                                        avgCallDuration: {$avg: {$cond: [{$ne: ["$answerTime", null]}, "$callDuration", null]}}
                                    }
                                });
                                _CdrTransInfo.aggregate(aggregate, function(err,r){
                                    if(err) return cb(err);
                                    _Tickets.aggregate([
                                        {$match:ticketQuery},
                                        {$group:{
                                            _id: {
                                                month: {$month: {$add: [7 * 60 * 60 * 1000, "$created"]}},
                                                year: {$year: {$add: [7 * 60 * 60 * 1000, "$created"]}}
                                            },
                                            total:{$sum:1},
                                            done:{$sum:{$cond:[{$eq:['$status',2]},1,0]}}
                                        }}
                                    ], function(err,r2){
                                        var result = {};
                                        _.each(r, function(o){
                                            o._id = o._id.month + '/' + o._id.year;
                                        });
                                        _.each(r2, function(o){
                                            o._id = o._id.month + '/' + o._id.year;
                                        });
                                        for(var i = startDate.startOf('month'); i < endDate.endOf('month'); i.add(1,'month')){
                                            listMonth.push(i.format('M/YYYY'));
                                        }
                                        _.each(listMonth, function(o){
                                            var obj = _.findWhere(r, {_id:o}) ? _.omit(_.findWhere(r, {_id:o}),'_id') : {totalCall:0,totalDuration:0,avgDuration:0,connected:0,waitDuration:0,callDuration:0,avgCallDuration:0};
                                            var obj2 = _.findWhere(r2, {_id:o}) ? _.omit(_.findWhere(r2, {_id:o}),'_id') : {total:0,done:0};
                                            result[o] = _.extend(obj, obj2);
                                        });
                                        cb(err,result);
                                    })
                                })
                            }, function (a, cb) {
                                if(!_.isEmpty(a)){
                                    _.each(_.keys(total), function(o){
                                        _.each(listMonth, function(o2){
                                            total[o] += a[o2][o];
                                        })
                                    })
                                }
                                cb(null, a);
                            }], function (err, results) {
                            _.render(req, res, 'report-outbound-by-time', {
                                title: 'Báo cáo gọi ra - Báo cáo theo thời gian',
                                result: results,
                                company: result.com,
                                agent: result.agent,
                                total: total,
                                listMonth:listMonth,
                                sDate: startDate.format('DD/MM/YYYY'),
                                eDate: endDate.format('DD/MM/YYYY'),
                                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                            }, true, err)
                        })
                    )
            }
        );
    }
};