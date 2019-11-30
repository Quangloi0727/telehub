exports.index = {
    json: function (req, res) {
        res.json({});
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        _Articles
            .find(req.query)
            .paginate(page, rows, function (error, result, pageCount) {
                var paginator = new pagination.SearchPaginator({prelink: '/articles-view', current: page, rowsPerPage: rows, totalResult: pageCount});
                _.render(req, res, 'articles-view', {title: result[0].title, body: result[0].body, paging: paginator.getPaginationData()}, true, error);
            });
    }
}
