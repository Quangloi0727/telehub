/**
 * Created by MrBlack on 1/13/2016.
 */
var _rootId = String(new mongodb.ObjectID('-dft-hoasao-'));
exports.index = {
    json: function (req, res) {
        _Router.findById(_rootId).exec(function (err, mainMenuRouter) {
            if (req.query.hasOwnProperty('parent') && req.query.parent == 'true') {
                findParents(mainMenuRouter, [], function (xx) {
                    res.json(xx);
                });
            } else {
                // _w : Main Menu Router
                var _result = {_id: mainMenuRouter._id, name: mainMenuRouter.name, children: [], list: [{key: 'Root', val: _rootId}]};
                findChilds(_result.list, mainMenuRouter, function (arr) {
                    _result.children = arr;
                    _result.children.sort(_.dynamicSort('weight'));
                    res.json(_result);
                });
            }
        });
    },
    html: function (req, res) {
        _Role.find({}).sort({weight: 1}).exec(function (error, r) {
            _.render(req, res, 'role-manager', {title: 'Quản trị phân quyền', roles: r, plugins: ['jquery-ui', ['bootstrap-select'], ['mrblack-table'], ['table-header']]}, true, error);
        });
    }
}
exports.create = function (req, res) {
    _Router.create(req.body, function (error, _r) {
        res.json({code: (error ? 500 : 200), message: error ? error : _r});
    });
};
exports.update = function (req, res) {
    if (_.has(req.body, 'role')) {
        var _query = _.isEqual(req.params.rolemanager, 'all') ? {} : {_id: new mongodb.ObjectId(req.body.ids)};
        var updateObj = {};
        var isAddToSet = Number(req.body.type);
        var role = new mongodb.ObjectID(req.body.role);
        var obj = {};
        if (_.isEqual(req.body.crud, 'undefined') || _.isEmpty(req.body.crud)){
            if (_.isEmpty(_query)){
                obj = {role: role, create: role, update: role, destroy: role};
            }else{
                obj = {role: role};
            }
        }else{
            obj[req.body.crud] = role;
        }

        if (isAddToSet){
            updateObj['$addToSet'] = obj;
        }else{
            updateObj['$pull'] = obj;
        }

        console.log(50, JSON.stringify(_query));
        console.log(51, JSON.stringify(updateObj));

        _Router.update(_query, updateObj, {multi: _.isEmpty(_query)}, function (err, _r) {
            if (err) return res.status(500).send(err);

            if (!_.isEqual(req.params.rolemanager, 'all')) {
                _Router.findById(req.params.rolemanager, function (error, _r) {
                    _async.parallel({
                        _parent: function (callback) {
                            findParents([], _r, callback);
                        },
                        _child: function (callback) {
                            findChildIds([], _r, callback);
                        }
                    }, function (error, result) {
                        if (error) res.status(500).send(error);
                        if (_.isEqual(result._parent.length, 0) && _.isEqual(result._child.length, 0)) return res.status(200).send([]);
                        var _rIds = _.isEqual(Number(req.body.type), 1) ? _.uniq(_.union(result._parent)) : _.uniq(_.union(result._child));
                        _Router.update({_id: {$in: _rIds}}, updateObj, {multi: true}, function (error, r) {
                            error ? res.status(500).send(error) : res.status(200).json(_rIds);
                        });
                    });
                });
            } else {
                res.status(200).json(_r);
            }
        });
    }
};

function findChilds(list, childMenu, callback) {
    var childarr = [];
    childMenu.getChildren(function (err, child) {
        var childCount = child.length;
        if (childCount <= 0) callback([]);
        child.forEach(function (child) {
            findChilds(list, child, function (arr) {
                childCount -= 1;
                list.push({key: child.name, val: child._id});
                var obj = {};
                obj._id = child._id;
                obj.name = child.name;
                obj.status = child.status;
                obj.icon = child.icon;
                obj.weight = child.weight;
                obj.role = child.role;
                obj.crud = child.crud;
                obj.create = child.create;
                obj.update = child.update;
                obj.destroy = child.destroy;
                obj.link = child.link ? hostname + '/' + child.link : 'không có';
                obj.description = child.description ? description : 'Chưa có mô tả';
                obj.children = _.sortBy(arr, 'name');
                obj.children.sort(_.dynamicSort("weight"));
                childarr.push(obj);
                childarr.sort(_.dynamicSort("weight"));
                if (childCount <= 0) {
                    callback(childarr);
                }
            });
        });
    });
};

function findParents(parents, usr, callback) {
    _Router.findOne({_id: usr.parent, name: {$ne: 'Main menu'}}, function (err, _parent) {
        if (err) callback(err, parents);
        if (_parent) {
            parents.push(_parent._id);
            findParents(parents, _parent, callback);
        } else {
            callback(null, parents);
        }
    });
};

function findChildIds(lst, usr, callback) {
    var childarr = [];
    usr.getChildren(true, function (err, child) {
        if (err) return callback(err, []);
        var childCount = child.length;
        if (childCount <= 0) callback(null, []);
        child.forEach(function (child) {
            findChildIds(lst, child, function () {
                lst.push(child._id.toString());
                var obj = {};
                obj._id = child._id;
                childCount -= 1;
                childarr.push(obj);
                if (childCount <= 0) {
                    callback(null, lst);
                }
            });
        });
    });
};