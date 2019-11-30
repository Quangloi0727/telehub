/**
 * Created by NghiaTM on 4/6/2016.
 */


var MailSettingSchema = new mongoose.Schema({
    name:{type: String, required:true},
    send_host : {type: String, default: null},
    send_port : {type: Number, default: null},
    send_user : {type: String, default: null},
    send_pass : {type: String, default: null},
    send_sercure :{type: Number, default: 0},
    send_protocol : {type: Number, default: 1},
    send_limit : {type: Number, default: 0},
    receive_host : {type: String, default: null},
    receive_port : {type: Number, default: null},
    receive_protocol : {type: Number, default: 1},
    receive_user : {type: String, default: null},
    receive_pass : {type: String, default: null},
    receive_sercure : {type: Number, default: 0},
    receive_delay : {type: Number, default: 60000},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v', collection: 'mailservices'});



//ServicesMailSchema.plugin(require('mongoose-aggregate-paginate'));
MailSettingSchema.set('toJSON', {getters: true});
//ServicesMailSchema.index({name:1, idCompany:1},{unique:true});
module.exports = mongoose.model('MailSetting', MailSettingSchema);

