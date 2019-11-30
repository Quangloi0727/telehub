/**
 * Created by NghiaTM on 2/26/2016.
 */

var AgentStatusShema = new mongoose.Schema({
    name: {type: String, default: '', required: true, unique: true},
    status: {type: Number, default: 1},
    statusCode: {type: Number, required: true, unique: true},//mã trạng thái
    isDefault: {type: Number, default: 0},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    createBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, default: null, ref: 'User'}
}, {id: false, versionKey: 'v'});

AgentStatusShema.set('toJSON', {getters: true});
module.exports = mongoose.model('AgentStatus', AgentStatusShema);

