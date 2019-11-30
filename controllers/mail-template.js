/**
 * Created by NghiaTM on 4/19/2016.
 */


exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        log.debug(req.query);
        //log.debug(req.session);

        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'status')) {
            req.query.status = parseInt(req.query.status);
            if (req.query.status > 1) delete req.query.status;
        }

        var sortCondition = {};
        if (_.has(req.query, 'sort')) {
            var stringArr = req.query.sort.split(':');

            sortCondition[stringArr[0]] = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
            var sortObj = {$sort: sortCondition};
        }
        if(_.has(req.query, 'name')){
            req.query.name= {$regex: new RegExp(_.stringRegex(req.query.name))};
        }
        if (_.has(req.query, 'categoryId')) {
            req.query.categoryId = new mongoose.Types.ObjectId(req.query.categoryId);
        }
        var companyId= {};
        if(_.has(req.query, 'companyId')){
            companyId['category.companyId']=  new mongoose.Types.ObjectId(req.query.companyId);
            delete req.query.companyId;
        }
        req.query = _.cleanRequest(req.query);
        log.debug(req.query);
        log.debug(companyId);
        _async.parallel([
            function (callback) {
                _Company.find({status: 1}, function (err, companies) {
                    callback(err, companies);
                });
            },
            function (callback) {
                _MailTemplateCategory.find({status: 1}, function (err, categories) {
                    callback(err, categories);
                });
            }
        ], function (err, result) {
            var companies = result[0];
            var categories = result[1];
            //_MailTemplate
            //    .find(req.query)
            //    .paginate(page, rows, function (error, templates, pageCount) {
            //        var paginator = new pagination.SearchPaginator({prelink: '/mail-template', current: page, rowsPerPage: rows, totalResult: pageCount});
            //        _.render(req, res, 'mail-template', {title: 'Quản lý mail template',
            //            mailTemplates: templates,
            //            companies: companies,
            //            categories: categories,
            //            paging: paginator.getPaginationData(),
            //            plugins: ['moment', ['bootstrap-select']]}, true, error);
            //    });

            var agg = _MailTemplate.aggregate([
                {$match: req.query},
                {
                    $lookup: {
                        from: 'mailtemplatecategories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {$unwind: {path: '$category', preserveNullAndEmptyArrays: true}},
                {$match: companyId},
                {$lookup: {from: 'companies', localField: 'category.companyId', foreignField: '_id', as: 'company'}}

            ]);

            _MailTemplate.aggregatePaginate(agg, {page: page, limit: rows}, function (error, t, pageCount, count) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/mail-template',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: count
                });
                _.render(req, res, 'mail-template', {
                    title: 'Quản lý mail template',
                    plugins: ['moment', ['bootstrap-select']],
                    sortData: sortCondition,
                    mailTemplates: t,
                    companies: companies,
                    categories: categories,
                    paging: paginator.getPaginationData()
                }, true, error);
            });
        })


    }

}

exports.new = function (req, res) {
    log.debug(req.query)

    _async.parallel([
        function (callback) {
            _CustomerFields.find({status: 1}, function (err, fields) {
                callback(err, fields);
            })
        },
        function (callback) {
            _Company.find({status: 1}, function (err, companies) {
                callback(err, companies);
            });
        }
    ], function (err, result) {
        _.render(req, res, 'mail-template-new', {
            title: 'Tạo mới mail template',
            fields: result[0],
            companies: result[1],
            plugins: ['moment', ['bootstrap-select'], ['ckeditor']]
        }, true, err);
    })

}

exports.edit= function(req, res){
    log.debug(req.query)
    var _cid = {};
    try {
        _cid = mongodb.ObjectID(req.params.mailtemplate);
    }
    catch (e) {
        return res.render('404',{title: '404 | Page not found'});
    }

    _async.parallel([
        function (callback) {
            _CustomerFields.find({status: 1}, function (err, fields) {
                callback(err, fields);
            })
        },
        function (callback) {
            _Company.find({status: 1}, function (err, companies) {
                callback(err, companies);
            });
        },
        function (callback){
            _MailTemplate.findById(req.params['mailtemplate'])
                .populate('categoryId')
                .exec(function(err, t){
                callback(err, t);
            });
        }
    ], function (err, result) {
        _.render(req, res, 'mail-template-edit', {
            title: 'Sửa mail template',
            fields: result[0],
            companies: result[1],
            template: result[2],
            plugins: ['moment', ['bootstrap-select'], ['ckeditor']]
        }, true, err);
    })
}

exports.create = function (req, res) {
    log.debug(req.body);

    if (_.has(req.body, 'status')) {
        req.body.status = parseInt(req.body.status);
        if (req.body.status > 1) delete req.body.status;
    }

    if (_.has(req.body, 'categoryId')) {
        req.body.categoryId = new mongoose.Types.ObjectId(req.body.categoryId);
    }

    _MailTemplate.create(req.body, function (err, t) {
        return res.json({code: (err) ? 500 : 200, message: (err) ? JSON.stringify(err) : '', data: t});
    })
}

exports.update= function(req, res){
    log.debug(req.body);

    if (_.has(req.body, 'status')) {
        req.body.status = parseInt(req.body.status);
        if (req.body.status > 1) delete req.body.status;
    }

    if (_.has(req.body, 'categoryId')) {
        req.body.categoryId = new mongoose.Types.ObjectId(req.body.categoryId);
    }

    if(_.has(req.body, 'companyId')){
        delete req.body.companyId;
    }

    _MailTemplate.findByIdAndUpdate(req.body._id, req.body, function (err, t) {
        return res.json({code: (err) ? 500 : 200, message: (err) ? JSON.stringify(err) : '', data: t});
    })
}

exports.validate = function (req, res) {
    log.debug(req.query);
    if (_.isEqual(req.query.fieldId, 'name')) {
        if(!_.has(req.query, 'categoryId')|| _.isEqual(req.query.categoryId, '')){
            return res.json([req.query.fieldId, false, 'Chưa chọn nhóm loại']);
        }
        var cateId = new mongoose.Types.ObjectId(req.query.categoryId);
        _MailTemplate.find({name: req.query.fieldValue, categoryId: cateId}, function (err, t) {
            if (t.length == 0) {
                return res.json([req.query.fieldId, true]);
            } else {
                return res.json([req.query.fieldId, false]);
            }
        })
    }
}

exports.destroy= function(req, res){
    log.debug(req.params);
    _MailTemplate.remove({_id: req.params['mailtemplate']}, function(err){
        if(err){
            res.json({code:500, message: JSON.stringify(err)});
        }else{
            res.json({code:200});
        }
    });
}

exports.destroys= function(req, res){
    log.debug(req.params);
    log.debug(req.body);

    _MailTemplate.remove({_id: {$in: req.body.ids.split(',')}}, function(err){
        if(err){
            res.json({code:500, message: JSON.stringify(err)});
        }else{
            res.json({code:200});
        }
    });
}