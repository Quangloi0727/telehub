/**
 * Created by luongvanlam on 3/19/16.
 */
var TicketHistorySchema = new mongoose.Schema({
    ticketId: {type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true, default: null},
    ticketObject: {type: mongoose.Schema.Types.Mixed, required: true}
}, {id: false, versionKey: 'v'});

TicketHistorySchema.plugin(require('mongoose-aggregate-paginate'));
TicketHistorySchema.set('toObject', {getters: true});
TicketHistorySchema.set('toJSON', {getters: true});

module.exports = mongoose.model('TicketHistory', TicketHistorySchema);