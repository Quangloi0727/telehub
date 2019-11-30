/**
 * Created by Đại Đồng on 04/05/2016.
 */
exports.index = {
    json: function (req, res) {
        _Campains.find(req.query, function(err, r){
            res.status(200).json(r);
        });
    },
    html: function (req, res) {
        var result = [];
        var total = {reason: [], count: 0, called:0};
        var query = {};
        if (_.has(req.query, "startDate") || _.has(req.query, "endDate")) {
            query.created = {};
            if (_.has(req.query, "startDate")) {
                query.created.$gte = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day')._d;
            }
            ;
            if (_.has(req.query, "endDate")) {
                query.created.$lte = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day')._d
            }
            ;
        }
        if (_.has(req.query, "status")) {
            query.status = parseInt(req.query.status);
        }
        var campaignQuery = {};
        if (req.session.auth.company) {
            campaignQuery = {idCompany: req.session.auth.company._id};
        }
        _Campains.find(campaignQuery, function (err, cam) {
            _TicketReasonCategory.find({category:{$in:[0,2]}}, function (err, cat) {
                _Campains.find(_.has(req.query, 'idCampain') ? {_id : req.query.idCampain} : {}, function (err, cam2) {
                    _.isEmpty(req.query) ? (_.render(req, res, 'report-outbound-measure', {
                        title: 'Báo cáo chung - Báo cáo đo lường KH theo chiến dịch',
                        result: result,
                        campaign: cam,
                        total: total,
                        cat: cat,
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                    }, true, err)) :
                        (_async.each(cam2, function (item, callback) {
                                _async.waterfall([
                                    function (cb) {
                                        cb(null, item._id);
                                    },
                                    function (a, callb) {
                                        var newQuery = query;
                                        newQuery.idCampain = a;
                                        if (_.has(req.query, 'ticketReasonCategory')) {
                                            newQuery.ticketReasonCategory = _.convertObjectId(req.query.ticketReasonCategory);
                                        }else{
                                            newQuery.ticketReasonCategory = item.idCategoryReason;
                                        }
                                        _async.parallel({
                                            count: function (cb) {
                                                _Tickets.count(newQuery, function (err, r) {
                                                    _Tickets.count(newQuery, function(err, r2){
                                                        total.count += r;
                                                        cb(err, r)
                                                    })
                                                })
                                            },
                                            called: function(cb){
                                                var newQuery3 = JSON.parse(JSON.stringify(newQuery));
                                                newQuery3.status = {$ne:0};
                                                _Tickets.count(newQuery3, function(err, r){
                                                    total.called += r;
                                                    cb(err, r)
                                                })
                                            },
                                            reason: function (cb) {
                                                var result2 = [];
                                                _TicketReason.distinct("_id", {idCategory: newQuery.ticketReasonCategory}, function (err, r) {
                                                    _async.each(r, function (item2, cb) {
                                                        var newQuery2 = query;
                                                        newQuery2.idCampain = a;
                                                        newQuery2.ticketReason = item2;
                                                        _Tickets.count(newQuery2, function (err, r2) {
                                                            _TicketReason.findById(item2, function (err, r3) {
                                                                newQuery2.status = {$ne:0}
                                                                _Tickets.count(newQuery2, function (err, r4) {
                                                                    result2.push({name: r3.name, count: r2, called:r4})
                                                                    cb()
                                                                })
                                                            })
                                                        })
                                                    }, function (err) {
                                                        cb(null, result2);
                                                    })
                                                })
                                            },
                                            name: function (cb) {
                                                cb(null, item.name)
                                            }
                                        }, function (err, r) {
                                            result.push(r);
                                            callb();
                                        })
                                    }
                                ], function (err, r) {
                                    callback();
                                })
                            }, function (err) {
                                if (result.length > 0) {
                                    total.reason = [];
                                    _.each(_.pluck(result[0].reason,'name'), function(o){
                                        total.reason.push({name:o, count:0})
                                    })
                                    total.reason = _.sortBy(total.reason,'name');
                                }
                                _.each(result, function(o){
                                    o.reason = _.sortBy(o.reason,'name');
                                    _.each(o.reason, function(o2){
                                        _.each(total.reason, function(o3){
                                            if(o3.name == o2.name)
                                                o3.count += o2.count
                                        })
                                    })
                                })
                                _.render(req, res, 'report-outbound-measure', {
                                    title: 'Báo cáo chung - Báo cáo đo lường KH theo chiến dịch',
                                    cat: cat,
                                    result: result,
                                    total: total,
                                    campaign: cam,
                                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                                }, true, err);
                            })
                        );
                })
            })
        })
    }
}