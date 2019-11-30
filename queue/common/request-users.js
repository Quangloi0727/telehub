/**
 * Created by luongvanlam on 4/8/16.
 */

var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));

var requestUserCallback = {};
var requestAddUserCallback = {};

var requestQueue = {
    KPI: 'CRM-RequestUser',
    AddKPI: 'CRM-RequestAddUser'
};

var responseQueue = {
    KPI: 'CRM-ResponseUser',
    AddKPI: 'CRM-ReponseAddUser'
};

var timeOutRequest = 30; // seconds

function requestUser(page, row, query, timeOutCallback, callback){
    var trans = guid();
    requestUserCallback[trans] = callback;
    var obj = {trans : trans, page: page, row : row, query: query};
    _ActiveMQ.publish('/queue/' + _config.activemq.queueName + '-' + requestQueue.KPI, JSON.stringify(obj));
    console.log(27, JSON.stringify(obj));
    setTimeout(function(){
        if (_.has(requestUserCallback, trans)){
            delete requestUserCallback[trans];
            return timeOutCallback();
        }
    }, timeOutRequest * 1000);
}

function responseUser(client, sessionId){
    client.subscribe('/queue/' + _config.activemq.queueName + '-' + responseQueue.KPI + '-fromCore', function (body, header) {
        var obj = parseJSONToObject(body);
        if (!_.has(obj, 'trans')) return log.error('Body khong co transection');

        if (_.has(requestUserCallback, obj.trans)){
            requestUserCallback[obj.trans](obj);
            delete requestUserCallback[obj.trans];
        }
    });
}

function addUserRequest(users, timeOutCallback, callback){
    var trans = guid();
    requestAddUserCallback[trans] = callback;
    var obj = {trans: trans, uId: users};

    _ActiveMQ.publish('/queue/' + _config.activemq.queueName + '-' + requestQueue.AddKPI, JSON.stringify(obj));

    setTimeout(function(){
        if (_.has(requestAddUserCallback, trans)){
            delete requestAddUserCallback[trans];
            return timeOutCallback();
        }
    }, timeOutRequest * 1000);
}

function addUserResponse(client, sessionId){
    client.subscribe('/queue/' + _config.activemq.queueName + '-' + responseQueue.AddKPI + '-fromCore', function (body, header) {
        var obj = parseJSONToObject(body);
        if (!_.has(obj, 'trans')) return log.error('Body khong co transection');

        if (_.has(requestAddUserCallback, obj.trans)){
            requestAddUserCallback[obj.trans](obj);
            delete requestAddUserCallback[obj.trans];
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
    RequestUser : requestUser,
    ResponseUser: responseUser,
    RequestAddUser: addUserRequest,
    ResponseAddUser: addUserResponse,
};