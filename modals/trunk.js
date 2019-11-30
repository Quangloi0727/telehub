var TrunkSchema = new mongoose.Schema({
    name: {type: String, unique: true, default: ''},
    prefix: {type: String, unique: true, required: true, default: ''},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null},
    status: {type: Number, default: 1},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    createdDate: {type: Date, default: Date.now},
    updatedDate: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});
TrunkSchema.plugin(require('mongoose-aggregate-paginate'));
TrunkSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('Trunk', TrunkSchema);