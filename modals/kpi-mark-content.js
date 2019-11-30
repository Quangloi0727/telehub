/**
 * Created by luongvanlam on 5/19/16.
 */
var KPIMarkContentSchema = new mongoose.Schema({
    idCollection : {type: mongoose.Schema.Types.ObjectId, ref: 'KPIMarkCollection', required: true},
    name: {type: String, default: '', required: true},
    modalName: {type: String, default: '', required: true},
    type: {type: Number, default: 0}, // 0: Chấm điểm, 1: Chọn đáp án, 2: Nhập function tính toán
    content: {type: Array, default: []},
    contentBase64: {type: String, default: ''},

        // Với type: 0
        //      content[0] = min Value, content[1] = max value
        // Type: 1
        //      Array các lựa chọn
        // Type: 2
        //      content[0] = string of function
    weight: {type: Number, default: 1},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date},
    createBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {id: false, versionKey: 'v'});

KPIMarkContentSchema.plugin(require('mongoose-aggregate-paginate'));
KPIMarkContentSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('KPIMarkContent', KPIMarkContentSchema);