
const fs = require('fs')
exports.index = {
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = {};
        _Appointmentconfigs
            .find(req.query)
            .sort(_.cleanSort(req.query))
            .paginate(page, rows, function (error, result, pageCount) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/appointmentconfigs',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: pageCount
                });
                _Appointmentconfigs.find({}, function (err, appointmentconfigs) {
                        _.render(req, res, 'appointmentconfigs', {
                            title: 'Cấu hình đặt hẹn',
                            appointmentconfigs: appointmentconfigs,
                            paging: paginator.getPaginationData(),
                            plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']]
                        }, true, error);
                })
            });
        }
    }
exports.edit = function (req, res) {
    _Appointmentconfigs.findById(req.params.appointmentconfig).then(result => {
        _.render(req, res, 'appointmentconfigs-edit', {
            title:'Sửa thông tin cuộc hẹn',
            appointmentconfigs: result,
            plugins: [['bootstrap-select']]
        }, true)
    })
}
exports.update = function (req, res) {
    _Appointmentconfigs.findById(req.params.appointmentconfig,function (err,dulieu) {
        if (err) return handleError(err);
        var khunggiokham=req.body.khunggiokham;
        var result=khunggiokham.split(",");
        dulieu.maxAllowed[0].fieldValue=req.body.sldatcho;
        dulieu.timeFrame[0].fieldValue=result;
        dulieu.save();
        res.redirect('/appointmentconfigs');
    })
};

