/**
 * Created by hoangdv on /11/2016.
 */

var findCond = function(req, callback) {
	var query = req.query;
	var _query = {};
	getInfos(req, function(err, company, groups) {
		if (!err) {
			var _cond = {};
			var _matchType = {};
			var _sort = {};
			if (groups.length) {
				var groupIds = _.pluck(groups, '_id');
				_cond = {
					$or: [
						{'idAgent.agentGroupMembers.group': {$in: groupIds}},
						{'idAgent.agentGroupLeaders.group': {$in: groupIds}},
						{
							$and: [
								{
									'idAgent': {$eq: null}
								},
								{
									$or: [
										{'createBy.agentGroupLeaders.group': {$in: groupIds}},
										{'createBy.agentGroupMembers.group': {$in: groupIds}}
									]
								}
							]
						}
					]
				};
			}
			else if (company.length) {
				_cond = {
					$or: [
						{'idService.idCompany': {$in: _.pluck(company, '_id')}},
						{'idCampain.idCompany': {$in: _.pluck(company, '_id')}}
					]
				};
			}

			_async.each(["sort", "inbound", "status", "field_ho_ten", "field_so_dien_thoai", "updated", "createBy", "idAgent", "deadline"], function(field, fn) {
				if (!query[field]) {
					if (field == "sort") {
						_sort['updated'] = -1;
					}
					return fn();
				}

				if (field == "sort") {
					var param = req.query[field].split(':')[0];
					var value = req.query[field].split(':')[1];
					if (value != 'none') {
						value = (value == "asc") ? 1 : -1;
						if (param == 'field_ho_ten' || param == 'field_so_dien_thoai') {
							_sort["idCustomer." + param] = value;
						}
						else if (param == 'createBy' || param == 'updateBy') {
							_sort[param + '.displayName'] = value;
						}
						else {
							_sort[param] = value;
						}
					}
				}
				else if (field == "inbound") {
					if (Number(query[field]) == 1) {
						_matchType['idService'] = {$ne: null};
						if (query['subject']) {
							_query['idService.name'] = {$regex: new RegExp(_.stringRegex(query['subject']), 'i')};
						}
					}
					else {
						_matchType['idCampain'] = {$ne: null};
						if (query['subject']) {
							_query['idCampain.name'] = {$regex: new RegExp(_.stringRegex(query['subject']), 'i')};
						}
					}
				}
				else if (field == "status") {
					_query[field] = {$eq: Number(query[field])};
				}
				else if (field == "field_ho_ten"  || field == "field_so_dien_thoai") {
					_query["idCustomer." + field] = {$regex: new RegExp(_.stringRegex(query[field]), 'i')};
				}
				else if (field == "updated") {
					var _d1 = _moment(query[field].split(' - ')[0], 'DD/MM/YYYY');
					var _d2 = query[field].split(' - ')[1] ? _moment(query[field].split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

					var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
					var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
					startDay = startDay.startOf('day');
					endDay = endDay.endOf('day');

					_query[field] = {
						$gte: startDay._d,
						$lte: endDay._d
					}
				}
				else if (field == "deadline") {
					var _d1 = _moment(query[field].split(' - ')[0], 'DD/MM/YYYY');
					var _d2 = query[field].split(' - ')[1] ? _moment(query[field].split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

					var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
					var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
					startDay = startDay.startOf('day');
					endDay = endDay.endOf('day');

					_query[field] = {
						$gte: startDay._d,
						$lte: endDay._d
					}
				}
				else if (field == "createBy" || field == "idAgent") {
					var keyDisplayName = field + '.displayName';
					var keyName = field + '.name';
					if (_.has(_query, '$or') && _.isArray(_query['$or'])) {
						_query['$or'].push.apply(_query['$or'], [
							{
								[keyDisplayName]: {$regex: new RegExp(_.stringRegex(query[field]), 'i')}
							}, {
								[keyName]: query[field]
							}
						]);
					} else {
						_query['$or'] = [
							{
								[keyDisplayName]: {$regex: new RegExp(_.stringRegex(query[field]), 'i')}
							}, {
								[keyName]: query[field]
							}
						];
					}
				}
				fn();
			}, function() {
				callback([
					//{$limit: 50000}, // fixed limit query
					{
						$match: {
							$and: [
								{status: {$ne: 2}},
								_matchType
							]
						}
					},
					{
						$lookup: {
							from: 'customerindex',
							localField: 'idCustomer',
							foreignField: '_id',
							as: 'idCustomer'
						}
					},
					{
						$lookup: {
							from: 'users',
							localField: 'createBy',
							foreignField: '_id',
							as: 'createBy'
						}
					},
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
							from: 'users',
							localField: 'updateBy',
							foreignField: '_id',
							as: 'updateBy'
						}
					},
					{$unwind: {path: '$idCampain', preserveNullAndEmptyArrays: true}},
					{$unwind: {path: '$idService', preserveNullAndEmptyArrays: true}},
					{$unwind: {path: '$idCustomer', preserveNullAndEmptyArrays: true}},
					{$unwind: {path: '$createBy', preserveNullAndEmptyArrays: true}},
					{$unwind: {path: '$idAgent', preserveNullAndEmptyArrays: true}},
					{$unwind: {path: '$updateBy', preserveNullAndEmptyArrays: true}},
					{$match: _cond},
					{
						$lookup: {
							from: 'companies',
							localField: 'idCampain.idCompany',
							foreignField: '_id',
							as: 'idCampain.idCompany'
						}
					},
					{
						$lookup: {
							from: 'companies',
							localField: 'idService.idCompany',
							foreignField: '_id',
							as: 'idService.idCompany'
						}
					},
					{$match: _query},
					{$sort: _sort}
				]);
			})
		}
	});
};

var getInfos = function(req, callback) {
	if (!req.session.auth.role) {
		return callback(1);
	}
	if (!_.isEqual(req.session.auth.role._id, '57032832296c50d9b723d12e') && !_.isEqual(req.session.auth.role._id, '56ccdf99031ce3e32a48f5da') && !_.isEqual(req.session.auth.role._id, '56ccdf99031ce3e32a48f5db') && !_.isEqual(req.session.auth.role._id, '56ccdf99031ce3e32a48f5d8')) {
		return callback(1);
	}
	//Chỉ có các quyền sau được truy cập vào trang này
	//Quản lý kĩ thuật - quản lý dự án - quản lý công ty - quản lý nhóm
	//Phân biệt quyền ở trang này dựa vào module auth
	var companies = [];
	var agentGroups = [];
	_async.waterfall([
		function(callback) {
			switch (req.session.auth.role._id) {
				case '56ccdf99031ce3e32a48f5db':
					//Quản lý công ty
					companies = [{_id: _.convertObjectId(req.session.auth.company._id)}];
					break;
				case '56ccdf99031ce3e32a48f5d8':
					//Quản lý nhóm
					companies = [{_id: _.convertObjectId(req.session.auth.company._id)}];
					agentGroups = [{_id: _.convertObjectId(req.session.auth.company.group._id)}];
					break;
				default:
					//Quản lý tenant
					break;
			}

			if (companies.length) {
				return callback();
			}

			//Quản lý kĩ thuật - dự án
			_Company.find({}, "_id name", function(err, resp) {
				if (!err) {
					companies = resp;
				}
				callback(err);
			});
		}
	], function(err) {
		callback(err ? 500 : null, companies, agentGroups);
	});
};

// GET
exports.index = {
	json: function(req, res) {
		if (req.query.type) {
			var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
			var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
			if (Number(req.query.type) == 1 && req.query.idCompany) {
				//Lấy danh sách agent group của company
				_AgentGroups.find({idParent: _.convertObjectId(req.query.idCompany)}, function(err, resp) {
					res.json({code: err ? 500 : 200, data: resp});
				});
			}
			else if (Number(req.query.type) == 2) {
				//Lấy danh sách ticket
				findCond(req, function(agg) {
					var aggregate = _Tickets.aggregate(agg).allowDiskUse(true);
					_Tickets.aggregatePaginate(aggregate, {
						page: page,
						limit: rows,
						allowDiskUse: true
					}, function(err, resp, pageCount, total) {
						if (err) {
							return res.json({code: 500, data: err.toString()});
						}
						var paginator = new pagination.SearchPaginator({
							prelink: '',
							current: page,
							rowsPerPage: rows,
							totalResult: total
						});
						res.json({code: 200, data: resp, paging: paginator.getPaginationData()});
					});
				});
			}
			else if (Number(req.query.type) == 3) {
				_async.waterfall([
					function(callback) {
						if (req.query['modal_group']) {
							var groupId = _.convertObjectId(req.query['modal_group']);
							return callback(null, {
								$or: [
									{'agentGroupMembers.group': groupId},
									{'agentGroupLeaders.group': groupId}
								]
							});
						}
						//Nếu không bắn groupId lên thì cần phải lấy danh sách các group thuộc công ty
						if (!req.query['modal_company']) {
							return callback();
						}
						var companyId = _.convertObjectId(req.query['modal_company']);
						_AgentGroups.find({idParent: companyId}, function(err, resp) {
							if (err || !resp.length) {
								return callback();
							}
							var ids = _.pluck(resp, '_id');
							callback(null, {
								$or: [
									{'companyLeaders.company': companyId},
									{'agentGroupMembers.group': {$in: ids}},
									{'agentGroupLeaders.group': {$in: ids}}
								]
							});
						});
					}
				], function(err, resp) {
					var query = resp;
					if (req.query['modal_name']) {
						query = {
							$and: [
								{"displayName": {$regex: new RegExp(_.stringRegex(req.query['modal_name']), 'i')}},
								resp
							]
						};
					}
					_Users
						.find(query)
						.populate({
							path: 'agentGroupMembers.group agentGroupLeaders.group companyLeaders.company',
							select: 'idParent name',
							populate: {
								path: 'idParent',
								select: 'name'
							}
						})
						.paginate(page, rows, function(error, users, pageCount) {
							var paginator = new pagination.SearchPaginator({
								prelink: '/',
								current: page,
								rowsPerPage: rows,
								totalResult: pageCount
							});
							res.json({code: error ? 500 : 200, data: users, paging: paginator.getPaginationData()});
						});
				});
			}
		}
	},
	html: function(req, res) {
		if (!req.session.auth.role) {
			return _.render(req, res, '', {}, true, new Error("Không đủ quyền truy cập"));
		}
		if (!_.isEqual(req.session.auth.role._id, '57032832296c50d9b723d12e') && !_.isEqual(req.session.auth.role._id, '56ccdf99031ce3e32a48f5da') && !_.isEqual(req.session.auth.role._id, '56ccdf99031ce3e32a48f5db') && !_.isEqual(req.session.auth.role._id, '56ccdf99031ce3e32a48f5d8')) {
			return _.render(req, res, '', {}, true, new Error("Không đủ quyền truy cập"));
		}
		//Chỉ có các quyền sau được truy cập vào trang này
		//Quản lý kĩ thuật - quản lý dự án - quản lý công ty - quản lý nhóm
		//Phân biệt quyền ở trang này dựa vào module auth
		var companies = [];
		var agentGroups = [];
		_async.waterfall([
			function(callback) {
				switch (req.session.auth.role._id) {
					case '56ccdf99031ce3e32a48f5db':
						//Quản lý công ty
						companies = [req.session.auth.company];
						break;
					case '56ccdf99031ce3e32a48f5d8':
						//Quản lý nhóm
						companies = [req.session.auth.company];
						agentGroups = [req.session.auth.company.group];
						break;
					default:
						//Quản lý tenant
						break;
				}

				if (companies.length) {
					return callback();
				}

				//Quản lý kĩ thuật - dự án
				_Company.find({}, "_id name", function(err, resp) {
					if (!err) {
						companies = resp;
					}
					callback(err);
				});
			}
		], function(err) {
			_.render(req, res, 'assign-ticket', {
				title: 'Quản lý ticket',
				companies: companies,
				agentGroups: agentGroups,
				plugins: [
					['bootstrap-select'], ['bootstrap-datetimepicker']
				]
			}, true, err);
		});
	}
};

exports.create = function(req, res) {
	try {
		var _body = JSON.parse(req.body.ids);
		var deadline = req.body.deadline ? _moment(req.body.deadline, 'DD/MM/YYYY')._d : false;
		var totalRequest = _.reduce(_body, function(mem, num) {
			return mem + Number(num.value);
		}, 0);
		findCond(req, function(agg) {
			agg = _.filter(agg, function(i) {
				return !i.$sort && !i.$project;
			});
			agg.push({
				$project: {
					"_id": 1,
					"createBy": "$createBy._id",
					"deadline": 1,
					"updated": 1,
					"created": 1,
					"customerStatisfyStage": 1,
					"customerStatisfy": 1,
					"note": 1,
					"status": 1,
					"ticketReasonCategory": 1,
					"ticketReason": 1,
					"ticketSubreason": 1,
					"callId": 1,
					"idAgent": "$idAgent._id",
					"idService": "$idService._id",
					"idCampain": "$idCampain._id",
					"idCustomer": "$idCustomer._id",
					"agentGroup": 1,
					"groupId": 1,
					"assignTo": 1,
					"assignBy": 1,
					"statusAssign": 1
				}
			});
			var aggregate = _Tickets.aggregate(agg);
			aggregate.allowDiskUse(true);
			aggregate.exec(function(err, resp) {
				if (err) {
					return res.json({code: 500, msg: err.toString()});
				}
				var totalTicket = resp.length;
				if (totalTicket < totalRequest) {
					return res.json({
						code: 500,
						msg: 'Số lượng ticket ủy quyền không được lớn hơn tổng số lượng đang có!'
					});
				}
				//Set ủy quyền
				var _ticketBulk = mongoClient.collection('tickets').initializeOrderedBulkOp({useLegacyOps: true});
				//Tạo history
				var _ticketHistoryBulk = mongoClient.collection('tickethistories').initializeOrderedBulkOp({useLegacyOps: true});
				var index = 0;
				var selfId = _.convertObjectId(req.session.user._id);
				_async.each(_body, function(agent, fn) {
					agent.tickets = resp.splice(0, Number(agent.value));
					var aId = _.convertObjectId(agent._id);
					var now = new Date();
					var $set = {
						idAgent: aId,
						assignTo: aId,
						assignBy: selfId,
						updated: now,
						updateBy: selfId
					};
					if (deadline) {
						$set.deadline = deadline;
					}
					_ticketBulk.find({_id: {$in: _.pluck(agent.tickets, '_id')}}).update({
						$set
					});
					_async.each(agent.tickets, function(ticket, iFn) {
						var id = ticket._id;
						_ticketHistoryBulk.insert({
							ticketId: id,
							ticketObject: {
								_id: id,
								updateBy: selfId,
								assignTo: aId,
								assignBy: selfId,
								note: '',
								idAgent: aId,
								updated: now,
								deadline: ticket.deadline,
								status: ticket.status,
								groupId: ticket.groupId,
								customerStatisfy: ticket.customerStatisfy,
								customerStatisfyStage: ticket.customerStatisfyStage,
								idService: ticket.idService,
								idCampain: ticket.idCampain
							}
						});
						_.pushNotification(1, 'ticket-edit?ticketID=' + id, aId); //push notification được ủy quyền ticket
						iFn();
					}, function() {
						index += Number(agent.value);
						fn();
					});
				}, function() {
					_async.parallel([
						function(next) {
							if (_ticketBulk.length > 0) {
								_ticketBulk.execute(next);
							}
							else {
								next();
							}
						},
						function(next) {
							if (_ticketHistoryBulk.length > 0) {
								_ticketHistoryBulk.execute(next)
							}
							else {
								next();
							}
						}
					], function(err) {
						if (err) {
							return res.json({code: 500, msg: 'Lỗi bất thường của hệ thống, vui lòng thử lại!'});
						}
						res.json({code: 200, msg: 'Cập nhật dữ liệu thành công'});
					});
				});
			});
		});
	} catch (e) {
		res.json({code: 500, msg: 'Lỗi bất thường của hệ thống, vui lòng thử lại!'});
	}

};

