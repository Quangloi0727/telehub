/**
 * Created by Hoangdv on 02/Nov/16.
 */
var titlePage = 'Báo cáo gọi ra - Báo cáo năng suất điện thoại viên';
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
			getSalesProductivity(req, function(err, data) {
				res.json({
					code: err ? 500 : 200,
					data: data
				});
			});
		}
	},
	html: function(req, res) {
		if (req.session.auth.company && !req.session.auth.company.leader) {
			return _.render(req, res, 'report-sales-productivity', {
				title: titlePage,
				plugins: ['moment', ['bootstrap-select'], ['bootstrap-daterangepicker'], ['chosen'], ['highchart'], ['highchart-table'], 'export-excel'],
				data: null
			}, true, accessDenyError);
		}
		_async.parallel({
			campaign: function(done) {
				_async.waterfall([
					function(next) {
						if (!_.isEmpty(req.session.auth.company)) {
							var companyId = _.convertObjectId(req.session.auth.company._id);
							_Campains.aggregate([
								{$match: {idCompany: companyId}},
								{$project: {_id: 1}}
							], function(err, result) {
								if (err) return next(err, null);
								cond.push({$match: {_id: {$in: _.pluck(result, '_id')}}});
								next(err, cond);
							});
						} else {
							next(null, []);
						}
					},
					function(cond, next) {
						cond.push({
							$project: {
								name: 1,
								_id: 1
							}
						});
						_Campains.aggregate(cond, next);
					}
				], done);
			},
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
		}, function(err, result) {
			var temp = result.ticketReasonCategory;
			delete result.ticketReasonCategory;

			result['ticketReasonCategory'] = temp.trc;
			result['ticketReason'] = temp.tr;
			result['ticketSubreason'] = temp.tsr;

			return _.render(req, res, 'report-sales-productivity', {
				title: titlePage,
				plugins: ['moment', ['bootstrap-select'], ['bootstrap-daterangepicker'], ['chosen'], ['highchart'], ['highchart-table'], 'export-excel'],
				recordPath: _config.recordPath ? _config.recordPath.path : '',
				data: result
			}, true, err);
		});
	}
};

function getSalesProductivity(req, callback) {
	_async.waterfall([
		function(next) {
			var condition = {
				idService: null,
				updateBy: {$ne: null}
				//callIdLength: {$gte: 1}
			};
			var _query = _.cleanRequest(req.query, [
				'_',
				'dt',
				'updated',
				'customersources',
				'order_createDate',
				'cardType'
			]);
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
			_.extend(condition, obj);

			var obj2 = _.chain(_query)
				.keys()
				.reduce(function(memo, item) {
					if (_.isArray(req.query[item])) {
						if (_.isEqual(item, 'cardType')) {
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
			_.extend(condition, obj2);

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
					condition['updated'] = {$gte: from, $lte: to};
				}
			}
			if (_.has(req.query, 'customersources')) {
				_Customer.distinct('_id', {sources: req.query.customersources}, function(err, ids) {
					if (!err && ids) {
						condition['idCustomer'] = {
							$in: ids
						}
					}
					next(null, condition)
				});
			} else {
				next(null, condition);
			}
		},
		function(condition, next) {
			if (!_.has(condition, 'updateBy') || condition['updateBy'].$ne === null) {
				getAgents(req, function(err, users) {
					if (users) {
						condition['updateBy'] = {$in: _.pluck(users, '_id')}
					}
					next(null, condition);
				});
			} else {
				next(null, condition);
			}
		},
		function(condition, next) {
			if (_.has(req.query, 'order_createDate')) {
				var from = 0, to = Date.now();
				if (req.query.order_createDate.split(' - ').length > 1) {
					from = _moment(req.query.order_createDate.split(' - ')[0], 'HH:mm DD/MM/YYYY').isValid() ? _moment(req.query.order_createDate.split(' - ')[0], 'HH:mm DD/MM/YYYY') : _moment(req.query.order_createDate.split(' - ')[0], 'DD/MM/YYYY');
					to = _moment(req.query.order_createDate.split(' - ')[1], 'HH:mm DD/MM/YYYY').isValid() ? _moment(req.query.order_createDate.split(' - ')[1], 'HH:mm DD/MM/YYYY') : _moment(req.query.order_createDate.split(' - ')[1], 'DD/MM/YYYY');
				} else {
					from = _moment(req.query.order_createDate, 'DD/MM/YYYY').startOf('day');
					to = _moment(req.query.order_createDate, 'DD/MM/YYYY').endOf('day');
				}
				if (from.isValid() && to.isValid()) {
					var timeRange = _.sortBy([from, to], function(time) {
						return time._d.getTime(); // sort by ASC
					});
					from = timeRange[0]._d;
					to = _.isEqual(timeRange[1]._f, 'DD/MM/YYYY') ? timeRange[1].endOf('day')._d : timeRange[1]._d;
				}
				//Albert: implement "Chon Loai The"
				if (req.query.cardType == 0) {
					mongoClient.collection('orders').distinct('ticketId', {
						createDate: {
							$gte: from.getTime(),
							$lte: to.getTime()
						},
						ticketId: {
							$nin: [null, '']
						},
						cardType: "Thẻ Tiếng Anh"

					}, function(err, ticketIds) {
						condition['_id'] = {$in: ticketIds};
						next(null, condition);
					});
				} else if (req.query.cardType == 1) {
					mongoClient.collection('orders').distinct('ticketId', {
						createDate: {
							$gte: from.getTime(),
							$lte: to.getTime()
						},
						ticketId: {
							$nin: [null, '']
						},
						cardType: "Thẻ Tiếng Nhật"
					}, function(err, ticketIds) {
						condition['_id'] = {$in: ticketIds};
						next(null, condition);
					});
				} else {
					mongoClient.collection('orders').distinct('ticketId', {
						createDate: {
							$gte: from.getTime(),
							$lte: to.getTime()
						},
						ticketId: {
							$nin: [null, '']
						}
					}, function(err, ticketIds) {
						condition['_id'] = {$in: ticketIds};
						next(null, condition);
					});
				}
			} else {
				if (req.query.cardType == 0) {
					mongoClient.collection('orders').distinct('ticketId', {

						ticketId: {
							$nin: [null, '']
						},
						cardType: "Thẻ Tiếng Anh"

					}, function(err, ticketIds) {
						condition['_id'] = {$in: ticketIds};
						next(null, condition);
					});
				} else if (req.query.cardType == 1) {
					mongoClient.collection('orders').distinct('ticketId', {

						ticketId: {
							$nin: [null, '']
						},
						cardType: "Thẻ Tiếng Nhật"

					}, function(err, ticketIds) {
						condition['_id'] = {$in: ticketIds};
						next(null, condition);
					});
				} else {
					mongoClient.collection('orders').distinct('ticketId', {

						ticketId: {
							$nin: [null, '']
						},

					}, function(err, ticketIds) {
						condition['_id'] = {$in: ticketIds};
						next(null, condition);
					});
				}
			}
		},
		function(condition, next) {
			var agentIds = _.has(condition, 'updateBy') ? condition.updateBy : null;
			var updated = _.has(condition, 'updated') ? condition.updated : null;
			var condAll = {
				idService: null,
				updateBy: {$ne: null}
				//callIdLength: {$gte: 1}
			};
			var agentCond = {};
			if (agentIds) {
				condAll['updateBy'] = agentIds;
				agentCond['_id'] = agentIds;
			}
			if (updated) {
				condAll['updated'] = updated;
			}
			if (_.has(condition, '_id')) {
				condAll['_id'] = condition._id;
			}
			_async.parallel({
				agents: function(done) {
					_Users.find(agentCond, done);
				},
				allTickets: function(done) {
					_async.waterfall([
						function(next) {
							_Tickets.distinct('_id', condAll, next);
						},
						function(ids, next) {
							_TicketHistory.aggregate([
								{$match: {ticketId: {$in: ids}}},
								{$sort: {'ticketObject.updated': -1}},
								{
									$group: {
										_id: '$ticketId',
										updateBy: {$first: '$ticketObject.updateBy'},
										histories: {$push: '$ticketObject.updated'}
									}
								}
							], next);
						}
					], done);
				},
				rateTickets: function(done) {
					_async.waterfall([
						function(next) {
							_Tickets.distinct('_id', condition, next);
						},
						function(ids, next) {
							_TicketHistory.aggregate([
								{$match: {ticketId: {$in: ids}}},
								{$sort: {'ticketObject.updated': -1}},
								{
									$group: {
										_id: '$ticketId',
										updateBy: {$first: '$ticketObject.updateBy'},
										histories: {$push: '$ticketObject.updated'}
									}
								}
							], next);
						}
					], done);
				}
			}, next);
		}
	], function(err, result) {
		if (err) return callback(err);
		var finalData = result.agents.reduce(function(arr, agent) {
			var allNewTickets = 0, rateNewTickets = 0, allOldTickets = 0, rateOldTickets = 0;
			_.each(result.allTickets, function(ticket) {
				if (ticket.updateBy.toString() == agent._id.toString()) {
					var isNew = true;
					for (var i = 1; i < ticket.histories.length; i++) {
						if (!moment(ticket.histories[0]).isSame(ticket.histories[i], 'day')) {
							isNew = false;
							break;
						}
					}
					isNew ? allNewTickets++ : allOldTickets++;
				}
			});
			_.each(result.rateTickets, function(ticket) {
				if (ticket.updateBy.toString() == agent._id.toString()) {
					var isNew = true;
					for (var i = 1; i < ticket.histories.length; i++) {
						if (!moment(ticket.histories[0]).isSame(ticket.histories[i], 'day')) {
							isNew = false;
							break;
						}
					}
					isNew ? rateNewTickets++ : rateOldTickets++;
				}
			});
			var obj = {
				agent: agent.displayName + '(' + agent.name + ')',
				allNewTickets: allNewTickets,
				allOldTickets: allOldTickets,
				rateNewTickets: rateNewTickets,
				rateOldTickets: rateOldTickets
			};
			arr.push(obj);
			return arr;
		}, []);
		callback(null, finalData);
	});

}

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