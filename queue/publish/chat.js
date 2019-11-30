/**
 * Created by sonth on 4/04/16.
 */

module.exports = {
    /**
     * Hàm gửi msg tới CORE
     * @param modalName - dùng để phân biệt dạng msg
     * @param publishObject - dữ liệu msg gửi kèm
     */
    publishData: function (modalName, publishObject) {
        _ActiveMQ.publish('/queue/chat' + '-' + _config.activemq.queueName + '-' + modalName + '-fromCRM', JSON.stringify(publishObject));
    }
};