/**
 * Created by NghiaTM on 4/19/2016.
 */


exports.index={
    json: function(req, res){
        log.debug(req.query);

        if (_.has(req.query, 'status')) {
            req.query.status = parseInt(req.query.status);
            if (req.query.status > 1) delete req.query.status;
        }
        if(_.has(req.query, "companyId")){
            req.query.companyId= new mongoose.Types.ObjectId(req.query.companyId);
        }

        _MailTemplateCategory
            .find(req.query, function(err, result){
                res.json({code:(err)?500:200, data: result});
            })
    },
    html: function(req, res){
        log.debug(req.query);
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'status')) {
            req.query.status = parseInt(req.query.status);
            if (req.query.status > 1) delete req.query.status;
        }

        if (_.has(req.query, 'sort')) {
            var stringArr = req.query.sort.split(':');
            var sortCondition = {};
            sortCondition[stringArr[0]] = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
            var sortObj = {$sort: sortCondition};
        }

        if(_.has(req.query, 'name')){
            req.query.name= {$regex: new RegExp(_.stringRegex(req.query.name))};
        }
        req.query = _.cleanRequest(req.query);
        _Company.find({status: 1}, function (err, companies) {
            _MailTemplateCategory
                .find(req.query)
                .populate('companyId')
                .paginate(page, rows, function (error, result, pageCount) {
                    var paginator = new pagination.SearchPaginator({prelink: '/mail-template-categories', current: page, rowsPerPage: rows, totalResult: pageCount});
                    _.render(req, res, 'mail-template-categories', {title: 'Quản lý nhóm template',
                        templateCategories: result,
                        companies: companies,
                        paging: paginator.getPaginationData(),
                        plugins: ['moment', ['bootstrap-select']]}, true, error);
                });
        });


    }

}

exports.create= function(req, res){
    log.debug(req.body);

    var category= req.body;
    category.companyId= new mongoose.Types.ObjectId(category.companyId);
    if (_.has(category, 'status')) {
        category.status = parseInt(category.status);
    }

    _MailTemplateCategory.create(category, function(err, c){
        res.json({code: (err)?500:200, message: JSON.stringify(err), data: c})
    })
}

exports.edit= function(req, res){
    log.debug(req.query)

    var _cid = {};
    try {
        _cid = mongodb.ObjectID(req.params.mailtemplatecategory);
    }
    catch (e) {
        return res.render('404',{title: '404 | Page not found'});
    }

    _async.parallel([
        function (callback) {
            _Company.find({status: 1}, function (err, companies) {
                callback(err, companies);
            });
        },
        function(callback){
            _MailTemplateCategory.findById(req.params.mailtemplatecategory, function(err, c){
                callback(err, c);
            })
        }
    ], function (err, result) {
        _.render(req, res, 'mail-template-categories-edit', {
            title: 'Sửa mail template',
            companies: result[0],
            category: result[1],
            plugins: ['moment', ['bootstrap-select'], ['ckeditor']]
        }, true, err);
    })
}

exports.update= function(req, res){
    log.debug(req.body);

    if (_.has(req.body, 'status')) {
        req.body.status = parseInt(req.body.status);
        if (req.body.status > 1) delete req.body.status;
    }

    if (_.has(req.body, 'companyId')) {
        req.body.companyId = new mongoose.Types.ObjectId(req.body.companyId);
    }

    _MailTemplateCategory.findByIdAndUpdate(req.params['mailtemplatecategory'], req.body, function (err, t) {
        return res.json({code: (err) ? 500 : 200, message: (err) ? JSON.stringify(err) : '', data: t});
    })
}
exports.new= function(req, res){
    _Company.find({status: 1}, function (err, companies) {
        _.render(req, res, 'mail-template-categories-new', {
            title: 'Tạo mới nhóm template',
            companies: companies,
            plugins: ['moment', ['bootstrap-select']]
        }, true, err);
    });
}

exports.validate= function(req, res){
    log.debug(req.query);

    if(_.isEqual(req.query.fieldId,'dialog_name')||_.isEqual(req.query.fieldId,'name')){
        var companyId= new mongoose.Types.ObjectId(req.query.dialog_companyId);
        _MailTemplateCategory.findOne({name: req.query.fieldValue, companyId: companyId}, function(err, c){
            log.debug(err, c);
            if(_.isNull(c)){
                return res.json([req.query.fieldId, true]);
            }else{
                return res.json([req.query.fieldId, false]);
            }
        });
    }
}

exports.destroy= function(req, res){
    log.debug(req.params);
    _async.waterfall([
        function(callback){
            _MailTemplate.update({categoryId: new mongoose.Types.ObjectId(req.params['mailtemplatecategory'])}, {$set: {categoryId: null}}, function(err){
                callback(err);
            });
        }
    ], function(error, result){
        if(error){
            return res.json({code:500, message: JSON.stringify(error)});
        }
        _MailTemplateCategory.remove({_id: req.params['mailtemplatecategory']}, function(err){
            if(err){
                res.json({code:500, message: JSON.stringify(err)});
            }else{
                res.json({code:200});
            }
        });
    });


}

exports.destroys= function(req, res){
    log.debug(req.params);
    log.debug(req.body);

    _async.waterfall([
        function(callback){
            _MailTemplate.update({categoryId: new mongoose.Types.ObjectId(req.params['mailtemplatecategory'])}, {$set: {categoryId: null}}, function(err){
                callback(err);
            });
        }
    ], function(error, result){
        if(error){
            return res.json({code:500, message: JSON.stringify(error)});
        }
        _MailTemplateCategory.remove({_id: {$in: req.body.ids.split(',')}}, function(err){
            if(err){
                res.json({code:500, message: JSON.stringify(err)});
            }else{
                res.json({code:200});
            }
        });
    });


}