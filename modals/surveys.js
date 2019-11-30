var SurveysSchema = new mongoose.Schema({
    name: {type: String, required: true},
    note: {type: String, default: ''},
    script: {type: String, default: ''},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

SurveysSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('Survey').find({_id: ids}, function (error1, _surveys) {
        if (!_surveys) {
            cb(error1, 404);
        }else{
            _async.forEachOf(_surveys, function(_survey, i, cb1){
                mongoose.model('SurveyQuestion').find({idSurvey: _survey._id}, '_id').exec(function(err2, _surveyQs){
                    var _surveyQsIds = _.pluck(_surveyQs, '_id');
                    mongoose.model('SurveyQuestion')._deleteAll({$in: _surveyQsIds}, function (err3) {
                        mongoose.model('Survey').remove({_id: _survey._id}, cb1);
                    });
                });
            }, function (err4) {
                cb(err4);
            })
        }
    });
};
SurveysSchema.plugin(require('mongoose-aggregate-paginate'));
SurveysSchema.index({name:1},{unique:true});
SurveysSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('Survey', SurveysSchema);