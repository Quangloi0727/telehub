/**
 * Created by luongvanlam on 3/22/16.
 */
var SurveyResultSchema = new mongoose.Schema({
    idTicket: {type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, default: null},
    idSurvey: {type: mongoose.Schema.Types.ObjectId, ref: 'Survey', default: null},
    idQuestion: {type: mongoose.Schema.Types.ObjectId, ref: 'SurveyQuestion', default: null},
    answerContent: {type: mongoose.Schema.Types.Mixed, default: ''}, // objectId array or string
    answerNote: {type: String, default: ''},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

SurveyResultSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('SurveyResult', SurveyResultSchema);