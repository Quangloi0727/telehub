exports.index = {
    json: function (req, res) {
        var _agg = _.map(cfields, function (o) {
            return {$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}};
        });
        var _query = _.chain(cfields).map(function (o) {
            return _.has(query, o.modalName) ? _.object([o.modalName + '.value'], [_.switch(o.fieldType, [1, 2, 3, 4, 5, 6], [_.regexAgg(query[o.modalName])])]) : null;
        }).compact().value();
        if (_query.length) _agg.push({$match: {$or: _query}});
        _Customer.aggregatePaginate(_agg, {page: 1, limit: 2}, function (error, customers) {
            var paginator = new pagination.SearchPaginator({prelink: '/customer', current: page, rowsPerPage: rows, totalResult: customers.length});
            res.json({fields: cfields, customers: customers, paging: paginator.getPaginationData()});
        });
    },
    html: function (req, res) {
        _async.waterfall([
            function (callback) {
                _CustomerFields.find({status: 1}, callback);
            },
            function (cfields, callback) {
                var _query = _.map(cfields, function (o) {
                    return {$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}};
                });
                var _list = {_id: '$_id', created: '$created'};
                _.each(_.keys(_.groupBy(cfields, 'modalName')), function (i) {
                    _list[i] = '$' + i;
                });
                _query.push(
                    {$group: {_id: "$field_so_dien_thoai.value", list: {$push: _list}, count: {$sum: 1}}},
                    {$match: {count: {$gte: 2}}},
                    {$sort: {count: -1}}
                );
                _Customer.aggregate(_query, function (error, customers) {
                    callback(error, {fields: cfields, customers: customers});
                });
            }
        ], function (error, result) {
            _.render(req, res, 'customer-duplicated', _.extend({title: 'Dữ liệu khách hàng bị trùng', plugins: [['bootstrap-select'], ['bootstrap-datetimepicker']]}, result), true, error);
        });
    }
};
