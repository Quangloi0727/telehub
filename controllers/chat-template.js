/**
 * Created by MyPC on 03/05/2016.
 */

exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var agg = _ChatTemplate.aggregate();
        if (_.has(req.query, 'channelId')) req.query.channelId = new mongodb.ObjectId(req.query.channelId);
        if (_.has(req.query, 'status')) {
            req.query.status = parseInt(req.query.status);
            if (req.query.status < 0) delete req.query.status;
        }
        agg._pipeline = [
            {$match: {$and: [req.query]}}
        ];

        _ChatTemplate.aggregatePaginate(agg, {page: page, limit: rows}, function (error, t, pageCount, count) {
            res.json({code: error ? 404 : 200, templates: t});
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'status')) {
            req.query.status = parseInt(req.query.status);
            if (req.query.status < 0) delete req.query.status;
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

        var channelId = {};
        if(_.has(req.query, 'channelId')){
            channelId =  new mongoose.Types.ObjectId(req.query.channelId);
        }
        req.query = _.cleanRequest(req.query);
        _Company.find({status: 1}, function (err, companies) {
            var agg = _ChatTemplate.aggregate();
            agg._pipeline = [
                {$match: {$and: [req.query]}},
                {
                    $lookup: {
                        from: 'companychannels',
                        localField: 'channelId',
                        foreignField: '_id',
                        as: 'channel'
                    }
                },
                {$unwind: {path: '$channel', preserveNullAndEmptyArrays: true}},
                {$lookup: {from: 'companies', localField: 'channel.idCompany', foreignField: '_id', as: 'company'}},
                {$unwind: {path: '$company', preserveNullAndEmptyArrays: true}}
            ];

            _ChatTemplate.aggregatePaginate(agg, {page: page, limit: rows}, function (error, t, pageCount, count) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/chat-template',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: count
                });
                _.render(req, res, 'chat-template', {
                    title: 'Quản lý chat template',
                    plugins: ['moment', ['bootstrap-select']],
                    sortData: sortCondition,
                    chatTemplates: t,
                    companies: companies,
                    paging: paginator.getPaginationData()
                }, true, error);
            });
        });
    }
}

exports.new = function (req, res) {
    _Company.find({status: 1}, function (err, companies) {
        _.render(req, res, 'chat-template-new', {
            title: 'Tạo mới chat template',
            companies: companies,
            plugins: ['moment', ['bootstrap-select'], ['ckeditor']]
        }, true, err);
    });
}

exports.edit= function(req, res){
    var _cid = {};
    try {
        _cid = mongodb.ObjectID(req.params.chattemplate);
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
        function (callback){
            _ChatTemplate.findById(req.params['chattemplate'])
                .populate({
                    path: 'channelId',
                    model: _CompanyChannel
                })
                .exec(function(err, t){
                    callback(err, t);
                });
        }
    ], function (err, result) {
        _.render(req, res, 'chat-template-edit', {
            title: 'Sửa chat template',
            companies: result[0],
            template: result[1],
            plugins: ['moment', ['bootstrap-select'], ['ckeditor']]
        }, true, err);
    })
}

exports.create = function (req, res) {
    if (_.has(req.body, 'status')) {
        req.body.status = parseInt(req.body.status);
        if (req.body.status < 0) delete req.body.status;
    }

    if (_.has(req.body, 'channelId')) {
        req.body.channelId = new mongoose.Types.ObjectId(req.body.channelId);
    }

    req.body['raw'] = _.stripTags(req.body['body']);

    _ChatTemplate.create(req.body, function (err, t) {
        return res.json({code: (err) ? 500 : 200, message: (err) ? JSON.stringify(err) : '', data: t});
    })
}

exports.update= function(req, res){
    if (_.has(req.body, 'status')) {
        req.body.status = parseInt(req.body.status);
        if (req.body.status > 1) delete req.body.status;
    }

    if (_.has(req.body, 'channelId')) {
        req.body.channelId = new mongoose.Types.ObjectId(req.body.channelId);
    }

    if(_.has(req.body, 'companyId')){
        delete req.body.companyId;
    }
    req.body['raw'] = _.stripTags(req.body['body']);
    _ChatTemplate.findByIdAndUpdate(req.body._id, req.body, function (err, t) {
        return res.json({code: (err) ? 500 : 200, message: (err) ? JSON.stringify(err) : '', data: t});
    })
}

exports.validate = function (req, res) {
    if (_.isEqual(req.query.fieldId, 'name')) {
        if(!_.has(req.query, 'channelId')|| _.isEqual(req.query.channelId, '')){
            return res.json([req.query.fieldId, false, 'Chưa chọn channel']);
        }
        var channelId = new mongoose.Types.ObjectId(req.query.channelId);
        _ChatTemplate.find({name: req.query.fieldValue, channelId: channelId}, function (err, t) {
            if (t.length == 0) {
                return res.json([req.query.fieldId, true]);
            } else {
                return res.json([req.query.fieldId, false]);
            }
        })
    }
}

exports.destroy= function(req, res){
    _ChatTemplate.remove({_id: req.params['chattemplate']}, function(err){
        if(err){
            res.json({code:500, message: JSON.stringify(err)});
        }else{
            res.json({code:200});
        }
    });
}

exports.destroys= function(req, res){
    _ChatTemplate.remove({_id: {$in: req.body.ids.split(',')}}, function(err){
        if(err){
            res.json({code:500, message: JSON.stringify(err)});
        }else{
            res.json({code:200});
        }
    });
}