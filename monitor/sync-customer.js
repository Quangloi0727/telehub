/**
 * Created by baygiomoidc on 16/06/2016.
 */

var inProcess = {};
var acdPublish = require(path.join(_rootPath, 'queue', 'publish', 'acd-publish.js'));
var users = [];
var cfields = {};

/**
 * Khởi tạo quá trình đồng bộ dữ liệu lên CORE
 * @param data Dữ liệu đồng bộ
 */
function initSync(data){

    _async.waterfall([
        function(next){
            _CustomerFields.find({status: 1}, next);
        },
        function(_cfields, next){
            cfields = _cfields;
            var _query = {};
            _.each(cfields, function(field){
                if(_.has(data.query, field.modalName)) _query[field.modalName] = switchAgg(field.fieldType, data.query[field.modalName]);
            });
            if (data.source) _query.sources = { $all: [data.source]};

            mongoClient.collection('customerindex').count(_query, next);
        }
    ], function(err, result){
        if(result == 0){
            data.status = 1;
            _SyncCustomerLog.findByIdAndUpdate(data._id, data, {new: true}, function(err, result){
                updateData(result);
            });
        }else {
            data.total = result;
            inProcess[data._id.toString()] = data;
            reqSyncCustomer(data._id.toString());
        }
    });
};

/**
 * Cập nhật danh sách user theo dõi quá trình đồng bộ
 * @param id
 */
function setUser(id){
    if(users.indexOf(id.toString()) < 0) users.push(id.toString());
};

/**
 * cập nhật dữ liệu đồng bộ lên màn hình theo dõi
 * @param data Dữ liệu mới
 */
function updateData(data){
    _.each(users, function(user, i){
        if(_socketUsers[user]){
            _.each(_socketUsers[user].sid, function(sid){
                var _clientSocket = sio.sockets.sockets[sid];
                if(_clientSocket) _clientSocket.emit('SyncCustomerMonitor', data);
            });
        }else {
            users.splice(i, 1);
        }
    });
};

/**
 * Gửi yêu cầu đồng bộ dữ liệu tới CORE
 * @param id
 */
function reqSyncCustomer(id){
    var data = inProcess[id];
    if(data.total > data.current){
        var _query = {};
        if(data.flag) _query['_id'] = {$gt: new mongodb.ObjectId(data.flag)};
        if (data.source) _query.sources = { $all: [data.source]};
        _.each(cfields, function(field){
            if(_.has(data.query, field.modalName)) _query[field.modalName] = switchAgg(field.fieldType, data.query[field.modalName]);
        });
        mongoClient.collection('customerindex').find(_query)
            .limit(data.packageSize)
            .toArray(function(err, customer){
                if(!err && customer.length > 0){
                    acdPublish.sendSyncCustomer(id, data.sessionId, customer, data.filterId);
                }else {
                    data.status = 1;
                    _SyncCustomerLog.findByIdAndUpdate(data._id, data, {new: true}, function(err, result){
                        updateData(result);
                    });
                }
            });
    }
};

/**
 * Kết quả đồng bộ trả về từ CORE
 * @param mes Bản tin nhận về
 */
function resSyncCustomer(mes){
    var data = inProcess[mes.transID];
    if(data && _.isEqual(data.sessionId, mes.sessionId)){
        data.flag = mes.flag;
        data.current += mes.packageSize;
        if(data.total > data.current){
            _SyncCustomerLog.findByIdAndUpdate(mes.transID, data, {new: true}, function(err, result){
                updateData(result);
                reqSyncCustomer(mes.transID);
            });
        }else{
            data.current = data.total;
            data.status = 1;
            _SyncCustomerLog.findByIdAndUpdate(mes.transID, data, {new: true}, function(err, result){
                updateData(result);
            });
        }
    }
};

/**
 * Khởi tạo quá trình lấy dữ liệu từ CORE
 * @param data Dữ liệu khai báo
 */
function initGet(data){
    inProcess[data._id.toString()] = data;
    reqGetCustomer(data._id.toString());
};

/**
 * Yêu cầu lấy dữ liệu từ CORE
 * @param id Trans ID
 */
function reqGetCustomer(id){
    var data = inProcess[id];
    acdPublish.sendGetCustomer(id, data.sessionId, data.query, data.flag, data.packageSize);
};

/**
 * Kết quả nhận về sau khi gửi yêu cầu lấy dữ liệu từ CORE
 * @param mes Bản tin kết quả
 */
function resGetCustomer(mes){
    var data = inProcess[mes.transID];
    if(data && _.isEqual(data.sessionId, mes.sessionId)){
        if(mes.total) data.total = mes.total;
        var cusData = mes.data;
        data.flag = cusData[cusData.length - 1]._id.toString();
        data.current += cusData.length;

        addCustomer(cusData, data, function(err){
            if(!err && data.total > data.current){
                _SyncCustomerLog.findByIdAndUpdate(mes.transID, data, {new: true}, function(err, result){
                    updateData(result);
                    reqGetCustomer(mes.transID);
                });
            }else{
                data.status = 1;
                _SyncCustomerLog.findByIdAndUpdate(mes.transID, data, {new: true}, function(err, result){
                    updateData(result);
                });
            }
        });
    }
};

/**
 * Chuẩn hóa dữ liệu khách hàng
 * @param type Loại dữ liệu
 * @param text Dữ liệu
 * @returns {*} Dữ liệu đã được chuẩn hóa
 */
function switchAgg(type, text) {
    switch (type) {
        case 1:
            return {$regex: new RegExp(_.stringRegex(text), 'i')};
        case 2:
            return {$gte: Number(text[0]),$lte: Number(text[1])};
            break;
        case 3:
            return {$regex: new RegExp(_.stringRegex(text), 'i')};
            break;
        case 4:
            return {$all: text};
            break;
        case 5:
            return {$elemMatch: {$eq: text}};
            break;
        case 6:
            return {
                $gte: _moment(text[0], 'DD/MM/YYYY')._d,
                $lte: _moment(text[1], 'DD/MM/YYYY')._d
            };
        case 7:
            return {$regex: new RegExp(_.stringRegex(text), 'i')};
            break;
    }
};

/**
 * Thêm mới khách hàng sau khi nhận được từ CORE
 * @param data Dữ liệu khách hàng
 * @param syncLog Dữ liệu theo dõi của quá trình đồng bộ
 * @param callback Call back khi hoàn thành thêm mới
 */
function addCustomer(data, syncLog, callback){
    var _objs = data;
    var _emailObjs = [];
    var _template = {};
    var _source = syncLog.source ? [syncLog.source.toString()] : [];
    _async.waterfall([
        function(next) {
            _CustomerFields.find({status: 1}, next);
        },
        function(fields, next){
            _template = _.chain(fields).groupBy('modalName').mapObject(function (i) {
                return i[0];
            }).value();

            mongoClient.collection('customerindex').find({field_so_dien_thoai: {$in: _.pluck(_objs, 'field_so_dien_thoai')}}).toArray(function (err, result) {
                var _duplicatedNumbers = _.pluck(result, 'field_so_dien_thoai');
                var _dupObjs = [];

                var _customerBulk = mongoClient.collection('customers').initializeUnorderedBulkOp({useLegacyOps: true});
                var _sourcesBulk = mongoClient.collection('customersources').initializeUnorderedBulkOp({useLegacyOps: true});
                var _indexBulk = mongoClient.collection('customerindex').initializeUnorderedBulkOp({useLegacyOps: true});
                var _CCKBulks = {};

                _.each(_template, function(field){
                    var bulk = mongoClient.collection(field.modalName).initializeUnorderedBulkOp({useLegacyOps: true});
                    _CCKBulks[field.modalName] = bulk;
                });

                _objs = _.chain(_objs)
                    .map(function(_obj){
                        if(_duplicatedNumbers.indexOf(_obj['field_so_dien_thoai']) >= 0){
                            _obj._id = result[_duplicatedNumbers.indexOf(_obj['field_so_dien_thoai'])]._id;
                            _dupObjs.push(_obj);
                            return null;
                        }else{
                            if(_.isEmpty(_obj['field_so_dien_thoai']) && !_.isEmpty(_obj['field_e_mail'])){
                                _emailObjs.push(_obj);
                                return null;
                            }else {
                                _obj._id = new mongodb.ObjectID();
                                return _obj;
                            }
                        };
                    })
                    .compact()
                    .value();

                var _dupSources = {};
                _dupObjs = _.chain(_dupObjs)
                    .filter(function(_obj){
                        var curSources = result[_duplicatedNumbers.indexOf(_obj['field_so_dien_thoai'])].sources.toString();
                        var insertSources = _.chain(_source)
                            .filter(function(source){
                                return curSources.indexOf(source) < 0;
                            })
                            .compact()
                            .value();
                        _.each(insertSources, function(source){
                            if(!_dupSources[source]) _dupSources[source] = [];
                            _dupSources[source].push(_obj._id);
                        });
                        _obj.sources = insertSources;
                        return insertSources.length > 0;
                    })
                    .value();

                _.each(_.keys(_dupSources), function(key){
                    _sourcesBulk.find({_id: new mongodb.ObjectId(key)}).update({$inc: {amount: _dupSources[key].length}});
                });

                _sourcesBulk.find({_id: {$in: _.arrayObjectId(_source)}}).update({$inc: {amount: _objs.length}});


                _.each(_dupObjs, function(obj){
                    _customerBulk.find({_id: obj._id}).update({$push: { sources: { $each: _.arrayObjectId(obj.sources) }}});
                    _indexBulk.find({_id: obj._id}).update({$push: { sources: { $each: _.arrayObjectId(obj.sources) }}});

                    var _cusIndex = {};
                    _.each(_template, function(field){
                        var _key = field.modalName;
                        if(!_.isEqual(_key.toString(), '')){
                            _cusIndex[_key] = obj[_key];
                            _CCKBulks[_key].find({entityId: obj._id}).upsert().updateOne({
                                entityId: obj._id,
                                value: obj[_key],
                                created: Date.now
                            });
                        }
                    });
                    _indexBulk.find({_id: obj._id}).update({$set: _cusIndex});
                });

                _.each(_objs, function(obj){
                    var customer = new _Customer({
                        _id: obj._id,
                        sources: _source
                    });
                    _customerBulk.insert(customer.toObject());
                    var _cusIndex = {
                        _id: customer._id,
                        sources: _.arrayObjectId(_source)
                    };

                    _.each(_template, function(field){
                        var _key = field.modalName;
                        if(!_.isEmpty(obj[_key])){
                            _cusIndex[_key] = obj[_key];
                            _CCKBulks[_key].insert({
                                entityId: obj._id,
                                value: obj[_key],
                                created: Date.now
                            });
                        }else if(_.isEqual(_key, 'field_so_dien_thoai') || _.isEqual(_key, 'field_e_mail')){
                            _cusIndex[_key] = null;
                            _CCKBulks[_key].insert({
                                entityId: obj._id,
                                value: null,
                                created: Date.now
                            });
                        }
                    });
                    _indexBulk.insert(_cusIndex);
                });

                var _bulks = [];
                _bulks.push(_customerBulk);
                _bulks.push(_sourcesBulk);
                _bulks.push(_indexBulk);
                _.each(_.keys(_CCKBulks), function(key){
                    _bulks.push(_CCKBulks[key]);
                });

                _async.each(_bulks, function(batch, callback) {
                    if(batch.s.currentBatch)
                        batch.execute(callback);
                    else
                        callback();
                }, function(err){
                    next(err);
                });
            });
        },
        function(next){
            mongoClient.collection('customerindex').find({field_e_mail: {$in: _.pluck(_emailObjs, 'field_e_mail')}}).toArray(function (err, result) {
                var _duplicatedEmails = _.pluck(result, 'field_e_mail');
                var _dupObjs = [];

                _emailObjs = _.chain(_emailObjs)
                    .map(function(_obj){
                        if(_duplicatedEmails.indexOf(_obj['field_e_mail']) >= 0){
                            _obj._id = result[_duplicatedEmails.indexOf(_obj['field_e_mail'])]._id;
                            _dupObjs.push(_obj);
                            return null;
                        }else{
                            _obj._id = new mongodb.ObjectID();
                            return _obj;
                        };
                    })
                    .compact()
                    .value();



                var _customerBulk = mongoClient.collection('customers').initializeUnorderedBulkOp({useLegacyOps: true});
                var _sourcesBulk = mongoClient.collection('customersources').initializeUnorderedBulkOp({useLegacyOps: true});
                var _indexBulk = mongoClient.collection('customerindex').initializeUnorderedBulkOp({useLegacyOps: true});
                var _CCKBulks = {};
                _.each(_template, function(field){
                    var bulk = mongoClient.collection(field.modalName).initializeUnorderedBulkOp({useLegacyOps: true});
                    _CCKBulks[field.modalName] = bulk;
                });

                var _dupSources = {};
                _dupObjs = _.chain(_dupObjs)
                    .filter(function(_obj){
                        var curSources = result[_duplicatedEmails.indexOf(_obj['field_e_mail'])].sources.toString();
                        var insertSources = _.chain(_source)
                            .filter(function(source){
                                return curSources.indexOf(source) < 0;
                            })
                            .compact()
                            .value();
                        _.each(insertSources, function(source){
                            if(!_dupSources[source]) _dupSources[source] = [];
                            _dupSources[source].push(_obj._id);
                        });
                        _obj.sources = insertSources;
                        return insertSources.length > 0;
                    })
                    .value();

                _.each(_.keys(_dupSources), function(key){
                    _sourcesBulk.find({_id: new mongodb.ObjectId(key)}).update({$inc: {amount: _dupSources[key].length}});
                });

                _sourcesBulk.find({_id: {$in: _.arrayObjectId(_source)}}).update({$inc: {amount: _objs.length}});

                _.each(_dupObjs, function(obj){
                    _customerBulk.find({_id: obj._id}).update({$push: { sources: { $each: _.arrayObjectId(obj.sources) }}});
                    _indexBulk.find({_id: obj._id}).update({$push: { sources: { $each: _.arrayObjectId(obj.sources) }}});

                    var _cusIndex = {};
                    _.each(_template, function(field){
                        var _key = field.modalName;
                        if(!_.isEqual(_key.toString(), '')){
                            _cusIndex[_key] = obj[_key];
                            _CCKBulks[_key].find({entityId: obj._id}).upsert().updateOne({
                                entityId: obj._id,
                                value: obj[_key],
                                created: Date.now
                            });
                        }
                    });
                    _indexBulk.find({_id: obj._id}).update({$set: _cusIndex});
                });

                _.each(_emailObjs, function(obj){

                    var customer = new _Customer({
                        _id: obj._id,
                        sources: _source
                    });
                    _customerBulk.insert(customer.toObject());
                    var _cusIndex = {
                        _id: customer._id,
                        sources: _.arrayObjectId(_source)
                    };

                    _.each(_template, function(field){
                        var _key = field.modalName;
                        if(!_.isEmpty(obj[_key])){
                            _cusIndex[_key] = obj[_key];
                            _CCKBulks[_key].insert({
                                entityId: obj._id,
                                value: obj[_key],
                                created: Date.now
                            });
                        }else if(_.isEqual(_key, 'field_so_dien_thoai') || _.isEqual(_key, 'field_e_mail')){
                            _cusIndex[_key] = null;
                            _CCKBulks[_key].insert({
                                entityId: obj._id,
                                value: null,
                                created: Date.now
                            });
                        }
                    });
                    _indexBulk.insert(_cusIndex);
                });

                var _bulks = [];
                _bulks.push(_customerBulk);
                _bulks.push(_sourcesBulk);
                _bulks.push(_indexBulk);
                _.each(_.keys(_CCKBulks), function(key){
                    _bulks.push(_CCKBulks[key]);
                });

                _async.each(_bulks, function(batch, callback) {
                    if(batch.s.currentBatch)
                        batch.execute(callback);
                    else
                        callback();
                }, function(err){
                    next(err);
                });
            });
        }
    ], callback);
};

/**
 * Khởi động lại quá trình đồng bộ khách hàng
 * @param id ID của quá trình đồng bộ cũ
 */
function restartSync(id){
    _SyncCustomerLog.findById(id, function(err, result){
        var data = result;
        data.status = 0;
        data.sessionId = createID();
        data.current = 0;
        data.flag = null;

        if(data.type == 1){
            initSync(data);
        }else {
            initGet(data);
        }
    });
};

/**
 * Dừng đồng bộ
 * @param id ID dữ liệu đồng bộ
 */
function stopSync(id){
    var data = inProcess[id];
    if(data){
        data.status = 2;
        _SyncCustomerLog.findByIdAndUpdate(data._id, data, {new: true}, function(err, result){
            updateData(result);
        });
        delete inProcess[id];
    }
};

/**
 * Tạo chuỗi ID không trùng lặp
 * @returns {*}
 */
function createID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4();
}


module.exports = {
    initSync: initSync,
    setUser: setUser,
    reqSyncCustomer: reqSyncCustomer,
    resSyncCustomer: resSyncCustomer,
    initGet: initGet,
    reqGetCustomer: reqGetCustomer,
    resGetCustomer: resGetCustomer,
    restartSync: restartSync,
    stopSync: stopSync
}