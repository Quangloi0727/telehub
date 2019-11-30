/**
 * Created by luongvanlam on 2/25/16.
 */
var _pluralize = require('pluralize');
var ACTION = {
    ADD: 1,
    UPDATE: 2,
    REMOVE: 3,
    SYNC: 90,
    OVERRIDE: 99
};

function addData(modalName, object) {
    mongodb.MongoClient.connect(_dbPath, function (err, db) {
        if (err) return err;
        var batchIndex = 0;
        var batch = db.collection(_pluralize.plural(modalName.toLowerCase())).initializeUnorderedBulkOp({useLegacyOps: true});
        _.each(object, function (item, index) {
            batchIndex++;
            batch.insert(item);
        });
        if (batchIndex == 0) return db.close();

        batch.execute(function (error, result) {
            db.close();
            if (error) return console.log(28, error);
            if(modalName == 'Router'){
                _Router.findById(String(new mongodb.ObjectID('-dft-hoasao-')), function (error2, r) {
                    log.debug('Menu sync: ', r);
                    if (!_.isNull(r)) {
                        _rootMenu = r;
                    };
                });
            };
        });
    });
};

function updateData(modalName, object) {
    var ids = _.pluck(object, '_id');
    mongodb.MongoClient.connect(_dbPath, function (err, db) {
        if (err) return err;
        var batchIndex = 0;
        var batch = db.collection(_pluralize.plural(modalName.toLowerCase())).initializeUnorderedBulkOp({useLegacyOps: true});
        _.each(ids, function (item, index) {
            batchIndex++;
            var obj = _.omit(object[index], '_id');
            batch.find({_id: item}).updateOne({$set: obj});
        });

        if (batchIndex == 0) return db.close();

        batch.execute(function (error, result) {
            db.close();
        });
    });
};

function removeData(modalName, object) {
    var modal = global['_' + modalName];
    if (!Array.isArray(object)) return 'ObjectInput is not array';
    if (_.has(modal, '_remove')) {
        modal._remove(object, '000000000000000000000000', function (err, result) {
            if (err) console.log(87, 'Remove Data Failed: ' + err);
        });
    } else {
        modal.remove({_id: {$in: object}}, function (err, result) {
            if (err) console.log(91, 'Remove Data Failed: ' + err);
        });
    }
};

function overrideData(modalName, object) {
    mongodb.MongoClient.connect(_dbPath, function (err, db) {
        if (err) return err;
        var cursor = db.collection(_pluralize.plural(modalName.toLowerCase())).find().toArray(function (err, result) {
            if (err) return err;

            var mId = _.map(_.pluck(result, '_id'), function (item) {
                return item.toString();
            });

            object = Array.isArray(object) ? object : [object];
            var batchIndex = 0;

            var batch = db.collection(_pluralize.plural(modalName.toLowerCase())).initializeUnorderedBulkOp({useLegacyOps: true});
            _.each(object, function (item, index) {
                batchIndex++;
                var itemId = item._id;
                if (_.intersection(item._id.toString(), mId).length > 0) {
                    delete item._id
                    batch.find({_id: itemId}).updateOne({$set: item});
                } else {
                    batch.insert(item);
                }
            });

            if (batchIndex == 0) return db.close();
            batch.execute(function (error, result) {
                db.close();
                if (error) return console.log(91, error);
            });
        });
    });
}

function addUser(object) {
    mongodb.MongoClient.connect(_dbPath, function (err, db) {
        if (err) return err;
        var cursor = db.collection('users').find().toArray(function (err, users) {
            var userId = _.map(_.pluck(users, '_id'), function (item) {
                return item.toString();
            });
            var batchIndex = 0;
            var batch = db.collection('users').initializeUnorderedBulkOp({useLegacyOps: true});
            _.each(object, function (user) {
                batchIndex++;
                if (_.intersection(userId, user._id.toString()).length > 0) {
                    var uId = user._id;
                    delete user._id;
                    batch.find({_id: uId}).updateOne({$set: cleanUserObject(user, ACTION.UPDATE)});
                } else {
                    batch.insert(cleanUserObject(user, ACTION.ADD));
                }
            });
            if (batchIndex == 0) return db.close();
            batch.execute(function (error, result) {
                db.close();
                if (error) return console.log(123, error);
            });
        });
    });
}

function updateUser(object, callback) {
    mongodb.MongoClient.connect(_dbPath, function (err, db) {
        if (err) return err;
        var cursor = db.collection('users').find().toArray(function (err, users) {
            if (err) return log.error(err);
            var currentIds = _.map(_.pluck(users, '_id'), function (item) {
                return item.toString();
            });

            var batch = db.collection('users').initializeUnorderedBulkOp({useLegacyOps: true});
            _.each(object, function (item, index) {
                if (_.intersection([item._id.toString()], currentIds).length > 0) {
                    // Update
                    batch.find({_id: item._id}).updateOne({
                        $set: cleanUserObject(item, ACTION.UPDATE)
                    });
                } else {
                    // Insert
                    batch.insert(cleanUserObject(item, ACTION.ADD));
                }
            });

            if (batch.s.currentIndex == 0){
                if (callback) callback(null, null);
                return db.close();
            }

            batch.execute(function (error, result) {
                db.close();
                if (callback) callback(error, result);
                if (error) return log.error(error);
            });
        });
    });
};

function cleanUserObject(uObject, actions) {
    uObject.status = uObject.ternalMembers.status;

    var cl = [];
    var agl = [];
    var agm = [];

    _.each(uObject.companyLeaders, function (item) {
        if (!item.ternal) {
            log.error('USER CORE DOCUMENT - companyLeaders', uObject);
        } else if (_.isEqual(item.ternal.toString(), _config.app._id)) {
            cl = item.leaders;
        }
    });

    _.each(uObject.agentGroupLeaders, function (item) {
		if (!item.ternal) {
			log.error('USER CORE DOCUMENT - agentGroupLeaders', uObject);
		} else if (_.isEqual(item.ternal.toString(), _config.app._id)) {
            agl = item.leaders;
        }
    });

    _.each(uObject.agentGroupMembers, function (item) {
		if (!item.ternal) {
			log.error('USER CORE DOCUMENT - agentGroupMembers', uObject);
		} else if (_.isEqual(item.ternal.toString(), _config.app._id)) {
            agm = item.members;
        }
    });

    uObject.companyLeaders = cl;
    uObject.agentGroupLeaders = agl;
    uObject.agentGroupMembers = agm;
    uObject.role = 3;

    switch (actions) {
        case ACTION.ADD:
            uObject = _.omit(uObject, 'ternalMembers', 'ternal');
            break;
        case ACTION.UPDATE:
            uObject = _.omit(uObject, 'ternalMembers', 'ternal', '_id');
            break;
        default:
            break;
    }
    return uObject;
};

function overrideCustomerFields(object) {
    mongodb.MongoClient.connect(_dbPath, function (err, db) {
        if (err) return err;
        var cursor = db.collection('customerfields').find().toArray(function (err, result) {
            var mId = _.map(_.pluck(result, '_id'), function (item) {
                return item.toString();
            });

            var batchIndex = 0;
            object = Array.isArray(object) ? object : [object];
            var batch = db.collection('customerfields').initializeUnorderedBulkOp({useLegacyOps: true});
            _.each(object, function (item, index) {
                batchIndex++;
                var itemId = item._id;
                if (_.intersection(item._id.toString(), mId).length > 0) {
                    delete item._id
                    batch.find({_id: itemId}).updateOne({$set: item});
                } else {
                    batch.insert(item);
                }
            });

            if (batchIndex == 0) return db.close();

            batch.execute(function (error, result) {
                db.close();
                if (error) return console.log(267, error);
                _CustomerFields.find({}, 'modalName fieldType').sort({weight: 1}).exec(function (error, fields) {
                    _async.each(fields, function (field, callback) {
                        if(!_CCKFields[field.modalName]){
                            _CCKFields[field.modalName] = {
                                db: mongoose.model(field.modalName,
                                    mongoose.Schema(_.defaultSchema(Number(field.fieldType))),
                                    field.modalName
                                ),
                                type: field.fieldType
                            };
                        }
                        callback();
                    }, function (error) {
                        if (error) console.log(278, _CCKFields, error);
                    });
                });
            });
        });
    });
}

function addCustomerFields(object) {
    console.log(224, object);
    _async.waterfall([
        function (callback) {
            // find exist customer fields
            _CustomerFields.find({}, callback)
        },
        function (cf, callback) {
            var oldIds = _.map(cf, function (item) {
                return item._id.toString();
            });

            mongodb.MongoClient.connect(_dbPath, function (err, db) {
                if (err) return err;
                var batchIndex = 0;
                var batch = db.collection('customerfields').initializeUnorderedBulkOp({useLegacyOps: true});
                _.each(object, function (item, index) {
                    batchIndex++;
                    if (_.has(oldIds, item._id.toString())) {
                        var oId = item._id;
                        var obj = _.omit(item, '_id');
                        batch.find({_id: oId}).updateOne({$set: obj});
                    } else {
                        batch.insert(item);
                    }
                });
                if (batchIndex == 0) return db.close();
                batch.execute(function (error, result) {
                    db.close();
                    callback(error);
                });
            });
        }
    ], function (err) {
        if (err) return log.error(err);
        _CustomerFields.find({}, function (err, cfs) {
            if (err) return log.error(err);
            mongodb.MongoClient.connect(_dbPath, function (err2, db) {
                if (err2) return console.log(err2);
                _async.eachSeries(cfs, function (cf, cb) {
                    if (!_.has(_CCKFields, cf.modalName)) {
                        var index = {};
                        index[cf.modalName] = 1;
                        var options = {};
                        options.background = true;
                        db.collection('customerindex').createIndex(index, options);
                        _CCKFields[cf.modalName] = {
                            db: mongoose.model(
                                cf.modalName,
                                mongoose.Schema(_.defaultSchema(Number(cf.fieldType))),
                                cf.modalName
                            ),
                            type: cf.fieldType
                        };
                    }
                    cb();
                }, function (error) {
                    db.close();
                });
            });
        })
    });
}

function updateCustomerFields(object) {
    mongodb.MongoClient.connect(_dbPath, function (err, db) {
        var batchIndex = 0;
        var batch = db.collection('customerfields').initializeUnorderedBulkOp({useLegacyOps: true});
        _.each(object, function (item) {
            batchIndex++;
            batch.find({_id: item._id}).updateOne({$set: item});
        });
        if (batchIndex == 0) return db.close();
        batch.execute(function (error, result) {
            db.close();
            if (error) return console.log(312, error);
        });
    });
}

function removeCustomerFields(object) {
    if (object[0]) {
        _CustomerFields.findByIdAndRemove(object[0]._id, function (err, cf) {
            if (!err) {
                mongoose.connection.collections[object[0].modalName].drop(function (status) {
                    delete _CCKFields[object[0].modalName];
                    delete mongoose.models[object[0].modalName];
                    delete mongoose.modelSchemas[object[0].modalName];
                });
            } else {
                log.error(err);
            }
        });
    }
}

function subscribeCallback(modalName, body, header) {
    var _body = QUEUE_TernalPublish.parseObjectWithObjectId(body);
    switch (modalName) {
        case 'Users':
        case 'CustomerFields':
            var functionName = (_.invert(this.MYACTION))[_body.action] + '_' + modalName;
            if (!_.has(this, functionName)) return log.error('Do not have function: ' + functionName);
            this[functionName](_body.object);
            break;
        default:
            var functionName = (_.invert(this.MYACTION))[_body.action] + '_DATA';
            if (!_.has(this, functionName)) return log.error('Do not have function: ' + functionName);
            this[functionName](modalName, _body.object);
            break;
    }
}

module.exports = {
    MYACTION: ACTION,

    ADD_DATA: addData,
    UPDATE_DATA: updateData,
    REMOVE_DATA: removeData,
    SYNC_DATA: overrideData,
    OVERRIDE_DATA: overrideData,

    ADD_Users: addUser,
    UPDATE_Users: updateUser,

    ADD_CustomerFields: addCustomerFields,
    UPDATE_CustomerFields: updateCustomerFields,
    REMOVE_CustomerFields: removeCustomerFields,
    SYNC_CustomerFields: overrideCustomerFields,
    OVERRIDE_CustomerFields: overrideCustomerFields,

    subscribe: subscribeCallback,
}
