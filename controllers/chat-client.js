/**
 * Created by MrBlack.
 */

var crmPublish = require(path.join(_rootPath, 'queue', 'publish', 'chat.js')); //helper send Activemq msg sang CORE
var fs = require('fs');
//var _Excel = require('exceljs');
var nodemailer = require('nodemailer');

//GET
exports.index = function (req, res) {
    if (_.has(req.query, 'queryType')){
        if (req.query['queryType'] == 2){
            //query note
            _ChatNote.find({clientId: req.query.clientId}).populate('agentId').exec(function(err, resp){
                if (!err) res.json(resp);
            });
        }
        else if (req.query['queryType'] == 4){
            //query CCK field
            _CustomerFields.find({status: 1}, function(err, resp){
                if (!err) res.json(resp);
            });
        }
        else if (req.query['queryType'] == 5){
            //query chat template
            var agg = _ChatTemplate.aggregate();
            if (_.has(req.query, 'channelId')) req.query.channelId = _.convertObjectId(req.query.channelId);
            if (_.has(req.query, 'status')) {
                req.query.status = parseInt(req.query.status);
                if (req.query.status < 0) delete req.query.status;
            }
            delete  req.query.queryType;

            _ChatTemplate.find(req.query, function (error, t) {
                res.json({code: error ? 404 : 200, templates: t});
            });
        }
        else if (req.query['queryType'] == 6) {
            res.json(_config);
        }
        else if (req.query['queryType'] == 0){
            var _tQuery = {};
            //query thread
            _async.waterfall([
                function (next) {
                    _CustomerFields.find({status: 1}, next);
                },
                function (cfields, next){
                    var query = {};
                    if (_.has(req.query, 'name-search-chat')) query['field_ho_ten'] = {value: req.query['name-search-chat'], type: 1};
                    if (_.has(req.query, 'mail-search-chat')) query['field_mail'] = {value: req.query['mail-search-chat'], type: 1};
                    if (_.has(req.query, 'phone-search-chat')) query['field_so_dien_thoai'] = {value: Number(req.query['phone-search-chat']).toString(), type: 1};
                    var _query = _.chain(cfields).map(function (o) {
                        return _.has(query, o.modalName) ? _.object([o.modalName + '.value'], [_.switchAgg(query[o.modalName].type, query[o.modalName].value)]) : null;
                    }).compact().value();
                    if (_query.length){
                        var _agg = _.map(cfields, function (o) {
                            return {$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}};
                        });
                        _agg.push({$match: {$and: _query}});
                        _Customer.aggregate(_agg, function (error, customers) {
                            if (customers != undefined && customers.length){
                                _tQuery['idCustomer'] = [];
                                _async.each(customers, function(cus, cb){
                                    _tQuery['idCustomer'].push(cus._id);
                                    cb();
                                }, function(){
                                    next(null, cfields);
                                });
                            }
                            else{
                                next('--Khong ton tai customer match --', []);
                            }
                        });
                    }
                    else{
                        next(null, cfields);
                    }
                },
                function (cfields, next){
                    if (!_.has(req.query, 'searchType') || req.query['searchType'] == '1'){
                        //agent search
                        //_tQuery.ids = [new mongodb.ObjectId(!_.isUndefined(req.session.user) ? req.session.user._id : user)];
                        next(null, cfields);
                    }
                    else{
                        //supervisor search
                        _async.waterfall([
                            function(cb){
                                _Users.findById(req.query.userId, cb);
                            }
                        ], function(err, usr){
                            if (usr.ternalLeaders.length > 0){
                                if (_.has(req.query, 'agent-search-chat')){
                                    _Users.find({'displayName': new RegExp(_.stringRegex( req.query['agent-search-chat']), 'i')}).exec(function(err, resp){
                                        _tQuery['ids'] =  _.map(resp, function(user){
                                            return user._id;
                                        });
                                        next(null, cfields);
                                    });
                                }
                                else{
                                    next(null, cfields);
                                }
                            }
                            else{
                                var companyIds = _.map(usr.companyLeaders, function(company){
                                    return company.company;
                                });

                                var groupIds = _.map(usr.agentGroupLeaders.concat(usr.agentGroupMembers), function(group){
                                    return group.group;
                                });
                                var agg = [
                                    {$unwind: {path: '$agentGroupMembers', preserveNullAndEmptyArrays: true}},
                                    {$unwind: {path: '$agentGroupLeaders', preserveNullAndEmptyArrays: true}},
                                    {$lookup: {from: 'agentgroups', localField: 'agentGroupMembers.group', foreignField: '_id', as: 'groupMembers'}},
                                    {$lookup: {from: 'agentgroups', localField: 'agentGroupLeaders.group', foreignField: '_id', as: 'groupLeaders'}},
                                    {$match:
                                    {$or:
                                        [
//                                                {_id: new mongodb.ObjectId(_.isUndefined(req.session.user) ? user : req.session.user._id )},
                                        {_id: _.convertObjectId(req.query.userId)},
                                        {'agentGroupMembers.group': {$in: groupIds}},
                                        {'agentGroupLeaders.group': {$in: groupIds}},
                                        {'groupMembers.idParent': {$in: companyIds}},
                                        {'groupLeaders.idParent': {$in: companyIds}}
                                    ]
                                    }
                                    },
                                    {$group: {_id: '$_id', displayName: {$first: '$displayName'}}}
                                ];

                                if (_.has(req.query, 'agent-search-chat')) {
                                    agg.push({$match: {'displayName': new RegExp(_.stringRegex( req.query['agent-search-chat']), 'i') }});
                                }

                                _Users.aggregate(agg, function(e, r){
                                    _tQuery['ids'] =  _.map(r, function(user){
                                        return user._id;
                                    });
                                    next(null, cfields);
                                });
                            }
                        });
                    }
                },
                function(cfields, next){
                    var query = {};
                    if (_.has(req.query, 'clientId')) query.clientId = req.query.clientId;
                    if (_.has(req.query, 'agentId')) query.agentId = _.convertObjectId(req.query.agentId);
                    if (_.has(req.query, 'threadId')) query._id = _.convertObjectId(req.query.threadId);
                    if (_.has(req.query, 'fromTime-search-chat') && _.has(req.query, 'toTime-search-chat')){
                        query['created'] = {
                            $gte: _moment(req.query['fromTime-search-chat'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d,
                            $lte: _moment(req.query['toTime-search-chat'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                        };
                    }
                    else{
                        if (_.has(req.query, 'fromTime-search-chat'))  query['created'] = {$gte: _moment(req.query['fromTime-search-chat'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d};
                        if (_.has(req.query, 'toTime-search-chat'))  query['created'] = {$lte: _moment(req.query['toTime-search-chat'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d};
                    }

                    if (_.has(req.query, 'status') && Number(req.query['status']) != -1) query['status'] = Number(req.query.status);
                    if (_.has(_tQuery, 'ids')) query.agentId = {$in: _tQuery.ids};
                    if (_.has(_tQuery, 'idCustomer')) query.customerId = {$in: _tQuery['idCustomer']};
                    if (_.has(req.query, 'content-search-chat') || (_.has(req.query, 'type-search-chat') && Number(req.query['type-search-chat']) % 2 == 0)){
                        //type = 0 hoặc 2 tương ứng với loại tin nhắn
                        //type = 1 hoặc 3 tương ứng với loại customer, query từ _ChatThread
                        var fQuery = {};
                        if (_.has(req.query, 'content-search-chat')) fQuery['$text'] = {$search: req.query['content-search-chat']};
                        if (_.has(req.query, 'type-search-chat') && Number(req.query['type-search-chat']) % 2 == 0) fQuery['status'] = Number(req.query['type-search-chat']);
                        _ChatLog.find(fQuery, function(e, r){
                            if (!e && r.length){
                                var threadIds = _.uniq(_.map(r, function(log){
                                    return log.threadId.toString();
                                }));
                                query._id = {$in: _.arrayObjectId(threadIds)};
                                var _agg = [
                                    {$unwind: '$agentId'},
                                    { $match: { $and: [query] } },
                                    {
                                        $group: {
                                            _id: '$_id',
                                            customerId: {
                                                $first: '$customerId'
                                            },
                                            updated: {
                                                $first: '$updated'
                                            },
                                            clientId: {
                                                $first: '$clientId'
                                            },
                                            chatTag: {
                                                $first: '$chatTag'
                                            },
                                            status: {
                                                $first: '$status'
                                            },
                                            created: {
                                                $first: '$created'
                                            },
                                            region: {
                                                $first: '$region'
                                            },
                                            country: {
                                                $first: '$country'
                                            }
                                        }
                                    },
                                    {$lookup: {from: 'chatlogs', localField: '_id', foreignField: 'threadId', as: 'chatlogs'}},
                                    {$sort: {updated: -1}}
                                ].concat(_.map(cfields, function (o) {
                                    return {$lookup: {from: o.modalName, localField: 'customerId', foreignField: 'entityId', as: o.modalName}};
                                }));
                                _ChatThread.aggregate(_agg, function (err, threads){
                                    _ChatThread.populate(threads, {
                                        path: "agentId chatlogs.sentFrom.id",
                                        model: _Users,
                                        populate: {
                                            path: 'chatTag',
                                            model: _ChatTag
                                        }}, next);
                                });
                            }
                            else{
                                next({code: 200, data: []});
                            }
                        });
                    }
                    else{
                        if (_.has(req.query, 'type-search-chat') && Number(req.query['type-search-chat']) % 2 != 0){
                            if (req.query['type-search-chat'] == '1'){
                                query['customerId'] = {$eq: null};
                            }
                            else if (req.query['type-search-chat'] == '3'){
                                query['customerId'] = {$ne: null};
                            }
                        }
                        var _agg = [
                            {$unwind: '$agentId'},
                            { $match: { $and: [query] } },
                            {
                                $group: {
                                    _id: '$_id',
                                    customerId: {
                                        $first: '$customerId'
                                    },
                                    updated: {
                                        $first: '$updated'
                                    },
                                    clientId: {
                                        $first: '$clientId'
                                    },
                                    chatTag: {
                                        $first: '$chatTag'
                                    },
                                    status: {
                                        $first: '$status'
                                    },
                                    created: {
                                        $first: '$created'
                                    },
                                    region: {
                                        $first: '$region'
                                    },
                                    country: {
                                        $first: '$country'
                                    }
                                }
                            },
                            {$lookup: {from: 'chatlogs', localField: '_id', foreignField: 'threadId', as: 'chatlogs'}},
                            {$sort: {updated: -1}}
                        ].concat(_.map(cfields, function (o) {
                            return {$lookup: {from: o.modalName, localField: 'customerId', foreignField: 'entityId', as: o.modalName}};
                        }));
                        _ChatThread.aggregate(_agg, function (err, threads){
                            _ChatThread.populate(threads, {
                                path: "agentId chatlogs.sentFrom.id",
                                model: _Users,
                                populate: {
                                    path: 'chatTag',
                                    model: _ChatTag
                                }}, next);
                        });
                    }
                }
            ], function(err, threads){
                res.json({code: 200, data: threads});
            });
        }
    }
    else if (_.has(req.query, 'queryCustomer')){
        var _idCustomer = null;
        _async.waterfall([
            function (callback) {
                //Kiem tra xem da co clientId nay trong db chua?
                _Customer.findById(req.query.idCustomer, callback);
            },
            function (customer, callback){
                //Get cac field customer
                _idCustomer = customer != null ? customer._id : null;
                _CustomerFields.find({status: 1}).sort({weight: 1, displayName: 1}).exec(callback);
            },
            function (cfields, callback) {
                if (_idCustomer) {
                    //Nếu đã có clientId, lấy thông tin ra
                    var _agg = [
                        {$match: {$and: [
                            {'_id': _idCustomer}
                        ]}}
                    ];
                    var aggregate = _.map(cfields, function (o) {
                        return {$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}};
                    });
                    _Customer.aggregate(_.union(_agg, aggregate), function (error, customers) {
                        callback(error, {customers: customers[0]});
                    });
                }
                else{
                    //Chưa có dữ liệu về clientId này
                    callback(null, {customers: null});
                }
            }
        ], function(err, result){
            res.json({code: err ? 500 : 200, customer: result.customers});
        });
    }
    else{
        //Lấy thông tin về kĩ năng chat của agent
        //Cần aggregate và lookup qua nhiều bảng
        _async.waterfall([
            function(callback){
                var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
                var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 4;
                _async.parallel({
                    serviceMember: function(next){
                        //Kĩ năng chat với tư cách là member
                        var agg = _Users.aggregate();
                        agg._pipeline = [
                            {$match: {_id: _.convertObjectId(req.session.user._id )}},
                            {$unwind: {path: '$agentGroupMembers', preserveNullAndEmptyArrays: true}},
                            {$lookup:{ from: 'agentgroups', localField: 'agentGroupMembers.group', foreignField: '_id', as: 'agentGroupMembers.group' }},
                            {$unwind: {path: '$agentGroupMembers.group', preserveNullAndEmptyArrays: true}},
                            {$lookup:{ from: 'groupprofilechats', localField: 'agentGroupMembers.group.idProfileChat', foreignField: '_id', as: 'agentGroupMembers.group.idProfileChat' }},
                            {$unwind: {path: '$agentGroupMembers.group.idProfileChat', preserveNullAndEmptyArrays: true}},
                            {$unwind: {path: '$agentGroupMembers.group.idProfileChat.skills', preserveNullAndEmptyArrays: true}},
                            {$lookup:{ from: 'servicechats', localField: 'agentGroupMembers.group.idProfileChat.skills.idSkill', foreignField: 'idSkill', as: 'servicechats' }},
                            {$group: {
                                '_id': '$_id',
                                'group': {$push: '$agentGroupMembers.group.idProfileChat.skills'},
                                'groupMember': {$push: '$agentGroupMembers.group._id'},
                                'agentGroupLeaders': {$first: '$agentGroupLeaders'},
                                'companyLeaders': {$first: '$companyLeaders'},
                                'ternalLeaders': {$first: '$ternalLeaders'},
                                'servicechats': {$push: '$servicechats'},
                                'displayName': {$first: '$displayName'},
                                'companyMember': {$push: '$agentGroupMembers.group.idParent'},
                                'role': {$first: '$role'}
                            }},
                            {$unwind: {path: '$companyLeaders', preserveNullAndEmptyArrays: true}},
                            {$lookup: {from: 'companychannels', localField: 'companyLeaders.company', foreignField: 'idCompany', as: 'companyLeaders.channels'}},
                            {$lookup: {from: 'agentgroups', localField: 'companyLeaders.company', foreignField: 'idParent', as: 'companyLeaders.groups'}},
                            {$group: {
                                '_id': '$_id',
                                'group': {$first: '$group'},
                                'groupMember': {$first: '$groupMember'},
                                'agentGroupLeaders': {$first: '$agentGroupLeaders'},
                                'companyLeaders': {$push: '$companyLeaders'},
                                'ternalLeaders': {$first: '$ternalLeaders'},
                                'servicechats': {$first: '$servicechats'},
                                'displayName': {$first: '$displayName'},
                                'companyMember': {$first: '$companyMember'},
                                'role': {$first: '$role'}
                            }}
                        ];
                        _Users.aggregatePaginate(agg, {page: page, limit: rows}, function (error, usr, pageCount, count) {
                            next(null, usr[0]);
                        });
                    },
                    serviceLeader: function(next){
                        //Kĩ năng chat với tư cách là leader nhóm
                        var agg2 = _Users.aggregate();
                        agg2._pipeline = [
                            {$match: {_id: _.convertObjectId(req.session.user._id)}},
                            {$unwind: {path: '$agentGroupLeaders', preserveNullAndEmptyArrays: true}},
                            {$lookup:{ from: 'agentgroups', localField: 'agentGroupLeaders.group', foreignField: '_id', as: 'agentGroupLeaders.group' }},
                            {$unwind: {path: '$agentGroupLeaders.group', preserveNullAndEmptyArrays: true}},
                            {$lookup:{ from: 'groupprofilechats', localField: 'agentGroupLeaders.group.idProfileChat', foreignField: '_id', as: 'agentGroupLeaders.group.idProfileChat' }},
                            {$unwind: {path: '$agentGroupLeaders.group.idProfileChat', preserveNullAndEmptyArrays: true}},
                            {$unwind: {path: '$agentGroupLeaders.group.idProfileChat.skills', preserveNullAndEmptyArrays: true}},
                            {$lookup:{ from: 'servicechats', localField: 'agentGroupLeaders.group.idProfileChat.skills.idSkill', foreignField: 'idSkill', as: 'servicechats' }},
                            {$group: {
                                '_id': '$_id',
                                'group': {$push: '$agentGroupLeaders.group.idProfileChat.skills'},
                                'groupMember': {$push: '$agentGroupLeaders.group._id'},
                                'servicechats': {$push: '$servicechats'},
                                'companyMember': {$push: '$agentGroupLeaders.group.idParent'}
                            }}
                        ];
                        _Users.aggregatePaginate(agg2, {page: page, limit: rows}, function (error, usr, pageCount, count) {
                            next(null, usr[0]);
                        });
                    },
                    countPerformance: function(next){
                        //Đếm performance của agent, phục vụ cho route chat bằng performance
                        var agg3 = _ChatThread.aggregate();
                        var query = {};
                        query['agentId'] = _.convertObjectId( req.session.user._id);
                        query['created'] = {
                            $gte: _moment(Date.now()).subtract(30, 'days')._d,
                            $lte: _moment(Date.now())._d
                        };
                        agg3._pipeline = [
                            {$unwind: {path: '$agentId', preserveNullAndEmptyArrays: true}},
                            {$match: query}
                        ];
                        _ChatThread.aggregatePaginate(agg3, {page: page, limit: rows}, function (error, threads, pageCount, count) {
                            next(null, threads.length);
                        });
                    }
                }, function(e, r){
                    var user = r.serviceMember;
                    user.performance = r.countPerformance;
                    user.servicechats = _.flatten(_.union(user.servicechats, r.serviceLeader.servicechats));
                    user.group = _.union(user.group, r.serviceLeader.group);
                    user.companyMember = _.union(user.companyMember, r.serviceLeader.companyMember);
                    user.groupMember = _.union(user.groupMember, r.serviceLeader.groupMember);
                    user.companyLeaders = _.filter(user.companyLeaders, function(c){
                        return (c.channels.length > 0);
                    });
                    _async.forEachOfSeries(user.servicechats, function(s, index, cb){
                        s.groupId = user.groupMember[index];
                        cb();
                    }, function(err, resp){
                        callback(null, user);
                    });
                });

            },
            function(user, callback){
                _Company.aggregate([
                    {$lookup: {from: 'companychannels', localField: '_id', foreignField: 'idCompany', as: 'channels'}},
                    {$unwind: {path: '$channels', preserveNullAndEmptyArrays: false}},
                    {$lookup: {from: 'skillchats', localField: '_id', foreignField: 'idCompany', as: 'channels.skills'}},
                    {
                        $match: {
                            '_id': {
                                $in: user.companyMember
                            }
                        }
                    },
                    {$group: {
                        '_id': '$_id',
                        'channels': {
                            '$push': '$channels'
                        }
                    }}
                ], function (error, company) {
                    callback(error, {user: user, company: company});
                });
            }
        ], function(err, resp){
            if (err) return res.json({code: 500});
            var services = [];
            _.each(resp.user.servicechats, function(obj){
                //truong order va routechat phuc vu viec routing
                services.push({_id: obj._id, routeChat: obj.routeChat, lowAlert: obj.lowAlert, highAlert: obj.highAlert, SLA: obj.SLA, groupId: obj.groupId, order: _.find(resp.user.group, function (o) {
                    return _.isEqual(o.idSkill, obj.idSkill); //tim groupprofilechat co skill match voi skill service
                }).order});
            });
            res.json({code: 200, data: {_id: resp.user._id, company: resp.company, services: _.union(services), maxChatSession: req.session.user.maxChatSession, agentGroupLeaders: resp.user.agentGroupLeaders, companyLeaders: resp.user.companyLeaders, ternalLeaders: resp.user.ternalLeaders, displayName: resp.user.displayName, role: resp.user.role}});
        });
    }

};

//// GET : http://domain.com/chat-client/:_id
//exports.show = function (req, res) {
//    _Company.aggregate([
//        {$lookup: {from: 'companychannels', localField: '_id', foreignField: 'idCompany', as: 'channels'}},
//        {$unwind: {path: '$channels', preserveNullAndEmptyArrays: false}},
//        {$match: {'channels._id': new mongodb.ObjectId(req.params.chatclient)}},
//        {$project: {'name': 1, 'channels': 1}}
//    ], function (error, company) {
//        if (error) return res.json({code: 500});
//        res.json({code: company.length ? 200 : 404, data: company.length ? company[0] : {}});
//    });
//};

//POST
exports.create = function (req, res) {
    if (_.has(req.body, 'field_clientid')){
        //Tạo mới hoặc chỉnh sửa customer nếu đã có thông tin trong db
        var _clientId = null;
        _async.waterfall([
            function (callback) {
                //Kiem tra xem da co clientId nay trong db chua?
                mongoose.model('field_clientid').findOne({'value': req.body['field_clientid']}).exec(callback);
            },
            function (clientId, callback){
                //Get cac field customer
                _clientId = clientId;
                _CustomerFields.find({status: 1}).sort({weight: 1, displayName: 1}).exec(callback);
            },
            function (cfields, callback) {
                var _body = _.chain(req.body).cleanRequest().toLower().value();
                if (_clientId){
                    //Nếu đã có clientId, ghi đè thông tin mới vào
                    _async.each(_.keys(_body), function (k, cb) {
                        if (_.isNull(_body[k]) || _.isEmpty(_body[k]) || _.isUndefined(_body[k])) {
                            cb(null, null);
                        } else {
                            switch (_CCKFields[k].type) {
                                case 5:
                                    _body[k] = _.compact(_body[k]);
                                    break;
                                case 6:
                                    _body[k] = _moment(_body[k], 'DD/MM/YYYY')._d;
                                    break;
                                default:
                                    break;
                            }
                            _CCKFields[k].db.update({entityId: _clientId.entityId}, {$set: {value: _body[k]}}, {
                                upsert: true,
                                new: true
                            }, cb);
                        }
                    }, function(resp){
                        var _agg = [{$match: {$and: [{'_id': _clientId.entityId}]}}];
                        var aggregate = _.map(cfields, function (o) {
                            return {$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}};
                        });
                        _Customer.aggregate(_.union(_agg, aggregate), function (error, customers){
                            callback(error, customers[0]);
                        });
                    });
                }
                else{
                    //Nếu chưa có -> tạo mới
                    _async.waterfall([
                        function (callback) {
                            _CCKFields['field_so_dien_thoai'].db.count({value: _body.field_so_dien_thoai}, function (err, result) {
                                if (err) return callback(err, result);
                                if (result !== 0){
                                    //Đã tồn tại số điện thoại này -> bổ sung clientId cho khách hàng cũ này
                                    _async.each(_.keys(_body), function (k, cb) {
                                        if (_.isNull(_body[k]) || _.isEmpty(_body[k]) || _.isUndefined(_body[k])) {
                                            callback();
                                        } else {
                                            switch (_CCKFields[k].type) {
                                                case 6:
                                                    _body[k] = _moment(_body[k], 'DD/MM/YYYY')._d;
                                                    break;
                                                default:
                                                    break;
                                            }
                                            _CCKFields[k].db.update({entityId: result.entityId}, {$set: {value: _body[k]}}, {
                                                upsert: true,
                                                new: true
                                            }, cb);
                                        }
                                    }, function(e, r){
                                        var _agg = [{$match: {$and: [{'_id': result.entityId}]}}];
                                        var aggregate = _.map(cfields, function (o) {
                                            return {$lookup: {from: o.modalName, localField: '_id', foreignField: 'entityId', as: o.modalName}};
                                        });
                                        _Customer.aggregate(_.union(_agg, aggregate), function (error, customers){
                                            callback('-- tra ve ngay customer --', customers[0]);
                                        });
                                    });
                                }
                                else{
                                    callback();
                                }
                            });
                        },
                        function (callback) {
                            _Customer.create(_body, callback);
                        },
                        function (c, callback) {
                            _async.each(_.keys(_body), function (k, cb) {
                                if (_.isNull(_body[k]) || _.isEmpty(_body[k]) || _.isUndefined(_body[k])) return cb(null, null);
                                switch (_CCKFields[k].type) {
                                    case 4:
                                    case 5:
                                        _body[k] = _.compact(_body[k]);
                                        break;
                                    case 6:
                                        _body[k] = _moment(_body[k], 'DD/MM/YYYY')._d;
                                        break;
                                    default:
                                        break;
                                }
                                _CCKFields[k].db.create({entityId: c._id, value: _body[k]}, cb);
                            }, callback);
                        }
                    ], function (error, result) {
                        callback(error, result);
                    });
                }
            }
        ], function (error, result) {
            res.json({code: 200, message: 'Chỉnh sửa thông tin thành công!', customer: result});
        });
    }
    else if (_.has(req.body, 'createNote')){
        //Tạo ghi chú mới
        _ChatNote.create({agentId: req.body.agentId, clientId: req.body.clientId, content: req.body.content}, function(err, resp){
            if (!err) res.json(resp);
        });
    }
    else if (_.has(req.body, 'createLog')){
        //Tạo log chat mới
        var body = {threadId: _.convertObjectId(req.body.threadId), content: req.body.msg};
        body['sentFrom'] = {from: parseInt(req.body.from)};
        if (_.has(req.body, 'sentFrom')) body['sentFrom']['id'] = _.convertObjectId(req.body.sentFrom);
        if (_.has(req.body, 'url-attachment') && _.has(req.body, 'fileName')) body['attachment'] = [{url: req.body['url-attachment'], fileName: req.body['fileName'] }];
        _ChatLog.create(body, function (error, newLog) {
            _.genTree();
            res.json({code: error ? 500 : 200});
        });
    }
    else if (_.has(req.body, 'toEmail')){
        //Xuất lịch sủ chat và gửi qua email
        _async.waterfall([
            function(cb) {
                if (_.has(req.body, 'fromDate') && req.body['fromDate'] == '') delete req.body.fromDate;
                if (_.has(req.body, 'toDate') && req.body['toDate'] == '') delete req.body.toDate;
                var query = {};
                if (_.has(req.body, 'fromDate') && _.has(req.body, 'toDate')) {
                    query['created'] = {
                        $gte: _moment(req.body['fromDate'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d,
                        $lte: _moment(req.body['toDate'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                    };
                }
                else {
                    if (_.has(req.body, 'fromDate'))  query['created'] = {$gte: _moment(req.body['fromDate'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d};
                    if (_.has(req.body, 'toDate'))  query['created'] = {$lte: _moment(req.body['toDate'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d};
                }

                _async.parallel({
                    findIdsAgent: function (next) {
                        if (_.has(req.query, 'searchType') && _.isEqual(req.query['searchType'], '1')){
                            //agent search
                            next(null, {ids: [_.convertObjectId(req.query['userId'])]});
                        }
                        else{
                            //super visor search
                            _async.waterfall([
                                function (cb) {
                                    _Users.findById(req.query.userId, cb);
                                }
                            ], function (err, usr) {
                                var _tQuery = {};
                                if (usr.ternalLeaders.length > 0) {
                                    _Users.find().exec(function (err, resp) {
                                        _tQuery['ids'] = _.pluck(resp, '_id');
                                        next(null, _tQuery);
                                    });
                                }
                                else {
                                    var companyIds = _.map(usr.companyLeaders, function (company) {
                                        return company.company;
                                    });

                                    var groupIds = _.map(usr.agentGroupLeaders.concat(usr.agentGroupMembers), function (group) {
                                        return group.group;
                                    });
                                    var agg = [
                                        { $unwind: { path: '$agentGroupMembers', preserveNullAndEmptyArrays: true } },
                                        { $unwind: { path: '$agentGroupLeaders', preserveNullAndEmptyArrays: true } },
                                        { $lookup: { from: 'agentgroups', localField: 'agentGroupMembers.group', foreignField: '_id', as: 'groupMembers' } },
                                        { $lookup: { from: 'agentgroups', localField: 'agentGroupLeaders.group', foreignField: '_id', as: 'groupLeaders' } },
                                        {
                                            $match:
                                            {
                                                $or:
                                                    [
                                                        { _id: _.convertObjectId(req.query.userId) },
                                                        { 'agentGroupMembers.group': { $in: groupIds } },
                                                        { 'agentGroupLeaders.group': { $in: groupIds } },
                                                        { 'groupMembers.idParent': { $in: companyIds } },
                                                        { 'groupLeaders.idParent': { $in: companyIds } }
                                                    ]
                                            }
                                        },
                                        { $group: { _id: '$_id', displayName: { $first: '$displayName' } } }
                                    ];

                                    _Users.aggregate(agg, function (e, r) {
                                        //_tQuery['ids'] = _.map(r, function (user) {
                                        //    return user._id;
                                        //});
                                        _tQuery['ids'] = _.pluck(r, '_id');
                                        next(null, _tQuery);
                                    });
                                }
                            });
                        }

                    },
                    findCCKFields: function (next) {
                        _async.waterfall([
                            function (next) {
                                _CustomerFields.find({ status: 1 }, next);
                            },
                            function (cfields, next) {
                                var _agg = _.map(cfields, function (o) {
                                    return { $lookup: { from: o.modalName, localField: 'customerId', foreignField: 'entityId', as: o.modalName } };
                                });
                                next(null, { agg: _agg, fields: cfields });
                            }
                        ], function (e, r) {
                            next(null, r);
                        });
                    }
                }, function (err, resp) {
                    query['agentId'] = { $in: resp.findIdsAgent.ids };
                    var agg = [
                        { $match: { $and: [query] } },
                        { $lookup: { from: 'chatlogs', localField: '_id', foreignField: 'threadId', as: 'chatlogs' } }
                    ].concat(resp.findCCKFields.agg);
                    var group = { _id : "$clientId", threadIds: { $push: '$_id' }, chatlogs: { $push: '$chatlogs' }};
                    _.each(resp.findCCKFields.fields, function (o) {
                        group[o.modalName] = { $first: '$' + o.modalName };
                    });
                    agg.push({ $group: group });

                    _ChatThread.aggregate(agg, function (err, threads) {
                        _ChatThread.populate(threads, {
                            path: "chatlogs.sentFrom.id",
                            model: _Users
                        }, cb);
                    });
                });
            }
        ], function(err, resp){
            var header = [{name: 'Thời gian', key: 'created'}, {name: 'Mã khách hàng', key: 'clientId'}, {name: 'Agent', key: 'agent'}, {name: 'Tin nhắn', key: 'msg'}];
            var result = [];
            var info = _.pick(resp[0], function(value, key, object){
                return key.indexOf('field_') >=0;
            });
            _async.each(resp, function(client, next){
                var r = [];
                _.each(client.chatlogs, function(thread){
                    _.each(thread, function(log){
                        if (log.attachment.length == 0) {
                            r.push({ created: _moment(log.created).format('DD/MM/YYYY HH:mm:ss'), clientId: client._id.split('-')[3], agent: (log.sentFrom.id != null ? log.sentFrom.id.displayName : ''), msg: _.stripTags(log.content) });
                        }
                        else {
                            r.push({ created: _moment(log.created).format('DD/MM/YYYY HH:mm:ss'), clientId: client._id.split('-')[3], agent: (log.sentFrom.id != null ? log.sentFrom.id.displayName : ''), msg: _config.app.ip + ':' + _config['core-app'].port + log.attachment[0].url });
                        }
                    });
                });
                result.push({sheet: client._id.split('-')[3], data: r});
                next();
            }, function(r){
                createExcel('export-history-' + Date.now() + '.xls', result, header, info, req.body.toEmail);
                res.json({code: err ? 500 : 200});
            });
        });
    }
}

//PUT
exports.update = function (req, res) {
    if (_.has(req.body, 'typeUpdate')){
        if (_.isEqual(req.body['typeUpdate'], '0')){
            //Bổ sung id của agent hỗ trợ vào db cuộc chat
            _ChatThread.findOne({_id: _.convertObjectId(req.params.chatclient)}, function(err, thread){
                if (thread != null){
                    var agentIds = thread.agentId;
                    var agentMessage = thread.agentMessage;
                    //Kiểm tra xem đã có agentId trong list agent hỗ trợ chưa
                    //Nếu chưa thì bổ sung và cập nhật
                    var result = _.find(agentIds, function(aid){
                        return _.isEqual(aid.toString(), req.body.agentId);
                    });
                    if (agentIds.length == 0 || _.isUndefined(result)){
                        agentIds.push(_.convertObjectId(req.body.agentId));
                        agentMessage.push({id: _.convertObjectId(req.body.agentId), send: 0, receive: 0, response: 0});
                        _ChatThread.findOneAndUpdate({_id: _.convertObjectId(req.params.chatclient)}, {$set: {agentId: agentIds, agentMessage: agentMessage}}, function(err){
                            res.json({code: err ? err : 200});
                        });
                    }
                    else{
                        res.json({code: 200});
                    }
                }
                else{
                    res.json({code: 500});
                }
            });
        }
        else if (_.isEqual(req.body['typeUpdate'], '1')){
            //Cập nhật đã trả lời các tin nhắn
            _ChatLog.findOneAndUpdate({threadId: _.convertObjectId(req.params.chatclient), status: 0}, {$set: {status: 1}}, {new: true, multi: true}, function(err, resp){
                res.json({code: err ? 404 : 200});
            });
        }
        else if (_.isEqual(req.body['typeUpdate'], '2')){
            //Agent close cuộc chat
            _ChatThread.findById(_.convertObjectId(req.params.chatclient), function(err, resp){
                if (!err && resp != null){
                    var agentMessage = resp.agentMessage;
                    var aid = _.find(agentMessage, function(agent){
                        return _.isEqual(agent.id.toString(), req.body.agentId);
                    });
                    if (!_.isUndefined(aid)){
                        aid.send += parseInt(req.body['send']);
                        aid.receive += parseInt(req.body['receive']);
                        if (_.isEqual(aid.response, 0)){
                            aid.response = parseInt(req.body['response']);
                        }
                    }
                    else{
                        agentMessage.push({id: _.convertObjectId(req.body.agentId), send: parseInt(req.body['send']), receive: parseInt(req.body['receive']), response: parseInt(req.body['response'])});
                    }
                    _ChatThread.findOneAndUpdate({_id: _.convertObjectId(req.params.chatclient)}, {$set: {status: 0, agentMessage: agentMessage, updated: Date.now()}}, {new: true}, function(err, resp){
                        //Close thread cũ và tạo thread mới
                        var amess = {id: _.convertObjectId(req.body.agentId), send: 0, receive: 0, response: 0};
                        var data = { clientId: req.body.clientId, region: req.body.region, country: req.body.country, channelId: resp.channelId, agentMessage: [amess], agentId: [_.convertObjectId(req.body.agentId)] };
                        if (_.has(req.body, 'customerId')) data['customerId'] = _.convertObjectId(req.body.customerId);
                        _ChatThread.create(data, function (error, newThread) {
                            _.genTree();
                            if (!error){
                                var dataSend = {clientId: req.body.clientId, threadId: newThread._id};
                                if (_.has(req.body, 'outSLA')){
                                    dataSend['outSLA'] = req.body['outSLA'];
                                }
                                crmPublish.publishData('CloseThreadChat', dataSend);
                            }
                            res.json({code: err ? 500 : 200, newThread: newThread._id});
                        });
                    });
                }
                else{
                    res.json({code: 404});
                }
            });
        }
        else if (_.isEqual(req.body['typeUpdate'], '3')){
            //Bô sung id của khách hàng cũ vào db cuộc chat
            _ChatThread.findOneAndUpdate({clientId: req.body.clientId}, {$set: {customerId: _.convertObjectId(req.body.customerId), updated: Date.now()}}, {new: true}, function(err, resp){
                _.genTree();
                res.json({code: err ? 200 : 500});
            });
        }
        else if (_.isEqual(req.body['typeUpdate'], '4')){
            //Cuộc chat kết thúc tự động, cập nhật thông tin vào db
            _ChatThread.findById(_.convertObjectId(req.params.chatclient), function(err, resp) {
                if (!err && resp != null) {
                    var agentMessage = resp.agentMessage;
                    var aid = _.find(agentMessage, function (agent) {
                        return _.isEqual(agent.id.toString(), req.body.agentId);
                    });
                    if (!_.isUndefined(aid)) {
                        aid.send += parseInt(req.body['send']);
                        aid.receive += parseInt(req.body['receive']);
                        if (_.isEqual(aid.response, 0)) {
                            aid.response = parseInt(req.body['response']);
                        }
                    }
                    else {
                        agentMessage.push({
                            id: _.convertObjectId(req.body.agentId),
                            send: parseInt(req.body['send']),
                            receive: parseInt(req.body['receive']),
                            response: parseInt(req.body['response'])
                        });
                    }

                    //Cap nhat close thread va automatic end chat
                    _ChatThread.findOneAndUpdate({_id: _.convertObjectId(req.params.chatclient)}, {$set: {status: 0, agentMessage: agentMessage, updated: Date.now()}}, {new: true}, function(err, resp){
                        _.genTree();
                        if (!err){
                            _ChatLog.create({threadId: req.params.chatclient, content: 'Cuộc chat đã kết thúc tự động', sentFrom: {from: 2}, status: 1}, function (error, newLog) {
                                _.genTree();
                            });
                        }
                    });
                }
            });
        }
        else{
            res.json({code: 200});
        }
    }
};

/**
 * Hàm đổi vị trí 2 phần từ trong mạng
 * @param x
 * @param y
 * @returns {Array}
 */
Array.prototype.swap = function (x,y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
};

/**
 * Helper tạo và xuất file excel
 * @param fileName - tên file
 * @param result - dữ liệu tạo file
 * @param header - header các cộc excel
 * @param info - info khách hàng
 * @param emails - email gửi tới
 */
var createExcel = function(fileName, result, header, info, emails){
    //Helper tạo file excel lịch sử chat và gửi tới email chỉ định
    var options = {
        filename: path.join(_rootPath, 'assets', 'export', fileName),
        useStyles: true, // Default
        useSharedStrings: true,
        dateFormat: 'DD/MM/YYYY HH:mm:ss'
    };
    var workbook = new _Excel.Workbook();
    _async.each(result, function(arrayObj, cb){
        var sheet = workbook.addWorksheet(arrayObj.sheet);
        var worksheet = workbook.getWorksheet(arrayObj.sheet);
        var _cl = [];
        _async.waterfall([
            function(callback1){
                //Tạo column
                _async.each(header, function(field, next){
                    var _style = {
                        alignment: {vertical: "middle", horizontal: "center"}, font: {size: 14, bold: false}, border: {
                            top: {style: "thin", color: {argb: "000000"}},
                            left: {style: "thin", color: {argb: "000000"}},
                            bottom: {style: "thin", color: {argb: "000000"}},
                            right: {style: "thin", color: {argb: "000000"}}
                        }
                    };
                    _cl.push({header: field.name, style: _style, key: field.key, width: field.key != 'msg' ? 50 : 120});
                    next();
                }, function (err) {
                    if (!err) worksheet.columns = _cl;
                    callback1();
                });
            },
            function(callback2){
                //Tạo các bản ghi
                _async.each(arrayObj.data, function(obj, cb) {
                    var row = {};
                    _async.each(header, function(field, next){
                        row[field.key] = obj[field.key];
                        next();
                    }, function(error){
                        if (!error){
                            worksheet.addRow(row);
                        };
                        cb();
                    });
                }, function (err) {
                    callback2();
                });
            }
        ], function(err, resp){
            worksheet.getRow(1).font = {
                name: 'Arial',
                family: 4,
                size: 16,
                bold: true
            };
            cb();
        });
    }, function(resp){
        if (result.length == 0){
            //tạo 1 worksheet trắng trong trường hợp ko có bản ghi nào
            workbook.addWorksheet('worksheet');
        }
        workbook.xlsx.writeFile(options.filename).then(function () {
            //res.download(options.filename);
            var transporter = nodemailer.createTransport('smtps://mobiledev6763@gmail.com:makelove05@smtp.gmail.com');
            var mailOptions = {
                from: "mobiledev6763@gmail.com", // sender address
                to: emails, // list of receivers
                subject: "File lịch sử chat", // subject
                text: "Mời xem file đính kèm", // body
                attachments: [
                    {
                        filename: fileName,
                        path: path.join(_rootPath , 'assets', 'export', fileName) // stream this file
                    }
                ],
                auth: {
                    user: "mobiledev6763@gmail.com",
                    pass: "makelove05"
                }
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });

        });
    });

};