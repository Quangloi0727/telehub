/**
 * Created by luongvanlam on 5/12/16.
 */
var CustomerStatisfyStageShema = new mongoose.Schema({
    idCustomerStatisfy : {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'CustomerStatisfy'},
    name: {type: String, default: '', required: true, unique: true},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    createBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'}
}, {id: false, versionKey: 'v'});

CustomerStatisfyStageShema.plugin(require('mongoose-aggregate-paginate'));
CustomerStatisfyStageShema.set('toJSON', {getters: true});
module.exports = mongoose.model('CustomerStatisfyStage', CustomerStatisfyStageShema);
