/**
 * Created by MrBlack on 1/13/2016.
 */
var _rootId = String(_rootMenu._id);

exports.index = {
    json: function (req, res) {
        //_Router.find({_id: {$ne: _rootMenu._id.toString()}}, '-v').exec(function (error, m) {
        //    res.json(m);
        //});
        if (req.query.hasOwnProperty('parent') && req.query.parent == 'true') {
            findParents(_rootMenu, [], function (xx) {
                res.json(xx);
            });
        } else {
            var _result = {_id: _rootMenu._id, name: _rootMenu.name, children: [], list: [{key: 'Root', val: _rootMenu._id}]};
            findChilds(_result.list, _rootMenu, function (arr) {
                _result.children = arr;
                _result.children.sort(_.dynamicSort('weight'));
                res.json(_result);
            });
        }
    },
    html: function (req, res) {
        _.render(req, res, 'menu-manager', {title: 'Quản trị Menu', plugins: ['jquery-ui', ['bootstrap-select'], ['mrblack-table'], 'mockjax', ['bootstrap-editable']]}, true);
    }
}

exports.create = function (req, res) {
    req.body.link = _.trimValue(req.body.link);
    _Router.findOne({$and: [{link: req.body.link}, {link: {$ne: 'none'}}]}, function (error, menu) {
        if (error) return res.json({code: 500, message: error});
        if (menu) return res.json({code: 505, message: 'Đường dẫn đã tồn tại'});
        if (_.has(req.body, 'weight') && _.isEqual(req.body.weight, 'null')) req.body.weight = 1;
        if (_.isEqual(req.body.link, 'none') || _.getModule(req.body.link)) {
            req.body.role = [STATIC_ROLE.TechnicalManager];
            _Router.create(req.body, function (error, _r) {
                res.json({code: (error ? 500 : 200), message: error ? error : _r});
            });
        } else {
            res.json({code: 505, message: 'Module này không tồn tại'});
        }
    });
};

exports.update = function (req, res) {
    if (_.isEqual(req.params.menumanager, _rootMenu._id.toString())) {
        var _body = _.chain(req.body).values().map(function (e) {
            return _.isObject(e) ? e : null;
        }).compact().value();
        if (!_body || !_body.length) return res.status(200);
        _async.each(_body, function (s, callback) {
            _Router.findByIdAndUpdate(s.id, {$set: {weight: s.weight, parent: s.parent}}, callback);
        }, function (err) {
            err ? res.status(500).send(err) : res.status(200).json('ok');
        });
    } else {
        if (_.has(req.body, 'role')) {
            var _query = _.isEqual(req.params.menumanager, 'all') ? {} : {_id: new mongodb.ObjectId(req.body.ids)};
            var _val = {};
            _val[(!Number(req.body.type) ? "$pullAll" : "$addToSet")] = (!Number(req.body.type)) ? {role: _.arrayObjectId(req.body.role.split(','))} : {role: {$each: _.arrayObjectId(req.body.role.split(','))}};
            _Router.update(_query, _val, {multi: _.isEqual(req.params.menumanager, 'all')}, function (err, _r) {
                if (err) return res.status(500).send(err);
                if (!_.isEqual(req.params.menumanager, 'all') && !err) {
                    _Router.findById(req.params.menumanager, function (error, _r) {
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
                            _Router.update({_id: {$in: _rIds}}, _val, {multi: true}, function (error, r) {
                                error ? res.status(500).send(error) : res.status(200).json(_rIds);
                            });
                        });
                    });
                } else {
                    res.status(200).json(_r);
                }
            });
        }
        else if (_.has(req.body, 'pk')) {
            var _query = (_.has(req.body, 'old') && _.isEqual(req.body.old, req.body.link)) ? {$and: [{name: req.body.name}, {link: {$ne: 'none'}}]} : {$and: [{link: req.body.link}, {link: {$ne: 'none'}}]};
            var _body = _.chain(req.body).cleanRequest(['pk', 'old']).mapObject(_.trimValueNotLower).value();
            _Router.findOne(_query, function (error, menu) {
                if (error) return res.json({code: 500, message: error});
                if (menu) return res.json({code: 505, message: 'Đường dẫn đã tồn tại'});
                if (_.isEqual(req.body.link, 'none') || _.getModule(req.body.link)) {
                    _Router.findByIdAndUpdate(req.params.menumanager, _body, {new: true}, function (error, _r) {
                        res.json({code: (error ? 500 : 200), message: error ? error : _r});
                    });
                } else {
                    res.json({code: 505, message: 'Module này không tồn tại'});
                }
            });
        }
        else {
            _Router.findByIdAndUpdate(req.params.menumanager, req.body, {new: true}, function (err, _r) {
                //kiểm tra nếu chỉ cập nhật status thì cập nhật cả bố cả con :3
                if (_.has(req.body, 'status') && !err) {
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
                        var _rIds = _.isEqual(_r.status, 1) ? _.uniq(_.union(result._parent)) : _.uniq(_.union(result._child));
                        _Router.update({_id: {$in: _rIds}}, {$set: {status: req.body.status}}, {multi: true}, function (error, r) {
                            error ? res.status(500).send(error) : res.status(200).json(_rIds);
                        });
                    });
                } else {
                    err ? res.status(500).send(err) : res.status(200).json(_r);
                }
            });
        }
    }
};

exports.destroy = function (req, res) {
    _Router.findById(req.params.menumanager, function (error, menu) {
        if (!menu) return res.json({code: 200, message: []});
        _async.parallel({
            deleteThis: function (callback) {
                menu.remove(callback)
            },
            getList: function (callback) {
                findChildIds([], menu, callback);
            },
            updateRole: function (callback) {
                //Đang viết
                callback(null, 'somthing');
            }
        }, function (error, result) {
            res.json({code: (error ? 500 : 200), message: error ? error : result.getList});
        });
    });
};

function findChilds(lst, usr, callback) {
    var childarr = [];
    usr.getChildren(function (err, child) {
        var childCount = child.length;
        if (childCount <= 0) callback([]);
        child.forEach(function (child) {
            findChilds(lst, child, function (arr) {
                childCount -= 1;
                lst.push({key: child.name, val: child._id});
                var obj = {};
                obj._id = child._id;
                obj.name = child.name;
                obj.status = child.status;
                obj.icon = child.icon;
                obj.weight = child.weight;
                obj.hidden = child.hidden;
                obj.crud = child.crud;
                obj.link = '/' + child.link;
                obj.description = child.description ? description : 'Chưa có mô tả';
                obj.role = child.role;
                obj.children = _.sortBy(arr, 'name');
                obj.children.sort(_.dynamicSort("weight"));
                childarr.push(obj);
                childarr.sort(_.dynamicSort("weight"))
                if (childCount <= 0) {
                    callback(childarr);
                }
            });
        });
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

//_Router.update({}, {$addToSet: {role: STATIC_ROLE.PM}}, {multi: true}, function (error, x) {
//    console.log(x);
//});