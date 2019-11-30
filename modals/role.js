var RoleSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true},
    description: {type: String, default: ''},
    weight: {type: Number, default: 0},
    modify: {type: Number, default: 1},
    roleGroup: {type: Number, default: 4}, // 1 : TenantLeader , 2 : Company Leader, 3: Agent Group Leader, 4: Agent Group Member
    status: {type: Number, default: 1}
}, {id: false, versionKey: 'v'});

RoleSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('Role').find({_id: ids, modify: 1}, function (error, ss) {
        if (!ss) {
            cb(error, 404);
        }else{
            _async.forEachOf(ss, function(s, i, cb1){
                mongoose.model('Role').remove({_id: s._id}, function(err, r){
                    if(!err) mongoose.model('Router').update({role:s._id},{$pull:{role:s._id}}, cb1)
                });
            }, function (err) {
                cb(err);
            })
        }
    });
};

RoleSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('Role', RoleSchema);