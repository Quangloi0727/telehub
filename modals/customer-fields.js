var CustomerFieldsSchema = new mongoose.Schema({
    displayName: {type: String, required: true},
    modalName: {type: String, required: true},
    fieldType: {type: Number, required: true, default: 1}, // 1 : textfield, 2 : number, 3 : textarea, 4 : list multi, 5 : list single, 6 : date
    fieldValue: {type: Array, default: []},
    isDefault: {type: Number, default: 1},
    isRequired: {type: Number, default: 0}, // 0 : false,  1 : true
    displayWidth: {type: Number, default: 150},
    weight: {type: Number, default: 0},
    status: {type: Number, default: 1} // 0 : false,  1 : true
}, {id: false, versionKey: 'v'});

CustomerFieldsSchema.index({modalName: 1}, {unique: true});
CustomerFieldsSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('CustomerFields', CustomerFieldsSchema);