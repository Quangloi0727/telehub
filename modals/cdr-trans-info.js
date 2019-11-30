var CdrTransInfoSchema = new mongoose.Schema({
    transId: {type: String, index: true, default: null},
    tenant: {type: String},
    cdrTransId: {type: String, index: true, default: null},
    cdrQueueId: {type: String, index: true, default: null},
    cdrIvrId: {type: String, index: true, default: null},
    cdrAgentCallId: {type: String, index: true, default: null},
    callId: {type: String, index: true, default: null},
    serviceId: {type: mongoose.Schema.Types.ObjectId, ref: 'Service', index: true, default: null},
    idCampain: {type: mongoose.Schema.Types.ObjectId, ref: 'Campain', index: true, default: null},//lấy từ callinfos
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true, default: null},//lấy từ callinfos
    idTicket: {type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true, default: null},//lấy từ callinfos
    transType: {type: Number, index: true, default: null},
    serviceType: {type: Number, index: true, default: null},
    destAddr: {type: String, index: true, default: null},
    destType: {type: String, index: true, default: null},
    priority: {type: Number},
    startTime: {type: Number, index: true, default:null},
    endTime: {type: Number, index: true, default:null},
    ringTime: {type: Number, default:null},
    answerTime: {type: Number, default:null},
    callDuration: {type: Number, index:true, default: null},//thời lượng đàm thoại tính bằng endTime-answerTime, nếu answerTime = null thì callDuration = null
    waitDuration: {type: Number, index:true, default: null},//thời gian chờ, tính bằng answerTime-ringTime, nếu answerTime = null thì waitDuration = null
    reason: {type: Number, index: true, default: null},
    subReason: {type: Number, index: true, default: null},
    caller: {type: String, index: true, default: null},
    called: {type: String, index: true, default: null},
    dtmf: {type: String},
    transferNumber: {type: String},
    timeBlock: {type: Number, index:true, default: null},//block thời điểm bắt đầu cuộc gọi: 0(0-1h), 1(1-2h), 2(2-3h),...,23(23-24h)
    durationBlock: {type: Number, index:true, default: null},//block thời lượng gọi, tính theo block 5 giây 1
    waitingDurationBlock: {type: Number, index:true, default: null},//block thời gian chờ: 0(<15s), 1(15-30s), 2(30-45),..., 9(>135s)
    recordPath: {type: String, index: true, default: null},
    agentId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    invokerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    disAgentId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    deviceId: {type: String},
    skillId: {type: mongoose.Schema.Types.ObjectId, ref: 'Skills', index: true, default: null},
    groupId: {type: mongoose.Schema.Types.ObjectId, ref: 'AgentGroups', index: true, default: null},
    shiftId: {type: mongoose.Schema.Types.ObjectId, index: true, default: null},
    created: {type: Date, default: Date.now, index:true}
}, {id: false, versionKey: 'v'});
CdrTransInfoSchema.plugin(require('mongoose-aggregate-paginate'));
module.exports = mongoose.model('CdrTransInfo', CdrTransInfoSchema);

