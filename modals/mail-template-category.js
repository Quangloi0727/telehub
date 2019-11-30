/**
 * Created by NghiaTM on 4/19/2016.
 */


var MailTemplateCategorySchema = new mongoose.Schema({
    name:{type: String, required:true},
    companyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v', collection: 'mailtemplatecategories'});



//ServicesMailSchema.plugin(require('mongoose-aggregate-paginate'));
MailTemplateCategorySchema.set('toJSON', {getters: true});
//ServicesMailSchema.index({name:1, idCompany:1},{unique:true});
module.exports = mongoose.model('MailTemplateCategory', MailTemplateCategorySchema);
