/**
 * Created by NghiaTM on 5/6/2016.
 */

module.exports = function (client, sessionId) {

    client.subscribe('/queue/' + _config.app._id + '-' + 'CDRCallInfoReqMsg', function (body, header) {
        log.debug(body);
        try {
            var message = JSON.parse(body);
            if(_.has(message, 'serviceId')){
                message.serviceId= new mongoose.Types.ObjectId(message.serviceId);
            }
            _CdrCallInfo.create(message, function(error, data) {
                if (error) {
                    log.error(error);
                }
            });
        }catch (err){
            console.log(err);
        }
    });
    client.subscribe('/queue/' + _config.app._id + '-' + 'CDRTransInfoReqMsg', function (body, header) {
        log.debug(body);
        try {
            var message = JSON.parse(body);
            message = _.omit(message, '_id');

            if(!_.isNull(message.serviceId)){
                message.serviceId= new mongoose.Types.ObjectId(message.serviceId);
            }
            if(!_.isNull(message.agentId)){
                message.agentId= new mongoose.Types.ObjectId(message.agentId);
            }
            if(!_.isNull(message.invokerId)){
                message.invokerId= new mongoose.Types.ObjectId(message.invokerId);
            }
            if(!_.isNull(message.disAgentId)){
                message.disAgentId= new mongoose.Types.ObjectId(message.disAgentId);
            }
            if(!_.isNull(message.skillId)){
                message.skillId= new mongoose.Types.ObjectId(message.skillId);
            }
            if(!_.isNull(message.groupId)){
                message.groupId= new mongoose.Types.ObjectId(message.groupId);
            }
            if(!_.isNull(message.shiftId)){
                message.shiftId= new mongoose.Types.ObjectId(message.shiftId);
            }


            if(!_.isNull(message.answerTime)){
                message.callDuration= message.endTime- message.answerTime;
                message.durationBlock= Math.floor((message.callDuration)/(5*1000))
            }
            if(!_.isNull(message.answerTime) && !_.isNull(message.ringTime)){
                message.waitDuration= message.answerTime- message.ringTime;
                message.waitingDurationBlock= Math.floor((message.waitDuration)/(5*1000))
            }
            message.timeBlock= moment(message.startTime).hour();


            _async.waterfall([
                function(c2){
                    _CdrTransInfo.find({cdrTransId:message.cdrTransId}, function(error, trans){
                        c2(error, trans);
                    })
                },
                function(trans, c2){
                    if(trans.length==0){
                        if(message.callId && message.callId.length>0){
                            _CdrCallInfo.findOne({callId: message.callId}, function(err, callInfo){
                                if(err) return c2(err);
                                if(callInfo){
                                    message.idCompany= callInfo.idCompany;
                                    message.idCampain= callInfo.idCampain;
                                    message.idTicket= callInfo.idTicket;
                                }
                                    _CdrTransInfo.create(message, function(error, data) {
                                        if (error) {
                                            log.error(error);
                                        }
                                        c2(error, data);
                                    });

                            })
                        }else{
                            _CdrTransInfo.create(message, function(error, data) {
                                if (error) {
                                    log.error(error);
                                }
                                c2(error, data);
                            });
                        }

                    }else{

                        if(message.callId && message.callId.length>0){
                            _CdrCallInfo.findOne({callId: message.callId}, function(err, callInfo){
                                if(err) return c2(err);
                                if(callInfo){
                                    message.idCompany= callInfo.idCompany;
                                    message.idCampain= callInfo.idCampain;
                                    message.idTicket= callInfo.idTicket;
                                }
                                _CdrTransInfo.update({cdrTransId: message.cdrTransId}, message, function(error, data) {
                                    if (error) {
                                        log.error(error);
                                    }
                                    c2(error, data);
                                });

                            })
                        }else{
                            _CdrTransInfo.update({cdrTransId:message.cdrTransId},message, function(error, data) {
                                if (error) {
                                    log.error(error);
                                }
                                c2(error, data);
                            });
                        }
                    }
                }
            ])
        }catch (err){
            log.error(err);
        }
    });

}