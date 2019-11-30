// DUONGNB: Create 'Add new order API' Module

exports.create = function (req, res) {
    log.info(req.body);
    var customerInfo = req.body.customer;
    var orderId = new mongodb.ObjectId(req.body.orderId);
    var defaultCampaign = '58142600978302865324a68e';
    var defaultUserAdmin = '5813447954b5467c8123a09c';
    var defaultAgentgroup = '58170faf8c569be10d777315';
    var defaultSources = '5800d66429928c635f567f1f';
    var standardTicketRemain = 5;
    customerInfo.sources = [defaultSources];
    if (!customerInfo.field_so_dien_thoai) {
        res.status(500).send({
            err: 'Phone number is empty!!'
        })
    } else {
        _async.waterfall([
            function createCustomer(callback) {
                // Check customer is exist
                mongoClient.collection('customerindex').findOne({
                    field_so_dien_thoai: customerInfo.field_so_dien_thoai
                }, function (err, result) {
                    if (err) return callback(err);
                    if (result) {
                        // If exist, return customer Id
                        log.debug('customer already exist', result);
                        callback(null, result._id);
                    } else {
                        // If not exist, creat new customer
                        var _newCus = {};
                        _async.waterfall([
                            function (callback) {
                                _Customer.create(customerInfo, function (err, result) {
                                    if (err) return callback(err);
                                    callback(null, result);
                                });
                            },
                            function (c, callback) {
                                if (!_.has(customerInfo, 'sources') || !customerInfo.sources.length) return callback(null, c);
                                _CustomerSource.update({
                                    _id: {
                                        $in: customerInfo.sources
                                    }
                                }, {
                                    $inc: {
                                        amount: 1
                                    }
                                }, {
                                    multi: true
                                }, function (error, s) {
                                    if (err) return callback(err);
                                    callback(null, c);
                                });
                            },
                            function (c, callback) {
                                // insert to fields value for customer
                                _newCus._id = c._id;
                                _newCus.sources = _.arrayObjectId(customerInfo.sources);
                                _newCus.field_e_mail = null;
                                _newCus.field_so_dien_thoai = null;
                                delete customerInfo.sources;
                                _async.each(_.keys(customerInfo), function (k, cb) {
                                    if (_.isNull(customerInfo[k]) || _.isEmpty(customerInfo[k]) || _.isUndefined(customerInfo[k])) return cb({
                                        err: 'CCK fail when import'
                                    }, null);
                                    if (!_CCKFields[k]) return cb({
                                        err: 'customer field is undefined'
                                    }, null);
                                    switch (_CCKFields[k].type) {
                                        case 2:
                                            customerInfo[k] = Number(customerInfo[k]);
                                            break;
                                        case 4:
                                            customerInfo[k] = _.chain(customerInfo[k]).map(function (el) {
                                                return _.isEqual("0", el) ? null : el;
                                            }).compact().value();
                                            break;
                                        case 5:
                                            customerInfo[k] = _.compact(customerInfo[k]);
                                            break;
                                        case 6:
                                            customerInfo[k] = _moment(customerInfo[k], 'DD/MM/YYYY')._d;
                                            break;
                                        default:
                                            break;
                                    }
                                    _newCus[k] = customerInfo[k];
                                    _CCKFields[k].db.update({
                                        entityId: c._id
                                    }, {
                                        entityId: c._id,
                                        value: customerInfo[k]
                                    }, {
                                        upsert: true
                                    }, cb);
                                }, function (err) {
                                    if (err) return callback(err);
                                    callback(null, c);
                                });
                            },
                            function (c, callback) {
                                // insert to customer index
                                mongoClient.collection('customerindex').insert(_newCus, function (err) {
                                    if (err) return callback(err);
                                    callback(null, c)
                                });
                            }
                        ], function (err, result) {
                            if (err) return callback(err, result);
                            log.debug('created new customer:', result);
                            callback(null, result._id);
                        })
                    }
                });
            },
            function createTicket(result, callback) {
                var idCustomer = result;
                _Users.find({
                    agentGroupMembers: {
                        $elemMatch: {
                            group: defaultAgentgroup
                        }
                    }
                }).exec(function (err, result) {
                    if (err) return callback(err);
                    // check number of agent online
                    var onlineAgents = [];
                    var agents = _.pluck(result, '_id');
                    _.each(agents, function (agentId) {
                        if (_socketUsers[agentId]) onlineAgents.push(agentId);
                    })
                    console.log('onlineAgents', onlineAgents);
                    if (!onlineAgents.length) {
                        // if no agent online => callback
                        log.debug('No agent online at this time');
                        callback(null, idCustomer);
                    } else if (onlineAgents.length && onlineAgents.length == 1) {
                        // if 1 agent online
                        checkAgentRemainingTicket(onlineAgents[0], defaultCampaign, function (err, result) {
                            if (result < standardTicketRemain) {
                                _async.waterfall([
                                    function createCampaignCustomer(callback) {
                                        // create campaignCustomer
                                        var newCampaignCustomer = new _CampainCustomer({
                                            idCustomer: idCustomer,
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
                                            idCustomer: idCustomer,
                                            idCampain: defaultCampaign,
                                            idAgent: onlineAgents[0],
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
                                ], function (err, result) {
                                    if (err) return callback(err);
                                    callback(null, idCustomer, result);
                                });
                            } else {
                                callback(null, idCustomer);
                            }
                        })
                    } else if (onlineAgents.length && onlineAgents.length > 1) {
                        // check if more than 1 agent online
                        onlineAgentTickets = [];
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
                        }, function (err) {
                            if (err) return callback(err);
                            // find agentId with min ticket process
                            var agentId = _.min(onlineAgentTickets, (onlineAgent) => {
                                return onlineAgent.numberTickets
                            }).agentId;
                            checkAgentRemainingTicket(onlineAgents[0], defaultCampaign, function (err, result) {
                                if (result >= standardTicketRemain) {
                                    _async.waterfall([
                                        function createCampaignCustomer(callback) {
                                            // create campaignCustomer
                                            var newCampaignCustomer = new _CampainCustomer({
                                                idCustomer: idCustomer,
                                                idCampain: defaultCampaign,
                                                createBy: defaultUserAdmin
                                            });
                                            _CampainCustomer.create(newCampaignCustomer.toObject(), function (err, result) {
                                                if (err) return callback(err);
                                                callback();
                                            });
                                        },
                                        function createTicket(callback) {
                                            // Create Ticket and assign for agent with min ticket non process
                                            var newTicket = new _Tickets({
                                                idCustomer: idCustomer,
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
                                    ], function (err, result) {
                                        if (err) return callback(err);
                                        callback(null, idCustomer, result);
                                    });
                                } else {
                                    callback(null, idCustomer);
                                }
                            })
                        })
                    }
                })
            }
        ], function (err, customerId, ticketId) {
            if (err) {
                res.status(500).send({
                    err: err
                });
            } else {
                _async.parallel({
                    insertCustomerToOrder: function (callback) {
                        if (customerId) {
                            insertCustomerToOrder(customerId, orderId, function (err) {
                                if (err) callback(err);
                                callback();
                            })
                        } else {
                            callback();
                        }
                    },
                    insertTicketToOrder: function (callback) {
                        if (ticketId) {
                            insertTicketToOrder(ticketId, orderId, function (err) {
                                if (err) callback(err);
                                callback();
                            })
                        } else {
                            callback();
                        }
                    }
                }, function (err, result) {
                    if (err) {
                        res.status(500).send({
                            err: err
                        });
                    } else {
                        res.status(200).send({
                            err: null,
                            customerId: customerId,
                            ticketId: ticketId
                        })
                    }
                })
            }
        })
    }
};

exports.show = function (req, res) {
    console.log(req.params);
    var id = req.params.customernew;
    _CompanyProfile.findById(id).populate('fieldId').exec(function (err, result) {
        var results = {}
        _.each(result.fieldId, function (field) {
            results[field.displayName] = {
                modalName: field.modalName,
                fieldType: field.fieldType
            }
        })
        res.status(200).send(results);
    })
};

exports.update = function(req, res) {
	var _body = _.cleanRequest(req.body, [
		'field_order_createDate',
		'field_order_deviceInfo',
		'field_order_ip',
		'field_order__id',
		'field_order_url'
	]);
	var $set = {};
	_.each(_body, function(v, k) {
        if (k.indexOf('phone') > 0 && _.first(v) !== '0') {
            v = '0' + v;
        }
		$set[k.replace('field_order_', '')] = _.isArray(v)? v[0] : v;
	});
	var $push = {
		orderHistories: {
			agentId: new mongodb.ObjectId(req.session.user._id),
			updated: new Date()
		}
	};
	mongoClient.collection('orders').findAndModify(
		{_id: new mongodb.ObjectId(req.body.field_order__id)}, // query
		[], // sort
		{$set, $push},
		{upsert: true}, // option
		function(err, order) {
			if (!err) {
				log.debug('Update order', order);
			}
			res.json({code: err ? 500 : 200, message: err ? JSON.stringify(err) : 'Cập nhật đơn hàng thành công'});
		}
	);
};

function insertCustomerToOrder(idCustomer, orderId, callback) {
    mongoClient.collection('orders').findOneAndUpdate({
        _id: orderId
    }, {
        $set: {
            customerId: idCustomer
        }
    }, {
        upsert: true
    }, function (err, result) {
        if (err) return callback(err);
        log.debug('Inserted customerId to order', result);
        callback();
    })
};

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
        callback();
    })
};

function checkAgentRemainingTicket(agentId, defaultCampaign, callback) {
    _Tickets.count({
        idAgent: agentId,
        status: 0,
        idCampain: defaultCampaign
    }, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    })
}
