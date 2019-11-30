/**
 * Created by Đại Đồng on 19/04/2016.
 */
var view = 'report-outbound-reasons';
var title = 'Báo cáo gọi ra - Báo cáo tình trạng';
exports.index = {
    html: function (req, res) {
        var type = _.has(req.query, "type") ? (req.query['type'] == 'ticketReason' ? false : true) : false;
        var query = _.cleanRequest(req.query, ['startDate', 'endDate', 'type']);
        if (_.has(req.query, "startDate") || _.has(req.query, "endDate")) {
            query.created = {};
            if (_.has(req.query, "startDate")) {
                query.created.$gte = _moment(req.query['startDate'], "DD/MM/YYYY").startOf('day')._d;
            }
            ;
            if (_.has(req.query, "endDate")) {
                query.created.$lte = _moment(req.query['endDate'], "DD/MM/YYYY").endOf('day')._d
            }
            ;
        }
        if (_.has(req.query, "status")) {
            query.status = parseInt(req.query.status);
        }
        var campaignQuery = {};
        var companyQuery = null;
        if (req.session.auth.company) {
            campaignQuery = {idCompany: req.session.auth.company._id};
            companyQuery = {_id:req.session.auth.company._id};
            if (!req.session.auth.company.leader) {
                _.render(req, res, view, {
                    title: title,
                    plugins: [['bootstrap-select'], 'export-excel', ['chosen']],
                    result: [],
                    campaign: [],
                    total: 0,
                    type: type
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }
        _async.waterfall([function(cb){
            _Company.distinct("_id",companyQuery, function (err, com) {
                _AgentGroups.distinct("_id",{idParent: {$in: com}},function (err, ag) {
                    if (err) return cb(err);
                    _Users.find({$or: [{'agentGroupLeaders.group': {$in: ag}}, {'agentGroupMembers.group': {$in: ag}}, {'companyLeaders.company': {$in: com}}]}, function (err, agent) {
                        cb(err, agent);
                    });
                });
            });
        }, function(agent, cb){
            _Campains.find(campaignQuery, function (err, cam) {
                if (!err) {
                    if (req.query.idCampain) {
                        query.idCampain = _.convertObjectId(req.query.idCampain)
                    } else {
                        query.idCampain = {$in: _.pluck(cam, "_id")};
                    };
                    if(req.query.idAgent){
                        query.idAgent = {$in: _.arrayObjectId(req.query.idAgent)}
                    }
                    var aggregate = [];
                    aggregate.push({$match: query});
                    aggregate.push({
                        $group: {
                            _id: {
                                subreason: "$ticketSubreason",
                                reason: "$ticketReason"
                            }, count: {$sum: 1}
                        }
                    });
                    aggregate.push({
                        $lookup: {
                            from: "ticketreasons",
                            localField: "_id.reason",
                            foreignField: "_id",
                            as: "reasonInfo"
                        }
                    });
                    aggregate.push({
                        $lookup: {
                            from: "ticketsubreasons",
                            localField: "_id.subreason",
                            foreignField: "_id",
                            as: "subreasonInfo"
                        }
                    });
                    aggregate.push({$unwind: {path: "$reasonInfo", preserveNullAndEmptyArrays: true}});
                    aggregate.push({$unwind: {path: "$subreasonInfo", preserveNullAndEmptyArrays: true}});
                    aggregate.push({
                        $group: {
                            _id: {id: "$_id.reason", name: "$reasonInfo.name"},
                            subreason: {$push: {id: "$_id.subreason", name: "$subreasonInfo.name", count: "$count"}},
                            count: {$sum: "$count"}
                        }
                    });
                    _.isEmpty(req.query) ? (_.render(req, res, view, {
                        title: title,
                        result: [],
                        campaign: cam,
                        total: 0,
                        type: type,
                        agent:agent,
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                    }, true, err)) :
                        (_Tickets.aggregate(aggregate, function (err2, ticket) {
                            console.log(ticket)
                            var total = 0;
                            _.each(ticket, function (obj) {
                                total += obj.count;
                            })
                            _.render(req, res, view, {
                                title: title,
                                result: ticket,
                                campaign: cam,
                                total: total,
                                type: type,
                                agent:agent,
                                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', 'highchart']
                            }, true, err2);
                        }));
                }
            });
        }])
    }
}