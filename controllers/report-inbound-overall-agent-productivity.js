/**
 * Created by Đại Đồng on 10/05/2016.
 */
exports.index = {
	json: function (req, res) {
		_Company.distinct("_id", req.query.idParent ? {_id:req.query.idParent}:{}, function(err,com){
			_AgentGroups.distinct("_id", {idParent:{$in:com}}, function (err, r) {
				_Users.find({$or: [{'agentGroupLeaders.group': {$in: r}}, {'agentGroupMembers.group': {$in: r}}, {'companyLeaders.company': {$in: com}}]}, function (err, r2) {
					res.status(200).json(r2);
				});
			});
		});
	},
	html: function (req, res) {
		var query = {};
		query = _.cleanRequest(req.query, ['startDate', 'endDate']);
		var serQuery = {};
		var transQuery = {};
		var companyQuery = {};
		var cond = {};
		cond.$or = [];
		if (_.has(req.query, "startDate") || _.has(req.query, "endDate")) {
			query.startTime = {};
			query.created = {};
			if (_.has(req.query, "startDate")) {
				query.startTime.$gte = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day').valueOf();
				query.created.$gte = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day')._d;
			}
			;
			if (_.has(req.query, "endDate")) {
				query.startTime.$lte = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day').valueOf();
				query.created.$lte = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day')._d;
			}
			;
		}
		if (_.has(req.query, "status")) {
			query.status = parseInt(req.query.status);
		}
		if (req.session.auth.company) {
			serQuery.idCompany = _.convertObjectId(req.session.auth.company._id);
			transQuery.idCompany = _.convertObjectId(req.session.auth.company._id);
			companyQuery._id = _.convertObjectId(req.session.auth.company._id);
			cond.$or.push({'companyLeaders.company': _.convertObjectId(req.session.auth.company._id)});
			if (!req.session.auth.company.leader) {
				_.render(req, res, 'report-inbound-overall-agent-productivity', {
					title: 'Báo cáo gọi vào - Báo tổng quát theo điện thoại viên',
					result: [],
					company: [],
					agent: [],
					plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
				}, true, new Error("Không đủ quyền truy cập"));
				return;
			}
		}
		_async.parallel({
			com: function (cb) {
				_Company.find(companyQuery, cb);
			},
			agent: function (cb) {
				_async.waterfall([
					function (callback) {
						_Company.distinct("_id", req.session.auth.company ? {_id: req.session.auth.company} : {}, function (err, com) {
							_AgentGroups.find({idParent:{$in:com}}, {_id: 1}, function (err, result) {
								if (err) return callback(err, null);
								var ag = _.pluck(result, '_id');
								cond.$or.push({'agentGroupLeaders.group': {$in: ag}}, {'agentGroupMembers.group': {$in: ag}}, {'companyLeaders.company': {$in: com}});
								_Users.find(cond, callback);
							});
						});
					}
				], cb);
			}
		}, function (err, result) {
			_.isEmpty(req.query) ? (_.render(req, res, 'report-inbound-overall-agent-productivity', {
					title: 'Báo cáo gọi vào - Báo tổng quát theo điện thoại viên',
					result: [],
					company: result.com,
					agent: result.agent,
					plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
				}, true, err)) : (
					_async.waterfall([function(cb){
						var serviceQuery = {};
						if (_.has(req.query, 'idCompany')) {
							serviceQuery.idCompany = _.convertObjectId(req.query.idCompany);
						};
						_Services.distinct("_id", serviceQuery,cb)
					},
						function (a,cb) {
							var aggregate = [];
							transQuery = {};
							transQuery.transType = 1;
							transQuery.serviceType = 3;
							transQuery.serviceId = {$in:a};
							// transQuery.callDuration = {$exist:true};
							var ticketQuery = {idService:{$in:a},status:{$ne:-1}};
							if (_.has(query, 'startTime')) {
								transQuery.startTime = query.startTime;
							}
							if (_.has(query, 'created')) {
								ticketQuery.created = query.created;
							}
							if (_.has(req.query, 'agentId')) {
								transQuery.agentId = {$in: _.arrayObjectId(req.query.agentId)};
								ticketQuery.idAgent = {$in: _.arrayObjectId(req.query.agentId)};
							}
							aggregate.push({$match: transQuery});
							aggregate.push({$match:{callDuration: { $exists: true }}});
							aggregate.push({
								$group: {
									_id: {agent:"$agentId", callId:"$callId"},
									totalDuration: {$sum: {$cond: [{$ne: [{$max:"$answerTime"}, null]}, {$subtract: ['$endTime', '$ringTime']}, 0]}},
									callDuration:{$sum:"$callDuration"},
									status:{$max:"$answerTime"}
								}
							});
							// 3/3/2017: Albert: Fix max, min of callDuration & add more cond callDuration: { $exists: true }}
							aggregate.push({$group:{
								_id:"$_id.agent",
								totalCall:{$sum:1},
								totalDuration:{$sum:"$totalDuration"},
								connected: {$sum: {$cond: [{$ne: ["$status", null]}, 1, 0]}},
								maxLength: {$max:"$callDuration"},
								minLength: {$min:"$callDuration"},
								missed: {$sum: {$cond: [{$ne: ["$status", null]}, 0, 1]}},
								callDuration: {$sum: {$cond: [{$ne: ["$status", null]}, "$callDuration", 0]}},
								avgCallDuration: {$avg: {$cond: [{$ne: ["$status", null]}, "$callDuration", null]}},
							}})
							aggregate.push({
								$lookup: {
									from: "users",
									localField: "_id",
									foreignField: "_id",
									as: "agentInfo"
								}
							});
							aggregate.push({ $unwind: { path: '$agentInfo', preserveNullAndEmptyArrays: true }});
							aggregate.push({ $project:{
								_id:{$ifNull: ['$agentInfo.displayName', null] },
								totalCall:1,
								callDuration:1,
								connected: 1,
								maxLength:1,
								minLength:1,
								missed: 1,
								avgCallDuration: 1}});
							_CdrTransInfo.aggregate(aggregate, function (err, r) {
								_.log(err, r)
								if (_.has(query, 'startTime')) {
									transQuery.startTime = query.startTime;
								}
								_Tickets.aggregate([
									{$match:ticketQuery},
									{$group:{
										_id:'$idAgent',
										total:{$sum:1},
										done:{$sum:{$cond:[{$eq:['$status',2]},1,0]}}
									}},
									{
										$lookup: {
											from: "users",
											localField: "_id",
											foreignField: "_id",
											as: "agentInfo"
										}
									},
									{
										$unwind:{ path: '$agentInfo', preserveNullAndEmptyArrays: true }
									},
									{
										$project:{
											_id:{$ifNull: ['$agentInfo.displayName', null] },
											total:1,
											done:1
										}
									}
								], function(err,r2){
									var result = [];
									_.each(_.union(_.pluck(r,'_id'), _.pluck(r2,'_id')), function(o){
										var obj1 = _.findWhere(r, {_id: o}) ? _.findWhere(r, {_id: o}):{_id:o,totalCall:0, callDuration:0, connected: 0, missed: 0, avgCallDuration: 0};
										var obj2 = _.findWhere(r2, {_id: o}) ? _.findWhere(r2, {_id: o}):{_id:o,total:0,done:0};
										result.push(_.extend(obj1,obj2));
									})
									console.log(_.pluck(r,'_id'), _.pluck(r2,'_id'))
									cb(err, result);
								})
							})
						}
					], function (err, results) {
						_.render(req, res, 'report-inbound-overall-agent-productivity', {
							title: 'Báo cáo gọi vào - Báo tổng quát theo điện thoại viên',
							result: results,
							company: result.com,
							agent: result.agent,
							plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
						}, true, err)
					})
				)
		})
	}
}