var CustomerSchema = new mongoose.Schema({
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    sources: [{type: mongoose.Schema.Types.ObjectId, ref: 'CustomerSource', index: true}],
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});
CustomerSchema.plugin(require('mongoose-aggregate-paginate'));
CustomerSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('Customer', CustomerSchema);