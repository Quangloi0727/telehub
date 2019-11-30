/**
 * Created by MrBlack.
 */

exports.index = function (req, res) {
    if (_.has(req.query, 'search')) {
        searchTicket(req, res);
        return;
    }
    if (!_.has(req.query, 'ticketID')) return;
    if (_.has(req.query, 'page')) {
        getTickets(req, function (err, result) {
            return res.json({code: err ? 500 : 200, message: err ? JSON.stringify(err) : result});
        });
        return;
    }

    _Tickets.findById(req.query.ticketID)
        .populate({
            path: 'idService',
            model: _Services,
            select: 'idCompany idSkill name _id',
            populate: {
                path: 'idCompany',
                model: _Company,
                select: 'companyProfile _id',
                populate: {
                    path: 'companyProfile',
                    model: _CompanyProfile,
                    select: 'fieldId -_id',
                    populate: {
                        path: 'fieldId',
                        model: _CustomerFields,
                        select: 'displayName modalName status isRequired fieldValue fieldType weight -_id',
                        options: {sort: {weight: 1, displayName: 1}}
                    }
                }
            }
        })
        .populate({path: 'createBy', model: _Users, select: 'displayName'})
        .populate({
            path: 'idCampain',
            model: _Campains,
            select: 'idCompany idCategoryReason idSurvey name _id',
            populate: {
                path: 'idCompany',
                model: _Company,
                select: 'companyProfile _id',
                populate: {
                    path: 'companyProfile',
                    model: _CompanyProfile,
                    select: 'fieldId -_id',
                    populate: {
                        path: 'fieldId',
                        model: _CustomerFields,
                        select: 'displayName modalName status isRequired fieldValue fieldType weight -_id',
                        options: {sort: {weight: 1, displayName: 1}}
                    }
                }
            },
        })
        .exec(function (error, t) {
            if (_.isNull(t)) return res.render('404', {title: '404 | Page not found'});
            var myAgentGroup = getAgentGroup(req.session.user);
            // Lấy dữ liệu liên quan của ticket
            _async.parallel(collectionTicketInfo(req, t, true), function (error, result) {
                _.render(req, res, 'layout/customer-info', _.extend({
                    fnInfo: dynamicCustomerInfo,
                    fields: t[(!_.isNull(t.idService) ? 'idService' : 'idCampain')].idCompany.companyProfile.fieldId,
                    serviceName: (t.idService ? 'Chiến dịch gọi vào: ' + t.idService.name : 'Chiến dịch gọi ra : ' + t.idCampain.name),
                    title: 'Demo',
                    currentTicket: t,
                    'custom-view': true,
                    plugins: ['moment', 'zoka', ['bootstrap-select'], ['bootstrap-datetimepicker'], ['chosen']]
                }, result), true, error);
            });
        });
};

// POST
exports.create = function (req, res) {
    if (_.has(req.body, '_id')) {
        getTicketDetail(req, res);
    } else {
        searchTicket(req, res);
    }
};

// PUT
exports.update = function (req, res) {
    var params = req.params.customerinfo.split('-');
    //if (params.length < 2 || !mongodb.ObjectID.isValid(params[1]))
    //    return res.json({code: 500, message: 'Tham số truyền vào không phải ID : ' + params[1]});

    var _body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
    switch (params[0]) {
        case 'customer':
            _.updateCustomer(params[1], _body, function (err) {
                res.json({code: err ? 500 : 200, message: err ? err : 'Cập nhật thông tin khách hàng thành công !'});
            });
            break;
        case 'editTicket':
            if (!_.has(req.session.user, '_id')) {
                return res.json({code: 500 , message: 'Tài khoản của bạn đã bị đăng xuất, vui lòng đăng nhập lại!'});
            }
            updateTicket(req.session.user._id, params[1], _body, function (err) {
                res.json({code: err ? 500 : 200, message: err ? err : 'Cập nhật ticket thành công !'});
            });
            break;
        case 'survey':
            saveSurvey(req, res);
            break;
    }
};

/**
 * Vẽ giao diện input thông tin khách hàng
 * @param el Dữ liệu customer field
 * @param v Dữ liệu đầu vào khách hàng
 * @returns {*}
 */
function dynamicCustomerInfo(el, v) {
    var _tag = '';
    var _attr = {};
    var _sattr = [];
    var _childs = [];
    var _val = (v && _.has(v, el.modalName) && !_.isEmpty(v[el.modalName]) && !_.isNull(v[el.modalName]) && v[el.modalName].length && _.has(v[el.modalName][0], 'value')) ? v[el.modalName][0].value : '';

    switch (el.fieldType) {
        case 1:
        case 3:
            _tag = 'input';
            _attr = {
                value: _val,
                class: 'form-control' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
                type: 'text',
                id: 'edit_' + el.modalName,
                name: el.modalName
            }
            break;
        case 2:
            _tag = 'input';
            _attr = {
                value: _val,
                class: 'form-control' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
                type: 'number',
                id: 'edit_' + el.modalName,
                name: el.modalName
            }
            break;
        case 4:
            _sattr.push('multiple');
        case 5:
            _tag = 'select';
            _attr = {
                class: 'selectpicker' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
                id: 'edit_' + el.modalName,
                name: el.modalName + '[]'
            };
            _childs.push({
                tag: 'option',
                attr: {value: ''},
                sattr: ['selected'],
                content: '---- Chọn ----'
            });
            _.each(el.fieldValue, function (ev) {
                _childs.push({
                    tag: 'option',
                    attr: {value: ev},
                    sattr: _.indexOf(_val, ev) >= 0 ? ['selected'] : [],
                    content: ev
                });
            });
            break;
        case 6:
            _tag = 'div';
            _attr = {class: 'input-group'};
            _childs = [
                {
                    tag: 'input',
                    attr: {
                        class: 'form-control date-picker' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
                        value: _moment(_val).format('DD/MM/YYYY'),
                        type: 'text',
                        id: 'edit_' + el.modalName,
                        name: el.modalName
                    }
                },
                {
                    tag: 'span',
                    attr: {class: 'input-group-addon p-l-10 bgm-gray c-white'},
                    childs: [{
                        tag: 'i',
                        attr: {
                            role: 'button',
                            class: 'zmdi zmdi-calendar'
                        }
                    }]
                }
            ];
            break;
        case 7:
            _tag = 'input';
            _attr = {
                value: _val,
                class: 'form-control validate[custom[number]' + _.switch(el.isRequired, [0, 1], ['', ',required'] + ']'),
                type: 'text',
                id: 'edit_' + el.modalName,
                name: el.modalName + ':string'
            }
            break;
    }

    return _.htmlTags([{
        tag: _tag,
        attr: _attr,
        sattr: _sattr,
        childs: _childs.length ? _childs : []
    }]);
};

/**
 * Cập nhật dữ liệu khách hàng
 * @param userId ID agent
 * @param ticketId ID ticket
 * @param obj Dữ liệu liên quan của ticket
 * @param callback
 * @returns {*}
 */
function updateTicket(userId, ticketId, obj, callback) {
    userId = new mongodb.ObjectID(userId);
    ticketId = new mongodb.ObjectID(ticketId);
    if (!_.isEqual(obj.ticketSubreason, '')) {
        var reasonId = obj.ticketSubreason.split('-');
        obj['ticketReasonCategory'] = !!reasonId[0] ? new mongodb.ObjectID(reasonId[0]) : null;
        obj['ticketReason'] = !!reasonId[1] ? new mongodb.ObjectID(reasonId[1]) : null;
        obj['ticketSubreason'] = !!reasonId[2] ? new mongodb.ObjectID(reasonId[2]) : null;
    } else if (!_.isEqual(obj.ticketReasonCategory, '')) {
        obj['ticketReasonCategory'] = new mongodb.ObjectID(obj['ticketReasonCategory']);
        delete obj.ticketSubreason;
    } else {
        delete obj.ticketSubreason;
        delete obj.ticketReasonCategory;
    }

    var assignTo = null;

    if (!_.isEmpty(obj.assignTo) && !_.isEqual(obj.assignTo, '')) {
        var assign = obj.assignTo.split('-');
        if (assign.length != 2 || !mongodb.ObjectID.isValid(assign[1])) return callback('Không đúng định dạng assign');

        if (_.isEqual(assign[0], 'g')) {
            obj['groupId'] = new mongodb.ObjectID(assign[1]);
            obj['idAgent'] = null;
            obj['assignTo'] = null;
        } else if (_.isEqual(assign[0], 'a')) {
            obj['groupId'] = null;
            obj['idAgent'] = new mongodb.ObjectID(assign[1]);
            obj['assignTo'] = new mongodb.ObjectID(assign[1]);
            assignTo = assign[1];
        }
        obj['assignBy'] = userId;
    }

    if (_.isEqual(obj.assignTo, '')) delete obj.assignTo;

    if (!_.isEqual(obj.deadline, '')) {
        obj['deadline'] = _moment(obj['deadline'], 'HH:mm DD/MM/YYYY')._d;
    } else {
        obj['deadline'] = null;
    }

    if (_.has(obj, 'customerStatisfy') && !_.isEqual(obj.customerStatisfy, '')) {
        var temp = obj.customerStatisfy.split('-');
        obj['customerStatisfy'] = _.convertObjectId(temp[0]);
        if (temp.length > 1){
            obj['customerStatisfyStage'] = _.convertObjectId(temp[1]);
        }else{
            obj['customerStatisfyStage'] = null;
        }
    }else{
        obj['customerStatisfy'] = null;
        obj['customerStatisfyStage'] = null;
    }

    obj['updated'] = new Date();
    obj['updateBy'] = userId;
    obj['status'] = parseInt(obj['status']);
    _Tickets.findByIdAndUpdate(ticketId, {$set: obj}, {new: true}, function (err, result) {
        if (err) return callback(err, result);
        var obj = {};
        obj['ticketId'] = result._id;
        obj['ticketObject'] = result;
        _TicketHistory.create(obj, callback)
        if(assignTo) _.pushNotification(1, 'ticket-edit?ticketID='+result._id, assignTo);
    });
}

/**
 * Lấy thông tin nhóm tình trạng ticket
 * @param t
 * @param callback
 */
function getTicketReason(t, callback) {
    var agg = [];
    if (!_.isEmpty(t.idCampain)) {
        agg.push({$match: {_id: t.idCampain.idCategoryReason}});
        //agg.push({$match: {$or: [{category: 0}, {category: 2}]}});
    } else if (!_.isEmpty(t.idService)) {
        agg.push({$match: {$or: [{category: 0}, {category: 1}]}});
    }

    agg.push(
        {$match: {status: 1}},
        {$project: {_id: 1, name: 1}},
        {$lookup: {from: 'ticketreasons', localField: '_id', foreignField: 'idCategory', as: 'tr'}},
        {$unwind: {path: '$tr', preserveNullAndEmptyArrays: true}},
        {$sort: {'tr.priority': 1}},
        {$lookup: {from: 'ticketsubreasons', localField: 'tr._id', foreignField: 'idReason', as: 'tr.subReason'}},
        {$group: {_id: '$_id', name: {$first: '$name'}, tReason: {$push: {trId: '$tr._id', name: '$tr.name', subReason: '$tr.subReason'}}}},
        {$project: {_id: 1, name: 1, tReason: {trId: 1, name: 1, subReason: {_id: 1, name: 1, priority: 1}}}}
    );

    _TicketReasonCategory.aggregate(agg, function (err, result) {
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

/**
 * Lấy dữ liệu ticket
 * @param req
 * @param res
 */
function getTicketDetail(req, res) {
    _Tickets.findById(req.body._id)
        .populate({path: 'idService', model: _Services, select: 'idCompany idSkill name _id'})
        .populate({path: 'idCampain', model: _Campains, select: 'idCompany idCategoryReason idSurvey name _id'})
        .populate({path: 'updateBy', model: _Users, select: 'name displayName'})
        .exec(function (error, t) {
            if (error) return res.json({code: 500, message: JSON.stringify(error)});
            if(_.isEmpty(t)) return res.json({code: 500, message: 'Phiếu không tồn tại'});
            _async.parallel(collectionTicketInfo(req, t, false), function (err, result) {
                if (err) return res.json({code: 500, message: err.message});

                var temp = {
                    ticket: t,
                    info: result,
                    serviceName: (t.idService ? 'Chiến dịch gọi vào: ' + t.idService.name : 'Chiến dịch gọi ra : ' + t.idCampain.name)
                };
                res.json({code: 200, message: temp});
            });
        });
}

/**
 * Tạo mới ticket
 * @param req
 * @param callback
 * @returns {*}
 */
function getTickets(req, callback) {

    // TODO: write correct function here
    return callback(null, []);

    _async.waterfall([
        function findTicket(callback) {
            _Tickets.findById(req.query.ticketID, callback);
        },
        function createCondition(t, callback) {


            var cond = {idCustomer: t.idCustomer, _id: {$ne: t._id}};
            if (_.isNull(req.session.auth.company)) { // Tenant Leader
                callback(null, t, cond);
            } else if (req.session.auth.company.leader || req.session.auth.company.group.leader) { // Company Leader vs Agent Group Leader
                var companyId = new mongodb.ObjectID(req.session.auth.company._id);
                _Company.aggregate([
                    {$match: {_id: companyId}},
                    {$lookup: {from: 'services', localField: '_id', foreignField: 'idCompany', as: 'service'}},
                    {$lookup: {from: 'campains', localField: '_id', foreignField: 'idCompany', as: 'campain'}},
                    {$project: {_id: 1, 'service._id': 1, 'campain._id': 1}}
                ], function (err, result) {
                    if (err) return callback(err, null);
                    var temp = _.reduce(result, function (memo, item) {
                        var service = item.service ? _.pluck(item.service, '_id') : [];
                        var campain = item.campain ? _.pluck(item.campain, '_id') : [];
                        memo['service'] = _.union(memo['service'], _.map(service, function (item) {
                            return item.toString();
                        }));
                        memo['campain'] = _.union(memo['campain'], _.map(campain, function (item) {
                            return item.toString();
                        }));
                        return memo;
                    }, {});
                    cond['$or'] = [{idService: {$in: temp['service']}}, {idCampain: {$in: temp['campain']}}];
                    callback(err, t, cond);
                })
            } else { // member
                var userId = new mongodb.ObjectID(req.session.user._id);
                cond['$or'] = [{idAgent: userId}, {assignTo: userId}];
                callback(null, t, cond);
            }
        },
        function findTickets(t, cond, callback) {
            var page = _.has(req.query, 'page') ? req.query.page : 1;
            var rows = 10;
            _Tickets
                .find(cond)
                .populate({path: 'updateBy', model: _Users, select: 'name displayName'})
                .populate({path: 'ticketSubreason', model: _TicketSubreason, select: 'name _id'})
                .populate({path: 'ticketReasonCategory', model: _TicketReasonCategory, select: 'name _id'})
                .sort({created: 1})
                .paginate(page, rows, function (error, result, total) {
                    var paginator = new pagination.SearchPaginator({
                        prelink: '/ticket-edit?ticketID=' + t._id,
                        current: page,
                        rowsPerPage: rows,
                        totalResult: total
                    });
                    var obj = {};
                    obj['data'] = result;
                    obj['paging'] = paginator.getPaginationData();
                    callback(error, obj);
                })
        }
    ], callback);
}

/**
 *
 * @param Lấy danh sách agent có thể assign
 * @param user
 * @param callback
 */
function getAssignUsers(ticket, user, callback) {
    var agg = [];
    var companyId = null;
    var company = null;
    if (ticket.idService) {
        company = ticket.idService.idCompany;
        companyId = _.isEmpty(company._id) ? company : company._id;
    } else if (ticket.idCampain) {
        company = ticket.idCampain.idCompany;
        companyId = _.isEmpty(company._id) ? company : company._id;
    }

    agg.push(
        {$match: {status: 1, idParent: _.convertObjectId(companyId)}},
        {$lookup: {from: 'companies', localField: 'idParent', foreignField: '_id', as: 'company'}},
        {$unwind: '$company'}
    );

    agg.push(
        {$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupMembers.group', as: 'agm'}},
        {$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupLeaders.group', as: 'agl'}},
        {
            $project: {
                _id: 1,
                name: 1,
                agm: {
                    $filter: {
                        input: "$agm",
                        as: "agm",
                        cond: {
                            $and: [
                                {$eq: ["$$agm.status", 1]},
                                //{$ne: ["$$agm._id", new mongodb.ObjectID(user._id)]}
                            ]
                        }
                    }
                },
                agl: {
                    $filter: {
                        input: "$agl",
                        as: "agl",
                        cond: {
                            $and: [
                                {$eq: ["$$agl.status", 1]},
                                //{$ne: ["$$agl._id", new mongodb.ObjectID(user._id)]}
                            ]

                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                agm: {_id: 1, name: 1, displayName: 1},
                agl: {_id: 1, name: 1, displayName: 1}
            }
        }
    );

    _AgentGroups.aggregate(agg, function (err, result) {
        if (err) return callback(err, null);
        if (!user) {
            log.debug('session.user =  undefined ');
            return callback('session.user undefined', null);
        };

        var pmIndex = _.chain(user.ternalLeaders)
            .pluck('ternal')
            .map(function (item) {
                return item.toString();
            })
            .indexOf(_config.app._id)
            .value();

        var clIndex = _.chain(user.companyLeaders)
            .pluck('company')
            .map(function (item) {
                return item.toString();
            })
            .indexOf(companyId)
            .value();

        if (pmIndex >= 0 || clIndex >= 0) {
            // no limit
            callback(err, result);
        } else {
            var memberGroup = user.agentGroupMembers ? _.pluck(user.agentGroupMembers, 'group') : [];
            var leaderGroup = user.agentGroupLeaders ? _.pluck(user.agentGroupLeaders, 'group') : [];
            var myAgentGroup = _.union(memberGroup, leaderGroup);

            var temp = _.reduce(result, function (memo, item) {
                var tmp = item;
                if (myAgentGroup.indexOf(item._id.toString()) < 0) {
                    tmp.agm = [];
                    tmp.agl = [];
                }
                memo.push(tmp);
                return memo;
            }, []);
            callback(err, temp);
        }
    })
};

/**
 * Lấy danh sách nhóm agent ủy quyền
 * @param user
 * @returns {*}
 */
function getAgentGroup(user) {
    if (_.isEmpty(user)) return [];
    var memberGroup = user.agentGroupMembers ? _.pluck(user.agentGroupMembers, 'group') : [];
    var leaderGroup = user.agentGroupLeaders ? _.pluck(user.agentGroupLeaders, 'group') : [];
    return _.map(_.union(memberGroup, leaderGroup), function (item) {
        return new mongodb.ObjectID(item);
    })
}

/**
 * Lấy danh sách ticket liên quan
 * @param req
 * @param res
 */
function searchTicket(req, res) {
    _async.parallel({
        reasonCategory: function (callback) {
            // Lọc nhóm tình trạng ticket
            if (!_.has(req.query, 'ticketReasonCategory')) return callback(null, null);
            _TicketReasonCategory.find({
                status: 1,
                name: {$regex: new RegExp(_.stringRegex(req.query.ticketReasonCategory), 'i')}
            }, '_id', callback);
        },
        subReason: function (callback) {
            // Lọc lý do tình trạng
            if (!_.has(req.query, 'ticketSubreason')) return callback(null, null);
            _TicketSubreason.find({
                status: 1,
                name: {$regex: new RegExp(_.stringRegex(req.query.ticketSubreason), 'i')}
            }, '_id', callback)
        },
        updateBy: function (callback) {
            // Lọc theo người cập nhật
            if (!_.has(req.query, 'ticketUpdateBy')) return callback(null, null);
            _Users.find({
                $or: [
                    {name: {$regex: new RegExp(_.stringRegex(req.query.ticketUpdateBy), 'i')}},
                    {displayName: {$regex: new RegExp(_.stringRegex(req.query.ticketUpdateBy), 'i')}}
                ]
            }, '_id', callback);
        },
        //searchCond: function (callback) {
        //    var cond = {idCustomer: new mongodb.ObjectID(req.query.idCustomer), _id: {$ne: new mongodb.ObjectID(req.query.tId)}};
        //
        //    if (_.isNull(req.session.auth.company)) { // Tenant Leader
        //        callback(null, cond);
        //    } else if (req.session.auth.company.leader || req.session.auth.company.group.leader) { // Company Leader vs Agent Group Leader
        //        var companyId = new mongodb.ObjectID(req.session.auth.company._id);
        //        _Company.aggregate([
        //            {$match: {_id: companyId}},
        //            {$lookup: {from: 'services', localField: '_id', foreignField: 'idCompany', as: 'service'}},
        //            {$lookup: {from: 'campains', localField: '_id', foreignField: 'idCompany', as: 'campain'}},
        //            {$project: {_id: 1, 'service._id': 1, 'campain._id': 1}}
        //        ], function (err, result) {
        //            if (err) return callback(err, null);
        //            var temp = _.reduce(result, function (memo, item) {
        //                var service = item.service ? _.pluck(item.service, '_id') : [];
        //                var campain = item.campain ? _.pluck(item.campain, '_id') : [];
        //                memo['service'] = _.union(memo['service'], _.map(service, function (item) {
        //                    return item.toString();
        //                }));
        //                memo['campain'] = _.union(memo['campain'], _.map(campain, function (item) {
        //                    return item.toString();
        //                }));
        //                return memo;
        //            }, {});
        //            cond['$or'] = [{idService: {$in: temp['service']}}, {idCampain: {$in: temp['campain']}}];
        //            callback(err, cond);
        //        })
        //    } else { // member
        //        var userId = new mongodb.ObjectID(req.session.user._id);
        //        cond['$or'] = [{idAgent: userId}, {assignTo: userId}];
        //        callback(null, cond);
        //    }
        //},
        services: function (callback) {
            // Lọc theo chiến dịch gọi ra và gọi vào
            var myAgentGroup = getAgentGroup(req.session.user);
            _AgentGroups.aggregate([
                {$match: {status: 1, _id: {$in: myAgentGroup}}},
                {$lookup: {from: 'companies', localField: 'idParent', foreignField: '_id', as: 'company'}},
                {$unwind: '$company'},
                {$group: {_id: '$company._id'}},
                {$lookup: {from: 'services', localField: '_id', foreignField: 'idCompany', as: 'service'}},
                {$lookup: {from: 'campains', localField: '_id', foreignField: 'idCompany', as: 'campain'}},
                {$project: {_id: 1, 'service._id': 1, 'campain._id': 1}}
            ], function (err, result) {
                if (err) return callback(err, null);

                var temp = _.reduce(result, function (memo, item) {
                    var service = item.service ? _.pluck(item.service, '_id') : [];
                    var campain = item.campain ? _.pluck(item.campain, '_id') : [];
                    memo['service'] = _.union(memo['service'], _.map(service, function (item) {
                        return item.toString();
                    }));
                    memo['campain'] = _.union(memo['campain'], _.map(campain, function (item) {
                        return item.toString();
                    }));
                    return memo;
                }, {});
                callback(err, temp);
            });
        },
        //trungdt jira 919
        searchCompany: function(next){
            // Lọc theo công ty
            if (!_.has(req.query, 'company')) return next(null, null);
            _Company.aggregate([
                {$match: {name:  {$regex: new RegExp(_.stringRegex(req.query.company), 'i')}}},
                {$lookup: {from: 'services', localField: '_id', foreignField: 'idCompany', as: 'service'}},
                {$lookup: {from: 'campains', localField: '_id', foreignField: 'idCompany', as: 'campain'}},
                {$project: {_id: 1, 'service._id': 1, 'campain._id': 1}}
            ], function (err, result) {
                if (err) return callback(err, null);
                var temp = _.reduce(result, function (memo, item) {
                    var service = item.service ? _.pluck(item.service, '_id') : [];
                    var campain = item.campain ? _.pluck(item.campain, '_id') : [];
                    memo['service'] = _.union(memo['service'], _.map(service, function (item) {
                        return item.toString();
                    }));
                    memo['campain'] = _.union(memo['campain'], _.map(campain, function (item) {
                        return item.toString();
                    }));
                    return memo;
                }, {service: [], campain: []});
                var cond = {};
                cond['$or'] = [{idService: {$in: temp['service']}}, {idCampain: {$in: temp['campain']}}];
                next(err, cond);
            })
        }
        //trungdt jira 919
    }, function (err, result) {
        if (err) return res.json({code: 500, message: JSON.stringify(err)});
        var searchCondition = {idCustomer: new mongodb.ObjectID(req.query.idCustomer), _id: {$ne: new mongodb.ObjectID(req.query.tId)}};
        searchCondition['$or'] = [{idService: {$in: result.services['service']}}, {idCampain: {$in: result.services['campain']}}];

        if (_.has(req.query, 'note')) searchCondition['note'] = {$regex: new RegExp(_.stringRegex(req.query.note), 'i')};
        if (_.has(req.query, 'status')) searchCondition['status'] = parseInt(req.query.status);
        if (!_.isEmpty(result.reasonCategory)) searchCondition['ticketReasonCategory'] = {$in: _.pluck(result.reasonCategory, '_id')};
        if (!_.isEmpty(result.subReason)) searchCondition['ticketSubreason'] = {$in: _.pluck(result.subReason, '_id')};
        if (!_.isEmpty(result.updateBy)) searchCondition['updateBy'] = {$in: _.pluck(result.updateBy, '_id')};
        if (_.has(req.query, 'ticketDeadline')) {
            var searchDay = _moment(req.query.ticketDeadline, 'DD/MM/YYYY').startOf('day');
            var nextDay = _moment(searchDay).add(1, 'day');
            searchCondition['deadline'] = {$gte: searchDay._d, $lt: nextDay._d};
        }
        if (_.has(req.query, 'ticketUpdateDate')) {
            var searchDay = _moment(req.query.ticketUpdateDate, 'DD/MM/YYYY').startOf('day');
            var nextDay = _moment(searchDay).add(1, 'day');
            searchCondition['updated'] = {$gte: searchDay._d, $lt: nextDay._d};
        }

        var page = _.has(req.query, 'page') ? req.query.page : 1;
        var rows = 10;
        var prelink = '/ticket-edit?' + _.reduce(_.keys(req.query), function (memo, key) {
                if (_.isEqual(key, 'page') || key.indexOf('FormData') >= 0 || _.isEqual(key, '_')) return memo;
                if (memo != '') memo += '&';
                memo += (key + '=' + req.query[key]);
                return memo;
            }, '');
        _Tickets
            //trungdt jira 919
            .find(_.isEmpty(result.searchCompany) ? searchCondition : {$and: [searchCondition, result.searchCompany]})
            .populate({
                path: 'idService',
                model: _Services,
                select: 'idCompany name _id',
                populate: {
                    path: 'idCompany',
                    model: _Company,
                    select: 'name _id'
                }
            })
            .populate({
                path: 'idCampain',
                model: _Campains,
                select: 'idCompany name _id',
                populate: {
                    path: 'idCompany',
                    model: _Company,
                    select: 'name _id'
                }
            })
            //trungdt jira 919
            .populate({path: 'updateBy', model: _Users, select: 'name displayName'})
            .populate({path: 'ticketSubreason', model: _TicketSubreason, select: 'name -_id'})
            .populate({path: 'ticketReasonCategory', model: _TicketReasonCategory, select: 'name -_id'})
            .sort({created: 1})
            .paginate(page, rows, function (error, result, total) {
                var paginator = new pagination.SearchPaginator({prelink: prelink, current: page, rowsPerPage: rows, totalResult: total});
                var obj = {};
                obj['data'] = result;
                obj['paging'] = paginator.getPaginationData();
                res.json({code: err ? 500 : 200, message: err ? err : obj})
            })

    });
}

//****************
//****************
//****************
//****************
//****************
//**************** EDIT

/**
 * Kiểm tra với ticket hiện tại thì người dùng có được phép edit hay không
 *
 * @param req       - Current Request
 * @param t         - Current Ticket
 * @param callback  - Next tick
 */
function isEdit(req, t, callback) {
    return callback(null, req.session.user && _.isEqual(t.idAgent.toString(), req.session.user._id));

    if (_.isNull(req.session.auth.company)) {
        callback(null, true);
    } else if (req.session.auth.company.leader) {
        var companyId = !_.isEmpty(t.idService)
            ? t.idService.idCompany._id
            : t.idCampain.idCompany._id;

        callback(null, _.isEqual(convertToString(companyId), req.session.auth.company));
    } else if (req.session.auth.company.group.leader) {

        // group leader
        var groupId = _.convertObjectId(req.session.auth.company.group._id);

        _Users.find({
            $or: [
                {'agentGroupMembers.group': groupId},
                {'agentGroupLeaders.group': groupId}
            ]
        }, {_id: 1}, function (err, result) {
            if (err) return callback(err, null);
            var userId = _.chain(result)
                .pluck('_id')
                .map(function (item) {
                    return item.toString();
                })
                .value();

            var value = (_.indexOf(userId, convertToString(t.idAgent)) >= 0)
                || (_.isEqual(t.groupId.toString(), req.session.auth.company.group._id));
            callback(err, value);
        });
    } else {
        // agent group
        var value = (_.isEqual(convertToString(t.idAgent), req.session.user._id))
            || (_.isEqual(convertToString(t.assignTo), req.session.user._id));
        callback(null, value);
    }
}

/**
 * Lấy dữ liệu lịch sử ticket
 * @param ticketId
 * @param page
 * @param callback
 */
function getTicketHistory(ticketId, page, callback) {
    var rows = 10;
    _TicketHistory
        .find({ticketId: ticketId})
        .populate({path: 'ticketObject.updateBy', model: _Users, select: 'name displayName'})
        .populate({path: 'ticketObject.ticketSubreason', model: _TicketSubreason, select: 'name -_id'})
        .populate({path: 'ticketObject.ticketReasonCategory', model: _TicketReasonCategory, select: 'name -_id'})
        .paginate(page, rows, function (err, result, total) {
            if (err) return callback(err, null);
            var paginator = new pagination.SearchPaginator({
                prelink: '/ticket-history?ticketId=' + ticketId,
                current: page,
                rowsPerPage: rows,
                totalResult: total
            });
            var obj = {};
            obj['data'] = result;
            obj['paging'] = paginator.getPaginationData();
            callback(err, obj);
        });
}

/**
 * Lấy dữ liệu liên quan của ticket
 * @param req
 * @param t Dữ liệu ticket
 * @param getCustomerInfo Có lấy dữ liệu khách hàng hay không
 * @returns {{ticketReasonCategory: temp.ticketReasonCategory, assign: temp.assign, tickets: temp.tickets, survey: temp.survey, surveyResult: temp.surveyResult, isEdit: temp.isEdit, statisfy: temp.statisfy, ticketHistory: temp.ticketHistory}}
 */
function collectionTicketInfo(req, t, getCustomerInfo) {
    var temp = {
        ticketReasonCategory: function (callback) {
            getTicketReason(t, callback);
        },
        assign: function (callback) {
            getAssignUsers(t, req.session.user, callback);
        },
        tickets: function (callback) {
            getTickets(req, callback);
        },
        survey: function (callback) {
            if (t.idCampain == null) return callback(null, null);
            var surveyId = t.idCampain.idSurvey;
            _Surveys.aggregate([
                {$match: {_id: surveyId}},
                {$lookup: {from: 'surveyquestions', localField: '_id', foreignField: 'idSurvey', as: 'sq'}},
                {$unwind: '$sq'},
                {$lookup: {from: 'surveyanswers', localField: 'sq._id', foreignField: 'idQuestion', as: 'sq.sa'}},
                //{$lookup: {from: 'surveyresults', localField: 'sq._id', foreignField: 'idQuestion', as: 'sq.result'}},
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        'sq._id': 1,
                        'sq.questionType': 1,
                        'sq.answerType': 1,
                        'sq.content': 1,
                        //'sq.result': 1,
                        'sq.isStart': 1,
                        'sq.idNextQuestion': 1,
                        'sq.sa._id': 1,
                        'sq.sa.content': 1
                    }
                },
                {$group: {_id: '$_id', name: {$first: '$name'}, sq: {$push: '$sq'}}}
            ], function (err, result) {
                if (err) return callback(err, null);
                var temp = [];
                if (_.has(result[0], 'sq')) {
                    temp = result[0].sq;
                }
                callback(err, temp);
            });
        },
        surveyResult: function (callback) {
            if (_.isEmpty(t.idCampain)) return callback(null, null);
            _SurveyResult.find({
                idTicket: t._id,
                idSurvey: t.idCampain.idSurvey
            }, callback);
        },
        isEdit: function (callback) {
            isEdit(req, t, callback);
        },
        statisfy: function (callback) {
            _CustomerStatisfy.aggregate([
                {$match: {status: 1}},
                {$lookup: {from: 'customerstatisfystages', localField: '_id', foreignField: 'idCustomerStatisfy', as: 'cs'}},
                {$unwind: {path: '$cs', preserveNullAndEmptyArrays: true}},
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        cs: {
                            $cond: {
                                if: {$eq: ['$status', 1]},
                                then: '$cs',
                                else: null
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        name: {$first: '$name'},
                        cs: {
                            $push: {
                                _id: '$cs._id',
                                name: '$cs.name'
                            }
                        }
                    }
                }
            ], callback);
        },
        ticketHistory: function (callback) {
            getTicketHistory(t._id, 1, callback);
        }
    };

    if (getCustomerInfo) {
        temp['customer'] = function (callback) {
            var _agg = [{$match: {_id: t.idCustomer}}];
            _.each(t[(!_.isNull(t.idService) ? 'idService' : 'idCampain')].idCompany.companyProfile.fieldId, function (o) {
                _agg.push({$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}});
            });
            _Customer.aggregate(_agg, callback);
        };
    }

    return temp;
}

/**
 * Lưu dữ liệu câu hỏi khảo sát
 * @param req
 * @param res
 */
function saveSurvey(req, res) {
    var params = req.params.customerinfo.split('-');
    var ticketId = params[1];
    var surveyId = params[2];

    var _body = _.chain(cleanQuestion(req.body)).cleanRequest().replaceMultiSpaceAndTrim().value();

    mongodb.MongoClient.connect(_dbPath, function (err, db) {
        if (err) return err;
        if(!req.session.user) return res.json({code: 500, message: 'Session User Null'});
        var batch = db.collection('surveyresults').initializeUnorderedBulkOp({useLegacyOps: true});
        _.each(_.keys(_body), function (item, index) {
            batch.find({
                idTicket: _.convertObjectId(ticketId),
                idQuestion: _.convertObjectId(item),
                idSurvey: _.convertObjectId(surveyId)
            }).upsert().updateOne({
                $set: {
                    idTicket: _.convertObjectId(ticketId),
                    idQuestion: _.convertObjectId(item),
                    idSurvey: _.convertObjectId(surveyId),
                    answerContent: _body[item].content,
                    answerNote: _body[item].answerNote,
                    updateBy: _.convertObjectId(req.session.user._id),
                    status: 1
                }
            });
        });
        if (batch.s.currentIndex == 0) {
            db.close();
            return res.json({code: 200, message: 'OK'});
        }
        batch.execute(function (err, result) {
            db.close();
            res.json({code: err ? 500 : 200, message: err ? JSON.stringify(err) : 'OK'});
        });
    });

    function cleanQuestion(obj) {
        var tmp = {};
        _.each(_.keys(obj), function (key) {
            var keyArr = key.split('-');

            if (keyArr[0] == 'answerNote') {
                if (_.isEmpty(tmp[keyArr[1]])) tmp[keyArr[1]] = {content: null, answerNote: ''};

                tmp[keyArr[1]][keyArr[0]] = obj[key];
            } else {
                if (_.isEmpty(tmp[key])) tmp[key] = {content: null, answerNote: ''};

                if (Array.isArray(obj[key])) {
                    var arr = _.reduce(obj[key], function (memo, item) {
                        if (_.isEqual(item, '') || _.isEqual(item, '0')) return memo;
                        if (mongodb.ObjectID.isValid(item)) item = new mongodb.ObjectID(item);
                        memo.push(item);
                        return memo;
                    }, []);
                    if (arr.length > 0) tmp[key]['content'] = arr;
                }

                if (_.isString(obj[key])) {
                    if (!_.isEqual(obj[key], '')) {
                        if (mongodb.ObjectID.isValid(obj[key])) {
                            tmp[key]['content'] = new mongodb.ObjectID(obj[key]);
                        } else {
                            tmp[key]['content'] = obj[key];
                        }
                    } else {
                        tmp[key]['content'] = null;
                    }
                }
            }
        });
        return tmp;
    }
}