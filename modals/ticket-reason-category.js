/**
 * Created by sonth on 13/01/2016.
 */

var TicketCategorySchema = new mongoose.Schema({
    name: {type: String, index: true, unique: true},
    category: {type: Number, default: 0},//gọi vào và gọi ra:0, gọi vào:1, gọi ra:2, chat:3, mail:4, mạng xã hội:5
    note: {type: String, default: ''},
    status: {type: Number, default: 1},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', index: true, default: null},
    createdDate: {type: Date, default: Date.now},
    updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', index: true, default: null},
    updatedDate: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

TicketCategorySchema.statics._remove = function (id, callback) {
    mongoose.model('TicketReasonCategory').find({_id: {$in: id}}, function (error, cat) {
        if (error) return error;
        _async.parallel({
            updateTicket: function (cb) {
                var _cat = _.map(cat, function (source) {
                    return source._id;
                });
                mongoose.model('TicketReason').find({idCategory: {$in: _cat}}, function (error, rea) {
                    if (error) return cb(error);
                    _async.waterfall([
                        function (_cb) {
                            var _rea = _.map(rea, function (source) {
                                return source._id;
                            });
                            mongoose.model('TicketReason').remove({idCategory: {$in: _cat}}, function (error, s) {
                                _cb(error, _rea);
                            });
                        },
                        function (rea, _cb) {
                            mongoose.model('TicketSubreason').remove({idReason: {$in: rea}}, _cb);
                        },
                        function (r, cb) {
                            mongoose.model('Campain').update({idCategoryReason: {$in: _cat}}, {$set: {idCategoryReason: null}}, {multi: true}, cb);
                        }
                    ], cb);
                });
            },
            removed: function (cb) {
                mongoose.model('TicketReasonCategory').remove({_id: {$in: cat}}, cb);
            }
        }, callback);
    });
};
TicketCategorySchema.plugin(require('mongoose-aggregate-paginate'));
TicketCategorySchema.set('toJSON', {getters: true});
module.exports = mongoose.model('TicketReasonCategory', TicketCategorySchema, 'ticketreasoncategories');
