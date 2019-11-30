/**
 * Created by Đại Đồng on 28/04/2016.
 */
exports.index = {
    json: function (req, res) {
        _AgentGroups.distinct("_id", req.query, function (err, r) {
            _Users.find({$or:[{'agentGroupLeaders.group': {$in: r}}, {'agentGroupMembers.group': {$in: r}}, {'companyLeaders.company': {$in:[_.convertObjectId(req.query.idParent)]}}]}, function (err, r2) {
                res.status(200).json(r2);
            })
        })
    },
    html: function (req, res) {
        var date = new Date();
        var query = {};
        var startDate = new Date(),
            endDate = new Date();
        var data = {};
        var listMonth = [];
        var total = {};
        _async.waterfall([
            function (cb) {
                if (_.has(req.query, "startDate")) {
                    startDate = _moment(req.query['startDate'], "DD/MM/YYYY")._d;
                    cb();
                } else {
                    _Tickets.findOne({}, {}, {sort: {created: 1}}, function (err, r) {
                        if (r) {
                            startDate = r.created;
                        } else {
                            startDate = _moment().startOf('month')._d;
                        }
                        cb()
                    })
                }
            },
            function (cb) {
                if (_.has(req.query, "endDate")) {
                    endDate = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day')._d;
                    cb();
                } else {
                    _Tickets.findOne({}, {}, {sort: {created: -1}}, function (err, r) {
                        if (r) {
                            endDate = r.created;
                        } else {
                            endDate = _moment()._d;
                        }
                        cb();
                    })
                }
            }
        ], function (err) {
            for (var m = moment(startDate); m.isBefore(moment(endDate).endOf('month')); m.add(1, 'months')) {
                listMonth.push(m.format('M/YYYY'));
            }
            total.count = 0;
            _.each(listMonth, function(o){
                total[o] = 0;
            })
        });
        var company = {};
        var groupQuery = {};
        var agentQuery = {};
        agentQuery.$or = [];
        var service = {};
        if (req.session.auth.company) {
            service = {idCompany: req.session.auth.company._id};
            company = {_id: req.session.auth.company._id};
            groupQuery = {idParent: req.session.auth.company._id};
            agentQuery.$or.push({'companyLeaders.company': _.convertObjectId(req.session.auth.company._id)});
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-inbound-status', {
                    title: 'Báo cáo gọi vào - Báo cáo yêu cầu',
                    data: data,
                    company: [],
                    total: total,
                    cat: [],
                    agent: [],
                    sDate: false,
                    eDate: false,
                    listMonth:listMonth,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                }, true, new Error("Không đủ quyền truy cập"))
                return;
            }
        }
        if(req.query.idCompany) service = {idCompany: _.convertObjectId(req.query.idCompany)};
        _Services.distinct("_id", service, function (err, ser) {
            query.idService = {$in: ser};
            if (!err) {
                _async.parallel({
                    com: function (cb) {
                        _Company.find(company, function (err, result) {
                            cb(err, result)
                        })
                    },
                    catagent: function (cb) {
                        _async.parallel({
                            cat: function (cb) {
                                _TicketReasonCategory.find({category: {$in: [0, 1]}}, cb);
                            },
                            agent: function (cb) {
                                _Company.distinct("_id", req.session.auth.company ? {_id: req.session.auth.company} : {}, function (err, com) {
                                    _AgentGroups.distinct("_id", groupQuery, function (err, result) {
                                        if (err) return callback(err, null);
                                        agentQuery.$or.push({'agentGroupLeaders.group': {$in: result}}, {'agentGroupMembers.group': {$in: result}}, {'companyLeaders.company': {$in: com}});
                                        _Users.find(agentQuery, cb);
                                    });
                                });
                            }
                        }, function (err, result) {
                            cb(err, {cat: result.cat, agent: result.agent})
                        })
                    },
                }, function (err, result) {
                    _.isEmpty(req.query) ? _.render(req, res, 'report-inbound-status', {
                        title: 'Báo cáo gọi vào - Báo cáo yêu cầu',
                        data: data,
                        company: result.com,
                        total: total,
                        cat: result.catagent.cat,
                        agent: result.catagent.agent,
                        sDate: false,
                        eDate: false,
                        listMonth:listMonth,
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                    }, true, err) : (
                        _async.waterfall([
                            function (cb) {
                                _Services.distinct("_id", service, function (err, r) {
                                    var reasonQuery = {idService: {$in: r}, ticketReasonCategory:{$ne:null}};
                                    if(req.query.ticketReasonCategory) reasonQuery.ticketReasonCategory = {$in: _.arrayObjectId(req.query.ticketReasonCategory)};
                                    _Tickets.distinct("ticketReasonCategory", reasonQuery, function (err, r2) {
                                        cb(err, r2);
                                    })
                                })
                            }, function (a, cb) {
                                if (_.has(req.query, "status")) {
                                    if (req.query.status !== "all") {
                                        query.status = parseInt(req.query.status);
                                    }
                                }
                                if (_.has(req.query, "idAgent")) {
                                    query.idAgent = {$in: _.arrayObjectId(req.query.idAgent)};
                                }
                                query.created = {
                                    $gte: startDate,
                                    $lte: endDate
                                };
                                _async.each(a, function (cat, callback) {
                                    _TicketReasonCategory.findById(cat, function(err,r){
                                        _Tickets.aggregate([
                                            {$match:query},
                                            {$match:{ticketReasonCategory:cat}},
                                            {$group:{
                                                _id:{month: { $month: {$add:["$created", 7*60*60*1000]}}, year:{$year: {$add:["$created", 7*60*60*1000]}}},
                                                count:{$sum:1}
                                            }}
                                        ], function(err,result){
                                            data[r.name] = {total:0};
                                            _.each(result, function(o){
                                                data[r.name][o._id.month+'/'+o._id.year] = o.count;
                                                data[r.name].total += o.count;
                                                total[o._id.month+'/'+o._id.year] += o.count;
                                                total.count += o.count;
                                            });
                                            callback(err);
                                        })
                                    })
                                },function(err){
                                    cb(err,'done')
                                })
                            }
                        ], function (err) {
                            _.render(req, res, 'report-inbound-status', {
                                title: 'Báo cáo gọi vào - Báo cáo yêu cầu',
                                data: data,
                                company: result.com,
                                cat: result.catagent.cat,
                                agent: result.catagent.agent,
                                total: total,
                                sDate: startDate,
                                eDate: endDate,
                                listMonth:listMonth,
                                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                            }, true, err)
                        })
                    );
                })
            }
        })
    }
};