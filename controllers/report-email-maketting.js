/**
 * Created by NghiaTM on 5/10/2016.
 */


exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        var _authQuery = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: new mongodb.ObjectId(req.session.auth.company._id)}) : {};
        _async.waterfall([
            function (next) {
                _Company.find(_authQuery, next);
            }
        ], function (err, com) {
            return _.render(req, res, 'report-email-maketting', {
                title: "Báo cáo chiến dịch email maketting",
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: com
            }, true, err);
        })
    }
}

exports.create = function (req, res) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

    var query = JSON.parse(req.body.data);
    var sort = _.cleanSort(req.query,'');

    _async.waterfall([
        function (callback) {
            var aggs = [];
            aggs.push({$match: query.idCompany ? {_id: new mongodb.ObjectId(query.idCompany)} : {}});
            aggs.push({$lookup: {from: 'servicemails', localField: '_id', foreignField: 'idCompany', as: 'servicemails'}});
            aggs.push({$unwind: {path: '$servicemails', preserveNullAndEmptyArrays: false}});
            aggs.push({$lookup: {from: 'mailcampaigns', localField: 'servicemails._id', foreignField: 'setting', as: 'mailcampaigns'}});
            aggs.push({$unwind: {path: '$mailcampaigns', preserveNullAndEmptyArrays: false}});
            aggs.push({ $project: {
                _id: '$mailcampaigns._id',
                name: '$mailcampaigns.name',
                company: '$name',
                service: '$servicemails.name',
                created: '$mailcampaigns.created',
                sendDate: '$mailcampaigns.sendDate',
                status: '$mailcampaigns.status',
                type: '$mailcampaigns.type',
                completed: '$mailcampaigns.completed',
                amount: '$mailcampaigns.amount',
            }});

            if(!_.isEmpty(query.startDate)) aggs.push({$match: {created: {$gte: _moment(query.startDate, "DD/MM/YYYY").startOf('day')._d}}});
            if(!_.isEmpty(query.endDate)) aggs.push({$match: {created: {$lte: _moment(query.endDate, "DD/MM/YYYY").endOf('day')._d}}});
            if(!_.isEmpty(sort)) aggs.push({$sort: sort});

            _Company.aggregatePaginate(_Company.aggregate(aggs), {page: page, limit: rows}, function (err, result, pageCount, count) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/report-email-maketting',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: count}
                );
                callback(err, result, paginator.getPaginationData());
            });
        }
    ], function (error, result, paging) {
        res.json({code: (error ? 500 : 200), result: error ? error : result, paging: error ? null : paging});
    });
};