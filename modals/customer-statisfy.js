/**
 * Created by luongvanlam on 5/4/16.
 */
var CustomerStatisfyShema = new mongoose.Schema({
    name: {type: String, default: '', required: true, unique: true},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    createBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'}
}, {id: false, versionKey: 'v'});

CustomerStatisfyShema.plugin(require('mongoose-aggregate-paginate'));
CustomerStatisfyShema.set('toJSON', {getters: true});
module.exports = mongoose.model('CustomerStatisfy', CustomerStatisfyShema);

