/**
 * Created by sonth on 16/02/2016.
 */

// GET
exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = req.query;

        var aggregate = _CompanyChannel.aggregate();
        aggregate._pipeline = [{
            $lookup: {
                from: 'companies',
                localField: 'idCompany',
                foreignField: '_id',
                as: 'company'
            }
        }, {$unwind: '$company'}];

        //Điều kiện match aggregate
        //Map theo url client bắn lên
        var _query = _.chain([{name: 'company', type: 1}, {name: 'status', type: 2}, {name: 'name', type: 1}])
            .map(function (o) {
                if (_.isEqual(o.name, 'company')) {
                    return _.has(query, o.name) ? _.object(['company.name'], [_.switchAgg(o.type, query[o.name])]) : null;
                }
                else {
                    return _.has(query, o.name) ? _.object([o.name], [_.switchAgg(o.type, query[o.name])]) : null;
                }
            })
            .compact()
            .reduce(function (memo, item) {
                memo[_.keys(item)] = _.values(item)[0];
                return memo;
            }, {})
            .value();
        if (query.idCompany) _query['idCompany'] = _.convertObjectId(query.idCompany);
        if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});

        //excute aggregate
        _CompanyChannel.aggregatePaginate(aggregate, {
            page: page,
            limit: rows
        }, function (error, channel, pageCount, count) {
            var paginator = new pagination.SearchPaginator({
                prelink: '/company-channel',
                current: page,
                rowsPerPage: rows,
                totalResult: count
            });
            res.json({channel: channel, paging: paginator.getPaginationData()});
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = req.query;

        var aggregate = _CompanyChannel.aggregate();
        aggregate._pipeline = [{
            $lookup: {
                from: 'companies',
                localField: 'idCompany',
                foreignField: '_id',
                as: 'company'
            }
        }, {$unwind: '$company'}];
        //Điều kiện match aggregate
        //Map theo url client bắn lên
        var _query = _.chain([{name: 'company', type: 1}, {name: 'status', type: 2}, {name: 'name', type: 1}])
            .map(function (o) {
                if (_.isEqual(o.name, 'company')) {
                    return _.has(query, o.name) ? _.object(['company.name'], [_.switchAgg(o.type, query[o.name])]) : null;
                }
                else {
                    return _.has(query, o.name) ? _.object([o.name], [_.switchAgg(o.type, query[o.name])]) : null;
                }
            })
            .compact()
            .reduce(function (memo, item) {
                memo[_.keys(item)] = _.values(item)[0];
                return memo;
            }, {})
            .value();
        if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});

        //excute aggregate
        _CompanyChannel.aggregatePaginate(aggregate, {
            page: page,
            limit: rows
        }, function (error, channel, pageCount, count) {
            var paginator = new pagination.SearchPaginator({
                prelink: '/company-channel',
                current: page,
                rowsPerPage: rows,
                totalResult: count
            });
            //render view
            _.render(req, res, 'company-channel', {
                title: 'Quản lý channel',
                chatPort: _config['services'].chat,
                channel: channel,
                paging: paginator.getPaginationData(),
                sort: {name: req.query.name},
                plugins: [['bootstrap-select']]
            }, true, error);
        });
    }
};

//GET
exports.new = function (req, res) {
    //Chuyển trang tạo mới kênh
    _Company.find().exec(function (err, resp) {
        if (!err) _.render(req, res, 'company-channel-new', {
            title: 'Tạo mới channel',
            companies: resp,
            plugins: [['bootstrap-select'], ['mrblack-table']]
        }, true);
    });
};

//POST
exports.create = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    if (_.has(req.body, 'formStatus') && _.isEqual(req.body['formStatus'], 'on')) req.body['formStatus'] = 1;
    if (_.has(req.body, 'emailStatus') && _.isEqual(req.body['emailStatus'], 'on')) req.body['emailStatus'] = 1;
    if (_.has(req.body, 'phoneStatus') && _.isEqual(req.body['phoneStatus'], 'on')) req.body['phoneStatus'] = 1;
    if (_.has(req.body, 'serviceStatus') && _.isEqual(req.body['serviceStatus'], 'on')) req.body['serviceStatus'] = 1;
    req.body['status'] = _.has(req.body, 'status') ? parseInt(req.body['status']) : 0;
    req.body['formStatus'] = _.has(req.body, 'formStatus') ? parseInt(req.body['formStatus']) : 0;
    req.body['emailStatus'] = _.has(req.body, 'emailStatus') ? parseInt(req.body['emailStatus']) : 0;
    req.body['phoneStatus'] = _.has(req.body, 'phoneStatus') ? parseInt(req.body['phoneStatus']) : 0;
    req.body['serviceStatus'] = _.has(req.body, 'serviceStatus') ? parseInt(req.body['serviceStatus']) : 0;

    req.body.idCompany = new mongodb.ObjectId(req.body.idCompany);
    req.body['alias'] = req.body.name + Date.now();
    req.body['name'] = _.chain(req.body.name).trimValueNotLower().value();

    //Tạo mới kênh dựa vào body client bắn lên
    _CompanyChannel.create(req.body, function (error, r) {
        _.genTree(); //gen tenant tree
        res.json({code: (error ? 500 : 200), message: error ? error : r});
    });
};

//GET
exports.edit = function (req, res) {
    //load trang chỉnh sửa thông tin kênh
    _async.parallel({
        one: function (cb) {
            //Lây danh sách công ty
            _Company.find().exec(function (err, resp) {
                cb(null, resp);
            });
        },
        two: function (cb) {
            //Lấy thông tin kênh cần sửa
            _CompanyChannel.findById(req.params.companychannel, function (err, channel) {
                cb(null, channel);
            });
        }
    }, function (err, resp) {
        if (!err) _.render(req, res, 'company-channel-edit', {
            title: 'Chỉnh sửa channel',
            companies: resp.one,
            channel: resp.two,
            plugins: [['bootstrap-select'], ['mrblack-table']]
        }, true);
    });
};

// PUT
exports.update = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    if (_.has(req.body, 'formStatus') && _.isEqual(req.body['formStatus'], 'on')) req.body['formStatus'] = 1;
    if (_.has(req.body, 'emailStatus') && _.isEqual(req.body['emailStatus'], 'on')) req.body['emailStatus'] = 1;
    if (_.has(req.body, 'phoneStatus') && _.isEqual(req.body['phoneStatus'], 'on')) req.body['phoneStatus'] = 1;
    if (_.has(req.body, 'serviceStatus') && _.isEqual(req.body['serviceStatus'], 'on')) req.body['serviceStatus'] = 1;
    req.body['status'] = _.has(req.body, 'status') ? parseInt(req.body['status']) : 0;
    req.body['formStatus'] = _.has(req.body, 'formStatus') ? parseInt(req.body['formStatus']) : 0;
    req.body['emailStatus'] = _.has(req.body, 'emailStatus') ? parseInt(req.body['emailStatus']) : 0;
    req.body['phoneStatus'] = _.has(req.body, 'phoneStatus') ? parseInt(req.body['phoneStatus']) : 0;
    req.body['serviceStatus'] = _.has(req.body, 'serviceStatus') ? parseInt(req.body['serviceStatus']) : 0;
    req.body['name'] = _.chain(req.body.name).trimValueNotLower().value();
    //Update thông tin kênh
    _CompanyChannel.findByIdAndUpdate(req.params['companychannel'], req.body, {new: true}, function (error, cc) {
        _.genTree();
        res.json({code: (error ? 500 : 200), message: error ? error : cc});
    });
};

//phục vụ validate form
exports.validate = function (req, res) {
    req.query.idCompany = new mongodb.ObjectId(req.query.company);
    if (_.has(req.query, 'name')) {
        //Validate tên kênh
        req.query['name'] = _.chain(req.query.name).trimValueNotLower().value();
        if (!_.has(req.query, 'currName') || !_.isEqual(req.query.name, req.query.currName)) {
            _CompanyChannel.findOne({idCompany: req.query.idCompany, name: req.query.name}).exec(function (error, ca) {
                res.json({code: _.isNull(ca)});
            });
        }
        else {
            res.json({code: true});
        }
    }
    else {
        //Validate website
        req.query['website'] = _.chain(req.query.website).trimValueNotLower().value();
        if (!_.has(req.query, 'currWebsite') || !_.isEqual(req.query.website, req.query.currWebsite)) {
            _CompanyChannel.findOne({
                idCompany: req.query.idCompany,
                website: req.query.website
            }).exec(function (error, ca) {
                res.json({code: _.isNull(ca)});
            });
        }
        else {
            res.json({code: true});
        }
    }
};

//DELETE
exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.companychannel, 'all')) {
        //Xóa 1 kênh
        _CompanyChannel._deleteAll({$in: req.params['companychannel']}, function (error) {
            _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ""});
        });
    }
    else {
        //Xóa hàng loạt
        _CompanyChannel._deleteAll({$in: req.body.ids.split(',')}, function (error, ca) {
            _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ''});
        });
    }
};