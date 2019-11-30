/**
 * Created by sonth on 13/01/2016.
 */

var ServiceAddressSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true, unique: true},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

ServiceAddressSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('ServiceAddress', ServiceAddressSchema);