var ChatThreadSchema = new mongoose.Schema({
    agentId: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true}],
    agentMessage: {type: mongoose.Schema.Types.Mixed, default: []},
    /*agentMessage:
        [
            {_id: "123123123", send: 1, receive: 10, response: 20},
            {_id: "123123123" , send: 0, receive : 2, response: 0}
    ],*/
    customerId: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true},
    clientId: {type: String, required: true}, //ip + channel + service + cookie
    channelId: {type: mongoose.Schema.Types.ObjectId, ref: 'CompanyChannel', index: true},
    country: {type: String, default: ''},
    region: {type: String, default: ''},
    created: {type: Date, default: Date.now, index: true},
    status: {type: Number, default: 1, index: true}, //0: closed, 1: open
    chatTag: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChatTag', index: true}],
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});
ChatThreadSchema.plugin(require('mongoose-aggregate-paginate'));
ChatThreadSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('ChatThread', ChatThreadSchema);

