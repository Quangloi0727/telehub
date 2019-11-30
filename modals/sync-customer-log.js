/**
 * Created by baygiomoidc on 06/16/2016.
 */

var SyncCustomerLogSchema = new mongoose.Schema({
    name: {type: String},
    type: {type: Number, default: 1}, // 1: Đồng bộ; 2: Tải về
    createBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'},
    filterId : {type: String},
    query: {type: mongoose.Schema.Types.Mixed, default: {}},
    packageSize: {type: Number, default: 10},
    total: {type: Number, default: 0},
    current: {type: Number, default: 0},
    flag: {type: String, default: null},
    source: {type: mongoose.Schema.Types.ObjectId, ref: 'CustomerSource', default: null},
    sessionId : {type: String},
    status: {type: Number, default: 0},
    created: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

SyncCustomerLogSchema.set('toJSON', {getters: true});
SyncCustomerLogSchema.plugin(require('mongoose-aggregate-paginate'));
module.exports = mongoose.model('SyncCustomerLog', SyncCustomerLogSchema);