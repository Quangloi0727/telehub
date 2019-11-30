var ChatTagSchema = new mongoose.Schema({
    value: {type: String, required: true},
    created: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});
ChatTagSchema.plugin(require('mongoose-aggregate-paginate'));
ChatTagSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('ChatTag', ChatTagSchema);