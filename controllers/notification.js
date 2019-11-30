// GET
exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        _Notification
            .find({agentId: new mongodb.ObjectId(req.session.user._id)})
            .sort({ created: -1 })
            .paginate(page, rows, function (error, result, pageCount) { 
                res.json({ code: error ? 500 : 200, result: result });
        });
    }
}

// POST
exports.create = function (req, res) {
    var body = _.pick(req.body, 'agentId', 'url', 'status', 'type');
    if (_.has(body, 'agentId')) body['agentId'] = _.convertObjectId(body.agentId);

    _Notification.create(body, function (error, noti) {
        res.json({ code: error ? 500 : 200, notification: noti });
    });

};

// PUT : http://domain.com/notification/:_id
exports.update = function (req, res) {
    if (_.isEqual(req.params['notification'], 'all')) { 
        _Notification.update({status: 0}, { status: 1, updated: Date.now() }, { multi: true, new: true }, function (error, noti) {
            res.json({ code: error ? 500 : 200});
        });
    }
};

// GET : http://domain.com/notification/:_id
exports.show = function (req, res) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
    _Notification
        .find({ agentId: new mongodb.ObjectId(req.params.notification) })
        .sort({ created: -1 })
        .paginate(page, rows, function (error, result, pageCount) {
            var paginator = new pagination.SearchPaginator({
                prelink: '/notification',
                current: page,
                rowsPerPage: rows,
                totalResult: pageCount
            });
            _.render(req, res, 'notification', {
                title: 'Danh mục cảnh báo',
                notification: result,
                paging: paginator.getPaginationData()
            }, true, error);
    }); 
};
