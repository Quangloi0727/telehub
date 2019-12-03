var max_Allowed = mongoose.Schema({
    fieldType: {type:Number},
    fieldModel: {type:String},
    fieldName:{type:String},
    fieldValue:{type:Number}
}, {_id: false});
var time_Frame = mongoose.Schema({
    fieldType: {type:Number},
    fieldModel: {type:String},
    fieldName:{type:String},
    fieldValue:{type:Array}
}, {_id: false});
var AppointmentconfigSchema = new mongoose.Schema({
   maxAllowed:[max_Allowed],
   timeFrame:[time_Frame]
},{id: false, versionKey: 'v'});


AppointmentconfigSchema.plugin(require('mongoose-aggregate-paginate'));
AppointmentconfigSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('Appointmentconfigs', AppointmentconfigSchema);
