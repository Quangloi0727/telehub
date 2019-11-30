/**
 * Created by baygiomoidc on 28/04/2016.
 */

var acdPublish = require(path.join(_rootPath, 'queue', 'publish', 'acd-publish.js'));
var camManager = require(path.join(_rootPath, 'monitor', 'manager.js'));

module.exports = function(campaign) {
    return new init(campaign);
}

function init(campaign) {
    var self = this;
    var data = campaign;
    var calling = [];

    //TODO: lấy danh sách agent phục vụ campaign
    _CampaignAgent.find({idCampaign: data._id}, function(err, result){
        data.agents = _.chain(result).map(function(ag){
            return ag.idAgent.toString();
        }).compact().value();
    });

    //TODO: tự động gọi ra theo các tiêu chỉ đã cấu hình của campaign và trạng thái của agent
    self.dialing = function(){
        var startTime = data.startDate;
        var endTime = data.endDate;
        var curTime = new Date();

        //TODO: cậu nhật trạng thái autodialing của campaign
        var newStatus = startTime > curTime ? 0 : (startTime <= curTime && endTime > curTime ? 1 : 3);
        if(data.autoDialingStatus != 2 && data.autoDialingStatus != newStatus){
            data.autoDialingStatus = newStatus;
            _Campains.findByIdAndUpdate(data._id, {$set:data}, function (error, cp) {
                _.genTree();
            });
        }

        //TODO: dừng auto dialing khi trạng thái = 2 hoặc 3
        if(data.autoDialingStatus == 2 || data.autoDialingStatus == 3) camManager.removeCampaign(data._id.toString());

        if(data.autoDialingStatus == 1){
            //TODO: tìm danh sách agent sẵn sàng gọi ra
            var selectAgents = [];
            _.each(data.agents, function(agent){
                if(_socketUsers[agent] && _socketUsers[agent].monitor){
                    var monitor = _socketUsers[agent].monitor;
                    var status = monitor.getStatus();
                    var callStatus = monitor.getCallStatus();
                    var delayTime = Date.now() - monitor.getEndCallTime();
                    if(_.isEqual(status.toString().split('')[0], '3') && callStatus == 5 && delayTime >= data.delayTime*1000){
                        selectAgents.push(agent);
                    }
                }
            })
            if(selectAgents.length > 0){

                _async.waterfall([
                    function(next){
                        //TODO: danh sách đã gọi ra
                        _Tickets.find({idCampain: data._id}, next);
                    },
                    function(tickets, next){
                        //TODO: lấy danh sách khách hàng để gọi
                        var aggregate = [];

                        aggregate.push({$match: {idCampain: data._id}});
                        aggregate.push({$match: {retry: {$lt: data.retry}}});
                        aggregate.push({$match: {retryTime: {$lt: new Date(Date.now() - data.retryTime*1000)}}});
                        aggregate.push({$match: {_id: {$nin: _.arrayObjectId(calling)}}});
                        aggregate.push({$match: {idCustomer: {$nin: _.pluck(tickets, 'idCustomer')}}});
                        aggregate.push({$sort: {retry: -1}});
                        aggregate.push({$limit: selectAgents.length});
                        aggregate.push({$lookup: {from: 'customerindex', localField: 'idCustomer', foreignField: '_id', as: 'data'}});
                        aggregate.push({$lookup: {from: 'campains', localField: 'idCampain', foreignField: '_id', as: 'campainData'}});
                        _CampainCustomer.aggregate(aggregate ,next);
                    }
                ], function(err, result){
                    if(result.length > 0){
                        var callData = _.zip(selectAgents, result);
                        _.each(callData, function(call){
                            //TODO: gọi ra
                            if(call[0] && call[1]){
                                var agentId = call[0].toString();
                                var monitor = _socketUsers[agentId].monitor;
                                var callNumber = call[1].data[0].field_so_dien_thoai;
                                acdPublish.sendMakeCallRequest(agentId, callNumber,_socketUsers[agentId].sid[0], data.trunk.prefix, data.type, data._id.toString());
                                monitor.setWorkPlace(data._id.toString());
                                monitor.setCallStatus(-1);
                                monitor.setCurCall(call[1]);
                                calling.push(call[1]._id.toString());
                            }
                        });
                    }else if(calling.length == 0){
                        //data.autoDialingStatus = 3;
                        //_Campains.findByIdAndUpdate(data._id, {$set:data}, function (error, cp) {
                        //    _.genTree();
                        //    camManager.removeCampaign(data._id.toString());
                        //});
                    }
                });
            }
        }
    };

    /**
     * cập nhật dữ liệu của campaign
     * @param newData Dữ liệu mới
     */
    self.setData = function(newData) {
        _CampaignAgent.find({idCampaign: newData._id}, function(err, result){
            data = newData;
            data.agents = _.chain(result).map(function(ag){
                return ag.idAgent.toString();
            }).compact().value();
        });
    };

    /**
     * lấy dữ liệu của campaign
     * @returns {*}
     */
    self.getData = function () {
        return data;
    };

    /**
     * Xóa call khỏi mảng call đang gọi
     * @param id ID của call
     */
    self.removeCalling = function (id) {
        calling.splice(calling.indexOf(id),1);
    };
}
