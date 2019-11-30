/**
 * Created by baygiomoidc on 28/04/2016.
 */

var manager = require(path.join(_rootPath, 'monitor', 'manager.js'));

module.exports = function() {
    return new init();
}

/**
 * khởi tạo biến và hàm chức năng
 */
function init() {
    var self = this;
    var status = 0;
    var callStatus = 5;
    var curCall = null;
    var data = null;
    var deviceID = null;
    var endCallTime = Date.now();
    var caller = null;
    var called = null;
    var callTime = null;
    var timeStatus = Date.now();
    var workPlace = null;
    var monitorSetting = null;
    var callID = null;
    var channelID = null;
    var callType = 0;

    /**
     * Cập nhật dữ liệu agent tới màn hình monitor group và service
     */
    var monitor = function(){
        var  groups = _.pluck(_.union(data.agentGroupLeaders, data.agentGroupMembers), 'group');
        _.each(groups, function(gp){
            var groupMonitor = manager.getGroup(gp.toString());
            if(groupMonitor) groupMonitor.update(data._id.toString());
        });

        if(workPlace){
            var serviceMonitor = manager.getService(workPlace.toString());
            if(serviceMonitor) serviceMonitor.updateAgentCall(data._id.toString());
        }
    }

    /**
     * cập nhật dữ liệu của user khi có thay đổi về group
     * @param callback
     */
    self.groupUpdate = function (callback) {
        _Users.findById(data._id, function(err, user){
            if(!err){
                user.deviceID = data.deviceID;
                data = user;
            }
            callback(err);
        });
    }

    /**
     * kết thúc phiên làm việc của agent, xóa dữ liệu monitor và cập nhật status log
     */
    self.destroy = function () {
        var  groups = _.pluck(_.union(data.agentGroupLeaders, data.agentGroupMembers), 'group');
        _.each(groups, function(gp){
            var groupMonitor = manager.getGroup(gp.toString());
            if(groupMonitor) {
                groupMonitor.removeAgent(data._id.toString());
            }
        });

        manager.removeManager(data._id);

        if(workPlace){
            var serviceMonitor = manager.getService(workPlace.toString());
            if(serviceMonitor) serviceMonitor.removeCall(data._id.toString());
        }

        _AgentStatusLog.update({
            agentId: data._id,
            startTime: timeStatus
        },
            {
                $set: {
                    endTime: Date.now(),
					endReason: 'logout'
                }
            }, function(err, result){

        });
    };

    /**
     * cập nhật dữ liệu call status của agent
     * @param newSts Call Status mới của agent
     */
    self.setCallStatus = function(newSts) {
        if(newSts == 5){
            if(curCall && curCall.idCampain) {
                var curCam = manager.getCampaign(curCall.idCampain.toString());
                if(curCam) curCam.removeCalling(curCall._id.toString());
            }

            if(callStatus != -1){
                endCallTime = Date.now();
            }

            if(_.has(curCall, 'retry')){
                _CampainCustomer.update({_id: curCall._id}, {$inc: {retry: 1}, retryTime: Date.now()}, function(err, result){

                });
            }

            curCall = null;
            caller = null;
            called = null;
            if(workPlace){
                var serviceMonitor = manager.getService(workPlace.toString());
                if(serviceMonitor) serviceMonitor.removeCall(data._id.toString());
            }
            workPlace = null;
            callID = null;
            channelID = null;
            callType = 0;
        }
        if(newSts == 4 && callStatus != 4 && callStatus != 6){
            callTime = Date.now();
        }

        callStatus = newSts;
        _.each(_socketUsers[data._id.toString()].sid, function(sid){
            var _clientSocket = sio.sockets.sockets[sid];
            if(_clientSocket) _clientSocket.emit('ChangeAgentCallStatus', {callStatusType: callStatus});
        });
        monitor();
    };

    /**
     * Lấy dữ liệu call status
     * @returns {number} status
     */
    self.getCallStatus = function () {
        return callStatus;
    };

	/**
     * 27.Feb.2017 hoangdv
	 * Cập nhật trạng thái làm việc của agent
	 * @param newSts
	 * @param reason loại thay đổi trạng thái login | logout | change_status
	 */
    self.setStatus = function(newSts, reason) {
        var timeNow = Date.now();
        _async.parallel([
            function(next){
                _AgentStatusLog.update({
                    agentId: data._id,
                    endTime: null,
					endReason: reason || 'change_status'
                }, {$set: {endTime: Date.now()}}, next);
            },
            function(next){
                _AgentStatusLog.create({
                    agentId: data._id,
                    startTime: timeNow,
                    status: newSts,
					startReason: reason || 'change_status'
                }, next);
            }
        ], function(err, result){
            if(_socketUsers[data._id.toString()]){
                _.each(_socketUsers[data._id.toString()].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('VoiceChangeAgentStatus', newSts);
                });
            }

            timeStatus = timeNow;
            status = newSts;
            monitor();
        });
    };

    /**
     * Lấy trạng thái làm việc của agent
     * @returns {number} Trạng thái làm việc
     */
    self.getStatus = function () {
        return status;
    };

    /**
     * Cập nhật dữ liệu của agent
     * @param newData Dữ liệu mới
     */
    self.setData = function(newData) {
        data = newData;
        if(!monitorSetting){
            _MonitorSetting.find({idUser: data._id}, function(err, result){
                if(!err && result[0]) monitorSetting = result[0];
            });
        }
        monitor();
    };

    /**
     * Lấy ID user
     * @returns {*}
     */
    self.getId = function () {
        return data._id;
    };

    /**
     * Cập nhật thời gian call của agent
     * @param newTime
     */
    self.setCallTime = function(newTime) {
        callTime = newTime;
    };

    /**
     * Lấy dữ liệu thời gian call của agent
     * @returns {*}
     */
    self.getCallTime = function () {
        return callTime;
    };

    /**
     * Lấy dữ liệu kết thúc call của agent
     * @returns {number}
     */
    self.getEndCallTime = function () {
        return endCallTime;
    };

    /**
     * cập nhật dữ liệu gọi ra hiện tại của agent
     * @param call Dữ liệu mới
     */
    self.setCurCall = function(call) {
        curCall = call;
    };

    /**
     * Lấy dữ liệu gọi ra của agent
     * @returns {*}
     */
    self.getCurCall = function () {
        return curCall;
    };

    /**
     * Cập nhật Caller
     * @param number
     */
    self.setCaller = function(number) {
        caller = number;
    };

    /**
     * Lấy Caller
     * @returns {*}
     */
    self.getCaller = function () {
        return caller;
    };

    /**
     * Cập nhật called
     * @param number
     */
    self.setCalled = function(number) {
        called = number;
    };

    /**
     * Lấy called
     * @returns {*}
     */
    self.getCalled = function () {
        return called;
    };

    /**
     * Lấy dữ liệu của user
     * @returns {*}
     */
    self.getUserData = function () {
        return data;
    };

    /**
     * Lấy dữ liệu thời gian trạng thái làm việc của agent
     * @returns {number}
     */
    self.getTimeStatus = function () {
        return timeStatus;
    };

    /**
     * Cập nhật đơn vị làm việc hiện tại của agent
     * @param newId ID Group hoặc Service
     */
    self.setWorkPlace = function(newId) {
        workPlace = newId;
    };

    /**
     * Lấy Group hoặc Service agent đang làm việc
     * @returns {*}
     */
    self.getWorkPlace = function () {
        return workPlace;
    };

    /**
     * Lấy danh sách group mà agent phục vụ
     */
    self.getGroups = function () {
        return _.pluck(_.union(data.agentGroupLeaders, data.agentGroupMembers), 'group');
    };

    /**
     * cập nhật cấu hình cảnh báo của agent
     * @param newData
     */
    self.setMonitorSetting = function(newData) {
        monitorSetting = newData;
    };

    /**
     * lấy cấu hình cảnh báo của agent
     * @returns {*}
     */
    self.getMonitorSetting = function () {
        return monitorSetting;
    };

    /**
     * cập nhật call ID mà agent đang call
     * @param newId
     */
    self.setCallID = function(newId) {
        callID = newId;
    };

    /**
     * Lấy call ID mà agent đang call
     * @returns {*}
     */
    self.getCallID = function () {
        return callID;
    };

    /**
     * Cập nhật channel ID của call
     * @param newId
     */
    self.setChannelID = function(newId) {
        channelID = newId;
    };

    /**
     * Lấy channel ID của call
     * @returns {*}
     */
    self.getChannelID = function () {
        return channelID;
    };

    /**
     * Cập nhật call Type của call
     * @param newId
     */
    self.setCallType = function(newId) {
        callType = newId;
    };

    /**
     * Lấy call type của call
     * @returns {number}
     */
    self.getCallType = function () {
        return callType;
    };

    /**
     * Cập nhật extension của agent
     * @param newId
     */
    self.setDeviceID = function(newId) {
        deviceID = newId;
    };

    /**
     * Lấy extension của agent
     * @returns {*}
     */
    self.getDeviceID = function () {
        return deviceID;
    };

    /**
     * Cập nhật dữ liệu của agent lên màn hình monitor
     */
    self.monitor = function () {
        monitor();
    };
}
