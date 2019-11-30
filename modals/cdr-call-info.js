var CdrCallInfoSchema = new mongoose.Schema({
    callId: {type: String, index: true, default: null},
    transId: {type: String, index: true, default: null},
    tenant: {type: String},
    callType: {type: Number, index: true, default: null},
    caller: {type: String, index:true, default: null},
    called: {type: String, index:true, default: null},
    serviceId: {type: mongoose.Schema.Types.ObjectId, ref: 'Service', index: true, default: null},
    idCampain: {type: mongoose.Schema.Types.ObjectId, ref: 'Campain', index: true, default: null},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true, default: null},
    idTicket: {type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true, default: null},
    customerLevel: {type: Number},
    channelId: {type: String},
    gateway: {type: String},
    startTime: {type: Number, index:true, default: null},
    endTime: {type: Number, index:true, default: null},
    reason: {type: Number, index: true, default: null},
    subReason: {type: Number, index: true, default: null},
    created: {type: Date, default: Date.now, index:true},
}, {id: false, versionKey: 'v'});
CdrCallInfoSchema.plugin(require('mongoose-aggregate-paginate'));
module.exports = mongoose.model('CdrCallInfo', CdrCallInfoSchema);

