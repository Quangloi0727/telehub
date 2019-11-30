/**
 * Created by sonth on 16/02/2016.
 */
// GET
exports.index = {
    json: function (req, res) {
        var _query = req.query;
        //_query = param nhận được theo query string
        _Role.find(_query, function (error, roles) {
            res.json(roles);
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        _async.parallel({
            roleGroup: function (callback) {
                _Role
                    .find({modify: 0}, {name: true, roleGroup: true})
                    .sort({roleGroup: 1})
                    .exec(callback)
            },
            role: function (callback) {
                var sort = _.cleanSort(req.query,'');
                _Role
                    .find()
                    .sort(sort)
                    .paginate(page, rows, function (error, role, total) {
                        var paginator = new pagination.SearchPaginator({
                            prelink: '/role',
                            current: page,
                            rowsPerPage: rows,
                            totalResult: total
                        });
                        var obj = {
                            title: 'Quản lý nhóm quyền hạn',
                            roleList: role,
                            paging: paginator.getPaginationData(),
                            sort: {name: req.query.name},
                            plugins: ['jquery-ui', ['bootstrap-select']]
                        };
                        callback(error, obj);
                    });
            }
        }, function (err, result) {
            _.render(req, res, 'role', _.extend(result.role, {rg: result.roleGroup}), true, err);
        });
    }
};

exports.new = function (req, res) {
    _Role.find({modify: 0}, {name: true, weight: true}).sort({weight: 1}).exec(function (err, result) {
        _.render(req, res, 'role-new', {
            title: 'Tạo mới nhóm quyền hạn',
            roles: result,
            plugins: [['bootstrap-select']]
        }, true, err);
    })
};

exports.create = function (req, res) {
    if (_.has(req.body, 'bulk-update') && req.body['bulk-update']) {
        var _body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
        delete _body['bulk-update'];
        mongodb.MongoClient.connect(_dbPath, function (err, db) {
            if (err) return callback(err);
            var batch = db.collection('roles').initializeUnorderedBulkOp({useLegacyOps: true});
            _.each(_body, function (w, id) {
                batch.find({_id: new mongodb.ObjectId(id)}).updateOne({$set: {weight: Number(w)}});
            });
            batch.execute(function (error, result) {
                db.close();
                if (!error) _.genTree();
                res.json({code: error ? 500 : 200, message: error ? error : result.nModified});
            });
        });
    }
    else {
        req.body['status'] = _.has(req.body, 'status') ? 1 : 0;
        req.body['modify'] = _.has(req.body, 'modify') ? 0 : 1;
        _Role.count({}, function (err, size) {
            req.body['weight'] = Number(size) + 1;
            _Role.create(_.chain(req.body).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value(), function (error, r) {
                if (!error) _.genTree();
                res.json({code: (error ? 500 : 200), message: error ? error : r});
            });
        });
    }
};

// PUT : http://domain.com/skills/:_id
exports.update = function (req, res) {
    if (_.has(req.body, 'edit-status') && _.isEqual(req.body['edit-status'], 'on')) req.body['edit-status'] = 1;
    req.body['status'] = _.has(req.body, 'edit-status') ? req.body['edit-status'] : 0;
    req.body = _.chain(req.body).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value()
    _Role.findByIdAndUpdate(req.params['role'], {
        name: req.body['edit-name'],
        description: req.body['edit-description'],
        status: req.body['status'],
        roleGroup: parseInt(req.body.roleGroup)
    }, {new: true}, function (error, ca) {
        if (!error) _.genTree();
        res.json({code: (error ? 500 : 200), message: error ? error : ca});
    });
};

exports.validate = function (req, res) {
    var _queryExtra = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value();
    _Role.findOne(_query).exec(function (error, ca) {
        res.json([req.query.fieldId, _.isNull(ca)]);
    });
};

exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.role, 'all')) {
        _Role._deleteAll({$in: req.params['role']}, function (error) {
            if (!error) _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ""});
        });
    }
    else {
        _Role._deleteAll({$in: req.body.ids.split(',')}, function (error, ca) {
            if (!error) _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ''});
        });
    }
};