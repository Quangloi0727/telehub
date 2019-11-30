/**
 * Created by NghiaTM on 5/27/2016.
 */
var KPIMarkingSchema = new mongoose.Schema({
    idData: {type: mongoose.Schema.Types.ObjectId, ref: 'KPIMarkData', required: true},
    agentId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    ticketId: {type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: null},
    markCollectionId: {type: mongoose.Schema.Types.ObjectId, ref: 'KPIMarkCollection', default: null},
    datas: {type: mongoose.Schema.Types.Mixed, default: null},
    updated: { type: Date, default: Date.now }
}, {id: false, versionKey: 'v'});

KPIMarkingSchema.plugin(require('mongoose-aggregate-paginate'));
KPIMarkingSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('KPIMarking', KPIMarkingSchema);