/**
 * Created by sonth on 5/17/16.
 */
var TicketChatHistorySchema = new mongoose.Schema({
    ticketId: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketChat', index: true, default: null},
    ticketObject: {type: mongoose.Schema.Types.Mixed, required: true}
}, {id: false, versionKey: 'v'});

TicketChatHistorySchema.plugin(require('mongoose-aggregate-paginate'));
TicketChatHistorySchema.set('toObject', {getters: true});
TicketChatHistorySchema.set('toJSON', {getters: true});

module.exports = mongoose.model('TicketChatHistory', TicketChatHistorySchema);