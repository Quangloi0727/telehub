
// POST
exports.create = function (req, res) {
    if (_.has(req.body, "type")) {
        var query = _.cleanRequest(JSON.parse(req.body.query), 'sort');
        if (_.isEqual(req.body.type, "filter")) {
            _async.waterfall([
                function (callback) {
                    _CustomerGroups.findOne({name: "Filter"}, function (err, g) {
                        if (_.isNull(g)) {
                            _CustomerGroup.create({name: "Filter", status: 1}, function (err, g) {
                                callback(err, g._id);
                            })
                        } else {
                            callback(null, g._id);
                        }
                    });
                },
                function (gId, callback) {

                    delete req.body['type'];
                    req.body.group = gId;
                    _CustomerSource.create(_.chain(req.body).cleanRequest(['type', 'query']).mapObject(_.trimValue).value(), function (error, source) {
                        //res.json({code: (error ? 500 : 200), message: error ? error : 'Tạo nguồn thành công < b > ' + group.name + ' < / b > thành công !'})
                        callback(error, source);
                    });

                },
                function (source, callback) {
                    _CustomerFields.find({status: 1}, function (err, cfs) {
                        callback(err, cfs, source);
                    });
                },
                function (cfields, source, callback) {
                    var aggregate = _Customer.aggregate();
                    aggregate._pipeline = _.map(cfields, function (o) {
                        return {$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}};
                    });
                    var _query = _.chain(cfields)
                        .map(function (o) {
                            return _.has(query, o.modalName) ? _.object([o.modalName + '.value'], [_.switchAgg(o.fieldType, query[o.modalName])]) : null;
                        })
                        .compact()
                        .reduce(function (memo, item) {
                            memo[_.keys(item)] = _.values(item)[0];
                            return memo;
                        }, {})
                        .value();

                    if (_.has(query, 'status')) _query.push({status: Number(query.status)});
                    if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});

                    aggregate.exec(function (error, customers, count) {
                        //console.log(customers);
                        //var ids= _.pluck(customers,"_id");
                        //console.log(ids);

                        _Customer.update({$and: customers}, {$push: {source: source._id}}, {multi: true}, function (err) {
                            if (err != null) {
                                console.log(err);
                                callback(err);
                            } else {
                                _CustomerSource.findByIdAndUpdate(source._id, {$set: {amount: customers.length}}, function (err1) {
                                    console.log(err1);
                                    callback(err1)
                                })
                            }


                        })

                    });
                }

            ], function (err, result) {
                res.json({code: (err ? 500 : 200), message: err ? err : 'Tạo nguồn thành công !'})
            });
        }
    } else {
        var _body = _.chain(req.body).cleanRequest().mapObject(_.trimValue).value();
        _CustomerSource.count({name: _body.name}, function (err, c) {
            if (err) return res.json({code: 500, message: JSON.stringify(err)});
            if (c == 0) {
                _CustomerSource.create(_body, function (error, group) {
                    res.json({
                        code: (error ? 500 : 200),
                        message: error ? error : 'Tạo nguồn thành công < b > ' + group.name + ' < / b > thành công !'
                    })
                });
            } else {
                res.json({code: 500, message: 'Đã tồn tại nguồn ' + _body.name});
            }
        })
    }
};

// Validation engine
exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).mapObject(_.trimValue).value();
    //console.log(_query);
    if (_.has(_query, "type")) {
        delete _query['type'];


        _async.waterfall([
            function (callback) {
                _CustomerGroups.findOne({name: "Filter"}, function (err, g) {
                    if (_.isNull(g)) {
                        _CustomerGroup.create({name: "Filter", status: 1}, function (err, g) {
                            callback(null, g._id);
                        })
                    } else {
                        callback(null, g._id);
                    }
                });
            },
            function (gId, callback) {
                _query.group = gId;
                //console.log(28,_query)
                _CustomerSource.findOne(_query).exec(function (error, f) {
                    res.json([req.query.fieldId, _.isNull(f)]);
                });
                callback(null);
            }
        ], function (err, result) {

        });
        //res.json([req.query.fieldId, true]);

    } else {
        if (_.has(_query, 'x-' + _.cleanValidateKey(req.query.fieldId)) && _.isEqual(_query[_.cleanValidateKey(req.query.fieldId)], _query['x-' + _.cleanValidateKey(req.query.fieldId)])) {
            res.json([req.query.fieldId, true]);
        } else {
            delete _query['x-name'];
            _CustomerSource.findOne(_query).exec(function (error, f) {
                res.json([req.query.fieldId, _.isNull(f)]);
            });
        }
    }


};

exports.edit = function (req, res) {
    _CustomerSource.findById(req.params['customersource'], function (error, group) {
        res.json({code: (error ? 500 : 200), message: error ? 'Đã có lỗi xảy ra' : group});
    });
};

exports.update = function (req, res) {
    _CustomerSource.update({_id: req.params['customersource']}, _.chain(req.body).cleanRequest().mapObject(_.trimValue).value(), {new: true}, function (error, group) {
        res.json({code: (error ? 500 : 200), message: error ? error : 'Cập nhật thành công !'})
    });
};

exports.destroy = function (req, res) {
    _CustomerSource._remove(req.params['customersource'], function (error, source) {
        res.json({code: (error ? 500 : 200), message: error ? 'Đã có lỗi xảy ra' : 'Xoá nguồn <b>' + source.removed.name + '</b> thành công !'});
    });
};

