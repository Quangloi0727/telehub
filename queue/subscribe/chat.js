var crmPublish = require(path.join(_rootPath, 'queue', 'publish', 'chat.js'));

//ActiveMQ subcribe
module.exports = function (client, sessionId) {
    //CORE gửi yêu cầu lấy thông tin cuộc chat cũ
    client.subscribe('/queue/chat' + '-' + _config.activemq.queueName + '-' + 'ConnectResThread' + '-fromCore', function (body, header) {
        try {
            //query dữ liệu cuộc chat và trả về cho bên chat server
            var result = JSON.parse(body);
            var clientId = result.ip + '-' + result._id + '-' + result.service + '-' + result.cookie;
            _async.waterfall([
                function (next) {
                    _CustomerFields.find({status: 1}, next);
                },
                function(cfields, next){
                    var _agg = [
                        {$match: {clientId: clientId}},
                        {$lookup: {from: 'chatlogs', localField: '_id', foreignField: 'threadId', as: 'chatlogs'}},
                        {$sort: {updated: -1}}
                    ].concat(_.map(cfields, function (o) {
                        return {$lookup: {from: o.modalName, localField: 'customerId', foreignField: 'entityId', as: o.modalName}};
                    }));
                    _ChatThread.aggregate(_agg, function (err, threads){
                        _ChatThread.populate(threads, {
                            path: "agentId chatlogs.sentFrom.id",
                            model: _Users,
                            populate: {
                                path: 'chatTag',
                                model: _ChatTag
                            }}, next);
                    });
                }
            ], function(wError, wResp){
                if (!wError){
                    crmPublish.publishData('ResQueryThread', {sid: result.sid, data: wResp});
                }
                else{
                    console.log(wError, wResp);
                }
            });
        }catch (err){
            console.log(46, err);
        }
    });

    //CORE gửi yêu cầu tạo cuộc chat
    client.subscribe('/queue/chat' + '-' + _config.activemq.queueName + '-' + 'CreateNewThread' + '-fromCore', function (body, header) {
        try {
            //Tạo cuộc chat mới
            var result = JSON.parse(body);
            var clientId = result.ip + '-' + result._id + '-' + result.service + '-' + result.cookie;
            _ChatThread.create({clientId: clientId, region: result.region, country: result.country, channelId: result.channelId}, function (error, newThread) {
                _.genTree();
                crmPublish.publishData('ResNewThread', {sid: result.sid, data: newThread._id});
            });
        }catch (err){
            console.log(63, err);
        }
    });

    //CORE gửi yêu cầu tạo log chat
    client.subscribe('/queue/chat' + '-' + _config.activemq.queueName + '-' + 'CreateNewLog' + '-fromCore', function (body, header) {
        try {
            //Tạo log chat mới
            var result = JSON.parse(body);
            var body = {threadId: new mongodb.ObjectId(result.threadId), content: result.msg};
            body['sentFrom'] = {from: parseInt(result.from)};
            if (_.has(result, 'sentFrom')) body['sentFrom']['id'] = new mongodb.ObjectId(result.sentFrom);
            if (_.has(result, 'toId')) body['sentFrom']['to'] = !_.isNull(result.toId) ? new mongodb.ObjectId(result.toId) : null;
            if (_.has(result, 'status')) body['status'] = Number(result.status);
            if (_.has(result, 'url-attachment') && _.has(result, 'fileName')) body['attachment'] = [{url: result['url-attachment'], fileName: result['fileName'] }];
            _ChatLog.create(body, function (error, newLog) {
                _.genTree();
            });
        }catch (err){
//            console.log(13, err);
        }
    });
}