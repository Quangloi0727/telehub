 
var TicketMailHistorySchema = new mongoose.Schema({
    ticketId: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketMail', index: true, default: null},
    ticketObject: {type: mongoose.Schema.Types.Mixed, required: true}
}, {id: false, versionKey: 'v'});

TicketMailHistorySchema.plugin(require('mongoose-aggregate-paginate'));
TicketMailHistorySchema.set('toObject', {getters: true});
TicketMailHistorySchema.set('toJSON', {getters: true});

module.exports = mongoose.model('TicketMailHistory', TicketMailHistorySchema);