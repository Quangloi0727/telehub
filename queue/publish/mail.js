/**
 * Created by NghiaTM on 4/7/2016.
 */
module.exports = {
    sentTest: function (body) {
        _ActiveMQ.publish('/queue/MailTest', JSON.stringify(body));

    },
    addService: function(data){
        var body= {type:2};
        body.obj= data;
        log.debug(body);
        _ActiveMQ.publish('/topic/ServiceStatus', JSON.stringify(body));
    },
    updateService: function(data){
        var body= {type:1};
        body.obj= data;
        log.debug(body);
        _ActiveMQ.publish('/topic/ServiceStatus', JSON.stringify(body));
    },
    removeService: function(data){
        var body= {type:0};
        body.obj= data;
        log.debug(body);
        _ActiveMQ.publish('/topic/ServiceStatus', JSON.stringify(body));
    }
};