// DUONGNB: Add module monitor order
var defaultCampaign = '58142600978302865324a68e';
var defaultUserAdmin = '5813447954b5467c8123a09c';
var defaultAgentgroup = '58170faf8c569be10d777315';
var defaultSources = '5800d66429928c635f567f1f';
var standardTicketRemain = 10;
var assignInterval = 5 * 1000; // <=> 5mins = 900000
var agentStatus = {};

exports.assignWhenOnline = function (agentId, callback) {
    //hoangdv fixed: Trạng thái nhận đơn hàng tự động mặc định false
    agentStatus[agentId] = false;
    // dummy
    if (!isAgentEnable(agentId)) {
        return;
    }
    _Users.findById({
        _id: agentId
    }, function (err, result) {
        if (err) return callback(err);
        var groupIds = _.pluck(result.agentGroupMembers, 'group');
        var isContain;
        _.each(groupIds, function(groupId) {
            if (groupId.toString() === defaultAgentgroup) isContain = true; 
        });
        if (isContain) {
            _async.parallel({
                checkAgentRemainingTicket: function (callback) {
                    checkAgentRemainingTicket(agentId, function (err, result) {
                        if (err) return callback(err);
                        callback(null, result);
                    })
                },
                checkTotalRemainingOrder: function (callback) {
                    checkTotalRemainingOrder(function (err, result) {
                        if (err) return callback(err);
                        callback(null, result);
                    })
                }
            }, function (err, results) {
                if (err) return callback(err);
                if (!results.checkTotalRemainingOrder) {
                    callback();
                } else {
                    if (results.checkAgentRemainingTicket >= standardTicketRemain) {
                        callback();
                    } else if (results.checkTotalRemainingOrder <= (standardTicketRemain - results.checkAgentRemainingTicket)) {
                        // TODO: assign all remaining order to agent
                        mongoClient.collection('orders').find({
                            ticketId: {
                                $in: [null, '']
                            },
                            customerId: {
                                $nin: [null, '']
                            }
                        }).sort({createDate: 1}).toArray(function (err, results) {
                            if (err) return callback(err);
                            assignMultiOrder(results, agentId, function (err, results) {
                                if (err) return callback(err);
                                callback();
                            })
                        });
                    } else if (results.checkTotalRemainingOrder > (standardTicketRemain - results.checkAgentRemaingTicket)) {
                        // TODO: assign number of order equal standardTicketRemain - checkAgentRemaingTicket
                        mongoClient.collection('orders').find({
                            ticketId: {
                                $in: [null, '']
                            },
                            customerId: {
                                $nin: [null, '']
                            }
                        }).sort({createDate: 1}).limit(standardTicketRemain - results.checkAgentRemaingTicket).toArray(function (err, results) {
                            if (err) return callback(err);
                            assignMultiOrder(results, agentId, function (err, results) {
                                if (err) return callback(err);
                                callback();
                            })
                        });
                    }
                }
            })
        } else {
            callback();
        }
    })
};

exports.assignByInterval = function () {
    setInterval(() => {
        checkAgentOnlineInGroup(function (err) {
            if (err) log.error(err);
        });
    }, assignInterval);
};

/**
 * Agent thay đổi trạng thái nhận đơn hàng tự động
 * @param agentId
 * @param status
 */
exports.changeStatus = function(agentId, status) {
    var logObj = {
        old: agentStatus
    };
    agentStatus[agentId] = status;
    logObj.new = agentStatus;
	log.debug('Agent changes status get order', logObj);
};

/**
 * Lấy trạng thái lấy đơn hàng theo
 * @param agentId
 * @returns {*}
 */
exports.getStatus = function(agentId) {
    return isAgentEnable(agentId);
};

/**
 * Thay đổi cài đặt orderMonitor
 * @param remain
 * @param delay
 */
exports.settingOrderMonitor = function(remain, delay) {
    if (isNaN(remain) || isNaN(delay)) return;
    standardTicketRemain = remain;
    if (delay < 1000) return;
    assignInterval = delay;
};

function checkAgentRemainingTicket(agentId, callback) {
    _Tickets.count({
        idAgent: agentId,
        status: 0,
        idCampain: defaultCampaign
    }, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    })
}

function checkTotalRemainingOrder(callback) {
    mongoClient.collection('orders').count({
        ticketId: {
            $in: [null, '']
        }
    }, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    })
}

function createTicket(customerId, agentId, callback) {
    _async.waterfall([
        function createCampaignCustomer(callback) {
            // create campaignCustomer
            var newCampaignCustomer = new _CampainCustomer({
                idCustomer: customerId,
                idCampain: defaultCampaign,
                createBy: defaultUserAdmin
            });
            _CampainCustomer.create(newCampaignCustomer.toObject(), function (err, result) {
                if (err) return callback(err);
                callback();
            });
        },
        function createTicket(callback) {
            // Create Ticket and assign for agent online
            var newTicket = new _Tickets({
                idCustomer: customerId,
                idCampain: defaultCampaign,
                idAgent: agentId,
                status: 0,
                createBy: defaultUserAdmin,
                created: Date.now()
            });
            _Tickets.create(newTicket.toObject(), function (err, result) {
                if (err) return callback(err);
                log.debug('Ticket created:', result);
                callback(null, result._id);
            })
        }
    ], function (err, ticketId) {
        if (err) return callback(err);
        callback(null, customerId, ticketId);
    });
}

function assignMultiOrder(orders, agentId, callback) {
    _async.each(orders, function (order, callback) {
        createTicket(order.customerId, agentId, function (err, customerId, ticketId) {
            if (err) {
                callback(err);
            } else {
                insertTicketToOrder(ticketId, order._id, function (err, result) {
                    if (err) callback(err);
                    callback(null);
                })
            }
        })
    }, function (err, results) {
        if (err) return callback(err);
        callback();
    })
}

function insertTicketToOrder(idTicket, orderId, callback) {
    mongoClient.collection('orders').findOneAndUpdate({
        _id: orderId
    }, {
        $set: {
            ticketId: idTicket
        }
    }, {
        upsert: true
    }, function (err, result) {
        if (err) return callback(err);
        log.debug('Inserted ticketId to order', result);
        callback(null, result);
    })
}

function checkAgentOnlineInGroup(callback) {
    _Users.find({
        agentGroupMembers: {
            $elemMatch: {
                group: defaultAgentgroup
            }
        }
    }).exec(function (err, result) {
        if (err) return callback(err);
        var onlineAgents = [];
        var agents = _.pluck(result, '_id');
        _.each(agents, function (agentId) {
            if (_socketUsers[agentId] && isAgentEnable(agentId)) onlineAgents.push(agentId);
        });
        if (!onlineAgents.length) {
            callback();
        } else {
            processOrderOfAgentOnline(onlineAgents, function (err) {
                if (err) return callback(err);
                callback();
            })
        }
    })
}

function processOrderOfAgentOnline(onlineAgents, callback) {
    var onlineAgentTickets = [];
    log.debug('Online Agents:', onlineAgents);
    var customerId = null;
    var orderId = null;
    _async.parallel({
        checkOnlineAgentTickets: function (callback) {
            _async.each(onlineAgents, function (agentId, callback) {
                _Tickets.count({
                    idCampain: defaultCampaign,
                    idAgent: agentId,
                    status: 0
                }, function (err, result) {
                    onlineAgentTickets.push({
                        agentId: agentId,
                        numberTickets: result
                    });
                    callback();
                })
            }, callback);
        },
        checkTotalRemainingOrder: function (callback) {
            mongoClient.collection('orders').findOne({
                ticketId: {
                    $in: [null, '']
                },
                customerId: {
                    $nin: [null, '']
                }
            }, { sort: {createDate: 1} }, function (err, result) {
                if (result) {
                    customerId = result.customerId;
                    orderId = result._id;
                }
                callback();
            })
        }
    }, function (err, results) {
        var isAllPass = _.every(onlineAgentTickets, (agentTicket) => {
            return agentTicket.numberTickets >= standardTicketRemain
        });
        if (isAllPass || !customerId) {
            callback();
        } else {
            var agentId = _.min(onlineAgentTickets, (onlineAgent) => {
                return onlineAgent.numberTickets
            }).agentId;
            createTicket(customerId, agentId, function (err, customerId, ticketId) {
                if (err) {
                    callback(err);
                } else {
                    insertTicketToOrder(ticketId, orderId, function(err) {
                        if (err) return callback(err);
                         processOrderOfAgentOnline(onlineAgents, callback);
                    })
                }
            })
        }
    })
}

function isAgentEnable(agentId) {
    var id = agentId ? agentId.toString() : '';
    return !!agentStatus[id];
}
