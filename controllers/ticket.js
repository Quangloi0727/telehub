exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (!_.has(req.query, 'idCustomer') || !_.has(req.query, 'type') || (['chat', 'mail'].indexOf(req.query.type) < 0)) return res.json({code: 404, message: 'Not found !'});
        var _query = _.cleanRequest(req.query, ['type', 'detail']);
        _query.idCustomer = new mongodb.ObjectId(_query.idCustomer);
        if (_.has(req.query, '_id') && _.has(req.query._id, '$ne')) req.query._id['$ne'] = new mongodb.ObjectId(req.query._id['$ne']);
        if (_.has(req.query, 'detail')) {
            _query._id = new mongodb.ObjectId(_query._id);
            global['_' + _.classify('tickets-' + req.query.type)].aggregate([
                {$match: _query},
                {$lookup: {from: 'ticketreasoncategories', localField: 'ticketReasonCategory', foreignField: '_id', as: 'ticketReasonCategory'}},
                {$unwind: {path: '$ticketReasonCategory', preserveNullAndEmptyArrays: true}},
                {$lookup: {from: 'ticketreasons', localField: 'ticketReason', foreignField: '_id', as: 'ticketReason'}},
                {$unwind: {path: '$ticketReason', preserveNullAndEmptyArrays: true}},
                {$lookup: {from: 'ticketsubreasons', localField: 'ticketSubreason', foreignField: '_id', as: 'ticketSubreason'}},
                {$unwind: {path: '$ticketSubreason', preserveNullAndEmptyArrays: true}},
            ], function (err, ticket) {
                res.json({code: err ? 500 : 200, message: err ? err : null, ticket: ticket.length ? ticket[0] : []});
            });
        }
        else {
            if (_.has(_query, 'deadline')) _query.deadline = {$gte: _moment(_query.deadline, 'DD/MM/YYYY').startOf('day')._d, $lte: _moment(_query.deadline, 'DD/MM/YYYY').endOf('day')._d,};
            if (_.has(_query, 'updated')) _query.updated = {$gte: _moment(_query.updated, 'DD/MM/YYYY').startOf('day')._d, $lte: _moment(_query.updated, 'DD/MM/YYYY').endOf('day')._d,};
            if (!_.has(_query, 'status')) _query.status = {$gte: 0};
            if (_.has(_query, 'ticketReasonCategory')) _query.ticketReasonCategory = new mongodb.ObjectId(_query.ticketReasonCategory);
            if (_.has(_query, 'ticketReason')) _query.ticketReasonCategory = new mongodb.ObjectId(_query.ticketReason);
            if (_.has(_query, 'ticketSubreason')) _query.ticketSubreason = new mongodb.ObjectId(_query.ticketSubreason);

            var _agg = global['_' + _.classify('tickets-' + req.query.type)].aggregate();
            _agg._pipeline = [
                {$match: _query},
                {$lookup: {from: 'ticketreasoncategories', localField: 'ticketReasonCategory', foreignField: '_id', as: 'ticketReasonCategory'}},
                {$unwind: {path: '$ticketReasonCategory', preserveNullAndEmptyArrays: true}},
                {$lookup: {from: 'ticketreasons', localField: 'ticketReason', foreignField: '_id', as: 'ticketReason'}},
                {$unwind: {path: '$ticketReason', preserveNullAndEmptyArrays: true}},
                {$lookup: {from: 'ticketsubreasons', localField: 'ticketSubreason', foreignField: '_id', as: 'ticketSubreason'}},
                {$unwind: {path: '$ticketSubreason', preserveNullAndEmptyArrays: true}},
                {$lookup: {from: 'users', localField: 'updateBy', foreignField: '_id', as: 'updateBy'}},
                {$unwind: {path: '$updateBy', preserveNullAndEmptyArrays: true}}
            ];
            global['_' + _.classify('tickets-' + req.query.type)].aggregatePaginate(_agg, {page: page, limit: 10}, function (err, ticket, pageCount, count) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/ticket',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: count
                });
                res.json({code: err ? 500 : 200, message: err ? err : null, ticket: ticket, paging: paginator.getPaginationData()});
            });
        }
    },
    html: function (req, res) {
        delete req.query['dialogId'];
        if (!_.has(req.query, 'type') || (['chat', 'mail'].indexOf(req.query.type) < 0) || !_.has(req.query, 'service') || !_.has(req.session, 'user') || _.isUndefined(req.session.user._id)) {
            res.render('404', {title: '404 | Page not found'});
        }
        else {
            var _type = req.query.type;
            delete req.query.type;
            var _comanyId = '';
            var _agent = req.session.user._id;
            var _ticketId = _.has(req.query, 'ticketId') ? req.query.ticketId : '';
            var _Modal = global['_' + _.classify('tickets-' + _type)];

            var _T = {
                "chat": {
                    c: {idService: req.query.service, idAgent: req.session.user._id, threadId: _.has(req.query, 'threadId') ? req.query.threadId : null, status: -1},
                    p: {path: 'idService', populate: {path: 'idChannel', model: _CompanyChannel}}
                },
                "mail": {
                    c: {idService: req.query.service, idAgent: req.session.user._id, mailId: _.has(req.query, 'mailId') ? req.query.mailId : null, status: -1},
                    p: {path: 'idService', populate: {path: 'idCompany', model: _Company}}
                }
            };

            _async.waterfall([
                function (next) {

                    if (_ticketId) {
                        _Modal.findById(_ticketId, function (error, ticket) {
                            if (error) return next(error);
                            _Modal.populate(ticket, _T[_type].p, next);
                        });
                    } else {
                        _Modal.create(_T[_type].c, function (error, ticket) {
                            if (error) return next(error);
                            _Modal.populate(ticket, _T[_type].p, next);
                        });
                    }
                },
                function (ticket, next) {
                    switch (_type) {
                        case 'chat':
                            if (_.has(ticket, 'idService') || _.isNull(ticket.idService)) return next({message: "Not have service !"});
                            _comanyId = ticket.idService.idChannel.idCompany;
                            break;
                        case 'mail':
                            if (_.has(ticket, 'idService') || _.isNull(ticket.idService)) return next({message: "Not have service !"});
                            _comanyId = ticket.idService.idCompany._id;
                            break;
                    }
                    _async.parallel({
                        CustomerId: function (callback) {
                            var _idCustomer = !_.isNull(ticket.idCustomer) ? ticket.idCustomer : (_.has(req.query, 'CustomerId') ? (mongodb.ObjectId(req.query.CustomerId) || null) : null);
                            if (!_.isNull(_idCustomer)) return callback(null, _idCustomer);
                            if (_.has(req.query, 'field_e_mail')) {
                                _CCKFields['field_e_mail'].db.findOne({value: req.query['field_e_mail']}, function (error, email) {
                                    if (!error && !_.isNull(email)) {
                                        callback(null, email.entityId);
                                    } else {
                                        callback(error, null);
                                    }
                                });
                            }
                            else {
								// 09-11-2016: Cuongnm 
                                //callback(null, null);
								if (_.has(req.query, 'field_so_dien_thoai')) {
									_CCKFields['field_so_dien_thoai'].db.findOne({value: req.query['field_so_dien_thoai']}, function (error, phone) {
										if (!error && !_.isNull(phone)) {
											callback(null, phone.entityId);
										} else {
											callback(error, null);
										}
									});
								}
								else {
									callback(null, null);
								}
                            }
                        },
                        TicketId: function (callback) {
                            _ticketId = ticket._id;
                            callback(null, ticket._id);
                        },
                        ReasonCategoy: function (callback) {
                            _TicketReasonCategory.aggregate([
                                {$match: {category: _.switch(_type, ['chat', 'mail'], [3, 4])}},
                                {$project: {_id: 1, name: 1}},
                                {$lookup: {from: 'ticketreasons', localField: '_id', foreignField: 'idCategory', as: 'Reason'}},
                                {$unwind: {path: '$Reason', preserveNullAndEmptyArrays: true}},
                                {$sort: {'Reason.priority': 1}},
                                {$lookup: {from: 'ticketsubreasons', localField: 'Reason._id', foreignField: 'idReason', as: 'Reason.subReason'}},
                                {$group: {_id: '$_id', name: {$first: '$name'}, Reason: {$push: {_id: '$Reason._id', name: '$Reason.name', subReason: '$Reason.subReason'}}}},
                                {$project: {_id: 1, name: 1, Reason: {_id: 1, name: 1, subReason: {_id: 1, name: 1, priority: 1}}}}
                            ], callback);
                        },
                        AgentGroup: function (callback) {
                            _Company.aggregate([
                                {$match: {_id: _comanyId}},
                                {$lookup: {from: 'agentgroups', localField: '_id', foreignField: 'idParent', as: 'agentgroups'}},
                                {$unwind: {path: '$agentgroups', preserveNullAndEmptyArrays: true}},
                                {$lookup: {from: 'users', localField: 'agentgroups._id', foreignField: 'agentGroupMembers.group', as: 'agentgroups.members'}},
                                {$lookup: {from: 'users', localField: 'agentgroups._id', foreignField: 'agentGroupLeaders.group', as: 'agentgroups.leaders'}},
                                {$project: {'agentgroups._id': 1, 'agentgroups.name': 1, 'agentgroups.members._id': 1, 'agentgroups.members.name': 1, 'agentgroups.members.displayName': 1, 'agentgroups.leaders._id': 1, 'agentgroups.leaders.name': 1, 'agentgroups.leaders.displayName': 1}}
                            ], callback);
                            //TODO : chua su ly loc user
                        },
                        Fields: function (callback) {
                            _Company.findById(_comanyId).populate({
                                path: 'companyProfile', model: _CompanyProfile, select: 'fieldId -_id',
                                populate: {path: 'fieldId', model: _CustomerFields, select: 'displayName modalName status isRequired fieldValue fieldType weight -_id', options: {sort: {weight: 1, displayName: 1}}}
                            }).exec(callback);
                        }
                    }, next);
                }
            ], function (error, result) {
                if (_.has(result, 'CustomerId') && !_.isNull(result.CustomerId)) {
                    var _query = [];
                    _.each(result.Fields.companyProfile.fieldId, function (o) {
                        _query.push({$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}});
                    });
                    _Customer.aggregate([{$match: {_id: result.CustomerId}}].concat(_query), function (error, customers) {
                        _.render(req, res, 'layout/ticket', _.extend(result, {fnInfo: dynamicCustomerInfo, customer: customers[0], 'custom-view': true}), true, error);
                    });
                } else {
                    return _.render(req, res, 'layout/ticket', _.extend(result, {fnInfo: dynamicCustomerInfo, customer: {}, 'custom-view': true}), true, error);
                }
            });
        }
    }
};

exports.update = function (req, res) {
    if (!_.has(req.body, 'type') || (['chat', 'mail'].indexOf(req.body.type) < 0)) return res.json({code: 404, message: 'Not found !'});
    if (_.has(req.body, 'groupId') || (_.has(req.body, 'idAgent') && !_.isEqual(req.body.idAgent, req.session.user._id))) req.body.assignBy = req.session.user._id;
    if (!_.has(req.body, 'groupId') && _.isEmpty(req.body.idAgent)) req.body.idAgent = req.session.user._id;
    req.body.deadline = (_.has(req.body, 'deadline') && !_.isEmpty(req.body.deadline)) ? _moment(req.body.deadline, 'DD/MM/YYYY HH:mm')._d : null;
    req.body.updateBy = req.session.user._id;
    req.body.updated = _moment()._d;
    _async.waterfall([
        function (next) {
            if (!_.isEqual(req.body.type, "mail")) return next(null, req.body);
            _TicketsMail.findOne({_id: req.params.ticket}).populate({path: "idService", model: _ServicesMail, select: 'sla'}).exec(function (error, m) {
                if (error || !m) return next(null, req.body);
                req.body["missed"] = _moment().diff(_moment(m.created), 'milisecond') > m.idService.sla;
                next(null, req.body);
            });
        }
    ], function (error, body) {
        global['_' + _.classify('tickets-' + body.type)].findByIdAndUpdate(req.params.ticket, _.chain(body).mapObject(function (val, key) {
            return _.isEqual(val, '') ? null : val;
        }).value(), {new: true}, function (err, ticket) {
            res.json({code: err ? 500 : 200, message: err ? err : 'Cập nhật thành công !', ticket: ticket});
        });
    });
};

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
                name: el.modalName
            };
            _childs.push({
                tag: 'option',
                attr: {value: ''},
                content: '---- Chá»n ----'
            });
            _.each(el.fieldValue, function (ev) {
                _childs.push({
                    tag: 'option',
                    attr: {value: ev},
                    sattr: _val.indexOf(ev) >= 0 ? ['selected'] : [],
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
                name: el.modalName
            }
            break;
    }

    return _.htmlTags([{tag: _tag, attr: _attr, sattr: _sattr, childs: _childs.length ? _childs : []}]);
}

//var _create = { idService: req.query.service, idAgent: req.session.user._id, threadId: _.has(req.query, 'threadId') ? req.query.threadId : null, status: -1 },
//var _populate = { path: 'idService', select: 'name idChannel', populate: { path: 'idChannel', model: _CompanyChannel, select: 'idCompany name' } }

//var _create = { idService: '5746616a8f93e182115278fc', idAgent: '5715de31a75711dea67365c3', mailId: '5746619c8f93e182115278fd', status: -1 };
//var _populate = { path: 'idService', select: 'name idCompany', populate: { path: 'idCompany', model: _Company} }; 
//_TicketsMail.create(_create, function (error, ticket) {
//    if (error) console.log(error); 
//    _TicketsMail.populate(ticket, _populate, function (err, t) {
//        console.log(err, t);
//        t.remove()
//    });
//});

//var _query = {idCustomer: new mongodb.ObjectId('5732328ecf0df72c19c3bb71')};
//if (_.has(_query, 'deadline')) _query.deadline = {$gte: _moment(_query.deadline, 'DD/MM/YYYY').startOf('day')._d, $lte: _moment(_query.deadline, 'DD/MM/YYYY').endOf('day')._d,};
//if (_.has(_query, 'updated')) _query.updated = {$gte: _moment(_query.updated, 'DD/MM/YYYY').startOf('day')._d, $lte: _moment(_query.updated, 'DD/MM/YYYY').endOf('day')._d,};
//
//_TicketsChat.remove({status: -1}, function (error, t) {
//    //_TicketsChat.create({
//    //    idService: '57315436d9a77603dcde4bba',
//    //    idAgent: '5715df44a75711dea67365c7',
//    //    threadId: '573174d6707cef2bf7e828c0',
//    //    status: -1
//    //}, function (error, ticket) {
//    //    _TicketsChat.populate(ticket, {path: 'idService', select: 'name idChannel', populate: {path: 'idChannel', model: _CompanyChannel}}, function (error, ticket) {
//    //        console.log(ticket);
//    //    });
//    //});
//})

//_async.parallel({
//    ReasonCategoy: function (callback) {
//        _TicketReasonCategory.aggregate([
//            {$project: {_id: 1, name: 1}},
//            {$lookup: {from: 'ticketreasons', localField: '_id', foreignField: 'idCategory', as: 'Reason'}},
//            {$unwind: {path: '$Reason', preserveNullAndEmptyArrays: true}},
//            {$sort: {'Reason.priority': 1}},
//            {$lookup: {from: 'ticketsubreasons', localField: 'Reason._id', foreignField: 'idReason', as: 'Reason.subReason'}},
//            {$group: {_id: '$_id', name: {$first: '$name'}, Reason: {$push: {_id: '$Reason._id', name: '$Reason.name', subReason: '$Reason.subReason'}}}},
//            {$project: {_id: 1, name: 1, Reason: {_id: 1, name: 1, subReason: {_id: 1, name: 1, priority: 1,}}}}
//        ], callback);
//    }
//}, function (error, result) {
//    _.log(JSON.parse(JSON.stringify(result)));
//});


//_Company.aggregate([
//    {$match: {_id: new mongodb.ObjectId('572af1518a0b6dfeeefa8d6c')}},
//    {$lookup: {from: 'agentgroups', localField: '_id', foreignField: 'idParent', as: 'agentgroups'}},
//    {$unwind: {path: '$agentgroups', preserveNullAndEmptyArrays: true}},
//    {$lookup: {from: 'users', localField: 'agentgroups._id', foreignField: 'agentGroupMembers.group', as: 'agentgroups.members'}},
//    {$lookup: {from: 'users', localField: 'agentgroups._id', foreignField: 'agentGroupLeaders.group', as: 'agentgroups.leaders'}},
//    {$project: {'agentgroups.name': 1, 'agentgroups.members.name': 1, 'agentgroups.members.displayName': 1, 'agentgroups.leaders.name': 1, 'agentgroups.leaders.displayName': 1}}
//], function (error, result) {
//    _.log(JSON.parse(JSON.stringify(result)));
//});
//_Company.findById('572af1518a0b6dfeeefa8d6c').populate({
//    path: 'companyProfile',
//    model: _CompanyProfile,
//    select: 'fieldId -_id',
//    populate: {
//        path: 'fieldId',
//        model: _CustomerFields,
//        select: 'displayName modalName status isRequired fieldValue fieldType weight -_id',
//        options: {sort: {weight: 1, displayName: 1}}
//    }
//}).exec(function (error, c) {
//    _.log(JSON.parse(JSON.stringify(c)));
//});
//_Tickets.findOne({
//        _id: mongodb.ObjectId("572b05b11e78b7fdfbe66734")
//    })
//    .populate({
//        path: 'ticketReasonCategory',
//        model: _TicketReasonCategory,
//        select: 'name'
//    })
//    .populate({
//        path: 'ticketReason',
//        model: _TicketReason,
//        select: 'name'
//    })
//    .populate({
//        path: 'ticketSubreason',
//        model: _TicketSubreason
//    })
//    .populate({
//        path: 'idService',
//        model: _Services
//    })
//    .exec(function (error, t) {
//        console.log(t);
//    }); 


//var test = [{
//    _id: '56ccef10107427552ed55ce7',
//    name: 'Trang quản trị',
//    status: 1,
//    icon: '',
//    weight: 1,
//    hidden: 0,
//    link: '/none',
//    access: true,
//    childs:
//    [{
//        _id: '56ccef40107427552ed55cea',
//        name: 'Kiến thức chung',
//        status: 1,
//        icon: '',
//        weight: 1,
//        hidden: 0,
//        link: '/none',
//        access: true,
//        childs:
//        [{
//            _id: '56cebf89c526ab072a1368bc',
//            name: 'Bài viết',
//            status: 1,
//            icon: '',
//            weight: 1,
//            hidden: 0,
//            link: '/articles',
//            access: true,
//            childs: []
//        },
//            {
//                _id: '56cebf72c526ab072a1368bb',
//                name: 'Danh mục bài viết',
//                status: 1,
//                icon: '',
//                weight: 1,
//                hidden: 0,
//                link: '/articles-category',
//                access: true,
//                childs: []
//            }]
//    },
//        {
//            _id: '56cebfa6c526ab072a1368bd',
//            name: 'Quản lý người dùng',
//            status: 1,
//            icon: '',
//            weight: 2,
//            hidden: 0,
//            link: '/none',
//            access: true,
//            childs:
//            [{
//                _id: '56cebfd5c526ab072a1368be',
//                name: 'Quản lý công ty',
//                status: 1,
//                icon: '',
//                weight: 1,
//                hidden: 0,
//                link: '/company',
//                access: true,
//                childs: []
//            },
//                {
//                    _id: '56cebfe6c526ab072a1368bf',
//                    name: 'Quản lý nhóm',
//                    status: 1,
//                    icon: '',
//                    weight: 2,
//                    hidden: 0,
//                    link: '/agent-groups',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '5715f58950fb394cb0982059',
//                    name: 'Quản lý kỹ năng chat',
//                    status: 1,
//                    icon: '',
//                    weight: 3,
//                    hidden: 0,
//                    link: '/skills-chat',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '5715f5b050fb394cb098205a',
//                    name: 'Quản lý nhóm kỹ năng chat',
//                    status: 1,
//                    icon: '',
//                    weight: 4,
//                    hidden: 0,
//                    link: '/groups-profile-chat',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '56cec044c526ab072a1368c1',
//                    name: 'Quản lý kỹ năng voice',
//                    status: 1,
//                    icon: '',
//                    weight: 5,
//                    hidden: 0,
//                    link: '/skills',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '56cec02fc526ab072a1368c0',
//                    name: 'Quản lý nhóm kỹ năng voice',
//                    status: 1,
//                    icon: '',
//                    weight: 6,
//                    hidden: 0,
//                    link: '/groups-profile',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '56d4ffd8a7e98e7449306d3a',
//                    name: 'Quản lý người dùng',
//                    status: 1,
//                    icon: '',
//                    weight: 7,
//                    hidden: 0,
//                    link: '/users',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '56cec057c526ab072a1368c2',
//                    name: 'Quản lý nhóm quyền hạn',
//                    status: 1,
//                    icon: '',
//                    weight: 8,
//                    hidden: 0,
//                    link: '/role',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '56d0d6a367f68c4069f60f53',
//                    name: 'Phân quyền nhóm người dùng',
//                    status: 1,
//                    icon: '',
//                    weight: 9,
//                    hidden: 0,
//                    link: '/role-manager',
//                    access: true,
//                    childs: []
//                }]
//        },
//        {
//            _id: '56cec072c526ab072a1368c3',
//            name: 'Thông tin khách hàng',
//            status: 1,
//            icon: '',
//            weight: 3,
//            hidden: 0,
//            link: '/none',
//            access: true,
//            childs:
//            [{
//                _id: '56cec081c526ab072a1368c4',
//                name: 'Quản lý thông tin',
//                status: 1,
//                icon: '',
//                weight: 1,
//                hidden: 0,
//                link: '/customer',
//                access: true,
//                childs: []
//            },
//                {
//                    _id: '56cec09ac526ab072a1368c5',
//                    name: 'Quản lý nguồn nhóm',
//                    status: 1,
//                    icon: '',
//                    weight: 2,
//                    hidden: 0,
//                    link: '/customer-groups',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '570e041ba3828ce305f104aa',
//                    name: 'Quản lý nhóm khách hàng',
//                    status: 1,
//                    icon: '',
//                    weight: 3,
//                    hidden: 1,
//                    link: '/customer-sources',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '5706067ba53ba054663bf165',
//                    name: 'Lịch sử import khách hàng',
//                    status: 1,
//                    icon: '',
//                    weight: 4,
//                    hidden: 0,
//                    link: '/customer-import-history',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '5716ed93b12b5024ba5b8f87',
//                    name: 'Import excel',
//                    status: 1,
//                    icon: '',
//                    weight: 5,
//                    hidden: 1,
//                    link: '/customer-import',
//                    access: true,
//                    childs: []
//                }]
//        },
//        {
//            _id: '5715f48b50fb394cb0982056',
//            name: 'Quản lý kênh chat',
//            status: 1,
//            icon: '',
//            weight: 4,
//            hidden: 0,
//            link: '/none',
//            access: true,
//            childs:
//            [{
//                _id: '5715f52350fb394cb0982057',
//                name: 'Quản lý kênh chat',
//                status: 1,
//                icon: '',
//                weight: 1,
//                hidden: 0,
//                link: '/company-channel',
//                access: true,
//                childs: []
//            },
//                {
//                    _id: '5715f55e50fb394cb0982058',
//                    name: 'Thiết lập service chat',
//                    status: 1,
//                    icon: '',
//                    weight: 2,
//                    hidden: 0,
//                    link: '/services-chat',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '5715f5f450fb394cb098205b',
//                    name: 'Quản lý phiên làm việc chat',
//                    status: 1,
//                    icon: '',
//                    weight: 3,
//                    hidden: 0,
//                    link: '/user-chat-settings',
//                    access: true,
//                    childs: []
//                }]
//        },
//        {
//            _id: '56cec0bac526ab072a1368c6',
//            name: 'Quản lý cuộc gọi',
//            status: 1,
//            icon: '',
//            weight: 5,
//            hidden: 0,
//            link: '/none',
//            access: true,
//            childs:
//            [{
//                _id: '56cec0ccc526ab072a1368c7',
//                name: 'Thiết lập gọi ra',
//                status: 1,
//                icon: '',
//                weight: 2,
//                hidden: 0,
//                link: '/campains',
//                access: true,
//                childs: []
//            },
//                {
//                    _id: '56cec333c526ab072a1368d1',
//                    name: 'Thêm agent',
//                    status: 1,
//                    icon: '',
//                    weight: 3,
//                    hidden: 1,
//                    link: '/campains-assign',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '56cec0ddc526ab072a1368c8',
//                    name: 'Thiết lập gọi vào',
//                    status: 1,
//                    icon: '',
//                    weight: 4,
//                    hidden: 0,
//                    link: '/services',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '56d5029aa7e98e7449306d3d',
//                    name: 'Thiết lập nhóm tình trạng',
//                    status: 1,
//                    icon: '',
//                    weight: 5,
//                    hidden: 0,
//                    link: '/ticket-reason-category',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '5717013c0bf4d4e309434780',
//                    name: 'Lý do tình trạng',
//                    status: 1,
//                    icon: '',
//                    weight: 6,
//                    hidden: 1,
//                    link: '/ticket-subreason',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '56d502d2a7e98e7449306d3e',
//                    name: 'Thiết lập tình trạng cuộc gọi',
//                    status: 1,
//                    icon: '',
//                    weight: 6,
//                    hidden: 0,
//                    link: '/ticket-reason',
//                    access: true,
//                    childs: []
//                }]
//        },
//        {
//            _id: '56cec101c526ab072a1368c9',
//            name: 'Quản lý mẫu giao tiếp',
//            status: 1,
//            icon: '',
//            weight: 6,
//            hidden: 0,
//            link: '/none',
//            access: true,
//            childs:
//            [{
//                _id: '56cec114c526ab072a1368ca',
//                name: 'Câu hỏi khảo sát',
//                status: 1,
//                icon: '',
//                weight: 1,
//                hidden: 0,
//                link: '/surveys',
//                access: true,
//                childs: []
//            },
//                {
//                    _id: '5716fc690bf4d4e30943477a',
//                    name: 'Chi tiết câu hỏi khảo sát',
//                    status: 1,
//                    icon: '',
//                    weight: 2,
//                    hidden: 1,
//                    link: '/survey-question',
//                    access: true,
//                    childs: []
//                }]
//        }]
//},
//    {
//        _id: '56ccef1a107427552ed55ce8',
//        name: 'Trang làm việc',
//        status: 1,
//        icon: '',
//        weight: 2,
//        hidden: 0,
//        link: '/none',
//        access: true,
//        childs:
//        [{
//            _id: '56ccef54107427552ed55ceb',
//            name: 'Thông tin',
//            status: 1,
//            icon: '',
//            weight: 1,
//            hidden: 0,
//            link: '/articles-list',
//            access: true,
//            childs: []
//        },
//            {
//                _id: '56d56b0d473eb6135a858d96',
//                name: 'Thông tin khách hàng',
//                status: 1,
//                icon: '',
//                weight: 2,
//                hidden: 0,
//                link: '/customer-detail',
//                access: true,
//                childs: []
//            },
//            {
//                _id: '56cdf9ec36292cd9693d6e6f',
//                name: 'Danh sách cuộc gọi',
//                status: 1,
//                icon: '',
//                weight: 3,
//                hidden: 0,
//                link: '/none',
//                access: true,
//                childs:
//                [{
//                    _id: '57033663faad9b9f0358b884',
//                    name: 'Chỉnh sửa ticket',
//                    status: 1,
//                    icon: '',
//                    weight: 1,
//                    hidden: 1,
//                    link: '/ticket-edit',
//                    access: true,
//                    childs: []
//                },
//                    {
//                        _id: '56cdfa0136292cd9693d6e70',
//                        name: 'Danh sách gọi ra',
//                        status: 1,
//                        icon: '',
//                        weight: 2,
//                        hidden: 0,
//                        link: '/outbound',
//                        access: true,
//                        childs: []
//                    },
//                    {
//                        _id: '56ce679211522e49185f8845',
//                        name: 'Danh sách gọi vào',
//                        status: 1,
//                        icon: '',
//                        weight: 3,
//                        hidden: 0,
//                        link: '/inbound',
//                        access: true,
//                        childs: []
//                    },
//                    {
//                        _id: '571f0d91a8a85d918745b9d6',
//                        name: 'Danh sách theo dõi',
//                        status: 1,
//                        icon: '',
//                        weight: 4,
//                        hidden: 0,
//                        link: '/following',
//                        access: true,
//                        childs: []
//                    }]
//            },
//            {
//                _id: '573aeacf1809a06eba7cc64e',
//                name: 'Danh sách chat',
//                status: 1,
//                icon: '',
//                weight: 4,
//                hidden: 0,
//                link: '/none',
//                access: true,
//                childs:
//                [{
//                    _id: '573aeaa81809a06eba7cc64d',
//                    name: 'Danh sách ticket chat',
//                    status: 1,
//                    icon: '',
//                    weight: 1,
//                    hidden: 0,
//                    link: '/inbound-chat',
//                    access: true,
//                    childs: []
//                },
//                    {
//                        _id: '573aeaec1809a06eba7cc64f',
//                        name: 'Danh sách theo dõi - chat',
//                        status: 1,
//                        icon: '',
//                        weight: 2,
//                        hidden: 0,
//                        link: '/following-chat',
//                        access: true,
//                        childs: []
//                    }]
//            }]
//    },
//    {
//        _id: '56ccef23107427552ed55ce9',
//        name: 'Báo cáo',
//        status: 1,
//        icon: '',
//        weight: 3,
//        hidden: 0,
//        link: '/none',
//        access: true,
//        childs:
//        [{
//            _id: '573599e894d6119f676d361d',
//            name: 'Báo cáo gọi vào',
//            status: 1,
//            icon: '',
//            weight: 1,
//            hidden: 0,
//            link: '/none',
//            access: true,
//            childs:
//            [{
//                _id: '572b12df7c6901130296dd0d',
//                name: 'Báo cáo theo tình trạng',
//                status: 1,
//                icon: '',
//                weight: 1,
//                hidden: 0,
//                link: '/report-inbound-status',
//                access: true,
//                childs: []
//            },
//                {
//                    _id: '57399552d10320194c9d98a7',
//                    name: 'Báo cáo theo ĐTV',
//                    status: 1,
//                    icon: '',
//                    weight: 2,
//                    hidden: 0,
//                    link: '/none',
//                    access: true,
//                    childs:
//                    [{
//                        _id: '57357de8a938c3b74c504961',
//                        name: 'Báo cáo tổng quát theo ĐTV',
//                        status: 1,
//                        icon: '',
//                        weight: 1,
//                        hidden: 0,
//                        link: '/report-inbound-overall-agent-productivity',
//                        access: true,
//                        childs: []
//                    },
//                        {
//                            _id: '5739950fd10320194c9d98a6',
//                            name: 'Báo cáo năng suất ĐTV theo thời gian',
//                            status: 1,
//                            icon: '',
//                            weight: 2,
//                            hidden: 0,
//                            link: '/report-inbound-agent',
//                            access: true,
//                            childs: []
//                        }]
//                },
//                {
//                    _id: '57359eb294d6119f676d361f',
//                    name: 'Báo cáo cuộc gọi được phục vụ',
//                    status: 1,
//                    icon: '',
//                    weight: 3,
//                    hidden: 0,
//                    link: '/report-inbound-call-serviced',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '573aedd81809a06eba7cc653',
//                    name: 'Báo cáo theo queue',
//                    status: 1,
//                    icon: '',
//                    weight: 3,
//                    hidden: 0,
//                    link: '/report-inbound-by-queue',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '573ac5af5bcdb864a997f5b1',
//                    name: 'Báo cáo cuộc gọi bị nhỡ',
//                    status: 1,
//                    icon: '',
//                    weight: 4,
//                    hidden: 0,
//                    link: '/report-inbound-misscall',
//                    access: true,
//                    childs: []
//                },
//                {
//                    _id: '573aecf71809a06eba7cc651',
//                    name: 'Báo cáo chi tiết vấn đề',
//                    status: 1,
//                    icon: '',
//                    weight: 5,
//                    hidden: 0,
//                    link: '/report-inbound-tickets',
//                    access: true,
//                    childs: []
//                }]
//        },
//            {
//                _id: '57359a0e94d6119f676d361e',
//                name: 'Báo cáo gọi ra',
//                status: 1,
//                icon: '',
//                weight: 2,
//                hidden: 0,
//                link: '/none',
//                access: true,
//                childs:
//                [{
//                    _id: '572b220d1ca094300cb12099',
//                    name: 'Báo cáo theo tình trạng',
//                    status: 1,
//                    icon: '',
//                    weight: 1,
//                    hidden: 0,
//                    link: '/report-outbound-reasons',
//                    access: true,
//                    childs: []
//                },
//                    {
//                        _id: '573990f429edb46942c6c84a',
//                        name: 'Báo cáo theo ĐTV',
//                        status: 1,
//                        icon: '',
//                        weight: 2,
//                        hidden: 0,
//                        link: '/none',
//                        access: true,
//                        childs:
//                        [{
//                            _id: '57357e19a938c3b74c504962',
//                            name: 'Báo cáo tổng quát năng suất ĐTV',
//                            status: 1,
//                            icon: '',
//                            weight: 1,
//                            hidden: 0,
//                            link: '/report-outbound-overall-agent-productivity',
//                            access: true,
//                            childs: []
//                        },
//                            {
//                                _id: '5739a49aab1a87305044a1e2',
//                                name: 'Báo cáo năng suất ĐTV theo thời gian',
//                                status: 1,
//                                icon: '',
//                                weight: 2,
//                                hidden: 0,
//                                link: '/report-outbound-agent',
//                                access: true,
//                                childs: []
//                            }]
//                    },
//                    {
//                        _id: '572b2492c73f4e440e0ef826',
//                        name: 'Báo cáo đo lường theo chiến dịch',
//                        status: 1,
//                        icon: '',
//                        weight: 4,
//                        hidden: 0,
//                        link: '/report-outbound-measure',
//                        access: true,
//                        childs: []
//                    },
//                    {
//                        _id: '573aed211809a06eba7cc652',
//                        name: 'Báo cáo theo chiến dịch',
//                        status: 1,
//                        icon: '',
//                        weight: 5,
//                        hidden: 0,
//                        link: '/report-outbound-tickets',
//                        access: true,
//                        childs: []
//                    },
//                    {
//                        _id: '57357e3aa938c3b74c504963',
//                        name: 'Báo cáo theo thời gian',
//                        status: 1,
//                        icon: '',
//                        weight: 5,
//                        hidden: 0,
//                        link: '/report-outbound-by-time',
//                        access: true,
//                        childs: []
//                    }]
//            },
//            {
//                _id: '573ac5c65bcdb864a997f5b2',
//                name: 'Báo cáo tổng quát',
//                status: 1,
//                icon: '',
//                weight: 3,
//                hidden: 0,
//                link: '/report-inout-general',
//                access: true,
//                childs: []
//            },
//            {
//                _id: '573aec9e1809a06eba7cc650',
//                name: 'Báo cáo quản lý ghi âm',
//                status: 1,
//                icon: '',
//                weight: 4,
//                hidden: 0,
//                link: '/report-call-monitor',
//                access: true,
//                childs: []
//            }]
//    }];

//var getUrlFromArr = function (menus, url) {
//    var _u = url.split('?');
//    var _m = _u[0].split('/');
//    var _childs = [];
//    _.each(menus, function (menu, i) {
//        if (menu.childs) {
//            _.each(menu.childs, function (m, j) {
//                if (m.childs) {
//                    _.each(m.childs, function (n, k) {
//                        if (_.has(n, 'link') && !_.isEmpty(n.link) && !_.isEqual(n.link, '/') && n.link.split('/')[1] == _m[1]) {
//                            _childs.push(
//                                { tag: 'li', childs: [{ tag: 'a', attr: { href: 'javascript:;' }, content: menu.name }] },
//                                { tag: 'li', childs: [{ tag: 'a', attr: { href: 'javascript:;' }, content: m.name }] },
//                                { tag: 'li', childs: [{ tag: 'a', attr: { href: n.link }, content: n.name }] }
//                            );
//                            if (_.isEqual(_.last(_m), 'new')) _childs.push({ tag: 'li', content: 'Tạo mới' });
//                            if (_.isEqual(_.last(_m), 'edit')) _childs.push({ tag: 'li', content: 'Chỉnh sửa' });
//                        }
//                    });
//                }
//            });
//        }
//    });
//    return _.htmlTags([{ tag: 'ol', attr: { class: 'breadcrumb text-right' }, childs: _childs }]);
//}
//console.log(getUrlFromArr(test, '/outbound'));
//console.dir(_.chain(test).filter(function (x) { }).value(), { depth: 10 });