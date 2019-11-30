/**
 * Created by Computer on 7/4/2016.
 */

exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        _Users.find({}, function (error, agent) {
            var match = {}, created = {};
            var endResult = [], aggregateMatch = [], idAgent = [];
            var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
            var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
            var sort = _.cleanSort(req.query,'');

            if(_.has(req.query, "startDate")){
                created.$gt = _moment(req.query.startDate + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d;
                match.created = created;
            }
            if(_.has(req.query, "endDate")){
                created.$lt = _moment(req.query.endDate + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d;
                match.created = created;
            }
            if(_.has(req.query, "idAgent")){
                _.each(req.query.idAgent, function (loop, i) {
                    idAgent.push(_.convertObjectId(loop));
                })
                match.idAgent = {$in: idAgent};
                //match.idAgent = _.convertObjectId(req.query.idAgent);
            }
            if(_.has(req.query, "periodTime")){
                match.hour = {$in: [parseInt(req.query.periodTime)*2,parseInt(req.query.periodTime)*2+1]};
                aggregateMatch.push({$project: {
                    hour: {$hour: {$add: ["$created", 7*60*60*1000]}},
                    idService: 1,
                    idAgent: 1,
                    updateBy: 1 ,
                    idService:1,
                    idCustomer: 1,
                    ticketReasonCategory: 1,
                    ticketReason: 1,
                    ticketSubreason: 1,
                    status: 1,
                    note: 1,
                    created: 1,
                    updated: 1
                }});
            }
            aggregateMatch.push({$match: match});
            if(!_.isEmpty(sort)) aggregateMatch.push({$sort: sort});

            aggregateMatch.push({$lookup: {from: 'servicemails', localField: 'idService', foreignField: '_id', as: 'idService'}});
            aggregateMatch.push({$unwind: { path: '$idService', preserveNullAndEmptyArrays: true }});
            aggregateMatch.push({$lookup: {from: 'companies', localField: 'idService.idCompany', foreignField: '_id', as: 'idService.idCompany'}});
            aggregateMatch.push({$unwind: { path: '$idService.idCompany', preserveNullAndEmptyArrays: true }});
            aggregateMatch.push({$lookup: {from: 'users', localField: 'idAgent', foreignField: '_id', as: 'idAgent'}});
            aggregateMatch.push({$unwind: { path: '$idAgent', preserveNullAndEmptyArrays: true }});
            aggregateMatch.push({$lookup: {from: 'users', localField: 'updateBy', foreignField: '_id', as: 'updateBy'}});
            aggregateMatch.push({$unwind: { path: '$updateBy', preserveNullAndEmptyArrays: true }});
            aggregateMatch.push({$lookup: {from: 'customerindex', localField: 'idCustomer', foreignField: '_id', as: 'idCustomer'}});
            aggregateMatch.push({$unwind: { path: '$idCustomer', preserveNullAndEmptyArrays: true }});
            aggregateMatch.push({$lookup: {from: 'ticketreasoncategories', localField: 'ticketReasonCategory', foreignField: '_id', as: 'ticketReasonCategory'}});
            aggregateMatch.push({$unwind: { path: '$ticketReasonCategory', preserveNullAndEmptyArrays: true }});
            aggregateMatch.push({$lookup: {from: 'ticketreasons', localField: 'ticketReason', foreignField: '_id', as: 'ticketReason'}});
            aggregateMatch.push({$unwind: { path: '$ticketReason', preserveNullAndEmptyArrays: true }});
            aggregateMatch.push({$lookup: {from: 'ticketsubreasons', localField: 'ticketSubreason', foreignField: '_id', as: 'ticketSubreason'}});
            aggregateMatch.push({$unwind: { path: '$ticketSubreason', preserveNullAndEmptyArrays: true }});
            aggregateMatch.push({$sort:{created:-1}});
            aggregateMatch.push({
                $project: {
                    _id: 1,
                    agent: {$concat: ['$idAgent.displayName', ' (', '$idAgent.name', ')']},
                    company: '$idService.idCompany.name',
                    customer: '$idCustomer',
                    ticketReasonCategory: '$ticketReasonCategory.name',
                    ticketReason: '$ticketReason.name',
                    ticketSubreason: '$ticketSubreason.name',
                    status: 1,
                    note: 1,
                    created: 1,
                    updated: 1,
                    updateBy: {$concat: ['$updateBy.displayName', ' (', '$updateBy.name', ')']}
                }
            });


            var aggregate = _TicketsMail.aggregate(aggregateMatch)
            _TicketsMail.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, resultTicket, pageCount, count) {
                var paginator = new pagination.SearchPaginator({prelink: '/report-detail-tickets-email', current: page, rowsPerPage: rows, totalResult: count});
                _CustomerSource.populate(resultTicket, {path: 'customer.sources', select: 'name'}, function(err, newItems){
                    _.render(req, res, "report-detail-tickets-email", {
                        endResult: _.chain(newItems).map(function(item){
                            if(item.customer && item.customer.sources)
                                item.customer.sources = item.customer ? _.pluck(item.customer.sources, 'name').join(', ') : '';
                            return item;
                        }).compact().value(),
                        agent: agent,
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel'],
                        paging: paginator.getPaginationData()
                    }, true, err && error);
                });
            });
        });
    }
}
