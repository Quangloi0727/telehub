/**
 * Created by baygiomoidc on 28/04/2016.
 */


var groupManager = require(path.join(_rootPath, 'monitor', 'manager.js'));

module.exports = function(group) {
    return new init(group);
}

function init(group) {
    var self = this;
    var data = group;
    var agents = [];
    var managers = [];
    var availableTime = 0;
    var breakTime = 0;
    var timeCount = 0;
    var callDuration = 0;
    var callRate = [0,0,0];

    /**
     * Lấy danh sách agent của nhóm
     */
    var getAgents = function(){
        _async.waterfall([
            function (next) {
                var aggregate = [];
                var _query = {_id: data._id};
                aggregate.push({$match: _query});
                aggregate.push({$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupMembers.group', as: 'members'}});
                aggregate.push({$lookup: {from: 'users', localField: '_id', foreignField: 'agentGroupLeaders.group', as: 'leaders'}});

                _AgentGroups.aggregate(aggregate, function (err, groups) {
                    var result = _.chain(groups)
                        .reduce(function(memo, group){
                            return _.union(memo, group.members, group.leaders);
                        },0)
                        .compact()
                        .value();
                    next(err, result);
                });
            }
        ],function(err, result){
            agents = _.pluck(result, '_id');
            addGroup();
        });
    };

    /**
     * Cập nhật dữ liệu của nhóm tới màn hình monitor của các quản trị viên
     */
    var addGroup = function(){
        var agentList = _.chain(agents)
            .map(function(id){
                return _.getAgentData(id);
            })
            .compact()
            .value();

        //TODO: tìm danh sách quản trị viên
        _Users.find({_id: {$in: _.keys(_socketUsers)}}, function(err, users){
            _.each(users, function(user){
                if(user.ternalLeaders.length > 0 ||
                    (data.idParent && _.pluck(user.companyLeaders, 'company').toString().indexOf(data.idParent.toString()) >= 0) ||
                    _.pluck(user.agentGroupLeaders, 'group').toString().indexOf(data._id.toString()) >= 0){
                    if(managers.indexOf(user._id.toString()) < 0){
                        managers.push(user._id.toString());
                    }
                }
            });

            //TODO: gửi dữ liệu tới màn hình monitor
            _.each(managers, function(manager, i){
                if(_socketUsers[manager.toString()]){
                    _.each(_socketUsers[manager.toString()].sid, function(sid){
                        var _clientSocket = sio.sockets.sockets[sid];
                        if(_clientSocket) _clientSocket.emit('AddGroup', agentList, data);
                    });
                }else {
                    managers.splice(i, 1);
                }
            });
        });
    }

    getAgents();

    /**
     * kiểm tra cấu hình cảnh báo của từng user và gửi cảnh báo về màn hình monitor
     */
    self.alert = function(){
        if(timeCount == 0){
            var curDate = new Date();
            curDate.setHours(0,0,0,0);
            //TODO: kiểm tra thời gian trạng thái làm việc của agent
            _AgentStatusLog.find({agentId: {$in: agents}, startTime: {$gte: curDate}}, function(err, result){
                var _available = 0;
                var _break = 0;
                //var _logInUser = [];
                _.each(result, function(log){
                    //if(_logInUser.indexOf(log.agentId.toString()) < 0) _logInUser.push(log.agentId.toString());
                    if(_.isEqual(log.status.toString().split(0,1).toString(), '2')) _break += (log.endTime ? log.endTime : Date.now()) - log.startTime;
                    if(!_.isEqual(log.status.toString().split(0,1).toString(), '2')) _available += (log.endTime ? log.endTime : Date.now()) - log.startTime;
                });
                availableTime = _available/agents.length;
                breakTime = _break/agents.length;
            });

            var aggs = [];
            aggs.push({$match: {
                agentId: {$in: agents},
                startTime: {$gte: curDate.getTime()},
                serviceType: 3,
                transType: 1
            }});
            aggs.push({
                $group: {
                    _id: {agent:"$agentId", callId:"$callId"},
                    callDuration:{$sum:"$callDuration"},
                    status:{$max:"$answerTime"}
                }
            });
            aggs.push({$group:{
                _id: "$_id.agent",
                totalCall:{$sum:1},
                connected: {$sum: {$cond: [{$ne: ["$status", null]}, 1, 0]}},
                missed: {$sum: {$cond: [{$ne: ["$status", null]}, 0, 1]}},
                callDuration: {$sum: {$cond: [{$ne: ["$status", null]}, "$callDuration", 0]}}
            }});

            aggs.push({$group:{
                _id: null,
                totalCall:{$sum: "$totalCall"},
                connected: {$sum: "$connected"},
                missed: {$sum: "$missed"},
                callDuration: {$avg: "$callDuration"}
            }});

            //TODO: báo cáo chi tiết thông số cuộc gọi của nhóm
            _CdrTransInfo.aggregate(aggs, function (err, result) {
                if(!err && result[0]){
                    callDuration = result[0].callDuration;
                    callRate[0] = result[0].totalCall;
                    callRate[1] = result[0].connected;
                    callRate[2] = result[0].missed;
                }
            });

            timeCount = 60;
        }
        timeCount--;

        var agentsData = this.getAgentsData();
        var noAcdNum = 0;
        var d = Date.now();
        //TODO: số agent tạm nghỉ
        _.each(agentsData, function(agent){
            agent.callDur = agent.callStatus == 4 ? d - agent.callTime : 0;
            agent.statusDur = d - agent.timeStatus;
            if(agent.status.toString().indexOf('2') == 0) noAcdNum++;
        });

        //TODO: lấy dữ liệu cảnh báo của mỗi user và gửi về màn hình monitor
        _.each(managers, function(user){
            var monitor = _socketUsers[user.toString()] ? _socketUsers[user.toString()].monitor : null;
            var setting = monitor ? monitor.getMonitorSetting() : null;
            var alarms = [];

            alarms.push({field: 'agentNoAcd', data: noAcdNum, isWarning : setting && setting.agentNoAcd && noAcdNum >= setting.agentNoAcd ? 1 : 0});
            alarms.push({field: 'availableTime', data: availableTime});
            alarms.push({field: 'breakTime', data: breakTime});
            alarms.push({field: 'callDuration', data: callDuration});
            alarms.push({field: 'callRate', data: callRate});

            _.each(agentsData, function(agent){
                var fields = [];
                if(setting && setting.answerDurHigh && !setting.answerDurLow && agent.callDur >= setting.answerDurHigh*1000) {
                    fields.push('duration-call');
                }

                if(setting && !setting.answerDurHigh && setting.answerDurLow && agent.callDur <= setting.answerDurLow*1000) {
                    fields.push('duration-call');
                }

                if(setting && setting.answerDurHigh && setting.answerDurLow && agent.callDur <= setting.answerDurHigh*1000 && agent.callDur >= setting.answerDurHigh*1000) {
                    fields.push('duration-call');
                }

                if(setting && agent.statusDur && agent.status.toString().indexOf('2') == 0 && agent.statusDur >= setting.statusDur*1000) {
                    fields.push('duration-status');
                }
                alarms.push({field: fields, data: agent._id.toString()});
            });

            if(_socketUsers[user.toString()]){
                _.each(_socketUsers[user.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('GroupWarning', data._id.toString(), alarms);
                });
            }
        })
    };

    /**
     * được gọi khi xóa/disable nhóm
     */
    self.destroy = function () {
        _.each(managers, function(manager, i){
            if(_socketUsers[manager.toString()]){
                _.each(_socketUsers[manager.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('RemoveGroup', data._id.toString());
                });
            }else {
                managers.splice(i, 1);
            }
        });
    }
    /**
     *  cập nhật dữ liệu của nhóm
     * @param newData Dữ liệu mới
     */
    self.updateData = function (newData) {
        data = newData;
        getAgents();
    }

    /**
     *  cập nhật dữ liệu của agent trong nhóm tới màn hình monitor
     * @param agentId ID user
     */
    self.update = function(agentId){
        var agent = _.getAgentData(agentId);
        _.each(managers, function(manager, i){
            if(_socketUsers[manager.toString()]){
                _.each(_socketUsers[manager.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('MonitorAgent', agent);
                });
            }else {
                managers.splice(i, 1);
            }
        });
    };

    /**
     *
     * @param agentId
     */
    self.removeAgent = function(agentId){
        _.each(managers, function(manager, i){
            if(_socketUsers[manager.toString()]){
                _.each(_socketUsers[manager.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('RemoveAgent', agentId);
                });
            }else {
                managers.splice(i, 1);
            }
        });
    };

    /**
     * lấy dữ liệu từng agent của nhóm
     * @returns {Array} mảng dữ liệu trả về
     */
    self.getAgentsData = function() {
        var result = [];
        _.each(agents, function(id){
            var agent = _.getAgentData(id);
            if(agent) result.push(agent);
        });

        return result;
    };

    /**
     * Cập nhật dữ liệu của nhóm
     * @param newData dữ liệu mới
     */
    self.setData = function(newData) {
        data = newData;
    };

    /**
     * lấy dữ liệu của nhóm
     * @returns {*}
     */
    self.getData = function () {
        return data;
    };

    /**
     * cập nhật danh sách quản trị viên để phục vụ monitor
     * @param user ID user
     */
    self.addManager = function(user) {
        if(managers.indexOf(user.toString()) < 0)
            managers.push(user.toString());
    };

    /**
     * xóa quản trị viên khỏi danh sách cần monitor
     * @param user ID user
     */
    self.removeManager = function(user) {
        var index = managers.indexOf(user.toString());
        if(index >= 0)
            managers.splice(index, 1);
    };

}
