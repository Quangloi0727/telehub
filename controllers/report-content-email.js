/**
 * Created by Computer on 7/7/2016.
 */

exports.index = ({
    json: function (req, res) {

    },
    html: function (req, res) {
        if (req.session.auth.company) {
            if (!req.session.auth.company.leader) {
                return _.render(req, res, "report-content-email", {
                    agent: [],
                    company: [],
                    endResult: [],
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel'],
                    paging: []
                }, true, new Error("Không đủ quyền truy cập"));
            }
        }
        _Company.find(req.session.auth.company?{_id:req.session.auth.company}:{},function(err,company){
            _AgentGroups.distinct("_id",{idParent: {$in: _.pluck(company, "_id")}}, function (err, group) {
                _Users.find({$or: [{'agentGroupLeaders.group': {$in: group}}, {'agentGroupMembers.group': {$in: group}}, {'companyLeaders.company': {$in: company}}]}, function (error, agent) {
                    if (_.isEmpty(req.query)) {
                        return _.render(req, res, "report-content-email", {
                            agent: agent,
                            company:company,
                            endResult: [],
                            plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel'],
                            paging: []
                        }, true, error);
                    }
                    else {
                        var match = {}, created = {};
                        var idAgent = [];
                        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
                        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

                        if (_.has(req.query, "startDate")) {
                            created.$gt = _moment(req.query.startDate + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d;
                            match.created = created;
                        }
                        if (_.has(req.query, "endDate")) {
                            created.$lt = _moment(req.query.endDate + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d;
                            match.created = created;
                        }
                        if (_.has(req.query, "idAgent")) {
                            match.idAgent = {$in: _.arrayObjectId(req.query.idAgent)};
                        }
                        match.status = 2;
                        match.idAgent = {$ne:null};
                        _ServicesMail.distinct("_id",{idCompany: req.query.idCompany? _.convertObjectId(req.query.idCompany):{$in:company}}, function(err,service){
                            match.idService = {$in:service};
                            _TicketsMail.find(match).populate("mailId idAgent").sort({created:-1}).paginate(page,rows,function(err,result,total){
                                var paginator = new pagination.SearchPaginator({
                                                prelink: '/report-content-email',
                                                current: page,
                                                rowsPerPage: rows,
                                                totalResult: total
                                            });
                                _.render(req, res, "report-content-email", {
                                    agent: agent,
                                    company:company,
                                    endResult: result,
                                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel'],
                                    paging: paginator.getPaginationData()
                                }, true, err);
                            })
                        })
                        //aggregateMatch.push({$match: match});
                        //var aggregate = _TicketsMail.aggregate(aggregateMatch);
                        //_TicketsMail.aggregatePaginate(aggregate, {
                        //    page: page,
                        //    limit: rows
                        //}, function (error, resultMail, pageCount, count) {
                        //    _async.each(resultMail, function (_query, callback) {
                        //        _async.parallel({
                        //            users: function (next) {
                        //                if (_query.agent != null) {
                        //                    _Users.findById(_query.agent, next);
                        //                }
                        //                else {
                        //                    next(null, {});
                        //                }
                        //            }
                        //        }, function (error, result) {
                        //            endResult.push({
                        //                agent: result.users,
                        //                //title: _query.body,
                        //                title: _query.subject_raw,
                        //                content: _query.body_raw
                        //            });
                        //            callback();
                        //        })
                        //    }, function (error) {
                        //        var paginator = new pagination.SearchPaginator({
                        //            prelink: '/report-content-email',
                        //            current: page,
                        //            rowsPerPage: rows,
                        //            totalResult: count
                        //        });
                        //        _.render(req, res, "report-content-email", {
                        //            agent: agent,
                        //            endResult: endResult,
                        //            plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel'],
                        //            paging: paginator.getPaginationData()
                        //        }, true, error);
                        //    })
                        //})
                    }
                });
            });
        })
    }
})
