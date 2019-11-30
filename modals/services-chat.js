var ServicesChatSchema = new mongoose.Schema({
    name: {type: String, required: true},
    idChannel: {type: mongoose.Schema.Types.ObjectId, ref: 'CompanyChannel', required: true},
    idSkill: {type: mongoose.Schema.Types.ObjectId, ref: 'SkillChat'},
    routeChat: {type: Number, required: true},
    lowAlert: {type: Number, default: 5},
    highAlert: {type: Number, default: 10},
    SLA: {type: Number, default: 100},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date}
}, {id: false, versionKey: 'v'});

ServicesChatSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('ServicesChat').find({_id: ids}, function (error, svs) {
        if (!svs) {
            cb(error, 404);
        }else{
            _async.forEachOf(svs, function(sv, i, cb1){
                mongoose.model('ServicesChat').remove({_id: sv._id}, cb1);
            }, function (err) {
                cb(err);
            })
        }
    });
};

ServicesChatSchema.set('toJSON', {getters: true});
ServicesChatSchema.index({name:1, idCompany:1},{unique:true});
module.exports = mongoose.model('ServiceChat', ServicesChatSchema);

