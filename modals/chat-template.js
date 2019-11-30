var ChatTemplateSchema = new mongoose.Schema({
    channelId: {type: mongoose.Schema.Types.ObjectId, ref: 'CompanyChannel', required: true},
    name: {type: String, required: true},
    body: {type: String, default: ''},
    raw: {type: String, default: ''},
    status: {type: Number, default: 0},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});
ChatTemplateSchema.plugin(require('mongoose-aggregate-paginate'));
ChatTemplateSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('ChatTemplate', ChatTemplateSchema);