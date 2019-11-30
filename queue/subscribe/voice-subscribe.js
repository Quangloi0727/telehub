/**
 * Created by baygiomoidc on 27/02/2016.
 */

var manager = require(path.join(_rootPath, 'monitor', 'manager.js'));
var syncAcd = require(path.join(_rootPath, 'monitor', 'sync-acd.js'));
var acdPublish = require(path.join(_rootPath, 'queue', 'publish', 'acd-publish.js'));

/**
 * By hoangdv on 10/02/2017.
 * Keep all callIds in once hour(ttl). Keep only once popup for once incomming call.
 * @type {{add, check, setTimeToLive}}
 */
var hashListCallId = (function() {
	var hash = [];
	var	ttl = 60 * 60 * 1000;
	var interLive = setInterval(function() {
        hash = [];
	}, ttl);
	var checkCallIdInList = function(callId) {
		// true: Đã tồn tại
		// false: Chưa tồn tại
		return hash.indexOf(callId) >= 0;
	};
    return {
		/**
         * Thêm một callId vào mảng.
         * Nếu thêm thành công(true) -> Mọi thứ ok
         * Nếu thêm không thành công(false) -> Đây là bản tin popup thứ 2 cho cuộc gọi này reject
		 * @param callId
		 * @returns {boolean}
		 */
		add: function(callId) {
			if (checkCallIdInList(callId)) return false; // Đã tồn tại --> error
			hash.push(callId);
			return true;
		},
		check: checkCallIdInList,
        setTimeToLive: function(newTtl) {
            ttl = newTtl;
            if (interLive) {
                clearInterval(interLive);
				interLive = setInterval(function() {
					hash = [];
				}, ttl);
            }
		}
	};
})();


module.exports = function (client, sessionId) {
    var ternalPrefix = _config.activemq.queueName;
    console.log(11, sessionId, ternalPrefix);

    // TODO: Gửi bản tin restart dữ liệu của tenant sang ACD
    acdPublish.restartTenant();

    // TODO: nhận bản tin popup new call từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'PopupCallReqMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            log.debug('RECEIVE POPUP ', result);

            var callNumber = result.callerNumber;
            var serviceId = result.queueID;
            var agentId = result.agentID.toString();
            var serviceName = result.queueName;
            var callID = result.callID;
            if (!hashListCallId.add(callID)) {
                return log.error('DUPLICATE POPUP', {callID});
            }
            var agentSockets = _socketUsers[agentId];
            var callType = result.callType;
            var callStatusType = result.callStatusType;
            var monitor = agentSockets.monitor;
            monitor.setCaller(result.callerNumber);
            monitor.setCalled(result.Callee);
            monitor.setCallID(callID);
            monitor.setChannelID(result.channelID);
            monitor.setCallType(callType);
            monitor.monitor();

            if(!_.isEmpty(serviceId)) monitor.setWorkPlace(serviceId);
            monitor.setCallStatus(Number(callStatusType));
            if(_.isEqual(callType.toString(), '6')){
                var curCall = monitor.getCurCall();
                if(curCall){
                    if(curCall.idCampain){
                        var ticketId = null;
                        _async.waterfall([
                            //function(next){
                            //    _Campains.findById(curCall.idCampain, next);
                            //},
                            //function(campain, next){
                            function(next){
                                if(_.has(curCall, 'retry')){
                                    //Todo: Gọi ra tự động/auto dialing
                                    _Tickets.create({idCustomer: curCall.idCustomer, idCampain: curCall.idCampain, idAgent: agentId, callId: [callID], callIdLength: 1}, function(err, ticket){
                                        next(err, ticket);
                                    });
                                }else {
                                    //Todo: Gọi ra bình thường
                                    next(null, curCall);
                                }
                            },
                            //function(ticket, campain, next){
                            //    ticketId = ticket._id;
                            //    _CdrCallInfo.update({callId: callID}, {$set: {
                            //        callId: callID,
                            //        idCampain: campain._id,
                            //        idCompany: campain.idCompany,
                            //        idTicket: ticket._id,
                            //        called : callNumber
                            //    }}, {upsert: true}, next);
                            //}
                        ], function(err, ticket){
                            if(!err){
                                if(_.has(curCall, 'retry')){
                                    //Todo: Gọi ra tự động/auto dialing
                                    var index = agentSockets.sid.length;
                                    var sid = agentSockets.sid[index-1];
                                    var _clientSocket = sio.sockets.sockets[sid];
                                    log.debug('START POPUP ', result);
                                    if(_clientSocket) _clientSocket.emit('IncommingCall', {id: ticket._id, title: callNumber + ' - ' + _moment(new Date()).format('HH:mm') + ' - ' + curCall.campainData[0].name});
                                }else {
                                    //Todo: Gọi ra bình thường
                                    _Tickets.update({_id: ticket._id}, {
                                        $push: {callId: callID},
                                        $inc: {callIdLength: 1}
                                    }, function(err, result){

                                    });
                                }
                            }
                        });
                    }
                    if(curCall.idService){
                        _Tickets.update({_id: curCall._id}, {
                            $push: {callId: callID},
                            $inc: {callIdLength: 1}
                        }, function(err, result){

                        });
                    }
                }
            }else if(_.isEqual(callType.toString(), '1') || _.isEqual(callType.toString(), '7') || _.isEqual(callType.toString(), '8')){
                //Todo: Gọi vào
                _async.waterfall([
                    function (next) {
                        _CCKFields['field_so_dien_thoai'].db.find({value: callNumber}).limit(1).exec(next);
                    },
                    function (customers,next) {
                        if (customers.length > 0)  return next(null, [{_id: customers[0].entityId}]);
                        _async.waterfall([
                            function(next2){
                                _Customer.create({}, next2);
                            },
                            function(newCus, next2){
                                mongoClient.collection('customerindex').insert({
                                    _id: newCus._id,
                                    field_so_dien_thoai: callNumber
                                }, function(err, result){
                                    next2(err, newCus);
                                });
                            },
                            function(newCus,next2){
                                _CCKFields['field_so_dien_thoai'].db.create({entityId: newCus._id, value: callNumber}, next2);
                            },
                            function(newfield,next2){
                                var _agg = [];
                                _agg.push({$match: {_id: newfield.entityId}});
                                _agg.push({$lookup: {from: 'field_so_dien_thoai', localField: '_id', foreignField: 'entityId', as: 'field_so_dien_thoai'}});
                                _Customer.aggregate(_agg, function(err, cus){
                                    next2(err,cus);
                                });
                            }
                        ],next);
                    },
                    function (customers, next) {
                        var ticketId = null;
                        if(customers.length > 0){
                            _async.waterfall([
                                //function(next2){
                                //    _Services.findById(serviceId, next2);
                                //},
                                //function(service, next2){
                                function(next2){
                                    _Tickets.create({idCustomer: customers[0]._id, idService: serviceId, idAgent: agentId, callId: [callID], callIdLength: 1}, next2);
                                },
                                //function(ticket, service, next2){
                                //    ticketId = ticket._id;
                                //    _CdrCallInfo.update({callId: callID}, {$set: {
                                //        callId: callID,
                                //        serviceId: service._id,
                                //        idCompany: service.idCompany,
                                //        idTicket: ticket._id,
                                //        called : callNumber
                                //    }}, {upsert: true}, next2);
                                //}
                            ], next);
                        }else{
                            next(customers,null);
                        }
                    }
                ], function(err, ticket){
                    if (err) return log.debug('START POPUP GET TICKET ERROR', {error: err, bundle: result});
                    if(agentSockets && agentSockets.sid){
                        var index = agentSockets.sid.length;
                        var sid = agentSockets.sid[index-1];
                        var _clientSocket = sio.sockets.sockets[sid];
                        if(_clientSocket) {
                            log.debug('START POPUP ', {result: result, ticket: ticket});
                            if(ticket) _clientSocket.emit('IncommingCall', {id: ticket._id, title: callNumber + ' - ' + _moment(new Date()).format('HH:mm') + ' - ' + serviceName});
                        } else {
							log.debug('TRY SEND TO ROOM, BROADCAST TO ROOM 170');
							sio.sockets.in(agentId).emit('IncommingCall', {id: ticket._id, title: callNumber + ' - ' + _moment(new Date()).format('HH:mm') + ' - ' + serviceName});
                        }
                    } else {
						log.debug('TRY SEND TO ROOM, BROADCAST TO ROOM 177');
						sio.sockets.in(agentId).emit('IncommingCall', {id: ticket._id, title: callNumber + ' - ' + _moment(new Date()).format('HH:mm') + ' - ' + serviceName});
                    }
                });
            }
        }catch (err){
            console.log('voice-subscribe/PopupCallReqMsg ',err);
        }
    });

    // TODO: Dữ liệu các đầu số có thể khai báo cho service từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'QueueNumberResMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            var sid = result.transID.split('|')[2];
            var _clientSocket = sio.sockets.sockets[sid];
            if(_clientSocket) _clientSocket.emit('getQueueNumberRes', result.numbers);
        }catch (err){
            console.log('voice-subscribe/getQueueNumberRes ',err);
        }
    });

    // TODO: Kiểm tra đầu số đã được sử dụng chưa từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'CheckQueueNumberResMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            var sid = result.transID.split('|')[2];
            var _clientSocket = sio.sockets.sockets[sid];
            if(_clientSocket) _clientSocket.emit('CheckQueueNumberRes', result.result);
        }catch (err){
            console.log('voice-subscribe/CheckQueueNumberRes ',err);
        }
    });

    // TODO: Login response
    client.subscribe('/queue/' + ternalPrefix + '-' + 'LoginResMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            log.debug('voice-subscribe/LoginResMsg ',result);
            if(result.resultCode == 11 || result.resultCode == 12){
                var agentId = result.agentID;
                var sid = _socketUsers[agentId] ? _.last(_socketUsers[agentId].sid) : null;
                var _clientSocket = sid ? sio.sockets.sockets[sid] : null;
                if(_clientSocket) _clientSocket.emit('LogOutUser', result);
            }else {
                acdPublish.callBack(result);
            }
        }catch (err){
            log.error('voice-subscribe/LoginResMsg ',err);
        }
    });

    // TODO: Kết quả bản tin yêu cầu thay đổi trạng thái làm việc từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'ChangeAgentStatusResMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            var agentId = result.toAgent.toString();
            var changeBy = result.agentID.toString();
            if(result.resultCode == 0 && _socketUsers[agentId].monitor) _socketUsers[agentId].monitor.setStatus(Number(result.status));

            //_.each(_socketUsers[changeBy].sid, function(sid){
            //    var _clientSocket = sio.sockets.sockets[sid];
            //    if(_clientSocket) _clientSocket.emit('VoiceChangeAgentStatus', result);
            //});
        }catch (err){
            console.log('voice-subscribe/ChangeAgentStatusResMsg ',err);
        }
    });

    // TODO: Cập nhật trạng thái agent call của agent từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'AgentCallStatusNotifyMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            var agentId = result.agentID;
            log.debug('AgentCallStatusNotifyMsg', result);
            if(_socketUsers[agentId]){
                var monitor = _socketUsers[agentId].monitor;
                monitor.setCaller(result.callerNumber);
                monitor.setCalled(result.callee);
                monitor.setCallStatus(Number(result.callStatusType));
                monitor.setCallID(result.callID);
                monitor.setChannelID(result.channelID);
                monitor.setCallType(result.callType);
                monitor.monitor();

                if(!_socketUsers[agentId].sid.length){
                    log.error('AgentCallStatusNotifyMsg - socketUser length ', _socketUsers[agentId].sid.length);
                }

                _.each(_socketUsers[agentId].sid, function(sid){
                    var _clientSocket = sio.sockets.sockets[sid];
                    if(_clientSocket) _clientSocket.emit('ChangeAgentCallStatus', result);
                });
            }else{
                log.error('AgentCallStatusNotifyMsg - No socketUser');
            }
        }catch (err){
            log.error('AgentCallStatusNotifyMsg ', err);
        }
    });

    // TODO: Kết quả bản tin click to call từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'MakeCallResMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            var agentId = result.agentID;
            var monitor = _socketUsers[agentId].monitor;
            if(result.resultCode == 0){

            }else {
                var _clientSocket = result.transID.split("|")[2];
                if(_clientSocket){
                    sio.sockets.socket(_clientSocket).emit('MakeCallRes', result);
                };
                monitor.setCallStatus(5);
                monitor.setCurCall(null);
            }
        }catch (err){
            console.log('voice-subscribe/MakeCallResMsg ',err);
        }
    });

    // TODO: Danh sách các trunk có thể sử dụng
    client.subscribe('/queue/' + ternalPrefix + '-' + 'CheckTrunkRes', function (body, header) {
        try {
            var result = JSON.parse(body);
            var _clientSocket = result.socketId;
            if(_clientSocket) sio.sockets.socket(result.socketId).emit('checkTrunkResponse', result);
        }catch (err){
            console.log('voice-subscribe/CheckTrunkRes ',err);
        }
    });

    // TODO: cập nhật các thông số của queue để monitor
    client.subscribe('/queue/' + ternalPrefix + '-' + 'UpdateQueueStatisticReqMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            var serviceMonitor = manager.getService(result.queueID);
            if(serviceMonitor){
                serviceMonitor.setCallDropRate(result.misscallRatio);
                serviceMonitor.setWaitingCustomer(result.totalMember);
                serviceMonitor.setMissCall(result.misscall);
                serviceMonitor.setTotalAgent(result.totalAgent);
            }
        }catch (err){
            console.log('voice-subscribe/QueueMonitor ',err);
        }
    });

    // TODO: kết quả bản tin đồng bộ dữ liệu khách hàng từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'SyncCustomerRes', function (body, header) {
        try {
            var result = JSON.parse(body);
            if(result.resultCode == 0){
                var syncCustomer = require(path.join(_rootPath, 'monitor', 'sync-customer.js'));
                syncCustomer.resSyncCustomer(result);
            }
        }catch (err){
            console.log('voice-subscribe/SyncCustomerRes ',err);
        }
    });

    // TODO: dữ liệu khách hàng đồng bộ từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'GetCustomerRes', function (body, header) {
        var result = JSON.parse(body);
        if(result.resultCode == 0){
            var syncCustomer = require(path.join(_rootPath, 'monitor', 'sync-customer.js'));
            syncCustomer.resGetCustomer(result);
        }

        try {

        }catch (err){
            console.log('voice-subscribe/GetCustomerRes ',err);
        }
    });

    // lấy bộ lọc khách hàng từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'GetCustomerFilterResMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            var sid = result.transID.split('|')[2];
            var _clientSocket = sio.sockets.sockets[sid];
            if(_clientSocket) _clientSocket.emit('getCustomerFilterRes', result.result);
        }catch (err){
            console.log('voice-subscribe/GetCustomerFilterResMsg ',err);
        }
    });

    // TODO: cập nhật thêm mới call cho queue monitor
    client.subscribe('/queue/' + ternalPrefix + '-' + 'InsertNewCallReqMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            log.debug("InsertNewCallReqMsg ", result);
            var serviceMonitor = manager.getService(result.queueID);
            if(serviceMonitor) serviceMonitor.updateCall(result);
        }catch (err){
            console.log('voice-subscribe/InsertNewCallReqMsg ',err);
        }
    });

    // TODO: xóa call ra khỏi queue monitor
    client.subscribe('/queue/' + ternalPrefix + '-' + 'RemoveCallReqMsg', function (body, header) {
        //try {
            var result = JSON.parse(body);
            log.debug("RemoveCallReqMsg ", result);
            var serviceMonitor = manager.getService(result.queueID);
            if(serviceMonitor) serviceMonitor.removeCall(result.callID);
        //}catch (err){
        //    console.log('voice-subscribe/RemoveCallReqMsg ',err);
        //}
    });

    // TODO: cập nhật trạng thái call cho queue monitor
    client.subscribe('/queue/' + ternalPrefix + '-' + 'UpdateQueueCallStatusReqMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            var serviceMonitor = manager.getService(result.queueID);
            if(serviceMonitor) serviceMonitor.updateCall(result);
        }catch (err){
            console.log('voice-subscribe/UpdateQueueCallStatusReqMsg ',err);
        }
    });

    // TODO: cập nhật danh sách agent online trên queue
    client.subscribe('/queue/' + ternalPrefix + '-' + 'UpdateQueueListMemberReqMsg', function (body, header) {
        try {
            var result = JSON.parse(body);
            log.debug(result);
            var serviceMonitor = manager.getService(result.queueID);
            if(serviceMonitor) serviceMonitor.setAgents(result.members);
        }catch (err){
            console.log('voice-subscribe/UpdateQueueListMemberReqMsg ',err);
        }
    });

    // TODO: bản tin ACD yêu cầu đồng bộ lại toàn bộ dữ liệu của tenant
    client.subscribe('/topic/ACDRefreshReqMsg', function (body, header) {
        try {
            log.debug('topic/ACDRefreshReqMsg ');
            _.each(_.keys(_socketUsers), function(agentId){
                syncAcd.syncAgent(agentId);
            });
        }catch (err){
            log.error('voice-subscribe/ACDRefreshReqMsg ',err);
        }
    });
};