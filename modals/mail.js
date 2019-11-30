/**
 * Created by MrBlack on 4/8/2016.
 */
var MailSchema = new mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, default: ''},
    subject: {type: String, default: ''},
    subject_raw: {type: String, default: ''},
    body: {type: String, default: ''},
    body_raw: {type: String, default: ''},
    status: {type: Number, default: 1}, // 0: chưa xử lý, 1: yêu cầu gửi, 2: đang xử lý gửi, 3: thành công, 4: thất bại, 5: not matched, 6: not have skill group
    mail_status: {type: Number, default: 0}, //0: default, 1: progressing, 2: done
    err_message: {type: String, default: ''},
    created: {type: Date, default: Date.now()},
    process_date: {type: Date, default: null}, // Ngày xử lý
    attachments: [{type: String}],
    mail_type: {type: Number, default: 1}, // 1: gửi, 2: nhận
    agent: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    campaign: {type: mongoose.Schema.Types.ObjectId, ref: 'MailCampaigns', index: true, default: null},
    response_time: {type: Number, default: 0},
    sendDate: {type: Date, default: null},
    service: {type: mongoose.Schema.Types.ObjectId, ref: 'ServiceMail'},
    replyTo: {type: mongoose.Schema.Types.ObjectId, ref: 'Mail'},
    readed: {type: Number, default: 0} //0 : chưa đọc, 1 : đã đọc
}, {id: false, versionKey: 'v'});
MailSchema.index({from: 'text', to: 'text', subject: 'text', body: 'text'}, {name: 'Mail index', weights: {subject: 10, body: 4, from: 2, to: 1}});
MailSchema.plugin(require('mongoose-aggregate-paginate'));
MailSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('Mail', MailSchema);