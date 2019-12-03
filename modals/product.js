var ProductSchema = new mongoose.Schema({
    name: {type: String,required:true},
    price: {type: Number,required:true},
    description: {type: String,required:true},
    images: [{type: String}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updater:{type: String}
},{id: false, versionKey: 'v'});

// ProductSchema.statics._deleteAll = function (id, callback) {
//     mongoose.model('Product').find({_id:{$in:id}}, function (error, article) {
//         if (error) return error;
//         _async.waterfall([
//             function(cb){
//                 _.each(product, function(obj, i){
//                     _.each(obj.category, function(obj,i){
//                         mongoose.model('ArticleCategory').update({_id: obj}, {$inc: {"articleCount": -1}}, function(err, r){
//                             cb(err, r);
//                         });
//                     });
//                 });
//             }
//         ], function(err, resp){
//             if(!err){
//                 mongoose.model('Article').remove({_id:{$in:id}}, callback);
//             }else{
//                 callback(err)
//             }
//         });
//     });
// };

ProductSchema.plugin(require('mongoose-aggregate-paginate'));
ProductSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('product', ProductSchema);
