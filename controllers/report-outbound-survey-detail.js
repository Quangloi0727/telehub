/**
 * Created by baygiomoidc on 8/24/16.
 */
var titlePage = 'Báo cáo chi tiết khảo sát gọi ra';
var searchNotFoundError = new Error('Không tìm thấy kết quả với khoá tìm kiếm');
var accessDenyError = new Error('Không đủ quyền truy cập');
var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));
var zipFolder = require('zip-folder');
var cond = [];
var _profiles = [];

exports.index = {
	json: function(req, res) {
		if (_.has(req.query, 'status')) req.query.status = parseInt(req.query.status);
		getTickets(req, res, function(err, result) {

			if (err && _.isString(err)) {
				var conditions = arguments[1];
				var totalResult = arguments[2];
				var surveyQuestions = arguments[3];
				exportExcel(req, res, conditions, totalResult, surveyQuestions);
				return;
			}

			if (err) return res.json({
				code: 500,
				message: err.message
			});
			res.json({
				code: 200,
				message: result
			})
		});
	},
	html: function(req, res) {
		if (!(req.session.auth && req.session.auth)) return res.render('404', {
			title: '404 | Page not found'
		});
		var _company = null;
		var _agentQuery = null;
		var _group = null;

		if (req.session.auth.company && !req.session.auth.company.leader) {
			if (req.session.auth.company.group.leader) {
				// Team lead
				_group = req.session.auth.company.group._id;
			} else {
				// Agent
				_agentQuery = {
					idAgent: new mongodb.ObjectId(req.session.user._id.toString())
				};
			}
		} else if (req.session.auth.company && req.session.auth.company.leader) {
			// Company Leader
			_company = req.session.auth.company._id;
		} else if (!req.session.auth.company) {
			// Leader
		}

		_async.waterfall([
			function(next) {
				if (_group) {
					_Users.distinct('_id', {
						$or: [{
							agentGroupLeaders: {
								$elemMatch: {
									group: _group
								}
							}
						}, {
							agentGroupMembers: {
								$elemMatch: {
									group: _group
								}
							}
						}]
					}, function(err, result) {
						_agentQuery = {
							idAgent: {
								$in: result
							}
						};
						next(err);
					});
				} else {
					next(null);
				}
			},
			function(next) {
				if (_agentQuery) {
					_CampaignAgent.find(_agentQuery).distinct('idCampaign', next);
				} else {
					next(null, null);
				}
			},
			function(result, next) {
				var aggs = [];
				if (_company) aggs.push({
					$match: {
						_id: new mongodb.ObjectId(_company.toString())
					}
				});
				aggs.push({
					$lookup: {
						from: 'campains',
						localField: '_id',
						foreignField: 'idCompany',
						as: 'campains'
					}
				});
				aggs.push({
					$unwind: "$campains"
				});
				if (result) aggs.push({
					$match: {
						'campains._id': {
							$in: result
						}
					}
				});
				aggs.push({
					$group: {
						_id: {
							_id: '$_id',
							name: '$name'
						},
						campains: {
							$push: '$campains'
						}
					}
				});

				aggs.push({
					$project: {
						_id: '$_id._id',
						name: '$_id.name',
						campains: '$campains'
					}
				});

				_Company.aggregate(aggs, next);
			},
			function(companies, next) {
				var campainsIds = [];
				_.each(companies, function(com) {
					campainsIds = _.union(campainsIds, _.pluck(com.campains, '_id'));
				});
				_async.parallel({
					companies: function(next) {
						next(null, companies);
					},
					agents: function(next) {
						var aggs = [];
						aggs.push({
							$match: {
								idCampaign: {
									$in: campainsIds
								}
							}
						});
						if (_agentQuery) aggs.push({
							$match: _agentQuery
						});
						aggs.push({
							$lookup: {
								from: 'users',
								localField: 'idAgent',
								foreignField: '_id',
								as: 'agent'
							}
						});
						aggs.push({
							$unwind: "$agent"
						});
						aggs.push({
							$group: {
								_id: {
									_id: '$agent._id',
									name: '$agent.name',
									displayName: '$agent.displayName'
								}
							}
						});
						aggs.push({
							$project: {
								_id: '$_id._id',
								name: '$_id.name',
								displayName: '$_id.displayName'
							}
						});
						_CampaignAgent.aggregate(aggs, next);
					},
					users: function(next) {
						_Users.find({}, next);
					}
				}, function(err, result) {
					next(err, result);
				});
			}
		], function(err, result) {
			return _.render(req, res, 'report-outbound-survey-detail', _.extend({
				title: titlePage,
				plugins: ['moment', ['bootstrap-select'],
					['bootstrap-daterangepicker'],
					['chosen']
				]
			}, result), true, err);
		});
	}
};

function permissionConditions(req, callback) {
	if (!(req.session.auth && req.session.auth)) {
		var err = new Error('session auth null');
		return callback(err);
	}
	var cond = [{
		$match: {
			idService: null
		}
	}];
	var _company = null;
	var _group = null;
	if (req.session.auth.company && !req.session.auth.company.leader) {
		// Team lead - Agent
		_company = req.session.auth.company._id;
		if (req.session.auth.company.group.leader) {
			// Team lead
			_group = req.session.auth.company.group._id;
		} else {
			// Agent
			cond.push({
				$match: {
					idAgent: new mongodb.ObjectId(req.session.user._id.toString())
				}
			});
		}
	} else if (req.session.auth.company && req.session.auth.company.leader) {
		// Company Leader
		_company = req.session.auth.company._id;
	} else if (!req.session.auth.company) {
		// Leader
	}

	_async.waterfall([
		function(next) {
			if (_group) {
				_Users.distinct('_id', {
					$or: [{
						agentGroupLeaders: {
							$elemMatch: {
								group: _group
							}
						}
					}, {
						agentGroupMembers: {
							$elemMatch: {
								group: _group
							}
						}
					}]
				}, function(err, result) {
					cond.push({
						$match: {
							idAgent: {
								$in: result
							}
						}
					});
					next(err);
				});
			} else {
				next(null);
			}
		},
		function(next) {
			var aggs = [];
			if (_company) aggs.push({
				$match: {
					_id: new mongodb.ObjectId(_company.toString())
				}
			});
			aggs.push({
				$lookup: {
					from: 'campains',
					localField: '_id',
					foreignField: 'idCompany',
					as: 'campains'
				}
			});
			aggs.push({
				$unwind: "$campains"
			});
			aggs.push({
				$group: {
					_id: '$campains._id'
				}
			});

			_Company.aggregate(aggs, next);
		}
	], function(err, result) {
		cond.push({
			$match: {
				idCampain: {
					$in: _.pluck(result, '_id')
				}
			}
		});
		callback(err, cond);
	});
}

function getTickets(req, res, callback) {
	var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
	var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

	var sort = _.cleanSort(req.query, '');

	var _query = _.cleanRequest(req.query, ['_', 'updated', 'note', 'formId', 'dt', 'ignoreSearch', 'socketId', 'download', 'totalResult', 'field_so_dien_thoai']);

	var _ticketIds = [];
	var _surveyQuestion = [];

	_async.waterfall([
		function(callback) {
			if (req.session.auth.company) {
				var companyId = _.convertObjectId(req.session.auth.company._id);
				_Company.find({
					_id: _.convertObjectId(companyId)
				}).exec(function(err, company) {
					_CompanyProfile.find({
						_id: _.convertObjectId(company[0].companyProfile)
					}).distinct('fieldId').exec(function(err, fields) {
						_CustomerFields.find({
							_id: {
								$in: fields
							}
						}).distinct('modalName').exec(function(err, profileFields) {
							_profiles = profileFields;
							callback();
						})
					})
				})
			} else {
				_CustomerFields.find({}, function(err, profileFields) {
					_profiles = profileFields;
				})
			}
		},
		function(callback) {
			permissionConditions(req, callback);
		},
		function(cond, next) {
			var obj = _.chain(_query)
				.keys()
				.reduce(function(memo, item) {
					memo[item] = req.query[item];
					return memo;
				}, {})
				.value();
			if (_.has(req.query, 'note')) obj['note'] = {
				$regex: new RegExp(_.stringRegex(req.query.note), 'i')
			};

			if (req.query.updated) {
				var _d1 = _moment(req.query.updated.split(' - ')[0], 'DD/MM/YYYY');
				var _d2 = req.query.updated.split(' - ')[1] ? _moment(req.query.updated.split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

				var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
				var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
				startDay = startDay.startOf('day');
				endDay = endDay.endOf('day');

				obj['updated'] = {
					$gte: startDay._d,
					$lt: endDay._d
				};
			}

			if (!_.isEmpty(obj)) cond.push({
				$match: obj
			});
			cond.push({
				$project: {
					_id: 1,
					idCustomer: 1
				}
			});
			_Tickets.aggregate(parseJSONToObject(cond), function(err, result) {
				next(err, result);
			});
		},
		function(ticketIds, next) {
			_ticketIds = ticketIds;
			_SurveyResult.find({
				idTicket: {
					$in: ticketIds
				}
			}).distinct('idQuestion', next);
		},
		function(questIds, next) {
			var aggs = [];
			aggs.push({
				$match: {
					_id: {
						$in: questIds
					}
				}
			});
			aggs.push({
				$lookup: {
					from: 'surveyanswers',
					localField: '_id',
					foreignField: 'idQuestion',
					as: 'answers'
				}
			});
			_SurveyQuestion.aggregate(aggs, next);
		},
		function(surveyQs, next) {
			_surveyQuestion = _.chain(surveyQs).reduce(function(memo, item) {
				memo[item._id.toString()] = item;
				return memo;
			}, {}).value();

			if (!_.has(req.query, 'field_so_dien_thoai')) return next(null, null);
			mongoClient.collection('customerindex')
				.find({
					_id: {
						$in: _.pluck(_ticketIds, 'idCustomer')
					},
					field_so_dien_thoai: {
						$regex: new RegExp(_.stringRegex(req.query.field_so_dien_thoai), 'i')
					}
				})
				.toArray(function(err, result) {
					next(err, _.pluck(result, '_id'));
				});
		},
		function(customerIds, next) {
			var aggs = [];
			if (customerIds) aggs.push({
				$match: {
					idCustomer: {
						$in: customerIds
					}
				}
			});
			aggs.push({
				$match: {
					_id: {
						$in: _.pluck(_ticketIds, '_id')
					}
				}
			});

			if (_.has(req.query, 'download') && !_.isEqual(req.query.download, '0')) {
				return callback('download', aggs, parseInt(req.query.totalResult), _surveyQuestion);
			}

			if (!_.isEmpty(sort)) aggs.push({
				$sort: sort
			});
			aggs.push({
				$project: {
					_id: 1
				}
			});

			_Tickets.aggregatePaginate(_Tickets.aggregate(aggs), {
				page: page,
				limit: rows
			}, next);
		},
		function(ticketIds, pageCount, count, next) {
			var paginator = new pagination.SearchPaginator({
				prelink: '/report-outbound-survey-detail',
				current: page,
				rowsPerPage: rows,
				totalResult: count
			});
			var aggs = [];
			aggs.push({
				$match: {
					_id: {
						$in: _.pluck(ticketIds, '_id')
					}
				}
			});
			aggs.push.apply(aggs, collectTicketInfo());
			if (!_.isEmpty(sort)) aggs.push({
				$sort: sort
			});
			_Tickets.aggregate(aggs, function(err, result) {
				next(err, {
					data: result,
					paging: paginator.getPaginationData(),
					questions: _surveyQuestion
				});
			});
		}
	], callback);
}

function collectTicketInfo() {
	return [{
		$lookup: {
			from: 'campains',
			localField: 'idCampain',
			foreignField: '_id',
			as: 'campain'
		}
	}, {
		$unwind: '$campain'
	}, {
		$lookup: {
			from: 'companies',
			localField: 'campain.idCompany',
			foreignField: '_id',
			as: 'company'
		}
	}, {
		$unwind: '$company'
	}, {
		$lookup: {
			from: 'users',
			localField: 'updateBy',
			foreignField: '_id',
			as: 'updateBy'
		}
	}, {
		$unwind: {
			path: '$updateBy',
			preserveNullAndEmptyArrays: true
		}
	}, {
		$lookup: {
			from: 'users',
			localField: 'idAgent',
			foreignField: '_id',
			as: 'idAgent'
		}
	}, {
		$unwind: {
			path: '$idAgent',
			preserveNullAndEmptyArrays: true
		}
	}, {
		$lookup: {
			from: 'customerindex',
			localField: 'idCustomer',
			foreignField: '_id',
			as: 'customer'
		}
	}, {
		$unwind: '$customer'
	}, {
		$lookup: {
			from: 'ticketreasoncategories',
			localField: 'ticketReasonCategory',
			foreignField: '_id',
			as: 'ticketReasonCategory'
		}
	}, {
		$unwind: {
			path: '$ticketReasonCategory',
			preserveNullAndEmptyArrays: true
		}
	}, {
		$lookup: {
			from: 'ticketreasons',
			localField: 'ticketReason',
			foreignField: '_id',
			as: 'ticketReason'
		}
	}, {
		$unwind: {
			path: '$ticketReason',
			preserveNullAndEmptyArrays: true
		}
	}, {
		$lookup: {
			from: 'ticketsubreasons',
			localField: 'ticketSubreason',
			foreignField: '_id',
			as: 'ticketSubreason'
		}
	}, {
		$unwind: {
			path: '$ticketSubreason',
			preserveNullAndEmptyArrays: true
		}
	}, {
		$lookup: {
			from: 'surveyresults',
			localField: '_id',
			foreignField: 'idTicket',
			as: 'surveyresult'
		}
	}, {
		$group: {
			_id: '$_id',
			company: {
				$first: '$company.name'
			},
			campain: {
				$first: '$campain.name'
			},
			agent: {
				$first: '$idAgent.displayName'
			},
			field_so_dien_thoai: {
				$first: '$customer.field_so_dien_thoai'
			},
			status: {
				$first: '$status'
			},
			ticketReasonCategory: {
				$first: '$ticketReasonCategory.name'
			},
			ticketReason: {
				$first: '$ticketReason.name'
			},
			ticketSubreason: {
				$first: '$ticketSubreason.name'
			},
			note: {
				$first: '$note'
			},
			updated: {
				$first: '$updated'
			},
			ubName: {
				$first: '$updateBy.name'
			},
			ubdisplayName: {
				$first: '$updateBy.displayName'
			},
			surveyresult: {
				$first: '$surveyresult'
			}
		}
	}];
}

function createPaging(req, aggregate, page, rows) {
	aggregate.push({
		$group: {
			_id: '$status',
			count: {
				$sum: 1
			}
		}
	});

	_Tickets.aggregate(aggregate, function(err, result) {
		var obj = {};
		if (err) {
			obj = {
				code: 500,
				message: err.message,
				formId: req.query.formId,
				dt: req.query.dt
			};
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

			obj = {
				code: 200,
				message: paginator.getPaginationData(),
				formId: req.query.formId,
				dt: req.query.dt
			}
		}

		sio.sockets.socket(req.query.socketId).emit('responseReportOutboundTicketPagingData', obj);
	});
}

function exportExcel(req, res, conditions, totalResult, surveyQuestions) {
	var maxRecordPerFile = 2000;
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
						agg.push({
							$limit: maxRecordPerFile
						});
					} else {
						agg.push({
							$match: {
								_id: {
									$gt: objectId
								}
							}
						}, {
							$limit: maxRecordPerFile
						});
					}

					agg.push.apply(agg, collectTicketInfo());

					_Tickets.aggregate(agg, function(err, result) {
						if (err) return callback(err, null);
						createExcelFile(req, folderName, fileName + '-' + index + '-' + i, result, surveyQuestions, callback);
					});
				};

				tempParallelTask.push(temp);
			}
			return tempParallelTask;
		}
	} else {
		var temp = function(callback) {
			// DUONGNB: Add customer info to collecticketInfo
			var newTicketInfo = collectTicketInfo();
			_.each(_profiles, function(profile) {
				newTicketInfo[17]['$group'][profile] = {
					$first: '$customer.' + profile
				}
			});
			conditions.push.apply(conditions, newTicketInfo);

			_Tickets.aggregate(conditions, function(err, result) {
				if (err) return callback(err, null);
				createExcelFile(req, folderName, fileName, result, surveyQuestions, callback);
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
		res.json({
			code: err ? 500 : 200,
			message: err ? err.message : folderZip
		});
	});
}

function createExcelFile(req, folderName, fileName, data, surveyQuestion, callback) {
	var options = {
		filename: path.join(_rootPath, 'assets', 'export', 'ticket', folderName, fileName + '.xlsx'),
		useStyles: true,
		useSharedStrings: true,
		dateFormat: 'DD/MM/YYYY HH:mm:ss'
	};

	_async.waterfall([
		function(next) {
			fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'ticket', folderName), next);
		},
		function(t, next) {
			fsx.readJson(path.join(_rootPath, 'assets', 'const.json'), next);
		},
		function(_config, next) {
			var excelHeader = ['TXT_COMPANY', 'TXT_CAMPAIGN_NAME', 'TXT_AGENT', 'TXT_PHONE_NUMBER', 'TXT_STATUS', 'TXT_TICKET_REASON_CATEGORY', 'TXT_TICKET_REASON', 'TXT_TICKET_SUBREASON', 'TXT_UPDATED', 'TXT_NOTE', 'TXT_UPDATED_BY'];

			var workbook = new _Excel.Workbook();
			workbook.creator = req.session.user.displayName;
			workbook.created = new Date();
			var sheet = workbook.addWorksheet(titlePage);
			var column = [];

			_.each(excelHeader, function(header) {
				column.push({
					header: _config.MESSAGE.REPORT_OUTBOUND_SURVEY_DETAIL[header],
					key: header,
					width: _config.MESSAGE.REPORT_OUTBOUND_SURVEY_DETAIL[header].length
				});
			});

			_.each(_profiles, function(header) {
				column.push({
					header: header,
					key: header,
					width: header.length
				});
			});

			/**
			 * 02.Mar.2017 hoangdv
			 * Magic. Do not touch.
			 */
			function sortQuestion(objSurveyQuestion, sortObj) {
				var survey = _.chain(objSurveyQuestion)
					.reduce(function(arr, obj) {
						arr.push(obj);
						return arr
					}, [])
					.sortBy('isStart')
					.reverse()
					.value();
				if (survey.length == 1) {
					sortObj.push(survey[0]);
					survey.splice(0, 1);
				} else if (sortObj.length == 0 && survey.length > 0) {
					sortObj.push(survey[0]);
					survey.splice(0, 1);
					sortQuestion(survey, sortObj);
				} else if (survey.length > 1) {
					var lastObj = sortObj[sortObj.length - 1];
					var bool = 0;
					if (lastObj.idNextQuestion) {
						for (var i = 0; i < survey.length; i++) {
							var el = survey[i];
							if (_.isEqual(el._id.toString(), lastObj.idNextQuestion.toString())) {
								bool = 1;
								sortObj.push(el);
								survey.splice(i, 1);
							}
						}
					}
					if (!bool) {
						sortObj.push(survey[0]);
						survey.splice(0, 1);
					}
					sortQuestion(survey, sortObj);
				}
			}

			var sortObj = [];
			sortQuestion(surveyQuestion, sortObj);
			_.each(sortObj, function(survey) {
				column.push({
					header: survey.content,
					key: survey._id.toString(),
					width: survey.content.length
				});
				column.push({
					header: "Ghi chú",
					key: survey._id.toString() + 'note',
					width: 7
				});
			});

			sheet.columns = column;

			if (data !== null) {
				_async.eachSeries(data, function(item, cb) {
					var row = [item.company ? item.company : '', item.campain ? item.campain : '', item.agent ? item.agent : '', item.field_so_dien_thoai ? item.field_so_dien_thoai : '', changeStatus(item.status), item.ticketReasonCategory ? item.ticketReasonCategory : '', item.ticketReason ? item.ticketReason : '', item.ticketSubreason ? item.ticketSubreason : '', item.updated ? item.updated : '', item.note ? item.note : '', item.ubdisplayName ? item.ubdisplayName + " (" + item.ubName + ")" : ''];

					// DUONGNB: Add customer infor to excelfile
					_.each(_profiles, function(profileField) {
						if (item[profileField]) {
							row.push(item[profileField].toString());
						} else {
							row.push('');
						}
					});

					_.each(sortObj, function(svO) {
						var answer = '';
						var note = '';
						_.each(item.surveyresult, function(el) {
							if (_.isEqual(svO._id.toString(), el.idQuestion.toString()) && el.answerContent) {
								if (_.isString(el.answerContent)) {
									answer = el.answerContent;
								} else {
									_.each(svO.answers, function(el2) {
										if (_.isEqual(el.answerContent.toString(), el2._id.toString())) {
											answer = el2.content;
										}
									});
								}
								note = el.answerNote ? el.answerNote : '';
							}
						});
						row.push(answer);
						row.push(note);
					});
					sheet.addRow(row);

					cb(null, null);
				}, function(err, result) {
					workbook.xlsx.writeFile(options.filename)
						.then(next);
				});
			} else {
				workbook.xlsx.writeFile(options.filename)
					.then(next);
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