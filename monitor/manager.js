/**
 * Created by baygiomoidc on 09/05/2016.
 */

var campaigns = {};
var groups = {};
var services = {};
var ticket = require(path.join(_rootPath, 'monitor', 'ticket-monitor.js'))();

/**
 * Khởi tạo các module quản lý monitor
 */
function init(){
    // Khai báo module quản lý campaign
    _Campains.find({status: {$ne: 0}, type: {$ne: 1}, autoDialingStatus: {$nin: [2,3]}}).populate('trunk').exec(function(err, cps){
        _.each(cps, function(cp){
            campaigns[cp._id.toString()] = require(path.join(_rootPath, 'monitor', 'campaign-monitor.js'))(cp);
        });
        setInterval(dialing, 1000);
    });

    // Khai báo module quản lý service và group
    _async.parallel({
        groups: function(next){
            _AgentGroups.find({status: {$ne: 0}}, next);
        },
        services: function(next){
            _Services.find({status: {$ne: 0}}, next);
        },
        //campaigns: function(next){
        //    _Campains.find({status: {$ne: 0}}, next);
        //}
    }, function(err, result){
        _.each(result.groups, function(gp){
            groups[gp._id.toString()] = require(path.join(_rootPath, 'monitor', 'group-monitor.js'))(gp);
        });

        _.each(result.services, function(gp){
            services[gp._id.toString()] = require(path.join(_rootPath, 'monitor', 'service-monitor.js'))(gp);
        });

        setInterval(alert, 1000);
    });

    setInterval(cleanTicket, 86400000);
}

/**
 * Được gọi hàng ngày để xóa dữ liệu ticket ảo không cần thiết của chat và email
 */
function cleanTicket(){
    var daysBefore = 7;
    var curDate = new Date();
    curDate.setHours(0,0,0,0);
    var lastDate = new Date(curDate.getTime() - (daysBefore * 24 * 60 * 60 * 1000));

    _TicketsChat.remove({status: -1, created: {$lt: lastDate}}, function(err, result){

    });

    _TicketsMail.remove({status: -1, created: {$lt: lastDate}}, function(err, result){

    });
}

/**
 * hàm interval tự động gọi ra của campaign
 */
function dialing(){
    _.each(_.keys(campaigns), function(key){
        campaigns[key].dialing();
    });
}

/**
 * hàm interval cảnh báo của service và group
 */
function alert(){
    _.each(_.keys(groups), function(key){
        groups[key].alert();
    });

    _.each(_.keys(services), function(key){
        services[key].alert();
    });

    ticket.alert();
}

/**
 * xóa module quản lý campaign
 * @param id ID campaign
 */
function removeCampaign(id){
    if(campaigns[id]){
        delete campaigns[id];
    }
}

/**
 * thêm module quản lý campaign
 * @param cp Dữ liệu của campaign
 */
function addCampaign(cp){
    campaigns[cp._id.toString()] = require(path.join(_rootPath, 'monitor', 'campaign-monitor.js'))(cp);
}

/**
 * lấy dữ liệu module quản lý campaign
 * @param id ID campaign
 * @returns {*} module quản lý
 */
function getCampaign(id){
    return campaigns[id];
}

/**
 * xóa module quản lý group
 * @param id ID group
 */
function removeGroup(id){
    if(groups[id]){
        groups[id].destroy();
        delete groups[id];
    }
}

/**
 * thêm module quản lý group
 * @param gp Dữ liệu của group
 */
function addGroup(gp){
    if(gp.status){
        groups[gp._id.toString()] = require(path.join(_rootPath, 'monitor', 'group-monitor.js'))(gp);
    }
}

/**
 * Cập nhật dữ liệu của group
 * @param gp dữ liệu của group
 */
function updateGroup(gp){
    if(!gp.status){
        removeGroup(gp._id.toString());
    }else {
        if(groups[gp._id]){
            groups[gp._id].updateData(gp);
        }else {
            addGroup(gp);
        }
    }
}

/**
 * Lấy dữ liệu module quản lý group
 * @param id ID group
 * @returns {*} module quản lý group
 */
function getGroup(id){
    return groups[id];
}

/**
 * xóa module quản lý service
 * @param id ID service
 */
function removeService(id){
    if(services[id]){
        services[id].destroy();
        delete services[id];
    }
}

/**
 * thêm mới module quản lý service
 * @param sv Dữ liệu service
 */
function addService(sv){
    if(sv.status) services[sv._id.toString()] = require(path.join(_rootPath, 'monitor', 'service-monitor.js'))(sv);
}

/**
 * lấy dữ liệu quản lý service
 * @param id ID service
 * @returns {*} module quản lý service
 */
function getService(id){
    return services[id];
}

/**
 * cập nhật dữ liệu của service
 * @param sv Dữ liệu của service
 */
function updateService(sv){
    if(!sv.status){
        removeService(sv._id.toString());
    }else {
        if(services[sv._id]){
            services[sv._id].updateData(sv);
        }else {
            addService(sv);
        }
    }
}

/**
 * xóa user khỏi danh sách được monitor
 * @param user ID user
 */
function removeManager(user){
    _.each(_.keys(groups), function(key){
        groups[key].removeManager(user);
    });
    _.each(_.keys(services), function(key){
        services[key].removeManager(user);
    });
}

module.exports = {
    init: init,
    removeCampaign: removeCampaign,
    addCampaign: addCampaign,
    getCampaign: getCampaign,
    removeGroup: removeGroup,
    addGroup: addGroup,
    getGroup: getGroup,
    removeService: removeService,
    addService: addService,
    getService: getService,
    removeManager: removeManager,
    updateGroup: updateGroup,
    updateService: updateService
}