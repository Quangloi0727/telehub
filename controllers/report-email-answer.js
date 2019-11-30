exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        var _authQuery = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: new mongodb.ObjectId(req.session.auth.company._id)}) : {};
        _async.parallel([
            function (next) {
                var aggs = [];
                aggs.push({$match: _authQuery});
                aggs.push({$lookup: {from: 'servicemails', localField: '_id', foreignField: 'idCompany', as: 'servicemails'}});

                _Company.aggregate(aggs, next);
            }
        ], function (err, result) {
            return _.render(req, res, 'report-email-answer', {
                title: "Báo cáo tổng thời gian trả lời email",
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: result[0]
            }, true, err);
        })
    }
}

exports.create = function (req, res) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
    var query = JSON.parse(req.body.data);
    var paging = {};
    var services = [];
    _async.waterfall([
        function (next) {
            var aggs = [];
            aggs.push({$match: query.idCompany ? {_id: new mongodb.ObjectId(query.idCompany)} : {}});
            aggs.push({$lookup: {from: 'servicemails', localField: '_id', foreignField: 'idCompany', as: 'servicemails'}});
            aggs.push({$unwind: {path: '$servicemails', preserveNullAndEmptyArrays: false}});

            aggs.push({ $project: {
                _id: '$servicemails._id',
                name: '$servicemails.name',
                company: '$name',
                created: '$servicemails.created',
                status: '$servicemails.status'
            }});
            _Company.aggregatePaginate(_Company.aggregate(aggs), {page: page, limit: rows}, function (err, result, pageCount, count) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/report-email-answer',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: count}
                );
                services = result;
                paging = paginator.getPaginationData();
                next(err);
            });
        },
        function(next){
            var aggs = [];
            aggs.push({$match: {service: {$in: _.pluck(services, '_id')}, mail_type: 2}});
            if(!_.isEmpty(query.startDate)) aggs.push({$match: {created: {$gte: _moment(query.startDate, "DD/MM/YYYY").startOf('day')._d}}});
            if(!_.isEmpty(query.endDate)) aggs.push({$match: {created: {$lte: _moment(query.endDate, "DD/MM/YYYY").endOf('day')._d}}});
            aggs.push({$lookup: {from: 'mails', localField: '_id', foreignField: 'replyTo', as: 'reply'}});
            aggs.push({$unwind: {path: '$reply', preserveNullAndEmptyArrays: false}});
            aggs.push({$group:{_id:'$_id',service:{$first:'$service'},sendTime:{$min:'$created'},lastReply:{$max:'$reply.created'}}})
            aggs.push({ $project: {
                _id: 1,
                service: 1,
                answerTime: { $subtract: ['$lastReply', '$sendTime']}
            }});
            aggs.push({ $group : {
                _id : '$service' ,
                total: { $sum: '$answerTime' },
                count: {$sum: 1}
            }});
            _Mail.aggregate(aggs).allowDiskUse(true).exec(next);
        }
    ], function (error, timeAnswer) {
        res.json({code: (error ? 500 : 200), services: error ? null : services, timeAnswer: error ? null : timeAnswer, paging: error ? null : paging});
    });
};