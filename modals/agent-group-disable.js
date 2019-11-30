var AgentGroupDisableSchema = new mongoose.Schema({
    idAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, default: null},
    idGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'AgentGroups', required: true, default: null},
    status: {type: Number, default: 1}
}, {id: false, versionKey: 'v'});

AgentGroupDisableSchema.set('toJSON', {getters: true});
AgentGroupDisableSchema.plugin(require('mongoose-aggregate-paginate'));
module.exports = mongoose.model('AgentGroupDisable', AgentGroupDisableSchema);

