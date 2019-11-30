exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = _.cleanRequest(req.query);
        _async.waterfall([
            function (callback) {
                // Lấy thông tin customer field
                _CustomerFields.find({status: 1}).sort({weight: 1, displayName: 1}).exec(function(err, result){
                    cfields = result;
                    callback(err);
                });
            },
            function (callback) {
                // Tính tổng số bản ghi truy vấn
                var _query = [];
                if (_.has(query, 'sources')) _query.push({sources: { $all: _.arrayObjectId(query['sources'])}});
                _.each(cfields, function(field){
                    if(_.has(query, field.modalName)) _query.push(_.object([field.modalName], [_.switchAgg(field.fieldType, query[field.modalName])]));
                });
                mongoClient.collection('customerindex').count(_.isEmpty(_query) ? {} : {$and: _query},callback);
            }
        ], function(err, result){
            // lấy dữ liệu paging
            var paginator = new pagination.SearchPaginator({
                prelink: '/customer',
                current: page,
                rowsPerPage: rows,
                totalResult: result
            });
            res.json({code: err ? 500: 200, message: err ? err : paginator.getPaginationData()});
        });
    },
    html: function (req, res) {
        var checkTime = Date.now();
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var lastCount = req.query['count'];
        var sort = _.cleanSort(req.query, '');
        var query = _.cleanRequest(req.query);
        var cfields = [];

        _async.waterfall([
            function (callback) {
                // Lấy thông tin customer field
                _CustomerFields.find({status: 1}).sort({weight: 1, displayName: 1}).exec(function(err, result){
                    cfields = result;
                    callback(err);
                });
            },
            function (callback) {
                // Tính tổng số bản ghi truy vấn
                var _query = [];
                if (_.has(query, 'sources')) _query.push({sources: { $all: _.arrayObjectId(query['sources'])}});
                _.each(cfields, function(field){
                    if(_.has(query, field.modalName)) _query.push(_.object([field.modalName], [_.switchAgg(field.fieldType, query[field.modalName])]));
                });

                mongoClient.collection('customerindex').find(_.isEmpty(_query) ? {} : {$and: _query})
                    .sort(sort)
                    .skip((page - 1)*rows)
                    .limit(rows)
                    .toArray(callback);
            },
            function (customers, callback) {
                // Query dữ liệu khách hàng
                var ids = _.pluck(customers, '_id');
                var aggs = [];
                aggs.push({$match: {_id: {$in: ids}}});
                _.each(cfields, function (o) {
                    aggs.push({$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}});
                });

                if(!_.isEmpty(sort)) aggs.push({$sort: sort});

                _async.waterfall([
                    function(next){
                        _Customer.aggregate(aggs, next);
                    },
                    function(customers ,next){
                        // Lấy thông tin nguồn khách hàng
                        _CustomerSource.populate(customers,{
                            path: 'sources',
                            select: 'name group',
                            populate: {
                                path: 'group',
                                model: _CustomerGroups,
                                select: 'name'
                            }
                        },next);
                    },
                    function(customers, next){
                        // Lấy thông tin nhóm khách hàng
                        _CustomerGroups.aggregate([
                            {$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}},
                            {$match: {status: 1}},
                            {$sort: {name: 1, 'sources.name': 1}}
                        ], function(err, groups){
                            next(err, customers, groups)
                        });
                    }
                ], function(err, result, groups){
                    var paginator = new pagination.SearchPaginator({
                        prelink: '/customer',
                        current: page,
                        rowsPerPage: rows,
                        totalResult: lastCount ? lastCount : (result.length < rows ? result.length : (page + 1)*rows)
                    });
                    callback(err, {fields: cfields, customers: result, groups: groups, paging: paginator.getPaginationData()});
                });
            }
        ], function (error, result) {
            _.render(req, res, 'customer', _.extend({
                title: 'Dữ liệu khách hàng',
                plugins: [['chosen'], ['bootstrap-select'], ['bootstrap-datetimepicker']]
            }, result), true, error);
        });
    }
};
// GET : http://domain.com/customer/new
exports.new = function (req, res) {
    _async.parallel({
        fields: function (callback) {
            // Lấy thông tin customer field
            _CustomerFields.find({status: 1}).sort({weight: 1, displayName: 1}).exec(callback);
        },
        groups: function (callback) {
            // Lấy thông tin nguồn/nhóm khách hàng
            _CustomerGroups.aggregate([
                {$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}},
                {$match: {status: 1}},
                {$sort: {name: 1, 'sources.name': 1}}
            ], callback)
        }
    }, function (error, result) {
        _.render(req, res, 'customer-new', _.extend({
            title: 'Tạo mới khách hàng',
            plugins: [['chosen'], ['bootstrap-select'], ['bootstrap-datetimepicker']]
        }, result), true, error);
    });
};

// GET : http://domain.com/customer/:_id/edit
exports.edit = function (req, res) {
    var checkTime = Date.now();
    _Customer.findById(req.params.customer, function (error, cus) {
        if (error) return res.render('404', {title: '404 | Page not found'});
        _async.waterfall([
            function (callback) {
                // Lấy thông tin customer field
                _CustomerFields.find({status: 1}).sort({weight: 1, displayName: 1}).exec(callback);
            },
            function (cfields, callback) {
                // // Lấy thông tin khách hàng
                var _agg = [{$match: {_id: cus._id}}];
                _.each(cfields, function (o) {
                    _agg.push({$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}});
                });

                _Customer.aggregate(_agg, function (error, customer) {
                    callback(error, {fields: cfields, customer: customer.length ? customer[0] : []});
                });
            }
        ], function (error, result) {
            _CustomerGroups.aggregate([
                {$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}},
                {$match: {status: 1}},
                {$sort: {name: 1, 'sources.name': 1}}
            ], function (error, groups) {
                result.groups = groups;
                _.render(req, res, 'customer-edit', _.extend({
                    title: 'Dữ liệu khách hàng',
                    plugins: [['chosen'], ['bootstrap-select'], ['bootstrap-datetimepicker']]
                }, result), true, error);
            });
        });
    });
};

// POST
exports.create = function (req, res) {
    var _body = _.chain(req.body).cleanRequest().toLower().value();
    var _newCus = {};

    _async.waterfall([
        function (callback) {
            if(_.isEmpty(_body.field_so_dien_thoai) && _.isEmpty(_body.field_e_mail))
                return callback('Bắt buộc nhập Số Điện Thoại hoặc E-Mail !', null);
            if(!_.isEmpty(_body.field_so_dien_thoai)){
                // Check trùng
                mongoClient.collection('customerindex').findOne({field_so_dien_thoai: _body.field_so_dien_thoai}, function(err, result){
                    if (err) return callback(err, result);
                    if (result) return callback('Đã tồn tại khách hàng với số điện thoại này !', result);
                    callback();
                });
                //_CCKFields['field_so_dien_thoai'].db.count({value: _body.field_so_dien_thoai}, function (err, result) {
                //    if (err) return callback(err, result);
                //    if (result !== 0) return callback('Đã tồn tại khách hàng với số điện thoại này !', result);
                //    callback();
                //});
            }else {
                callback();
            }
        },
        function (callback) {
            if(!_.isEmpty(_body.field_e_mail)){
                // Check trung email
                mongoClient.collection('customerindex').findOne({field_e_mail: _body.field_e_mail}, function(err, result){
                    if (err) return callback(err, result);
                    if (result) return callback('Đã tồn tại khách hàng với số điện thoại này !', result);
                    callback();
                });
                //_CCKFields['field_e_mail'].db.count({value: _body.field_e_mail}, function (err, result) {
                //    if (err) return callback(err, result);
                //    if (result !== 0) return callback('Đã tồn tại khách hàng với E-Mail này !', result);
                //    callback();
                //});
            }else{
                callback();
            }
        },
        function (callback) {
            _Customer.create(_body, callback);
        },
        function (c, callback) {
            // Cập nhật lại trường amount của nguồn khách hàng
            if (!_.has(_body, 'sources') || !_body.sources.length) return callback(null, c);
            _CustomerSource.update({_id: {$in: _body.sources}}, {$inc: {amount: 1}}, {multi: true}, function (error, s) {
                callback(error, c);
            });
        },
        function (c, callback) {
            _newCus._id = c._id;
            _newCus.sources = _.arrayObjectId(_body.sources);
            _newCus.field_e_mail = null;
            _newCus.field_so_dien_thoai = null;
            delete _body.sources;
            // Chuẩn hóa dữ liệu đầu vào
            _async.each(_.keys(_body), function (k, cb) {
                if (_.isNull(_body[k]) || _.isEmpty(_body[k]) || _.isUndefined(_body[k])) return cb(null, null);
                switch (_CCKFields[k].type) {
                    case 2:
                        _body[k] = Number(_body[k]);
                        break;
                    case 4:
                        _body[k] = _.chain(_body[k]).map(function(el){
                            return _.isEqual("0", el) ? null : el;
                        }).compact().value();
                        break;
                    case 5:
                        _body[k] = _.compact(_body[k]);
                        break;
                    case 6:
                        _body[k] = _moment(_body[k], 'DD/MM/YYYY')._d;
                        break;
                    default:
                        break;
                }
                _newCus[k] = _body[k];
                _CCKFields[k].db.update({entityId: c._id}, {entityId: c._id, value: _body[k]}, {upsert: true}, cb);
            }, callback);
        },
        function(callback){
            mongoClient.collection('customerindex').insert(_newCus, callback);
        }
    ], function (error, result) {
        res.json({code: error ? 500 : 200, message: error ? error : 'Tạo mới thành công', customer: error ? result : _newCus});
    });
};

// PUT : http://domain.com/customer/:_id
exports.update = function (req, res) {
    var _updateCus = {};
    mongoClient.collection('customerindex').findOne({_id: new mongodb.ObjectId(req.params.customer)}, function (error, cus) {
        if (error) return res.render('404', {title: '404 | Page not found'});
        req.body['sources'] = _.has(req.body, 'sources') ? req.body.sources : [];
        var _body = _.chain(req.body).cleanRequest().toLower().value();
        _async.waterfall([
            function (callback) {
                // Check trùng
                if(_.isEmpty(_body.field_so_dien_thoai) && _.isEmpty(_body.field_e_mail))
                    return callback('Bắt buộc nhập Số Điện Thoại hoặc E-Mail !', null);
                if(!_.isEmpty(_body.field_so_dien_thoai)){
                    mongoClient.collection('customerindex').count({_id: {$ne: cus._id}, field_so_dien_thoai: _body.field_so_dien_thoai}, function (err, result) {
                        if (err) return callback(err, result);
                        if (result !== 0) return callback('Đã tồn tại khách hàng với số điện thoại này !', null);
                        callback();
                    });
                }else {
                    callback();
                }
            },
            function (callback) {
                if(!_.isEmpty(_body.field_e_mail)){
                    // Check trùng email
                    mongoClient.collection('customerindex').count({_id: {$ne: cus._id}, field_e_mail: _body.field_e_mail}, function (err, result) {
                        if (err) return callback(err, result);
                        if (result !== 0) return callback('Đã tồn tại khách hàng với E-Mail này !', null);
                        callback();
                    });
                }else{
                    callback();
                }
            },
            function (callback) {
                // Cập nhật trường amount của nguồn
                _CustomerSource.update({$and: [{_id: {$in: cus.sources}}, {amount: {$gte: 1}}]}, {$inc: {amount: -1}}, {multi: true}, callback);
            },
            function (c, callback) {
                _Customer.findByIdAndUpdate(cus._id, _body, {new: true}, callback);
            },
            function (c, callback) {
                // Cập nhật trường amount của nguồn
                if (_.isNull(c)) return callback(null, null);
                _CustomerSource.update({_id: {$in: c.sources}}, {$inc: {amount: 1}}, {multi: true}, callback);
            },
            function (cs, callback) {
                _updateCus.sources = _.arrayObjectId(_body.sources);
                _updateCus.field_e_mail = null;
                _updateCus.field_so_dien_thoai = null;
                delete _body.sources;
                // Chuẩn hóa dữ liệu đầu vào
                _async.each(_.keys(_body), function (k, cb) {
                    if (_.isNull(_body[k]) || _.isEmpty(_body[k]) || _.isUndefined(_body[k])) {
                        cb(null, null);
                    } else {
                        switch (_CCKFields[k].type) {
                            case 2:
                                _body[k] = Number(_body[k]);
                                break;
                            case 4:
                                _body[k] = _.chain(_body[k]).map(function(el){
                                    return _.isEqual("0", el) ? null : el;
                                }).compact().value();
                                break;
                            case 5:
                                _body[k] = _.compact(_body[k]);
                                break;
                            case 6:
                                _body[k] = _moment(_body[k], 'DD/MM/YYYY')._d;
                                break;
                            default:
                                break;
                        }

                        _updateCus[k] = _body[k];
                        _CCKFields[k].db.update({entityId: cus._id}, {$set: {value: _body[k]}}, {
                            upsert: true,
                            new: true
                        }, cb);
                    }
                }, callback);
            },
            function(callback){
                mongoClient.collection('customerindex').update({_id: cus._id}, {$set: _updateCus}, callback);
            }
        ], function (error, result) {
            res.json({code: error ? 500 : 200, message: error ? error : 'Cập nhật thành công', customer: _updateCus});
        });
    });
};

// DELETE http://domain.com/customer/:_id
exports.destroy = function (req, res) {
    var _cid = {};
    try {
        _cid = mongodb.ObjectID(req.params.customer);
    }
    catch (e) {
        return res.json({code: 404, message: 'Not found !'});
    }
    _async.waterfall([
        function(next){
            // Kiểm tra dữ liệu khách hàng đã được sử dụng hay chưa
            _CampainCustomer.count({idCustomer: req.params.customer}, function(err, count){
                next(count > 0 ? 'Khách hàng đang được sử dụng' : null);
            });
        },
        function(next){
            _Customer.count({idCustomer: req.params.customer}, function(err, count){
                next(count > 0 ? 'Khách hàng đang được sử dụng' : null);
            });
        }, function(next){
            _Customer.findByIdAndRemove(req.params.customer, function (error, c) {
                _async.parallel({
                    // Cập nhật nguồn khách hàng
                    updateSource: function (callback) {
                        if (!c.sources) {
                            callback(null, null);
                        } else {
                            _CustomerSource.update({_id: {$in: c.sources}}, {$inc: {amount: -1}}, {multi: true}, callback);
                        }
                    },
                    // Xóa bảng dữ liệu ở bảng customer field
                    deleteFields: function (callback) {
                        _async.each(_CCKFields, function (field, cb) {
                            field.db.remove({entityId: c._id}, cb);
                        }, callback);
                    },
                    // Xóa bảng dữ liệu ở bảng customerindex
                    deleteIndexs: function(callback){
                        mongoClient.collection('customerindex').remove({_id: c._id}, callback);
                    }
                }, next);
            });
        }
    ], function(err, result){
        res.json({code: err ? 500 : 200, message: err ? err : 'Xoá thành công'});
    });
};

// Xóa nhiều
exports.destroys = function (req, res) {
    if (!_.has(req.query, 'ids') || _.isEmpty(req.query.ids)) return res.json({code: 404, message: 'Not found !'});
    var _ids = req.query.ids.split(',');
    _async.waterfall([
        function(next){
            _CampainCustomer.count({idCustomer: {$in: _.arrayObjectId(_ids)}}, function(err, count){
                next(count > 0 ? 'Khách hàng đang được sử dụng' : null);
            });
        },
        function(next){
            _Tickets.count({idCustomer: {$in: _.arrayObjectId(_ids)}}, function(err, count){
                next(count > 0 ? 'Khách hàng đang được sử dụng' : null);
            });
        },
        function (callback) {
            _CustomerFields.find({}, callback);
        },
        function (cfields, callback) {
            var _query = [];
            _query.push({$match: {_id: {$in: _.arrayObjectId(_ids)}}});
            _.each(cfields, function (o) {
                _query.push({$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}});
            });

            //Todo: Tìm khách hàng và các CCK field tương ứng phục vụ cho việc sử lý
            _Customer.aggregate(_query, function (error, customers) {
                callback(error, customers, _.map(cfields, function (o) {
                    return o.modalName;
                }));
            });
        },
        function (customers, cfields, callback) {
            var _query = [{$match: {_id: {$in: _.arrayObjectId(_ids)}}}];
            //Todo: Tách từng phần tử trong sources vì customer sources là kiểu mảng
            _query.push({$unwind: '$sources'});
            //Todo: Nhóm theo từng phần tử của sources
            _query.push({$group: {_id: '$sources', count: {$sum: 1}}});
            //Todo: Lọc những nhóm không phù hợp điều kiện
            _query.push({$match: {'_id': {$not: {$size: 0}}}});
            _Customer.aggregate(_query, function (error, sources) {
                callback(error, customers, cfields, sources);
            });
        }
    ], function (error, customers, cfields, sources) {
        if (error) return res.json({code: 500, message: error});
        //Xử lý đồng thời các tác vụ
        _async.parallel({
            //Todo: cập nhật hàng sources
            updateSources: function (callback) {
                var batch = mongoClient.collection('customersources').initializeUnorderedBulkOp({useLegacyOps: true});
                _.each(sources, function (s) {
                    batch.find({_id: s._id}).updateOne({$inc: {amount: -(s.count)}});
                });
                if(sources.length > 0) {
                    batch.execute(callback);
                }else {
                    callback(null);
                }
            },
            //Todo: xoá các field tương ứng
            deleteCCKField: function (callback) {
                _async.each(cfields, function (field, cb) {
                    _CCKFields[field].db.remove({_id: {$in: _getArr(customers, field)}}, cb);
                }, callback);
            },
            //Todo: xoá các khách hàng được chọn
            deleteCustomer: function (callback) {
                _Customer.remove({_id: {$in: _.arrayObjectId(_ids)}}, callback);
            },
            deleteIndexs: function(callback){
                mongoClient.collection('customerindex').remove({_id: {$in: _.arrayObjectId(_ids)}}, callback);
            }
        }, function (error, result) {
            res.json({code: error ? 500 : 200, message: error ? error : 'Xoá thành công'});
        });
    });
};

//Todo: trả về tên CCK field và danh sách id cần xoá của CCK field đó
var _getArr = function (arr, field) {
    return _.chain(arr)
        .map(function (el) {
            return _.chain(el).pick(field).values().flatten(true).first().pick('_id').values().first().value();
        })
        .value();
};