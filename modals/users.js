var user_ternalLeaders = mongoose.Schema({
    ternal: {type: mongoose.Schema.Types.ObjectId, ref: 'Ternal'},
    role: {type: mongoose.Schema.Types.ObjectId, ref: 'Role'}
}, {_id: false});

var user_qaLeaders = mongoose.Schema({
    ternal: {type: mongoose.Schema.Types.ObjectId, ref: 'Ternal'},
    role: {type: mongoose.Schema.Types.ObjectId, ref: 'Role'}
}, {_id: false});

var user_qaMembers = mongoose.Schema({
    ternal: {type: mongoose.Schema.Types.ObjectId, ref: 'Ternal'},
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    role: {type: mongoose.Schema.Types.ObjectId, ref: 'Role'}
}, {_id: false});

var user_companyLeaders = mongoose.Schema({
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    role: {type: mongoose.Schema.Types.ObjectId, ref: 'Role'}
}, {_id: false});

var user_agentGroupLeaders = mongoose.Schema({
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'AgentGroups'},
    role: {type: mongoose.Schema.Types.ObjectId, ref: 'Role'}
}, {_id: false});

var user_agentGroupMembers = mongoose.Schema({
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'AgentGroups'},
    role: {type: mongoose.Schema.Types.ObjectId, ref: 'Role'}
}, {_id: false});


var UserSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true, unique: true},
    password: {type: String, required: true},
    displayName: {type: String, default: 'Người dùng'},
    email: {type: String, required: true},
    avatar: {type: String, default: '/assets/uploads/avatar/default.jpg'},
    accountCode: {type: String, required: true, unique: true},
    ternalLeaders: [user_ternalLeaders],
    qaLeaders: [user_qaLeaders],
    qaMembers: [user_qaMembers],
    companyLeaders: [user_companyLeaders],
    agentGroupLeaders: [user_agentGroupLeaders],
    agentGroupMembers: [user_agentGroupMembers],
    status: {type: Number, default: 1},
    role: {type: Number, default: 3},
    created: {type: Date, default: Date.now},
    maxChatSession: {type: Number, default: 10},
    notifVolumn: {type: Number, default: 0},// Âm thanh báo, từ 0 đến 100
    notifAdnim: {type: Number, default: 1},// Bật thông báo từ admin hay không, 0: không, 1: có
    notifAssign: {type: Number, default: 1},// Bật thông báo uỷ quyền: 0: không, 1: có
    notifDelay: {type: Number, default: 3600},
    notifDeadline: {type: Number, default: 3600000}, // Sắp đến hạn deadline, đơn vị thời gian tính theo millisecond
    mailNotification: {type: Number, default: 3600}, //giây
}, {id: false, versionKey: 'v'});

UserSchema.plugin(require('mongoose-aggregate-paginate'));
UserSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('User', UserSchema);