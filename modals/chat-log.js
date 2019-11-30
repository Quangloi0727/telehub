var ChatLogSchema = new mongoose.Schema({
    threadId: {type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', required: true, index: true},
    content: {type: String, default: ''},
    attachment: [
        {
            url: {type: String},
            fileName: {type: String}
        }
    ],
    sentFrom: {
        from: {type: Number, default: 0}, //0: agent, 1: customer, 2: system
        id: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null}, //from id
        to: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null} //to id
    },
    status: {type: Number, default: 0, index: true}, //0: new (bỏ lỡ), 1: old (đã rep), 2: offline
    created: {type: Date, default: Date.now, index: true},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'}).index({
        'content': 'text'
    });
ChatLogSchema.plugin(require('mongoose-aggregate-paginate'));
ChatLogSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('ChatLog', ChatLogSchema);