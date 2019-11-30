/**
 * Created by NghiaTM on 1/18/2016.
 */

var AgentGroupsSchema = new mongoose.Schema({
    idParent: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'Company'},
    name: {type: String, default: '', required: true, unique: true},
    idProfile: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'GroupProfile'}, //Call
    idProfileChat: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'GroupProfileChat'}, //Chat
    idProfileMail: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'GroupProfileMail'},//Mail
    createBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'},
    agentStatus: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'AgentStatus'},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

var manager = require(path.join(_rootPath, 'monitor', 'manager.js'));
var syncAcd = require(path.join(_rootPath, 'monitor', 'sync-acd.js'));

AgentGroupsSchema.statics.createNew = function (obj, cb) {
    var AgentGroup = mongoose.model('AgentGroups');
    var ag = new AgentGroup(obj);
    ag.save(function (err) {
        if (err) {
            console.log(25, err);
            cb(err)
        } else {
            var Users = mongoose.model('User');

            _async.parallel([
                function (callback) {
                    Users.find({_id: {$in: obj.leaders}}, function (err2, users) {
                        //console.log(38, err2, users)
                        if (_.isNull(err2)) {

                            mongodb.MongoClient.connect(_dbPath, function (err3, db) {
                                if (err3) return callback(err3);
                                var batch = db.collection('users').initializeUnorderedBulkOp({useLegacyOps: true});

                                _.each(users, function (user) {
                                    //console.log(45, user);
                                    var _u = user.toObject();
                                    var g = _.pluck(_u.agentGroupLeaders, 'group');
                                    if (_.contains(g, ag._id)) {
                                    } else {
                                        //console.log(50)
                                        var group = {
                                            group: ag._id,
                                            role: new mongoose.Types.ObjectId("56ccdf99031ce3e32a48f5d8")
                                        };
                                        //console.log(52,group);
                                        _u.agentGroupLeaders.push(group);
                                        var abc = _u.agentGroupLeaders
                                        //console.log(53, _u.agentGroupLeaders)
                                        //console.log(54, _u)

                                        batch.find({_id: _u._id}).update({$set: {agentGroupLeaders: _u.agentGroupLeaders}});
                                    }
                                })


                                batch.execute(function (error, result) {
                                    db.close();
                                    if (error) return callback(error);
                                    callback(null, _.pluck(users, "_id"));
                                });

                            });
                        } else {
                            callback(err)
                        }

                    })
                },
                function (callback) {
                    Users.find({_id: {$in: obj.members}}, function (err2, users) {
                        //console.log(38, err, users)
                        if (_.isNull(err2)) {

                            mongodb.MongoClient.connect(_dbPath, function (err3, db) {
                                if (err3) return cb(err3);
                                var batch = db.collection('users').initializeUnorderedBulkOp({useLegacyOps: true});
                                _.each(users, function (user) {
                                    //console.log(45, user);
                                    var _u = user.toObject();
                                    var g = _.pluck(_u.agentGroupMembers, 'group');
                                    if (_.contains(g, ag._id)) {
                                    } else {
                                        //console.log(50)
                                        var group = {
                                            group: ag._id,
                                            role: new mongoose.Types.ObjectId("56ccdf99031ce3e32a48f5d9")
                                        };
                                        //console.log(52,group);
                                        _u.agentGroupMembers.push(group);
                                        var abc = _u.agentGroupMembers
                                        //console.log(53, _u.agentGroupLeaders)
                                        //console.log(54, _u)
                                        batch.find({_id: _u._id}).update({$set: {agentGroupMembers: _u.agentGroupMembers}});
                                    }
                                })
                                batch.execute(function (error, result) {
                                    db.close();
                                    if (error) return callback(error);
                                    callback(null, _.pluck(users, "_id"));
                                });

                            });
                        } else {
                            callback(err2)
                        }

                    })
                }
            ], function (err1, result) {
                manager.addGroup(ag._id);
                _async.eachSeries(_.union(result[0], result[1]), function (userId, callback) {
                    _.pushNotification(2, '', userId);
                    if(_socketUsers[userId.toString()]){
                        var monitor = _socketUsers[userId.toString()].monitor;
                        syncAcd.syncAgent(userId.toString());
                        monitor.groupUpdate(callback);
                    }else{
                        callback(null);
                    }
                }, function (err) {

                });

                QUEUE_TernalPublish.queueUpdate('Users', _.union(result[0], result[1]));
                _.genTree();
                cb(err1);
            })

        }
    })
}

AgentGroupsSchema.statics.deleteGroups = function (ids, cb) {
    console.log(126, ids);
    var updateUsers = [];
    _async.waterfall([
        function(callback){
            mongoose.model('AgentGroups').find({_id: {$in : ids}}, {idParent: 1, name: 1}, function(err, result){
                if (err) return callback(err);

                var abc = _.find(result, function(item){
                    return !_.isEmpty(item.idParent);
                });

                if (!_.isEmpty(abc)){
                    return callback('Nhóm ' + abc.name + ' đang làm việc trong công ty. Không thể xoá nhóm này');
                }

                callback(null);
            })
        },
        function(callback){
            mongoose.model('AgentGroups').remove({_id: {$in: ids}}, function (err) {
                if (err) return cb(err);
                _.each(ids, function(groupId){
                    manager.removeGroup(groupId.toString());
                });

                var myIds = _.map(ids, function(item){
                    return _.convertObjectId(item);
                });

                _Users.find({
                    $or: [
                        {'agentGroupLeaders.group' : {$in: myIds}},
                        {'agentGroupMembers.group' : {$in: myIds}}
                    ]
                }, function (err1, users) {
                    console.log(157, users);
                    mongodb.MongoClient.connect(_dbPath, function (err2, db) {
                        if (err2) return callback(err2);

                        var batch = db.collection('users').initializeUnorderedBulkOp({useLegacyOps: true});
                        _async.each(users, function (user, callback) {
                            var _user = user.toObject();
                            var arrLeaders = JSON.parse(JSON.stringify(_user.agentGroupLeaders));
                            var leaders = _.pluck(arrLeaders, "group");
                            var is = _.intersection(leaders, ids);
                            if (is.length > 0) {
                                var nLeaders = _.reject(_user.agentGroupLeaders, function (l) {
                                    if (_.contains(is, l.group.toString())) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });
                                batch.find({_id: _user._id}).update({$set: {agentGroupLeaders: nLeaders}});
                            }
                            var arrMembers = JSON.parse(JSON.stringify(_user.agentGroupMembers));
                            var members = _.pluck(arrMembers, "group");
                            var is1 = _.intersection(members, ids);
                            if (is1.length > 0) {
                                var nMembers = _.reject(_user.agentGroupMembers, function (l) {
                                    if (l.group && _.contains(is1, l.group.toString())) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });

                                batch.find({_id: _user._id}).update({$set: {agentGroupMembers: nMembers}});
                            }
                            if(_socketUsers[_user._id.toString()]) {
                                updateUsers.push(_user._id.toString());
                            }
                            callback();
                        }, function (err3) {
                            if (err3) return callback(err);
                            if (batch.s.currentIndex == 0) return callback(null);

                            batch.execute(function (err4) {
                                db.close();
                                QUEUE_TernalPublish.queueUpdate('Users', _.pluck(users, "_id"));
                                _.genTree();
                                _async.eachSeries(updateUsers, function (userId, next) {
                                    var monitor = _socketUsers[userId.toString()].monitor;
                                    syncAcd.syncAgent(userId.toString());
                                    if(monitor){
                                        monitor.groupUpdate(next);
                                    }else {
                                        next(null)
                                    }
                                }, function (err) {

                                });
                                callback(err4);
                            })
                        });
                    });
                });
            })
        }
    ], cb);
};

AgentGroupsSchema.statics.updateGroups = function (obj, cb) {

    //console.log(191,obj);

    mongoose.model('AgentGroups').aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(obj._id)}},
        {$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupLeaders.group', as: 'leaders'}},
        {$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupMembers.group', as: 'members'}}
    ]).exec(function (err, result) {
        if (err) return cb(err);
        if (result.length == 0) return cb()

        var addAgents = [];

        mongodb.MongoClient.connect(_dbPath, function (err1, db) {
            if (err1) return cb(err1);
            var batch = db.collection('users').initializeOrderedBulkOp({useLegacyOps: true});
            var batchCount = 0;
            _async.parallel([
                function (callback) {
                    //console.log(200, result[0])
                    var oldLeadersArr = JSON.parse(JSON.stringify(_.pluck(result[0].leaders, '_id')));
                    //console.log(201, oldLeadersArr, obj.leaders);
                    var changeUserArr = oldLeadersArr.length > obj.leaders.length ? _.difference(oldLeadersArr, obj.leaders) : _.difference(obj.leaders, oldLeadersArr);
                    //console.log(202, changeUserArr);

                    mongoose.model('User').find({_id: {$in: _.arrayObjectId(changeUserArr)}}, function (err2, changeUsers) {
                        //console.log(206, err2, changeUsers)
                        if (err2) return callback(err2);
                        _.each(changeUsers, function (userId) {
                            var sUser = _.find(changeUsers, function (u) {
                                //console.log(211, u._id.toString(), userId._id.toString())
                                return _.isEqual(u._id.toString(), userId._id.toString());
                            })
                            //console.log(213, sUser)
                            var nLeaders = [];
                            if (_.contains(oldLeadersArr, userId._id.toString())) {
                                nLeaders = _.chain(sUser.agentGroupLeaders).map(function (item) {
                                    var newItem = item.toObject();
                                    newItem.group = new mongoose.Types.ObjectId(newItem.group);
                                    return newItem;
                                }).reject(function (u) {
                                    //console.log(214, _.isEqual(u.group.toString(), result[0]._id.toString()), u.group.toString(),result[0]._id)
                                    return (_.isEqual(u.group.toString(), result[0]._id.toString())) ? true : false;
                                }).value();
                                //console.log(224, nLeaders)
                            }
                            if (_.contains(obj.leaders, userId._id.toString())) {
                                nLeaders = _.chain(sUser.agentGroupLeaders).map(function (item) {
                                    return item.toObject();
                                }).value();
                                nLeaders.push({
                                    group: new mongoose.Types.ObjectId(obj._id),
                                    role: new mongoose.Types.ObjectId("56ccdf99031ce3e32a48f5d8")
                                });
                                addAgents.push(userId._id.toString());
                                //console.log(231, nLeaders, sUser.agentGroupLeaders)
                            }
                            //console.log(233, nLeaders)
                            try {
                                batch.find({_id: new mongoose.Types.ObjectId(userId._id)}).update({$set: {agentGroupLeaders: nLeaders}})
                                batchCount++;
                            } catch (exErr) {
                                //console.log(239, "agentgroups modal",exErr);
                            }

                        })
                        callback(null, changeUserArr)
                    })


                },
                function (callback) {
                    //console.log(200, result[0])
                    var oldLeadersArr = JSON.parse(JSON.stringify(_.pluck(result[0].members, '_id')));
                    //console.log(201, oldLeadersArr, obj.members);
                    var changeUserArr = oldLeadersArr.length > obj.members.length ? _.difference(oldLeadersArr, obj.members) : _.difference(obj.members, oldLeadersArr);
                    //console.log(202, changeUserArr, _.arrayObjectId(changeUserArr));

                    mongoose.model('User').find({_id: {$in: _.arrayObjectId(changeUserArr)}}, function (err2, changeUsers) {
                        //console.log(206, err2, changeUsers)
                        if (err2) return callback(err2);
                        _.each(changeUsers, function (userId) {
                            var sUser = _.find(changeUsers, function (u) {
                                //console.log(211, u._id.toString(), userId._id.toString())
                                return _.isEqual(u._id.toString(), userId._id.toString());
                            })
                            //console.log(213, sUser)
                            var nLeaders = [];
                            if (_.contains(oldLeadersArr, userId._id.toString())) {
                                nLeaders = _.chain(sUser.agentGroupMembers).map(function (item) {
                                    var newItem = item.toObject();
                                    newItem.group = new mongoose.Types.ObjectId(newItem.group);
                                    return newItem;
                                }).reject(function (u) {
                                    //console.log(214, _.isEqual(u.group.toString(), result[0]._id.toString()), u.group.toString(),result[0]._id)
                                    return (_.isEqual(u.group.toString(), result[0]._id.toString())) ? true : false;
                                }).value();
                            }
                            if (_.contains(obj.members, userId._id.toString())) {

                                nLeaders = _.chain(sUser.agentGroupMembers).map(function (item) {
                                    return item.toObject();
                                }).value();
                                nLeaders.push({
                                    group: new mongoose.Types.ObjectId(obj._id),
                                    role: new mongoose.Types.ObjectId("56ccdf99031ce3e32a48f5d9")
                                });
                                addAgents.push(userId._id.toString());
                                //console.log(223, nLeaders, sUser.agentGroupMembers)
                            }
                            //console.log(279, nLeaders)
                            try {
                                batch.find({_id: new mongoose.Types.ObjectId(userId._id)}).update({$set: {agentGroupMembers: nLeaders}})
                                batchCount++;
                            } catch (exErr) {
                                //console.log(274, "agentgroups modal",exErr);
                            }
                        })
                        callback(null, changeUserArr);
                    })
                }
            ], function (err2, result) {
                if (err2) return cb(err2)
                if (batchCount > 0) {
                    batch.execute(function (err3) {
                        //console.log(286, 'close db');
                        db.close();
                        if (err3) return cb(err3);

                        QUEUE_TernalPublish.queueUpdate('Users', _.union(result[0], result[1]));

                        mongoose.model('AgentGroups').update({_id: obj._id}, obj, function (err4) {
                            _.each(addAgents, function(notifiAgent){
                                _.pushNotification(2, '', notifiAgent);
                            });

                            _async.eachSeries(_.union(result[0], result[1]), function (userId, callback) {
                                if(_socketUsers[userId.toString()]){
                                    var monitor = _socketUsers[userId.toString()].monitor;
                                    syncAcd.syncAgent(userId.toString());
                                    if(monitor) monitor.groupUpdate(callback);
                                }else{
                                    callback(null);
                                }
                            }, function (err) {
                                mongoose.model('AgentGroups').findById(obj._id, function(err, result){
                                    if(result) manager.updateGroup(result);
                                })
                            });
                            //console.log(err4)
                            cb(err4);
                        })
                    })
                } else {
                    db.close();
                    //console.log(294,'close db');
                    mongoose.model('AgentGroups').update({_id: obj._id}, obj, function (err4) {
                        mongoose.model('AgentGroups').findById(obj._id, function(err, result){
                            if(result) manager.updateGroup(result);
                        })
                        //console.log(err4)
                        _.genTree();
                        cb(err4);
                    })
                }

            })
        })

    })
}

AgentGroupsSchema.set('toJSON', {getters: true});
AgentGroupsSchema.plugin(require('mongoose-aggregate-paginate'));
module.exports = mongoose.model('AgentGroups', AgentGroupsSchema);