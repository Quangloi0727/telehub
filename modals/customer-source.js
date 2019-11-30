var CustomerSourceSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true},
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'CustomerGroup', index: true},
    amount: {type: Number, default: 0},
    status: {type: Number, default: 1}
}, {id: false, versionKey: 'v'});
CustomerSourceSchema.statics._remove = function (id, callback) {
    mongoose.model('CustomerSource').findById(id, function (error, source) {
        if (error) return error;
        _async.parallel({
            updateCustomer: function (cb) {
                mongoose.model('Customer').update({}, {$pull: {source: source}}, {multi: true}, cb);
            },
            removed: function (cb) {
                source.remove(cb)
            }
        }, callback)
    });
};
CustomerSourceSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('CustomerSource', CustomerSourceSchema);