var ArticleSchema = new mongoose.Schema({
    title: {type: String, required: true},
    body: {type: String, default: ''},
    raw: {type: String, default: ''},
    images: {type: String, default: '/'},
    attachments: [{type: String, default: '/'}],
    category: [{type: mongoose.Schema.Types.ObjectId, ref: 'ArticleCategory'}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    updater: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    priority: {type: Number, default: 0},
    status: {type: Number, default: 1},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now}
}, {id: false, versionKey: 'v'});

ArticleSchema.statics._deleteAll = function (id, callback) {
    mongoose.model('Article').find({_id:{$in:id}}, function (error, article) {
        if (error) return error;
        _async.waterfall([
            function(cb){
                _.each(article, function(obj, i){
                    _.each(obj.category, function(obj,i){
                        mongoose.model('ArticleCategory').update({_id: obj}, {$inc: {"articleCount": -1}}, function(err, r){
                            cb(err, r);
                        });
                    });
                });
            }
        ], function(err, resp){
            if(!err){
                mongoose.model('Article').remove({_id:{$in:id}}, callback);
            }else{
                callback(err)
            }
        });
    });
};

ArticleSchema.plugin(require('mongoose-aggregate-paginate'));
ArticleSchema.set('toJSON', {getters: true});
module.exports = mongoose.model('Article', ArticleSchema);
