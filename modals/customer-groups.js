var CustomerGroupSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true, index: true},
    status: {type: Number, default: 1}
}, {id: false, versionKey: 'v'});

CustomerGroupSchema.statics._remove = function (id, callback) {
    mongoose.model('CustomerGroup').findById(id, function (error, group) {
        if (error) return error;
        _async.parallel({
            updateSource: function (cb) {
                mongoose.model('CustomerSource').find({group: group._id}, function (error, sources) {
                    if (error) return cb(error);
                    _async.waterfall([
                        function (_cb) {
                            var _ids = _.map(sources, function (source) {
                                return source._id;
                            });
                            mongoose.model('CustomerSource').remove({_id: {$in: _ids}}, function (error, s) {
                                _cb(error, _ids, s);
                            });
                        },
                        function (ids, s, _cb) {
                            mongoose.model('Customer').update({}, {$pull: {source: {$each: ids}}}, {multi: true}, _cb);
                        }
                    ], cb);
                });
            },
            removed: function (cb) {
                group.remove(cb);
            }
        }, callback);
    });
};
CustomerGroupSchema.plugin(require('mongoose-aggregate-paginate'));
CustomerGroupSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('CustomerGroup', CustomerGroupSchema);
