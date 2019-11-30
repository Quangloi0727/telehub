var reasonProp = {
	type: String,
	enum: ['login', 'logout', 'change_status'],
	default: 'change_status'
};
var AgentStatusLogSchema = new mongoose.Schema({
    startTime: {type: Date, default: null},
    endTime: {type: Date, default: null},
    agentId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    status: {type: Number, default: 1},
    startReason: reasonProp,
    endReason: reasonProp
}, {id: false, versionKey: 'v'});
AgentStatusLogSchema.plugin(require('mongoose-aggregate-paginate'));
AgentStatusLogSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('AgentStatusLog', AgentStatusLogSchema);