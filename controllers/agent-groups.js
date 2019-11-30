/**
 * Created by NghiaTM on 1/18/2016.
 */

// GET
exports.index = {
    json: function (req, res) {
        // Không dùng
        var code = parseInt(req.query.code);
        delete req.query.code;

        switch (code){
            case 1:
                _GroupsProfile.find(_.cleanRequest(req.query)).exec(function (error, profile) {
                    res.status(200).json(profile);
                });
                break;
            case 2:
                _GroupsProfileChat.find(_.cleanRequest(req.query)).exec(function (error, profile) {
                    res.status(200).json(profile);
                });
                break;
            default:
                _GroupsProfileMail.find(_.cleanRequest(req.query)).exec(function (error, profile) {
                    res.status(200).json(profile);
                });
                break;
        }
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = _.cleanRequest(req.body);

        var sortQuery= {};
        if(!_.isUndefined(req.query['sortField']))
            sortQuery[req.query['sortField']]= _.isEqual(req.query['sortValue'],'asc')?1:-1

        var companies;

        _async.parallel({
            // Query Công Ty để filter
            companies: function(next) {
                var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {_id: req.session.auth.company._id}) : {};
                _Company.find(_query, next);
            }
        }, function(err, result){
            companies = result.companies;

            var _query2 = req.session.auth.company ? (req.session.auth.company.group ? (req.session.auth.company.group.leader ? {_id: new mongodb.ObjectId(req.session.auth.company.group._id)} : {status: 9999}) : {idParent: new mongodb.ObjectId(req.session.auth.company._id)}) : {};
            var agg= _AgentGroups.aggregate([
                {$match:{$and:[query, _query2]}},

                {$lookup:{ from: 'users', localField: '_id', foreignField: 'agentGroupLeaders.group', as: 'leaders' }},
                {$lookup:{ from: 'users', localField: '_id', foreignField: 'agentGroupMembers.group', as: 'members' }},
                {$lookup:{ from: 'companies', localField: 'idParent', foreignField: '_id', as: 'parent' }},
                {$lookup:{ from: 'groupprofiles', localField: 'idProfile', foreignField: '_id', as: 'profile' }},
                {$lookup:{ from: 'groupprofilechats', localField: 'idProfileChat', foreignField: '_id', as: 'profileChat' }},
                {$lookup:{ from: 'groupprofilemails', localField: 'idProfileMail', foreignField: '_id', as: 'profileMail' }},
                {$lookup:{ from: 'users', localField: 'updateBy', foreignField: '_id', as: 'updateBy' }}
            ]);
            if(!_.isEmpty(sortQuery)){
                agg.append({$sort: sortQuery});
            }
            // Query danh sách Group Agent
            _AgentGroups.aggregatePaginate(agg, {page: page, limit: rows}, function (error, agentgroups, pageCount, count) {
                var paginator = new pagination.SearchPaginator({prelink: '/agent-groups', current: page, rowsPerPage: rows, totalResult: count});
                _.render(req, res, 'agent-groups', {
                    title: 'Danh sách nhóm agent',
                    plugins: [['bootstrap-select'], ['mrblack-table']],
                    sortData:sortQuery,
                    companies:companies,
                    groups: agentgroups,
                    paging: paginator.getPaginationData()
                }, true, error);
            });
        });
    }
};

// New
exports.new = function (req, res) {
    var companies = [];
    var leaders = [];
    var agents = [];
    var groupProfileCall = [];
    var groupProfileChat = [];
    var groupProfileMail = [];
    var agentStatus = [];
    _async.parallel({
        // Query dnah sách công ty
        company: function(cb){
            var aggregate = [];
            var _query = req.session.auth.company ? {_id: new mongodb.ObjectId(req.session.auth.company._id)} : {};
            aggregate.push({$match: {$and:[_query, {status: 1}]}});
            aggregate.push({$lookup: {from: 'groupprofiles', localField: '_id', foreignField: 'idCompany', as: 'groupprofiles'}});

            _Company.aggregate(aggregate, function (err, cps){
                companies = cps;
                cb();
            });
        },
        // Query danh sách teamload
        leader: function(cb){
            _Users.find({role: {$gt: 1}}, function (err1, l) {
                leaders = l;
                cb();
            });
        },
        // Query danh sách agent
        agent: function(cb){
            _Users.find({role: {$gt: 1}}, function (err1, a) {
                agents = a;
                cb();
            });
        },
        // Query group profile
        profileCall: function(cb){
            var _query = req.session.auth.company ? (req.session.auth.company.group ? {status: 9999} : {idCompany: req.session.auth.company._id}) : {};
            _GroupsProfile.find({$and:[{status: 1}, _query]}, function (err3, g) {
                groupProfileCall = g;
                cb();
            });
        },
        // Query chat profile
        profileChat: function(cb){
            _GroupsProfileChat.find({status: 1}, function (err3, g) {
                groupProfileChat = g;
                cb();
            });
        },
        // Query mail profile
        profileMail: function(cb){
            _GroupsProfileMail.find({status: 1}, function (err3, g) {
                groupProfileMail = g;
                cb();
            });
        }
    }, function(err, resp){
        _.render(req, res, 'agent-groups-new', {
            title: 'Tạo mới nhóm agent',
            companies: _.chain(companies)
                .map(function(com){
                    com.groupprofiles = _.chain(com.groupprofiles)
                        .filter(function(profile){
                            return profile.status == 1;
                        })
                        .value();
                    return com;
                })
                .value(),
            leaders: leaders,
            agents: agents,
            groupsProfile: groupProfileCall,
            groupsProfileChat: groupProfileChat,
            groupsProfileMail: groupProfileMail,
            plugins: [['bootstrap-duallistbox'], ['bootstrap-select']]
        }, true);
    });
};

// Edit
exports.edit = function (req, res) {
    _async.parallel([
        // Query group muốn edit
        function(callback){
            _AgentGroups.findById(req.params['agentgroup'], callback);
        },
        // Query công ty
        function(callback){
            var aggregate = [];
            var _query = req.session.auth.company ? {_id: new mongodb.ObjectId(req.session.auth.company._id)} : {};
            aggregate.push({$match: {$and:[_query, {status: 1}]}});
            aggregate.push({$lookup: {from: 'groupprofiles', localField: '_id', foreignField: 'idCompany', as: 'groupprofiles'}});

            _Company.aggregate(aggregate, callback);
        },
        // Query leader
        function(callback){
            _Users.find({role: {$gt: 1}}, callback);
        },
        // Query agent
        function(callback){
            _Users.find({role: {$gt: 1}}, callback);
        },
        // Query group profile
        function(callback){
            _GroupsProfile.find({status: 1}, callback);
        },
        // Query group profile chat
        function(callback){
            _GroupsProfileChat.find({status: 1}, callback);
        },
        // Query group profile mail
        function(callback){
            _GroupsProfileMail.find({status: 1}, callback);
        },
        // Query danh sách agent No ACD
        function(callback){
            _AgentGroupDisable.find({idGroup: req.params['agentgroup']}, callback);
        }

    ], function(error, result){
        _.render(req, res, 'agent-groups-edit', {
            title: 'Sửa nhóm agent',
            org: result[0],
            companies: _.chain(result[1])
                .map(function(com){
                    com.groupprofiles = _.chain(com.groupprofiles)
                        .filter(function(profile){
                            return profile.status == 1;
                        })
                        .value();
                    return com;
                })
                .value(),
            leaders: result[2],
            agents: result[3],
            groupsProfile: result[4],
            groupsProfileChat: result[5],
            groupsProfileMail: result[6],
            agentDisable: _.pluck(result[7], 'idAgent'),
            plugins: [['bootstrap-duallistbox'], ['bootstrap-select']]
        }, true);
    });

};

// POST
exports.create = function (req, res) {
    var query = {};
    query.name = req.body.name;
    query.leaders = req.body.leaders;
    query.members = req.body.members;
    if(req.body.idParent.length>0)
        query.idParent = req.body.idParent;
    //query.level = 2;
    if(!_.isEmpty(req.body.idProfile)) query.idProfile =  req.body.idProfile;
    if(!_.isEmpty(req.body.idProfileChat)) query.idProfileChat = req.body.idProfileChat;
    if(!_.isEmpty(req.body.idProfileMail)) query.idProfileMail = req.body.idProfileMail;
    query.status = req.body.status;
    query.createBy = req.session.user._id;
    query.updateBy = req.session.user._id;
    query.updated = new Date();

    _AgentGroups.createNew(query, function (error, group) {
        //if(!error) manager.addGroup();
        res.json({code: (error ? 500 : 200), message: error ? error : ''});
    });
};

// PUT
exports.update = function (req, res) {
    var query = {};
    query._id= req.params['agentgroup'];
    query.name = req.body.name;
    query.leaders = req.body.leaders;
    query.members = req.body.members;
    if(req.body.idParent.length > 0)
        query.idParent = req.body.idParent;
    else{
        query.idParent=null;
    }
    //query.level = 2;
    query.idProfile = _.isEmpty(req.body.idProfile) ? null : req.body.idProfile;
    query.idProfileChat = _.isEmpty(req.body.idProfileChat) ? null : req.body.idProfileChat;
    query.idProfileMail = _.isEmpty(req.body.idProfileMail) ? null : req.body.idProfileMail;
    query.status = req.body.status;
    if(_.isEqual(req.body.status, '')){
        query.status=1;
    }
    query.updateBy = req.session.user._id;
    query.updated = new Date();

    _async.waterfall([
        function(next){
            // Clear danh sách agent No ACD
            _AgentGroupDisable.remove({idGroup: req.params['agentgroup']}, next);
        },
        function(obj, next){
            if(!req.body.disableAgents || req.body.disableAgents.length == 0){
                next(null, null);
            }else{
                // Cập nhật lại danh sách agent no ACD
                var batch = mongoClient.collection('agentgroupdisables').initializeUnorderedBulkOp({useLegacyOps: true});
                _.each(req.body.disableAgents, function(el, i){
                    var item = new _AgentGroupDisable({
                        idAgent : el,
                        idGroup: req.params['agentgroup']
                    });
                    batch.insert(item.toObject());
                });
                batch.execute(next);
            }
        },
        function(obj, next){
            _AgentGroups.updateGroups(query, next)
        }
    ], function(err){
        res.json({code: (err ? 500 : 200), message: err ? err : ''});
    });
};

// Validation Engine
exports.validate = function (req, res) {
    var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'type', 'cName']);
    if(req.query.type == 'update'){
        if(req.query.name == req.query.cName){
            res.json([req.query.fieldId, true])
        }else{
            _AgentGroups.findOne(_query).exec(function (error, ca) {
                res.json([req.query.fieldId, _.isNull(ca)]);
            });
        }
    }else if(req.query.type== 'new'){
        _AgentGroups.findOne(_query).exec(function (error, ca) {
            res.json([req.query.fieldId, _.isNull(ca)]);
        });
    }

};

// DELETE
exports.destroy = function (req, res) {
    var ids=[];
    if (!_.isEqual(req.params.agentgroup, 'all')) {
        //_AgentGroups.findByIdAndRemove(req.params['agentgroup'], function (error) {
        //    res.json({code: (error ? 500 : 200), message: error ? error : ""});
        //});
        ids.push(req.params['agentgroup']);
        _AgentGroups.deleteGroups(ids, function(error){
            res.json({code: (error ? 500 : 200), message: error ? error : ""});
        })
    } else {
        var query={$and:[{_id:{$in: req.body.ids.split(',')}},{level:2}]};

        ids= req.body.ids.split(',');
        _AgentGroups.deleteGroups(ids, function(error){
            res.json({code: (error ? 500 : 200), message: error ? error : ""});
        })
    }
};

// SEARCH
exports.search = {
    json: function (req, res) {
        var name = req.query.name;

        _AgentGroups
            .find({$regex: new RegExp(_.stringRegex(query.name))}, function (error, result) {
                res.json({code: (error ? 500 : 200), message: error ? error : result});
            });
    },
    html: function (req, res) {
        var name = req.query.keyword;
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var query = _.cleanRequest(req.query,['sortField', 'sortValue']);
        if(query.name)
            query.name = {$regex: new RegExp(_.stringRegex(query.name)), $options: '-i'};
        if(query.idParent)
            query.idParent= new mongoose.Types.ObjectId(query.idParent);

        var sortQuery= {};
        if(!_.isUndefined(req.query['sortField']))
            sortQuery[req.query['sortField']]= _.isEqual(req.query['sortValue'],'asc')?1:-1;
        var companies;
        _Company.find({status: 1}, function (err, cps) {
            companies = cps;

            var agg= _AgentGroups.aggregate([
                {$match:query},

                {$lookup:{ from: 'users', localField: '_id', foreignField: 'agentGroupLeaders.group', as: 'leaders' }},
                {$lookup:{ from: 'users', localField: '_id', foreignField: 'agentGroupMembers.group', as: 'members' }},
                {$lookup:{ from: 'companies', localField: 'idParent', foreignField: '_id', as: 'parent' }},
                {$lookup:{ from: 'groupprofiles', localField: 'idProfile', foreignField: '_id', as: 'profile' }},
                {$lookup:{ from: 'groupprofilechats', localField: 'idProfileChat', foreignField: '_id', as: 'profileChat' }},
                {$lookup:{ from: 'groupprofilemails', localField: 'idProfileMail', foreignField: '_id', as: 'profileMail' }},
                {$lookup:{ from: 'users', localField: 'updateBy', foreignField: '_id', as: 'updateBy' }},
                {$lookup:{ from: 'agentstatuses', localField: 'agentStatus', foreignField: '_id', as: 'agentStatus' }}
            ]);
            if(!_.isEmpty(sortQuery)){
                agg.append({$sort: sortQuery});
            }
            _AgentGroups.aggregatePaginate(agg, {page: page, limit: rows}, function (error, agentgroups, pageCount, count) {
                var paginator = new pagination.SearchPaginator({prelink: '/agent-groups', current: page, rowsPerPage: rows, totalResult: count});

                _.render(req, res, 'agent-groups', {
                    title: 'Danh sách nhóm agent',
                    plugins: [['bootstrap-select']],
                    sortData:sortQuery,
                    companies:companies,
                    groups: agentgroups,
                    paging: paginator.getPaginationData()
                }, true, error);
            });
        });
    }
}