var GroupProfileChatSchema = new mongoose.Schema({
    name: {type: String, default: '', required: true},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    skills: [{
        idSkill: {type: mongoose.Schema.Types.ObjectId, ref: 'SkillChat'},
        order: {type: Number, default: 0}
    }],
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date}
}, {id: false, versionKey: 'v'});

GroupProfileChatSchema.index({name:1},{unique:true});

GroupProfileChatSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('GroupProfileChat').find({_id: ids}, function (error, gps) {
        if (!gps) {
            cb(error, 404);
        }else{
            var _failProfile = [];
            _async.forEachOf(gps, function(group, i, cb1){
                mongoose.model('AgentGroups').find({
                    idProfileChat: group._id
                }, function(err2, _orgs){
                    if(_orgs.length == 0){
                        mongoose.model('GroupProfileChat').remove({_id: group._id}, cb1);
                    }else {
                        _failProfile.push(group);
                        cb1(null);
                    }
                });
            }, function (err) {
                cb(_failProfile);
            })
        }
    });

};

GroupProfileChatSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('GroupProfileChat', GroupProfileChatSchema);