/**
 * Created by baygiomoidc on 28/04/2016.
 */


var manager = require(path.join(_rootPath, 'monitor', 'manager.js'));

module.exports = function(service) {
    return new init(service);
}

/**
 * khởi tạo hàm và biến của module
 * @param service Dữ liệu service
 */
function init(service) {
    var self = this;
    var data = service;
    var managers = [];
    var callDropRate = 0;
    var waitingCustomer = 0;
    var missCall = 0;
    var callDuration = 0;
    var callRate = [0,0,0];
    var timeCount = 0;
    var callData = {};
    var totalAgent = 0;
    var agents = [];

    /**
     * thêm mới service và cập nhật về màn hình monitor
     */
    var addService = function(){
        var result = [];
        _.each(_.keys(callData), function(callId){
            result.push(_.getCallData(callData[callId]));
        });

        _Users.find({_id: {$in: _.keys(_socketUsers)}}, function(err, users){
            _.each(users, function(user){
                if(user.ternalLeaders.length > 0 || _.pluck(user.companyLeaders, 'company').toString().indexOf(data.idCompany.toString()) >= 0){
                    if(managers.indexOf(user._id.toString()) < 0){
                        managers.push(user._id.toString());
                    }
                }
            });

            _.each(managers, function(manager, i){
                if(_socketUsers[manager.toString()]){
                    _.each(_socketUsers[manager.toString()].sid, function(sid){
                        var _clientSocket = sio.sockets.sockets[sid];
                        if(_clientSocket) _clientSocket.emit('AddService', result, data);
                    });
                }
            });
        });
    }

    addService();

    /**
     * so sánh dữ liệu service với cấu hình cảnh báo của từng user và gửi về màn hình monitor
     */
    self.alert = function(){
        if(timeCount == 0){
            var curDate = new Date();
            curDate.setHours(0,0,0,0);

            var aggs = [];
            aggs.push({$match: {
                serviceId: data._id,
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

            // báo cáo thông số call của service
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

        // danh sách agent phục vụ service
        var agentList = [];
        _.each(agents, function(agentInfo){
            var agentData = _.getAgentData(agentInfo.agentID);
            if(agentData) {
                agentData.active = agentInfo.active;
                agentList.push(agentData);
            }

        });

        agentList = _.sortBy(agentList, function(agentInfo){
            return !agentInfo.active;
        });

        // gửi dữ liệu monitor và cảnh báo về màn hình monitor của từng quản trị viên
        _.each(managers, function(user){
            var monitor = _socketUsers[user.toString()].monitor;
            var setting = monitor ? monitor.getMonitorSetting() : null;
            var alarms = [];

            alarms.push({field: 'callDropRate', data: callDropRate, isWarning : setting && callDropRate >= setting.callDropRate ? 1 : 0});
            alarms.push({field: 'waitingCustomer', data: waitingCustomer, isWarning : setting && waitingCustomer >= setting.waitingCustomer ? 1 : 0});
            alarms.push({field: 'callDuration', data: callDuration});
            alarms.push({field: 'callRate', data: callRate});
            alarms.push({field: 'missCall', data: missCall});
            alarms.push({field: 'totalAgent', data: totalAgent});
            alarms.push({field: 'agentList', data: agentList});

            if(_socketUsers[user.toString()]){
                _.each(_socketUsers[user.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('ServiceWarning', data._id.toString(), alarms);
                });
            }
        })
    };

    /**
     * hàm được gọi khi dừng module, thông báo xóa service về màn hình monitor
     */
    self.destroy = function () {
        _.each(managers, function(manager, i){
            if(_socketUsers[manager.toString()]){
                _.each(_socketUsers[manager.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('RemoveService', data._id.toString());
                });
            }else {
                managers.splice(i, 1);
            }
        });
    };

    /**
     * cập nhật dữ liệu của service
     * @param newData Dữ liệu mới
     */
    self.updateData = function (newData) {
        data = newData;
        addService();
    }

    /**
     * remove call khỏi danh sách call của service và cập nhật lên màn hình monitor
     * @param callId
     */
    self.removeCall = function(callId){
        delete callData[callId.toString()]
        _.each(managers, function(manager, i){
            if(_socketUsers[manager.toString()]){
                _.each(_socketUsers[manager.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('RemoveCall', callId.toString());
                });
            }else {
                managers.splice(i, 1);
            }
        });
    };

    /**
     * cập nhật dữ liệu call hiện tại trong service và cập nhật lên màn hình monitor
     * @param data
     */
    self.updateCall = function(data){
        callData[data.callID] = data;
        _.each(managers, function(manager, i){
            if(_socketUsers[manager.toString()]){
                _.each(_socketUsers[manager.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('MonitorCall', _.getCallData(data));
                });
            }else {
                managers.splice(i, 1);
            }
        });
    };

    self.updateAgentCall = function(agentId){
        //var agent = getAgentData(agentId);
        //if(agent) {
        //    _.each(managers, function(manager, i){
        //        if(_socketUsers[manager.toString()]){
        //            _.each(_socketUsers[manager.toString()].sid, function(sid){
        //                var _clientSocket = sio.sockets.sockets[sid];
        //                console.log(273,agent);
        //                if(_clientSocket) _clientSocket.emit('MonitorCall', agent);
        //            });
        //        }else {
        //            managers.splice(i, 1);
        //        }
        //    });
        //}
    };

    /**
     * Lấy danh sách các cuộc gọi ở trên service
     * @returns {Array} Mảng kết quả
     */
    self.getCallsData = function() {
        var result = [];
        _.each(_.keys(callData), function(callId){
            result.push(_.getCallData(callData[callId]));
        });

        return result;
    };

    /**
     * Lấy dữ liệu của cuộc gọi theo call ID
     * @param id Call ID
     * @returns {*} dữ liệu cuộc gọi
     */
    self.getCall = function(id){
        return callData[id];
    };

    /**
     * cập nhật dữ liệu service
     * @param newData Dữ liệu mới
     */
    self.setData = function(newData) {
        data = newData;
    };

    /**
     * Lấy dữ liệu service
     * @returns {*}
     */
    self.getData = function () {
        return data;
    };

    /**
     * Cập nhật thông số call drop rate của service
     * @param newData Dữ liệu mới
     */
    self.setCallDropRate = function (newData) {
        callDropRate = newData;
    };

    /**
     * Cập nhật thông số miss call của service
     * @param newData Dữ liệu mới
     */
    self.setMissCall = function (newData) {
        missCall = newData;
    };

    /**
     * Cập nhật thông số waiting customer của service
     * @param newData Dữ liệu mới
     */
    self.setWaitingCustomer = function (newData) {
        waitingCustomer = newData;
    };

    /**
     * Cập nhật thông số total agent của service
     * @param newData Dữ liệu mới
     */
    self.setTotalAgent = function (newData) {
        totalAgent = newData;
    };

    /**
     * cập nhật danh sách agent phục vụ service
     * @param newData
     */
    self.setAgents = function (newData) {
        agents = newData;
    };

    /**
     * thêm user quản trị để monitor
     * @param user ID user
     */
    self.addManager = function(user) {
        if(managers.indexOf(user) < 0)
            managers.push(user);
    };

    /**
     * loại user khỏi danh sách quản trị
     * @param user User ID
     */
    self.removeManager = function(user) {
        var index = managers.indexOf(user.toString());
        if(index >= 0)
            managers.splice(index, 1);
    };
}