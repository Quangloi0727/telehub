exports.index = {
    json: function (req, res) {
        var query = {};
        if (_.has(req.query, 'group') && !_.isEqual(req.query.group, 'desc') && !_.isEqual(req.query.group, 'asc')) {
            query.group = {$regex: new RegExp(_.stringRegex(req.query.group), 'i')};
        }
        _ArticlesCategory.find(query).exec(function (error, category) {
            res.status(200).json(category);
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = {};

        if (_.has(req.query, 'name') && !_.isEqual(req.query.name, 'desc') && !_.isEqual(req.query.name, 'asc')) {
            query.name = {$regex: new RegExp(_.stringRegex(req.query.name), 'i')};
        }

        if (_.has(req.query, 'status')) {
            query.status = Number(req.query.status);//{$regex: new RegExp(_.stringRegex(req.query.status), 'i')};
        }


        _ArticlesCategory
            .find(query)
            .paginate(page, rows, function (error, category, total) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/articles-category',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: total
                });
                _.render(req, res, 'articles-category', {
                    title: 'Danh sách danh mục',
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']],
                    categories: category,
                    paging: paginator.getPaginationData()
                }, true, error);
            });
    }
}

exports.new = function (req, res) {
    _.render(req, res, 'articles-category-new', {title: 'Tạo mới danh mục', plugins: [['bootstrap-select']]}, true);
};

exports.create = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    _ArticlesCategory.create(req.body, function (error, ca) {
        res.json({code: (error ? 500 : 200), message: error ? error : ca});
    });
};

exports.edit = function (req, res) {
    _ArticlesCategory.distinct('group', function (err, group) {
        _ArticlesCategory.findById(req.params['articlescategory'], function (err, cat) {
            _.render(req, res, 'articles-category-edit', {
                title: 'Sửa đổi danh mục',
                plugins: [['bootstrap-select']],
                category: cat,
                group: group
            }, true);
        });
    })
};

exports.update = function (req, res) {
    if (_.has(req.body, 'status') && _.isEqual(req.body['status'], 'on')) req.body['status'] = 1;
    _ArticlesCategory.findByIdAndUpdate(req.params['articlescategory'], req.body, {new: true}, function (error, ca) {
        res.json({code: (error ? 500 : 200), message: error ? error : ca});
    });
};

exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value();
    if (_.has(_query, 'x-' + _.cleanValidateKey(req.query.fieldId)) && _.isEqual(_query[_.cleanValidateKey(req.query.fieldId)], _query['x-' + _.cleanValidateKey(req.query.fieldId)])) {
        res.json([req.query.fieldId, true]);
    } else {
        delete _query['x-' + _.cleanValidateKey(req.query.fieldId)];
        _ArticlesCategory.findOne(_query).exec(function (error, f) {
            res.json([req.query.fieldId, _.isNull(f)]);
        });
    }
};

exports.destroy = function (req, res) {
//    _ArticlesCategory._deleteAll({$in:req.params['articlescategory']}, function (error) {
//        res.json({code: (error ? 500 : 200), message: error ? error :""});
//    });

    if (!_.isEqual(req.params.articlescategory, 'all')) {
        _ArticlesCategory._deleteAll({$in: req.params['articlescategory']}, function (error) {
            _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ""});
        });
    }
    else {
        _ArticlesCategory._deleteAll({$in: req.body.ids.split(',')}, function (error, ca) {
            _.genTree();
            res.json({code: (error ? 500 : 200), message: error ? error : ''});
        });
    }
};
