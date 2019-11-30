var CampainsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    note: {type: String},
    idCompany: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true},
    idSurvey: {type: mongoose.Schema.Types.ObjectId, ref: 'Survey'},
    idCampainParent: {type: mongoose.Schema.Types.ObjectId, ref: 'Campain'},
    idCategoryReason : {type: mongoose.Schema.Types.ObjectId, ref: 'TicketReasonCategory'},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    trunk: {type: mongoose.Schema.Types.ObjectId, ref: 'Trunk'},
    type: {type: Number},
    delayTime: {type: Number, default: 0},
    retry: {type: Number, default: 0},
    retryTime: {type: Number, default: 0},
    autoDialingStatus: {type: Number, default: 0},
    agents: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],


    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date}
}, {id: false, versionKey: 'v'});

CampainsSchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('Campain').find({_id: ids}, function (error, cps) {
        if (!cps) {
            cb(error, 404);
        }else{
            _async.forEachOf(cps, function(cp, i, cb1){
                mongoose.model('Campain').remove({_id: cp._id}, cb1);
            }, function (err) {
                cb(err);
            })
        }
    });
};

CampainsSchema.set('toJSON', {getters: true});
CampainsSchema.plugin(require('mongoose-aggregate-paginate'));
CampainsSchema.index({name:1, idCompany:1},{unique:true});
module.exports = mongoose.model('Campain', CampainsSchema);

