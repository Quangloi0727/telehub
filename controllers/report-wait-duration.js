var title = 'Báo cáo gọi vào - Báo cáo thời gian chờ';
var view = 'report-wait-duration';
exports.index = {
    json: function (req, res) {
    },
    html: function (req, res) {
        var comQuery = {};
        var total = {};
        var result1 = [];
        var listDate = [];
        if (req.session.auth.company) {
            comQuery._id = _.convertObjectId(req.session.auth.company._id);
            if (!req.session.auth.company.leader) {
                _.render(req, res, view, {
                    title: title,
                    plugins: [['bootstrap-select'], 'export-excel', ['chosen']],
                    result: [],
                    campaign: [],
                    total: 0,
                    type: type
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }

        var query = {};
        if (req.query.startDate || req.query.endDate) {
            query.startTime = {};
            if (req.query.startDate) {
                query.startTime.$gte = moment(req.query.startDate, 'DD/MM/YYYY').valueOf();
            }
            if (req.query.endDate) {
                query.startTime.$lte = moment(req.query.endDate, 'DD/MM/YYYY').endOf('day').valueOf();
            }
        }
        ;
        _.isEmpty(req.query) ? (_.render(req, res, view, {
            title: title,
            result1: [],
            result2: [],
            plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
        }, true, null)) :
            (_async.waterfall([
                    function (cb) {
                        _Company.find(comQuery, cb)
                    }, function (a, cb) {
                        _async.parallel({
                            result1: function (next) {
                                var start = 0;
                                var end = 0;
                                _async.waterfall([
                                    function (next) {
                                        if (req.query.startDate) {
                                            next(null, moment(req.query.startDate, 'DD/MM/YYYY').valueOf())
                                        } else {
                                            _CdrTransInfo.findOne({transType: 1}, {}, {sort: {startTime: 1}}, function (err, r) {
                                                if (r) {
                                                    start = r.startTime;
                                                } else {
                                                    start = moment().startOf('month').valueOf();
                                                }
                                                next(err);
                                            })
                                        }
                                    },
                                    function (next) {
                                        if (req.query.endDate) {
                                            end = moment(req.query.endDate, 'DD/MM/YYYY').valueOf();
                                            next(null)
                                        } else {
                                            end = moment().valueOf();
                                            next(null);
                                        }
                                    }
                                ], function (err) {
                                    if (err) return cb(err);
                                    var aggregate = [];
                                    var type = 'day';
                                    if(req.query.type){
                                        switch (req.query.type) {
                                            case "1":
                                                type = "week";
                                                break;
                                            case "2":
                                                type = "month";
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    listDate = getDateList(start, end, type);
                                    aggregate.push({
                                        $group: {
                                            _id: null,
                                            missedWaitingTime: {$sum: {$cond: [{$gt: ["$callDuration", 0]}, 0, "$waitDuration"]}},
                                            connectedWaitingTime: {$sum: {$cond: [{$gt: ["$callDuration", 0]}, "$waitDuration", 0]}}
                                        }
                                    });
                                    getCompanyResult(aggregate, a, listDate, type, function (data) {
                                        next(null, data)
                                    })
                                })
                            }, result2: function (next) {
                                var data = [];
                                _async.each(a, function(item, cb2){
                                    _Services.distinct("_id", {idCompany:item}, function(err,service){
                                        var aggregate = [];
                                        query.transType = 1;
                                        query.serviceId = {$in:service};
                                        aggregate.push({$match: query});
                                        aggregate.push({
                                            $group: {
                                                _id: "$callId",
                                                startTime:{$min:"$startTime"},
                                                missedWaitingTime: {$sum: {$cond: [{$gt: ["$callDuration", 0]}, 0, "$waitDuration"]}},
                                                connectedWaitingTime: {$sum: {$cond: [{$gt: ["$callDuration", 0]}, "$waitDuration", 0]}}
                                            }
                                        });
                                        aggregate.push({
                                            $group: {
                                                _id: {$hour: {$add: [new Date(7 * 60 * 60 * 1000), '$startTime']}},
                                                missedWaitingTime: {$sum: "$missedWaitingTime"},
                                                connectedWaitingTime: {$sum: '$connectedWaitingTime'}
                                            }
                                        });
                                        aggregate = aggTimeBlock(aggregate);
                                        _CdrTransInfo.aggregate(aggregate, function(err,r){
                                            data.push({company:item.name, data: r.length?r[0]:emptyObj()});
                                            cb2(err)
                                        })
                                    })
                                },function(err){
                                    next(err,data);
                                })
                            }
                        }, function (err, result) {
                            cb(err, result)
                        });
                    }], function (err, results) {
                    _.render(req, res, view, {
                        title: title,
                        result1: results.result1,
                        result2: results.result2,
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                    }, true, err)
                })
            )
    }
}
function emptyObj() {
    var obj = {};
    _.each(_.range(24), function (o) {
        obj[o] = {
            missedWaitingTime: 0,
            connectedWaitingTime: 0
        }
    });
    return obj;
}
function aggTimeBlock(agg) {
    var obj = {_id: null};
    var obj2 = {_id: 0};
    _.each(_.range(24), function (o) {
        obj['missedWaitingTime' + o] = {$sum: {$cond: [{$eq: ["$_id", o]}, "$missedWaitingTime", 0]}};
        obj['connectedWaitingTime' + o] = {$sum: {$cond: [{$eq: ["$_id", o]}, "$connectedWaitingTime", 0]}};
        obj2[o] = {
            missedWaitingTime: "$missedWaitingTime" + o,
            connectedWaitingTime: "$connectedWaitingTime" + o
        }
    });
    agg.push({$group: obj});
    agg.push({$project: obj2});
    return agg;
}
function getDateList(start, end, type) {
    var listDate = [];
    var listObject = [];
    listDate.push(start);
    for (var m = moment(start).add(1, type); m.isBefore(moment(end).startOf(type)); m.add(1, type)) {
        listDate.push(m.startOf(type).valueOf());
    }
    listDate.push(moment(end).startOf(type).valueOf());
    for (var i= 0;i<listDate.length;i++){
        listObject.push({$gte:listDate[i],$lte:moment(listDate[i]).endOf(type).valueOf()})
    }
    return listObject;
}
function getCompanyResult(agg, com, list, type, callback) {
    var data = [];
    _async.each(com, function(item, cb){
        getDateResult(item, list, agg, type, function(resp){
            data.push(resp);
            cb()
        });
    }, function(err){
        callback(data);
    });

}
function getDateResult(company, list, agg, type, callback) {
    var data = {company: company.name, data: []};
    switch (type){
        case "day":
            type = "DD/MM/YYYY";
            break;
        case 'week':
            type = 'ww/YYYY';
            break;
        case 'month':
            type = "MM/YYYY";
            break;
    }
    _Services.distinct("_id", {idCompany: company._id}, function (err, r) {
        _async.eachSeries(list, function (item, cb) {
            if (err) callback(err, null);
            var query = {};
            query.startTime = item;
            query.serviceId = {$in: r};
            var aggregate = _.union([{$match: query}], agg);
            _CdrTransInfo.aggregate(aggregate, function (err, r) {
                data.data.push({date: moment(item.$gte).format(type), data: r.length ? _.omit(r[0],'_id') : {missedWaitingTime: 0, connectedWaitingTime: 0}})
                cb();
            })
        }, function (err) {
            callback(data);
        })
    })
}
