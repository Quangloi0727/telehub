exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = _.cleanRequest(req.query);
        var aggregate = _CustomerGroups.aggregate();
        aggregate._pipeline = [];
        aggregate._pipeline.push({$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}});
        if (!_.isEmpty(query)) aggregate._pipeline.push({$match: query});
        aggregate._pipeline.push({$sort: {'sources.name': -1}});
        _CustomerGroups.aggregatePaginate(aggregate, {page: (_.isEqual(page, 1) ? 0 : ((page - 1) * rows)), limit: rows}, function (error, groups, pageCount, count) {
            var x = _.chain(groups)
                .each(function (g) {
                    g.sources = _.sortBy(g.sources, 'amount').reverse();
                    g.total = _.reduce(g.sources, function (memo, num) {
                        return memo + num.amount;
                    }, 0);
                })
                .value();
            res.json(x);
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = _.cleanRequest(req.query);
        var aggregate = _CustomerGroups.aggregate();
        aggregate._pipeline = [];
        aggregate._pipeline.push({$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}});
        if (!_.isEmpty(query)) aggregate._pipeline.push({$match: query});
        aggregate._pipeline.push({$sort: {'sources.name': -1}});
        _CustomerGroups.aggregatePaginate(aggregate, {page: (_.isEqual(page, 1) ? 0 : ((page - 1) * rows)), limit: rows}, function (error, groups, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink: '/customer-groups', current: page, rowsPerPage: rows, totalResult: count});
            _.render(req, res, 'customer-groups', {
                title: 'Nhóm khách hàng',
                paging: paginator.getPaginationData(),
                groups: _.chain(groups)
                    .each(function (g) {
                        g.sources = _.sortBy(g.sources, 'amount').reverse();
                        g.totals = _.reduce(g.sources, function (memo, i) {
                            return memo + i.amount;
                        }, 0);
                    })
                    .value()
            }, true);
        });
    }
}

exports.create = function (req, res) {

    _CustomerGroups.create(_.chain(req.body).cleanRequest().mapObject(_.trimValue).value(), function (error, group) {
        res.json({code: (error ? 500 : 200), message: error ? error : 'Tạo nhóm < b > ' + group.name + ' < / b > thành công !'})
    });
};

exports.update = function (req, res) {
    _CustomerGroups.update({_id: req.params['customergroup']}, _.chain(req.body).cleanRequest().mapObject(_.trimValue).value(), {new: true}, function (error, group) {
        res.json({code: (error ? 500 : 200), message: error ? error : 'Cập nhật thành công !'})
    });
};

exports.edit = function (req, res) {
    _CustomerGroups.findById(req.params['customergroup'], function (error, group) {
        res.json({code: (error ? 500 : 200), message: error ? 'Đã có lỗi xảy ra' : group});
    });
};

exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).mapObject(_.trimValue).value();
    if (_.has(_query, 'x-' + _.cleanValidateKey(req.query.fieldId)) && _.isEqual(_query[_.cleanValidateKey(req.query.fieldId)], _query['x-' + _.cleanValidateKey(req.query.fieldId)])) {
        res.json([req.query.fieldId, true]);
    } else {
        delete _query['x-' + _.cleanValidateKey(req.query.fieldId)];
        _CustomerGroups.findOne(_query).exec(function (error, f) {
            res.json([req.query.fieldId, _.isNull(f)]);
        });
    }
};

exports.destroy = function (req, res) {
    _CustomerGroups._remove(req.params['customergroup'], function (error, group) {
        res.json({code: (error ? 500 : 200), message: error ? 'Đã có lỗi xảy ra' : 'Xoá nhóm <b>' + group.removed.name + '</b> thành công !'});
    });
};
