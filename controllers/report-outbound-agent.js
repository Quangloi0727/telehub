/**
 * Created by NghiaTM on 5/10/2016.
 */
exports.index = {
    json: function (req, res) {
        if (req.query.cascade) {
            _AgentGroups.distinct("_id", {idParent: req.query.cascade}, function (err, r) {
                _Users.find({$or: [{'agentGroupLeaders.group': {$in: r}}, {'agentGroupMembers.group': {$in: r}}, {'companyLeaders.company': {$in: [_.convertObjectId(req.query.cascade)]}}]}, function (err, r2) {
                    res.status(200).json(r2);
                })
            })
        } else {
            var startDate = 0;
            var endDate = 0;
            var dateQuery = {};
            var listMonth = [];
            var listItem = [];
            _async.waterfall([
                    function(cb){
                        if(req.query.startDate||req.query.endDate){
                            dateQuery.startTime = {};
                            if(req.query.startDate){
                                dateQuery.startTime.$gte = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day').valueOf();
                            }
                            if(req.query.endDate){
                                dateQuery.startTime.$lte = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day').valueOf();
                            }
                            cb();
                        }else{
                            cb()
                        }
                    }
                    //function (cb) {
                    //    if (_.has(req.query, "startDate")) {
                    //        startDate = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day').valueOf();
                    //        dateQuery
                    //        cb();
                    //    } else {
                    //        _CdrTransInfo.findOne({}, {}, {sort: {startTime: 1}}, function (err, r) {
                    //            if (r) {
                    //                startDate = r.startTime;
                    //            } else {
                    //                startDate = _moment().startOf('day').valueOf();
                    //            }
                    //            cb()
                    //        })
                    //    }
                    //},
                    //function (cb) {
                    //    if (_.has(req.query, "endDate")) {
                    //        endDate = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day').valueOf();
                    //        cb();
                    //    } else {
                    //        _CdrTransInfo.findOne({}, {}, {sort: {startTime: -1}}, function (err, r) {
                    //            if (r) {
                    //                endDate = r.startTime;
                    //            } else {
                    //                endDate = _moment().valueOf();
                    //            }
                    //            cb();
                    //        })
                    //    }
                    //},
                    //function (cb) {
                    //    for (var m = moment(endDate).valueOf(); m > startDate; m -= 60 * 60 * 24 * 30 * 1000) {
                    //        var l = m - 60 * 60 * 24 * 30 * 1000;
                    //        if (l > startDate) {
                    //            listMonth.push({startTime: {$lte: m, $gte: l}});
                    //        } else {
                    //            listMonth.push({startTime: {$lte: m, $gte: startDate}});
                    //            cb()
                    //        }
                    //    }
                    //    ;
                    //}
                ], function (err) {
                    var agentFilter = (req.query.agents) ? {
                        agentId: {
                            $in: _.map(req.query.agents, function (id) {
                                return new mongoose.Types.ObjectId(id);
                            })
                        }
                    } : {};
                    var companyIds = {};
                    if (req.session.auth.company) {
                        companyIds.idCompany = _.convertObjectId(req.session.auth.company._id);
                        if (!req.session.auth.company.leader) {
                            return res.json({code: 500});
                        }
                    }
                    _async.waterfall([function(next){
                            _Campains.distinct("_id", req.query.idCompany ? {idCompany: req.query.idCompany} : req.session.auth.company ? companyIds : {}, function (err, r) {
                                next(err,r)
                            });
                    },
                        function (a, next) {
                            //console.log(listMonth.length)
                            //_async.each(listMonth, function (item, callback) {
                            //console.log(item)
                            //console.log({idCampain:a});
                            var agg = [
                                {$match: dateQuery},
                                {$match: {transType: 6}},
                                {$match: {serviceType: 3}},
                                {$match: agentFilter},
                                {$match: {idCampain: {$in:a}}},
                                {$group: {_id: "$agentId", "timeBlock": {$push: "$timeBlock"}}},
                                {
                                    $lookup: {
                                        from: "users",
                                        localField: "_id",
                                        foreignField: "_id",
                                        as: "agent"
                                    }
                                }, {$unwind: "$agent"},
                                {$project: {_id: "$_id", name: "$agent.displayName", timeBlock: "$timeBlock"}}
                            ];
                            _CdrTransInfo.aggregate(agg).exec(function (err, datas) {
                                var fData = _.map(datas, function (item) {
                                    var timeblock = _.reduce(item.timeBlock, function (memo, item) {
                                        memo["" + item] = (memo["" + item]) ? memo["" + item] + 1 : 1;
                                        return memo;
                                    }, {})
                                    item.timeBlock = timeblock;
                                    return item;
                                })
                                listItem.push(fData);
                                //callback();
                                next(err)
                            });
                        },function(next){
                            //}, function (err) {
                                var item = [];
                                var final = [];
                                _async.waterfall([function(cb){
                                    _.each(listItem, function(o){
                                        _.each(o, function(i){
                                            item.push({_id: i._id.toString(), name: i.name});
                                        });
                                    });
                                    cb();
                                }, function(cb){
                                    _.each(_.uniq(item, "_id"), function(o){
                                        final.push({_id: o._id,name: o.name, timeBlock:{}});
                                    });
                                    cb()
                                }, function(cb){
                                    _.each(_.range(24), function(o){
                                        _.each(final,function(i){
                                            i.timeBlock[o] = 0;
                                        })
                                    });
                                    cb();
                                }, function(cb){
                                    _.each(listItem, function(o){
                                        _.each(o, function(i){
                                            _.each(final, function(j){
                                                _.each(_.keys(j.timeBlock), function(k){
                                                    if(j._id == i._id.toString() && i.timeBlock[k]) {
                                                        j.timeBlock[k] += i.timeBlock[k];
                                                    }
                                                });
                                            });
                                        });
                                    });
                                    cb();
                                }], function(err){
                                    next(err, final);
                                })
                            //});
                        }
                    ], function (err, datas) {
                        return res.json({code: (err) ? 500 : 200, data: datas})
                    })

                }
            );

        }
    },
    html: function (req, res) {

        var companyIds = [];
        if (req.session.auth.company) {
            companyIds.push(new mongoose.Types.ObjectId(req.session.auth.company._id))
            if (!req.session.auth.company.leader) {

                _.render(req, res, 'report-outbound-agent', {
                    title: "Báo cáo gọi ra - Năng suất ĐTV",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    company:[],
                    agents: []
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }
        //log.debug(req.session);
        _async.waterfall([
            function (next) {
                _Company.find(req.session.auth.company ? {_id: req.session.auth.company} : {}, function (err, com) {
                    _AgentGroups.find({idParent: {$in: _.pluck(com, "_id")}}, {_id: 1}, function (err, result) {
                        if (err) return callback(err, null);
                        var ag = _.pluck(result, '_id');
                        _Users.find({$or: [{'agentGroupLeaders.group': {$in: ag}}, {'agentGroupMembers.group': {$in: ag}}, {'companyLeaders.company': {$in: com}}]}, function (err, agent) {
                            next(err, com, agent);
                        });
                    });
                });
            }

        ], function (err, com, users) {
            return _.render(req, res, 'report-outbound-agent', {
                title: "Báo cáo gọi ra - Năng suất ĐTV",
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: com,
                agents: users
            }, true, err);
        })
    }
}
