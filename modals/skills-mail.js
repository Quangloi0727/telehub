/**
 * Created by sonth on 13/01/2016.
 */

var SkillMailSchema = new mongoose.Schema({
    skillName: {type: String, required: true, index: true},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref : 'Company', required: true, index: true},
    status: {type: Number, default: 1, index: true},
    created: {type: Date, default: Date.now},
    updated: {type: Date}
}, {id: false, versionKey: 'v'});

SkillMailSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('SkillMail').find({_id: ids}, function (error, ss) {
        if (!ss) {
            cb(error, 404);
        }else{
            _async.forEachOf(ss, function(s, i, cb1){
                mongoose.model('GroupProfileMail').find({
                    skills: {idSkill: s._id}
                }, function(err2, _gps){
                    _async.waterfall([
                        function(cb2){
                            _gps.forEach(function(el, i){
                                if (el.skills[i] == s._id){
                                    el.skills = undefined;
                                    el.save();
                                }
                            })
                            cb2(null);
                        }

                    ], function(err, result){
//                        mongoose.model('Skill').remove({_id: s._id}, cb1);
                        mongoose.model('ServiceMail').remove({idSkill: s._id}, function(err2){
                            if(err2) return cb1(err2);
                            mongoose.model('SkillMail').remove({_id: s._id}, cb1);
                        })
                        //mongoose.model('Service').update({
                        //    idSkill: s._id
                        //}, {$unset: {idSkill: 1}}, {$multi: true}, function(err2){
                        //    mongoose.model('SkillMail').remove({_id: s._id}, cb1);
                        //});
                    });
                });
            }, function (err) {
                cb(err);
            })
        }
    });
};

SkillMailSchema.plugin(require('mongoose-aggregate-paginate'));
SkillMailSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('SkillMail', SkillMailSchema);