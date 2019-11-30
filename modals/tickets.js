/**
 * Created by luongvanlam on 1/20/16.
 */
var TicketSchema = new mongoose.Schema({
    statusAssign: {type: Number, default: 1},//
    assignBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    assignTo: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    groupId: {type: mongoose.Schema.Types.ObjectId, ref: 'AgentGroups', index: true, default: null}, // assign Ticket
    agentGroup: {type: mongoose.Schema.Types.ObjectId, ref: 'AgentGroups', index: true, default: null}, // agent group's inbound ticket
    idCustomer: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true, default: null},
    idCampain: {type: mongoose.Schema.Types.ObjectId, ref: 'Campain', index: true, default: null},
    idService: {type: mongoose.Schema.Types.ObjectId, ref: 'Service', index: true, default: null},
    idAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    callId: [{type: String, index: true, default: null}],
    callIdLength: {type: Number, default: 0},
    ticketSubreason: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketSubReason', index: true, default: null},
    ticketReason: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketReason', index: true, default: null},
    ticketReasonCategory: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketReasonCategory', index: true, default: null},
    status: {type: Number, index: true, default: 0},//0:chờ xử lí, 1:đang xử lí,2:đã xử lí
    note: {type: String, default: ''},
    customerStatisfy : {type: mongoose.Schema.Types.ObjectId, ref: 'CustomerStatisfy', index: true, default: null},
    customerStatisfyStage : {type: mongoose.Schema.Types.ObjectId, ref: 'CustomerStatisfyStage', index: true, default: null},
    created: {type: Date, index: true, default: Date.now},
    updated: {type: Date, index: true, default: Date.now},
    deadline: {type: Date, index: true, default: null},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null}
}, {id: false, versionKey: 'v'});

TicketSchema.plugin(require('mongoose-aggregate-paginate'));
TicketSchema.set('toObject', {getters: true});
TicketSchema.set('toJSON', {getters: true});

module.exports = mongoose.model('Ticket', TicketSchema);