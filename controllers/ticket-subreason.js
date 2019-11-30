exports.create = function (req, res) {
    if (_.has(req.body['priority'])) req.body['priority'] = Number(req.body['priority']);
    if (_.has(req.body, 'bulk-update') && req.body['bulk-update']) {
        var _body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
        delete _body['bulk-update'];
        mongodb.MongoClient.connect(_dbPath, function (err, db) {
            if (err) return callback(err);
            var batch = db.collection('ticketsubreasons').initializeUnorderedBulkOp({useLegacyOps: true});
            _.each(_body, function (p, id) {
                batch.find({_id: new mongodb.ObjectId(id)}).updateOne({$set: {priority: Number(p)}});
            });
            batch.execute(function (error, result) {
                db.close();
                res.json({code: error ? 500 : 200, message: error ? error : result.nModified});
            });
        });
    }
    else {
        _TicketSubreason.find({name: req.body['name'], idReason: req.body['idReason']}, function (err, r) {
            if (r.length == 0) {
                _async.waterfall([function (cb) {
                    if (_.has(req.body['priority'])) req.body['priority'] = Number(req.body['priority']);
                    req.body['status'] = (_.has(req.body, 'status')&&req.body['status']!=0) ? 1 : 0;
                    req.body['createdBy'] = req.session.user._id;
                    var _body = _.chain(req.body).cleanRequest().value();
                    cb(null, _body);
                }], function (err, _body) {
                    _TicketSubreason.create(_body, function (error, result) {
                        //_.log(29, _body);
                        _.log(30, error);
                        res.json({code: error ? 500 : 200, message: error ? error : result});
                    });
                })
            }
        });
    }
};

exports.update = function (req, res) {
    req.body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
    req.body['status'] = (_.has(req.body, 'status')&&req.body['status']!=0) ? 1 : 0;
    req.body['updatedDate'] = _moment()._d;
    _TicketSubreason.update({_id: req.params['ticketsubreason']}, req.body, {new: true}, function (error, group) {
        res.json({code: (error ? 500 : 200), message: error ? error : 'Cập nhật thành công !'})
    });
};

exports.destroy = function (req, res) {
    _TicketSubreason.remove({_id:req.params['ticketsubreason']}, function (error, sub) {
        res.json({
            code: (error ? 500 : 200),
            message: error ? error : 'Xóa thành công'
        });
    });
};

exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value();
    if (_.has(_query, 'x-' + _.cleanValidateKey(req.query.fieldId)) && _.isEqual(_query[_.cleanValidateKey(req.query.fieldId)], _query['x-' + _.cleanValidateKey(req.query.fieldId)])) {
        res.json([req.query.fieldId, true]);
    } else {
        delete _query['x-' + _.cleanValidateKey(req.query.fieldId)];
        _TicketSubreason.findOne(_query).exec(function (error, f) {
            res.json([req.query.fieldId, _.isNull(f)]);
        });
    }
};