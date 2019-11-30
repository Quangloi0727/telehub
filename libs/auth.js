exports.bindData = bindData;

exports.auth = function (req, res, next) {
    //auth code here ...
    //req.xhr &&
    //req.xhr &&
    var _skip = (['assets', 'favicon'].indexOf(req.path.split('/')[1]) >= 0)
        || (_.isEqual(req.path.indexOf('/chat-client'), 0))
        || (_.isEqual(req.path.indexOf('/ticket-history'), 0))
        || (_.isEqual(req.path.indexOf('/mail-client'), 0))
        || (_.isEqual(req.path.indexOf('/mail'), 0))
        || (_.isEqual(req.path.indexOf('/order-api'), 0))
        //|| (_.isEqual(req.path.indexOf('/ticket'), 0))
        || (_.isEqual(req.path.split('/')[1], 'ticket'))
        || (_.isEqual(req.path.indexOf('/customer-info'), 0))
//        || (req.path.indexOf('/kpi-marking') >= 0)
        || (req.path.indexOf('/customer') >= 0 && req.path.indexOf('/customer-detail') === -1 && req.path.indexOf('/customer-import-by-phone') === -1)
        || (_.isEqual(req.path, '/login'))
        || (_.isEqual(req.path, '/logout'))
        || (_.has(req.session, 'logged')
        //|| (_.has(req.query, 'bypass') && _.isEqual(req.query.bypass, '1'))
        && (_.isEqual(req.session.logged, true))
        && _.isEqual(req.path, '/auth'));
    if (_skip) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        return next();
    }
    if (['html'].indexOf(req.path.split('/')[1]) >= 0) return _.render(req, res, 'login', {page: req.path.split('/')[2], demo: true}, true);
    if(req.session.user && req.session.logged){
        var agentId = req.session.user._id;
        if(!_socketUsers[agentId] || (_socketUsers[agentId] && !_.isEqual(_socketUsers[agentId].sessionID, req.sessionID))) {
            req.session.logged = false;
            return res.redirect('/');
        }
    }
    if (!req.session.logged) return _.render(req, res, 'login', {title: 'Đăng nhập'}, true);
    if (!req.session.auth && req.session.logged) {
        bindData(req, res);
    } else {
        next();
        //authenticate(req, res, next);
    }
};

function authenticate(req, res, next) {
    if (req.path == '/' || req.path.indexOf('menu-manager') >= 0) return next();

    var requestArr = req.path.split('?')[0].split('/');
    if (req.session.menuAccess['/customer'] && _.isEqual(requestArr[1], 'customer-excel')) return next();

    if (!req.session.menuAccess['/' + requestArr[1]]) return accessDenied(req, res);

    if (req.method == "DELETE"){
        if (!req.session.menuAccess['/' + requestArr[1] + '/destroy']){
            return accessDenied(req, res);
        }
    }else if (requestArr[2] == 'new'){
        if (!req.session.menuAccess['/' + requestArr[1] + '/new']){
            return accessDenied(req, res);
        }
    }else if (requestArr[3] == 'edit'){
        if (!req.session.menuAccess['/' + requestArr[1] + '/edit']){
            return accessDenied(req, res);
        }
    }
    next();
}

function accessDenied(req, res){
    if (req.xhr){
        return res.render('406', {title: '406 | Access Denied'});
    }else{
        return res.json({code: 500, message: '406 | Access Denied'});
    }
}

function bindData (req, res){
    _async.parallel({
        company: function (callback) {
            _Company.aggregate([
                {$match: {status: 1}},
                {$lookup: {from: 'agentgroups', localField: '_id', foreignField: 'idParent', as: 'agentgroups'}},
                {$unwind: {path: "$agentgroups", preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: '$_id',
                        name: {$first: '$name'},
                        agentgroups: {$push: '$agentgroups'}
                    }
                },
                {$project: {name: 1, _id: 1, agentgroups: {_id: 1, name: 1}}}
            ], callback);
        },
        role: function (callback) {
            _Role.find({status: 1}).sort({weight: 1}).exec(function (err, roles) {
                if (err) return callback(err, null);
                callback(err, _.reduce(roles, function (memo, item) {
                    memo[item._id.toString()] = {name: item.name, roleGroup: item.roleGroup};
                    return memo;
                }, {}));
            });
        }
    }, function (error, result) {
        var user = req.session.user;

        var _pmRole = null;
        _.each(user.ternalLeaders, function (item) {
            if (_.has(item, 'ternal') && _.isEqual(item.ternal, _config.app._id)) {
                _pmRole = {_id: item.role, name: result.role[item.role].name, roleGroup: result.role[item.role].roleGroup};
            }
        });

        _.each(user.qaLeaders, function (item) {
            if (_.has(item, 'ternal') && _.isEqual(item.ternal, _config.app._id)) {
                _pmRole = {_id: item.role, name: result.role[item.role].name, roleGroup: result.role[item.role].roleGroup};
            }
        });

        _.each(user.qaMembers, function (item) {
            if (_.has(item, 'ternal') && _.isEqual(item.ternal, _config.app._id)) {
                _pmRole = {_id: item.role, name: result.role[item.role].name, roleGroup: result.role[item.role].roleGroup};
            }
        });

        var buildRole = _.reduce(result.company, function (memo, company) {
            var companyId = company._id;
            company['role'] = null;
            var companyLeader = _.where(user.companyLeaders, {company: companyId.toString()});
            if (companyLeader.length) {
                company['role'] = {
                    _id: companyLeader[0].role,
                    name: result.role[companyLeader[0].role].name,
                    roleGroup: result.role[companyLeader[0].role].roleGroup
                };
            }
            var qaMembers = _.where(user.qaMembers, {company: companyId.toString()});
            if (qaMembers.length) {
                company['role'] = {
                    _id: qaMembers[0].role,
                    name: result.role[qaMembers[0].role].name,
                    roleGroup: result.role[qaMembers[0].role].roleGroup
                };
            }

            // Xác định role tương ứng với từng agent group
            var agentgroups = _.reduce(company.agentgroups, function (memo, item) {
                var agentGroupLeaders = _.where(user.agentGroupLeaders, {group: item._id.toString()});
                item['role'] = null;
                if (agentGroupLeaders.length) {
                    item['role'] = {
                        _id: agentGroupLeaders[0].role,
                        name: result.role[agentGroupLeaders[0].role].name,
                        roleGroup: result.role[agentGroupLeaders[0].role].roleGroup
                    };
                }

                // Nếu như chưa có quyền ứng với agentGroupLeaders thì mới tìm kiếm quyền với agentGroupMembers
                if (_.isEmpty(item['role'])) {
                    var agentGroupMembers = _.where(user.agentGroupMembers, {group: item._id.toString()});
                    item['role'] = null;
                    if (agentGroupMembers.length) {
                        item['role'] = {
                            _id: agentGroupMembers[0].role,
                            name: result.role[agentGroupMembers[0].role].name,
                            roleGroup: result.role[agentGroupMembers[0].role].roleGroup
                        };
                    }
                }
                memo.push(item);
                return memo;
            }, []);
            company['agentgroups'] = agentgroups;
            memo.push(company);
            return memo;
        }, []);
        _.render(req, res, 'auth', {
            pmRole: _pmRole,
            projectName: _config.app.name,
            title: 'Truy cập',
            companies: buildRole
        }, true, error);
    });
}