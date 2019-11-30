var requestUser = require(path.join(_rootPath, 'queue', 'common', 'request-users.js'));
var syncAcd = require(path.join(_rootPath, 'monitor', 'sync-acd.js'));
var manager = require(path.join(_rootPath, 'monitor', 'manager.js'));

// GET
exports.index = {
    json: function (req, res) {
        var _query = req.query;
        //_query = param nhận được theo query string
        _Users.find(_query, function (error, users) {
            res.json(users);
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var agg = _Users.aggregate();

        if (_.has(req.query, 'sort')) {
            var sortArr = req.query.sort.split(':');
            var sortObj = {};
            sortObj[sortArr[0]] = _.isEqual(sortArr[1], 'asc') ? 1 : -1;
            agg._pipeline.push({$sort: sortObj});
            delete req.query.sort;
        }

        if (_.has(req.query, 'status')) {
            if (!_.isEqual(req.query.status, '2')) agg._pipeline.push({$match: {status: parseInt(req.query.status)}});
            delete req.query.status;
        }

        _.allKeys(req.query).forEach(function (el) {
            if (_.isEqual(el, 'page') || _.isEqual(el, 'rows')) return;
            var matchObj = {};
            matchObj[el] = {$regex: new RegExp(_.stringRegex(req.query[el]), 'i')};
            agg._pipeline.push({$match: matchObj});
        });

        _Users.aggregatePaginate(agg, {
            page: page,
            limit: rows
        }, function (error, users, node, count) {
            var paginator = new pagination.SearchPaginator({
                prelink: '/users',
                current: page,
                rowsPerPage: rows,
                totalResult: count
            });
            _.render(req, res, 'users',
                {
                    title: 'Danh sách người dùng',
                    myUser: users,
                    paging: paginator.getPaginationData(),
                    plugins: [['bootstrap-select']]
                }, true, error
            );
        });
    }
};

// POST
exports.create = function (req, res) {
    if (!_.has(req.body, 'uId')) return res.json({code: 500, message: 'UserID không hợp lệ'});

    var uid = req.body.uId;
    if (!mongodb.ObjectID.isValid(uid)) uid = uid.split(',');

    requestUser.RequestAddUser(uid,
        function () {
            res.locals._url = req.originalUrl;
            var err = new Error('Request Timeout !');
            res.render('500', {message: err.message});
        },
        function (obj) {
            var err = obj['error'];
            var result = obj['result'];
            res.json({code: err ? 500 : 200, message: err ? err.message : result});
        });
};

exports.new = function (req, res) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

    requestUser.RequestUser(page, rows, req.query,
        function () {
            res.locals._url = req.originalUrl;
            var err = new Error('Request Timeout !');
            res.render('500', {message: err.message});
        },
        function (result) {
            var paging = null;
            if (!!result && !!result.count) {
                paging = new pagination.SearchPaginator({
                    prelink: '/users/new',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: result.count
                }).getPaginationData();
            }

            _.render(req, res, 'users-new', {
                title: 'Thêm mới người dùng vào dự án',
                myUser: result.users,
                paging: paging,
            }, true, result.error);
        });
};
// GET : http://domain.com/users/:_id/edit
exports.edit = function (req, res) {
    if (!mongodb.ObjectID.isValid(req.params.user)) return res.render('404', {title: '404 | Page not found'});
    _Users.findById(req.params.user, function (err, user) {
        if (err) return res.json({code: 500, message: err});
        _async.parallel({
            role: function (callback) {
                _Role.aggregate([
                    {$match: {status: 1}},
                    {$sort: {weight: 1}},
                    {
                        $group: {
                            _id: '$roleGroup',
                            name: {$first: '$name'},
                            role: {$push: {roleId: '$_id', name: '$name'}}
                        }
                    }
                ], callback)
            },
            company: function (callback) {
                _Company.aggregate([
                    {$match: {status: 1}},
                    {$lookup: {from: 'agentgroups', localField: '_id', foreignField: 'idParent', as: 'ag'}},
                    {$unwind: {path: "$ag", preserveNullAndEmptyArrays: true}},
                    {$group: {_id: '$_id', name: {$first: '$name'}, ag: {$push: {_id: '$ag._id', name: '$ag.name'}}}}
                ], function (err, company) {
                    function convertArrayToDict(arr, key, val) {
                        var tmp = {};
                        for (var i = 0; i < arr.length; i++) tmp[arr[i][key]] = arr[i][val];
                        return tmp;
                    }

                    var cl = convertArrayToDict(user.companyLeaders, 'company', 'role');
                    var qa = convertArrayToDict(user.qaMembers, 'company', 'role');
                    var agl = convertArrayToDict(user.agentGroupLeaders, 'group', 'role');
                    var agm = convertArrayToDict(user.agentGroupMembers, 'group', 'role');
                    var rr = [];
                    _.each(company, function (el) {
                        if ((!_.isUndefined(cl[el._id.toString()]))) el['role'] = cl[el._id.toString()];
                        if (!_.isUndefined(qa[el._id.toString()])) el['role'] = qa[el._id.toString()];
                        var ag = _.reduce(el.ag, function (memo, item) {
                            if (_.isEmpty(item) || item.status < 1) return memo;
                            item['role'] = _.isEmpty(agl[item._id.toString()]) ? agm[item._id.toString()] : agl[item._id.toString()];
                            memo.push(item);
                            return memo;
                        }, []);
                        el['ag'] = ag;
                        rr.push(el);
                    });
                    callback(null, rr);
                });
            }
        }, function (err, result) {
            user = user.toObject();
            _.each(user.ternalLeaders, function (item) {
                if (_.isEqual(item.ternal.toString(), _config.app._id)) user['ternalLeaders'] = item.role;
            });
            _.each(user.qaLeaders, function (item) {
                if (_.isEqual(item.ternal.toString(), _config.app._id)) user['qaLeaders'] = item.role;
            });
            _.render(req, res, 'users-edit', {
                title: 'Chỉnh sửa người dùng',
                myUser: user,
                role: result.role,
                myCompany: result.company,
                plugins: [['chosen']]
            }, !_.isNull(result), err);
        });
    });
};

exports.show = {
    json: function (req, res) {
        _Users.findOneAndUpdate( req.params.user,_.chain(req.body), {new: true},function (error, result){

        });
    },

    html: function (req, res) {
        var _roleCompany = [], _roleTernal = [], _roleMember = [], _roleLeaders = [],
            _companies = [], _agentGroupLeaders = [], _agentGroupMembers = [], _roleQALeaders = [], _roleQAMembers = [];
        _Users.findById(req.params.user, function (err, r) {
            _.each(r.ternalLeaders, function (loop) {
                _roleTernal.push(loop.role);
            });
            _.each(r.companyLeaders, function (loop) {
                _roleCompany.push(loop.role);
            });
            _.each(r.agentGroupMembers, function (loop) {
                _roleMember.push(loop.role);
            });
            _.each(r.agentGroupLeaders, function (loop) {
                _roleLeaders.push(loop.role);
            });
            _.each(r.companyLeaders, function (loop) {
                _companies.push(loop.company);
            });
            _.each(r.agentGroupLeaders, function (loop) {
                _agentGroupLeaders.push(loop.group);
            });
            _.each(r.agentGroupMembers, function (loop) {
                _agentGroupMembers.push(loop.group);
            });

            _async.parallel({
                roleTernal: function (next) {
                    if (_roleTernal.length > 0) {
                        _Role.find({_id: {$in: _.convertObjectId(_roleTernal)}}, next);
                    }
                    else {

                        next(null, []);
                    }
                },
                roleCompany: function (next) {
                    if (_roleCompany.length > 0) {
                        _Role.find({_id: {$in: _.convertObjectId(_roleCompany)}}, next);
                    }
                    else {
                        next(null, []);
                    }
                },
                roleMember: function (next) {
                    if (_roleMember.length > 0) {
                        _Role.find({_id: {$in: _.convertObjectId(_roleMember)}}, next);
                    }
                    else {
                        next(null, []);
                    }
                },
                roleLeaders: function (next) {
                    if (_roleLeaders.length > 0) {
                        _Role.find({_id: {$in: _.convertObjectId(_roleLeaders)}}, next);
                    }
                    else {
                        next(null, []);
                    }
                },
                companies: function (next) {
                    if (_companies.length > 0) {
                        _Company.find({_id: {$in: _.convertObjectId(_companies)}}, next);
                    }
                    else {
                        next(null, []);
                    }
                },
                agentGroupLeaders: function (next) {
                    if (_agentGroupLeaders.length > 0) {
                        _AgentGroups.find({_id: {$in: _.convertObjectId(_agentGroupLeaders)}}, next);
                    }
                    else {
                        next(null, []);
                    }
                },
                agentGroupMembers: function (next) {
                    if (_agentGroupMembers.length > 0) {
                        _AgentGroups.find({_id: {$in: _.convertObjectId(_agentGroupMembers)}}, next);
                    }
                    else {
                        next(null, []);
                    }
                }
            }, function (err, result) {
                if (err) return res.render('404', {title: '404 | Page not found'});
                //binding dữ liệu xuống view thông qua
                //nếu ko tìm thấy sẽ trả về trang 404 thông qua  !_.isNull(user)
                _.render(req, res, 'users-detail', {
                        title: 'Thông tin chi tiết',
                        currentUser: r,
                        roleTernal: result.roleTernal,
                        roleCompany: result.roleCompany,
                        roleMember: result.roleMember,
                        roleLeaders: result.roleLeaders,
                        companies: result.companies,
                        agentGroupLeaders: result.agentGroupLeaders,
                        agentGroupMembers: result.agentGroupMembers,
                        config: _config
                    },
                    !_.isNull(result.currentUser), err);
            })
        })
    }
};
// PUT : http://domain.com/users/:_id
exports.update = function (req, res) {
    console.log(294, req.body);
    if (_.has(req.body, 'notifAdnim') && _.isEqual(req.body['notifAdnim'], 'on')) req.body['notifAdnim'] = 1;
    if (_.has(req.body, 'notifAssign') && _.isEqual(req.body['notifAssign'], 'on')) req.body['notifAssign'] = 1;
    req.body['notifAdnim'] = _.has(req.body,'notifAdnim') ? req.body['notifAdnim'] : 0;
    req.body['notifAssign'] = _.has(req.body,'notifAssign') ? req.body['notifAssign'] : 0;
    if(_.has(req.body, "notifDeadline")){
        _Users.findOneAndUpdate({_id: req.params.user}, {
            $set: {
                notifDeadline: req.body.notifDeadline,
                notifDelay: req.body.notifDelay,
                notifAssign: req.body.notifAssign,
                notifAdnim: req.body.notifAdnim,
                mailNotification: req.body.mailNotification,
            }
        }, {new: true},function (error,result) {
            res.json({code: error ? 500 : 200, message: error ? error : result})
        });
    }
    else{
        req.body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
        _async.waterfall([
            function updateUser(callback) {
                _Users.findOneAndUpdate({_id: req.params.user}, {
                    $set: {
                        password: req.body.password,
                        displayName: req.body.displayName,
                        status: parseInt(req.body.status),
                        email: req.body.email
                    }
                }, {new: true}, callback);
            },
            function updateRole(user, callback) {
                mongodb.MongoClient.connect(_dbPath, function (err, db) {
                    if (err) return err;
                    var batch = db.collection('users').initializeUnorderedBulkOp({useLegacyOps: true});
                    var currentCL = _.map(_.pluck(user.companyLeaders, 'company'), function (item) {
                        return item.toString();
                    });
                    var currentAGL = _.map(_.pluck(user.agentGroupLeaders, 'group'), function (item) {
                        return item.toString();
                    });
                    var currentAGM = _.map(_.pluck(user.agentGroupMembers, 'group'), function (item) {
                        return item.toString();
                    });
                    var currentTL = _.map(_.pluck(user.ternalLeaders, 'ternal'), function (item) {
                        return item.toString();
                    });
                    var currentQAL = _.map(_.pluck(user.qaLeaders, 'ternal'), function (item) {
                        return item.toString();
                    });
                    var currentQAC = _.map(_.pluck(user.qaMembers, 'company'), function (item) {
                        return _.isUndefined(item) ? null : item.toString();
                    });
                    var currentQAT = _.map(_.pluck(user.qaMembers, 'ternal'), function (item) {
                        return _.isUndefined(item) ? null : item.toString();
                    });
                    if (_.has(req.body, 'pmRole') && !_.isEqual(req.body.pmRole, '')) {
                        var pmRole = req.body.pmRole.split('-'); // 0 : Role ---- 1 : TenantId
                        if (_.isEqual(pmRole[0], '57616fd29b57eab0149975d2')){
                            //QA Leader
                            if (_.indexOf(currentQAL, pmRole[1]) < 0) {
                                if (mongodb.ObjectID.isValid(pmRole[0]) && mongodb.ObjectID.isValid(pmRole[1])) {
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $addToSet: {
                                                qaLeaders: {
                                                    ternal: new mongodb.ObjectID(pmRole[1]),
                                                    role: new mongodb.ObjectID(pmRole[0])
                                                }
                                            }
                                        });
                                    batch
                                        .find({_id: user._id})
                                        .updateOne(
                                        {
                                            $pull: {
                                                ternalLeaders: {
                                                    ternal: new mongodb.ObjectID(pmRole[1])
                                                }
                                            }
                                        }
                                    );
                                    batch
                                        .find({_id: user._id})
                                        .updateOne(
                                        {
                                            $pull: {
                                                qaMembers: {
                                                    ternal: new mongodb.ObjectID(pmRole[1])
                                                }
                                            }
                                        }
                                    );
                                }
                            }
                        }
                        else if (_.isEqual(pmRole[0], '575fcbdeae34bf7c1064e631')){
                            //QA
                            if (_.indexOf(currentQAT, pmRole[1]) < 0) {
                                if (mongodb.ObjectID.isValid(pmRole[0]) && mongodb.ObjectID.isValid(pmRole[1])) {
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $addToSet: {
                                                qaMembers: {
                                                    ternal: new mongodb.ObjectID(pmRole[1]),
                                                    role: new mongodb.ObjectID(pmRole[0])
                                                }
                                            }
                                        }
                                    );
                                    batch
                                        .find({_id: user._id})
                                        .updateOne(
                                        {
                                            $pull: {
                                                qaMembers: {
                                                    company: {
                                                        $ne: null
                                                    }
                                                }
                                            }
                                        }
                                    );
                                    batch
                                        .find({_id: user._id})
                                        .updateOne(
                                        {
                                            $pull: {
                                                ternalLeaders: {
                                                    ternal: new mongodb.ObjectID(pmRole[1])
                                                }
                                            }
                                        }
                                    );
                                    batch
                                        .find({_id: user._id})
                                        .updateOne(
                                        {
                                            $pull: {
                                                qaLeaders: {
                                                    ternal: new mongodb.ObjectID(pmRole[1])
                                                }
                                            }
                                        }
                                    );
                                }
                            }
                        }
                        else{
                            if (_.indexOf(currentTL, pmRole[1]) >= 0) {
                                var obj = {};
                                obj['ternalLeaders.$.role'] = new mongodb.ObjectID(pmRole[0]);
                                batch
                                    .find({'ternalLeaders.ternal': new mongodb.ObjectID(pmRole[1]), _id: user._id})
                                    .updateOne({$set: obj});
                            } else {
                                if (mongodb.ObjectID.isValid(pmRole[0]) && mongodb.ObjectID.isValid(pmRole[1])) {
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $addToSet: {
                                                ternalLeaders: {
                                                    ternal: new mongodb.ObjectID(pmRole[1]),
                                                    role: new mongodb.ObjectID(pmRole[0])
                                                }
                                            }
                                        })
                                }
                            }
                            batch
                                .find({_id: user._id})
                                .updateOne(
                                {
                                    $pull: {
                                        qaMembers: {
                                            ternal: new mongodb.ObjectID(pmRole[1])
                                        }
                                    }
                                }
                            );
                            batch
                                .find({_id: user._id})
                                .updateOne(
                                {
                                    $pull: {
                                        qaLeaders: {
                                            ternal: new mongodb.ObjectID(pmRole[1])
                                        }
                                    }
                                }
                            );
                        }
                    } else {
                        batch.find({_id: user._id}).updateOne({$pull: {ternalLeaders: {ternal: new mongodb.ObjectID(_config.app._id)}}});
                        batch.find({_id: user._id}).updateOne({$pull: {qaLeaders: {ternal: new mongodb.ObjectID(_config.app._id)}}});
                        batch.find({_id: user._id}).updateOne({$pull: {qaMembers: {ternal: new mongodb.ObjectID(_config.app._id)}}});
                    }

                    if (_.has(req.body, 'clRole')) {
                        req.body.clRole.forEach(function (el, index) {
                            var tmp = el.split('-');
                            var roleId = tmp[0];
                            var newCompanyId = tmp[1];
                            if (_.isEqual(roleId, '575fcbdeae34bf7c1064e631')){
                                //QA
                                if (_.indexOf(currentQAC, newCompanyId) < 0) {
                                    if (!mongodb.ObjectID.isValid(roleId) || !mongodb.ObjectID.isValid(newCompanyId)) return;
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $addToSet: {
                                                qaMembers: {
                                                    company: new mongodb.ObjectID(newCompanyId),
                                                    role: new mongodb.ObjectID(roleId)
                                                }
                                            }
                                        });
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $pull: {
                                                qaMembers: {
                                                    ternal: {
                                                        $ne: null
                                                    }
                                                }
                                            }
                                        });
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $pull: {
                                                companyLeaders: {
                                                    company: new mongodb.ObjectID(newCompanyId)
                                                }
                                            }
                                        });
                                }
                            }
                            else{
                                if (_.indexOf(currentCL, newCompanyId) >= 0) {
                                    var obj = {};
                                    obj['companyLeaders.$.role'] = new mongodb.ObjectID(roleId);
                                    batch
                                        .find({'companyLeaders.company': new mongodb.ObjectID(newCompanyId), _id: user._id})
                                        .updateOne({$set: obj});
                                } else {
                                    if (!mongodb.ObjectID.isValid(roleId) || !mongodb.ObjectID.isValid(newCompanyId)) return;
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $addToSet: {
                                                companyLeaders: {
                                                    company: new mongodb.ObjectID(newCompanyId),
                                                    role: new mongodb.ObjectID(roleId)
                                                }
                                            }
                                        });
                                }
                                batch
                                    .find({_id: user._id})
                                    .updateOne({
                                        $pull: {
                                            qaMembers: {
                                                company: new mongodb.ObjectID(newCompanyId)
                                            }
                                        }
                                    });
                            }
                            currentCL = _.without(currentCL, newCompanyId);
                            currentQAC = _.without(currentQAC, newCompanyId);
                        });
                    }

                    if (_.has(req.body, 'agRole')) {
                        req.body.agRole.forEach(function (el, index) {
                            var tmp = el.split('-');
                            var roleId = tmp[0];
                            var agId = tmp[1];
                            if (parseInt(tmp[2]) === 4) {
                                // ag leader
                                if (_.indexOf(currentAGL, agId) >= 0) {
                                    var obj = {};
                                    obj['agentGroupLeaders.$.role'] = new mongodb.ObjectID(roleId);
                                    batch
                                        .find({'agentGroupLeaders.group': new mongodb.ObjectID(agId), _id: user._id})
                                        .updateOne({$set: obj});
                                } else {
                                    if (!mongodb.ObjectID.isValid(roleId) || !mongodb.ObjectID.isValid(agId)) return;
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $addToSet: {
                                                agentGroupLeaders: {
                                                    group: new mongodb.ObjectID(agId),
                                                    role: new mongodb.ObjectID(roleId)
                                                }
                                            }
                                        });
                                }
                                currentAGL = _.without(currentAGL, agId);
                            } else {
                                if (_.indexOf(currentAGM, agId)>=0) {
                                    var obj = {};
                                    obj['agentGroupMembers.$.role'] = new mongodb.ObjectID(roleId);
                                    batch
                                        .find({'agentGroupMembers.group': new mongodb.ObjectID(agId), _id: user._id})
                                        .updateOne({$set: obj});
                                } else {
                                    if (!mongodb.ObjectID.isValid(roleId) || !mongodb.ObjectID.isValid(agId)) return;
                                    batch
                                        .find({_id: user._id})
                                        .updateOne({
                                            $addToSet: {
                                                agentGroupMembers: {
                                                    group: new mongodb.ObjectID(agId),
                                                    role: new mongodb.ObjectID(roleId)
                                                }
                                            }
                                        });
                                }
                                currentAGM = _.without(currentAGM, agId);
                            }
                        });
                    }

                    currentCL.forEach(function (item) {
                        batch.find({_id: user._id}).updateOne({$pull: {companyLeaders: {company: new mongodb.ObjectID(item)}}});
                    });
                    currentAGL.forEach(function (item) {
                        batch.find({_id: user._id}).updateOne({$pull: {agentGroupLeaders: {group: new mongodb.ObjectID(item)}}});
                    });
                    currentAGM.forEach(function (item) {
                        batch.find({_id: user._id}).updateOne({$pull: {agentGroupMembers: {group: new mongodb.ObjectID(item)}}});
                    });
                    currentQAC.forEach(function (item) {
                        if (!_.isNull(item)) batch.find({_id: user._id}).updateOne({$pull: {qaMembers: {company: new mongodb.ObjectID(item)}}});
                    });

                    if (batch.s.currentIndex == 0) {
                        db.close();
                        return callback(null, user._id);
                    }
                    batch.execute(function (error, result) {
                        db.close();
                        callback(error, user._id);
                    });
                });
            }
        ], function (err, userId) {
            if (!err) {
                QUEUE_TernalPublish.queueUpdate('Users', req.params.user);
                _async.waterfall([
                    function (next) {
                        if(_socketUsers[userId.toString()] && _socketUsers[userId.toString()].monitor){
                            var monitor = _socketUsers[userId.toString()].monitor;
                            syncAcd.syncAgent(userId.toString());
                            monitor.groupUpdate(function(err2){
                                next(err2);
                            });
                        }else {
                            next(null);
                        }
                    },
                    function(next){
                        _Users.findById(userId, next);
                    },
                    function(user, next){
                        _AgentGroups.find({_id: {$in: _.pluck(_.union(user.agentGroupLeaders, user.agentGroupMembers),'group')}}, next);
                    }
                ],function(err2, groups){
                    _.each(groups, function(group){
                        manager.updateGroup(group);
                    });
                });
            }
            res.json({code: err ? 500 : 200, message: err ? err : userId})
        });
    }
};

exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value();
    _Users
        .findOne(_query).exec(function (error, result) {
        res.json([req.query.fieldId, _.isNull(result)]);
    });
};

exports.search = function (req, res) {
    var __query = {};
    if (_.has(req.query, 'name')) __query['name'] = {$regex: new RegExp(_.stringRegex(req.query.name), 'i')};
    if (_.has(req.query, 'displayName')) __query['displayName'] = {$regex: new RegExp(_.stringRegex(req.query.displayName), 'i')};
    if (_.has(req.query, 'email')) __query['email'] = {$regex: new RegExp(_.stringRegex(req.query.email), 'i')};
    if (_.has(req.query, 'status') && !_.isEqual(parseInt(req.query.status), 2)) __query['status'] = parseInt(req.query.status);

    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
    _Users
        .find(__query)
        .sort(createSortObj(req))
        .paginate(page, rows, function (error, result, pageCount) {
            var paginator = new pagination.SearchPaginator({
                prelink: '/users',
                current: page,
                rowsPerPage: rows,
                totalResult: pageCount
            });

            _.render(req, res, 'users', {
                    title: 'Tạo mới người dùng',
                    myUser: result,
                    paging: paginator.getPaginationData(),
                    plugins: [['bootstrap-select']]
                }, true, error
            );
        });
};

////DELETE http://domain.com/users/:_id
//exports.destroy = function (req, res) {
//    _Users.findByIdAndRemove(req.params.user, function (error, user) {
//        res.json(user);
//    });
//};
function createSortObj(req) {
    var sortData = ['sortName', 'sortDisplayName', 'sortEmail'];
    var sortColumn = ['name', 'displayName', 'email'];
    var sortObj = {};

    sortData.forEach(function (el, index) {
        if (_.has(req.query, el)) {
            switch (req.query[el]) {
                case 'asc':
                    sortObj[sortColumn[index]] = 1;
                    break;
                case 'desc':
                    sortObj[sortColumn[index]] = -1;
                    break;
            }
        }
    });

    return sortObj;
}