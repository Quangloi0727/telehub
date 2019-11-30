/**
 * Created by luongvanlam on 5/5/16.
 * Updated by hoangdv on 28Feb2017 Export customers info
 */
var titlePage = 'Báo cáo gọi ra - Báo cáo theo chiến dịch';
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
			if (_.has(req.query, 'status')) req.query.status = parseInt(req.query.status);
			getTickets(req, res, function(err, tickets) {
				if (err && _.isString(err)) {
					var conditions = arguments[1];
					var totalResult = arguments[2];
					exportExcel(req, res, conditions, totalResult);
					return;
				}

				if (err) return res.json({code: 500, message: err.message});
				res.json({
					code: 200,
					message: tickets
				})
			});
		}
	},
	html: function(req, res) {
		if (req.session.auth.company && !req.session.auth.company.leader) {
			return _.render(req, res, 'report-outbound-tickets', {
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
			user: function(callback) {
				_async.waterfall([
					function(callback) {
						_Company.distinct("_id", req.session.auth.company ? {_id: req.session.auth.company} : {}, function(err, com) {
							_AgentGroups.distinct("_id", {idParent: {$in: com}}, function(err, result) {
								if (err) return callback(err, null);
								_Users.find({$or: [{'agentGroupLeaders.group': {$in: result}}, {'agentGroupMembers.group': {$in: result}}, {'companyLeaders.company': {$in: com}}]}, callback);
							});
						})
					}
				], callback);
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
			}
		}, function(err, result) {
			var temp = result.ticketReasonCategory;
			delete result.ticketReasonCategory;

			result['ticketReasonCategory'] = temp.trc;
			result['ticketReason'] = temp.tr;
			result['ticketSubreason'] = temp.tsr;

			return _.render(req, res, 'report-outbound-tickets', {
				title: titlePage,
				plugins: ['moment', ['bootstrap-select'], ['bootstrap-daterangepicker'], ['chosen']],
				recordPath: _config.recordPath ? _config.recordPath.path : '',
				data: result
			}, true, err);
		});
	}
};

function permissionConditions(req, callback) {
	var cond = [{$match: {idService: null}}];
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

function getTickets(req, res, callback) {
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
	]);

	_async.waterfall([
		function(callback) {
			permissionConditions(req, callback);
		},
		function(cond, callback) {
			_async.parallel({
				customerSource: function(callback) {
					if (!_.has(_query, 'customersources')) return callback(null, null);
					_CustomerSource.findById(_query.customersources,
						{_id: 1},
						function(err, result) {
							if (err) return callback(err, null);

							delete _query.customersources;
							if (result == null || result.length == 0) return callback(searchNotFoundError, null);
							callback(err, result._id);
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
				}
			}, function(err, result) {
				if (err) return callback(err, cond, result);

				var query = {};
				if (!_.isNull(result.phoneNumber)) query['_id'] = {$in: result.phoneNumber};
				if (!_.isNull(result.customerSource)) query['sources'] = {$in: [result.customerSource]};
				if (_.isEmpty(query)) return callback(null, cond, null);
				_Customer.find(query, {_id: 1}, function(err, result) {
					callback(err, cond, _.pluck(result, '_id'));
				});
			});
		},
		function(cond, customerId, callback) {
			var obj = _.chain(_query)
				.keys()
				.reduce(function(memo, item) {
					memo[item] = req.query[item];
					return memo;
				}, {})
				.value();

			if (_.has(req.query, 'idCampain') && !_.isEmpty(req.query['idCampain']))
				obj['idCampain'] = {$in: _.arrayObjectId(req.query['idCampain'])};
			if (_.has(obj, 'callIdLength'))
				obj['callIdLength'] = Number(obj['callIdLength']);
			if (!_.isEmpty(obj))
				cond.push({$match: obj});
			//if (req.query.startDate||req.query.endDate){
			//    var updated = {};
			//    if(req.query.startDate){
			//        updated.$gte = _moment(req.query.startDate,"DD/MM/YYYY")._d
			//    }
			//    if(req.query.endDate){
			//        updated.$lte = _moment(req.query.endDate,"DD/MM/YYYY").endOf('day')._d
			//    }
			//    cond.push({$match: {updated:updated}});
			//}
			if (!_.isEmpty(customerId)) cond.push({$match: {idCustomer: {$in: customerId}}});

			if (!!req.query.updated) {
				var _d1 = _moment(req.query.updated.split(' - ')[0], 'DD/MM/YYYY');
				var _d2 = req.query.updated.split(' - ')[1] ? _moment(req.query.updated.split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

				var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
				var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
				startDay = startDay.startOf('day');
				endDay = endDay.endOf('day');
				cond.push({$match: {updated: {$gte: startDay._d, $lt: endDay._d}}});
			}

			if (_.has(req.query, 'note')) {
				cond.push({$match: {note: {$regex: new RegExp(_.stringRegex(req.query.note), 'i')}}});
			}

			callback(null, parseJSONToObject(cond));
		},
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
				next(err, tickets);
			});
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
				as: 'idAgent'
			}
		},
		{$unwind: {path: '$idAgent', preserveNullAndEmptyArrays: true}},
		{
			$lookup: {
				from: 'field_so_dien_thoai',
				localField: 'idCustomer',
				foreignField: 'entityId',
				as: 'field_so_dien_thoai'
			}
		},
		{$unwind: '$field_so_dien_thoai'},
		/* I want to get full customer info. I do change 'customer' to 'customerindex' */
		{
			$lookup: {
				from: 'customerindex',
				localField: 'idCustomer',
				foreignField: '_id',
				as: 'customer'
			}
		},
		{$unwind: {path: '$customer', preserveNullAndEmptyArrays: true}},
		//{$unwind: {path: '$customer.sources', preserveNullAndEmptyArrays: true}},
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
				prelink: '/report-outbound-tickets',
				current: page,
				rowsPerPage: rows,
				totalResult: total
			});

			obj = {code: 200, message: paginator.getPaginationData(), formId: req.query.formId, dt: req.query.dt}
		}

		sio.sockets.socket(req.query.socketId).emit('responseReportOutboundTicketPagingData', obj);
	});
}

function exportExcel(req, res, conditions, totalResult) {
	var maxRecordPerFile = 65000; // hoangdv change to max Excel setting
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
	} else {
		var temp = function(callback) {
			conditions.push.apply(conditions, collectTicketInfo());

			_Tickets.aggregate(conditions, function(err, result) {
				if (err) return callback(err, null);

				createExcelFile(req
					, folderName
					, fileName
					, result
					, callback);
			});
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
			_async.parallel({
				_config: function(done) {
					fsx.readJson(path.join(_rootPath, 'assets', 'const.json'), done);
				},
				_customerFields: function(done) {
					_async.waterfall([
						function(next) {
							var cond = {};
							if (req.session.auth && req.session.auth.company && req.session.auth.company._id) {
								cond = {
									'_id': req.session.auth.company._id
								};
							}
							_Company.distinct('companyProfile', cond, next);
						},
						function(cIds, next) {
							_CompanyProfile.find({
								_id: {
									$in: cIds
								}
							}, function(err, profiles) {
								var fieldsId = [];
								_.each(profiles, function(el) {
									fieldsId = _.union(fieldsId, el.fieldId);
								});
								next(err, fieldsId);
							});
						},
						function(fIds, next) {
							var cond = {status: 1};
							if (fIds && fIds.length > 0) {
								cond._id = {
									$in: fIds
								}
							}
							_CustomerFields.find(cond, {
								_id: 0,
								displayName: 1,
								modalName: 1,
								weight: 1
							}, next);
						}
					], done);

				}
			}, callback);
		},
		/**
		 *
		 * @param bundle  = {_config : {KEY: {key: val}}, _customerFields = [{displayName, modalName}]}
		 * @param callback
		 */
			function createExcelFile(bundle, callback) {
			// Xuất báo cáo có kèm thông tin khách hàng
			var customerColumnHeader = [];
			if (data.length > 0) {
				// Lấy các trường thông tin của khách hàng
				_.each(bundle._customerFields, function(field) {
					customerColumnHeader.push({
						header: field.displayName ? field.displayName.toUpperCase() : '',
						key: field.modalName,
						width: field.weight ? field.weight : 10
					});
				});
			}
			var excelHeader = [
				'TXT_CAMPAIGN_NAME'
				, 'TXT_CUSTOMER_SOURCE'
				, 'TXT_TICKET_REASON_CATEGORY'
				, 'TXT_TICKET_REASON'
				, 'TXT_TICKET_SUBREASON'
				, 'TXT_STATUS'
				, 'TXT_PHONE_NUMBER'
				, 'TXT_CALLS'
				, 'TXT_NOTE'
				, 'TXT_UPDATED'
				, 'TXT_UPDATED_BY'
			];

			var workbook = new _Excel.Workbook();
			workbook.creator = req.session.user.displayName;
			workbook.created = new Date();
			var sheet = workbook.addWorksheet(titlePage);
			var column = [];

			_.each(excelHeader, function(header) {
				column.push({
					header: bundle._config.MESSAGE.REPORT_OUTBOUND_TICKETS[header],
					key: header,
					width: bundle._config.MESSAGE.REPORT_OUTBOUND_TICKETS[header].length
				});
			});
			if (customerColumnHeader.length) {
				column.push.apply(column, customerColumnHeader);
			}
			sheet.columns = column;

			if (data !== null) {
				_async.eachSeries(data, function(item, callback) {
					var reportBaseRow = [
						item.campain
						, item.sources.join(' ,')
						, item.ticketReasonCategory ? item.ticketReasonCategory : ''
						, item.ticketReason ? item.ticketReason : ''
						, item.ticketSubreason ? item.ticketSubreason : ''
						, changeStatus(item.status)
						, item.field_so_dien_thoai
						, item.callIdLength
						, item.note
						, item.updated
						, item.ubdisplayName ? item.ubdisplayName + " (" + item.ubName + ")" : ''
					];
					_.each(customerColumnHeader, function(header) {
						reportBaseRow.push(item.customer ? item.customer[header.key] : '');
					});
					sheet.addRow(reportBaseRow);

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
};

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