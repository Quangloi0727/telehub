/**
 * Created by baygiomoidc on 17/05/2016.
 */

var manager = require(path.join(_rootPath, 'monitor', 'manager.js'));

exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {

        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        //console.log(req.session.user);
        var auth = req.session.auth;
        _async.parallel({
            setting: function(next){
                // Truy vấn cấu hình monitor
                _MonitorSetting.find({idUser: req.session.user._id}, next);
            },
            status: function(next) {
                // Truy vấn trạng thái làm việc agent
                _AgentStatus.find({}, next);
            },
            services: function(next){
                // Truy vấn services và thông tin liên quan
                var _query2 = auth.company ? (auth.company.group ? (auth.company.group.leader ? {idSkill: {$in: []}} : {status: 9999}) : {idCompany: auth.company._id}) : {};
                _async.waterfall([
                    function(next){
                        if(_query2.idSkill){
                            var aggs = [];
                            aggs.push({$match: {_id: new mongodb.ObjectId(auth.company.group._id)}});
                            aggs.push({$lookup: {from: 'groupprofiles', localField: 'idProfile', foreignField: '_id', as: 'profile'}});
                            aggs.push({$unwind: "$profile"});
                            aggs.push({$project: {
                                skills: '$profile.skills'
                            }});
                            _AgentGroups.aggregate(aggs, function(err, result){
                                if(result[0]){
                                    _query2.idSkill = {$in: _.pluck(result[0].skills, 'idSkill')};
                                }
                                next(err);
                            });
                        }else {
                            next(null);
                        }
                    }
                ], function(err){
                    _Services.find({$and: [_query2, {status: {$ne: 0}}]}, next);
                });
            },
            //campaigns: function(next){
            //    _Campains.find({$and: [_query2, {status: {$ne: 0}}]}, next);
            //}
        }, function(err, result){
            // Truy vấn thông tin agent group
            var _query = auth.company ? (auth.company.group ? (auth.company.group.leader ? {_id: auth.company.group._id} : {status: 9999}) : {idParent: new mongodb.ObjectId(auth.company._id)}) : {};
            _AgentGroups.find({$and: [_query, {status: {$ne: 0}}]}, function(err, groups){
                var data = {};
                _.each(groups, function(group){
                    var groupMonitor = manager.getGroup(group._id.toString());
                    if(groupMonitor){
                        _.each(groupMonitor.getAgentsData(), function(agent){
                            if(!data[agent._id.toString()]){
                                var curStatus = _.find(result.status, function(stsData){
                                    return stsData.statusCode == agent.status;
                                });
                                agent.statusToView = curStatus ? curStatus.name : 'UNKNOW';
                                agent.callStatusToView = getCallStatus(agent.callStatus);
                                agent.callTimeToView = agent.callTime;
                                data[agent._id.toString()] = agent;
                            }
                        });
                        // Thêm user vào danh sách quản lý
                        groupMonitor.addManager(req.session.user._id);
                    }
                });

                var serviceData = [];
                _.each(result.services, function(sv){
                    var callsData = [];
                    var serviceMonitor = manager.getService(sv._id.toString());
                    if(serviceMonitor){
                        _.each(serviceMonitor.getCallsData(), function(agent){
                            callsData.push(agent);
                        });
                        serviceData = _.union(serviceData, callsData);
                        // Thêm user vào danh sách quản lý
                        serviceMonitor.addManager(req.session.user._id);
                    }
                });

                _.render(req, res, 'monitor',
                    {
                        title: 'Giám sát',
                        data: _.chain(_.keys(data))
                            .map(function(key){
                                return data[key];
                            })
                            .compact()
                            .value(),
                        serviceData: serviceData,
                        groups: groups,
                        setting: result.setting[0],
                        services:result.services,
                        status: result.status,
                        plugins: [['bootstrap-select']]
                    }, true, null);
            });
        });
    }
}

// PUT
exports.update = function (req, res) {
    _async.waterfall([
        function(next){
            _MonitorSetting.update({idUser: req.params.monitor}, req.body, {upsert: true}, next);
        },
        function(result, next){
            _MonitorSetting.find({idUser: req.params.monitor}, next);
        }
    ], function(err, result){
        if(!err){
            var monitor = _socketUsers[req.params.monitor].monitor;
            if(monitor && result[0]) monitor.setMonitorSetting(result[0]);
        }
        res.json({code: (err ? 500 : 200), message: err ? err : ''});
    });
};

/**
 * Lấy tên trạng thái call
 * @param status
 * @returns {*}
 */
var getCallStatus = function(status){
    switch (status) {
        case -1:
            return 'CALLING';
            break;
        case 0:
            return 'UNKOWN';
            break;
        case 1:
            return 'PROCESSING';
            break;
        case 2:
            return 'CALLING';
            break;
        case 3:
            return 'RINGING';
            break;
        case 4:
            return 'CONNECTED';
            break;
        case 5:
            return 'DISCONNECTED';
            break;
        case 6:
            return 'HOLD';
            break;
        case 7:
            return 'RESUME';
            break;
        case 8:
            return 'TRANSFER';
            break;
        case 9:
            return 'COUNT';
            break;
    };
}
