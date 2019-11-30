/**
 * Created by sonth on 7/5/16.
 */

var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));

exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'updateStatus') && req.query.updateStatus) {
            var status = parseInt(req.query.status);
            var ticketId = _.convertObjectId(req.query.ticketId);

            _TicketsChat.update({_id: ticketId}, {$set: {status: status}}, function (err, result) {
                return res.json({
                    code: err ? 500 : 200,
                    message: err ? err.message : 'OK'
                })
            });
        }
        else if (_.has(req.query, 'queryThread') && _.has(req.query, 'threadId') && _.isEqual(req.query['queryThread'], '1')){
            _async.waterfall([
                function (next) {
                    _CustomerFields.find({status: 1}, next);
                },
                function(cfields, next){
                    var _agg = [
                        {$match: {_id: _.convertObjectId(req.query.threadId)}},
                        {$lookup: {from: 'chatlogs', localField: '_id', foreignField: 'threadId', as: 'chatlogs'}},
                        {$sort: {updated: -1}}
                    ].concat(_.map(cfields, function (o) {
                            return {$lookup: {from: o.modalName, localField: 'customerId', foreignField: 'entityId', as: o.modalName}};
                        }));
                    _ChatThread.aggregate(_agg, function (err, threads){
                        _ChatThread.populate(threads, {
                            path: "agentId chatlogs.sentFrom.id",
                            model: _Users,
                            populate: {
                                path: 'chatTag',
                                model: _ChatTag
                            }}, next);
                    });
                }
            ], function(wError, wResp){
                if (!wError){
                    res.json({data: wResp});
                }
                else{
                    console.log(wError, wResp);
                }
            });
        }
        else {
            var status = null;
            if (_.has(req.query, 'status')) status = parseInt(req.query.status);
            getTickets(req, res, status, function (err, tickets, paging) {
                if (err) return res.json({code: 500, message: err.message});
                res.json({
                    code: 200,
                    message: tickets,
                    paging: paging
                })
            });
        }
    },
    html: function (req, res) {
        _async.parallel({
            company: function (callback) {
                var agg = [{$match: {status: 1}}];
                if (!_.isEmpty(req.session.auth.company))
                    agg.push({$match: {_id: _.convertObjectId(req.session.auth.company._id)}});

                agg.push({$project: {_id: 1, name: 1}});

                _Company.aggregate(agg, callback);
            },
            ticketReasonCategory: function (callback) {
                _TicketReasonCategory.aggregate([
                    {$match: {status: 1, category: 3}},
                    {$project: {_id: 1, name: 1}}
                ], callback)
            }
        }, function (err, result) {
            _.render(req, res, 'report-ticket-chat', {
                title: 'Báo cáo ticket chat',
                company: result.company,
                ticketReasonCategory: result.ticketReasonCategory,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']]
            }, true, err);
        });
    }
};

function permissionConditions(req, callback) {
    var cond = [{$match: {status: {$ne: -1}}}];

    if (_.isEmpty(req.session.auth.company)) {
        callback(null, cond);
    } else{
        var companyId = _.convertObjectId(req.session.auth.company._id);

        if (req.session.auth.company.leader) {
            _ServicesChat.aggregate([
                {
                    $lookup: {
                        from: 'companychannels',
                        localField: 'idChannel',
                        foreignField: '_id',
                        as: 'companychannels'
                    }
                },
                {$unwind: {path: '$companychannels', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'companychannels.idCompany',
                        foreignField: '_id',
                        as: 'company'
                    }
                },
                {$unwind: {path: '$company', preserveNullAndEmptyArrays: true}},
                {$match: {'company._id': companyId}},
                {$project: {_id: 1}}
            ], function (err, result) {
                if (err) return callback(err, null);
                cond.push({$match: {idService: {$in: _.pluck(result, '_id')}}});
                callback(err, cond);
            });
        } else if (req.session.auth.company.group.leader) {
            var groupId = _.convertObjectId(req.session.auth.company.group._id);
            _async.parallel({
                user: function (callback) {
                    _Users.aggregate([
                        {$unwind: {path: '$agentGroupMembers', preserveNullAndEmptyArrays: true}},
                        {$unwind: {path: '$agentGroupLeaders', preserveNullAndEmptyArrays: true}},
                        {
                            $match: {
                                $or: [
                                    {'agentGroupMembers.group': groupId},
                                    {'agentGroupLeaders.group': groupId}
                                ]
                            }
                        },
                        {$group: {_id: '$_id'}}
                    ], callback);
                },
                company: function (callback) {
                    _ServicesChat.aggregate([
                        {
                            $lookup: {
                                from: 'companychannels',
                                localField: 'idChannel',
                                foreignField: '_id',
                                as: 'companychannels'
                            }
                        },
                        {$unwind: {path: '$companychannels', preserveNullAndEmptyArrays: true}},
                        {
                            $lookup: {
                                from: 'companies',
                                localField: 'companychannels.idCompany',
                                foreignField: '_id',
                                as: 'company'
                            }
                        },
                        {$unwind: {path: '$company', preserveNullAndEmptyArrays: true}},
                        {$match: {'company._id': companyId}},
                        {$project: {_id: 1}}
                    ], callback);
                }
            }, function (err, result) {
                if (err) return callback(err, null);
                cond.push(
                    {$match: {idService: {$in: _.pluck(result.company, '_id')}}},
                    {
                        $match: {
                            $or: [
                                {idAgent: {$in: _.pluck(result.user, '_id')}},
                                {groupId: groupId}
                            ]
                        }
                    }
                );
                callback(err, cond);
            });
        } else {
            // agent
            var userId = _.convertObjectId(req.session.user._id);
            _ServicesChat.aggregate([
                {
                    $lookup: {
                        from: 'companychannels',
                        localField: 'idChannel',
                        foreignField: '_id',
                        as: 'companychannels'
                    }
                },
                {$unwind: {path: '$companychannels', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'companychannels.idCompany',
                        foreignField: '_id',
                        as: 'company'
                    }
                },
                {$unwind: {path: '$company', preserveNullAndEmptyArrays: true}},
                {$match: {'company._id': companyId}},
                {$project: {_id: 1}}
            ], function (err, result) {

                if (err) return callback(err, null);

                cond.push(
                    {
                        $match: {
                            idAgent: userId
                        }
                    },
                    {
                        $match: {idService: {$in: _.pluck(result, '_id')}}
                    }
                );
                callback(null, cond);
            });
        }
    }
}

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
                    if (!req.query.company) return callback(null, null);
                    _ServicesChat.aggregate([
                        {
                            $lookup: {
                                from: 'companychannels',
                                localField: 'idChannel',
                                foreignField: '_id',
                                as: 'companychannels'
                            }
                        },
                        {$unwind: '$companychannels'},
                        {
                            $lookup: {
                                from: 'companies',
                                localField: 'companychannels.idCompany',
                                foreignField: '_id',
                                as: 'company'
                            }
                        },
                        {$match: {'company._id': _.convertObjectId(req.query.company)}},
                        {$group: {_id: '$_id'}}
                    ], function (err, result) {
                        callback(err, _.pluck(result, '_id'));
                    });
                },
                updateBy: function (callback) {
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
                    if (!req.query.field_so_dien_thoai) return callback(null, null);
                    _CCKFields['field_so_dien_thoai'].db.find(
                        {value: {$regex: new RegExp(_.stringRegex(req.query.field_so_dien_thoai), 'i')}},
                        {entityId: 1},
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

                if (result.services !== null) cond.push({$match: {idService: {$in: result.services}}});
                if (result.updateBy !== null) cond.push({$match: {updateBy: {$in: result.updateBy}}});
                if (result.phoneNumber !== null) cond.push({$match: {idCustomer: {$in: result.phoneNumber}}});

                if (_.has(req.query, 'ticketReasonCategory'))
                    cond.push({$match: {ticketReasonCategory: _.convertObjectId(req.query.ticketReasonCategory)}});
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
                    cond.push({$match: {note: {$regex: new RegExp(_.stringRegex(req.query.note), 'i')}}});

                callback(err, cond);
            })
        },
        function findTicket(cond, callback) {
            var aggregate = _TicketsChat.aggregate();
            var agg = aggregate._pipeline;
            if (!_.isEmpty(cond)) {
                for (var i = 0; i < cond.length; ++i) {
                    agg.push(cond[i]);
                }
            }

            if (status !== null) agg.push({$match: {status: status}});

            if (_.has(req.query, 'sort')) {
                var stringArr = req.query.sort.split(':');
                var sortValue = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
                var obj = {};
                obj[stringArr[0]] = sortValue;
                agg.push({$sort: obj});
            }
            _TicketsChat.aggregatePaginate(aggregate, {page: page, limit: rows}, function (err, ticket, pageCount, total) {
                if (err) return callback(err, null);

                var paginator = new pagination.SearchPaginator({
                    prelink: '/inbound-chat',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: total
                });
                var ticketIds = _.pluck(ticket, '_id');
                callback(null, ticketIds, paginator.getPaginationData());
            });
        },
        function collectInfo(ticketIds, paging, callback) {
            var agg = [];
            agg.push(
                {$match: {_id: {$in: ticketIds}}},
                {
                    $lookup: {
                        from: 'servicechats',
                        localField: 'idService',
                        foreignField: '_id',
                        as: 'service'
                    }
                },
                {$unwind: '$service'},
                {
                    $lookup: {
                        from: 'companychannels',
                        localField: 'service.idChannel',
                        foreignField: '_id',
                        as: 'channel'
                    }
                },
                {$unwind: '$channel'},
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'channel.idCompany',
                        foreignField: '_id',
                        as: 'service.idCompany'
                    }
                },
                {$unwind: '$service.idCompany'},
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
                        from: 'field_so_dien_thoai',
                        localField: 'idCustomer',
                        foreignField: 'entityId',
                        as: 'field_so_dien_thoai'
                    }
                },
                {$unwind: '$field_so_dien_thoai'},
                {
                    $lookup: {
                        from: 'ticketreasoncategories',
                        localField: 'ticketReasonCategory',
                        foreignField: '_id',
                        as: 'trc'
                    }
                },
                {$unwind: {path: '$trc', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: '$_id',
                        updateBy: {$first: '$updateBy.displayName'},
                        //idAgent: {$first: '$idAgent.displayName'},
                        deadline: {$first: '$deadline'},
                        updated: {$first: '$updated'},
                        status: {$first: '$status'},
                        //customer: {$first: '$idCustomer'},
                        field_so_dien_thoai: {$first: '$field_so_dien_thoai.value'},
                        //service: {$first: '$service.name'},
                        threadId:{$first:'$threadId'},
                        company: {$first: '$service.idCompany'},
                        note: {$first: '$note'},
                        ticketReasonCategory: {$first: '$trc.name'}
                    }
                }
            );

            _TicketsChat.aggregate(agg, function (err, tickets) {
                if (err) return callback(err, null);

                var temp = [];
                ticketIds.forEach(function (tId, index) {
                    tickets.forEach(function (el) {
                        if (_.isEqual(tId.toString(), el._id.toString())) {
                            return temp[index] = el;
                        }
                    });
                });

                callback(null, temp, paging);
            });
        }
    ], callback);
}

