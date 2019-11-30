exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var sort = _.cleanSort(req.query, '');
        var aggregate = _Articles.aggregate();
        aggregate._pipeline = [{$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: 'author'}},
            {$lookup: {from: 'users', localField: 'updater', foreignField: '_id', as: 'updater'}}];
        aggregate._pipeline.push({$unwind: "$author"});
        aggregate._pipeline.push({$unwind: "$updater"});
        aggregate._pipeline.push({$unwind: "$category"});
        aggregate._pipeline.push({
            $lookup: {
                from: 'articlecategories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        });
        aggregate._pipeline.push({$unwind: "$category"});
        aggregate._pipeline.push({
            $group: {
                "_id": "$_id",
                "title": {$first: "$title"},
                "body": {$first: "$body"},
                "raw": {$first: "$raw"},
                "updater": {$first: "$updater"},
                "author": {$first: "$author"},
                "created": {$first: "$created"},
                "updated": {$first: "$updated"},
                "category": {"$push": "$category"}
            }
        });
        var _query = _.chain([{name: 'title', type: 1}, {
            name: 'raw',
            type: 1
        }, {name: 'category'}, {name: 'category-name', type: 1}, {name: 'author', type: 1}, {
            name: 'updater',
            type: 1
        }, {name: 'created', type: 6}, {name: 'group', type: 1}])
            .map(function (o) {
                if (_.isEqual(o.name, 'category')) {
                    return _.has(req.query, o.name) ? _.object(['category._id'], [new mongodb.ObjectId(req.query[o.name])]) : null;
                }
                else if (_.isEqual(o.name, 'author') || _.isEqual(o.name, 'updater')) {
                    return _.has(req.query, o.name) ? _.object([o.name + '.displayName'], [_.switchAgg(o.type, req.query[o.name])]) : null;
                }
                else if (_.isEqual(o.name, 'category-name') || _.isEqual(o.name, 'group')) {
                    return _.has(req.query, o.name) ? _.object(['category.group'], [_.switchAgg(o.type, req.query[o.name])]) : null;
                }
                else {
                    return _.has(req.query, o.name) ? _.object([o.name], [_.switchAgg(o.type, req.query[o.name])]) : null;
                }
            })
            .compact()
            .reduce(function (memo, item) {
                memo[_.keys(item)] = _.values(item)[0];
                return memo;
            }, {})
            .value();
        if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});
        if (!_.isEmpty(sort)) aggregate._pipeline.push({$sort: sort});
        _Articles.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, ar, pageCount, count) {
            var paginator = new pagination.SearchPaginator({
                prelink: '/articles',
                current: page,
                rowsPerPage: rows,
                totalResult: count
            });
            res.json({data: ar, paging: paginator.getPaginationData()});
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = {};
        _Articles
            .find(req.query)
            .sort(_.cleanSort(req.query))
            .paginate(page, rows, function (error, result, pageCount) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/articles',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: pageCount
                });
                _ArticlesCategory.find({}, function (err, r) {
                    _.render(req, res, 'articles', {
                        title: 'Danh sách bài viết',
                        articles: result,
                        category: r,
                        paging: paginator.getPaginationData(),
                        plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']]
                    }, true, error);
                })
            });
    }
}

exports.new = function (req, res) {
    _.render(req, res, 'articles-new', {
        title: 'Tạo mới bài viết',
        plugins: [['chosen'], ['bootstrap-select'], ['ckeditor'], 'fileinput']
    }, true);
};

exports.edit = function (req, res) {
    var aggregate = _Articles.aggregate();
    aggregate._pipeline = [{$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: 'author'}},
        {$lookup: {from: 'users', localField: 'updater', foreignField: '_id', as: 'updater'}}];
    aggregate._pipeline.push({$unwind: "$author"});
    aggregate._pipeline.push({$unwind: "$updater"});
    var _query = {_id: new mongodb.ObjectId(req.params.article)};
    if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});
    _Articles.aggregatePaginate(aggregate, {page: 1, limit: 10}, function (error, articles, pageCount, count) {
        _ArticlesCategory.populate(articles, {path: 'category', select: 'name group'}, function (err, newItems) {
            var attachments = [];
            /^win/.test(process.platform) ? _.each(newItems[0].attachments, function (obj) {
                attachments.push(obj.replace(/[\\]/g, "/"));
            }) : attachments = newItems[0].attachments;
            _.render(req, res, 'articles-edit', {
                title: 'Chỉnh sửa bài viết',
                articles: newItems[0],
                attachment: attachments,
                plugins: [['chosen'], ['bootstrap-select'], ['ckeditor'], 'fileinput']
            }, true);
        });
    });
};

exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.article, 'all')) {
        _Articles._deleteAll(req.params['article'], function (error) {
            fsx.remove(path.join(_rootPath, 'assets', 'attachment-files', req.params['article']), function (err) {
                if (err) console.log(129, err)
            });
            res.json({code: (error ? 500 : 200), message: error ? error : ""});
        });
    }
    else {
        _Articles._deleteAll(req.body.ids.split(','), function (error, ca) {
            _.each(req.body.ids.split(','), function (item) {
                fsx.remove(path.join(_rootPath, 'assets', 'attachment-files', item), function (err) {
                    if (err) console.log(139, err)
                });
            });
            res.json({code: (error ? 500 : 200), message: error ? error : ''});
        });
    }
};

exports.create = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    req.body['author'] = req.session.user._id;
    req.body['updater'] = req.session.user._id;
    if (_.has(req.body, 'category') && !_.isNull(req.body['category'])) {
        req.body['category'] = _.map(req.body['category'], function (ct) {
            return new mongodb.ObjectId(ct);
        });
    }
    req.body['raw'] = _.unescapeHTML(_.stripTags(req.body['body'])).replace(/\r?\n|\r|\t|\b|\f/g, "");
    _async.waterfall([
        function (cb1) {
            //Tạo bài viết
            _Articles.create(req.body, function (error, sk) {
                if (_.has(req, 'files') && req.files.length > 0) {
                    var attachment = [];
                    var filePath = path.join('assets', 'attachment-files', sk._id.toString());
                    _async.waterfall([
                        function (cb) {
                            //kiểm tra và tạo thư mực chung và thư mục riêng của bài viết
                            _async.eachSeries(req.files, function (files, callback) {
                                _async.waterfall([
                                    function (cb) {
                                        fsx.mkdirp(path.join(_rootPath, filePath, files.filename), function (err) {
                                            if (!err) cb(null, path.join(_rootPath, filePath, files.filename));
                                        })
                                    }, function (a, cb) {
                                        fsx.move(files.path, path.join(a, files.originalname), function (err) {
                                            if (!err) cb(null, 'ok');
                                        })
                                    }
                                ], function (err, result) {
                                    attachment.push(path.join(filePath, files.filename, files.originalname));
                                    callback();
                                })
                            }, function (err) {
                                cb(err, "ok");
                            })
                        },
                    ], function (err, result) {
                        _Articles.findByIdAndUpdate(sk._id, {$set: {attachments: attachment}}, function (err, r) {
                            cb1(error, sk);
                        })
                    })
                } else {
                    cb1(error, sk);
                }
                pushNoti("articles/" + sk._id);
            });
        },
        function (resp, cb2) {
            if (_.has(req.body, 'category') && !_.isNull(req.body['category'])) {
                //Tăng biến đếm số bài viết ở danh mục
                _async.each(resp.category, function (obj, cb) {
                    _ArticlesCategory.update({_id: obj}, {$inc: {"articleCount": 1}}, function (err, cat) {
                        cb();
                    });
                }, function (r) {
                    cb2(null, resp);
                });
            }
            else {
                cb2(null, resp);
            }
        }
    ], function (err, resp) {
        res.json({code: (err ? 500 : 200), message: err ? err : resp});
    });

};

exports.update = function (req, res) {
    if (req.body.delete) {
        _Articles.findById(req.params['article'], function (error, r) {
            var file = r.attachments[parseInt(req.body.delete)];
            _Articles.findByIdAndUpdate(req.params['article'], {$pull: {attachments: file}}, function (err, r) {
                if(!err){
                    fsx.unlink(path.join(_rootPath, file), function (err) {
                        res.json({code: (err ? 500 : 200), message: err ? err.message : "OK"});
                    });
                }else{
                    res.json({code: 500, message: err.message});
                }
            })
        })
    } else {
        var attachment = [];
        var list = [];
        var attachments = [];
        if (req.body.attachment) {
            _.each(req.body.attachment, function (o) {
                if (o != "") attachment.push(parseInt(o));
            })
        }
        if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
        //req.body['status'] = _.has(req.body,'status') ? req.body['status'] : 0;
        req.body['updater'] = req.session.user._id;
        req.body['updated'] = _moment()._d;
        req.body['category'] = _.map(req.body['category'], function (ct) {
            return new mongodb.ObjectId(ct);
        });
        req.body['raw'] = _.unescapeHTML(_.stripTags(req.body['body'])).replace(/\r?\n|\r|\t|\b|\f/g, "");
        _async.waterfall([
            function (next) {
                _Articles.findById(req.params['article'], function (error, ca) {
                    _.each(ca.category, function (obj, i) {
                        _ArticlesCategory.update({_id: obj}, {$inc: {"articleCount": -1}}, function (err, resp) {
                        });
                    });
                    next(error);
                });
            },
            function (next) {
                _Articles.findByIdAndUpdate(req.params['article'], req.body, {new: true}, function (error, ca) {
                    _.each(ca.category, function (obj, i) {
                        _ArticlesCategory.update({_id: obj}, {$inc: {"articleCount": 1}}, function (err, r) {
                        });
                    });
                    attachments = ca.attachments;
                    next(error, ca);
                });
            },
            function (ca, next) {
                if (_.has(req, 'files') && req.files.length > 0) {
                    var filePath = path.join('assets', 'attachment-files', req.params['article']);
                    var items = [];
                    _async.waterfall([
                        function (cb) {
                            _async.eachSeries(req.files, function (files, callback) {
                                _async.waterfall([
                                    function (cb) {
                                        fsx.mkdirp(path.join(_rootPath, filePath, files.filename), function (err) {
                                            cb(err, path.join(_rootPath, filePath, files.filename));
                                        })
                                    }, function (a, cb) {
                                        fsx.move(files.path, path.join(a, files.originalname), function (err) {
                                            cb(err);
                                        })
                                    }
                                ], function (err) {
                                    items.push(path.join(filePath, files.filename, files.originalname));
                                    callback(err);
                                })
                            }, function (err) {
                                for(var i = 0;i<items.length;i++){
                                    list.push({item:items[i], pos:attachment[i]});
                                }
                                cb(err);
                            })
                        }, function (cb) {
                            _async.each(attachment, function(item, callback){
                                _Articles.findByIdAndUpdate(req.params['article'], {$pull: {attachments: attachments.length >= item+1 ? attachments[item] : ""}}, function (err, r) {
                                    if(attachments.length >= item+1){
                                        fsx.unlink(path.join(_rootPath, attachments[item]), function (err) {
                                            callback(err);
                                        });
                                    }else{
                                        callback(err);
                                    }
                                })
                            },function(err){
                                cb(err);
                            })
                        }
                    ], function (err) {
                        _.each(list, function(o){
                            attachments.splice(o.pos, 1, o.item)
                        });
                        _Articles.findByIdAndUpdate(req.params['article'], {$set:{attachments:attachments}}, function (err, r) {
                            next(err);
                        })
                    })
                } else {
                    next(null);
                }
            }
        ], function (err) {
            res.json({code: (err ? 500 : 200), message: err ? err.message : "OK"});
        });
    }
};

exports.show = function (req, res) {
    _Articles
        .findById(new mongodb.ObjectId(req.params.article), function (err, result) {
            var attachments = [];
            /^win/.test(process.platform) ? _.each(result.attachments, function (obj) {
                attachments.push(obj.replace(/[\\]/g, "/"));
            }) : attachments = result.attachments;
            _.render(req, res, 'articles-view', {
                title: result.title,
                body: result.body,
                attachments: attachments
            }, true, err);
        });
};
var pushNoti = function (url) {
    _Users.distinct("_id", {}, function (err, r) {
        _.each(r, function (o) {
            _.pushNotification(3, url, o);
        });
    });
};