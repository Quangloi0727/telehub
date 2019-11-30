var MonitorSettingSchema = new mongoose.Schema({
    idUser: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
    agentNoAcd: {type: Number, default: 0},
    answerDurHigh: {type: Number, default: 0},
    answerDurLow: {type: Number, default: 0},
    statusDur: {type: Number, default: 0},
    waitingCustomer: {type: Number, default: 0},
    callDropRate: {type: Number, default: 0}
}, {id: false, versionKey: 'v'});
MonitorSettingSchema.plugin(require('mongoose-aggregate-paginate'));
MonitorSettingSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('MonitorSetting', MonitorSettingSchema);