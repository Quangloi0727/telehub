/**
 * Created by luongvanlam on 4/8/16.
 */

var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));

var requestKPICallback = {};
var requestAddKPICallback = {};

var requestQueue = {
    KPI: 'CRM-RequestKpiCollection',
    AddKPI: 'CRM-RequestAddKpiCollection'
};

var responseQueue = {
    KPI: 'CRM-ResponseKpiCollection',
    AddKPI: 'CRM-ReponseAddKpiCollection'
};

var timeOutRequest = 30; // seconds

function requestKpi(query, timeOutCallback, callback){
    var trans = guid();
    requestKPICallback[trans] = callback;
    var obj = {trans : trans, query: query};
    _ActiveMQ.publish('/queue/' + _config.activemq.queueName + '-' + requestQueue.KPI, JSON.stringify(obj));
    setTimeout(function(){
        if (_.has(requestKPICallback, trans)){
            delete requestKPICallback[trans];
            return timeOutCallback();
        }
    }, timeOutRequest * 1000);
}

function responseKpi(client, sessionId){
    client.subscribe('/queue/' + _config.activemq.queueName + '-' + responseQueue.KPI + '-fromCore', function (body, header) {
        console.log(37, body, header);
        var obj = parseJSONToObject(body);
        if (!_.has(obj, 'trans')) return log.error('Body khong co transection');

        if (_.has(requestKPICallback, obj.trans)){
            requestKPICallback[obj.trans](obj);
            delete requestKPICallback[obj.trans];
        }
    });
}

function addKpiRequest(collection, timeOutCallback, callback){
    var trans = guid();
    requestAddKPICallback[trans] = callback;
    var obj = {trans: trans, collection: collection};

    _ActiveMQ.publish('/queue/' + _config.activemq.queueName + '-' + requestQueue.AddKPI, JSON.stringify(obj));

    setTimeout(function(){
        if (_.has(requestAddKPICallback, trans)){
            delete requestAddKPICallback[trans];
            return timeOutCallback();
        }
    }, timeOutRequest * 1000);
}

function addKpiResponse(client, sessionId){
    client.subscribe('/queue/' + _config.activemq.queueName + '-' + responseQueue.AddKPI + '-fromCore', function (body, header) {
        var obj = parseJSONToObject(body);
        if (!_.has(obj, 'trans')) return log.error('Body khong co transection');

        if (_.has(requestAddKPICallback, obj.trans)){
            requestAddKPICallback[obj.trans](obj);
            delete requestAddKPICallback[obj.trans];
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
    RequestKPI : requestKpi,
    ResponseKPI: responseKpi,
    RequestAddKPI: addKpiRequest,
    ResponseAddKPI: addKpiResponse,
};