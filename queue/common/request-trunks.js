
var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));

var requestTrunksCallback = {};

var requestQueue = {
    Trunk: 'CRM-RequestTrunk'
  
};

var responseQueue = {
    Trunk: 'CRM-ResponseTrunk'
};

var timeOutRequest = 30; // seconds

function requestTrunk(query, timeOutCallback, callback){
    var trans = guid();
    requestTrunksCallback[trans] = callback;
    var obj = {trans : trans, query: query};
    _ActiveMQ.publish('/queue/' + _config.activemq.queueName + '-' + requestQueue.Trunk, JSON.stringify(obj));
    setTimeout(function(){
        if (_.has(requestTrunksCallback, trans)){
            delete requestTrunksCallback[trans];
            return timeOutCallback();
        }
    }, timeOutRequest * 1000);
}

function responseTrunk(client, sessionId){
    client.subscribe('/queue/' + _config.activemq.queueName + '-' + responseQueue.Trunk + '-fromCore', function (body, header) {
        log.debug( body, header);
        var obj = parseJSONToObject(body);
        if (!_.has(obj, 'trans')) return log.error('Body khong co transection');

        if (_.has(requestTrunksCallback, obj.trans)){
            requestTrunksCallback[obj.trans](obj);
            delete requestTrunksCallback[obj.trans];
        }
    });
}



function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

module.exports = {
    RequestTrunk : requestTrunk,
    ResponseTrunk: responseTrunk
  
};