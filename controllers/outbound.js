/**
 * Created by luongvanlam on 4/19/16.
 */

var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));

exports.index = {
    json: function (req, res) {
        var status = null;
        if (_.has(req.query, 'status')) status = parseInt(req.query.status);

        if (_.has(req.query, 'updateStatus') && req.query.updateStatus) {
            var status = parseInt(req.query.status);
            var ticketId = _.convertObjectId(req.query.ticketId);

            _Tickets.update({_id: ticketId}, {$set: {status: status}}, function (err, result) {
                return res.json({
                    code: err ? 500 : 200,
                    message: err ? err.message : 'OK'
                })
            });
        } else {
            _async.waterfall([
                function(next){
                    getTickets(req, res, status, next);
                },
                function(tickets, next){
                    _Tickets.find({_id: {$in: _.pluck(tickets, '_id')}})
                        .populate({
                            path: 'idCampain',
                            model: _Campains,
                            select: 'idCompany name trunk _id',
                            populate: [{
                                path: 'idCompany',
                                model: _Company
                            }, {
                                path: 'trunk',
                                model: _Trunk,
                                select: 'prefix'
                            }]
                        })
                        .exec(function (error, t) {
                            next(error, tickets, t)
                        });
                }
            ], function(err, tickets, makeCallData){
                if (err) return res.json({code: 500, message: err.message});
                res.json({
                    code: 200,
                    message: tickets,
                    makeCallData: makeCallData
                })
            });
        }
    },
    html: function (req, res) {
        _async.parallel({
            reasons: function(next){
                var aggs = [];
                aggs.push({$match: {category: {$in: [0,2]}}}); // TODO: loại reason là tất cả và gọi ra
                aggs.push({$lookup: {from: 'ticketreasons', localField: '_id', foreignField: 'idCategory', as: 'reasons'}});
                aggs.push({$unwind: '$reasons'});
                aggs.push({$lookup: {from: 'ticketsubreasons', localField: 'reasons._id', foreignField: 'idReason', as: 'reasons.subreasons'}});
                aggs.push({
                    $group: {
                        _id: '$_id',
                        reasons: {$push: '$reasons'},
                        name: {$first: '$name'}
                    }
                });

                _TicketReasonCategory.aggregate(aggs, next);
            },
            company: function(next){
                var agg = [{$match: {status: 1}}];
                if (!_.isEmpty(req.session.auth.company)) {
                    agg.push({$match: {_id: _.convertObjectId(req.session.auth.company._id)}});
                }

                agg.push(
                    {
                        $lookup: {
                            from: 'campains',
                            localField: '_id',
                            foreignField: 'idCompany',
                            as: 'campain'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            campain: {
                                _id: 1,
                                name: 1
                            }
                        }
                    }
                );

                _Company.aggregate(agg, next);
            }
        }, function(err, result){
            _.render(req, res, 'outbound', {
                title: 'Quản lý gọi ra',
                reasons: result.reasons,
                company: result.company,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], ['bootstrap-toggle']]
            }, true, err);
        });
    }
};

/**
 * Phân quyền dữ liệu
 * @param req
 * @param callback
 */
function permissionConditions(req, callback) {
    var cond = [{$match: {idService: null}}];

    if (_.isEmpty(req.session.auth.company)) {
        callback(null, cond);
    } else {
        var companyId = _.convertObjectId(req.session.auth.company._id);

        if (req.session.auth.company.leader) {
            // Company leader
            _Campains.aggregate([
                {$match: {idCompany: companyId}},
                {$project: {_id: 1}}
            ], function (err, result) {
                if (err) return callback(err, null);
                cond.push({$match: {idCampain: {$in: _.pluck(result, '_id')}}});
                callback(err, cond);
            });
        } else {
            // agent
            var userId = _.convertObjectId(req.session.user._id);
            _Campains.aggregate([
                {$match: {idCompany: companyId}},
                {$project: {_id: 1}}
            ], function (err, result) {

                if (err) return callback(err, null);

                cond.push(
                    {
                        $match: {
                            $or: [
                                {idAgent: userId},
                                {assignTo: userId}
                            ]
                        }
                    },
                    {
                        $match: {idCampain: {$in: _.pluck(result, '_id')}}
                    }
                );
                callback(null, cond);
            });
        }
    }
}

/**
 * Truy vấn dữ liệu tickets
 * @param req
 * @param res
 * @param status
 * @param callback
 */
function getTickets(req, res, status, callback) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

    var sort = _.cleanSort(req.query,'');

    _async.waterfall([
        function (callback) {
            permissionConditions(req, callback);
        },
        function (cond, callback) {
            _async.parallel({
                campain: function (callback) {
                    // Lọc theo campaign
                    if(req.query.campain){
                        callback(null, [_.convertObjectId(req.query.campain)])
                    }else {
                        callback(null, null);
                    }

                    //if (!req.query.company) return callback(null, null);
                    //var agg = [
                    //    {$match: {_id: _.convertObjectId(req.query.company)}},
                    //    {
                    //        $lookup: {
                    //            from: 'campains',
                    //            localField: '_id',
                    //            foreignField: 'idCompany',
                    //            as: 'campain'
                    //        }
                    //    },
                    //    {
                    //        $project: {
                    //            _id: 1,
                    //            'campain._id': 1
                    //        }
                    //    },
                    //    {$unwind: '$campain'}
                    //];
                    //
                    //if (!!req.query.campain) agg.push({$match: {'campain._id': _.convertObjectId(req.query.campain)}});
                    //agg.push(
                    //    {
                    //        $group: {
                    //            _id: '$_id',
                    //            campainId: {$push: '$campain._id'}
                    //        }
                    //    }
                    //);
                    //
                    //_Company.aggregate(agg, function (err, result) {
                    //    var value = _.pluck(result, 'campainId')[0];
                    //    if (typeof value === 'undefined') {
                    //        err = new Error('Không tìm thấy kết quả với khoá tìm kiếm !');
                    //        return callback(err, null);
                    //    }
                    //
                    //    callback(err, value);
                    //});
                },
                updateBy: function (callback) {
                    // Lọc theo người cập nhật
                    if (!req.query.updateBy) return callback(null, null);
                    _Users.find({displayName: {$regex: new RegExp(_.stringRegex(req.query.updateBy), 'i')}}, {_id: 1}, function (err, result) {
                        if (err) return callback(err, null);
                        if (result == null || result.length == 0) {
                            err = new Error('Không tìm thấy kết quả với khoá tìm kiếm !');
                            return callback(err, null);
                        }

                        callback(err, _.pluck(result, '_id'));
                    });
                },
                phoneNumber: function (callback) {
                    // Lọc theo đầu số
                    if (!req.query.field_so_dien_thoai) return callback(null, null);
                    mongoClient.collection('customerindex')
                        .find({
                            field_so_dien_thoai: { $regex: new RegExp(_.stringRegex(req.query.field_so_dien_thoai), 'i') }
                        })
                        .toArray(function(err, result){
                            if (result == null || result.length == 0) {
                                err = new Error('Không tìm thấy kết quả với khoá tìm kiếm !');
                                return callback(err, null);
                            }
                            callback(err, _.pluck(result, '_id'));
                        });
                }
            }, function (err, result) {
                if (err) return callback(err, null);

                if (_.isEmpty(cond)) cond = [];

                if (result.campain !== null) cond.push({$match: {idCampain: {$in: result.campain}}});
                if (result.updateBy !== null) cond.push({$match: {updateBy: {$in: result.updateBy}}});
                if (result.phoneNumber !== null) cond.push({$match: {idCustomer: {$in: result.phoneNumber}}});

                if (!!req.query.deadline) {
                    var _d1 = _moment(req.query.deadline.split(' - ')[0], 'DD/MM/YYYY');
                    var _d2 = req.query.deadline.split(' - ')[1] ? _moment(req.query.deadline.split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

                    var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
                    var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
                    startDay = startDay.startOf('day');
                    endDay = endDay.endOf('day');
                    cond.push({$match: {deadline: {$gte: startDay._d, $lt: endDay._d}}});
                }

                if (!!req.query.updated) {
                    var _d1 = _moment(req.query.updated.split(' - ')[0], 'DD/MM/YYYY');
                    var _d2 = req.query.updated.split(' - ')[1] ? _moment(req.query.updated.split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

                    var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
                    var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
                    startDay = startDay.startOf('day');
                    endDay = endDay.endOf('day');
                    cond.push({$match: {updated: {$gte: startDay._d, $lt: endDay._d}}});
                };

                if (req.query.reason) {
                    var _r1 = req.query.reason.split('-')[0];
                    var _r2 = req.query.reason.split('-')[1];
                    var _r3 = req.query.reason.split('-')[2];
                    var reasonQuery = {};
                    if(_r1) reasonQuery.ticketReasonCategory = _.convertObjectId(_r1);
                    if(_r2) reasonQuery.ticketReason = _.convertObjectId(_r2);
                    if(_r3) reasonQuery.ticketSubreason = _.convertObjectId(_r3);
                    if(!_.isEmpty(reasonQuery)) cond.push({$match: reasonQuery});
                };

                callback(err, cond);
            })
        },
        function findTicket(cond, callback) {
            var agg = [];

            if (!_.isEmpty(cond)) {
                for (var i = 0; i < cond.length; ++i) {
                    agg.push(cond[i]);
                }
            }

            if (status != null) agg.push({$match: {status: status}});

            //agg.push({$sort: {deadline: -1}});

            var __query = parseJSONToObject(JSON.stringify(agg));
            if(!_.isEmpty(sort)) agg.push({$sort: sort});

            agg.push({$skip: (page - 1) * rows}, {$limit: rows});
            _Tickets.aggregate(agg, function (err, ticket) {
                if (err) return callback(err, null);

                if (_.has(req.query, 'socketId')
                    && (_.isEqual(req.query.ignoreSearch, '1') || ticket.length > 0)) {
                    createPaging(req, __query, page, rows);
                }

                callback(null, _.pluck(ticket, '_id'));
            });
        },
        // Truy vấn thông tin liên quan ticket
        function collectInfo(ticketIds, callback) {
            var agg = [];
            agg.push(
                {$match: {_id: {$in: ticketIds}}},
                {
                    $lookup: {
                        from: 'campains',
                        localField: 'idCampain',
                        foreignField: '_id',
                        as: 'campain'
                    }
                },
                {$unwind: {path: '$campain', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'campain.idCompany',
                        foreignField: '_id',
                        as: 'campain.idCompany'
                    }
                },
                {$unwind: {path: '$campain.idCompany', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'users',
                        localField: 'updateBy',
                        foreignField: '_id',
                        as: 'updateBy'
                    }
                },
                {$unwind: {path: '$updateBy', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'users',
                        localField: 'idAgent',
                        foreignField: '_id',
                        as: 'idAgent'
                    }
                },
                {
                    $lookup: {
                        from: 'customerindex',
                        localField: 'idCustomer',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                {$unwind: {path: '$customer', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'ticketreasoncategories',
                        localField: 'ticketReasonCategory',
                        foreignField: '_id',
                        as: 'ticketReasonCategory'
                    }
                },
                {$unwind: {path: '$ticketReasonCategory', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'ticketreasons',
                        localField: 'ticketReason',
                        foreignField: '_id',
                        as: 'ticketReason'
                    }
                },
                {$unwind: {path: '$ticketReason', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'ticketsubreasons',
                        localField: 'ticketSubreason',
                        foreignField: '_id',
                        as: 'ticketSubreason'
                    }
                },
                {$unwind: {path: '$ticketSubreason', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: '$_id',
                        updateBy: {$first: '$updateBy.displayName'},
                        idAgent: {$first: '$idAgent.displayName'},
                        deadline: {$first: '$deadline'},
                        updated: {$first: '$updated'},
                        status: {$first: '$status'},
                        idCustomer: {$first: '$idCustomer'},
                        customer: {$first: '$customer'},
                        field_so_dien_thoai: {$first: '$customer.field_so_dien_thoai'},
                        campain: {$first: '$campain.name'},
                        company: {$first: '$campain.idCompany.name'},
                        ticketReasonCategory: {$first: '$ticketReasonCategory.name'},
                        ticketReason: {$first: '$ticketReason.name'},
                        ticketSubreason: {$first: '$ticketSubreason.name'}
                    }
                }
            );

            if(!_.isEmpty(sort)) agg.push({$sort: sort});

            _Tickets.aggregate(agg, function (err, tickets) {
                if (err) return callback(err, null);
                var temp = [];
                ticketIds.forEach(function (tId, index) {
                    tickets.forEach(function (el) {
                        if (_.isEqual(tId.toString(), el._id.toString())) {
                            return temp[index] = el;
                        }
                    });
                });

                callback(null, temp);
            });
        }
    ], callback);
}

/**
 * Tạo phân trang
 * @param req
 * @param aggregate Điều kiện truy vấn
 * @param page
 * @param rows
 */
function createPaging(req, aggregate, page, rows) {
    aggregate.push({
        $group: {
            _id: '$status',
            count: {$sum: 1}
        }
    });

    _Tickets.aggregate(aggregate, function (err, result) {
        var obj = {};
        if (err) {
            obj = {code: 500, message: err.message, formId: req.query.formId, dt: req.query.dt};
        } else {
            var total = _.chain(result)
                .pluck('count')
                .reduce(function (memo, item) {
                    return memo + item;
                }, 0)
                .value();

            var paginator = new pagination.SearchPaginator({
                prelink: '/outbound',
                current: page,
                rowsPerPage: rows,
                totalResult: total
            });

            obj = {code: 200, message: paginator.getPaginationData(), formId: req.query.formId, dt: req.query.dt}
        }
        sio.sockets.socket(req.query.socketId).emit('responseTicketOutboundPagingData', obj);
    });
}