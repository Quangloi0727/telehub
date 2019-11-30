var ArticleCategorySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    group: {type: String, required: true},
    articleCount: {type: Number, default: 0},
    description: {type: String, default: ''},
    status: {type: Number, default: 1}
}, {id: false, versionKey: 'v'});

ArticleCategorySchema.statics._deleteAll = function (ids, cb) {
    mongoose.model('ArticleCategory').find({_id: ids}, function (error, ss) {
        if (!ss) {
            cb(error, 404);
        }else{
            _async.forEachOf(ss, function(s, i, cb1){
                mongoose.model('Article').find({
                    category: s._id
                }, function(err2, articles){
                    _async.waterfall([
                        function(cb2){
                            _async.each(articles, function(article, callback){
                                for (var c = 0; c < article.category.length; c++){
                                    if (_.isEqual(article.category[c], s._id)){
                                        article.category.remove(article.category[c]);
                                        article.save();
                                        callback();
                                    }
                                }
                            }, function(err, resp){
                                cb2(null);
                            });
                        }
                    ], function(err, result){
                        mongoose.model('ArticleCategory').remove({_id: s._id}, cb1);
                    });
                });
            }, function (err) {
                cb(err);
            })
        }
    });

};

ArticleCategorySchema.set('toJSON', {getters: true});
module.exports = mongoose.model('ArticleCategory', ArticleCategorySchema);