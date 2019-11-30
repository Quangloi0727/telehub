var SurveyQuestionSchema = new mongoose.Schema({
    idSurvey: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Survey', index: true},
    content: {type: String, required: true},
    answerType: {type: Number, required: true},
    questionType: {type: Number, required: true},
    isStart: {type: Number, default: 0},
    idNextQuestion: {type: mongoose.Schema.Types.ObjectId, ref: 'SurveyQuestion', default: null},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

SurveyQuestionSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('SurveyQuestion').find({_id: ids}, function (error1, _surveyQs) {
        if (!_surveyQs) {
            cb(error1, 404);
        }else{
            _async.forEachOf(_surveyQs, function(_surveyQ, i, cb1){
                _async.waterfall([
                    function(cbWtf1){
                        mongoose.model('SurveyAnswer').remove({idQuestion:_surveyQ._id}, function(err){
                            cbWtf1(null);
                        });
                    },function(cbWtf2){
                        mongoose.model('SurveyAnswer').update({idNextQuestion:_surveyQ._id},{$unset:{idNextQuestion:1}}, {multi:true}, function(err){
                            cbWtf2(null);
                        });
                    },function(cbWtf3){
                        mongoose.model('SurveyQuestion').update({idNextQuestion:_surveyQ._id},{$unset:{idNextQuestion:1}}, {multi:true}, function(err){
                            cbWtf3(null);
                        });
                    }
                ], function(err){
                    mongoose.model('SurveyQuestion').remove({_id: _surveyQ._id}, cb1);
                });
            }, function (err1) {
                cb(null);
            })
        }
    });
};

SurveyQuestionSchema.index({idSurvey: 1, content:1},{unique:true});
SurveyQuestionSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('SurveyQuestion', SurveyQuestionSchema);