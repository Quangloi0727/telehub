/**
 * Created by MrBlack on 2/24/2016.
 */
var _auth = require(path.join(_rootPath, 'libs', 'auth.js'));
exports.index = _auth.bindData;

exports.create = function (req, res) {
    req.session['auth'] = JSON.parse(req.body.auth);
    getChildsMenu(req.session.auth.role._id, {}, _rootMenu, function (err, arr, ma) {
        req.session['menuRouter'] = arr;
        req.session['menuAccess'] = ma;
        res.status(200).json({ code: 200, message: arr, auth: req.session['auth']});
    });
    
};

function getChildsMenu(cr, ma, usr, callback) {
    var childarr = [];
    usr.getChildren(function (err, child) {
        var childCount = child.length;
        if (childCount <= 0) callback(err, [], []);
        child.forEach(function (child) {
            getChildsMenu(cr, ma, child, function (err, arr) {
                childCount -= 1;
                var obj = {};
                obj._id = child._id;
                obj.name = child.name;
                obj.status = child.status;
                obj.icon = child.icon;
                obj.weight = child.weight;
                obj.hidden = child.hidden;
                obj.link = '/' + child.link;
                obj.access = (child.role.indexOf(cr) >= 0 && _.isEqual(child.status, 1));
                obj.childs = _.sortBy(arr, 'name');
                obj.childs.sort(_.dynamicSort("weight"));
                childarr.push(obj);
                childarr.sort(_.dynamicSort("weight"));
                if (child.link && !_.isEqual(child.link, 'none')) {
                    ma['/' + child.link] = (child.role.indexOf(cr) >= 0 && _.isEqual(child.status, 1));
                    if (child.crud) {
                        ma['/' + child.link + '/new'] = (child.create.indexOf(cr) >= 0 && _.isEqual(child.status, 1));
                        ma['/' + child.link + '/update'] = (child.update.indexOf(cr) >= 0 && _.isEqual(child.status, 1));
                        ma['/' + child.link + '/edit'] = (child.update.indexOf(cr) >= 0 && _.isEqual(child.status, 1));
                        ma['/' + child.link + '/destroy'] = (child.destroy.indexOf(cr) >= 0 && _.isEqual(child.status, 1));
                        ma['/' + child.link + '/validate'] = (child.role.indexOf(cr) >= 0 && _.isEqual(child.status, 1));
                    }
                }
                if (childCount <= 0) {
                    callback(null, childarr, ma);
                }
            });
        });
    });
};