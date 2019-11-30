/**
 * Created by luongvanlam on 1/13/16.
 */
var requestTrunks = require(path.join(_rootPath, 'queue', 'common', 'request-trunks.js'));
exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        if (_.has(req.query, 'status')) {
            req.query.status = parseInt(req.query.status);
            if (req.query.status > 1) delete req.query.status;
        }

        if (_.has(req.query, 'sort')) {
            var stringArr = req.query.sort.split(':');
            var sortCondition = {};
            sortCondition[stringArr[0]] = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
            var sortObj = {$sort: sortCondition};
        }

        req.query = _.cleanRequest(req.query);

        _async.waterfall([
            function (callback) {
                var agg = [];

                // Bỏ những người có role = 1 ( đây là admin hệ thống )
                agg.push({$match: {role: {$gt: 1}}});

                // Tách mảng companyLeader thành từng record
                agg.push({$unwind: '$companyLeaders'});

                // Gộp lại theo tên công ty, đẩy tất cả displayName thành 1 mảng để sử dụng sau này
                agg.push({
                    $group: {
                        _id: '$companyLeaders.company',
                        displayName: {$push: '$displayName'},
                        status: {$first: '$status'}
                    }
                });

                // Kiểm tra user có được active hay không
                agg.push({$match: {status: 1}});

                // Lọc theo điều kiện tìm kiếm
                if (_.has(req.query, 'leaders'))
                    agg.push({$match: {displayName: {$regex: new RegExp(_.stringRegex(req.query.leaders), 'i')}}});
                _Users.aggregate(agg, function (err, result) {
                    if (err) callback(err);
                    // Chuyển từ kiểu mảng sang dạng object để lấy dữ liệu bên dưới
                    callback(err, _.chain(result)
                        .reduce(function (memo, val) {
                            memo[val._id] = val.displayName;
                            return memo;
                        }, {})
                        .value());
                });
            },
            function (user, callback) {
                var aggregate = _Company.aggregate();

                // attach AgentGroups with Company
                aggregate._pipeline.push({
                    $lookup: {
                        from: 'agentgroups',
                        localField: '_id',
                        foreignField: 'idParent',
                        as: 'agentGroup'
                    }
                });

                // attach CompanyProfile with Company
                aggregate._pipeline.push({
                    $lookup: {
                        from: 'companyprofiles',
                        localField: 'companyProfile',
                        foreignField: '_id',
                        as: 'companyProfile'
                    }
                });

                // Sort Condition
                if (sortObj)
                    aggregate._pipeline.push(sortObj);

                // Search Conditions
                if (_.has(req.query, 'name'))
                    aggregate._pipeline.push({$match: {'name': {$regex: new RegExp(_.stringRegex(req.query.name), 'i')}}});
                if (_.has(req.query, 'companyProfile'))
                    aggregate._pipeline.push({$match: {'companyProfile.name': {$regex: new RegExp(_.stringRegex(req.query.companyProfile), 'i')}}});
                if (_.has(req.query, 'agentGroup'))
                    aggregate._pipeline.push({$match: {'agentGroup.name': {$regex: new RegExp(_.stringRegex(req.query.agentGroup), 'i')}}})
                if (_.has(req.query, 'status'))
                    aggregate._pipeline.push({$match: {status: req.query.status}});

                // Filter active AgentGroup and CompanyProfile
                aggregate._pipeline.push({
                    $project: {
                        name: 1,
                        status: 1,
                        companyProfile: {
                            $filter: {
                                input: '$companyProfile',
                                as: 'item',
                                cond: {$gt: ['$$item.status', 0]}
                            }
                        },
                        agentGroup: {
                            $filter: {
                                input: '$agentGroup',
                                as: 'item',
                                cond: {$gt: ['$$item.status', 0]}
                            }
                        }
                    }
                });

                _Company.aggregatePaginate(aggregate, {
                    page: page,
                    limit: rows
                }, function (error, company, pageCount, count) {
                    if (error) callback(error);

                    var paginator = new pagination.SearchPaginator({
                        prelink: '/company',
                        current: page,
                        rowsPerPage: rows,
                        totalResult: count
                    });
                    // Tìm danh sách user tương ứng với công ty tìm được và trả về kết quả
                    callback(error, _.chain(company)
                            .reduce(function (memo, obj) {
                                obj.user = _.has(user, obj._id) ? user[obj._id] : [];

                                // Nếu như có tìm kiếm theo leaders, mà chỗ này không thấy kết quả
                                // thì bỏ qua không thêm vào kết quả trả về
                                if (_.has(req.query, 'leaders') && _.isEqual(obj.user.length, 0)) return memo;

                                // Gắn user tìm được vào với kết quả trả về
                                memo.push(obj);
                                return memo;
                            }, [])
                            .value(),
                        paginator);
                });
            }
        ], function (err, companies, paginator) {
            res.json({companies: companies, paging: paginator.getPaginationData()});
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        if (_.has(req.query, 'status')) {
            req.query.status = parseInt(req.query.status);
            if (req.query.status > 1) delete req.query.status;
        }

        if (_.has(req.query, 'sort')) {
            var stringArr = req.query.sort.split(':');
            var sortCondition = {};
            sortCondition[stringArr[0]] = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
            var sortObj = {$sort: sortCondition};
        }

        req.query = _.cleanRequest(req.query);

        _async.waterfall([
            function (callback) {
                var agg = [
                    {$match: {role: {$gt: 1}}},
                    {$unwind: '$companyLeaders'},
                    {
                        $group: {
                            _id: '$companyLeaders.company',
                            displayName: {$push: '$displayName'},
                            status: {$first: '$status'}
                        }
                    },
                    {$match: {status: 1}}
                ];

                if (_.has(req.query, 'leaders'))
                    agg.push({$match: {displayName: {$regex: new RegExp(_.stringRegex(req.query.leaders), 'i')}}});
                _Users.aggregate(agg, function (err, result) {
                    if (err) callback(err);
                    callback(err, _.chain(result)
                        .reduce(function (memo, val) {
                            memo[val._id] = val.displayName;
                            return memo;
                        }, {})
                        .value());
                });
            },
            function (user, callback) {
                var aggregate = _Company.aggregate();
                aggregate._pipeline.push({
                    $lookup: {
                        from: 'agentgroups',
                        localField: '_id',
                        foreignField: 'idParent',
                        as: 'agentGroup'
                    }
                });

                // attach CompanyProfile with Company
                aggregate._pipeline.push({
                    $lookup: {
                        from: 'companyprofiles',
                        localField: 'companyProfile',
                        foreignField: '_id',
                        as: 'companyProfile'
                    }
                });

                // Sort Condition
                if (sortObj)
                    aggregate._pipeline.push(sortObj);

                // Search Conditions
                if (_.has(req.query, 'name'))
                    aggregate._pipeline.push({$match: {'name': {$regex: new RegExp(_.stringRegex(req.query.name), 'i')}}});
                if (_.has(req.query, 'companyProfile'))
                    aggregate._pipeline.push({$match: {'companyProfile.name': {$regex: new RegExp(_.stringRegex(req.query.companyProfile), 'i')}}});
                if (_.has(req.query, 'agentGroup'))
                    aggregate._pipeline.push({$match: {'agentGroup.name': {$regex: new RegExp(_.stringRegex(req.query.agentGroup), 'i')}}})
                if (_.has(req.query, 'status'))
                    aggregate._pipeline.push({$match: {status: req.query.status}});

                // Filter active AgentGroup and CompanyProfile
                aggregate._pipeline.push({
                    $project: {
                        name: 1,
                        status: 1,
                        companyProfile: {
                            $filter: {
                                input: '$companyProfile',
                                as: 'item',
                                cond: {$gt: ['$$item.status', 0]}
                            }
                        },
                        agentGroup: {
                            $filter: {
                                input: '$agentGroup',
                                as: 'item',
                                cond: {$gt: ['$$item.status', 0]}
                            }
                        }
                    }
                });

                _Company.aggregatePaginate(aggregate, {
                    page: page,
                    limit: rows
                }, function (error, company, pageCount, count) {
                    if (error) callback(error);

                    var paginator = new pagination.SearchPaginator({
                        prelink: '/company',
                        current: page,
                        rowsPerPage: rows,
                        totalResult: count
                    });
                    // Tìm danh sách user tương ứng với công ty tìm được và trả về kết quả
                    callback(error, _.chain(company)
                        .reduce(function (memo, obj) {
                            obj.user = _.has(user, obj._id) ? user[obj._id] : [];

                            // Nếu như có tìm kiếm theo leaders, mà chỗ này không thấy kết quả
                            // thì bỏ qua không thêm vào kết quả trả về
                            if (_.has(req.query, 'leaders') && _.isEqual(obj.user.length, 0)) return memo;

                            // Gắn user tìm được vào với kết quả trả về
                            memo.push(obj);
                            return memo;
                        }, [])
                        .value(),
                        paginator);
                });
            }
        ], function (err, companies, paginator) {
            _.render(req, res, 'company', {
                title: 'Danh sách công ty',
                myCompany: companies,
                paging: paginator.getPaginationData(),
                plugins: [['bootstrap-select']]
            }, true, err);
        });
    }
}

exports.new = function (req, res) {
    var companyId = req.params.company;
    _async.parallel({
        user: function (callback) {
            _Users.find({status: 1, role: {$ne: 1}}, callback);
        },
        agent: function (callback) {
            _AgentGroups.find({
                status: 1,
                idParent: null
            }, callback);
        },
        companyProfile: function (callback) {
            _CompanyProfile.find({status: 1}, callback);
        },
        trunks: function(callback){
            //var __query = [{$match: {status: 1}}];
            //__query.push({$match: {idCompany: null}});
            //_Trunk.aggregate(__query, callback);
            requestTrunks.RequestTrunk({status: 1}, function(){
                var err = new Error('Request Trunks time out');
                callback(err);
            }, function(obj){
                var err = null;
                if (obj.error != null){
                    err = new Error(obj.error);
                }
                callback(err, obj.trunks);
            })
        }
    }, function (error, result) {
        var obj = _.isNull(error) ? {
            title: 'Tạo mới công ty',
            users: result.user,
            agentGroup: result.agent,
            companyProfile: result.companyProfile,
            trunks: result.trunks,
            plugins: [['bootstrap-duallistbox'], ['chosen']]
        } : {
            title: 'Tạo mới công ty',
            plugins: [['bootstrap-duallistbox'], ['chosen']]
        };
        _.render(req, res, 'company-new', obj, true, error);
    });
};

exports.create = function (req, res) {
    log.debug(req.body);
    var status = _.isEqual(req.body.status, '1') ? 1 : 0;
    req.body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();

    _async.waterfall([
        function findOld(callback) {
            _Company.count({name: req.body.name}, function (err, result) {
                if (err) return res.json({code: 500, message: err});
                if (result > 0) return res.json({code: 500, message: 'Đã có công ty với tên: ' + req.body.name});
                callback();
            })
        },
        function addNewOrg(callback) {
            _Company.create({
                name: req.body.name,
                status: status,
                createBy: req.session.user._id,
                companyProfile: req.body.companyProfileId,
                recipeSLA: req.body.recipeSLA,
                recipeSLAChat: req.body.recipeSLAChat
            }, callback);
        },

        function updateAgentGroup(org, callback) {
            if (!_.has(req.body, 'agentId')) return callback(null, org);
            var agentGroup = _.isString(req.body.agentId) ? [req.body.agentId] : req.body.agentId;
            _AgentGroups.update(
                {_id: {$in: agentGroup}},
                {idParent: org._id},
                {multi: true},
                function (err, result) {
                    callback(err, org);
                });
        },
        function updateTrunk(org, callback){
            _Trunk.update(
                {_id: {$in: req.body.trunks}},
                {idCompany: org._id},
                {multi:true},
                function(err, result){
                    callback(err, org);
                }
            )
        },
        function updateUser(org, callback) {
            _Users.find({'companyLeaders.company': org._id}, function (err, result) {
                if (err) return callback(err);
                var lastManager = _.map(_.pick(result, '_id'), function (item) {
                    return item.toString();
                });
                var managerId = _.isString(req.body.managerId) ? [req.body.managerId] : req.body.managerId;
                _Users.update(
                    {_id: {$in: managerId}},
                    {
                        $addToSet: {
                            companyLeaders: {company: org._id, role: new mongodb.ObjectID('56ccdf99031ce3e32a48f5db')}
                        }
                    },
                    {new: true, multi: true},
                    function (err, result) {
                        callback(err, _.union(managerId, lastManager));
                    });
            });
        }
    ], function (error, totalUsers) {
        if (!error) {
            _.genTree();
            QUEUE_TernalPublish.queueUpdate('Users', totalUsers);
        }
        res.json({
            code: (error ? 500 : 200),
            message: error ? error : 'Add New Company Complete !'
        });
    });
};

exports.edit = function (req, res) {
    var companyId = req.params.company;
    _async.parallel({
        org: function (cb) {
            _Company.findOne({_id: companyId}, cb);
        },
        user: function (cb) {
            var cId = [new mongodb.ObjectID(companyId)];
            var __query = [{$match: {status: 1, role: {$gt: 1}}}];
            __query.push({
                $project: {
                    _id: 1,
                    displayName: 1,
                    name: 1,
                    selected: {
                        $cond: [
                            {
                                $or: [
                                    {$setEquals: ["$companyLeaders.company", cId]},
                                    {$gt: [{$size: {$setIntersection: ["$companyLeaders.company", cId]}}, 0]}
                                ]
                            },
                            {$literal: true},
                            {$literal: false}
                        ]
                    }
                }
            })
            _Users.aggregate(__query, cb);
        },
        agent: function (cb) {
            var __query = [{$match: {status: 1}}];
            __query.push({
                $match: {
                    $or: [
                        {idParent: null},
                        {idParent: new mongodb.ObjectID(companyId)},
                    ]
                }
            });
            __query.push({
                $project: {
                    _id: 1,
                    name: 1,
                    idParent: 1,
                    selected: {
                        $cond: [
                            {$eq: ['$idParent', new mongodb.ObjectID(companyId)]},
                            {$literal: true},
                            {$literal: false}
                        ]
                    }
                }
            })
            _AgentGroups.aggregate(__query, cb);
        },
        profile: function (cb) {
            _CompanyProfile.find({status: 1}, cb);
        },
        trunks: function(cb){
            //var __query = [{$match: {status: 1}}];
            //__query.push({
            //    $match: {
            //        $or: [
            //            {idCompany: null},
            //            {idCompany: new mongodb.ObjectID(companyId)},
            //        ]
            //    }
            //});
            //__query.push({
            //    $project: {
            //        _id: 1,
            //        name: 1,
            //        selected: {
            //            $cond: [
            //                {$eq: ['$idCompany', new mongodb.ObjectID(companyId)]},
            //                {$literal: true},
            //                {$literal: false}
            //            ]
            //        }
            //    }
            //})
            //_Trunk.aggregate(__query, cb);

            requestTrunks.RequestTrunk({status: 1}, function(){
                var err = new Error('Request Trunks time out');
                cb(err);
            }, function(obj){
                var err = null;
                if (obj.error != null){
                    err = new Error(obj.error);
                }
                log.debug(obj);
                var avaiTrunks= _.map(obj.trunks, function(trunk){
                    trunk.selected= false;
                    return trunk;
                });
                log.debug(avaiTrunks);
                _Trunk.find({idCompany: new mongodb.ObjectID(companyId)}, function(err1, selectedTrunks){
                    //log.debug(selectedTrunks);
                    selectedTrunks= _.map(selectedTrunks, function(trunk){
                        var nTrunk= trunk.toObject();
                        nTrunk.selected= true;
                        return nTrunk;
                    })
                    log.debug(selectedTrunks);
                    var trunks= _.union(avaiTrunks, selectedTrunks);
                    log.debug(trunks);
                    cb(err1, trunks);
                })


            })
        }
    }, function (error, result) {
        if (error) return res.render('404', {title: '404 | Page not found'});
        _.render(req, res, 'company-edit', {
            title: 'Chỉnh sửa công ty',
            lvlOrg: result.org,
            lvlUser: result.user,
            lvlOrgAgent: result.agent,
            companyProfile: result.profile,
            trunks: result.trunks,
            plugins: [['bootstrap-duallistbox'], ['chosen']]
        }, !_.isNull(result), error);
    })
}

exports.update = function (req, res) {
    log.debug(req.body);
    req.body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
    var companyId = new mongodb.ObjectID(req.params.company);
    _async.waterfall([

            function updateTrunk(callback){
                _async.waterfall([
                   function(cb){
                       _Trunk.update({idCompany: companyId},
                           {idCompany: null},
                           {multi: true},
                       function(err){
                            cb(err);
                       })
                   },
                    function(cb){
                        _Trunk.update({_id: {$in: req.body.trunks}},
                            {idCompany: companyId},
                            {multi: true},
                            function(err){
                                cb(err);
                            })
                    }
                ], function(e, result){
                    callback(e);
                });
            },
            function updateCompany(callback) {
                _Company.findByIdAndUpdate(req.params.company, {
                        $set: {
                            name: req.body.name,
                            status: _.isEqual(req.body.status, '1') ? 1 : 0,
                            updated: Date.now(),
                            updateBy: req.session.user._id,
                            companyProfile: req.body.companyProfileId,
                            recipeSLA: req.body.recipeSLA,
                            recipeSLAChat: req.body.recipeSLAChat
                        }
                    },
                    {new: true},
                    callback);
            },
            function updateParentId(result, callback) {
                _AgentGroups.find({idParent: companyId}, function (error, agent) {
                    if (error || _.isNull(agent)) callback(error);
                    agent = agent.map(function (item) {
                        return item['_id'].toString();
                    });
                    var newAgent = [];
                    if (_.has(req.body, 'agentId')) newAgent = _.isString(req.body.agentId) ? [req.body.agentId] : req.body.agentId;
                    var diffElement = _.difference(agent, newAgent);

                    _async.parallel({
                        removeParentId: function (callback) {
                            _AgentGroups.update(
                                {_id: {$in: diffElement}},
                                {
                                    $set: {
                                        idParent: null,
                                        updated: Date.now(),
                                        updateBy: req.session.user._id
                                    }
                                }, {multi: true}, callback);
                        },
                        addParentId: function (callback) {
                            _AgentGroups.update(
                                {_id: {$in: newAgent}},
                                {
                                    $set: {
                                        idParent: companyId,
                                        updated: Date.now(),
                                        updateBy: req.session.user._id
                                    }
                                }, {multi: true}, callback);
                        }
                    }, callback);
                });
            },
            function updateCompanyLeader(tmp, callback) {
                _Users.find({'companyLeaders.company': companyId}, function (error, users) {
                    if (error || _.isNull(users)) callback(error);
                    users = users.map(function (item) {
                        return item['_id'].toString();
                    });
                    var newUsers = [];
                    if (_.has(req.body, 'managerId')) newUsers = _.isString(req.body.managerId) ? [req.body.managerId] : req.body.managerId;
                    var diffElement = _.difference(users, newUsers);
                    _async.parallel({
                        removeCompany: function (callback) {
                            _Users.update(
                                {_id: {$in: diffElement}},
                                {$pull: {companyLeaders: {company: companyId}}},
                                {multi: true},
                                callback);
                        },
                        addCompany: function (callback) {
                            _Users.update(
                                {_id: {$in: newUsers}},
                                {
                                    $addToSet: {
                                        companyLeaders: {
                                            company: companyId,
                                            role: new mongodb.ObjectID('56ccdf99031ce3e32a48f5db')
                                        }
                                    }
                                },
                                {multi: true},
                                callback);
                        }
                    }, function (err, result) {
                        callback(err, _.union(users, newUsers));
                    });
                });
            }
        ],
        function (error, totalUsers) {
            if (!error) {
                _.genTree();
                QUEUE_TernalPublish.queueUpdate('Users', totalUsers);
            }

            res.json({
                code: (error ? 500 : 200),
                message: error ? JSON.stringify(error) : 'Cập nhật công ty thành công'
            })
        }
    );
};

exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value();
    _Company
        .findOne(_query).exec(function (error, result) {
        res.json([req.query.fieldId, _.isNull(result)]);
    });
};

exports.destroy = function (req, res) {
    var ids = _.isEqual(req.params.company, 'all') ? req.body.ids.split(',') : [req.params.company];

    _async.parallel({
        agentGroups: function (callback) {
            _AgentGroups.find({idParent: {$in: ids}}, function (err, result) {
                if (err) return callback(err, null);
                if (result.length > 0) return callback('Có agentgroups thuộc công ty', null);
                callback(err, result);
            });
        },
        services: function (callback) {
            _Services.find({idCompany: {$in: ids}}, function (err, result) {
                if (err) return callback(err, null);
                if (result.length > 0) return callback('Có services đang gắn với công ty', null);
                callback(err, result);
            });
        },
        campaign: function (callback) {
            _Campains.find({idCompany: {$in: ids}}, function (err, result) {
                if (err) return callback(err, null);
                if (result.length > 0) return callback('Có campaigns đang gắn với công ty', null);
                callback(err, result);
            });
        }
    }, function (err, result) {
        if (err) return res.json({code: 500, message: err});
        _Company._remove(ids, req.session.user._id, function (err, message) {
            res.json({
                code: err ? 500 : 200,
                message: err ? err : 'Xoá thành công'
            });
        });
    });
};