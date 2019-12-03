const fs = require('fs')
exports.index = {
    // json: function (req, res) {
    //     var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    //     var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
    //     var sort = _.cleanSort(req.query, '');
    //     var aggregate = _Product.aggregate();
    //     aggregate._pipeline = [{$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: 'author'}},
    //         {$lookup: {from: 'users', localField: 'updater', foreignField: '_id', as: 'updater'}}];
    //     aggregate._pipeline.push({$unwind: "$author"});
    //     aggregate._pipeline.push({$unwind: "$updater"});
    //     aggregate._pipeline.push({$unwind: "$category"});
    //     aggregate._pipeline.push({
    //         $lookup: {
    //             from: 'articlecategories',
    //             localField: 'category',
    //             foreignField: '_id',
    //             as: 'category'
    //         }
    //     });
    //     aggregate._pipeline.push({$unwind: "$category"});
    //     aggregate._pipeline.push({
    //         $group: {
    //             "_id": "$_id",
    //             "title": {$first: "$title"},
    //             "body": {$first: "$body"},
    //             "raw": {$first: "$raw"},
    //             "updater": {$first: "$updater"},
    //             "author": {$first: "$author"},
    //             "created": {$first: "$created"},
    //             "updated": {$first: "$updated"},
    //             "category": {"$push": "$category"}
    //         }
    //     });
    //     var _query = _.chain([{name: 'title', type: 1}, {
    //         name: 'raw',
    //         type: 1
    //     }, {name: 'category'}, {name: 'category-name', type: 1}, {name: 'author', type: 1}, {
    //         name: 'updater',
    //         type: 1
    //     }, {name: 'created', type: 6}, {name: 'group', type: 1}])
    //         .map(function (o) {
    //             if (_.isEqual(o.name, 'category')) {
    //                 return _.has(req.query, o.name) ? _.object(['category._id'], [new mongodb.ObjectId(req.query[o.name])]) : null;
    //             }
    //             else if (_.isEqual(o.name, 'author') || _.isEqual(o.name, 'updater')) {
    //                 return _.has(req.query, o.name) ? _.object([o.name + '.displayName'], [_.switchAgg(o.type, req.query[o.name])]) : null;
    //             }
    //             else if (_.isEqual(o.name, 'category-name') || _.isEqual(o.name, 'group')) {
    //                 return _.has(req.query, o.name) ? _.object(['category.group'], [_.switchAgg(o.type, req.query[o.name])]) : null;
    //             }
    //             else {
    //                 return _.has(req.query, o.name) ? _.object([o.name], [_.switchAgg(o.type, req.query[o.name])]) : null;
    //             }
    //         })
    //         .compact()
    //         .reduce(function (memo, item) {
    //             memo[_.keys(item)] = _.values(item)[0];
    //             return memo;
    //         }, {})
    //         .value();
    //     if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: {$and: [_query]}});
    //     if (!_.isEmpty(sort)) aggregate._pipeline.push({$sort: sort});
    //     _Product.aggregatePaginate(aggregate, {page: page, limit: rows}, function (error, ar, pageCount, count) {
    //         var paginator = new pagination.SearchPaginator({
    //             prelink: '/product',
    //             current: page,
    //             rowsPerPage: rows,
    //             totalResult: count
    //         });
    //         res.json({data: ar, paging: paginator.getPaginationData()});
    //     });
    // },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = {};
        _Product
            .find(req.query)
            .sort(_.cleanSort(req.query))
            .paginate(page, rows, function (error, result, pageCount) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/product',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: pageCount
                });
                _Product.find({}, function (err, product) {
                    _Users.find({},function(e,u){
                        _.render(req, res, 'product', {
                            title: 'Danh sách sản phẩm',
                            product: product,
                            user:u,
                            paging: paginator.getPaginationData(),
                            plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']]
                        }, true, error);
                    })
                })
            });
        }
    }
exports.show = function (req, res) {
    _Product
        .findById((req.params.product), function (err, result) {
            _.render(req, res, 'product-detail', {
                title:"Chi tiết sản phẩm",
                product: result,
                plugins: [['bootstrap-select']]
            }, true, err);
        });
    };
exports.destroy=function (req,res) {
    _Product.findByIdAndRemove(req.params.product).exec();
    res.redirect('/#product');
}
exports.new = function (req, res) {
    _.render(req, res, 'product-new', {
        title: 'Tạo mới sản phẩm',
        plugins: [['chosen'], ['bootstrap-select'], ['ckeditor'], 'fileinput']
    }, true);
};
exports.edit = function (req, res) {
    _Product.findById(req.params.product).then(result => {
        _.render(req, res, 'product-edit', {
            title:'Sửa thông tin sản phẩm',
            product: result,
            plugins: [['bootstrap-select']]
        }, true)
    })
}
exports.create =function (req, res) {
    const img_product = []
    for (let i = 0; i < req.files.length; i++) {
        const destination = req.files[i].destination
        const imageName = req.files[i].path.split('\\').pop()
        const fileExtension = req.files[i].originalname.split('.').pop()
        img_product.push(imageName + '.' + fileExtension)
        fs.renameSync(req.files[i].path, path.join(destination, '../assets/images/product/') + imageName + '.' + fileExtension)
    } 
    const product= new _Product(req.body);
    product.images=img_product;
    product.author=req.session.user._id;
    product.save();
    res.redirect('/product');
};
exports.update = function (req, res) {
    _Product.findByIdAndUpdate(req.params['product'], req.body, {new: true}, function (error, ca) {
        res.json({code: (error ? 500 : 200), message: error ? error : ca});
    });
};

