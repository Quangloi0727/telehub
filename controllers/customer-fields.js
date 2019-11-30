exports.index = {
    json: function (req, res) {
        var _query = req.query;
        _CustomerFields.find(_query, function (error, users) {
            res.json(users);
        });
    },
    html: function (req, res) {
        _CustomerFields.find({}, function (error, f) {
            _.render(req, res, 'customer-fields', {title: 'Dữ liệu khách hàng', fields: f}, true, error);
        });
    }
};

// GET : http://domain.com/customer-fields/new
exports.new = function (req, res) {
    _.render(req, res, 'customer-fields-new', {title: 'Tạo mới trư�?ng dữ liệu khách hàng', plugins: [['bootstrap-select'], ['nouislider']]}, true);
};

exports.create = function (req, res) {
    console.log(req.body);
    var _body = _.chain(req.body).cleanRequest().toLower().value();
    _body['modalName'] = 'field_' + _.chain(req.body.displayName).cleanString().underscored().value();
    if (_.has(_body, 'fieldValue')) _body['fieldValue'] = _.compact(_body.fieldValue);
    _CustomerFields.create(_body, function (error, cf) {
        if (error) return res.json({code: 500, message: error});
        _CCKFields[cf.modalName] = {db: mongoose.model(cf.modalName, mongoose.Schema(_.defaultSchema(Number(cf.fieldType))), cf.modalName), type: cf.fieldType};
        res.json({code: (error ? 500 : 200), message: error ? error : cf});
    });
};

// GET : http://domain.com/customer-fields/:_id/edit
exports.edit = function (req, res) {
    _CustomerFields.findOne({_id: req.params['customerfield']}, function (error, cf) {
        _.render(req, res, 'customer-fields-edit', {title: 'Chỉnh sửa trư�?ng dữ liệu ' + (!_.isNull(cf) ? '<b>' + cf.displayName + '</b>' : ''), plugins: [['bootstrap-select'], ['nouislider']], field: cf}, !_.isNull(cf), error);
    });
};

// PUT : http://domain.com/customer-fields/:_id
exports.update = function (req, res) {
    var _body = _.chain(req.body).cleanRequest().toLower().value();
    if (_.has(_body, 'fieldValue'))_body['fieldValue'] = _.compact(_body.fieldValue);
    _CustomerFields.update({_id: req.params['customerfield']}, {$set: _body}, function (error, cf) {
        res.json({code: (error ? 500 : 200), message: error ? error : cf});
    });
};

// Validation engine
exports.validate = function (req, res) {
    _CustomerFields.findOne(_.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).toLower().value()).exec(function (error, f) {
        res.json([req.query.fieldId, _.isNull(f)]);
    });
};

// DELETE http://domain.com/customer/:_id
exports.destroy = function (req, res) {
    _CustomerFields.findByIdAndRemove(req.params['customerfield'], function (error, field) {
        if (error || _.isNull(field)) return res.json({code: 404, message: 'Trư�?ng dữ liệu đã được xoá !'});
        mongoose.connection.collections[field.modalName].drop(function (status) {
            delete _CCKFields[field.modalName];
            res.json({code: (status ? 200 : 500), message: status ? 'Xoá thành công !' : '�?ã có lỗi xảy ra'});
        });
    });
};
