/**
 * Created by luongvanlam on 1/26/16.
 */
var CompanyProfileSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    status: {type: Number, default: 1},
    fieldId: [{type: mongoose.Schema.Types.ObjectId, ref: 'CustomerFields'}],
    created: {type: Date, default: Date.now},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});
CompanyProfileSchema.plugin(require('mongoose-aggregate-paginate'));
CompanyProfileSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('CompanyProfile', CompanyProfileSchema);