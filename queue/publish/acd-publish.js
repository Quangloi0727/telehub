var voiceData = require(path.join(_rootPath, 'queue', 'common', 'voice-data.js'));
var cbArr = {};

module.exports = {
    /**
     * Gửi thông báo thay đổi trạng thái agent
     * @param agentID ID của agent bị thay đổi trạng thái
     * @param changeBy ID của agent thực hiện thay đổi trạng thái
     * @param newStatus Trạng thái đích cần thay đổi
     * @param socketId SocketId để liên hệ với trình duyệt của agent
     */
    sendChangeAgentStatusRequest: function(agentID, changeBy, newStatus, socketId){
        _ActiveMQ.publish('/queue/ChangeAgentStatusReqMsg', JSON.stringify({
            messageType : 13,
            transID : createID() +'|'+_config.activemq.queueName+'|'+newStatus,
            agentID : changeBy,
            toAgent : agentID,
            status : Number(newStatus),
            tenant: _config.app._id
        }));
    },
    /**
     * Gửi thông báo đăng xuất agent
     * @param agentID ID của agent cần đăng xuất
     * @param socketId SocketId để liên hệ với trình duyệt của agent
     */
    sendLogOutRequest: function (agentID, socketId) {
        var message = {
            messageType : 43,
            transID : createID() +'|'+_config.activemq.queueName+'|'+socketId,
            tenant : _config.app._id,
            agentID : agentID
        };
        log.debug('SENT LogoutReqMsg ', message);
        _ActiveMQ.publish('/queue/LogoutReqMsg', JSON.stringify(message));
    },
    /**
     * Gửi thông báo lấy danh sách đầu số
     * @param socketId SocketId để liên hệ với trình duyệt của agent
     */
    sendGetQueueNumber: function (socketId) {
        _ActiveMQ.publish('/queue/QueueNumberReqMsg', JSON.stringify({
            messageType : 906,
            transID : createID() +'|'+_config.activemq.queueName+'|'+socketId
        }));
    },
    /**
     * Gửi thông báo lấy bộ lọc khách hàng
     * @param socketId SocketId để liên hệ với trình duyệt của agent
     */
    sendGetCustomerFilter: function (socketId) {
        _ActiveMQ.publish('/queue/GetCustomerFilterReqMsg', JSON.stringify({
            transID : createID() +'|'+_config.activemq.queueName+'|'+socketId
        }));
    },
    /**
     * Gửi thông báo kiểm tra đầu số đã dùng hay chưa
     * @param socketId SocketId để liên hệ với trình duyệt của agent
     * @param number Đầu số cần kiểm tra
     */
    sendCheckQueueNumber: function (socketId, number) {
        _ActiveMQ.publish('/queue/CheckQueueNumberReqMsg', JSON.stringify({
            transID : createID() +'|'+_config.activemq.queueName+'|'+socketId,
            number: number
        }));
    },
    /**
     * Gửi thông báo đăng nhập cho agent
     * @param user Đối tượng agent
     * @param deviceID Số máy lẻ của agent
     * @param callback Hàm được gọi khi có kết quả
     */
    sendLoginRequest: function (user, deviceID, callback) {
        voiceData.getAgentInfo(user, function(agentInfo){
            var transId = createID()+'|'+_config.activemq.queueName+'|'+user._id+'|'+agentInfo.agentStatusDefault;
            //var transId = 'd9757a19889175e5|fast-contact-queue|5791cde9a3c6a71823618f9f|12';
            setCB(transId, callback);
            var message = {
                messageType : 1,
                transID : transId,
                agentID : user._id,
                passWord : user.password,
                deviceID : deviceID,
                kickOption : true,
                tenant : _config.app._id,
                agentInfo : agentInfo
            };
            log.debug('SENT LoginReqMsg ', message);
            _ActiveMQ.publish('/queue/LoginReqMsg', JSON.stringify(message));
        });
    },
    /**
     * Gửi bản tin Click to call
     * @param agentID Agent ID
     * @param number SĐT gọi ra
     * @param socketId socket của trình duyệt agent
     * @param prefix cấu hình prefix đê gọi ra
     * @param strategy Chưa dùng
     * @param idCampaign ID campaign gọi ra
     */
    sendMakeCallRequest: function (agentID, number, socketId, prefix, strategy, idCampaign) {
        var message = {
            messageType : 3,
            transID : createID() +'|'+_config.activemq.queueName+'|'+socketId,
            prefix: prefix,
            //prefix: '000',
            agentToUri : number,
            agentID : agentID,
            strategy: strategy,
            tenant : _config.app._id,
            campaignID: idCampaign
        };
        log.debug('MakeCallReqMsg ', message);
        _ActiveMQ.publishSafe('/queue/MakeCallReqMsg', JSON.stringify(message), function(err){
            if(err){
                log.debug('MakeCallReqMsg Make call fail - ActiveMQ not connected');
                sio.sockets.socket(socketId).emit('MakeCallRes', {resultExp: err});
                var monitor = _socketUsers[agentID].monitor;
                monitor.setCallStatus(5);
                monitor.setCurCall(null);
            }
        });
    },
    /**
     * Yêu cầu đồng bô khách hàng tới CORE
     * @param id Trans ID
     * @param sessionId Session ID
     * @param data Dữ liệu đồng bộ
     * @param filterId ID bộ lọc khách hàng
     */
    sendSyncCustomer: function(id, sessionId, data, filterId){
        _ActiveMQ.publish('/queue/SyncCustomerReq', JSON.stringify({
            transID: id,
            sessionId: sessionId,
            queueName: _config.activemq.queueName,
            data: data,
            filterId: filterId
        }));
    },
    /**
     * Gửi yêu cầu lấy dữ liệu khách hàng từ CORE
     * @param id TransID
     * @param sessionId Session ID
     * @param query Bộ lọc khách hàng
     * @param flag Thứ tự khách hàng
     * @param packageSize Kích thước gói tin
     */
    sendGetCustomer: function(id, sessionId, query, flag, packageSize){
        _ActiveMQ.publish('/queue/GetCustomerReq', JSON.stringify({
            transID: id,
            sessionId: sessionId,
            queueName: _config.activemq.queueName,
            query: query,
            flag: flag,
            packageSize: packageSize
        }));
    },

    /**
     * Yêu cầu disconnect call từ agent hoặc quản trị viên
     * @param agentID User ID
     * @param callID ID cuộc gọi
     * @param channelID ID channel
     * @param tenant ID tenant
     */
    sendDisconnectCall: function(agentID, callID, channelID, tenant){
        var message = {
            messageType: 9,
            callID: callID,
            channelID: channelID,
            agentID: agentID,
            transID: createID(),
            tenant: tenant
        };
        log.debug("SENT DisconnectCallReqMsg ", message);
        _ActiveMQ.publish('/queue/DisconnectCallReqMsg', JSON.stringify(message));
    },

    /**
     * Yêu cầu pickup call từ agent hoặc quản trị viên
     * @param agentID User ID
     * @param callID ID cuộc gọi
     * @param channelID ID channel
     * @param tenant tenant
     */
    sendPickupCall: function(agentID, callID, channelID, tenant){
        _ActiveMQ.publish('/queue/PickupCallReqMsg', JSON.stringify({
            messageType: 27,
            callID: callID,
            channelID: channelID,
            agentID: agentID,
            transID: createID(),
            tenant: tenant
        }));
    },

    /**
     * Yêu cầu listen call từ agent hoặc quản trị viên
     * @param agentID User ID
     * @param callID ID cuộc gọi
     * @param tenant tenant
     */
    sendListenCall: function(agentID, callID, tenant){
        _ActiveMQ.publish('/queue/ListenCallReqMsg', JSON.stringify({
            messageType: 37,
            callID: callID,
            agentID: agentID,
            transID: createID(),
            tenant: tenant
        }));
    },

    /**
     * Yêu cầu transfer call từ agent hoặc quản trị viên
     * @param agentID User ID
     * @param toAgentID User ID
     * @param toExtension Extension của agent
     * @param callID ID cuộc gọi
     * @param option chưa dùng
     * @param tenant tenant ID
     */
    sendTransferCall: function(agentID, toAgentID, toExtension, callID, option, tenant){
        _ActiveMQ.publish('/queue/PickupCallReqMsg', JSON.stringify({
            messageType: 29,
            callID: callID,
            toAgentID : toAgentID,
            toExtension: toExtension,
            option : option,
            agentID: agentID,
            transID: createID(),
            tenant: tenant
        }));
    },

    /**
     * Yêu cầu whisper call từ agent hoặc quản trị viên
     * @param agentID User ID
     * @param callID ID cuộc gọi
     * @param tenant tenant ID
     */
    sendWhisperCall: function(agentID, callID, tenant){
        _ActiveMQ.publish('/queue/WhisperCallReqMsg', JSON.stringify({
            messageType: 31,
            callID: callID,
            agentID: agentID,
            transID: createID(),
            tenant: tenant
        }));
    },

    /**
     * Yêu cầu join call từ agent hoặc quản trị viên
     * @param agentID User ID
     * @param callID ID cuộc gọi
     * @param tenant tenant ID
     */
    sendJoinCall: function(agentID, callID, tenant){
        _ActiveMQ.publish('/queue/JoinCallReqMsg', JSON.stringify({
            messageType: 35,
            callID: callID,
            agentID: agentID,
            transID: createID(),
            tenant: tenant
        }));
    },

    /**
     * notify cho ACD có sự thay đổi service
     */
    serviceChange: function(){
        _ActiveMQ.publish('/queue/ServiceChangeReqMsg', JSON.stringify({
            messageType: 913
        }));
    },

    /**
     * Gửi trả thông tin agent cho ACD
     * @param id ID user
     * @param user thông tin user
     */
    agentInfo: function(id, user){
        var monitor = _socketUsers[id.toString()] ? _socketUsers[id.toString()].monitor : null;
        var status = monitor ? monitor.getStatus() : null;
        var deviceID = monitor ? monitor.getDeviceID() : null;
        voiceData.getAgentInfo(user, function(agentInfo){
            var message = {
                messageType: 905,
                transID: createID(),
                resultCode : 0,
                agentID: id,
                agentInfo: agentInfo,
                agentStatus: status,
                deviceID: deviceID,
                tenant: _config.app._id
            };
            log.debug('/publish/AgentInfoResMsg', message);
            _ActiveMQ.publish('/queue/AgentInfoResMsg', JSON.stringify(message));
        });
    },

    /**
     * Bản tin yêu cầu disable agent online trên queue
     * @param message Dữ liệu gửi đi
     */
    removeQueueMember: function(message){
        _ActiveMQ.publish('/queue/RemoveQueueMemberReqMsg', JSON.stringify({
            messageType: 932,
            queueID: message.queue,
            rmAgentID: message.agent,
            agentID: message.user,
            transID: createID(),
            tenant: _config.app._id
        }));
    },

    /**
     * Bản tin yêu cầu enable agent online trên queue
     * @param message Dữ liệu gửi đi
     */
    addQueueMember: function(message){
        _ActiveMQ.publish('/queue/AddQueueMemberReqMsg', JSON.stringify({
            messageType: 934,
            queueID: message.queue,
            addAgentID: message.agent,
            agentID: message.user,
            transID: createID(),
            tenant: _config.app._id
        }));
    },

    /**
     * call back trả về khi nhận được bản tin response
     * @param message
     */
    callBack: function(message){
        if(cbArr[message.transID]) {
            cbArr[message.transID](message);
            delete cbArr[message.transID];
        }
    },

    /**
     * Bản tin notify cho ACD việc khởi động lại tenant
     */
    restartTenant: function(){
        _ActiveMQ.publish('/queue/CrmRestartReqMsg', JSON.stringify({
            messageType: 110,
            transID: createID(),
            agentID: '',
            tenant: _config.app._id
        }));
    }
};

/**
 * Tạo chuỗi ID
 * @returns {*}
 */
function createID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4();
};

/**
 * clear callback sau khi nhận được response
 * @param transId
 */
function deleteCB(transId){
    if(cbArr[transId]) {
        cbArr[transId](null);
        delete cbArr[transId];
    }
};

/**
 * lưu call back vào mảng
 * @param transId Trans ID của bản tin
 * @param callback
 */
function setCB(transId, callback){
    cbArr[transId] = callback;
    setTimeout(deleteCB, 100000, transId);
}