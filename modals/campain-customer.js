var CampainCustomerSchema = new mongoose.Schema({
    idCustomer: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, default: null},
    idCampain: {type: mongoose.Schema.Types.ObjectId, ref: 'Campain', required: true, default: null},
    createBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'},
    status: {type: Number, default: 1},
    retry: {type: Number, default: 0},
    retryTime : {type: Date, default: Date.now},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});


CampainCustomerSchema.set('toJSON', {getters: true});
CampainCustomerSchema.plugin(require('mongoose-aggregate-paginate'));
// DUONGNB: Remove index for Akira
// CampainCustomerSchema.index({idCustomer: 1, idCampain: 1}, {unique: true});
module.exports = mongoose.model('CampainCustomer', CampainCustomerSchema);

