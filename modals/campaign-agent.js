var CampaignAgentSchema = new mongoose.Schema({
    idAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, default: null},
    idCampaign: {type: mongoose.Schema.Types.ObjectId, ref: 'Campain', required: true, default: null},
    status: {type: Number, default: 1}
}, {id: false, versionKey: 'v'});

CampaignAgentSchema.set('toJSON', {getters: true});
CampaignAgentSchema.plugin(require('mongoose-aggregate-paginate'));
CampaignAgentSchema.index({idAgent: 1, idCampain: 1});
module.exports = mongoose.model('CampaignAgent', CampaignAgentSchema);

