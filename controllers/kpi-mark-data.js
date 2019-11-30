exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'queryAgent')) {
            //Todo: query danh sách QA theo điều kiện
            var match = [];
            if (_.has(req.query, 'nameAgent')) {
                match.push({displayName: {$regex: new RegExp(_.stringRegex(req.query.nameAgent), 'i')}});
            }
            if (_.has(req.query, 'idCompany')) {
                var id = new mongodb.ObjectId(req.query['idCompany']);
                match.push({
                    $or: [
                        {'groupMembers.idParent': id},
                        {'groupLeaders.idParent': id},
                        {'companyLeaders.company': id}
                    ]
                });
            }
            if (_.has(req.query, 'idGroup')) {
                var id = new mongodb.ObjectId(req.query['idGroup']);
                match.push({
                    $or: [
                        {'groupMembers._id': id},
                        {'groupLeaders._id': id}
                    ]
                });
            }
            var query = match.length > 0 ? {$and: match} : {};
            var aggregate = _Users.aggregate();
            aggregate._pipeline = [
                {$unwind: {path: '$agentGroupMembers', preserveNullAndEmptyArrays: true}},
                {$unwind: {path: '$agentGroupLeaders', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'agentgroups',
                        localField: 'agentGroupMembers.group',
                        foreignField: '_id',
                        as: 'groupMembers'
                    }
                },
                {
                    $lookup: {
                        from: 'agentgroups',
                        localField: 'agentGroupLeaders.group',
                        foreignField: '_id',
                        as: 'groupLeaders'
                    }
                },
                {$match: query},
                {
                    $group: {
                        _id: '$_id',
                        displayName: {$first: '$displayName'},
                        agentGroupMembers: {$push: '$agentGroupMembers'},
                        agentGroupLeaders: {$push: '$agentGroupLeaders'},
                        companyLeaders: {$first: '$companyLeaders'}
                    }
                }
            ];
            _Users.aggregatePaginate(aggregate, {page: page, limit: rows}, function (err, users, pageCount, count) {
                if (!err) {
                    var ids = _.pluck(users, '_id');
                    var paginator = new pagination.SearchPaginator({
                        prelink: '/kpi-mark-data',
                        current: page,
                        rowsPerPage: rows,
                        totalResult: count
                    });
                    _Users.find({_id: {$in: ids}}).populate({
                        model: _AgentGroups,
                        path: 'agentGroupMembers.group agentGroupLeaders.group'
                    }).exec(function (e, r) {
                        if (!e) {
                            _Users.populate(r, {
                                model: _Company,
                                path: 'companyLeaders.company agentGroupMembers.group.idParent agentGroupLeaders.group.idParent'
                            }, function (err, resp) {
                                res.json({code: err ? 500 : 200, data: resp, paging: paginator.getPaginationData()});
                            });
                        }
                        else {
                            res.json({code: 500, data: []});
                        }
                    });
                }
            });
        }
        else if (_.has(req.query, 'queryGroup')) {
            //Todo: Query danh sách agent group
            _AgentGroups.find({idParent: new mongodb.ObjectId(req.query.idCompany), status: 1}, function (err, resp) {
                res.json({code: err ? 500 : 200, data: resp});
            });
        }
        else if (_.has(req.query, 'queryTicketMark') && _.has(req.query, 'idData')) {
            //Todo: Đếm tổng số lượng ticket đã chấm
            _KpiMarkTicket.count({
                idData: _.convertObjectId(req.query.idData),
                idMarking: {$ne: null}
            }, function (err, resp) {
                res.json({code: err ? 500 : 200, count: resp});
            });
        }
    },
    html: function (req, res) {
        //Todo: query và trả về danh sách bộ dữ liệu chấm điểm
        var paginator = {};
        _async.parallel({
            markData: function (next) {
                var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
                var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
                var sort = _.cleanSort(req.query, '');
                var query = _.cleanRequest(req.query);
                var aggregate = _KpiMarkData.aggregate();
                aggregate._pipeline = [];

                var _query = {};
                if (query['fname']) _query['name'] = {$regex: new RegExp(_.stringRegex(query['fname']), 'i')};
                if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: _query});
                if (!_.isEmpty(sort)) aggregate._pipeline.push({$sort: sort});

                aggregate._pipeline.push({
                    $lookup: {
                        from: 'kpimarktickets',
                        localField: '_id',
                        foreignField: 'idData',
                        as: 'ticketAdded'
                    }
                });
                _KpiMarkData.aggregatePaginate(aggregate, {
                    page: page,
                    limit: rows
                }, function (err, items, pageCount, total) {
                    paginator = new pagination.SearchPaginator({
                        prelink: '/kpi-mark-data',
                        current: page,
                        rowsPerPage: rows,
                        totalResult: total
                    });
                    _KpiMarkCollection.populate(items, {path: 'idCollection', select: 'name'}, function (e, r) {
                        _Users.populate(r, {path: 'createBy', select: 'displayName'}, next);
                    });

                });
            },
            markCollection: function (next) {
                _KpiMarkCollection.find({type: 0}).exec(next); //type: 0: voice, 1: chat, 2: email
            },
            markCompany: function(next){
                _Company.find({}, next);
            }
        }, function (err, resp) {
            _.render(req, res, 'kpi-mark-data', {
                title: 'Danh sách dữ liệu chấm điểm',
                paging: paginator.getPaginationData(),
                plugins: ['moment', ['chosen'], ['bootstrap-datetimepicker'], ['bootstrap-duallistbox'], ['bootstrap-select'], ['mrblack-table']],
                collection: resp.markCollection,
                company: resp.markCompany,
                data: resp.markData
            }, true);
        });
    }
};

exports.create = function (req, res) {
    //Todo: Tạo mới bộ dữ liệu
    var _body = _.chain(req.body).cleanRequest('_id').replaceMultiSpaceAndTrim().value();
    _body.status = parseInt(_body.status);
    _body.createBy = new mongodb.ObjectId(req.session.user._id);
    _body.updateBy = new mongodb.ObjectId(req.session.user._id);
    _body.idCompany = _.arrayObjectId(_body['idCompany']);
    if (_.has(_body, 'idCollection')) {
        _body['idCollection'] = new mongodb.ObjectId(_body['idCollection']);
    }
    _body['startDate'] = _moment(req.body['startDate'], 'DD/MM/YYYY')._d;
    _body['endDate'] = _moment(req.body['endDate'], 'DD/MM/YYYY')._d;
    if (_.has(_body, 'typeNumber') && _.isEqual(_body['typeNumber'], '2')) {
        _body['maxTicket'] += '%';
    }
    _KpiMarkData.create(_body, function (err, resp) {
        res.json({code: err ? 500 : 200});
    });
};

exports.update = function (req, res) {
    if (_.has(req.body, 'addIds')) {
        //Todo: Thêm agent và ticket vào danh sách cần chấm
        var ids = req.body.addIds.split(',');
        _KpiMarkData.findById(req.params['kpimarkdatum'], function (e, r) {
            var aIds = _.map(r.agents, function (id) {
                return id.toString();
            });
            ids = _.difference(ids, aIds);
            var mongoIds = _.arrayObjectId(ids);
            _KpiMarkData.findOneAndUpdate({_id: new mongodb.ObjectId(req.params['kpimarkdatum'])}, {$addToSet: {agents: {$each: ids}}}, function (err, result) {
                _KpiMarkData.findById(req.params['kpimarkdatum']).populate('agents').exec(function (err, data) {
                    //Todo: Lấy số lượng ticket theo yêu cầu
                    var number = data.maxTicket;
                    var agg = _Tickets.aggregate();
                    agg._pipeline = [
                        {$match: {idAgent: {$in: mongoIds}}},
                        {
                            $lookup: {
                                from: 'campains',
                                localField: 'idCampain',
                                foreignField: '_id',
                                as: 'idCampain'
                            }
                        },
                        {
                            $lookup: {
                                from: 'services',
                                localField: 'idService',
                                foreignField: '_id',
                                as: 'idService'
                            }
                        },
                        {$unwind: {
                            path: '$idCampain',
                            preserveNullAndEmptyArrays: true
                        }},
                        {$unwind: {
                            path: '$idService',
                            preserveNullAndEmptyArrays: true
                        }},
                        {$match: {
                            $or: [
                                {'idCampain.idCompany': {$in: r.idCompany}},
                                {'idService.idCompany': {$in: r.idCompany}}
                            ]
                        }},
                        {$unwind: '$callId'},
                        {
                            $lookup: {
                                from: 'cdrtransinfos',
                                localField: 'callId',
                                foreignField: 'callId',
                                as: 'trans'
                            }
                        },
                        {$unwind: {
                            path: '$trans',
                            preserveNullAndEmptyArrays: false
                        }},
                        {
                            $match: {'trans.serviceType': 3} //chỉ duyệt các bản ghi cdrtransinfos có serviceType=3
                        },
                        {$group: {
                            _id: '$_id',
                            idAgent: {
                                $first: '$idAgent'
                            },
                            trans: {
                                $push: '$trans'
                            }
                        }},
                        {
                            $group: {
                                _id: '$idAgent',
                                tickets: {$push: '$_id'},
                                cdrTransInfos: {
                                    $push: "$trans"
                                }
                            }
                        }
                    ];
                    agg.exec(function (error, agents) {
                        var _kpiTicketBulk = mongoClient.collection('kpimarktickets').initializeUnorderedBulkOp({useLegacyOps: true});
                        var _bulkIndex = 0;
                        _async.each(agents, function (agent, cb) {
                            var tickets = [];
                            _async.forEachOf(agent.tickets, function (value, index, fn) {
                                if (agent.cdrTransInfos[index].length > 0 && agent.cdrTransInfos[index][0].recordPath) {
                                    //bỏ qua các bản ghi cdrTransInfo không có file ghi âm
                                    tickets.push(agent.tickets[index]);
                                }
                                fn();
                            }, function (err) {
                                if (tickets.length > 0) {
                                    var num = 0;
                                    if (number.indexOf('%') >= 0) {
                                        num = Number(number.replace('%', '')) / 100 * tickets.length;
                                    }
                                    else {
                                        num = Number(number);
                                    }
                                    //Todo: Thêm ticket vào bảng tạm
                                    //limit số bản ghi
                                    tickets = tickets.splice(0, num);
                                    _async.each(tickets, function (ticket, next) {
                                        _kpiTicketBulk.insert({
                                            idTicket: ticket,
                                            idData: new mongodb.ObjectId(req.params['kpimarkdatum']),
                                            idAgent: agent._id,
                                            createBy: new mongodb.ObjectId(req.session.user._id),
                                            updateBy: new mongodb.ObjectId(req.session.user._id),
                                            status: 1
                                        });
                                        _bulkIndex++;
                                        next();
                                    }, function (e, r) {
                                        cb();
                                    });
                                }
                                else {
                                    cb();
                                }
                            });
                        }, function (er, result) {
                            if (Number(_bulkIndex) > 0) {
                                _kpiTicketBulk.execute(function (err, list) {
                                    res.json({code: err ? 500 : 200, data: data.agents});
                                });
                            }
                            else {
                                res.json({code: err ? 500 : 200, data: data.agents});
                            }

                        });
                    });
                });
            });
        });

    }
    else if (_.has(req.body, 'removeIds')) {
        //Todo: Xóa agent và ticket khỏi danh sách cần chấm
        var ids = req.body.removeIds.split(',');
        var mongodIds = _.map(ids, function (id) {
            return new mongodb.ObjectId(id);
        });
        _async.parallel({
            clearTicket: function (next) {
                _KpiMarkTicket.remove({
                    idAgent: {$in: mongodIds},
                    idData: new mongodb.ObjectId(req.params['kpimarkdatum'])
                }, next);
            },
            updateMarkData: function (next) {
                _KpiMarkData.update({_id: new mongodb.ObjectId(req.params['kpimarkdatum'])}, {$pull: {agents: {$in: ids}}}, next);
            }
        }, function (err, resp) {
            _KpiMarkData.findById(req.params['kpimarkdatum']).populate('agents').exec(function (err, data) {
                res.json({code: err ? 500 : 200, data: data.agents});
            });
        });
    }
};

exports.destroy = function (req, res) {
    //Todo: Xóa bản ghi bộ dữ liệu chấm điểm
    if (_.has(req.params, 'kpimarkdatum') && _.isEqual(req.params['kpimarkdatum'], 'all')) {
        var params = req.body.ids.split(',');
        _KpiMarkData.find({_id: {$in: params}, $where: 'this.agents.length > 0'}, function (err, data) {
            if (data.length == 0) {
                _KpiMarkData.remove({_id: {$in: params}}, function (err, result) {
                    res.json({code: err ? 500 : 200, message: err ? err.message : result, data: []});
                });
            }
            else {
                res.json({code: err ? 500 : 200, data: data});
            }
        });
    }
    else {
        _KpiMarkData.find({_id: req.params['kpimarkdatum'], $where: 'this.agents.length > 0'}, function (err, data) {
            if (data.length == 0) {
                _KpiMarkData.remove({_id: req.params['kpimarkdatum']}, function (err, result) {
                    res.json({code: err ? 500 : 200, message: err ? err.message : result, data: []});
                });
            }
            else {
                res.json({code: err ? 500 : 200, data: data});
            }
        });
    }
};

exports.validate = function (req, res) {
    //Todo: Check trùng bộ dữ liệu mới
    var _query = _.chain(req.query).cleanRequest().replaceMultiSpaceAndTrim().value();
    var query = {name: _query.name};
    _KpiMarkData.findOne(query, function (error, f) {
        if (_.has(req.query, 'validateOnSubmit')) {
            res.json({code: _.isNull(f)});
        }
        else {
            res.json([req.query.fieldId, _.isNull(f)]);
        }
    });
};

exports.show = function (req, res) {
    //Todo: render trang thêm, xóa agent cần chấm
    _KpiMarkData
        .find({_id: req.params.kpimarkdatum})
        .populate('agents idCompany').exec(function(err, resp){
        if (!err && resp.length > 0) {
            _.render(req, res, 'kpi-mark-data-agent', {
                data: resp[0]
            }, true, err);
        }
        else {
            _.render(req, res, 'kpi-mark-data-agent', {}, true, new Error("Lỗi hệ thống, vui lòng thử lại"));
        }
    });

};