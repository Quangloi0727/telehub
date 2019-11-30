/**
 * Created by NghiaTM on 4/19/2016.
 */


var MailTemplateSchema = new mongoose.Schema({
    name:{type: String, required:true},
    body:{type: String, required:true},
    categoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'MailTemplateCategory'},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v', collection: 'mailtemplates'});



MailTemplateSchema.plugin(require('mongoose-aggregate-paginate'));
MailTemplateSchema.set('toJSON', {getters: true});
//ServicesMailSchema.index({name:1, idCompany:1},{unique:true});
module.exports = mongoose.model('MailTemplate', MailTemplateSchema);
