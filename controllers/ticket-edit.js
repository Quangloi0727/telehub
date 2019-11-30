/**
 * Created by MrBlack.
 */

var zoka = require(path.join(_rootPath, 'assets', 'plugins', 'zoka', 'script.js'));


exports.index = function(req, res) {
	if (_.has(req.query, 'method')) {
		var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
		var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
		if (req.query.method == 'getCallLogs') {
			_async.waterfall([
				function(next) {
					_Tickets.findById(req.query.ticketID, next);
				},
				function(t, next) {
					getCallLogs(t, page, rows, next);
				}
			], function(err, result) {
				return res.json({code: err ? 500 : 200, message: err ? err : result});
			});
		}
		return;
	}

	if (_.has(req.query, 'search')) {
		searchTicket(req, res);
		return;
	}
	if (!_.has(req.query, 'ticketID')) return;
	if (_.has(req.query, 'page')) {
		getTickets(req, function(err, result) {
			return res.json({code: err ? 500 : 200, message: err ? JSON.stringify(err) : result});
		});
		return;
	}

	_async.parallel({
		ticket: function(cb) {
			getFullTicketById(req.query.ticketID, cb);
		},
		order: function(cb) {
			//Albert: fix the issue causes the server died if the client sends the request with wrong ticketId
			getOrderByTicketId(req.query.ticketID, function(err,result) {
				if(err){
					// return res.render('404', {title: '404 | Page not found'});
					return call(err,null);
				}else{
					cb(null,result);
				}
			})
		},
		orderCards: function(cb) {
			mongoClient.collection('orders').distinct('card', {card: {$nin: [null, '', ' ']}}, function(err, orderCards) {
				if (err) return cb(err);
				var cards = [];
				orderCards.map(function(card) {
					cards.push(card.replace(/(?:\"|\[|\])/g, ""));
				});
				cb(null, cards);
			});
		}
	}, function(err, result) {
		//Albert: fix the issue causes the server died if the client sends the request with wrong ticketId
		if (_.isNull(result) || (result == undefined) || err) return res.render('404', {title: '404 | Page not found'});
		var t = result.ticket, o = result.order.order, ofs = result.order.orderFields, ocs = result.orderCards;

		// hoangdv remove special charactors in note ticket history
		var htmlProtect = function(str) {
			return str.replace(/(?:\r\n|\r|\n)/g, '&#13;').replace(/\t/g, '&#9;').replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/\\/g, '&#92;');
		};
		_async.parallel(collectionTicketInfo(req, t, true), function(error, result) {
			t.note = htmlProtect(t.note);
			if (_.has(result.ticketHistory, "data")) {
				result.ticketHistory.data.map(function(h) {
					h.ticketObject.note = htmlProtect(h.ticketObject.note);
				});
			}
			// Phiếu liên quan
			if (result.tickets && _.has(result.tickets, 'data')) {
				result.tickets.data.map(function(tic) {
					tic.note = htmlProtect(tic.note);
				});
			}
			_.render(req, res, 'ticket-edit', _.extend({
				fnInfo: _.dynamicCustomerInfo,
				fields: t[(!_.isNull(t.idService) ? 'idService' : 'idCampain')].idCompany.companyProfile.fieldId,
				serviceName: (t.idService ? 'Chiến dịch gọi vào: ' + t.idService.name : 'Chiến dịch gọi ra : ' + t.idCampain.name),
				title: 'Thông tin khách hàng',
				currentTicket: t,
				order: o,
				orderFields: ofs,
				orderCards: ocs,
				plugins: ['moment', 'zoka', ['bootstrap-select'], ['bootstrap-datetimepicker'], ['chosen']]
			}, result), true, error);
		});
	});
};

exports.create = function(req, res) {
	if (_.has(req.body, '_id')) {
		getTicketDetail(req, res);
	}
};

exports.update = function(req, res) {
	var params = req.params.ticketedit.split('-');

	//if (params.length < 2 || !mongodb.ObjectID.isValid(params[1]))
	//    return res.json({code: 500, message: 'Tham số truyền vào không phải ID : ' + params[1]});

	var _body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
	// hoangdv keep format ticket note
	if (_.has(_body, 'note') && _.has(req.body, 'note')) {
		_body.note = req.body.note;
	}
	switch (params[0]) {
		case 'customer':
			_.updateCustomer(params[1], _body, function(err) {
				res.json({
					code: err ? 500 : 200,
					message: err ? err.message : 'Cập nhật thông tin khách hàng thành công !'
				});
			});
			break;
		case 'editTicket':
			var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
			updateTicket(req.session.user._id, params[1], _body, function(err) {
				if (err) return res.json({code: 500, message: err.message});

				getTicketHistory(params[1], page, function(err, result) {
					res.json({code: err ? 500 : 200, message: err ? JSON.stringify(err) : result});
				});
			});
			break;
		case 'survey':
			saveSurvey(req, res);
			break;
		case 'order':
			require('./order-api').update(req, res);
			break;
	}
};

/**
 * Lấy đầy đủ thông tin của ticket
 * @param ticketId String ticketId
 * @param callback function(err, ticket)
 */
function getFullTicketById(ticketId, callback) {
	_Tickets.findById(ticketId)
		.populate({
			path: 'idService',
			model: _Services,
			select: 'idCompany idSkill idSurvey name _id',
			populate: {
				path: 'idCompany',
				model: _Company,
				select: 'companyProfile _id',
				populate: {
					path: 'companyProfile',
					model: _CompanyProfile,
					select: 'fieldId _id',
					populate: {
						path: 'fieldId',
						model: _CustomerFields,
						select: 'displayName modalName status isRequired fieldValue fieldType weight _id',
						options: {sort: {weight: 1, displayName: 1}}
					}
				}
			}
		})
		.populate({
			path: 'idCampain',
			model: _Campains,
			select: 'idCompany idCategoryReason idSurvey name trunk _id',
			populate: [{
				path: 'idCompany',
				model: _Company,
				select: 'companyProfile _id',
				populate: {
					path: 'companyProfile',
					model: _CompanyProfile,
					select: 'fieldId _id',
					populate: {
						path: 'fieldId',
						model: _CustomerFields,
						select: 'displayName modalName status isRequired fieldValue fieldType weight _id',
						options: {sort: {weight: 1, displayName: 1}}
					}
				}
			}, {
				path: 'trunk',
				model: _Trunk,
				select: 'prefix'
			}]
		})
		.populate({path: 'updateBy', model: _Users, select: 'name displayName'})
		.exec(callback);
}

/**
 * Lấy thông tin đơn hàng theo ticketId
 * @param ticketId String ticketId
 * @param callback function(err, order) {}
 */
function getOrderByTicketId(ticketId, callback) {
	mongoClient.collection('orders').findOne({ticketId: new mongodb.ObjectId(ticketId)}, function(err, order) {
		if (err) return callback(err);
		var orderFields = [];
		_.each(order, function(v, k) {
			var field = {};
			var modalName = 'field_order_' + k;
			if (k === 'createDate') {
				v = _moment(v).format('HH:mm DD/MM/YYYY');
			}
			order[modalName] = [{value: v}];
			delete order[k];
			switch (k) {
				case 'phone':
					field = {
						"displayName": "số điện thoại",
						"modalName": modalName,
						"status": 1,
						"weight": 1,
						"isRequired": 1,
						"fieldType": 7
					};
					break;
				case 'email':
					field = {
						"displayName": "e-mail",
						"modalName": modalName,
						"status": 1,
						"weight": 2,
						"isRequired": 1,
						"fieldType": 1
					};
					break;
				case 'name':
					field = {
						"displayName": "họ tên",
						"modalName": modalName,
						"status": 1,
						"weight": 3,
						"isRequired": 1,
						"fieldType": 1
					};
					break;
				case 'card':
					field = {
						"displayName": "thẻ",
						"modalName": modalName,
						"status": 1,
						"weight": 4,
						"isRequired": 1,
						"value": v,
						"fieldType": 1
					};
					break;
				case 'address':
					field = {
						"displayName": "địa chỉ",
						"modalName": modalName,
						"status": 1,
						"weight": 5,
						"isRequired": 1,
						"fieldType": 1
					};
					break;
				case 'cardType':
					field = {
						"displayName": "loại thẻ",
						"modalName": modalName,
						"status": 1,
						"weight": 6,
						"isRequired": 1,
						"fieldValue": ['Thẻ Tiếng Anh', 'Thẻ Tiếng Nhật'],
						"fieldType": 5
					};
					break;
				case 'deliveryType':
					field = {
						"displayName": "loại chuyển phát",
						"modalName": modalName,
						"status": 1,
						"weight": 7,
						"isRequired": 1,
						"fieldValue": ['EMS', 'SS', 'ZZ', 'ĐT', 'CK', 'TT'],
						"fieldType": 5
					};
					break;
				case 'createDate':
					field = {
						"displayName": "thời gian ký",
						"modalName": modalName,
						"status": 1,
						"weight": 8,
						"isRequired": 0,
						"fieldType": 1
					};
					break;
				case 'url':
					field = {
						"displayName": "trang đăng ký",
						"modalName": modalName,
						"status": 1,
						"weight": 9,
						"isRequired": 0,
						"fieldType": 1
					};
					break;
				default:
					break;
			}
			if (!_.isEmpty(field)) orderFields.push(field);
		});
		if (!_.has(order, 'field_order_deliveryType')) {
			orderFields.push({
				"displayName": "loại chuyển phát",
				"modalName": 'field_order_deliveryType',
				"status": 1,
				"weight": 7,
				"isRequired": 1,
				"fieldValue": ['EMS', 'SS', 'ZZ', 'ĐT', 'CK', 'TT'],
				"fieldType": 5
			});
		}
		orderFields = _.sortBy(orderFields, 'weight');
		callback(null, {order, orderFields});
	});
}

//function dynamicCustomerInfo(el, v) {
//    var _id = _.createID();
//
//    var _tag = '';
//    var _attr = {};
//    var _sattr = [];
//    var _childs = [];
//    var _val = (v && _.has(v, el.modalName) && !_.isEmpty(v[el.modalName]) && !_.isNull(v[el.modalName]) && v[el.modalName].length && _.has(v[el.modalName][0], 'value')) ? v[el.modalName][0].value : '';
//    switch (el.fieldType) {
//        case 1:
//        case 3:
//            _tag = 'input';
//            _attr = {
//                value: _val,
//                class: 'form-control' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
//                type: 'text',
//                id: 'edit_' + el.modalName,
//                name: el.modalName
//            }
//            break;
//        case 2:
//            _tag = 'input';
//            _attr = {
//                value: _val,
//                class: 'form-control' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
//                type: 'number',
//                id: 'edit_' + el.modalName,
//                name: el.modalName
//            }
//            break;
//        case 4:
//            _sattr.push('multiple');
//        case 5:
//            _tag = 'select';
//            _attr = {
//                class: 'selectpicker' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
//                id: 'edit_' + el.modalName,
//                name: el.modalName + '[]'
//            };
//            _childs.push({
//                tag: 'option',
//                attr: {value: ''},
//                sattr: ['selected'],
//                content: '---- Chọn ----'
//            });
//            _.each(el.fieldValue, function (ev) {
//                _childs.push({
//                    tag: 'option',
//                    attr: {value: ev},
//                    sattr: _.indexOf(_val, ev) >= 0 ? ['selected'] : [],
//                    content: ev
//                });
//            });
//            break;
//        case 6:
//            _tag = 'div';
//            _attr = {class: 'input-group'};
//            _childs = [
//                {
//                    tag: 'input',
//                    attr: {
//                        class: 'form-control date-picker' + _.switch(el.isRequired, [0, 1], ['', ' validate[required]']),
//                        value: _moment(_val).format('DD/MM/YYYY'),
//                        type: 'text',
//                        id: 'edit_' + el.modalName,
//                        name: el.modalName
//                    }
//                },
//                {
//                    tag: 'span',
//                    attr: {class: 'input-group-addon p-l-10 bgm-gray c-white'},
//                    childs: [{
//                        tag: 'i',
//                        attr: {
//                            role: 'button',
//                            class: 'zmdi zmdi-calendar'
//                        }
//                    }]
//                }
//            ];
//            break;
//        case 7:
//            _tag = 'div';
//            _attr = {
//                class: 'input-group fg-line'
//            };
//            _childs.push(
//                {
//                    tag: 'input',
//                    attr: {
//                        value: _val,
//                        class: 'form-control 1233333 validate[custom[number]' + _.switch(el.isRequired, [0, 1], ['', ',required']) + ']',
//                        type: 'text',
//                        id: 'edit_' + el.modalName,
//                        name: el.modalName + ':string'
//                    }
//                },
//                {
//                    tag: 'span',
//                    attr: {
//                        class: 'input-group-btn clickToCall',
//                        'data-phone-number': _val
//                    },
//                    childs: [
//                        {
//                            tag: 'button',
//                            attr: {
//                                class: 'btn btn-default reveal',
//                                type: 'button',
//                                style: 'max-height: 31px;'
//                            },
//                            childs: [{
//                                tag: 'i',
//                                attr: {
//                                    class: 'zmdi zmdi-phone-in-talk green f-17'
//                                }
//                            }]
//                        }
//                    ]
//                }
//            );
//            break;
//    }
//
//    return _.htmlTags([{
//        tag: _tag,
//        attr: _attr,
//        sattr: _sattr,
//        childs: _childs.length ? _childs : []
//    }]);
//};

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
		if (temp.length > 1) {
			obj['customerStatisfyStage'] = _.convertObjectId(temp[1]);
		} else {
			obj['customerStatisfyStage'] = null;
		}
	} else {
		obj['customerStatisfy'] = null;
		obj['customerStatisfyStage'] = null;
	}

	obj['updated'] = new Date();
	obj['updateBy'] = userId;
	obj['status'] = parseInt(obj['status']);

	_Tickets.findByIdAndUpdate(ticketId, {$set: obj}, {new: true}, function(err, result) {
		if (err || _.isEmpty(result)) return callback(err, result);
		var obj = {};
		obj['ticketId'] = result._id;
		obj['ticketObject'] = result;
		_TicketHistory.create(obj, callback);
		if (assignTo) _.pushNotification(1, 'ticket-edit?ticketID=' + result._id, assignTo);
	});
}
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
		{
			$group: {
				_id: '$_id',
				name: {$first: '$name'},
				tReason: {$push: {trId: '$tr._id', name: '$tr.name', subReason: '$tr.subReason'}}
			}
		},
		{$project: {_id: 1, name: 1, tReason: {trId: 1, name: 1, subReason: {_id: 1, name: 1, priority: 1}}}}
	);

	_TicketReasonCategory.aggregate(agg, function(err, result) {
		callback(err, _.reduce(result, function(memo, item) {
			item.tReason = _.reduce(item.tReason, function(memo, item) {
				item.subReason = _.map(_.sortBy(item.subReason, 'priority'), function(item) {
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
function getTicketDetail(req, res) {
	_Tickets.findById(req.body._id)
		.populate({path: 'idService', model: _Services, select: 'idCompany idSkill name'})
		.populate({path: 'idCampain', model: _Campains, select: 'idCompany idCategoryReason idSurvey name'})
		.populate({path: 'updateBy', model: _Users, select: 'name displayName'})
		.exec(function(error, t) {
			if (error) return res.json({code: 500, message: JSON.stringify(error)});
			if (_.isEmpty(t)) return res.json({code: 500, message: 'Phiếu không tồn tại'});

			_async.parallel(collectionTicketInfo(req, t), function(err, result) {
				if (err) return res.json({code: 500, message: JSON.stringify(err)});
				var temp = {
					ticket: t,
					info: result,
					serviceName: (t.idService ? 'Chiến dịch gọi vào: ' + t.idService.name : 'Chiến dịch gọi ra : ' + t.idCampain.name)
				};
				res.json({code: 200, message: temp});
			});
		});
}
function getTickets(req, callback) {
	var ticketId = _.isEmpty(req.query.ticketID) ? req.body._id : req.query.ticketID;
	_async.waterfall([
		function findTicket(callback) {
			_Tickets.findById(ticketId, callback);
		},
		function(t, callback) {
			if (!_.isEmpty(req.session.auth.company)) {
				var companyId = _.convertObjectId(req.session.auth.company._id);
				_async.parallel({
					campain: function(callback) {
						_Campains.find({idCompany: companyId}, {_id: 1}, function(err, result) {
							callback(err, _.pluck(result, '_id'));
						});
					},
					service: function(callback) {
						_Services.find({idCompany: companyId}, {_id: 1}, function(err, result) {
							callback(err, _.pluck(result, '_id'));
						})
					}
				}, function(err, result) {
					if (err) return callback(err, null);
					callback(err, t, result)
				});
			} else {
				callback(null, t, null);
			}
		},
		function createCondition(t, obj, callback) {
			var cond = {idCustomer: t.idCustomer, _id: {$ne: t._id}};
			if (!_.isNull(obj)) {
				if ((!_.isNull(obj.campain) && obj.campain.length > 0) &&
					(!_.isNull(obj.service) && obj.service.length > 0)) {
					cond['$or'] = [{idCampain: {$in: obj.campain}}, {idService: {$in: obj.service}}];
				} else if (!_.isNull(obj.campain) && obj.campain.length > 0) {
					cond['idCampain'] = {$in: obj.campain};
				} else if (!_.isNull(obj.service) && obj.service.length > 0) {
					cond['idService'] = {$in: obj.service};
				}
			}

			callback(null, t, cond);
		},
		function findTickets(t, cond, callback) {
			var page = _.has(req.query, 'page') ? req.query.page : 1;
			var rows = 10;
			_Tickets
				.find(cond)
				//trungdt jira 919
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
				.populate({path: 'ticketSubreason', model: _TicketSubreason, select: 'name _id'})
				.populate({path: 'ticketReasonCategory', model: _TicketReasonCategory, select: 'name _id'})
				.sort({created: 1})
				.paginate(page, rows, function(error, result, total) {
					if (error) return callback(error, null);
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
function getTicketHistory(ticketId, page, callback) {
	var rows = 10;
	_TicketHistory
		.find({ticketId: ticketId})
		.populate({path: 'ticketObject.updateBy', model: _Users, select: 'name displayName'})
		.populate({path: 'ticketObject.ticketSubreason', model: _TicketSubreason, select: 'name _id'})
		.populate({path: 'ticketObject.ticketReasonCategory', model: _TicketReasonCategory, select: 'name _id'})
		.paginate(page, rows, function(err, result, total) {
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

	companyId = _.isString(companyId) ? new mongodb.ObjectID(companyId) : companyId;

	agg.push(
		{$match: {status: 1, idParent: companyId}},
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
	_AgentGroups.aggregate(agg, function(err, result) {
		if (err) return callback(err, null);
		if (!user) {
			log.debug('session.user =  undefined ');
			return callback('session.user undefined', null);
		}
		;

		var pmIndex = _.chain(user.ternalLeaders)
			.pluck('ternal')
			.map(function(item) {
				return item.toString();
			})
			.indexOf(_config.app._id)
			.value();

		var clIndex = _.chain(user.companyLeaders)
			.pluck('company')
			.map(function(item) {
				return item.toString();
			})
			.indexOf(companyId)
			.value();

		if (pmIndex >= 0 || clIndex >= 0) {
			callback(err, result);
		} else {
			var memberGroup = user.agentGroupMembers ? _.pluck(user.agentGroupMembers, 'group') : [];
			var leaderGroup = user.agentGroupLeaders ? _.pluck(user.agentGroupLeaders, 'group') : [];
			var myAgentGroup = _.union(memberGroup, leaderGroup);

			var temp = _.reduce(result, function(memo, item) {
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
function getAgentGroup(user) {
	if (_.isEmpty(user)) return [];
	var memberGroup = user.agentGroupMembers ? _.pluck(user.agentGroupMembers, 'group') : [];
	var leaderGroup = user.agentGroupLeaders ? _.pluck(user.agentGroupLeaders, 'group') : [];
	return _.map(_.union(memberGroup, leaderGroup), function(item) {
		return new mongodb.ObjectID(item);
	})
};
function getCallLogs(t, page, rows, callback) {
	var aggs = [];
	aggs.push({
		$match: {
			callId: {$in: t.callId},
			serviceType: 3,
			answerTime: {$gt: 0}
		}
	});
	aggs.push({$lookup: {from: 'cdrcallinfos', localField: 'callId', foreignField: 'callId', as: 'call'}});
	aggs.push({$unwind: "$call"});
	aggs.push({$sort: {startTime: 1}});
	aggs.push({
		$project: {
			startTime: 1,
			recordPath: 1,
			callDuration: 1,
			caller: "$call.caller",
			called: "$call.called",
			transType: 1
		}
	});
	_CdrTransInfo.aggregatePaginate(_CdrTransInfo.aggregate(aggs), {
		page: page,
		limit: rows
	}, function(err, result, pageCount, count) {
		var paginator = new pagination.SearchPaginator({
			prelink: '/ticket-edit?ticketID=' + t._id + '&method=getCallLogs',
			current: page,
			rowsPerPage: rows,
			totalResult: count
		});

		_.each(result, function(trans) {
			trans.recordPath = !_config.recordPath || _.isEmpty(trans.recordPath) ? null : _config.recordPath.path + trans.recordPath;
		});

		var obj = {};
		obj.data = result;
		obj.paging = paginator.getPaginationData();
		callback(err, obj);
	});
}

function searchTicket(req, res) {
	_async.parallel({
		reasonCategory: function(callback) {
			if (!_.has(req.query, 'ticketReasonCategory')) return callback(null, null);
			_TicketReasonCategory.find({
				status: 1,
				name: {$regex: new RegExp(_.stringRegex(req.query.ticketReasonCategory), 'i')}
			}, '_id', callback);
		},
		subReason: function(callback) {
			if (!_.has(req.query, 'ticketSubreason')) return callback(null, null);
			_TicketSubreason.find({
				status: 1,
				name: {$regex: new RegExp(_.stringRegex(req.query.ticketSubreason), 'i')}
			}, '_id', callback)
		},
		updateBy: function(callback) {
			if (!_.has(req.query, 'ticketUpdateBy')) return callback(null, null);
			_Users.find({
				$or: [
					{name: {$regex: new RegExp(_.stringRegex(req.query.ticketUpdateBy), 'i')}},
					{displayName: {$regex: new RegExp(_.stringRegex(req.query.ticketUpdateBy), 'i')}}
				]
			}, '_id', callback);
		},
		searchCond: function(callback) {
			var cond = {
				idCustomer: new mongodb.ObjectID(req.query.idCustomer),
				_id: {$ne: new mongodb.ObjectID(req.query.tId)}
			};
			if (_.isNull(req.session.auth.company)) { // Tenant Leader
				callback(null, cond);
			} else if (req.session.auth.company.leader || req.session.auth.company.group.leader) { // Company Leader vs Agent Group Leader
				var companyId = new mongodb.ObjectID(req.session.auth.company._id);
				_Company.aggregate([
					{$match: {_id: companyId}},
					{$lookup: {from: 'services', localField: '_id', foreignField: 'idCompany', as: 'service'}},
					{$lookup: {from: 'campains', localField: '_id', foreignField: 'idCompany', as: 'campain'}},
					{$project: {_id: 1, 'service._id': 1, 'campain._id': 1}}
				], function(err, result) {
					if (err) return callback(err, null);
					var temp = _.reduce(result, function(memo, item) {
						var service = item.service ? _.pluck(item.service, '_id') : [];
						var campain = item.campain ? _.pluck(item.campain, '_id') : [];
						memo['service'] = _.union(memo['service'], _.map(service, function(item) {
							return item.toString();
						}));
						memo['campain'] = _.union(memo['campain'], _.map(campain, function(item) {
							return item.toString();
						}));
						return memo;
					}, {});
					cond['$or'] = [{idService: {$in: temp['service']}}, {idCampain: {$in: temp['campain']}}];
					callback(err, cond);
				})
			} else { // member
				var userId = new mongodb.ObjectID(req.session.user._id);
				cond['$or'] = [{idAgent: userId}, {assignTo: userId}];
				callback(null, cond);
			}
		},
		//trungdt jira 919
		searchCompany: function(next) {
			if (!_.has(req.query, 'company')) return next(null, null);
			_Company.aggregate([
				{$match: {name: {$regex: new RegExp(_.stringRegex(req.query.company), 'i')}}},
				{$lookup: {from: 'services', localField: '_id', foreignField: 'idCompany', as: 'service'}},
				{$lookup: {from: 'campains', localField: '_id', foreignField: 'idCompany', as: 'campain'}},
				{$project: {_id: 1, 'service._id': 1, 'campain._id': 1}}
			], function(err, result) {
				if (err) return callback(err, null);
				var temp = _.reduce(result, function(memo, item) {
					var service = item.service ? _.pluck(item.service, '_id') : [];
					var campain = item.campain ? _.pluck(item.campain, '_id') : [];
					memo['service'] = _.union(memo['service'], _.map(service, function(item) {
						return item.toString();
					}));
					memo['campain'] = _.union(memo['campain'], _.map(campain, function(item) {
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
	}, function(err, result) {
		if (err) return res.json({code: 500, message: JSON.stringify(err)});

		var searchCondition = result.searchCond;
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
		var prelink = '/ticket-edit?' + _.reduce(_.keys(req.query), function(memo, key) {
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
			.populate({path: 'ticketSubreason', model: _TicketSubreason, select: 'name _id'})
			.populate({path: 'ticketReasonCategory', model: _TicketReasonCategory, select: 'name _id'})
			.sort({created: 1})
			.paginate(page, rows, function(error, result, total) {
				var paginator = new pagination.SearchPaginator({
					prelink: prelink,
					current: page,
					rowsPerPage: rows,
					totalResult: total
				});
				var obj = {};
				obj['data'] = result;
				obj['paging'] = paginator.getPaginationData();
				res.json({code: err ? 500 : 200, message: err ? err : obj})
			})

	});
}
function saveSurvey(req, res) {
	var params = req.params.ticketedit.split('-');
	var ticketId = params[1];
	var surveyId = params[2];

	var _body = _.chain(cleanQuestion(req.body)).cleanRequest().replaceMultiSpaceAndTrim().value();

	mongodb.MongoClient.connect(_dbPath, function(err, db) {
		if (err) return err;
		if (!req.session.user) return res.json({code: 500, message: 'Session User Null'});
		var batch = db.collection('surveyresults').initializeUnorderedBulkOp({useLegacyOps: true});

		_.each(_.keys(_body), function(item, index) {
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
		batch.execute(function(err, result) {
			db.close();
			res.json({code: err ? 500 : 200, message: err ? JSON.stringify(err) : 'OK'});
		});
	});

	function cleanQuestion(obj) {
		var tmp = {};
		_.each(_.keys(obj), function(key) {
			var keyArr = key.split('-');

			if (keyArr[0] == 'answerNote') {
				if (_.isEmpty(tmp[keyArr[1]])) tmp[keyArr[1]] = {content: null, answerNote: ''};

				tmp[keyArr[1]][keyArr[0]] = obj[key];
			} else {
				if (_.isEmpty(tmp[key])) tmp[key] = {content: null, answerNote: ''};

				if (Array.isArray(obj[key])) {
					var arr = _.reduce(obj[key], function(memo, item) {
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

/**
 * Convert các object về string
 *
 * @param params    - Dữ liệu đầu vào
 * @returns {*}     - Dữ liệu đầu ra sau khi đã convert string ( có thể bị lỗi với các trường hợp _.isEmpty
 */
function convertToString(params) {
	if (_.isEmpty(params)) return params;
	if (_.isString(params)) return params;
	return params.toString();
}

/**
 * Kiểm tra với ticket hiện tại thì người dùng có được phép edit hay không
 *
 * @param req       - Current Request
 * @param t         - Current Ticket
 * @param callback  - Next tick
 */
function isEdit(req, t, callback) {
	if (!req.session.user || !req.session.auth) {
		callback(null, false);
	} else if (req.session.auth && _.isNull(req.session.auth.company)) {
		callback(null, true);
	} else if (req.session.auth && req.session.auth.company.leader) {
		var companyId = !_.isEmpty(t.idService)
			? t.idService.idCompany._id
			: t.idCampain.idCompany._id;

		callback(null, _.isEqual(convertToString(companyId), req.session.auth.company._id));
	} else if (req.session.auth && req.session.auth.company.group.leader) {

		// group leader
		var groupId = _.convertObjectId(req.session.auth.company.group._id);

		_Users.find({
			$or: [
				{'agentGroupMembers.group': groupId},
				{'agentGroupLeaders.group': groupId}
			]
		}, {_id: 1}, function(err, result) {
			if (err) return callback(err, null);
			var userId = _.chain(result)
				.pluck('_id')
				.map(function(item) {
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


function collectionTicketInfo(req, t, getCustomerInfo) {
	var temp = {
		// trungdt - Jira-925
		callLogs: function(next) {
			getCallLogs(t, 1, 10, next);
		},
		// trungdt - Jira-925
		ticketReasonCategory: function(callback) {
			getTicketReason(t, callback);
		},
		assign: function(callback) {
			getAssignUsers(t, req.session.user, callback);
		},
		tickets: function(callback) {
			getTickets(req, callback);
		},
		survey: function(callback) {
			if (t.idCampain == null && t.idService == null) return callback(null, null);
			var surveyId = t.idCampain ? t.idCampain.idSurvey : (t.idService ? t.idService.idSurvey : null);
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
			], function(err, result) {
				if (err) return callback(err, null);
				var temp = [];
				if (_.has(result[0], 'sq')) {
					temp = result[0].sq;
				}
				callback(err, temp);
			});
		},
		surveyResult: function(callback) {
			if (t.idCampain == null && t.idService == null) return callback(null, null);
			var surveyId = t.idCampain ? t.idCampain.idSurvey : (t.idService ? t.idService.idSurvey : null);
			_SurveyResult.find({
				idTicket: t._id,
				idSurvey: surveyId
			}, callback);
		},
		isEdit: function(callback) {
			isEdit(req, t, callback);
		},
		statisfy: function(callback) {
			_CustomerStatisfy.aggregate([
				{$match: {status: 1}},
				{
					$lookup: {
						from: 'customerstatisfystages',
						localField: '_id',
						foreignField: 'idCustomerStatisfy',
						as: 'cs'
					}
				},
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
		ticketHistory: function(callback) {
			getTicketHistory(t._id, 1, callback);
		}
	};

	if (getCustomerInfo) {
		temp['customer'] = function(callback) {
			var _agg = [{$match: {_id: t.idCustomer}}];
			_.each(t[(!_.isNull(t.idService) ? 'idService' : 'idCampain')].idCompany.companyProfile.fieldId, function(o) {
				_agg.push({$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}});
			});
			_Customer.aggregate(_agg, callback);
		};
	}

	return temp;
}