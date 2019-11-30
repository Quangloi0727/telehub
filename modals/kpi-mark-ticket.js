var KPIMarkTicketSchema = new mongoose.Schema({
    idTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: null },
    idTicketChat: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketChat', default: null },
    idTicketMail: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketMail', default: null },
    idData: { type: mongoose.Schema.Types.ObjectId, ref: 'KPIMarkData', required: true},
    idAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    qa: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    idMarking: { type: mongoose.Schema.Types.ObjectId, ref: 'KPIMarking' },
    createBy: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User' },
    updateBy: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User' },
    status: { type: Number, default: 1 },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { id: false, versionKey: 'v' });

KPIMarkTicketSchema.set('toJSON', { getters: true });
KPIMarkTicketSchema.plugin(require('mongoose-aggregate-paginate'));
module.exports = mongoose.model('KPIMarkTicket', KPIMarkTicketSchema);

