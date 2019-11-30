exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = req.query;
        var aggregate = _CustomerImportHistory.aggregate();
        var _query = _.has(query, 'created') ?  _.object(['created'], [_.switchAgg(6, query['created'])]) : {};
        aggregate._pipeline.push({$match: {$and: [_query]}});
        aggregate._pipeline.push({$sort: {created : -1}});
        _CustomerImportHistory.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, history, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink: '/customer-import-history', current: page, rowsPerPage: rows, totalResult: count});
            _.render(req, res, 'customer-import-history', {title: 'Lịch sử nhập liệu', historyList: history, paging: paginator.getPaginationData(), plugins: ['moment',['bootstrap-datetimepicker']]}, true, error);
        });
//        _CustomerImportHistory
//            .find()
//            .paginate(page, rows, function (error, history, total) {
//                var paginator = new pagination.SearchPaginator({prelink: '/customer-import-history', current: page, rowsPerPage: rows, totalResult: total});
//                _.render(req, res, 'customer-import-history', {title: 'Lịch sử nhập liệu', historyList: history, paging: paginator.getPaginationData(), plugins: ['moment',['bootstrap-datetimepicker']]}, true, error);
//            });
    }
};
