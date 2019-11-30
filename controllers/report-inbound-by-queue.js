/**
 * Created by hoangdv on 04/05/2016.
 */
exports.index = function (req, res) {
    var result1 = [];
    var total = {};
    var listMonth = [];
    var comQuery = {};
    var startDate = 0,
        endDate = 0;
    if (req.session.auth.company) {
        comQuery._id = _.convertObjectId(req.session.auth.company._id);
    }
    _async.waterfall([
        function (cb) {
            if (_.has(req.query, "startDate")) {
                startDate = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day').valueOf();
                cb();
            } else {
                _CdrTransInfo.findOne({}, {startTime: 1}, {sort: {startTime: 1}}, function (err, r) {
                    if (r) {
                        startDate = r.startTime;
                    } else {
                        startDate = _moment().startOf('month').valueOf();
                    }
                    cb();
                })
            }
        },
        function (cb) {
            if (_.has(req.query, "endDate")) {
                endDate = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day').valueOf();
                cb()
            } else {
                _CdrTransInfo.findOne({}, {endTime: 1}, {sort: {endTime: -1}}, function (err, r) {
                    if (r) {
                        endDate = r.endTime;
                    } else {
                        endDate = _moment().valueOf();
                    }
                    cb();
                })
            }
        }, function (cb) {
            listMonth.push(moment(startDate).format('DD/MM/YYYY'));
            for (var m = moment(endDate); moment(m.format("MM/YYYY"), "MM/YYYY").isAfter(moment(moment(startDate).format("MM/YYYY"), "MM/YYYY")); m.subtract(1, 'months')) {
                listMonth.push(m.format('DD/MM/YYYY'));
            }
            cb();
        }
    ], function (err) {
        _Company.find(comQuery, function (err, com) {
            _.isEmpty(req.query) ? (_.render(req, res, 'report-inbound-by-queue', {
                title: 'Báo cáo gọi vào - Báo cáo theo queue',
                result1: [],
                result2: [],
                result3: [],
                result4: [],
                company: com,
                total: total,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
            }, true, err)) : (_async.parallel({
                result1: function (cb) {
                    var company = _.has(req.query, 'idCompany') ? req.query.idCompany : _.pluck(com, "_id");
                    _async.each(company, function (item, callback) {
                        _async.parallel({
                            trans: function (cb) {
                                _Services.distinct("_id", {idCompany: _.convertObjectId(item)}, function (err, r) {
                                    var aggs = [];
                                    aggs.push({
                                        $match: {
                                            startTime: {
                                                $gte: startDate,
                                                $lte: endDate
                                            },
                                            serviceId: {$in: r},
                                            transType: {$in: [1,7]}
                                        }
                                    });
                                    aggs.push({
                                        $group: {
                                            _id: "$callId",
                                            agentAnswer: {$sum: {$cond: [ { $eq: [ "$serviceType", 3 ] }, "$answerTime", 0]}},
                                            totalDur: {$sum: "$callDuration"}
                                        }
                                    });
                                    aggs.push({
                                        $group: {
                                            _id: null,
                                            totalCall: {$sum:1},
                                            connected: {$sum: {$cond: [ {$gt: [ "$agentAnswer", 0 ]}, 1, 0]}},
                                            callDuration: {$sum: {$cond: [ {$gt: [ "$agentAnswer", 0 ]}, "$totalDur", 0]}},
                                            avgCallDuration: {$avg: {$cond: [ {$gt: [ "$agentAnswer", 0 ]}, "$totalDur", 0]}},
                                        }
                                    });
                                    _CdrTransInfo.aggregate(aggs, function (err, r) {
                                        if (_.has(r[0], '_id')) delete r[0]._id;
                                        cb(err, r.length > 0 ? r[0] : {
                                            connected: 0,
                                            callDuration: 0,
                                            avgCallDuration: 0,
                                            totalCall: 0
                                        });
                                    })
                                })
                            },
                            company: function (cb) {
                                _Company.findById(item, cb)
                            }
                        }, function (err, result) {
                            if (!_.isEmpty(result)) {
                                var items = JSON.parse(JSON.stringify(result.trans));
                                items.companyName = result.company.name;
                                result1.push(items);
                            }
                            callback();
                        })
                    }, function (err) {
                        cb(err, result1);
                    })
                },
                result2: function (cb) {
                    var companyId = [];
                    if (_.has(req.query, 'idCompany')) {
                        _.each(req.query.idCompany, function (o) {
                            companyId.push(_.convertObjectId(o));
                        })
                    } else {
                        companyId = _.pluck(com, "_id");
                    }
                    ;
                    _Services.distinct("_id", {idCompany: {$in: companyId}}, function (err, service) {
                        var query = {};
                        query.startTime = {
                            $gte: startDate,
                            $lte: endDate
                        };
                        query.transType = {$in: [1,7]};
                        query.serviceId={$in:service};
                        var aggregate = [];
                        aggregate.push({$match:query});
                        aggregate.push({
                            $group: {
                                _id: {_id: "$callId", month: { $month: {$add:[new Date(7*60*60*1000),"$startTime"]}}, year:{$year: {$add:[new Date(7*60*60*1000),"$startTime"]}}},
                                count: {$sum: 1},
                                agentAnswer: {$sum: {$cond: [ { $eq: [ "$serviceType", 3 ] }, "$answerTime", 0]}},
                                callDuration: {$sum: "$callDuration"},
                                avgCallDuration: {$avg: "$callDuration"}
                            }
                        });
                        aggregate.push({
                            $group: {
                                _id: {month: "$_id.month", year: "$_id.year"},
                                connected: {$sum: {$cond:[{$gt:["$agentAnswer",0]},1,0]}},
                                totalCall:{$sum: 1},
                                callDuration: {$sum: "$callDuration"},
                                avgCallDuration: {$avg: "$callDuration"}
                            }
                        });
                        aggregate.push({
                            $sort:{
                                '_id.year':1,
                                '_id.month':1
                            }
                        })
                        _CdrTransInfo.aggregate(aggregate, function (err, r) {
                            _.each(r, function (o) {
                                if (!_.isEmpty(o)) {
                                    _.each(_.keys(o), function (o2) {
                                        if (o2 != "date" && o2 != "_id" && o2 != "companyName") {
                                            total[o2] = 0;
                                        }
                                    });
                                }
                            });
                            _.each(r, function (o) {
                                _.each(_.keys(o), function (o2) {
                                    if (o2 != "date" && o2 != "_id" && o2 != "companyName" && o2 != 'avgCallDuration') {
                                        total[o2] += o[o2];
                                    }
                                })
                            })
                            if (_.has(total, 'avgCallDuration')) total.avgCallDuration = total.connected?total.callDuration/total.connected:0;
                            cb(err, r);
                        })
                    })
                },
                result3: function (cb) {
                    /* Dailyusage */
                    var companyId = [];
                    if (_.has(req.query, 'idCompany')) {
                        _.each(req.query.idCompany, function (o) {
                            companyId.push(_.convertObjectId(o));
                        })
                    } else {
                        companyId = _.pluck(com, "_id");
                    }
                    _Services.distinct("_id", {idCompany: {$in: companyId}}, function (err, service) {
                        var query = {};
                        query.startTime = {
                            $gte: startDate,
                            $lte: endDate
                        };
                        query.transType = {$in: [1,7]};
                        query.serviceId={$in:service};
                        var aggregate = [];
                        aggregate.push({$match:query});
                        aggregate.push({
                            $group: {
                                _id: {
                                    _id: "$callId",
                                    month: { $month: {$add:[new Date(7*60*60*1000),"$startTime"]}},
                                    year:{$year: {$add:[new Date(7*60*60*1000),"$startTime"]}},
                                    day: {$dayOfMonth : {$add: [new Date(7*60*60*1000),"$startTime"]}}
                                },
                                count: {$sum: 1},
                                agentAnswer: {$sum: {$cond: [ { $eq: [ "$serviceType", 3 ] }, "$answerTime", 0]}},
                                callDuration: {$sum: "$callDuration"},
                                avgCallDuration: {$avg: "$callDuration"}
                            }
                        });
                        aggregate.push({
                            $group: {
                                _id: {
                                    day: '$_id.day',
                                    month: "$_id.month",
                                    year: "$_id.year"
                                },
                                connected: {$sum: {$cond:[{$gt:["$agentAnswer",0]},1,0]}},
                                totalCall:{$sum: 1},
                                callDuration: {$sum: "$callDuration"},
                                avgCallDuration: {$avg: "$callDuration"}
                            }
                        });
                        aggregate.push({
                            $sort:{
                                '_id.year':1,
                                '_id.month':1,
                                '_id.day': 1
                            }
                        });
                        _CdrTransInfo.aggregate(aggregate, function (err, r) {
                            cb(err, r);
                        })
                    })
                },
                result4: function (cb) {
                    /* Hourusage */
                    var companyId = [];
                    if (_.has(req.query, 'idCompany')) {
                        _.each(req.query.idCompany, function (o) {
                            companyId.push(_.convertObjectId(o));
                        })
                    } else {
                        companyId = _.pluck(com, "_id");
                    }
                    _Services.distinct("_id", {idCompany: {$in: companyId}}, function (err, service) {
                        var query = {};
                        query.startTime = {
                            $gte: startDate,
                            $lte: endDate
                        };
                        query.transType = {$in: [1,7]};
                        query.serviceId={$in:service};
                        var aggregate = [];
                        aggregate.push({$match:query});
                        aggregate.push({
                            $group: {
                                _id: {
                                    _id: "$callId",
                                    month: {$month: {$add: [new Date(7 * 60 * 60 * 1000), "$startTime"]}},
                                    year: {$year: {$add: [new Date(7 * 60 * 60 * 1000), "$startTime"]}},
                                    day: {$dayOfMonth: {$add: [new Date(7 * 60 * 60 * 1000), "$startTime"]}},
                                    hour: {$hour: {$add: [new Date(7 * 60 * 60 * 1000), "$startTime"]}}
                                },
                                count: {$sum: 1},
                                agentAnswer: {$sum: {$cond: [ { $eq: [ "$serviceType", 3 ] }, "$answerTime", 0]}},
                                callDuration: {$sum: "$callDuration"},
                                avgCallDuration: {$avg: "$callDuration"}
                            }
                        });
                        aggregate.push({
                            $group: {
                                _id: {
                                    hour: '$_id.hour',
                                    day: '$_id.day',
                                    month: "$_id.month",
                                    year: "$_id.year"
                                },
                                connected: {$sum: {$cond:[{$gt:["$agentAnswer",0]},1,0]}},
                                totalCall:{$sum: 1},
                                callDuration: {$sum: "$callDuration"},
                                avgCallDuration: {$avg: "$callDuration"}
                            }
                        });
                        aggregate.push({
                            $sort: {
                                '_id.hour': 1
                            }
                        });
                        _CdrTransInfo.aggregate(aggregate, function (err, r) {
                            cb(err, r);
                        })
                    })
                }
            }, function (err, results) {
                _.render(req, res, 'report-inbound-by-queue', {
                    title: 'Báo cáo gọi vào - Báo cáo theo queue',
                    result1: result1,
                    result2: results.result2,
                    result3: results.result3, // Báo cáo theo ngày
                    result4: results.result4, // Báo cáo theo giờ
                    company: com,
                    total: total,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                }, true, err);
            }));
        })
    });
}