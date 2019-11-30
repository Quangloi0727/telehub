/**
 * Created by luongvanlam on 1/20/16.
 */
var TicketChatSchema = new mongoose.Schema({
    assignBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    groupId: {type: mongoose.Schema.Types.ObjectId, ref: 'AgentGroups', index: true, default: null},
    idCustomer: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true, default: null},
    idService: {type: mongoose.Schema.Types.ObjectId, ref: 'ServiceChat', index: true, default: null},
    idAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    threadId: {type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', index: true, required: true},
    ticketSubreason: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketSubReason', default: null},
    ticketReason: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketReason', default: null},
    ticketReasonCategory: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketReasonCategory', default: null}, //Chi loc theo type=chat
    status: {type: Number, default: 0}, //0: cho xu ly, 1: Dang xu ly, 2: Hoan thanh, -1: Bat dau thread tao ticket luon (ticket ao). Ket thuc chat ma khong save ticket thi xoa ticket nay di (status=-1)
    note: {type: String, default: ''},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    deadline: {type: Date, default: Date.now},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null}
}, {id: false, versionKey: 'v'});

TicketChatSchema.plugin(require('mongoose-aggregate-paginate'));
TicketChatSchema.set('toObject', {getters: true});
TicketChatSchema.set('toJSON', {getters: true});

module.exports = mongoose.model('TicketChat', TicketChatSchema);