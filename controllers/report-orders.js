/**
 * Created by Hoangdv on 02/Nov/16.
 */
var titlePage = 'Báo cáo đơn hàng';
var searchNotFoundError = new Error('Không tìm thấy kết quả với khoá tìm kiếm');
var accessDenyError = new Error('Không đủ quyền truy cập');
var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));
var zipFolder = require('zip-folder');
var cond = [];
exports.index = {
	json: function(req, res) {
		if (_.has(req.query, 'cascade')) {
			var query = req.query.cascade == "" ? {} : {idCampaign: _.convertObjectId(req.query.cascade)};
			var query2 = req.query.cascade == "" ? {} : {idCampain: _.convertObjectId(req.query.cascade)};
			_CampaignAgent.distinct("idAgent", query, function(err, r) {
				if (err) return res.json({code: 500, message: err.message});
				_Tickets.distinct('idAgent', query2, function(err, r2) {
					if (err) return res.json({code: 500, message: err.message});
					_Users.find({$or: [{_id: {$in: r}}, {_id: {$in: r2}}]}, function(err, user) {
						if (err) return res.json({code: 500, message: err.message});
						res.json(user)
					})
				})
			})
		} else {
			if (_.has(req.query, 'status') && !_.isArray(req.query.status)) req.query.status = parseInt(req.query.status);
			getOrders(req, function(err, result) {
				if (err && _.isString(err)) { // err === 'Download'
					var conditions = arguments[1];
					var totalResult = arguments[2];
					return exportExcel(req, res, conditions, totalResult);
				}
				if (err) return res.json({code: 500, message: err.message});
				var orders = []; //, tickets = [];
				var orderStatus = _.has(req.query, 'order_raw_status') ? parseInt(req.query.order_raw_status) : 0;
				if (orderStatus === 0) {
					orders = result.orders;
				} else {
					// result is array of tickets
					_.each(result.tickets, function(ticket) {
						var order = _.clone(ticket.order);
						//delete ticket.order;
						orders.push(_.extend(order, {'ticket': _.clone(ticket)}));
						//tickets.push(ticket);
					});
				}
				res.json({
					code: 200,
					orders: orders,
					reportByDay: result.reportByDay
				});
			});
		}
	},
	html: function(req, res) {
		if (req.session.auth.company && !req.session.auth.company.leader) {
			return _.render(req, res, 'report-orders', {
				title: titlePage,
				plugins: ['moment', ['bootstrap-select'], ['bootstrap-daterangepicker'], ['chosen']],
				data: null
			}, true, accessDenyError);
		}
		_async.parallel({
			campaign: function(callback) {
				_async.waterfall([
					function(callback) {
						if (!_.isEmpty(req.session.auth.company)) {
							var companyId = _.convertObjectId(req.session.auth.company._id);
							_Campains.aggregate([
								{$match: {idCompany: companyId}},
								{$project: {_id: 1}}
							], function(err, result) {
								if (err) return callback(err, null);
								cond.push({$match: {_id: {$in: _.pluck(result, '_id')}}});
								callback(err, cond);
							});
						} else {
							callback(null, []);
						}
					},
					function(cond, callback) {
						cond.push({
							$project: {
								name: 1,
								_id: 1
							}
						});
						_Campains.aggregate(cond, callback);
					}
				], callback);
			},
			//Albert refactors the code block below in order to serve maintain purpose easily
			// user: function(callback) {
			// 	_async.waterfall([
			// 		function(callback) {
			// 			_Company.distinct("_id", req.session.auth.company ? {_id: req.session.auth.company} : {}, function(err, com) {
			// 				if (err) return callback(err, null);
			// 				callback(null, com);
			// 			})
			// 		}, function(com, callback) {
			// 			_AgentGroups.distinct("_id", {idParent: {$in: com}}, function(err, result) {
			// 				if (err) return callback(err, null);
			// 				callback(null, com, result);
			// 			})
			// 		}, function(com, result, callback) {
			// 			_Users.find({$or: [{'agentGroupLeaders.group': {$in: result}}, {'agentGroupMembers.group': {$in: result}}, {'companyLeaders.company': {$in: com}}]}, function(err, result) {
			//
			// 				if (err) return callback(err, null);
			// 				callback(null, result);
			// 			});
			// 		}
			// 	], callback);
			// },

			user: function(done) {
				getAgents(req, done);
			},

			ticketReasonCategory: function(callback) {
				_async.waterfall([
					function(callback) {
						_TicketReasonCategory.find({
							$or: [
								{category: 0},
								{category: 2}
							]
						}, callback);
					},
					function(trc, callback) {
						_TicketReason.find({idCategory: {$in: _.pluck(trc, '_id')}}, function(err, result) {
							callback(err, trc, result);
						});
					},
					function(trc, tr, callback) {
						_TicketSubreason.find({idReason: {$in: _.pluck(tr, '_id')}}, function(err, result) {
							callback(err, {
								trc: trc,
								tr: tr,
								tsr: result
							});
						});
					}
				], callback);
			},
			customer: function(callback) {
				_CustomerSource.find({}, callback);
			},
			orderInfo: function(callback) {
				_async.parallel({
					orderParts: function(done) {
						mongoClient.collection('orders').distinct('cardType', done);
					},
					orderCards: function(done) {
						mongoClient.collection('orders').distinct('card', {card: {$nin: [null, '']}}, done);
					}
				}, callback)
			}
		}, function(err, result) {
			var temp = result.ticketReasonCategory;
			delete result.ticketReasonCategory;

			result['ticketReasonCategory'] = temp.trc;
			result['ticketReason'] = temp.tr;
			result['ticketSubreason'] = temp.tsr;

			return _.render(req, res, 'report-orders', {
				title: titlePage,
				plugins: ['moment', ['bootstrap-select'], ['bootstrap-daterangepicker'], ['chosen'], ['highchart'], ['highchart-table']],
				recordPath: _config.recordPath ? _config.recordPath.path : '',
				data: result
			}, true, err);
		});
	}
};

function permissionConditions(req, callback) {
	var cond = [{$match: {idService: null}}, {$match: {idAgent: {$ne: null}}}];
	if (_.isEmpty(req.session.auth.company)) {
		callback(null, cond);
	} else {
		var companyId = _.convertObjectId(req.session.auth.company._id);

		if (req.session.auth.company.leader) {
			_Campains.aggregate([
				{$match: {idCompany: companyId}},
				{$project: {_id: 1}}
			], function(err, result) {
				if (err) return callback(err, null);
				cond.push({$match: {idCampain: {$in: _.pluck(result, '_id')}}});
				callback(err, cond);
			});
		} else {
			var err = new Error('Không đủ quyền hạn để truy cập trang này');
			callback(err);
		}
	}
}

/**
 * Lấy thông tin đơn hàng
 * @param req Request của client
 * @param callback Khi hoàn thành việc lấy thông tin đơn hàng
 */
function getOrders(req, callback) {
	var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
	var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
	var sort = _.cleanSort(req.query, '');

	var orderStatus = _.has(req.query, 'order_raw_status') ? parseInt(req.query.order_raw_status) : 0;
	if (orderStatus === 0) {
		var options = {
			"limit": rows,
			"skip": (page - 1) * rows
		};
		var orderCond = _.extend(getOrderCondition(req), {
			ticketId: {
				'$exists': true,
				'$eq': ''
			}
		});
		if (_.has(req.query, 'download') && !_.isEqual(req.query.download, '0')) {
			return callback('download', orderCond, parseInt(req.query.totalResult));
		}
		createPagingOrders(req, orderCond, page, rows);
		_async.parallel({
			orders: function(done) {
				mongoClient.collection('orders').find(orderCond, options).toArray(done);
			},
			reportByDay: function(done) {
				getReportOrderByDay(orderCond, true, done);
			}
		}, callback);
	} else {
		getTickets(req, callback);
	}
}

/**
 * Lấy điều kiện lọc đơn hàng
 * @param req
 * @returns {{}}
 */
function getOrderCondition(req) {
	var orderCond = {};
	var _query = _.cleanRequest(req.query, ['_'
		, 'updated'
		, 'idCampain'
		, 'note'
		, 'formId'
		, 'dt'
		, 'ignoreSearch'
		, 'socketId'
		, 'download'
		, 'totalResult'
	]);
	if (_.has(_query, 'orderCreated')) {
		var from, to;
		if (_query.orderCreated.split(' - ').length > 1) {
			from = _moment(_query.orderCreated.split(' - ')[0], 'HH:mm DD/MM/YYYY').isValid() ? _moment(_query.orderCreated.split(' - ')[0], 'HH:mm DD/MM/YYYY') : _moment(_query.orderCreated.split(' - ')[0], 'DD/MM/YYYY');
			to = _moment(_query.orderCreated.split(' - ')[1], 'HH:mm DD/MM/YYYY').isValid() ? _moment(_query.orderCreated.split(' - ')[1], 'HH:mm DD/MM/YYYY') : _moment(_query.orderCreated.split(' - ')[1], 'DD/MM/YYYY');
		} else {
			from = _moment(_query.orderCreated, 'DD/MM/YYYY').startOf('day');
			to = _moment(_query.orderCreated, 'DD/MM/YYYY').endOf('day');
		}
		if (from.isValid() && to.isValid()) {
			var timeRange = _.sortBy([from, to], function(time) {
				return time._d.getTime(); // sort by ASC
			});
			from = timeRange[0]._d.getTime();
			to = _.isEqual(timeRange[1]._f, 'DD/MM/YYYY') ? timeRange[1].endOf('day')._d.getTime() : timeRange[1]._d.getTime();
			orderCond.createDate = {
				$gte: from,
				$lte: to
			}
		}
	}
	if (_.has(_query, 'order_deliveryType')) {
		orderCond.deliveryType = {'$in': _query.order_deliveryType}
	}
	if (_.has(_query, 'order_cardType')) {
		orderCond.cardType = {'$in': _query.order_cardType};
	}
	if (_.has(_query, 'order_card')) {
		orderCond.card = {'$in': _query.order_card};
	}
	if (_.has(_query, 'order_name')) {
		orderCond.name = {$regex: new RegExp(_.stringRegex(_query.order_name), 'i')}
	}
	if (_.has(_query, 'order_phone')) {
		orderCond.phone = {$regex: new RegExp(_.stringRegex(_query.order_phone), 'i')}
	}
	if (_.has(_query, 'order_isUpSale')) {
		var isUpSale = _query.order_isUpSale[0];
		if (isUpSale === 'true') {
			orderCond.isUpSale = isUpSale;
		} else {
			orderCond.$or = [{isUpSale: {$exists: false}}, {isUpSale: isUpSale}];
		}
	}
	return orderCond;
}

function createPagingOrders(req, cond, page, rows) {
	mongoClient.collection('orders').find(cond).count(function(err, total) {
		var obj = {};
		if (err) {
			obj = {code: 500, message: err.message, formId: req.query.formId, dt: req.query.dt};
		} else {
			var paginator = new pagination.SearchPaginator({
				prelink: '/report-orders',
				current: page,
				rowsPerPage: rows,
				totalResult: total
			});
			obj = {code: 200, message: paginator.getPaginationData(), formId: req.query.formId, dt: req.query.dt}
		}
		sio.sockets.socket(req.query.socketId).emit('responseReportOrdersPagingData', obj);
	});
}

function getTickets(req, callback) {
	var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
	var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

	var sort = _.cleanSort(req.query, '');

	var _query = _.cleanRequest(req.query, ['_'
		, 'updated'
		, 'idCampain'
		, 'note'
		, 'formId'
		, 'dt'
		, 'ignoreSearch'
		, 'socketId'
		, 'download'
		, 'totalResult'
		// order key
		, 'order_raw_status'
		, 'orderCreated'
		, 'order_deliveryType'
		, 'order_cardType'
		, 'order_card'
		, 'order_phone'
		, 'order_name'
		, 'order_isUpSale'
	]);

	var conditionGroupByDay = {};

	_async.waterfall([
		function(callback) {
			permissionConditions(req, callback);
		},
		// Lấy thông tin Customers
		function(cond, callback) {
			// Lây thông tin nguồn khách hàng và khách hàng theo số điện thoại
			_async.parallel({
				customerSources: function(callback) {
					if (!_.has(_query, 'customersources')) return callback(null, null);
					_CustomerSource.find({'_id': {'$in': _query.customersources}},
						{_id: 1},
						function(err, result) {
							if (err) return callback(err, null);

							delete _query.customersources;
							if (result == null || result.length == 0) return callback(searchNotFoundError, null);
							callback(err, _.pluck(result, '_id'));
						});
				},
				phoneNumber: function(callback) {
					if (!_.has(_query, 'field_so_dien_thoai')) return callback(null, null);
					_CCKFields['field_so_dien_thoai'].db.find(

						{value: {$regex: new RegExp(_.stringRegex(_query.field_so_dien_thoai), 'i')}},
						function(err, result) {
							if (err) return callback(err, null);

							delete _query.field_so_dien_thoai;
							if (result == null || result.length == 0) return callback(searchNotFoundError, null);
							callback(err, _.pluck(result, 'entityId'));
						}
					)
				},
				orders: function(callback) {
					var orderCond = _.extend(getOrderCondition(req), {
						ticketId: {
							'$exists': true,
							'$ne': ''
						}
					});
					mongoClient.collection('orders').distinct('ticketId', orderCond, callback);
				}
			}, function(err, result) {
				if (err) return callback(err, cond, result);

				var query = {};
				if (!_.isNull(result.phoneNumber) && _.isArray(result.phoneNumber)) query['_id'] = {$in: result.phoneNumber};
				if (!_.isNull(result.customerSources) && _.isArray(result.customerSources)) query['sources'] = {$in: result.customerSources}; // customerSources is a Array
				if (!_.isNull(result.orders) && _.isArray(result.orders)) cond.push({$match: {_id: {$in: result.orders}}});

				if (_.isEmpty(query)) return callback(null, cond, null);
				_Customer.find(query, {_id: 1}, function(err, result) {
					callback(err, cond, _.pluck(result, '_id'));
				});
			});
		},
		// Chuẩn hóa điều kiện tìm kiếm theo thời gian
		function(cond, customerId, callback) {
			var obj = _.chain(_query)
				.keys()
				.reduce(function(memo, item) {
					if (_.isArray(req.query[item])) {
						if (_.isEqual(item, 'status')) {
							memo[item] = {
								'$in': req.query[item].map(function(i) {
									return parseInt(i);
								})
							};
						} else {
							memo[item] = {'$in': req.query[item]};
						}
					} else {
						memo[item] = req.query[item];
					}
					return memo;
				}, {})
				.value();
			if (_.has(req.query, 'idCampain') && !_.isEmpty(req.query['idCampain']))
				obj['idCampain'] = {$in: _.arrayObjectId(req.query['idCampain'])};
			if (_.has(obj, 'callIdLength'))
				obj['callIdLength'] = Number(obj['callIdLength']);
			if (!_.isEmpty(obj))
				cond.push({$match: obj});
			if (!_.isEmpty(customerId)) cond.push({$match: {idCustomer: {$in: customerId}}});

			if (!!req.query.updated) {
				var from, to;
				if (req.query.updated.split(' - ').length > 1) {
					from = _moment(req.query.updated.split(' - ')[0], 'HH:mm DD/MM/YYYY').isValid() ? _moment(req.query.updated.split(' - ')[0], 'HH:mm DD/MM/YYYY') : _moment(req.query.updated.split(' - ')[0], 'DD/MM/YYYY');
					to = _moment(req.query.updated.split(' - ')[1], 'HH:mm DD/MM/YYYY').isValid() ? _moment(req.query.updated.split(' - ')[1], 'HH:mm DD/MM/YYYY') : _moment(req.query.updated.split(' - ')[1], 'DD/MM/YYYY');
				} else {
					from = _moment(req.query.updated, 'DD/MM/YYYY').startOf('day');
					to = _moment(req.query.updated, 'DD/MM/YYYY').endOf('day');
				}
				if (from.isValid() && to.isValid()) {
					var timeRange = _.sortBy([from, to], function(time) {
						return time._d.getTime(); // sort by ASC
					});
					from = timeRange[0]._d;
					to = _.isEqual(timeRange[1]._f, 'DD/MM/YYYY') ? timeRange[1].endOf('day')._d : timeRange[1]._d;
					cond.push({$match: {updated: {$gte: from, $lte: to}}});
				}
			}

			if (_.has(req.query, 'note')) {
				cond.push({$match: {note: {$regex: new RegExp(_.stringRegex(req.query.note), 'i')}}});
			}

			callback(null, parseJSONToObject(cond));
		},
		// Lấy danh sách ticketIds theo điều kiện cond
		function findTicket(cond, callback) {
			if (_.has(req.query, 'download') && !_.isEqual(req.query.download, '0')) {
				return callback('download', cond, parseInt(req.query.totalResult));
			}

			var __query = parseJSONToObject(cond);

			if (!_.isEmpty(sort)) cond.push({$sort: sort});
			cond.push({$skip: (page - 1) * rows}, {$limit: rows});
			cond.push({$project: {_id: 1}});
			_Tickets.aggregate(cond, function(err, result) {
				if (err) return callback(err, null);

				if (_.has(req.query, 'socketId')
					&& (_.isEqual(req.query.ignoreSearch, '1') || result.length > 0)) {
					/* Lấy thông tin để truy vấn báo cáo theo ngày */
					conditionGroupByDay = _.clone(__query);
					/**/
					createPaging(req, __query, page, rows);
				}
				callback(err, _.pluck(result, '_id'));
			});
		},
		function(ticketIds, callback) {
			var agg = [{$match: {_id: {$in: ticketIds}}}];
			agg.push.apply(agg, collectTicketInfo());
			if (!_.isEmpty(sort)) agg.push({$sort: sort});
			_Tickets.aggregate(agg, callback);
		},
		function(tickets, next) {
			var agg = [{$match: {_id: {$in: _.pluck(tickets, '_id')}}}];
			agg.push({$unwind: '$callId'});
			agg.push({
				$lookup: {
					from: 'cdrtransinfos',
					localField: 'callId',
					foreignField: 'callId',
					as: 'trans'
				}
			});
			agg.push({$unwind: '$trans'});
			agg.push({
				$group: {
					_id: "$_id",
					max: {$max: "$trans.callDuration"},
					recordPath: {$push: {path: "$trans.recordPath", dur: "$trans.callDuration"}}
				}
			});

			_async.parallel({
				tickets: function(done) {
					_Tickets.aggregate(agg, function(err, result) {
						var _records = {};
						_.each(result, function(el) {
							_.each(el.recordPath, function(el2) {
								if (el2.dur == el.max && el2.path) _records[el._id.toString()] = el2.path;
							});
						});

						_.each(tickets, function(el) {
							el.recordPath = _records[el._id.toString()];
						});
						done(err, tickets);
					});
				},
				reportByDay: function(done) {
					if (conditionGroupByDay.length > 0 && page === 1) {
						getReportOrderByDay(conditionGroupByDay, false, done);
					} else {
						done(null, null);
					}
				}
			}, next);
		}
	], callback);
}


//Albert: find agents who belong to outbound group only.
function getAgents(req, callback) {
	_async.waterfall([
		function(next) {
			_Company.distinct("_id", req.session.auth.company ? {_id: req.session.auth.company} : {}, next);
		},
		function(coms, next) {
			_async.parallel({
				companys: function(done) {
					done(null, coms);
				},
				agentGroups: function(done) {
					_AgentGroups.distinct("_id", {idParent: {$in: coms}}, done);
				},
				campaignAgents: function(done) {
					_CampaignAgent.distinct('idAgent', {status: 1}, done);
				}
			}, next);
		},
		function(bundle, next) {
			_Users.find({
				$or: [
					{'agentGroupLeaders.group': {$in: bundle.agentGroups}},
					{'agentGroupMembers.group': {$in: bundle.agentGroups}},
					{'companyLeaders.company': {$in: bundle.companys}}
				],
				_id: {$in: bundle.campaignAgents}
			}, next);
		}
	], callback);
}

function collectTicketInfo() {

	return [
		{
			$lookup: {
				from: 'campains',
				localField: 'idCampain',
				foreignField: '_id',
				as: 'campain'
			}
		},
		{$unwind: '$campain'},
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
				as: 'agent'
			}
		},
		{$unwind: {path: '$agent', preserveNullAndEmptyArrays: true}},
		{
			$lookup: {
				from: 'field_so_dien_thoai',
				localField: 'idCustomer',
				foreignField: 'entityId',
				as: 'field_so_dien_thoai'
			}
		},
		{$unwind: {path: '$field_so_dien_thoai', preserveNullAndEmptyArrays: true}},
		{
			$lookup: {
				/* I want to get full customer info. I do change 'customer' to 'customerindex' */
				from: 'customerindex',
				localField: 'idCustomer',
				foreignField: '_id',
				as: 'customer'
			}
		},
		{$unwind: {path: '$customer', preserveNullAndEmptyArrays: true}},
		{$unwind: {path: '$customer.sources', preserveNullAndEmptyArrays: true}},
		/* lookup order info*/
		{
			$lookup: {
				from: 'orders',
				localField: '_id',
				foreignField: 'ticketId',
				as: 'order'
			}
		},
		{$unwind: {path: '$order', preserveNullAndEmptyArrays: true}},
		{
			$lookup: {
				from: 'customersources',
				localField: 'customer.sources',
				foreignField: '_id',
				as: 'customer.sources'
			}
		},
		{$unwind: {path: '$customer.sources', preserveNullAndEmptyArrays: true}},
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
				callId: {$first: '$callId'},
				campain: {$first: '$campain.name'},
				field_so_dien_thoai: {$first: '$field_so_dien_thoai.value'},
				sources: {$push: '$customer.sources.name'},
				customer: {$first: '$customer'},
				order: {$first: '$order'},
				agent: {$first: '$agent'},
				status: {$first: '$status'},
				ticketReasonCategory: {$first: '$ticketReasonCategory.name'},
				ticketReason: {$first: '$ticketReason.name'},
				ticketSubreason: {$first: '$ticketSubreason.name'},
				note: {$first: '$note'},
				updated: {$first: '$updated'},
				ubName: {$first: '$updateBy.name'},
				ubdisplayName: {$first: '$updateBy.displayName'}
			}
		},
		{
			$project: {
				_id: 1,
				callId: 1,
				callIdLength: {$size: '$callId'},
				campain: 1,
				field_so_dien_thoai: 1,
				sources: 1,
				customer: 1,
				order: 1,
				agent: 1,
				status: 1,
				ticketReasonCategory: 1,
				ticketReason: 1,
				ticketSubreason: 1,
				note: 1,
				updated: 1,
				ubName: 1,
				ubdisplayName: 1
			}
		}
	];
}

function createPaging(req, aggregate, page, rows) {
	aggregate.push({
		$group: {
			_id: '$status',
			count: {$sum: 1}
		}
	});
	_Tickets.aggregate(aggregate, function(err, result) {
		var obj = {};
		if (err) {
			obj = {code: 500, message: err.message, formId: req.query.formId, dt: req.query.dt};
		} else {
			var total = _.chain(result)
				.pluck('count')
				.reduce(function(memo, item) {
					return memo + item;
				}, 0)
				.value();

			var paginator = new pagination.SearchPaginator({
				prelink: '/report-orders',
				current: page,
				rowsPerPage: rows,
				totalResult: total
			});

			obj = {code: 200, message: paginator.getPaginationData(), formId: req.query.formId, dt: req.query.dt}
		}
		sio.sockets.socket(req.query.socketId).emit('responseReportOrdersPagingData', obj);
	});
}

function exportExcel(req, res, conditions, totalResult) {
	var maxRecordPerFile = 65000;
	var maxParallelTask = 5;
	var waterFallTask = [];
	var currentDate = new Date();
	var folderName = req.session.user._id + "-" + currentDate.getTime();
	var fileName = titlePage + ' ' + _moment(currentDate).format('DD-MM-YYYY');

	var date = new Date().getTime();

	if (totalResult > maxRecordPerFile) {
		for (var k = 0; k < Math.ceil(totalResult / (maxRecordPerFile * maxParallelTask)); ++k) {
			var tempWaterfall = [];
			if (k == 0) {
				tempWaterfall = function(callback) {
					_async.parallel(createParallelTask(k), callback);
				}
			} else {
				tempWaterfall = function(objectId, callback) {
					var lastObjectId = objectId[maxParallelTask - 1];
					_async.parallel(createParallelTask(k, lastObjectId), callback);
				}
			}

			waterFallTask.push(tempWaterfall);
		}

		var createParallelTask = function(index, objectId) {
			var tempParallelTask = [];
			for (var i = 0; i < maxParallelTask; ++i) {
				var temp = function(callback) {
					var agg = parseJSONToObject(JSON.stringify(conditions));
					if (_.isEmpty(objectId)) {
						agg.push({$limit: maxRecordPerFile});
					} else {
						agg.push({$match: {_id: {$gt: objectId}}}, {$limit: maxRecordPerFile});
					}

					agg.push.apply(agg, collectTicketInfo());

					_Tickets.aggregate(agg, function(err, result) {
						if (err) return callback(err, null);
						createExcelFile(req
							, folderName
							, fileName + '-' + index + '-' + i
							, result
							, callback);
					});
				};

				tempParallelTask.push(temp);
			}
			return tempParallelTask;
		}
	} else { // File excel nhỏ hơn 65k dòng
		var temp = function(callback) {
			if (_.has(req.query, 'order_raw_status') && req.query.order_raw_status != 0) { // Đơn hàng đã / đang / chờ xử lý
				conditions.push.apply(conditions, collectTicketInfo());
				conditions.push({$sort: {updated: 1}});
				_Tickets.aggregate(conditions, function(err, result) {
					if (err) return callback(err, null);
					var orders = [];
					_.each(result, function(ticket) {
						var order = _.clone(ticket.order);
						orders.push(_.extend(order, {'ticket': _.clone(ticket)}));
					});
					createExcelFile(req
						, folderName
						, fileName
						, orders
						, callback);
				});
			} else {
				var orderCond = _.extend(getOrderCondition(req), {
					ticketId: {
						'$exists': true,
						'$eq': ''
					}
				});
				mongoClient.collection('orders').find(orderCond, {'sort': {createDate: -1}}).toArray(function(err, orders) {
					createExcelFile(req
						, folderName
						, fileName
						, orders
						, callback);
				});
			}

		};
		waterFallTask.push(temp);
	}

	waterFallTask.push(
		function(objectId, callback) {
			fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'archiver'), callback);
		},
		function(t, callback) {
			var folderPath = path.join(_rootPath, 'assets', 'export', 'ticket', folderName);
			var folderZip = path.join(_rootPath, 'assets', 'export', 'archiver', folderName + '.zip');
			zipFolder(folderPath, folderZip, function(err) {
				callback(err, folderZip.replace(_rootPath, ''));
			});
		}
	);

	_async.waterfall(waterFallTask, function(err, folderZip) {
		res.json({code: err ? 500 : 200, message: err ? err.message : folderZip});
	});
}

/**
 *
 * @param req
 * @param folderName
 * @param fileName
 * @param data Danh sách đơn hàng (có thể trong item đơn hàng chứa ticket hoặc không)
 * @param callback
 */
function createExcelFile(req, folderName, fileName, data, callback) {
	var options = {
		filename: path.join(_rootPath, 'assets', 'export', 'ticket', folderName, fileName + '.xlsx'),
		useStyles: true,
		useSharedStrings: true,
		dateFormat: 'DD/MM/YYYY HH:mm:ss'
	};

	_async.waterfall([
		function createFolder(callback) {
			fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'ticket', folderName), callback);
		},
		function(t, callback) {
			fsx.readJson(path.join(_rootPath, 'assets', 'const.json'), callback);
		},
		function createExcelFile(_config, callback) {
			var orderHeaders = [
				'TXT_CUSTOMER_NAME',
				'TXT_PHONE_NUMBER',
				'TXT_CUSTOMER_EMAIL',
				'TXT_ORDER_ADDRESS',
				'TXT_ORDER_CARD_TYPE',
				'TXT_ORDER_CARD',
				'TXT_ORDER_DELIVERY_TYPE',
				'TXT_ORDER_CREATED',
				'TXT_ORDER_URL',
				'TXT_ORDER_DEVICE_INFO',
				'TXT_ORDER_IP',
				'TXT_ORDER_IS_UP_SALE',
				'TXT_ORDER_ORIGIN_CARD'
			];
			var ticketHeaders = [
				'TXT_UPDATED_BY'
				, 'TXT_CAMPAIGN_NAME'
				, 'TXT_CUSTOMER_SOURCE'
				, 'TXT_TICKET_REASON_CATEGORY'
				, 'TXT_TICKET_REASON'
				, 'TXT_TICKET_SUBREASON'
				, 'TXT_STATUS'
				, 'TXT_CALLS'
				, 'TXT_CUSTOMER_NAME'
				, 'TXT_PHONE_NUMBER'
				, 'TXT_CUSTOMER_EMAIL'
				, 'TXT_ORDER_ADDRESS'
				, 'TXT_ORDER_CARD'
				, 'TXT_NOTE'
				, 'TXT_UPDATED'
			];

			var workbook = new _Excel.Workbook();
			workbook.creator = req.session.user.displayName;
			workbook.created = new Date();
			var sheet = workbook.addWorksheet(titlePage);
			var columns = [];

			_.each(orderHeaders, function(header) {
				columns.push({
					header: _config.MESSAGE.REPORT_ORDERS[header],
					key: header,
					width: _config.MESSAGE.REPORT_ORDERS[header].length
				});
			});
			if (_.has(req.query, 'order_raw_status') && req.query.order_raw_status != 0) { // Đơn hàng đã / đang / chờ xử lý
				_.each(ticketHeaders, function(header) {
					columns.push({
						header: 'Ticket_' + _config.MESSAGE.REPORT_ORDERS[header],
						key: 'Ticket_' + header,
						width: _config.MESSAGE.REPORT_ORDERS[header].length
					});
				});
			}
			sheet.columns = columns;

			if (data !== null) {
				/*var t = [];
				 data.map(function(d) {
				 t.push("ObjectId('" + d._id.toString() + "')");
				 });*/
				// data is order array
				_async.eachSeries(data, function(order, callback) {
					var ticket = order.ticket;
					var rows = [
						order.name,
						order.phone,
						order.email,
						order.address,
						order.cardType,
						order.card ? order.card.replace(/(?:\"|\[|\])/g, "") : '',
						order.deliveryType,
						moment(order.createDate).format('HH:mm DD/MM/YYYY'),
						order.url,
						order.deviceInfo,
						order.ip,
						order.isUpSale ? order.isUpSale : 'false',
						order.originCard
					];
					if (ticket) {
						rows.push.apply(rows, [
							ticket.ubdisplayName + '(' + ticket.ubName + ')',
							ticket.campain,
							ticket.sources.join(' ,'),
							ticket.ticketReasonCategory ? ticket.ticketReasonCategory : '',
							ticket.ticketReason ? ticket.ticketReason : '',
							ticket.ticketSubreason,
							changeStatus(ticket.status),
							ticket.callIdLength,
							ticket.customer.field_ho_ten,
							ticket.field_so_dien_thoai,
							ticket.customer.field_e_mail,
							ticket.customer.field_dia_chi,
							ticket.customer.field_ten_goi_the,
							ticket.note,
							moment(ticket.updated).format('HH:mm DD/MM/YYYY')
						]);
					}
					sheet.addRow(rows);
					callback();
				}, function(err, result) {
					workbook.xlsx.writeFile(options.filename)
						.then(callback);
				});
			} else {
				workbook.xlsx.writeFile(options.filename)
					.then(callback);
			}
		}
	], function(err, result) {
		callback(err, data[data.length - 1]._id);
	});
}

function changeStatus(status) {
	switch (status) {
		case 0:
			return 'Chờ xử lý';
		case 1:
			return 'Đang xử lý';
		default:
			return 'Hoàn thành';
	}
}

/**
 * Lấy báo cáo đơn hàng, gom nhóm theo ngày
 * @param condition
 * @param isNoTicket false: điều kiện không có đơn hàng (chưa xử lý)
 * @param callback
 */
function getReportOrderByDay(condition, isNoTicket, callback) {
	var utcTime = 7 * 60 * 60 * 1000;
	if (isNoTicket) {
		condition = [
			{
				$match: condition
			},
			{
				$project: {
					createDate: 1,
					english: {
						$cond: [{$eq: ["$cardType", "Thẻ Tiếng Anh"]}, 1, 0]
					},
					japan: {
						$cond: [{$eq: ["$cardType", "Thẻ Tiếng Nhật"]}, 1, 0]
					},
					other: {
						$cond: [{$eq: ["$cardType", ""]}, 1, 0]
					}
				}
			},
			{
				$group: {
					_id: {
						day: {$dayOfMonth: {$add: [new Date(utcTime), "$createDate"]}},
						month: {$month: {$add: [new Date(utcTime), "$createDate"]}},
						year: {$year: {$add: [new Date(utcTime), "$createDate"]}}
					},
					counterEnglish: {$sum: '$english'},
					counterJapan: {$sum: '$japan'},
					counterOther: {$sum: '$other'}
				}
			},
			{
				$sort: {'_id.year': 1, '_id.month': 1, '_id.day': 1}
			}
		];
		return mongoClient.collection('orders').aggregate(condition, callback);
	} else {
		condition.push.apply(condition, [
			{
				$lookup: {
					from: 'orders',
					localField: '_id',
					foreignField: 'ticketId',
					as: 'order'
				}
			},
			{$unwind: {path: '$order', preserveNullAndEmptyArrays: true}},
			{
				$project: {
					updated: 1,
					english: {
						$cond: [{$eq: ["$order.cardType", "Thẻ Tiếng Anh"]}, 1, 0]
					},
					japan: {
						$cond: [{$eq: ["$order.cardType", "Thẻ Tiếng Nhật"]}, 1, 0]
					},
					other: {
						$cond: [{$eq: ["$order.cardType", ""]}, 1, 0]
					}
				}
			},
			{
				$group: {
					_id: {
						day: {$dayOfMonth: {$add: ["$updated", utcTime]}},
						month: {$month: {$add: ["$updated", utcTime]}},
						year: {$year: {$add: ["$updated", utcTime]}}
					},
					startTime: {$min: '$updated'},
					endTime: {$max: '$updated'},
					counterEnglish: {$sum: '$english'},
					counterJapan: {$sum: '$japan'},
					counterOther: {$sum: '$other'}
				}
			},
			{
				$sort: {'_id.year': 1, '_id.month': 1, '_id.day': 1}
			}
		]);
		return _Tickets.aggregate(condition, callback);
	}
}