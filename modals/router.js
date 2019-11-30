var RouterSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true},
    link: {type: String, default: '/', index: true},
    description: {type: String, default: ''},
    icon: {type: String, default: ''},
    role: [{type: mongoose.Schema.Types.ObjectId, ref: 'Router', default: null}],
    weight: {type: Number, default: 1},
    hidden: {type: Number, default: 0},
    crud: {type: Number, default: 0},
    status: {type: Number, default: 1},
    create: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null}],
    update: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null}],
    destroy: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null}],
}, {id: false, versionKey: 'v'});
RouterSchema.plugin(require(path.join(_libsPath, 'mongoose-tree')));
RouterSchema.statics._delete = function (id, cb) {
    mongoose.model('Router').findById(id, function (err, _w) {
        if (!_w) {
            cb(err, 404);
        } else {
            getChilds(_w, function (arr) {
                arr.push(_w._id);
                mongoose.model('Router').remove({_id: {$in: arr}}, cb);
            });
        }
    });
};
function getChilds(usr, callback) {
    var childarr = [];
    usr.getChildren(function (err, childMenu) {
        var childCount = childMenu.length;
        if (childCount <= 0) callback([]);
        childMenu.forEach(function (child) {
            getChilds(child, function (arr) {
                childCount -= 1;
                childarr.push(child._id);
                if (childCount <= 0) {
                    callback(childarr);
                }
            });
        });
    });
};
module.exports = mongoose.model('Router', RouterSchema);