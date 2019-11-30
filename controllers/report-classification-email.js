/**
 * Created by Computer on 6/27/2016.
 */
exports.index = {
    json: function (req, res) {
        _TicketReason.find({idCategory: {$in : req.query.idCategory }}, function (error, result) {
            res.json({ticketReason: result});
        });
    },
    html: function (req, res) {
        _async.parallel({
            ticketReasonCategory: function (next) {
                _TicketReasonCategory.find({category: 4}, next);
            },
            company: function (next) {
                _Company.find({},next);
            }
        },function (error, result) {
            if(_.isEmpty(req.query)){
                _.render(req, res, 'report-classification-email', {
                    check: check,
                    endResultSubReason: [],
                    endResultReason: [],
                    endResultReasonCategory: [],
                    ticketReason: [],
                    ticketReasonCategory: result.ticketReasonCategory,
                    company: result.company,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                }, true, error);
            }
            else {
                var  idServicesMail = [], endResultReasonCategory = [], endResultReason = [], endResultSubReason = [];
                var queryCompany = {}, queryReasonCategory = {}, fieldReasonCategory = {}, fieldReason = {}, fieldSubReason = {}, created = {};
                var check = false;

                if(_.has(req.query, "idCompany")){
                    queryCompany.idCompany = req.query.idCompany;
                }

                _ServicesMail.find(queryCompany, function (error, idServiceMail) {
                    _.each(idServiceMail, function (loop, i) {
                        idServicesMail.push(loop._id);
                    });
                    if(_.has(req.query, 'startDate')){
                        created.$gt = _moment(req.query.startDate + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d;
                        fieldReasonCategory.created = created;
                        fieldReason.created = created;
                        fieldSubReason.created = created;
                    }
                    if(_.has(req.query, 'endDate')){
                        created.$lt = _moment(req.query.endDate + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d;
                        fieldReasonCategory.created = created;
                        fieldReason.created = created;
                        fieldSubReason.created = created;
                    }
                    if(_.has(req.query, 'idCompany') && idServiceMail.length > 0){
                        fieldReasonCategory.idService = {$in : idServicesMail};
                        fieldReason.idService = {$in : idServicesMail};
                        fieldSubReason.idService = {$in : idServicesMail};
                    }
                    if(_.has(req.query, 'idCompany') && idServiceMail.length == 0) {
                        fieldReasonCategory.idService = {$in : []};
                        fieldReason.idService = {$in : []};
                        fieldSubReason.idService = {$in : []};
                    }
                    if(_.has(req.query, 'ticketReasonCategory')) {
                        queryReasonCategory.category = 4;
                        queryReasonCategory._id = {$in : _.convertObjectId(req.query.ticketReasonCategory)};
                    }
                    else {
                        queryReasonCategory.category = 4;
                    }

                    _async.parallel({
                        ticketReasonCategory: function (next) {
                            _TicketReasonCategory.find(queryReasonCategory, function (error, ticketReasonCategory) {
                                _async.each(ticketReasonCategory, function (_query, callback) {
                                    fieldReasonCategory.ticketReasonCategory = _query._id;
                                    _TicketsMail.count(fieldReasonCategory, function (error, ticketChat) {
                                        endResultReasonCategory.push({name: _query.name, total: ticketChat, _id: _query._id});
                                        callback();
                                    });
                                },function (error) {
                                    next(error,endResultReasonCategory)
                                });
                            })
                        },
                        ticketReason: function (next) {
                            if(_.has(req.query, 'ticketReason')) {
                                check = true;
                                _async.parallel({
                                    ticketReasons: function (next) {
                                        _TicketReason.find({_id: {$in : req.query.ticketReason}}, function (error, ticketReason) {
                                            _async.each(ticketReason, function (_query, callback) {
                                                fieldReason.ticketReason = _query._id;
                                                _TicketsMail.count(fieldReason, function (error, ticketChat) {
                                                    endResultReason.push({name: _query.name, total: ticketChat, idCategory:  _query.idCategory, _id: _query._id});
                                                    callback();
                                                });
                                            },function (error) {
                                                next(error,endResultReason);
                                            });
                                        });
                                    },
                                    ticketSubReasons: function (next) {
                                        _TicketSubreason.find({idReason: {$in : req.query.ticketReason}}, function (error, ticketSubReasons) {
                                            _async.each(ticketSubReasons, function (_query, callback) {
                                                fieldSubReason.ticketSubreason = _query._id;
                                                _TicketsMail.count(fieldSubReason, function (error, ticketChat) {
                                                    endResultSubReason.push({name: _query.name, total: ticketChat, idReason:  _query.idReason});
                                                    callback();
                                                });
                                            },function (error) {
                                                next(error, endResultSubReason);
                                            });
                                        });
                                    }
                                },function (error, resultTicketReason) {
                                    next(error, resultTicketReason);
                                })
                            }
                            else
                            {
                                next(null,[]);
                            }

                        }
                    },function (error, endResult) {
                        _.render(req, res, 'report-classification-email', {
                            check: check,
                            endResultSubReason: endResult.ticketReason.ticketSubReasons,
                            endResultReason: endResult.ticketReason.ticketReasons,
                            endResultReasonCategory: endResult.ticketReasonCategory,
                            ticketReason: endResultReason,
                            ticketReasonCategory: result.ticketReasonCategory,
                            company: result.company,
                            plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                        }, true, error);
                    })
                })
            }
        })
    }
}