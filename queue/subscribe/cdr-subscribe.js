/**
 * Created by baygiomoidc on 27/02/2016.
 */


module.exports = function (client, sessionId) {
    var ternalPrefix = _config.activemq.queueName;
    log.debug('/queue/subscribe/cdr-subscribe',sessionId);

    // TODO: lưu CDR Call Info được gửi từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'CDRCallInfoReqMsg', function (body, header) {
        var dirtyMessage = JSON.parse(body);
        log.debug('CDRCallInfoReqMsg', dirtyMessage);

        var message = {};
        _.each(_.keys(dirtyMessage),function(key){
            if(!_.isEqual(dirtyMessage[key], '')) message[key] = dirtyMessage[key];
        });

        if(message.callType == 1 || message.callType == 7||  message.callType == 8){
            // TODO: Gọi vào
            _CdrCallInfo.create(message, function(err, result){
                if(err) log.error('CDRCallInfoReqMsg ', err);
            });
            //_CdrCallInfo.update({callId: message.callId}, {$set: message}, {upsert: true, new: true}, function(err, result){
            //    if(err) log.error('CDRCallInfoReqMsg ', err);
            //});
        }else if(message.callType == 6){
            // TODO: Gọi ra
            _CdrCallInfo.create(_.omit(message, 'serviceId'), function(err, result){
                if(err) log.error('CDRCallInfoReqMsg ', err);
            });
            //_CdrCallInfo.update({callId: message.callId}, {$set: _.omit(message, 'serviceId')}, {upsert: true, new: true}, function(err, result){
            //    if(err) log.error('CDRCallInfoReqMsg ', err);
            //});
        }

    });

    // TODO: lưu CDR Trans Info được gửi từ CORE
    client.subscribe('/queue/' + ternalPrefix + '-' + 'CDRTransInfoReqMsg', function (body, header) {
        var dirtyMessage = JSON.parse(body);
        log.debug('CDRTransInfoReqMsg', dirtyMessage);

        var message = {};
        _.each(_.keys(dirtyMessage),function(key){
            if(!_.isEqual(dirtyMessage[key], '')) message[key] = dirtyMessage[key];
        });

        if(message.cdrAgentCallId){
            message.callId = message.cdrAgentCallId;
        };

        if(message.answerTime){
            message.callDuration= message.endTime - message.answerTime;
            message.durationBlock= Math.floor((message.callDuration)/(5*1000));
            log.debug('callDuration ', message.callDuration, ' - durationBlock ', message.durationBlock);
        }
        if((message.answerTime || message.endTime) && (message.ringTime || message.startTime)){
            message.waitDuration = (message.answerTime || message.endTime) - (message.ringTime || message.startTime);
            message.waitingDurationBlock = Math.floor((message.waitDuration)/(5*1000));
            log.debug('waitDuration ', message.waitDuration, ' - waitingDurationBlock ', message.waitingDurationBlock);
        }

        if(message.startTime){
            message.timeBlock = moment(message.startTime).hour();
            log.debug('timeBlock ', message.timeBlock);
        }

        if(message.serviceId){
            message.serviceId = message.serviceId;
        }

        if(message.campaignID){
            message.idCampain = message.campaignID;
        }

        _CdrTransInfo.update({cdrTransId: message.cdrTransId}, {$set: message}, {upsert: true, new: true}, function(err, result){
            if(err) log.error('CDRTransInfoReqMsg', err);
        });

        //_async.waterfall([
        //    function(next){
        //        _CdrCallInfo.findOne({callId: message.callId}, next);
        //    },
        //    function(callInfo, next){
        //        _CdrTransInfo.update({cdrTransId: message.cdrTransId}, {$set: message}, {upsert: true, new: true}, next);
        //    }
        //], function(err, result){
        //    if(err) log.error('CDRTransInfoReqMsg', err);
        //});
    });
};

//var updateTrans = function(callInfo){
//    _CdrTransInfo.update({callId: callInfo.callId}, {$set: {caller: }}, {upsert: true, new: true}, function(err, result){
//        if(err) log.error('CDRTransInfoReqMsg', err);
//    });
//}