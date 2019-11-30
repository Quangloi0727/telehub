var NotificationSchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    url: { type: String, default: '' }, //url trang con
    title: { type: String, default: '' },
    msg: { type: String, default: ''},
    status: { type: Number, default: 0 }, //0: chýa ðoc, 1: da doc
    //type: 
    //0: Nhac ticket den han xu ly
    //1: Ticket ðýoc uy quyen
    //2: Ðýoc assign vào 1 nhóm agent
    //3: Có tin bài moi
    type: { type: Number, require: true}, 
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

NotificationSchema.plugin(require('mongoose-aggregate-paginate'));
NotificationSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('Notification', NotificationSchema);
