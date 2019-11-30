/**
 * Created by luongvanlam on 5/19/16.
 */
var KPIMarkCollectionShema = new mongoose.Schema({
    name: {type: String, default: '', required: true, unique: true},
    status: {type: Number, default: 1},
    type: {type: Number, default: 0}, // 0: voice, 1: chat, 2: email
    created: {type: Date, default: Date.now},
    updated: {type: Date},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {id: false, versionKey: 'v'});

KPIMarkCollectionShema.plugin(require('mongoose-aggregate-paginate'));
KPIMarkCollectionShema.set('toJSON', {getters: true});
module.exports = mongoose.model('KPIMarkCollection', KPIMarkCollectionShema);