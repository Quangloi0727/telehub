var KPIMarkDataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    note: { type: String, default: ''},
    idCollection: { type: mongoose.Schema.Types.ObjectId, ref: 'KPIMarkCollection', require : true},
    idCompany: [{type: mongoose.Schema.Types.ObjectId, ref: 'Company', require : true}],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    agents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    qaList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxTicket: { type: String, required: true },
    createBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updateBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: Number, default: 1 },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { id: false, versionKey: 'v' });

KPIMarkDataSchema.set('toJSON', { getters: true });
KPIMarkDataSchema.plugin(require('mongoose-aggregate-paginate'));
KPIMarkDataSchema.index({ name: 1}, { unique: true });
module.exports = mongoose.model('KPIMarkData', KPIMarkDataSchema);

