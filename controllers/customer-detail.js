var zoka = require(path.join(_rootPath, 'assets', 'plugins', 'zoka', 'script.js'));

exports.index = {
    json: function (req, res) {
        // Query dữ liệu khách hàng
        var _agg = _.map(cfields, function (o) {
            return {$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}};
        });
        var _query = _.chain(cfields).map(function (o) {
            return _.has(query, o.modalName) ? _.object([o.modalName + '.value'], [_.switch(o.fieldType, [1, 2, 3, 4, 5, 6], [_.regexAgg(query[o.modalName])])]) : null;
        }).compact().value();
        if (_query.length) _agg.push({$match: {$or: _query}});
        _Customer.aggregatePaginate(_agg, {page: 1, limit: 2}, function (error, customers) {
            var paginator = new pagination.SearchPaginator({prelink: '/customer', current: page, rowsPerPage: rows, totalResult: customers.length});
            res.json({fields: cfields, customers: customers, paging: paginator.getPaginationData()});
        });
    },
    html: function (req, res) {
        var checkTime = Date.now();
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var sort = _.cleanSort(req.query, '.value');
        var query = _.cleanRequest(req.query);
        var queryIds = null;
        var cfields = [];

        var sort2 = _.reduce(_.keys(sort), function(memo, item){
            memo[item.replace('.value', '')] = sort[item];
            return memo;
        }, {});

        var totalCount = 0;
        var _indexQuery = [];

        _async.waterfall([
            function (callback) {
                // Lấy dữ liệu customer field
                findCustomerFields(req, function (err, result) {
                    cfields = result;
                    callback(err);
                });
            },
            function (callback) {
                // Tìm ID khách hàng
                _.each(cfields, function (field) {
                    if (_.has(query, field.modalName)) _indexQuery.push(_.object([field.modalName], [_.switchAgg(field.fieldType, query[field.modalName])]));
                });

                mongoClient.collection('customerindex').find(_indexQuery.length > 0 ? {$and: _indexQuery} : {})
                    .sort(sort2)
                    .skip((page - 1)*rows)
                    .limit(rows)
                    .toArray(function (err, result) {
                        queryIds = _.pluck(result, '_id');
                        callback(err);
                    });
            },
            function(callback){
                // Query dữ liệu và paging
                mongoClient.collection('customerindex').count(_indexQuery.length > 0 ? {$and: _indexQuery} : {}, function(err, result){
                    var paginator = new pagination.SearchPaginator({
                        prelink: '/customer-detail',
                        current: page,
                        rowsPerPage: rows,
                        totalResult: result
                    });
                    callback(err, paginator);
                });
            },
            function (paginator, callback) {
                var aggs = [];
                aggs.push({$match: {_id: {$in: queryIds}}});
                _.each(cfields, function (o) {
                    aggs.push({$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}});
                });
                if(!_.isEmpty(sort)) aggs.push({$sort: sort});
                _Customer.aggregate(aggs, function (err, result) {
                    callback(err, {fields: cfields, customers: result, paging: paginator.getPaginationData()});
                });
            }
        ], function (error, result) {
            _.render(req, res, 'customer-detail', _.extend({
                title: 'Dữ liệu khách hàng',
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']],
            }, result), true, error);
        });
    }
};

// Show
exports.show = {
    json: function (req, res) {
        // Query danh sách ticket của khách hàng
        if (!mongodb.ObjectID.isValid(req.params.customerdetail))
            return res.json({code: 500, message: 'Không tìm thấy khách hàng với ID: ' + req.params.customerdetail});

        var customerId = new mongodb.ObjectID(req.params.customerdetail);
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var agg = _Tickets.aggregate();
        agg._pipeline.push(
            {$match: {idCustomer: customerId}},
            {$lookup: {from: 'services', localField: 'idService', foreignField: '_id', as: 'idService'}},
            {$lookup: {from: 'campains', localField: 'idCampain', foreignField: '_id', as: 'idCampain'}},
            {$lookup: {from: 'users', localField: 'updateBy', foreignField: '_id', as: 'updateBy'}},
            {$unwind: {path: '$idService', preserveNullAndEmptyArrays: true}},
            {$unwind: {path: '$idCampain', preserveNullAndEmptyArrays: true}},
            {$unwind: {path: '$updateBy', preserveNullAndEmptyArrays: true}}
        );

        if (!!req.session.auth.company) {
            var companyId = new mongodb.ObjectID(req.session.auth.company._id);
            agg._pipeline.push(
                {
                    $redact: {
                        $cond: {
                            if: {
                                $or: [
                                    {$eq: ["$idService.idCompany", companyId]},
                                    {$eq: ["$idCampain.idCompany", companyId]}
                                ]
                            },
                            then: "$$KEEP",
                            else: "$$PRUNE"
                        }
                    }
                }
            )
        }

        agg._pipeline.push(
            {
                $group: {
                    _id: '$_id',
                    updateBy: {$first: '$updateBy'},
                    deadline: {$first: '$deadline'},
                    updated: {$first: '$updated'},
                    status: {$first: '$status'},
                    idService: {$first: '$idService'},
                    idCampain: {$first: '$idCampain'},
                    ticketReasonCategory: {$first: '$ticketReasonCategory'},
                    ticketReason: {$first: '$ticketReason'},
                    ticketSubreason: {$first: '$ticketSubreason'},
                    note: {$first: '$note'},
                }
            },
            {
                $project: {
                    _id: 1,
                    'updateBy.name': 1,
                    'updateBy.displayName': 1,
                    deadline: 1,
                    updated: 1,
                    status: 1,
                    idService: 1,
                    idCampain: 1,
                    ticketReasonCategory: 1,
                    ticketReason: 1,
                    ticketSubreason: 1,
                    note: 1
                }
            },
            {$lookup: {from: 'ticketreasoncategories', localField: 'ticketReasonCategory', foreignField: '_id', as: 'ticketReasonCategory'}},
            {$lookup: {from: 'ticketsubreasons', localField: 'ticketSubreason', foreignField: '_id', as: 'ticketSubreason'}},
            {$unwind: {path: '$ticketReasonCategory', preserveNullAndEmptyArrays: true}},
            {$unwind: {path: '$ticketSubreason', preserveNullAndEmptyArrays: true}}
        );

        _Tickets.aggregatePaginate(agg, {page: page, limit: rows}, function (error, tickets, pageCount, total) {
            if (error) return res.json({code: 500, message: error.message});
            var paginator = new pagination.SearchPaginator({
                prelink: '/customer-detail/' + req.params.customerdetail,
                current: page,
                rowsPerPage: rows,
                totalResult: total
            });
            res.json({code: 200, message: {data: tickets, paging: paginator.getPaginationData()}});
        });
    },
    html: function (req, res) {
        if (!mongodb.ObjectID.isValid(req.params.customerdetail))
            return res.render('404', {title: '404 | Không tìm thấy khách hàng với ID: ' + req.params.customerdetail});

        _async.parallel({
            ticket: function (callback) {
                // Lấy thông tin danh sách ticket của khách hàng
                var customerId = new mongodb.ObjectID(req.params.customerdetail);
                var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
                var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

                var agg = _Tickets.aggregate();
                agg._pipeline.push(
                    {$match: {idCustomer: customerId}},
                    {$lookup: {from: 'services', localField: 'idService', foreignField: '_id', as: 'idService'}},
                    {$lookup: {from: 'campains', localField: 'idCampain', foreignField: '_id', as: 'idCampain'}},
                    {$lookup: {from: 'users', localField: 'updateBy', foreignField: '_id', as: 'updateBy'}},
                    {$unwind: {path: '$idService', preserveNullAndEmptyArrays: true}},
                    {$unwind: {path: '$idCampain', preserveNullAndEmptyArrays: true}},
                    {$unwind: {path: '$updateBy', preserveNullAndEmptyArrays: true}}
                );

                if (!!req.session.auth.company) {
                    var companyId = new mongodb.ObjectID(req.session.auth.company._id);
                    agg._pipeline.push(
                        {
                            $redact: {
                                $cond: {
                                    if: {$or: [{$eq: ["$idService.idCompany", companyId]}, {$eq: ["$idCampain.idCompany", companyId]}]},
                                    then: "$$KEEP",
                                    else: "$$PRUNE"
                                }
                            }
                        }
                    )
                }

                agg._pipeline.push(
                    {
                        $group: {
                            _id: '$_id',
                            updateBy: {$first: '$updateBy'},
                            deadline: {$first: '$deadline'},
                            updated: {$first: '$updated'},
                            status: {$first: '$status'},
                            idService: {$first: '$idService'},
                            idCampain: {$first: '$idCampain'},
                            ticketReasonCategory: {$first: '$ticketReasonCategory'},
                            ticketReason: {$first: '$ticketReason'},
                            ticketSubreason: {$first: '$ticketSubreason'},
                            note: {$first: '$note'},
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            'updateBy.name': 1,
                            'updateBy.displayName': 1,
                            deadline: 1,
                            updated: 1,
                            status: 1,
                            idService: 1,
                            idCampain: 1,
                            ticketReasonCategory: 1,
                            ticketReason: 1,
                            ticketSubreason: 1,
                            note: 1
                        }
                    },
                    {$lookup: {from: 'ticketreasoncategories', localField: 'ticketReasonCategory', foreignField: '_id', as: 'ticketReasonCategory'}},
                    {$lookup: {from: 'ticketsubreasons', localField: 'ticketSubreason', foreignField: '_id', as: 'ticketSubreason'}},
                    {$unwind: {path: '$ticketReasonCategory', preserveNullAndEmptyArrays: true}},
                    {$unwind: {path: '$ticketSubreason', preserveNullAndEmptyArrays: true}}
                );

                _Tickets.aggregatePaginate(agg, {page: page, limit: rows}, function (error, tickets, pageCount, total) {
                    if (error) return callback(error, null);
                    var paginator = new pagination.SearchPaginator({
                        prelink: '/customer-detail/' + req.params.customerdetail,
                        current: page,
                        rowsPerPage: rows,
                        totalResult: total
                    });
                    callback(error, {ticket: tickets, paging: paginator.getPaginationData()});
                });
            },
            ticketReasonCategory: function (callback) {
                // Lấy thông tin nhóm tình trạng ticket
                getTicketReason(callback);
            },
            customer: function (callback) {
                // Lấy thông tin khách hàng
                _async.waterfall([
                    function (callback) {
                        findCustomerFields(req, callback);
                    },
                    function (cfields, callback) {
                        var aggregate = [{$match: {_id: new mongodb.ObjectID(req.params.customerdetail)}}];
                        _.each(cfields, function (o) {
                            aggregate.push({$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}});
                        });
                        _Customer.aggregate(aggregate, function (err, result) {
                            if (err) return callback(err, null);
                            callback(null, {fields: cfields, customer: result});
                        });
                    }
                ], callback);
            }
        }, function (err, result) {
            _.render(req, res, 'customer-detail-show', {
                title: 'Chi tiết ticket của khách hàng',
                plugins: ['moment', 'zoka', ['chosen'], ['bootstrap-select'], ['bootstrap-datetimepicker']],
                zoka: zoka,
                ticket: result.ticket.ticket,
                ticketPaging: result.ticket.paging,
                customer: !!result.customer.customer ? result.customer.customer : null,
                fields: !!result.customer.fields ? result.customer.fields : null,
            }, true, err);
        });
    }
};

//exports.search = function (req, res) {
//    console.log(232, req.query);
//    console.log(233, req.body);
//    var query = _.cleanRequest(req.query, ['_', '_fieldId', 'object FormData']);
//    console.log(235, query);
//}

////Todo: trả về tên CCK field và danh sách id cần xoá của CCK field đó
//var _getArr = function (arr, field) {
//    return _.chain(arr)
//        .map(function (el) {
//            return _.chain(el).pick(field).values().flatten(true).first().pick('_id').values().first().value();
//        })
//        .value();
//};

/**
 * Lấy thông tin trường dữ liệu khách hàng
 * @param req
 * @param callback
 */
function findCustomerFields(req, callback) {
    if (req.session.auth.company == null) {
        _CustomerFields.find({status: 1}, null, {sort: {weight: 1}}, callback);
    } else {
        var companyId = new mongodb.ObjectID(req.session.auth.company._id);

        _Company.findOne({_id: companyId})
            .populate({
                path: 'companyProfile',
                model: _CompanyProfile,
                select: 'fieldId',
                populate: [{
                    path: 'fieldId',
                    model: _CustomerFields
                }]
            })
            .exec(function(err, result){
                var fields = (result && result.companyProfile && result.companyProfile.fieldId) ? result.companyProfile.fieldId : [];
                callback(err, fields);
        });
    }
}

/**
 * Lấy thông tin nhóm trạng thái ticket
 * @param callback
 */
function getTicketReason(callback) {
    _TicketReasonCategory.aggregate([
        {$match: {status: 1}},
        {$project: {_id: 1, name: 1}},
        {$lookup: {from: 'ticketreasons', localField: '_id', foreignField: 'idCategory', as: 'tr'}},
        {$unwind: {path: '$tr', preserveNullAndEmptyArrays: true}},
        {$sort: {'tr.priority': 1}},
        {$lookup: {from: 'ticketsubreasons', localField: 'tr._id', foreignField: 'idReason', as: 'tr.subReason'}},
        {$group: {_id: '$_id', name: {$first: '$name'}, tReason: {$push: {trId: '$tr._id', name: '$tr.name', subReason: '$tr.subReason'}}}},
        {$project: {_id: 1, name: 1, tReason: {trId: 1, name: 1, subReason: {_id: 1, name: 1, priority: 1,}}}}
    ], function (err, result) {
        callback(err, _.reduce(result, function (memo, item) {
            item.tReason = _.reduce(item.tReason, function (memo, item) {
                item.subReason = _.map(_.sortBy(item.subReason, 'priority'), function (item) {
                    return _.omit(item, 'priority');
                });
                memo.push(item);
                return memo;
            }, []);
            memo.push(item);
            return memo;
        }, []));
    });
}