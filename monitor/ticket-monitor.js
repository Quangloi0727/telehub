/**
 * Created by baygiomoidc on 06/06/2016.
 */


var manager = require(path.join(_rootPath, 'monitor', 'manager.js'));

module.exports = function() {
    return new init();
}

/**
 * Khởi tạo các biến và hàm chức năng
 */
function init() {
    var self = this;
    var timer = 0;

    /**
     * Kiểm tra dữ liệu notify và ticket của user và gửi notify cho User khi đủ điều kiện
     */
    self.alert = function(){
        if(timer == 0){
            timer = 600;
            var usersId = _.keys(_socketUsers);
            var noNotifyId = [];
            var noNotifyIdChat = [];
            var noNotifyIdMail = [];
            var curDate = Date.now();

            log.debug(31, 'Số lượng agent: ', usersId.length);
            _async.waterfall([
                function(next){
                    // Lấy dữ liệu những ticket đã gửi Notify
                    _Notification.find({agentId: {$in: usersId}, status: 0}, function(err, result){
                        log.debug(35, 'Số lượng Notify: ', result ? result.length : err);
                        _.each(result, function(noti){
                            var ticketId = noti.url.indexOf('ticket-edit?ticketID=') == 0 ? noti.url.split('ticket-edit?ticketID=')[1] : null;
                            if(ticketId) noNotifyId.push(ticketId);

                            var ticketIdChat = noti.url.indexOf('ticket-chat-edit?ticketID=') == 0 ? noti.url.split('ticket-chat-edit?ticketID=')[1] : null;
                            if(ticketIdChat) noNotifyIdChat.push(ticketIdChat);

                            var ticketIdMail = noti.url.indexOf('ticket-mail-edit?ticketID=') == 0 ? noti.url.split('ticket-mail-edit?ticketID=')[1] : null;
                            if(ticketIdMail) noNotifyIdMail.push(ticketIdMail);
                        });
                        next(err);
                    });
                },
                //function(next){
                //    // Kiểm tra thời gian delay notify
                //    _Notification.find({agentId: {$in: usersId}, status: 1}, function(err, result){
                //        _.each(result, function(noti){
                //            var monitor = _socketUsers[noti.agentId.toString()].monitor;
                //            if(monitor){
                //                var delayTime = monitor.getUserData().notifDelay;
                //                if(noti.url.indexOf('ticket-edit?ticketID=') == 0 && curDate - noti.created < delayTime*1000){
                //                    noNotifyId.push(noti.url.split('ticket-edit?ticketID=')[1]);
                //                }
                //                if(noti.url.indexOf('ticket-chat-edit?ticketID=') == 0 && curDate - noti.created < delayTime*1000){
                //                    noNotifyIdChat.push(noti.url.split('ticket-chat-edit?ticketID=')[1]);
                //                }
                //                if(noti.url.indexOf('ticket-mail-edit?ticketID=') == 0 && curDate - noti.created < delayTime*1000){
                //                    noNotifyIdMail.push(noti.url.split('ticket-mail-edit?ticketID=')[1]);
                //                }
                //            }
                //        });
                //        next(err);
                //    });
                //},
                function(next){
                    //Tìm ticket voice tới hạn xử lý để notify
                    _Tickets.aggregate([
                        {$match: {$and: [
                            {_id: {$nin: _.arrayObjectId(noNotifyId)}},
                            {idAgent: {$in: _.arrayObjectId(usersId)}},
                            {deadline: {$ne: null}},
                            {status: {$ne: 2}},
                        ]}},
                        {$limit: 5000}
                    ], function(err, tickets){
                        next(null);
                        log.debug(81, 'Số lượng Ticket: ', tickets.length);
                        _.each(tickets, function(ticket){
                            var _socket = _socketUsers[ticket.idAgent.toString()];
                            var monitor = _socket ? _socket.monitor : null;
                            if(monitor){
                                var notifyTime = monitor.getUserData().notifDeadline;
                                if(curDate - ticket.deadline > notifyTime*1000){
                                    _.pushNotification(0, 'ticket-edit?ticketID='+ticket._id, ticket.idAgent.toString());
                                }
                            }
                        });
                    });
                },
                function(next){
                    //Tìm ticket chat tới hạn xử lý để notify
                    _TicketsChat.aggregate([
                        {$match: {$and: [
                            {_id: {$nin: _.arrayObjectId(noNotifyIdChat)}},
                            {idAgent: {$in: _.arrayObjectId(usersId)}},
                            {deadline: {$ne: null}},
                            {status: {$ne: 2}},
                        ]}},
                        {$limit: 5000}
                    ], function(err, tickets){
                        next(null);
                        _.each(tickets, function(ticket){
                            var _socket = _socketUsers[ticket.idAgent.toString()];
                            var monitor = _socket ? _socket.monitor : null;
                            if(monitor){
                                var notifyTime = monitor.getUserData().notifDeadline;
                                if(curDate - ticket.deadline > notifyTime*1000){
                                    _.pushNotification(0, 'ticket-chat-edit?ticketID='+ticket._id, ticket.idAgent.toString());
                                }
                            }
                        });
                    });
                },
                function(next){
                    //Tìm ticket mail tới hạn xử lý để notify
                    _TicketsMail.aggregate([
                        {$match: {$and: [
                            {_id: {$nin: _.arrayObjectId(noNotifyIdMail)}},
                            {idAgent: {$in: _.arrayObjectId(usersId)}},
                            {deadline: {$ne: null}},
                            {status: {$ne: 2}},
                        ]}},
                        {$limit: 5000}
                    ], function(err, tickets){
                        next(null);
                        _.each(tickets, function(ticket){
                            var _socket = _socketUsers[ticket.idAgent.toString()];
                            var monitor = _socket ? _socket.monitor : null;
                            if(monitor){
                                var notifyTime = monitor.getUserData().notifDeadline;
                                if(curDate - ticket.deadline > notifyTime*1000){
                                    _.pushNotification(0, 'ticket-mail-edit?ticketID='+ticket._id, ticket.idAgent.toString());
                                }
                            }
                        });
                    });
                }
            ]);
        }
        timer--;
    };
}
