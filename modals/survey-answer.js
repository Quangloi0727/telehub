var SurveyAnswerSchema = new mongoose.Schema({
    content: {type: String, required: true},
    idQuestion: {type: mongoose.Schema.Types.ObjectId, ref: 'SurveyQuestion', default: null},
    idNextQuestion: {type: mongoose.Schema.Types.ObjectId, ref: 'SurveyQuestion', default: null},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    position: {type: Number, default: 1},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

SurveyAnswerSchema.statics._delete = function (id, cb) {
    mongoose.model('SurveyAnswer').findById(id, function (err, _gp) {
        if (!_gp) {
            cb(err, 404);
        } else {
            mongoose.model('Orgs').find({
                idProfile: id
            }, function(err2, _orgs){
                if(_orgs.length == 0) {
                    mongoose.model('GroupProfile').remove({_id: id}, cb);
                }
                else {
                    _orgs.forEach(function(el, i){
                        el.save();
                        el.idProfile = undefined;
                        if(i == _orgs.length - 1){
                            mongoose.model('GroupProfile').remove({_id: id}, cb);
                        }
                    });
                }
            });
        }
    });
};

SurveyAnswerSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('SurveyAnswer', SurveyAnswerSchema);