/**
 * Created by NghiaTM on 5/15/2016.
 */

exports.index = {
    json: function (req, res) {
        var ticketFilter = {};
        var callFilter = {};
        if (req.query.startDate || req.query.endDate) ticketFilter.created = {}, callFilter.startTime = {};
        if (req.query.startDate) {
            ticketFilter.created.$gte = moment(req.query.startDate, "DD/MM/YYYY").startOf('days')._d;
            callFilter.startTime.$gte = moment(req.query.startDate, "DD/MM/YYYY").startOf('days').valueOf();
        }
        if (req.query.endDate) {
            ticketFilter.created.$lte = moment(req.query.endDate, "DD/MM/YYYY").endOf('days')._d;
            callFilter.startTime.$lte = moment(req.query.endDate, "DD/MM/YYYY").endOf('days').valueOf();
        }
        var query = [];
        var campaign = {};
        var service = {};
        ;
        _async.waterfall([function (next) {
            if (req.session.auth.company) {
                if (!req.session.auth.company.leader) {
                    return res.json({code: 500});
                } else {
                    _Campains.distinct("_id", {idCompany: req.session.auth.company._id}, function (err, r) {
                        if (err) return res.json({code: 500, message: err.message});
                        campaign = {$in: r};
                        _Services.distinct("_id", {idCompany: req.session.auth.company._id}, function (err, r) {
                            if (err) return res.json({code: 500, message: err.message});
                            service = {$in: r};
                            next()
                        })
                    })
                }
            } else {
                next();
            }
        }, function (next) {
            if (req.query.companies) {
                query = _.map(req.query.companies, function (o) {
                    return _.convertObjectId(o)
                });
                _Campains.distinct("_id", {idCompany: {$in: query}}, function (err, r) {
                    if (err) return res.json({code: 500, message: err.message});
                    campaign = {$in: r};
                    _Services.distinct("_id", {idCompany: {$in: query}}, function (err, r) {
                        if (err) return res.json({code: 500, message: err.message});
                        service = {$in: r};
                        next()
                    })
                })
            } else {
                _Campains.distinct("_id", {}, function (err, r) {
                    if (err) return res.json({code: 500, message: err.message});
                    campaign = {$in: r};
                    _Services.distinct("_id", {}, function (err, r) {
                        if (err) return res.json({code: 500, message: err.message});
                        service = {$in: r};
                        next()
                    });
                });
            }
        },
            function (next) {
                _async.parallel({
                    ticketsOut: function (end) {
                        var ticketFilter2 = _.extend({idCampain: campaign}, ticketFilter);
                        _Tickets.count(ticketFilter2, function (err, r2) {
                            end(err, r2)
                        })
                    }
                    ,
                    callsOut: function (end) {
                        //call goi ra
                        var callFilter2 = _.extend({idCampain: campaign, transType:6, serviceType:3}, callFilter);
                        _CdrTransInfo.count(callFilter2).exec(function (err, r) {
                            end(err, r)
                        })
                    }
                    ,
                    pickedOutCalls: function (end) {
                        var callFilter3 = _.extend({
                            transType:6,
                            serviceType: 3,
                            callDuration: {$gt: 0},
                            idCampain: campaign
                        }, callFilter);
                        _CdrTransInfo.count(callFilter3).exec(function (err, r) {
                            end(err, r)
                        })
                    }
                    ,
                    ticketsIn: function (end) {
                        var ticketFilter3 = _.extend({idService: service}, ticketFilter);
                        _Tickets.count(ticketFilter3, function (err, r2) {
                            end(err, r2)
                        });
                    }
                    ,
                    callsIn: function (end) {
                        var callFilter4 = _.extend({transType:1,serviceType: 3,serviceId: service}, callFilter);
                        _CdrTransInfo.count(callFilter4).exec(function (err, r) {
                            end(err, r)
                        })
                    }
                    ,
                    pickedInCalls: function (end) {
                        var callFilter5 = _.extend({transType:1,serviceType: 3, callDuration: {$gte: 0},serviceId: service}, callFilter);
                        _CdrTransInfo.count(callFilter5).exec(function (err, r) {
                            end(err, r)
                        })
                    },
                    missInCalls: function (end) {
                        var callFilter6 = _.extend({transType:1,serviceType: 3,serviceId: service, callDuration:null}, callFilter);
                        //var aggregate = [];
                        //aggregate.push({$match: callFilter6});
                        //aggregate.push({
                        //    $group: {
                        //        _id: "$callId",
                        //        status: {$max: "$callDuration"}
                        //    }
                        //});
                        //aggregate.push({$match: {status: null}});
                        //aggregate.push({$group: {_id: 0, sum: {$sum: 1}}});
                        _CdrTransInfo.count(callFilter6).exec(function (err, r) {
                            //console.log(err, r)
                            //if (r.length)end(err, r[0].sum);
                            //else end(err, 0);
                            end(err,r)
                        })
                    }
                }, function (pError, pResult) {
                    next(pError, pResult);
                });
            }
        ], function (error, result) {
            res.json({code: (error) ? 500 : 200, datas: result});
        });

    },
    html: function (req, res) {
        var companyIds = {};
        if (req.session.auth.company) {
            companyIds._id = _.convertObjectId(req.session.auth.company._id);
        }
        _Company.find(companyIds, function (err, companies) {
            _.render(req, res, 'report-inout-general', {
                title: "Báo cáo tổng quát gọi vào - ra",
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                companies: companies
            }, true, err);
        });
    }
}