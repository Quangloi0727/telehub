/**
 * Created by Đại Đồng on 04/02/2016.
 */
var TicketReasonSchema = new mongoose.Schema({
    name: {type: String, required: true},
    idCategory: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketReasonCategory', index: true, default: null},
    priority: {type: Number, default: 1},
    status: {type: Number, default: 1},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', index: true, default: null},
    createdDate: {type: Date, default: Date.now, index: true},
    updateddBy: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', index: true, default: null},
    updatedDate: {type: Date, default: Date.now, index: true},
}, {id: false, versionKey: 'v'});

TicketReasonSchema.statics._remove = function (id, callback) {
    mongoose.model('TicketReason').find({_id: {$in: id}}, function (error, rea) {
        if (error) return error;
        var _ids = _.map(rea, function (source) {
            return source._id;
        });
        _async.parallel({
            removeSubreason: function (cb) {
                mongoose.model('TicketSubreason').remove({idReason: {$in: _ids}}, cb);
            },
            removed: function (cb) {
                mongoose.model('TicketReason').remove({_id: {$in: rea}}, cb);
            }
        }, callback)
    });
};
TicketReasonSchema.plugin(require('mongoose-aggregate-paginate'));
TicketReasonSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('TicketReason', TicketReasonSchema);
