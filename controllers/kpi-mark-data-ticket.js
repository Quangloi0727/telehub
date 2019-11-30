//exports.index = {
//    json: function (req, res) {
//        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
//        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
//        if (_.has(req.query, 'queryTicketAdded')){
//            if (!_.has(req.query, 'page')){
//                _async.parallel({
//                    queryAllTicket: function(next) {
//                        _KpiMarkTicket
//                            .find({idData: new mongodb.ObjectId(req.query.idData)})
//                            .exec(next);
//                    },
//                    queryTicket: function(next){
//                        _KpiMarkTicket
//                            .find({idData: new mongodb.ObjectId(req.query.idData)})
//                            .populate('idTicket')
//                            .paginate(page, rows, function (error, tickets, pageCount) {
//                                if (!error){
//                                    var paginator = new pagination.SearchPaginator({prelink: '/kpi-mark-data-ticket', current: page, rowsPerPage: rows, totalResult: pageCount});
//                                    _KpiMarkTicket.populate(tickets, {
//                                        model: _TicketReasonCategory,
//                                        path: 'idTicket.ticketReasonCategory',
//                                        populate: {
//                                            model: _Campains,
//                                            path: 'idTicket.idCampain',
//                                            populate: {
//                                                model: _Company,
//                                                path: 'idTicket.idCampain.idCompany'
//                                            }
//                                        }
//                                    }, function(err, pTickets){
//                                        _KpiMarkTicket.populate(pTickets, {
//                                            model: _Services,
//                                            path: 'idTicket.idService',
//                                            populate: {
//                                                model: _Company,
//                                                path: 'idTicket.idService.idCompany'
//                                            }
//                                        }, function(er, pTicket2){
//                                            _KpiMarkTicket.populate(pTicket2, {
//                                                model: _Company,
//                                                path: 'idTicket.idCampain.idCompany'
//                                            }, function(er, pTicket3){
//                                                _KpiMarkTicket.populate(pTicket3, {
//                                                    model: _Company,
//                                                    path: 'idTicket.idService.idCompany'
//                                                }, function(er, resp){
//                                                    var phones = [];
//                                                    _async.each(resp, function(ticket, cb){
//                                                        _CCKFields['field_so_dien_thoai'].db.find({entityId: ticket.idTicket.idCustomer}, function(er, phone){
//                                                            if (!er) phones.push(phone[0].value);
//                                                            else{
//                                                                phones.push(null);
//                                                            }
//                                                            cb();
//                                                        });
//                                                    }, function(e, r){
//                                                        next(null, {data: resp, dataPhone: phones, paging: paginator.getPaginationData()});
//                                                    });
//                                                });
//                                            });
//
//                                        });
//                                    });
//                                }
//                            });
//                    }
//                }, function(err, result){
//                    res.json({code: err? 500 : 200, data: result.queryTicket.data, dataPhone: result.queryTicket.dataPhone, paging: result.queryTicket.paging, dataAllTicket: _.pluck(result.queryAllTicket, '_id')});
//                });
//            }
//            else{
//                _KpiMarkTicket
//                    .find({idData: new mongodb.ObjectId(req.query.idData)})
//                    .populate('idTicket')
//                    .paginate(page, rows, function (error, tickets, pageCount) {
//                        if (!error){
//                            var paginator = new pagination.SearchPaginator({prelink: '/kpi-mark-data-ticket', current: page, rowsPerPage: rows, totalResult: pageCount});
//                            _KpiMarkTicket.populate(tickets, {
//                                model: _TicketReasonCategory,
//                                path: 'idTicket.ticketReasonCategory',
//                                populate: {
//                                    model: _Campains,
//                                    path: 'idTicket.idCampain',
//                                    populate: {
//                                        model: _Company,
//                                        path: 'idTicket.idCampain.idCompany'
//                                    }
//                                }
//                            }, function(err, pTickets){
//                                _KpiMarkTicket.populate(pTickets, {
//                                    model: _Services,
//                                    path: 'idTicket.idService',
//                                    populate: {
//                                        model: _Company,
//                                        path: 'idTicket.idService.idCompany'
//                                    }
//                                }, function(er, pTicket2){
//                                    _KpiMarkTicket.populate(pTicket2, {
//                                        model: _Company,
//                                        path: 'idTicket.idCampain.idCompany'
//                                    }, function(er, pTicket3){
//                                        _KpiMarkTicket.populate(pTicket3, {
//                                            model: _Company,
//                                            path: 'idTicket.idService.idCompany'
//                                        }, function(er, resp){
//                                            var phones = [];
//                                            _async.eachSeries(resp, function(ticket, cb){
//                                                _CCKFields['field_so_dien_thoai'].db.find({entityId: ticket.idTicket.idCustomer}, function(er, phone){
//                                                    if (!err) phones.push(phone[0].value);
//                                                    else{
//                                                        phones.push(null);
//                                                    }
//                                                    cb();
//                                                });
//                                            }, function(e, r){
//                                                res.json({code: er ? 500 : 200, data: resp, dataPhone: phones, paging: paginator.getPaginationData()});
//                                            });
//                                        });
//                                    });
//
//                                });
//                            });
//                        }
//                    });
//            }
//        }
//        else if (_.has(req.query, 'queryTicket')){
//            _async.waterfall([
//                function(cb){
//                    _KpiMarkData.findById(req.query.data, cb);
//                }
//            ], function(error, rData){
//                var aggregate = _Tickets.aggregate();
//                aggregate._pipeline = [
//                    {$lookup: {from: 'ticketreasoncategories', localField: 'ticketReasonCategory', foreignField: '_id', as: 'ticketReasonCategory'}},
//                    {$lookup: {from: 'services', localField: 'idService', foreignField: '_id', as: 'service'}},
//                    {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
//                    {$lookup: {from: "companies", localField: 'service.idCompany', foreignField: '_id', as: "serviceCompany"}},
//                    {$lookup: {from: "campains", localField: 'idCampain', foreignField: '_id', as: "campain"}},
//                    {$unwind: {path: '$campain', preserveNullAndEmptyArrays: true}},
//                    {$lookup: {from: "companies", localField: 'campain.idCompany', foreignField: '_id', as: "campainCompany"}},
//                    {$lookup: {from: "field_so_dien_thoai", localField: 'idCustomer', foreignField: 'entityId', as: "customerPhone"}}
//                ];
//                var _query = {};
//                _query['created'] = {
//                    $gte: _moment(rData.startDate)._d,
//                    $lte: _moment(rData.endDate)._d
//                };
//                if (_.has(req.query, 'type')){
//                    if (_.isEqual(Number(req.query.type), 1)){
//                        _query.idCampain = {$ne: null};
//                    }
//                    else{
//                        _query.idService = {$ne: null};
//                    }
//                }
//                if (_.has(req.query, 'idCompany')){
//                    aggregate._pipeline.push({$match: {$and: [
//                        _query,
//                        {$or: [
//                            {'campain.idCompany': new mongodb.ObjectId(req.query.idCompany)},
//                            {'service.idCompany': new mongodb.ObjectId(req.query.idCompany)}
//                        ]}
//                    ]}});
//                }
//                else{
//                    aggregate._pipeline.unshift({$match: {$and: [_query]}});
//                }
//
//                if (_.has(req.query, 'limit')){
//                    aggregate._pipeline.unshift({$limit: Number(req.query.limit)});
//                }
//
//                if (!_.has(req.query, 'page')){
//                    _async.parallel({
//                        queryAllTicket: function(next) {
//                            _Tickets.aggregate(aggregate._pipeline, function (error, tk) {
//                                next(null, {data: tk});
//                            });
//                        },
//                        queryTicket: function(next){
//                            _Tickets.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, tk, pageCount, count) {
//                                var paginator = new pagination.SearchPaginator({prelink: '/kpi-mark-data-ticket', current: page, rowsPerPage: rows, totalResult: count});
//                                next(null, {data: tk, paging: paginator.getPaginationData()});
//                            });
//                        }
//                    }, function(err, result){
//                        res.json({code: err? 500 : 200, data: result.queryTicket.data, paging: result.queryTicket.paging, dataAllTicket: _.pluck(result.queryAllTicket.data, '_id')});
//                    });
//                }
//                else{
//                    _Tickets.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, tk, pageCount, count) {
//                        var paginator = new pagination.SearchPaginator({prelink: '/kpi-mark-data-ticket', current: page, rowsPerPage: rows, totalResult: count});
//                        res.json({code: error? 500 : 200, data: tk, paging: paginator.getPaginationData()})
//                    });
//                }
//            });
//        }
//    },
//    html: function (req, res) {
//        _Company.find({ status: 1 }, function(err, resp){
//            _.render(req, res, 'kpi-mark-data-ticket', {
//                title: 'Quản lý dữ liệu chấm điểm',
//                plugins: ['moment', ['bootstrap-datetimepicker'], ['bootstrap-duallistbox'], ['bootstrap-select']],
//                companies: resp
//            }, true);
//        });
//    }
//};
//
//exports.create = function (req, res) {
//    if (_.has(req.body, 'addIds')){
//        var ids = req.body.addIds.split(',');
//        var _kpiTicketBulk = mongoClient.collection('kpimarktickets').initializeUnorderedBulkOp({useLegacyOps: true});
//        _KpiMarkTicket.find({}, function(error, result){
//            var rIds = _.map(result, function(r){
//                return r.idTicket.toString();
//            });
//            var insertIds = _.difference(ids, rIds);
//            if (insertIds.length > 0){
//                _async.each(insertIds, function(id, cb) {
//                    _kpiTicketBulk.insert({
//                        idTicket: new mongodb.ObjectId(id),
//                        idData: new mongodb.ObjectId(req.query.idData),
//                        createBy: new mongodb.ObjectId(req.session.user._id),
//                        updateBy: new mongodb.ObjectId(req.session.user._id),
//                        status: 1
//                    });
//                    cb();
//                }, function(er, re){
//                    _kpiTicketBulk.execute(function(err, list){
//                        res.json({code: err ? 500 : 200});
//                    });
//                });
//            }
//            else{
//                res.json({code: 500});
//            }
//
//        });
//    }
//};
//
//exports.destroy = function (req, res) {
//    if (_.has(req.body, 'removeIds')){
//        var ids = req.body.removeIds.split(',');
//        var ticketIds = _.map(ids, function(id){
//            return new mongodb.ObjectId(id);
//        });
//        _KpiMarkTicket.remove({_id : {$in: ticketIds}}, function (err, result) {
//            res.json({code: err ? 500 : 200});
//        });
//    }
//};
