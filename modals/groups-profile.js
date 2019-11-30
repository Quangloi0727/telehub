var GroupProfileSchema = new mongoose.Schema({
    name: {type: String, default: '', required: true},
    recordingState: {type: Number, default: 1},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, default: null},
    skills: [{
        idSkill: {type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null},
        order: {type: Number, default: 0}
    }],
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

GroupProfileSchema.index({name: 1}, {unique: true});

GroupProfileSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('GroupProfile').find({_id: ids}, function (error, gps) {
        if (!gps) {
            cb(error, 404);
        } else {
            var _failProfile = [];
            _async.forEachOf(gps, function (group, i, cb1) {
                mongoose.model('AgentGroups').find({
                    idProfile: group._id
                }, function (err2, _orgs) {
                    if (_orgs.length == 0) {
                        mongoose.model('GroupProfile').remove({_id: group._id}, cb1);
                    } else {
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

GroupProfileSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('GroupProfile', GroupProfileSchema);