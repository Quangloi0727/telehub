/**
 * Created by baygiomoidc on 09/05/2016.
 */

var campaigns = {};

/**
 * khởi tạo dữ liệu campaign để quản lý
 */
function init(){
    _Campains.find({status: {$ne: 0}, type: {$ne: 1}, autoDialingStatus: {$nin: [2,3]}}).populate('trunk').exec(function(err, cps){
        _.each(cps, function(cp){
            campaigns[cp._id.toString()] = require(path.join(_rootPath, 'monitor', 'campaign-monitor.js'))(cp);
        });
    });
    setInterval(dialing, 1000);
}

/**
 * tự động gọi tất cả method dialing của mỗi campaign
 */
function dialing(){
    _.each(_.keys(campaigns), function(key){
        campaigns[key].dialing();
    });
}
/**
 * xóa campaign khỏi hệ thống quản lý
 * @param id ID campaign
 */
function removeCampaign(id){
    delete campaigns[id];
}
/**
 * thêm mới campaign vào hệ thống quản lý
 * @param cp Dữ liệu của campaign
 */
function addCampaign(cp){
    campaigns[cp._id.toString()] = require(path.join(_rootPath, 'monitor', 'campaign-monitor.js'))(cp);
}
/**
 * lấy dữ liệu của campaign
 * @param id ID campaign
 * @returns {*}
 */
function getCampaign(id){
    return campaigns[id];
}

module.exports = {
    init: init,
    removeCampaign: removeCampaign,
    addCampaign: addCampaign,
    getCampaign: getCampaign
}