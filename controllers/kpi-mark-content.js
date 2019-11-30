/**
 * Created by luongvanlam on 5/19/16.
 */
var titleIndex = 'Tiêu chí chấm điểm';
var titleNew = 'Tạo mới tiêu chí chấm điểm';
var pagePrefix = 'kpi-mark-content{0}';
var contentType = ['Chấm điểm', 'Mức độ', 'Tính toán'];

exports.index = {
    //Todo: Query và trả về các tiêu chí chấm điểm
    json: function(req, res){
        if (_.has(req.query, 'collection')){
            var objectId = _.convertObjectId(req.query.collection);
            _KpiMarking.findOne({markCollectionId: objectId}, function(err, result){
                if (result == null){
                    res.json({code: 200});
                }
                else{
                    res.json({code: 500, message: 'Chỉ có thể sửa bộ tiêu chí khi chưa chấm điểm!'});
                }
            });

        }
        else{
            res.json({code: 500});
        }
    },
    html: function(req, res){
        if (!_.has(req.query, 'collection') || !mongodb.ObjectID.isValid(req.query.collection)) {
            return res.render('404', {title: '404 | Không tìm thấy bộ tiêu chí'});
        }

        var collectionId = _.convertObjectId(req.query.collection);
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var agg = [];

        agg.push({$match: {idCollection: collectionId}});
        if (_.has(req.query, 'name')) {
            agg.push({$match: {name: {$regex: new RegExp(_.stringRegex(req.query.name), 'i')}}})
        }
        if (_.has(req.query, 'status')) {
            agg.push({$match: {status: parseInt(req.query.status)}})
        }
        if (_.has(req.query, 'type')) {
            agg.push({$match: {type: parseInt(req.query.type)}})
        }

        agg.push({$sort: {weight: 1}});

        _KpiMarkContent.aggregate(agg, function (err, result) {
            _.render(req, res, pagePrefix.zFormat(''), {
                title: titleIndex,
                kpi: result,
                kpiType: contentType,
                plugins: [['bootstrap-select'], ['jquery-ui']]
            }, true, err);
        });
    }

};

exports.new = function (req, res) {
    //Todo: Trang tạo mới tiêu chí chấm điểm
    if (!_.has(req.query, 'collection') || !mongodb.ObjectID.isValid(req.query.collection)) {
        return res.render('404', {title: '404 | Không tìm thấy bộ tiêu chí'});
    }

    var collection = _.convertObjectId(req.query.collection);
    _KpiMarkContent.find({
        idCollection: collection,
        status: 1,
        $or: [
            {type: 0},
            {type: 1}
        ]
    }, {name: 1}, function (err, result) {
        _.render(req, res, pagePrefix.zFormat('-new'), {
            title: titleNew,
            kpi: result,
            plugins: [['bootstrap-select']]
        }, true, err);
    });
};

exports.create = function (req, res) {
    //Todo: Tạo mới tiêu chí chấm điểm
    if (!_.has(req.query, 'collection') || !mongodb.ObjectID.isValid(req.query.collection)) {
        return res.render('404', {title: '404 | Không tìm thấy bộ tiêu chí'});
    }

    if (_.has(req.body, 'bulk-update')) {
        updateWeight(req, res);
    } else {
        createNewContent(req, res);
    }
};

exports.validate = function (req, res) {
    //Todo: Check xem tiêu chí mới có bị trùng không
    var temp = _.chain(req.query).cleanRequest().replaceMultiSpaceAndTrim().value();
    var collection = _.convertObjectId(req.query.collection);

    var query = {name: temp.name, idCollection: collection};

    if (_.has(temp, 'currentId')) {
        query['_id'] = {$ne: _.convertObjectId(req.query.currentId)};
    }

    _KpiMarkContent.findOne(query).exec(function (error, f) {
        res.json([req.query.fieldId, _.isNull(f)]);
    });
};

exports.edit = function (req, res) {
    //Todo: Load trang edit bộ tiêu chí
    if (!_.has(req.query, 'collection') || !mongodb.ObjectID.isValid(req.query.collection)) {
        return res.render('404', {title: '404 | Không tìm thấy bộ tiêu chí'});
    }

    var contentId = _.convertObjectId(req.params.kpimarkcontent);
    var collection = _.convertObjectId(req.query.collection);

    _async.parallel({
        current: function (callback) {
            _KpiMarkContent.findOne({_id: contentId}, callback);
        },
        kpi: function (callback) {
            _KpiMarkContent.find({
                _id: {$ne: contentId},
                idCollection: collection,
                status: 1,
                $or: [
                    {type: 0},
                    {type: 1}
                ]
            }, callback);
        }
    }, function (err, result) {
        _.render(req, res, pagePrefix.zFormat('-edit'), {
            title: titleNew,
            currentKpi: result.current,
            kpi: result.kpi,
            plugins: [['bootstrap-select']]
        }, true, err);
    });
};

exports.update = function (req, res) {
    //Todo: Update tiêu chí chấm điểm
    if (!_.has(req.query, 'collection') || !mongodb.ObjectID.isValid(req.query.collection)) {
        return res.render('404', {title: '404 | Không tìm thấy bộ tiêu chí'});
    }
    //Todo: Tạo mới nội dung
    createNewContent(req, res, _.convertObjectId(req.params.kpimarkcontent));
};

exports.destroy = function (req, res) {
    //Todo: Xóa tiêu chí chấm điểm
    var cId = _.convertObjectId(req.params.kpimarkcontent);
    _KpiMarkContent.remove({_id: cId}, function (err, result) {
        res.json({code: err ? 500 : 200, message: err ? err.message : result});
    })
};

function createNewContent(req, res, currentId) {
    _async.waterfall([
        function (callback) {
            _KpiMarkContent
                .findOne({})
                .sort({weight: -1})
                .limit(1)
                .exec(function (err, result) {
                    if (err) return callback(err, result);
                    var weight = 1;

                    if (!_.isNull(result)) {
                        weight = result.weight + 1;
                    }

                    callback(err, weight);
                });
        },
        function (weight, callback) {
            req.body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
            var collection = _.convertObjectId(req.query.collection);
            var type = parseInt(req.body.fieldType);
            var query = {
                idCollection: collection,
                type: type,
                status: parseInt(req.body.status),
                name: req.body.name
            };

            if (currentId) {
                query['updated'] = new Date();
                query['updateBy'] = _.convertObjectId(req.session.user._id);
            } else {
                query['createBy'] = _.convertObjectId(req.session.user._id);
                query['weight'] = weight;
            }

            switch (type) {
                case 0:
                    if (req.body.minValue == '' && req.body.maxValue == '') {
                        query['content'] = [];
                    } else {
                        query['content'] = [parseInt(req.body.minValue), parseInt(req.body.maxValue)];
                    }
                    break;
                case 1:
                    query['content'] = req.body.fieldValue;
                    break;
                case 2:
                    query['content'] = [];
                    query['contentBase64'] = req.body.fnTextAreaEncode;
                    break;
            }
            query['modalName'] = _.chain(query['name']).cleanString().underscored().value();
            if (currentId) {
                _KpiMarkContent.update({_id: currentId}, {$set: query}, callback);
            } else {
                _KpiMarkContent.create(query, callback);
            }
        }
    ], function (err, result) {
        res.json({code: err ? 500 : 200, message: err ? err.message : result});
    });
}

function updateWeight(req, res) {
    var collection = _.convertObjectId(req.query.collection);
    var _body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
    delete _body['bulk-update'];

    var batch = mongoClient.collection('kpimarkcontents').initializeUnorderedBulkOp({useLegacyOps: true});

    _.each(_body, function (value, key) {
        batch.find({_id: _.convertObjectId(key)}).updateOne({$set: {weight: parseInt(value)}});
    });

    if (batch.s.currentIndex == 0) {
        return res.json({code: 200, message: 'Không có dữ liệu cần cập nhật'});
    }

    batch.execute(function (error, result) {
        res.json({code: error ? 500 : 200, message: error ? error : result.nModified});
    });
}