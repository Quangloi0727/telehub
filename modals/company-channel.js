/**
 * Created by luongvanlam on 2/2/16.
 */
var CompanyChannelSchema = new mongoose.Schema({
    name: {type: String, required: true},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref : 'Company', required: true},
    status: {type: Number, default: 1},
    alias: {type: String, required: true, unique: true},
    website: {type: String, default: ''},
    formStatus: {type: Number, default: 0},
    emailStatus: {type: Number, default: 0},
    phoneStatus: {type: Number, default: 0},
    serviceStatus: {type: Number, default: 0},
    created: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

CompanyChannelSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('CompanyChannel').find({_id: ids}, function (error, ss) {
        if (!ss) {
            cb(error, 404);
        }else{
            _async.forEachOf(ss, function(s, i, cb1){
                mongoose.model('CompanyChannel').remove({_id: s._id}, cb1);
            }, function (err) {
                cb(err);
            })
        }
    });
};


CompanyChannelSchema.plugin(require('mongoose-aggregate-paginate'));
CompanyChannelSchema.set('toObject', {getters: true});
CompanyChannelSchema.set('toJSON', {getters: true});

module.exports = mongoose.model('CompanyChannel', CompanyChannelSchema);

