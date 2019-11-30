var ChatNoteSchema = new mongoose.Schema({
    //customerId: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true},
    agentId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    clientId: {type: String, required: true},
    content: {type: String, required: true},
    created: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});
ChatNoteSchema.plugin(require('mongoose-aggregate-paginate'));
ChatNoteSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('ChatNote', ChatNoteSchema);