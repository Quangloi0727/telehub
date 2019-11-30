var ServicesSchema = new mongoose.Schema({
    name: {type: String, required: true},
    queueNumber: {type: Number, default: 0},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, default: null},
	idSurvey: {type: mongoose.Schema.Types.ObjectId, ref: 'Survey', default: null},
    idSkill: {type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null},
    routeCall: {type: Number, required: true, default: 0},
    rule: {type: Number, required: true, default: 0},
    maxWaitTime: {type: Number, required: true, default: 10},
    waitTimeCancel: {type: Number, required: true, default: 2},
    serviceType: {type: Number, required: true, default: 0},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    recipeSLA: {type: Number}
}, {id: false, versionKey: 'v'});

ServicesSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('Service').find({_id: ids}, function (error, svs) {
        if (!svs) {
            cb(error, 404);
        } else {
            var _delete = [];
            var _error = [];
            _async.forEachOf(svs, function (sv, i, cb1) {
                mongoose.model('Ticket').findOne({idService: sv._id}, function(err, result){
                    if(result){
                        _error.push(sv._id);
                    }else {
                        _delete.push(sv._id);
                    }
                    cb1(err);
                });
            }, function (err) {
                if(err) {
                    cb(err, []);
                }else {
                    mongoose.model('Service').remove({_id: {$in: _delete}}, function(err2, result){
                        cb(err2, _error);
                    });
                }
            })
        }
    });
};

ServicesSchema.set('toJSON', {getters: true});
ServicesSchema.index({name: 1, idCompany: 1}, {unique: true});
module.exports = mongoose.model('Service', ServicesSchema);

