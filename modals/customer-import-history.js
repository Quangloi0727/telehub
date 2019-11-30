var CustomerImportHistorySchema = new mongoose.Schema({
    name: {type: String, required: true, index: true},
    url: {type: String, required: true},
    description: {type: String},
    createBy: {type: String},
    created: {type: Date, default: Date.now()},
    status: {type: Number, default: 1}
}, {id: false, versionKey: 'v'});

CustomerImportHistorySchema.plugin(require('mongoose-aggregate-paginate'));
CustomerImportHistorySchema.set('toJSON', {getters: true});
module.exports = mongoose.model('CustomerImportHistory', CustomerImportHistorySchema);