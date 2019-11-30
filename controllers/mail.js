exports.index = {
    json : function (req, res) {
        _MailTemplateCategory.aggregate([
            {$match : {companyId : new mongodb.ObjectId(req.query.companyId)}},
            {$group : {'_id' : '$companyId', 'ids' : {$push : {_id : '$_id', name : '$name'}}}},
            {$unwind : {path : '$ids', preserveNullAndEmptyArrays : true}},
            {$lookup : {from : 'mailtemplates', localField : 'ids._id', foreignField : 'categoryId', as : 'ids.templates'}},
            {$project : {'ids.name' : 1, 'ids.templates.name' : 1, 'ids.templates._id' : 1, 'ids.templates.body' : 1}}
            //{$group: {'_id': '$companyId', 'templates': {$push: '$templates'}}},
        ], function (error, m) {
            res.json({code : error ? 500 : 200, data : error ? error : m});
        });
    },
    html : function (req, res) {
        
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var sort = _.cleanSort(req.query, '');
        var query = _.cleanRequest(req.query);
        var agg = _Mail.aggregate();
        agg._pipeline = [
            //{$group: {'_id': ''}}
            {$match : {agent : new mongodb.ObjectId(req.session.user._id)}},
            {$sort : {readed : 1, created : -1, process_date : -1}}
        ];
        _Mail.aggregatePaginate(agg, {page : page, limit : rows}, function (error, mails, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink : '/mail', current : page, rowsPerPage : rows, totalResult : count});
            _.render(req, res, 'mail', {
                title : 'Danh sách mail',
                paging : paginator.getPaginationData(),
                plugins : [['chosen'], ['bootstrap-select'], ['bootstrap-datetimepicker']],
                mails : mails
            }, true, error);
        });
        
    }
};

exports.create = function (req, res) {
    _body = _.cleanRequest(req.body);
    if (!_.has(_body, 'customer')) return res.json({code : 404});
    _async.waterfall([
        function (next) {
            _CustomerFields.find({status : 1}, 'modalName displayName fieldType fieldValue isRequired -_id').sort({weight : 1, displayName : 1}).exec(next);
        },
        function (fields, next) {
            next(null, fields, _.chain(_.keys(_.chain(fields)
                .groupBy('modalName')
                .mapObject(function (i) {
                    return i[0];
                }).value()))
                .map(function (t) {
                    return {$lookup : {from : t, localField : '_id', foreignField : 'entityId', as : t}};
                }).value()
            );
        },
        function (fields, lookup, next) {
            _Customer.aggregate([
                    {$match : {'_id' : {$in : _.arrayObjectId(_body.customer.split(','))}}},
                    {$group : {'_id' : '$_id'}}].concat(lookup),
                function (error, customers) {
                    if (customers.length <= 0) return next('Không có khách hàng nào trong nhóm có email');
                    var _mailBulk = mongoClient.collection('mails').initializeUnorderedBulkOp({useLegacyOps : true});
                    var _mailToSend = [];
                    _async.each(customers, function (cus, callback) {
                        var _cus = _.chain(cus).pick(function (value, key, object) {
                            return _.isArray(value) && !_.isEmpty(value);
                        }).mapObject(function (v) {
                            return v[0].value;
                        }).value();
                        var _mbody = _.unescapeHTML(rePlaceholder(_body.body_raw, _cus));
                        var _mailId = new mongodb.ObjectId();
                        var _info = 'dft-start-config' + [_config.app._id, req.session.user._id, _mailId].join('-') + 'dft-end-config';
                        var _mail = {
                            _id : _mailId,
                            to : _cus.field_e_mail,
                            from : _body.from,
                            subject : _body.subject,
                            subject_raw : _body.subject,
                            body : _.stripTags(_mbody).toLowerCase(),
                            body_raw : [_mbody, _.htmlTags([{tag : 'span', attr : {style : 'font-size:0px'}, content : _info}])].join(' '),
                            status : 1,
                            campaign : null,
                            agent : _.convertObjectId(req.session.user._id),
                            err_message : null,
                            sentDate : new Date(),
                            created : new Date(),
                            process_date : null,
                            mail_type : 1,
                            readed : 1
                        };
                        _mailBulk.insert(_mail);
                        _mailToSend.push(_.extend(_.clone(_mail), {body : _.stripTags(_mbody).toLowerCase() + _info, created : _moment().format('YYYY-MM-DD HH:mm:ss'), sentDate : _moment().format('YYYY-MM-DD HH:mm:ss')}));
                        callback(null);
                    }, function (error) {
                        _ActiveMQ.publish('/queue/SendMail', JSON.stringify({mails : _mailToSend, sentNow : 0}));
                        _mailBulk.execute(next);
                    });
                });
        }
    ], function (error, result) {
        res.json({code : 200, message : 'sss'});
    });
};

exports.new = function (req, res) {
    _async.parallel({
        services : function (callback) {
            _ServicesMail.find({}, 'name send_user idCompany').lean().exec(callback);
        },
        templates : function (callback) {
            _MailTemplateCategory.aggregate([
                {$group : {'_id' : '$companyId'}}
            ], callback);
        }
    }, function (error, result) {
        _.render(req, res, 'mail-new', _.extend({
            title : 'Tạo mail',
            plugins : [['select2'], ['bootstrap-select'], ['bootstrap-datetimepicker']]
        }, result), true, error);
    });
    
};

exports.show = function (req, res) {
    console.log(req.params);
    _async.parallel({
        mails : function (callback) {
            _Mail.findById(req.params.mail).lean().exec(callback);
        },
        services : function (callback) {
            _ServicesMail.find({}, 'name send_user idCompany').lean().exec(callback);
        },
        templates : function (callback) {
            _MailTemplateCategory.aggregate([
                {$group : {'_id' : '$companyId'}}
            ], callback);
        }
    }, function (error, result) {
        console.log(error, result);
        _.render(req, res, 'mail-detail', _.extend({
            title : 'Chi tiết mail',
            plugins : [['select2'], ['bootstrap-select'], ['bootstrap-datetimepicker']]
        }, result), true, error);
    });
    
};

var rePlaceholder = function (str, obj) {
    return str.replace(/\<span class="m-t" style="background-color:#ff0">%(.*?)%\<\/span>/g, function (i, match) {
        return _.has(obj, ('field_' + match).toLowerCase()) ? obj[('field_' + match).toLowerCase()] : '';
    }).replace(/[\r\n]/g, '');
};
