/**
 * Created by luongvanlam on 2/2/16.
 */
var CompanySchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    createBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref : 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref : 'User'},
    companyProfile : {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'CompanyProfile'},
    recipeSLA: {type: Number},
    recipeSLAChat: {type: Number},
    recipeSLAMail: {type: Number},
}, {id: false, versionKey: 'v'});

CompanySchema.plugin(require('mongoose-aggregate-paginate'));
CompanySchema.set('toObject', {getters: true});
CompanySchema.set('toJSON', {getters: true});

CompanySchema.statics._remove = function (ids, userId, callback) {
    mongoose.model('Company').remove({_id: {$in: ids}}, function (error, companies) {
        _async.parallel({
            agentGroups : function(callback){
                mongoose.model('AgentGroups').update({idParent: {$in: ids}},
                    {$set: {idParent: null}},
                    {multi: true},
                    callback);
            },
            services : function (callback) {
                mongoose.model('Service').update({idCompany: {$in: ids}},
                    {$set: {idCompany: null}},
                    {multi: true},
                    callback);
            },
            campaign : function (callback) {
                mongoose.model('Campain').update({idCompany: {$in: ids}},
                    {$set: {idCompany: null}},
                    {multi: true},
                    callback);
            },
            users : function(callback){
                mongoose.model('User').update({'companyLeaders.company' : {$in: ids}},
                    {$pull : {companyLeaders : {company: {$in : ids}}}},
                    callback);
            }
        }, callback);
    });
};

module.exports = mongoose.model('Company', CompanySchema);

