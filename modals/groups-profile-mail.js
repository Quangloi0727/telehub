var GroupProfileMailSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true},
    skills: [{
        idSkill: {type: mongoose.Schema.Types.ObjectId, ref: 'SkillMail', index: true},
        order: {type: Number, default: 0}
    }],
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: Number, default: 1, index: true},
    created: {type: Date, default: Date.now},
    updated: {type: Date}
}, {id: false, versionKey: 'v'});

GroupProfileMailSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('GroupProfileMail').find({_id: ids}, function (error, gps) {
        if (!gps) {
            cb(error, 404);
        }else{
            var _failProfile = [];
            _async.forEachOf(gps, function(group, i, cb1){
                mongoose.model('AgentGroups').find({
                    idProfileChat: group._id
                }, function(err2, _orgs){
                    if(_orgs.length == 0){
                        mongoose.model('GroupProfileMail').remove({_id: group._id}, cb1);
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

GroupProfileMailSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('GroupProfileMail', GroupProfileMailSchema);