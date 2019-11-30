/**
 * Created by sonth on 13/01/2016.
 */

var SkillChatSchema = new mongoose.Schema({
    skillName: {type: String, required: true, index: true, unique: true},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref : 'Company', required: true},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date}
}, {id: false, versionKey: 'v'});

SkillChatSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('SkillChat').find({_id: ids}, function (error, ss) {
        if (!ss) {
            cb(error, 404);
        }else{
            _async.forEachOf(ss, function(s, i, cb1){
                mongoose.model('GroupProfileChat').find({
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
                        mongoose.model('Service').update({
                            idSkill: s._id
                        }, {$unset: {idSkill: 1}}, {$multi: true}, function(err2){
                            mongoose.model('SkillChat').remove({_id: s._id}, cb1);
                        });
                    });
                });
            }, function (err) {
                cb(err);
            })
        }
    });
};

SkillChatSchema.plugin(require('mongoose-aggregate-paginate'));
SkillChatSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('SkillChat', SkillChatSchema);