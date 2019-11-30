/**
 * Created by Computer on 5/30/2016.
 */
 
exports.index = {
    json: function (req, res) {
        _Services.find({idCompany: req.query.idCompany}, function (error, result) {
            res.json({serviceId: result});
        });
    },
    html: function (req, res) {
        _async.parallel({
            company: function (next) {
                _Company.find({},next);
            },
        },function (error, company) {
            if(_.isEmpty(req.query)){
                _.render(req, res, 'report-sla', {
                    check: false,
                    company: company.company,
                    service: [],
                    endResultCompany: [],
                    endResultService: [],
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                }, true, error);
            }
            else {
                var totalCompany = [], totalService = [], endResultCompany = [], endResultService = [];
                var countCompany = {}, countService = {}, matchCompany = {}, matchService = {}, created = {}, queryService = {};

                if(_.has(req.query, 'serviceId')){
                    queryService._id = {$in: _.convertObjectId(req.query.serviceId)};
                }
                else{
                    queryService.idCompany = req.query.idCompany;
                }
                if(_.has(req.query, 'idCompany'))
                {
                    countCompany.idCompany = _.convertObjectId(req.query.idCompany);
                }
                if(_.has(req.query, 'startDate'))
                {
                    created.$gt = _moment(req.query.startDate + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d;
                    matchCompany.created = created;
                    matchService.created = created;
                    countCompany.created = created;
                    countService.created = created;
                }
                if(_.has(req.query, 'endDate'))
                {
                    created.$lt = _moment(req.query.endDate + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d;
                    matchCompany.created = created;
                    matchService.created = created;
                    countCompany.created = created;
                    countService.created = created;
                }

                _async.parallel({
                    company: function (next) {
                        _Company.find({_id: req.query.idCompany},next);
                    },
                    service: function(next){
                        _async.parallel({
                            getID: function (next) {
                                _Services.find(queryService, next);
                            }
                        },function (err, r) {
                            _async.each(r.getID, function (_serviceID,callback) {
                                countService.serviceId = _serviceID._id;
                                _CdrCallInfo.count(countService,function (err1, r1) {
                                    totalService.push({name: _serviceID.name, recipeSLA: _serviceID.recipeSLA, total: r1, _id: _serviceID._id});
                                    callback();
                                });
                            },function (err) {
                                next(err,totalService);
                            })
                        })
                    },
                    totalCallCompany: function (next) {
                        _CdrCallInfo.count(countCompany,next);
                    }
                },function (error,result) {
                    if(result.company.length > 0) {
                        totalCompany.push({nameCompany: result.company[0].name, recipeSLA: result.company[0].recipeSLA, _id: result.company[0]._id});
                    }

                    _async.parallel({
                        company: function (next) {
                            _async.each(totalCompany,function (_getIDCompany,callback) {
                                var aggregate = [];
                                matchCompany.idCompany = _getIDCompany._id;
                                aggregate.push({$match: matchCompany});
                                aggregate.push({$group: {
                                    _id: "$idCompany",
                                    totalCallAgentCompany: {$sum: {$cond: [{$and: [
                                        {$ne: ["$answerTime", null]},
                                        {$lt: [{ $divide: [ {$subtract: ['$answerTime', '$ringTime']}, 1000 ]}, _getIDCompany.recipeSLA]},]},
                                        1, 0]}},
                                    totalCallFallCompany: {$sum: {$cond: [{$and: [
                                        {$eq: ["$answerTime", null]},
                                        {$lt: [{ $divide: [ {$subtract: ['$ringTime', '$endTime']}, 1000 ]}, _getIDCompany.recipeSLA]},]},
                                        1, 0]}}
                                }});
                                _CdrTransInfo.aggregate(aggregate, function (error, recipe) {
                                    if(recipe.length > 0)
                                    {
                                        var recipeSLACompany = recipe[0].totalCallAgentCompany/(result.totalCallCompany - recipe[0].totalCallFallCompany);
                                        endResultCompany.push({
                                            nameCompany: _getIDCompany.nameCompany,
                                            totalCallAgentCompany: recipe[0].totalCallAgentCompany,
                                            totalCallCompany: result.totalCallCompany,
                                            totalCallFallCompany: recipe[0].totalCallFallCompany,
                                            recipeSLACompany: recipeSLACompany.toFixed(2)});
                                        callback();
                                    }
                                    else {
                                        callback();
                                    }
                                })
                            },function (error) {
                                next(error,endResultCompany);
                            })
                        },
                        service: function (next) {
                            _async.each(result.service,function (_getIDService,callback) {
                                var aggregate = [];
                                matchService.serviceId = _getIDService._id;
                                aggregate.push({$match: matchService});
                                aggregate.push({$group: {
                                    _id: "$serviceId",
                                    totalCallAgentService: {$sum: {$cond: [{$and: [
                                        {$ne: ["$answerTime", null]},
                                        {$lt: [{ $divide: [ {$subtract: ['$answerTime', '$ringTime']}, 1000 ]}, _getIDService.recipeSLA]},]},
                                        1, 0]}},
                                    totalCallFallService: {$sum: {$cond: [{$and: [
                                        {$eq: ["$answerTime", null]},
                                        {$lt: [{ $divide: [ {$subtract: ['$ringTime', '$endTime']}, 1000 ]}, _getIDService.recipeSLA]},]},
                                        1, 0]}}
                                }});
                                _CdrTransInfo.aggregate(aggregate, function (error, recipe) {
                                    if(recipe.length > 0)
                                    {
                                        var recipeSLAService = recipe[0].totalCallAgentService/(_getIDService.total - recipe[0].totalCallFallService);
                                        endResultService.push({
                                            nameService: _getIDService.name,
                                            totalCallAgentService: recipe[0].totalCallAgentService,
                                            totalCallService: _getIDService.total,
                                            totalCallFallService: recipe[0].totalCallFallService,
                                            recipeSLAService: recipeSLAService.toFixed(2)});
                                        callback();
                                    }
                                    else {
                                        callback();
                                    }
                                })
                            },function (error) {
                                next(error,endResultService);
                            })
                        }
                    },function (error, endResult) {
                        _.render(req, res, 'report-sla', {
                            check: true,
                            company: company.company,
                            service: result.service,
                            endResultCompany: endResult.company,
                            endResultService: endResult.service,
                            plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                        }, true, error);
                    })
                })
            }
        })
    }
}