/**
 * Created by hoangdv on 8/24/16.
 */
/**
 * hoangdv 28.Feb.2017
 * el là dữ liệu của một agent, trong đó có chứa mảng các status.
 * Tư tưởng tính toán: Bỏ các kết quả tính duration ở trong các câu query.
 * Các khoảng trạng thái: điểm đầu là thời gian bắt đầu trạng thái,
 * điểm cuối là thời gian bắt đầu của trạng thái khác.
 * Điểm dừng của một chuỗi trạng thái:
 *  + Với dữ liệu cũ (chưa có đánh dấu login, logout. ../modals/agent-status-log.js)"Trạng thái cuối cùng của ngày"
 *  + Với dữ liệu mới: dùng trạng thái có dấu logout làm điểm cuối.
 * Các vòng lặp lồng nhau trong file này có tư tưởng tương tự
 */

exports.index = {
	json: function(req, res) {

	},
	html: function(req, res) {
		var statusArr = [];
		_async.parallel({
			agents: function(next) {
				_async.waterfall([
					function(next) {
						permissionConditions(req, next);
					},
					function(userIds, next) {
						_Users.find({_id: {$in: userIds}}, next);
					}
				], next);
			},
			data: function(next) {
				_async.waterfall([
					function(next) {
						_AgentStatus.find({}, function(err, result) {
							statusArr = result;
							next(err);
						});
					},
					function(next) {
						permissionConditions(req, next);
					},
					function(userIds, next) {
						if (!req.query.isFilter) {
							return next(null);
						}
						_async.parallel({
							timeline: function(done) {
								getTimelines(userIds, statusArr, req, done);
							},
							timelineGroupByDay: function(done) {
								getTimelineGroupByDay(userIds, statusArr, req, done)
							},
							overall: function(done) {
								getOverallReport(userIds, statusArr, req, done);
							},
							overallGroupByDay: function(done) {
								getOverallReportGroupByDay(userIds, statusArr, req, done)
							}
						}, next);
					}
				], next);
			}
		}, function(err, result) {
			return _.render(req, res, 'report-login-logout', _.extend({
				datas: _.has(result.data, 'overall') ? result.data.overall.data : [],
				datasGroupByDay: _.has(result.data, 'overallGroupByDay') ? result.data.overallGroupByDay.data : [],
				agents: result.agents,
				status: statusArr,
				paging: _.has(result.data, 'overall') ? result.data.overall.paging : {},
				msToTime: msToTime,
				timeline: _.has(result.data, 'timeline') ? result.data.timeline : [],
				timelineByDay: _.has(result.data, 'timelineGroupByDay') ? result.data.timelineGroupByDay : [],
				title: 'Báo cáo Login - Logout',
				plugins: ['moment', ['bootstrap-select'], 'export-excel', 'google-chart']
			}, {}), true, err);
		});
	}
};

/**
 * Lấy thông tin báo cáo tổng thế
 * @param userIds
 * @param statusArr
 * @param req
 * @param callback
 * @returns {*}
 */
function getOverallReport(userIds, statusArr, req, callback) {
	var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
	var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

	var sort = _.cleanSort(req.query, '');
	var obj = {};
	var aggs = [];
	aggs.push({$match: {agentId: {$in: userIds}}});
	if (_.has(req.query, 'startTime')) {
		var fieldName = 'startTime';
		var _d1 = _moment(req.query[fieldName].split(' - ')[0], 'DD/MM/YYYY');
		var _d2 = req.query[fieldName].split(' - ')[1] ? _moment(req.query[fieldName].split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

		var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
		var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
		startDay = startDay.startOf('day');
		endDay = endDay.endOf('day');

		obj['startTime'] = {$gte: startDay._d, $lt: endDay._d};
	}

	if (_.has(req.query, 'agentId') && req.query.agentId.length > 0) {
		obj['agentId'] = {$in: _.arrayObjectId(req.query.agentId)};
	}
	obj['endTime'] = {$ne: null};

	aggs.push({$match: obj});

	aggs.push({
		$project: {
			_id: 1,
			startTime: 1,
			endTime: 1,
			agentId: 1,
			status: 1,
			startReason: 1,
			endReason: 1,
			duration: {$subtract: ["$endTime", "$startTime"]},
			day: {$dayOfYear: "$startTime"},
			year: {$year: "$startTime"}
		}
	});

	aggs.push({
		$group: {
			_id: {agentId: "$agentId", day: "$day", year: "$year"},
			duration: {$sum: "$duration"},
			startTime: {$min: "$startTime"},
			endTime: {$max: "$endTime"},
			status: {
				$push: {
					status: "$status",
					startTime: "$startTime",
					endTime: "$endTime",
					duration: "$duration",
					startReason: "$startReason",
					endReason: "$endReason"
				}
			}
		}
	});

	aggs.push({
		$group: {
			_id: "$_id.agentId",
			totalDuration: {$sum: "$duration"},
			avgDuration: {$avg: "$duration"},
			startTime: {$min: "$startTime"},
			endTime: {$max: "$endTime"},
			status: {$push: "$status"}
		}
	});

	aggs.push({$lookup: {from: 'users', localField: '_id', foreignField: '_id', as: 'user'}});
	aggs.push({$unwind: {path: '$user', preserveNullAndEmptyArrays: true}});
	aggs.push({
		$project: {
			name: {$concat: ['$user.displayName', ' (', '$user.name', ')']},
			agentId: '$user._id',
			status: 1,
			startTime: {$dateToString: {format: "%H:%M %d/%m/%Y", date: {$add: ["$startTime", 7 * 60 * 60 * 1000]}}},
			endTime: {$dateToString: {format: "%H:%M %d/%m/%Y", date: {$add: ["$endTime", 7 * 60 * 60 * 1000]}}},
			avgDuration: 1,
			totalDuration: 1
		}
	});

	_AgentStatusLog.aggregatePaginate(_AgentStatusLog.aggregate(aggs), {
		page: page,
		limit: rows
	}, function(err, result, pageCount, count) {
		var codeArr = _.pluck(statusArr, 'statusCode');
		codeArr.push(4);
		_.each(result, function(el) {
			var status = {};
			el.status = _.sortBy(_.flatten(el.status), 'startTime');
			el.changeTime = 0;
			el.totalDuration = 0;

			// hoangdv calculat status duration
			var sttLen = el.status.length;
			if (sttLen == 1) {
				status[el.status[0].status] = el.status[0].duration;
			}
			for (var i = 0; i < sttLen; i++) {
				var statusI = el.status[i];
				var stt = {
					status: statusI.status,
					start: statusI.startTime.getTime(),
					end: statusI.endTime.getTime()
				};
				for (var j = i + 1; j < sttLen; j++) {
					var statusJ = el.status[j];
					var isSameDay = _moment(statusI.startTime).format('DD/MM/YYYY') == _moment(statusJ.startTime).format('DD/MM/YYYY');
					// Không cùng ngày
					var isEndSession = false;
					// Dữ liệu mới
					if (statusI.endReason && statusI.endReason == 'logout') {
						isEndSession = true;
					}
					// Dữ liệu cũ - Hết ngày được xem là hết phiên làm việc
					if (!isEndSession && !isSameDay) {
						isEndSession = true;
					}
					if (isEndSession) {
						break;
					}
					stt.end = statusJ.startTime.getTime();
					if (statusI.status == statusJ.status) {
						stt.end = statusJ.endTime.getTime();
						i = j;
					} else {
						el.changeTime++;
						break;
					}
				}
				if (!_.has(status, stt.status)) {
					status[stt.status] = stt.end - stt.start;
				} else {
					status[stt.status] += stt.end - stt.start;
				}
				el.totalDuration += stt.end - stt.start;
			}
			var days = _moment(el.endTime, 'HH:mm DD/MM/YYYY').diff(_moment(el.startTime, 'HH:mm DD/MM/YYYY'), 'days') + 1;
			el.avgDuration = Math.floor(el.totalDuration / days);
			status['Missing'] = 0;
			_.each(_.keys(status), function(key) {
				if (!_.isEqual(key, 'Missing') && codeArr.indexOf(Number(key)) < 0) {
					status['Missing'] += status[key];
				}
			});
			// end hoangdv
			el.status = status;
		});
		var paginator = new pagination.SearchPaginator({
			prelink: '/report-login-logout',
			current: page,
			rowsPerPage: rows,
			totalResult: count
		});

		callback(err, {data: result, paging: paginator.getPaginationData()});
	});
}

/**
 * Lấy thông tin vẽ biểu đồ timeline
 * You are not expected to understand this :)
 * @param userIds
 * @param statusArr
 * @param req
 * @param callback
 */
function getTimelines(userIds, statusArr, req, callback) {
	var obj = {};
	var aggs = [];
	aggs.push({$match: {agentId: {$in: userIds}}});
	if (_.has(req.query, 'startTime')) {
		var fieldName = 'startTime';
		var _d1 = _moment(req.query[fieldName].split(' - ')[0], 'DD/MM/YYYY');
		var _d2 = req.query[fieldName].split(' - ')[1] ? _moment(req.query[fieldName].split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

		var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
		var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
		startDay = startDay.startOf('day');
		endDay = endDay.endOf('day');

		obj['startTime'] = {$gte: startDay._d, $lt: endDay._d};
	}

	if (_.has(req.query, 'agentId') && req.query.agentId.length > 0) {
		obj['agentId'] = {$in: _.arrayObjectId(req.query.agentId)};
	}
	obj['endTime'] = {$ne: null};

	aggs.push({$match: obj});
	aggs.push({
		$sort: {
			startTime: 1
		}
	});
	aggs.push({
		$project: {
			_id: 1,
			startTime: 1,
			endTime: 1,
			agentId: 1,
			status: 1,
			startReason: 1,
			endReason: 1
		}
	});

	aggs.push({
		$group: {
			_id: {
				agentId: "$agentId",
				day: {$dayOfMonth: {$add: ["$startTime", 7 * 60 * 60 * 1000]}},
				month: {$month: {$add: ["$startTime", 7 * 60 * 60 * 1000]}},
				year: {$year: {$add: ["$startTime", 7 * 60 * 60 * 1000]}},
				//status: "$status"
			},
			status: {
				$push: {
					status: "$status",
					startTime: {$add: ["$startTime", 0]},
					endTime: {$add: ["$endTime", 0]},
					startReason: "$startReason",
					endReason: "$endReason"
				}
			}
		}
	});
	aggs.push({
		$lookup: {
			from: 'users',
			localField: '_id.agentId',
			foreignField: '_id',
			as: 'user'
		}
	});
	aggs.push({$unwind: {path: '$user', preserveNullAndEmptyArrays: true}});
	aggs.push({
		$project: {
			time: "$_id",
			agent: {
				_id: "$user._id",
				name: {$concat: ['$user.displayName', ' (', '$user.name', ')']}
			},
			status: 1
		}
	});


	_AgentStatusLog.aggregate(aggs, function(err, result) {
		if (err) return callback(err);
		_.each(result, function(el) {
			_.each(el.status, function(stt) {
				if (stt.status == 4) {
					return stt.status = 'Not Answering';
				}
				var status = _.find(statusArr, function(s) {
					return s.statusCode == stt.status;
				});
				if (status) {
					stt.status = status.name;
				} else {
					stt.status = 'Missing';
				}
			});
		});
		callback(err, result);
	});
}

/**
 *
 * @param userIds
 * @param statusArr
 * @param req
 * @param callback
 */
function getTimelineGroupByDay(userIds, statusArr, req, callback) {
	var obj = {};
	var aggs = [];
	aggs.push({$match: {agentId: {$in: userIds}}});
	if (_.has(req.query, 'startTime')) {
		var fieldName = 'startTime';
		var _d1 = _moment(req.query[fieldName].split(' - ')[0], 'DD/MM/YYYY');
		var _d2 = req.query[fieldName].split(' - ')[1] ? _moment(req.query[fieldName].split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

		var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
		var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
		startDay = startDay.startOf('day');
		endDay = endDay.endOf('day');

		obj['startTime'] = {$gte: startDay._d, $lt: endDay._d};
	}

	if (_.has(req.query, 'agentId') && req.query.agentId.length > 0) {
		obj['agentId'] = {$in: _.arrayObjectId(req.query.agentId)};
	}
	obj['endTime'] = {$ne: null};

	aggs.push({$match: obj});
	aggs.push({
		$sort: {
			startTime: 1
		}
	});
	aggs.push({
		$project: {
			_id: 1,
			startTime: 1,
			endTime: 1,
			agentId: 1,
			status: 1,
			startReason: 1,
			endReason: 1
		}
	});

	aggs.push({
		$group: {
			_id: {
				agentId: "$agentId",
				day: {$dayOfMonth: {$add: ["$startTime", 7 * 60 * 60 * 1000]}},
				month: {$month: {$add: ["$startTime", 7 * 60 * 60 * 1000]}},
				year: {$year: {$add: ["$startTime", 7 * 60 * 60 * 1000]}},
			},
			status: {
				$push: {
					status: "$status",
					startTime: {$add: ["$startTime", 0]},
					endTime: {$add: ["$endTime", 0]},
					startReason: "$startReason",
					endReason: "$endReason"
				}
			}
		}
	});
	aggs.push({
		$lookup: {
			from: 'users',
			localField: '_id.agentId',
			foreignField: '_id',
			as: 'user'
		}
	});
	aggs.push({$unwind: {path: '$user', preserveNullAndEmptyArrays: true}});
	aggs.push({
		$project: {
			time: "$_id",
			agent: {
				_id: "$user._id",
				name: {$concat: ['$user.displayName', ' (', '$user.name', ')']}
			},
			status: 1
		}
	});

	// Gruop by day
	aggs.push({
		$group: {
			_id: {
				day: "$time.day",
				month: "$time.month",
				year: "$time.year"
			},
			timelines: {
				$push: {
					time: "$time",
					agent: "$agent",
					status: "$status"
				}
			}
		}
	});
	aggs.push({
		$sort: {
			"_id.year": 1,
			"_id.month": 1,
			"_id.day": 1,
		}
	});

	_AgentStatusLog.aggregate(aggs, function(err, result) {
		if (err) return callback(err);
		_.each(result, function(ele) {
			_.each(ele.timelines, function(el) {
				_.each(el.status, function(stt) {
					if (stt.status == 4) {
						return stt.status = 'Not Answering';
					}
					var status = _.find(statusArr, function(s) {
						return s.statusCode == stt.status;
					});
					if (status) {
						stt.status = status.name;
					} else {
						stt.status = 'Missing';
					}
				});
			});
		});

		callback(err, result);
	});
}

/**
 *
 * @param userIds
 * @param statusArr
 * @param req
 * @param callback
 */
function getOverallReportGroupByDay(userIds, statusArr, req, callback) {
	var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
	var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

	var sort = _.cleanSort(req.query, '');
	var obj = {};
	var aggs = [];
	aggs.push({$match: {agentId: {$in: userIds}}});
	if (_.has(req.query, 'startTime')) {
		var fieldName = 'startTime';
		var _d1 = _moment(req.query[fieldName].split(' - ')[0], 'DD/MM/YYYY');
		var _d2 = req.query[fieldName].split(' - ')[1] ? _moment(req.query[fieldName].split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

		var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
		var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
		startDay = startDay.startOf('day');
		endDay = endDay.endOf('day');

		obj['startTime'] = {$gte: startDay._d, $lt: endDay._d};
	}

	if (_.has(req.query, 'agentId') && req.query.agentId.length > 0) {
		obj['agentId'] = {$in: _.arrayObjectId(req.query.agentId)};
	}
	obj['endTime'] = {$ne: null};

	aggs.push({$match: obj});
	var localStartTime = {$add: ["$startTime", 7 * 60 * 60 * 1000]};
	var localEndTime = {$add: ["$endTime", 7 * 60 * 60 * 1000]};

	aggs.push({
		$project: {
			_id: 1,
			startTime: 1,
			endTime: 1,
			agentId: 1,
			status: 1,
			startReason: 1,
			endReason: 1,
			duration: {$subtract: ["$endTime", "$startTime"]},
			day: {$dayOfMonth: localStartTime},
			month: {$month: localStartTime},
			year: {$year: localStartTime},
		}
	});

	aggs.push({
		$group: {
			_id: {
				agentId: "$agentId",
				day: "$day",
				month: "$month",
				year: "$year"
			},
			duration: {$sum: "$duration"},
			startTime: {$min: "$startTime"},
			endTime: {$max: "$endTime"},
			status: {
				$push: {
					status: "$status",
					startTime: "$startTime",
					endTime: "$endTime",
					duration: "$duration",
					startReason: "$startReason",
					endReason: "$endReason"
				}
			}
		}
	});

	/*aggs.push({ $group: {
	 _id: "$_id.agentId",
	 totalDuration: {$sum:  "$duration"},
	 avgDuration: {$avg: "$duration"},
	 startTime: {$min: "$startTime"},
	 endTime: {$max: "$endTime"},
	 status: {$push: "$status"}
	 }});*/
	aggs.push({
		$group: {
			_id: {
				agentId: "$_id.agentId",
				day: "$_id.day",
				month: "$_id.month",
				year: "$_id.year"
			},
			totalDuration: {$sum: "$duration"},
			avgDuration: {$avg: "$duration"},
			startTime: {$min: "$startTime"},
			endTime: {$max: "$endTime"},
			status: {$push: "$status"}
		}
	});

	aggs.push({$lookup: {from: 'users', localField: '_id.agentId', foreignField: '_id', as: 'user'}});
	aggs.push({$unwind: {path: '$user', preserveNullAndEmptyArrays: true}});
	// Group by date
	aggs.push({
		$group: {
			_id: {
				day: {$dayOfMonth: localStartTime},
				month: {$month: localStartTime},
				year: {$year: localStartTime},
			},
			reports: {
				$push: {
					name: {$concat: ['$user.displayName', ' (', '$user.name', ')']},
					agentId: '$user._id',
					startTime: {$dateToString: {format: "%H:%M %d/%m/%Y", date: localStartTime}},
					endTime: {$dateToString: {format: "%H:%M %d/%m/%Y", date: localEndTime}},
					status: '$status',
					avgDuration: '$avgDuration',
					totalDuration: '$totalDuration'
				}
			}
		}
	});
	aggs.push({
		$sort: {
			"_id.year": 1,
			"_id.month": 1,
			"_id.day": 1,
		}
	});

	_AgentStatusLog.aggregatePaginate(_AgentStatusLog.aggregate(aggs), {
		page: page,
		limit: rows
	}, function(err, result, pageCount, count) {
		if (err) {
			return callback(err, {data: [], paging: {}});
		}
		var codeArr = _.pluck(statusArr, 'statusCode');
		codeArr.push(4);
		_.each(result, function(data) {
			_.each(data.reports, function(el) {
				var status = {};
				el.status = _.sortBy(_.flatten(el.status), 'startTime');
				el.changeTime = 0;
				el.totalDuration = 0;

				// hoangdv calculat status duration
				var sttLen = el.status.length;
				if (sttLen == 1) {
					status[el.status[0].status] = el.status[0].duration;
				}
				for (var i = 0; i < sttLen; i++) {
					var statusI = el.status[i];
					var stt = {
						status: statusI.status,
						start: statusI.startTime.getTime(),
						end: statusI.endTime.getTime()
					};
					for (var j = i + 1; j < sttLen; j++) {
						var statusJ = el.status[j];
						var isSameDay = _moment(statusI.startTime).format('DD/MM/YYYY') == _moment(statusJ.startTime).format('DD/MM/YYYY');
						// Không cùng ngày
						var isEndSession = false;
						// Dữ liệu mới
						if (statusI.endReason && statusI.endReason == 'logout') {
							isEndSession = true;
						}
						// Dữ liệu cũ - Hết ngày được xem là hết phiên làm việc
						if (!isEndSession && !isSameDay) {
							isEndSession = true;
						}
						if (isEndSession) {
							break;
						}
						stt.end = statusJ.startTime.getTime();
						if (statusI.status == statusJ.status) {
							stt.end = statusJ.endTime.getTime();
							i = j;
						} else {
							el.changeTime++;
							break;
						}
					}
					if (!_.has(status, stt.status)) {
						status[stt.status] = stt.end - stt.start;
					} else {
						status[stt.status] += stt.end - stt.start;
					}
					el.totalDuration += stt.end - stt.start;
				}
				var days = _moment(el.endTime, 'HH:mm DD/MM/YYYY').diff(_moment(el.startTime, 'HH:mm DD/MM/YYYY'), 'days') + 1;
				el.avgDuration = Math.floor(el.totalDuration / days);
				status['Missing'] = 0;
				_.each(_.keys(status), function(key) {
					if (!_.isEqual(key, 'Missing') && codeArr.indexOf(Number(key)) < 0) {
						status['Missing'] += status[key];
					}
				});
				// end hoangdv
				el.status = status;
			});
		});

		var paginator = new pagination.SearchPaginator({
			prelink: '/report-login-logout',
			current: page,
			rowsPerPage: rows,
			totalResult: count
		});

		callback(err, {data: result, paging: paginator.getPaginationData()});
	});
}

/**
 * Convert millisecond to hh:mm:ss
 * @param s Millisecond
 * @returns {*}
 */
function msToTime(s) {
	if (s == 0) return '00:00:00';
	var ms = s % 1000;
	s = (s - ms) / 1000;
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	var hrs = (s - mins) / 60;
	return _.pad(hrs, 2, '0') + ':' + _.pad(mins, 2, '0') + ':' + _.pad(secs, 2, '0');
}

/**
 *
 * @param req
 * @param callback
 * @returns {*}
 */
function permissionConditions(req, callback) {
	if (!(req.session.auth && req.session.auth)) {
		var err = new Error('session auth null');
		return callback(err);
	}
	var _ids = [new mongodb.ObjectId(req.session.user._id.toString())];
	var _isTeamLeader = req.session.auth.company && !req.session.auth.company.leader && req.session.auth.company.group.leader;
	var _isCompanyLeader = req.session.auth.company && req.session.auth.company.leader;
	var _isTenantLeader = !req.session.auth.company;

	var _paralledArr = [];

	if (_isTeamLeader) {
		_paralledArr.push(function(next) {
			_Users.distinct('_id', {
				$or: [
					{agentGroupLeaders: {$elemMatch: {group: req.session.auth.company.group._id}}},
					{agentGroupMembers: {$elemMatch: {group: req.session.auth.company.group._id}}}
				]
			}, function(err, result) {
				_ids = _.union(_ids, result);
				next(err);
			});
		});
	}

	var _groupQuery = {};
	var _companyQuery = {};
	if (_isCompanyLeader) {
		_groupQuery = {idParent: req.session.auth.company._id};
		_companyQuery = {idCompany: req.session.auth.company._id};
	}

	if (_isCompanyLeader || _isTenantLeader) {
		_paralledArr.push(function(next) {
			_async.waterfall([
				function(next) {
					_Campains.distinct('_id', _companyQuery, next);
				},
				function(ids, next) {
					_CampaignAgent.distinct('idAgent', {idCampaign: {$in: ids}}, next);
				}
			], function(err, result) {
				_ids = _.union(_ids, result);
				next(err);
			});
		});

		_paralledArr.push(function(next) {
			_async.waterfall([
				function(next) {
					_AgentGroups.distinct('_id', _groupQuery, next);
				},
				function(ids, next) {
					_Users.distinct('_id', {
						$or: [
							{agentGroupLeaders: {$elemMatch: {group: {$in: ids}}}},
							{agentGroupMembers: {$elemMatch: {group: {$in: ids}}}}
						]
					}, next);
				}
			], function(err, result) {
				_ids = _.union(_ids, result);
				next(err);
			});
		});
	}

	_async.parallel(_paralledArr, function(err, result) {
		callback(err, _ids);
	});
}