/**
 * Created by Computer on 6/28/2016.
 */

exports.index = {
    json: function (req, res) {
        var queryAgent = {};
            queryAgent.$or = [];

        _AgentGroups.distinct("_id", {idParent: _.convertObjectId(req.query.idCompany)}, function (error, agentGroup) {
            queryAgent.$or.push({'agentGroupLeaders.group': {$in: agentGroup}}, {'agentGroupMembers.group': {$in: agentGroup}}, {'companyLeaders.company': req.query.idCompany});
            _Users.find(queryAgent, function (error, result) {
                res.json({idAgent: result});
            });
        });
    },
    html: function (req, res) {
        _async.parallel({
            company: function (next) {
                _Company.find({},next);
            },
            agent: function (next) {
                _Users.find({}, next);
            }
        },function (error, result) {    
            if(_.isEmpty(req.query)){
                _.render(req, res, "/report-productivity-agent", {
                    agentDays: [],
                    totalDays: 0,
                    company: result.company,
                    agent: result.agent,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                }, true, error);
            }
            else
            {
                var queryAgentDays = {}, queryTotalDays = {}, queryAgent = {}, created = {};
                var endResultAgent = [];
                var averageDays = 0;

                if(_.has(req.query, "startDate")){
                    created.$gt = _moment(req.query.startDate + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d;
                    queryAgentDays.created = created;
                    queryTotalDays.created = created;
                }
                if(_.has(req.query, "endDate")){
                    created.$lt = _moment(req.query.endDate + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d;
                    queryAgentDays.created = created;
                    queryTotalDays.created = created;
                }
                if(_.has(req.query, "endDate")){
                    
                }
                if(_.has(req.query, "idAgent")){
                    queryAgent._id = {$in: _.convertObjectId(req.query.idAgent)};
                }
                if(_.has(req.query, "idCompany" && _.has(req.query, "idAgent"))){
                    //delete queryAgent.$or;
                    queryAgent._id = {$in: _.convertObjectId(req.query.idAgent)};
                }
                for (var m = moment(_moment(req.query.endDate + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d); m.isSameOrAfter(_moment(req.query.startDate + '00:00:00', 'DD/MM/YYYY hh:mm:ss')); m.subtract(1, 'days')) {
                    averageDays += 1;
                }
                _async.waterfall([
                    function (callback) {
                        if(_.has(req.query, "idCompany")){
                            _AgentGroups.distinct("_id", {idParent: _.convertObjectId(req.query.idCompany)}, function (error, agentGroup) {
                                queryAgent.$or = [];
                                queryAgent.$or.push({'agentGroupLeaders.group': {$in: agentGroup}}, {'agentGroupMembers.group': {$in: agentGroup}}, {'companyLeaders.company': req.query.idCompany});
                                callback();
                            });
                        }
                        else {
                            callback();
                        }
                    },
                    function (callback) {
                        _async.parallel({
                            agentDays: function (next) {
                                _Users.find(queryAgent, function (error, agent) {
                                    _async.each(agent, function (_query, callback) {
                                        _Mail.distinct("_id", {agent: _query._id, mail_type: 2}, function (error, mail) {
                                            queryAgentDays.idAgent = _query._id;
                                            queryAgentDays.mailId = {$in: mail};
                                            _TicketsMail.count(queryAgentDays, function (error, ticketMailAgent) {
                                                if(ticketMailAgent > 0){
                                                    endResultAgent.push({agentName: _query.displayName, average: (ticketMailAgent / averageDays).toFixed(0)});
                                                    callback();
                                                }
                                                else {
                                                        endResultAgent.push({agentName: _query.displayName, average: 0});
                                                    callback();
                                                }
                                            })
                                        });
                                    }, function (error) {
                                        next(error, endResultAgent);
                                    });
                                });
                            },
                            totalDays: function (next) {
                                var resultAgent = [];
                                _.each(result.agent, function (loop, i) {
                                    resultAgent.push(loop._id);
                                });
                                _Mail.distinct("_id", {agent: {$in: resultAgent},  mail_type: 2}, function (error, mail) {
                                    queryTotalDays.idAgent = {$in: resultAgent};
                                    queryTotalDays.mailId = {$in: mail};
                                    _TicketsMail.count(queryTotalDays, function (error, ticketMailTotal) {
                                        if(ticketMailTotal > 0){
                                            next(error, (ticketMailTotal/averageDays))
                                        }
                                        else {
                                            next(null, 0);
                                        }
                                    })
                                });
                            }
                        },function (error, endResult) {
                            //console.log(130, endResult);
                            _.render(req, res, "/report-productivity-agent", {
                                agentDays: endResult.agentDays,
                                totalDays: endResult.totalDays,
                                company: result.company,
                                agent: result.agent,
                                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel']
                            }, true, error);
                        })
                        callback();
                    }
                ]);
            }
        });
    }
}
