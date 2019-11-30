var ServicesMailSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true},
    idSkill: {type: mongoose.Schema.Types.ObjectId, ref: 'SkillMail', index: true},
    routeMail: {type: Number, required: true},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: Number, default: 1, index: true},
    created: {type: Date, default: Date.now},
    updated: {type: Date},
    send_host: {type: String, required: true},
    send_port: {type: Number, required: true},
    send_user: {type: String, required: true},
    send_pass: {type: String, required: true},
    send_sercure: {type: Number, required: true},
    send_protocol: {type: Number, required: true},
    send_limit: {type: Number, required: true},
    receive_host: {type: String, required: true},
    receive_port: {type: Number, required: true},
    receive_protocol: {type: Number, required: true},
    receive_user: {type: String, required: true},
    receive_pass: {type: String, required: true},
    receive_sercure: {type: Number, required: true},
    receive_delay: {type: Number, default: 60000},
    bounce_mail: {type: String},
    sla: {type: Number, default: 3600}
}, {id: false, versionKey: 'v'});

ServicesMailSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('ServiceMail').find({_id: ids}, function (error, svs) {
        if (!svs) {
            cb(error, 404);
        } else {
            _async.forEachOf(svs, function (sv, i, cb1) {
                mongoose.model('ServiceMail').remove({_id: sv._id}, cb1);
            }, function (err) {
                cb(err);
            })
        }
    });
};

ServicesMailSchema.plugin(require('mongoose-aggregate-paginate'));
ServicesMailSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('ServiceMail', ServicesMailSchema);

