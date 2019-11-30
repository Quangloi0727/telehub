/**
 * Created by Đại Đồng on 04/02/2016.
 */
var TicketSubreasonSchema = new mongoose.Schema({
    name: {type: String, required: true},
    idReason: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketReason', index: true, default: null},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', index: true, default: null},
    createdDate: {type: Date, default: Date.now, index: true},
    updateddBy: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', index: true, default: null},
    updatedDate: {type: Date, default: Date.now, index: true},
    priority: {type: Number, default: 0},
    status: {type: Number, default: 0}
}, {id: false, versionKey: 'v'});

TicketSubreasonSchema.plugin(require('mongoose-aggregate-paginate'));
TicketSubreasonSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('TicketSubreason', TicketSubreasonSchema);
