/**
 * Created by luongvanlam on 4/19/16.
 */

var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));

exports.index = {
    json: function (req, res) {
        if (_.has(req.query, 'updateStatus') && req.query.updateStatus) {
            var status = parseInt(req.query.status);
            var ticketId = _.convertObjectId(req.query.ticketId);

            _TicketsMail.update({ _id: ticketId }, { $set: { status: status } }, function (err, result) {
                return res.json({
                    code: err ? 500 : 200,
                    message: err ? err.message : 'OK'
                })
            });
        } else {
            var status = null;
            if (_.has(req.query, 'status')) status = parseInt(req.query.status);
            getTickets(req, res, status, function (err, tickets) {
                if (err) return res.json({ code: 500, message: err.message });
                res.json({
                    code: 200,
                    message: tickets
                })
            });
        }
    },
    html: function (req, res) {
        _async.parallel({
            company: function (callback) {
                var agg = [{ $match: { status: 1 } }];
                if (!_.isEmpty(req.session.auth.company))
                    agg.push({ $match: { _id: _.convertObjectId(req.session.auth.company._id) } });

                agg.push({ $project: { _id: 1, name: 1 } });

                _Company.aggregate(agg, callback);
            },
            reasons: function(next){
                var aggs = [];
                aggs.push({$match: {category: 4}}); // TODO: loại reason là mail
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
        }, function (err, result) {
            _.render(req, res, 'inbound-mail', {
                title: 'Quản lý gọi vào',
                company: result.company,
                reasons: result.reasons,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']]
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
    var cond = [{ $match: { idCampain: null } }];

    if (_.isEmpty(req.session.auth.company)) {
        callback(null, cond);
    } else {
        var companyId = _.convertObjectId(req.session.auth.company._id);

        if (req.session.auth.company.leader) {
            // Company leader
            _ServicesMail.aggregate([
                { $match: { idCompany: companyId } },
                { $project: { _id: 1 } }
            ], function (err, result) {
                if (err) return callback(err, null);
                cond.push({ $match: { idService: { $in: _.pluck(result, '_id') } } });
                callback(err, cond);
            });
        } else if (req.session.auth.company.group.leader) {
            // Team lead
            var groupId = _.convertObjectId(req.session.auth.company.group._id);
            _async.parallel({
                user: function (callback) {
                    _Users.aggregate([
                        { $unwind: { path: '$agentGroupMembers', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$agentGroupLeaders', preserveNullAndEmptyArrays: true } },
                        {
                            $match: {
                                $or: [
                                    { 'agentGroupMembers.group': groupId },
                                    { 'agentGroupLeaders.group': groupId }
                                ]
                            }
                        },
                        { $group: { _id: '$_id' } }
                    ], callback);
                },
                company: function (callback) {
                    _ServicesMail.aggregate([
                        { $match: { idCompany: companyId } },
                        { $project: { _id: 1 } }
                    ], callback);
                }
            }, function (err, result) {
                if (err) return callback(err, null);
                cond.push(
                    { $match: { idService: { $in: _.pluck(result.company, '_id') } } },
                    {
                        $match: {
                            $or: [
                                { idAgent: { $in: _.pluck(result.user, '_id') } },
                                { groupId: groupId }
                            ]
                        }
                    }
                );
                callback(err, cond);
            });
        } else {
            // agent
            var userId = _.convertObjectId(req.session.user._id);
            _ServicesMail.aggregate([
                { $match: { idCompany: companyId } },
                { $project: { _id: 1 } }
            ], function (err, result) {

                if (err) return callback(err, null);

                cond.push(
                    {
                        $match: { idAgent: userId }
                    },
                    {
                        $match: { idService: { $in: _.pluck(result, '_id') } }
                    }
                );
                callback(null, cond);
            });
        }
    }
}

/**
 * Truy vấn ticket
 * @param req
 * @param res
 * @param status
 * @param callback
 */
function getTickets(req, res, status, callback) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
    _async.waterfall([
        function (callback) {
            permissionConditions(req, callback);
        },
        function (cond, callback) {
            _async.parallel({
                services: function (callback) {
                    // Lọc theo công ty/services
                    if (!req.query.company) return callback(null, null);
                    _ServicesMail.aggregate([
                        {
                            $lookup: {
                                from: 'companies',
                                localField: 'idCompany',
                                foreignField: '_id',
                                as: 'company'
                            }
                        },
                        { $unwind: '$company' },
                        { $match: { 'company._id': _.convertObjectId(req.query.company) } },
                        { $group: { _id: '$_id' } }
                    ], function (err, result) {
                        callback(err, _.pluck(result, '_id'));
                    });
                },
                updateBy: function (callback) {
                    // Lọc theo người cập nhật
                    if (!req.query.updateBy) return callback(null, null);
                    _Users.find({ displayName: { $regex: new RegExp(_.stringRegex(req.query.updateBy), 'i') } }, { _id: 1 }, function (err, result) {
                        if (err) return callback(err, null);
                        if (result == null || result.length == 0) {
                            err = new Error('Không tìm thấy kết quả với khoá tìm kiếm !');
                            return callback(err, null);
                        }
                        callback(err, _.pluck(result, '_id'));
                    });
                },
                email: function (callback) {
                    // Lọc theo email
                    if (!req.query.field_e_mail) return callback(null, null);
                    _CCKFields['field_e_mail'].db.find(
                        { value: { $regex: new RegExp(_.stringRegex(req.query.field_e_mail), 'i') } },
                        { entityId: 1 },
                        function (err, result) {
                            if (err) return callback(err, null);
                            if (result == null || result.length == 0) {
                                err = new Error('Không tìm thấy kết quả với khoá tìm kiếm !');
                                return callback(err, null);
                            }
                            callback(err, _.pluck(result, 'entityId'));
                        }
                    )
                }
            }, function (err, result) {
                if (err) return callback(err, null);

                if (_.isEmpty(cond)) cond = [];

                if (result.services !== null) cond.push({ $match: { idService: { $in: result.services } } });
                if (result.updateBy !== null) cond.push({ $match: { updateBy: { $in: result.updateBy } } });
                if (result.email !== null) cond.push({ $match: { idCustomer: { $in: result.email } } });

                if (_.has(req.query, 'ticketReasonCategory'))
                    cond.push({ $match: { ticketReasonCategory: _.convertObjectId(req.query.ticketReasonCategory) } });

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
                }

                if (!!req.query.note)
                    cond.push({ $match: { note: { $regex: new RegExp(_.stringRegex(req.query.note), 'i') } } });

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

            if (status !== null) agg.push({ $match: { status: status } });

            if (_.has(req.query, 'sort')) {
                var stringArr = req.query.sort.split(':');
                var sortValue = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
                var obj = {};
                obj[stringArr[0]] = sortValue;
                agg.push({ $sort: obj });
            }

            var __query = parseJSONToObject(JSON.stringify(agg));

            agg.push({ $skip: (page - 1) * rows }, { $limit: rows });

            _TicketsMail.aggregate(agg, function (err, ticket) {
                if (err) return callback(err, null);
                if (_.has(req.query, 'socketId') && ticket.length > 0)
                    createPaging(req, __query, page, rows);

                var ticketIds = _.pluck(ticket, '_id');
                callback(null, ticketIds);
            });
        },
        // Truy vấn thông tin liên quan của ticket
        function collectInfo(ticketIds, callback) {
            var agg = [];
            agg.push(
                { $match: { _id: { $in: ticketIds } } },
                {
                    $lookup: {
                        from: 'servicemails',
                        localField: 'idService',
                        foreignField: '_id',
                        as: 'service'
                    }
                },
                { $unwind: '$service' },
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'service.idCompany',
                        foreignField: '_id',
                        as: 'service.idCompany'
                    }
                },
                { $unwind: '$service.idCompany' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'updateBy',
                        foreignField: '_id',
                        as: 'updateBy'
                    }
                },
                { $unwind: { path: '$updateBy', preserveNullAndEmptyArrays: true } },
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
                        from: 'field_e_mail',
                        localField: 'idCustomer',
                        foreignField: 'entityId',
                        as: 'field_e_mail'
                    }
                },
                { $unwind: '$field_e_mail' },
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
                        updateBy: { $first: '$updateBy.displayName' },
                        //idAgent: {$first: '$idAgent.displayName'},
                        deadline: { $first: '$deadline' },
                        updated: { $first: '$updated' },
                        status: { $first: '$status' },
                        //customer: {$first: '$idCustomer'},
                        field_e_mail: { $first: '$field_e_mail.value' },
                        //service: {$first: '$service.name'},
                        company: { $first: '$service.idCompany.name' },
                        note: { $first: '$note' },
                        ticketReasonCategory: {$first: '$ticketReasonCategory.name'},
                        ticketReason: {$first: '$ticketReason.name'},
                        ticketSubreason: {$first: '$ticketSubreason.name'}
                    }
                }
            );

            _TicketsMail.aggregate(agg, function (err, tickets) {
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
 * @param aggregate điều kiện truy vấn ticket
 * @param page
 * @param rows
 */
function createPaging(req, aggregate, page, rows) {
    aggregate.push({
        $group: {
            _id: '$status',
            count: { $sum: 1 }
        }
    });

    _TicketsMail.aggregate(aggregate, function (err, result) {
        var obj = {};
        if (err) {
            obj = { code: 500, message: err.message, formId: req.query.formId, dt: req.query.dt };
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

            obj = { code: 200, message: paginator.getPaginationData(), formId: req.query.formId, dt: req.query.dt }
        }
        sio.sockets.socket(req.query.socketId).emit('responseTicketInboundMailPagingData', obj);
    });
}