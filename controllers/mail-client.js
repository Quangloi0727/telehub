/**
 * Created by MrBlack on 4/27/2016.
 */
exports.index = function (req, res) {
    if (!req.session || !_.has(req.session, 'user')) {
        return res.json({total: 0, rows: []});
    }
    var page = (_.has(req.query, 'page') && !_.isNull(req.query.page)) ? req.query.page : 1;
    var rows = (_.has(req.query, 'per_page') && !_.isNull(req.query.per_page)) ? req.query.per_page : 10;
    var _sort = _.cleanSort(req.query, '');
    var _query = _.cleanRequest(req.query, ['object FormData', 'type', 'page', 'direction', 'per_page']);
    _query["mail_type"] = 2;
    _query["readed"] = parseInt(req.query.readed);
    _query["agent"] = new mongodb.ObjectId(String(req.session.user._id));
 
    if(_query.keyword && _query.keyword.length >= 3){
        _query["subject"] = {$regex: new RegExp(_.stringRegex(_query.keyword)), $options: '-i'};
    }

    delete _query.keyword;
    delete _query.ticket;
 
    var aggregate = _Mail.aggregate();

    aggregate._pipeline.push({$match: _query});

    if (_.has(req.query, 'ticket')) {
        aggregate._pipeline.push({$lookup: {from: 'ticketmails', localField: '_id', foreignField: 'mailId', as: "mails"}});
        aggregate._pipeline.push({$unwind: '$mails'});
        aggregate._pipeline.push({$match: {"mails.status": {$eq: parseInt(req.query.ticket)}}});
    }
    aggregate._pipeline.push({$lookup: {from: 'servicemails', localField: 'to', foreignField: 'send_user', as: 'service'}});
    aggregate._pipeline.push({$unwind: '$service'});
    aggregate._pipeline.push({$sort: {created: -1, process_date: -1}});

    _Mail.aggregatePaginate(aggregate, {page: page, limit: rows}, function (err, results, pageCount, count) {
        if (err) console.log(err);
        res.json({total: count, rows: results});
    });
};

exports.create = function (req, res) {
    req.body['agent'] = req.session.user._id;
    req.body['status'] = 2;
    req.body['mail_type'] = 1;
    _async.waterfall([
        function (next) {
            _CustomerFields.find({status: 1}, 'modalName displayName fieldType fieldValue isRequired -_id').sort({weight: 1, displayName: 1}).exec(next);
        },
        function (fields, next) {
            next(null, fields, _.chain(_.keys(_.chain(fields)
                .groupBy('modalName')
                .mapObject(function (i) {
                    return i[0];
                }).value()))
                .map(function (t) {
                    return {$lookup: {from: t, localField: '_id', foreignField: 'entityId', as: t}};
                }).value()
            );
        },
        function (fields, lookup, next) {
            _CCKFields['field_e_mail'].db.findOne({value: req.body.to}, 'entityId', function (err, c) {
                if (_.isNull(c)) return next('T�i kho?n email n�y kh�ng t�m th?y', null);
                next(null, fields, lookup, c.entityId);
            });
        },
        function (fields, lookup, cid, next) {
            _Customer.aggregate([
                    {$match: {'_id': cid}}].concat(lookup),
                function (error, customers) {
                    if (customers.length <= 0) return next('Kh�ng c� kh�ch h�ng n�o trong nh�m c� email');
                    _async.each(customers, function (cus, callback) {
                        var _cus = _.chain(cus).pick(function (value, key, object) {
                            return _.isArray(value) && !_.isEmpty(value);
                        }).mapObject(function (v) {
                            return v[0].value;
                        }).value();
                        var _body = req.body['body_raw'];
                        req.body["body_raw"] = _.unescapeHTML(rePlaceholder(_body, _cus));
                        if (_.has(req.body, 'mailId')) req.body.replyTo = req.body.mailId;
                        _Mail.create(req.body, function (error, mail) {
                            if (error) return res.json({code: 500, message: error});
                            var m = mail.toObject();
                            m.created = _moment(m.created).format('YYYY-MM-DD HH:mm:ss');
                            m.body_raw += _.htmlTags([{tag: 'span', attr: {style: 'font-size:0px'}, content: 'dft-start-config' + [_config.app._id, req.session.user._id, mail._id].join('-') + 'dft-end-config'}]);
                            _ActiveMQ.publish('/queue/SendMail', JSON.stringify({mails: [m], sentNow: 0}));
                            callback(null);
                        });
                    }, next);
                });
        }
    ], function (error, result) {
        if (error) return res.json({code: 500, message: error});
        if (_.has(req.body, 'mailId')) {
            _Mail.findByIdAndUpdate(req.body.mailId, {readed: 1, mail_status: ((_.has(req.body, 'mail_status') && _.isEqual(req.body.mail_status, '2')) ? 2 : 1)}, function (error, m) {
                res.json({code: 200, message: 'sss'});
            });
        } else {
            res.json({code: 500, message: 'Mail not update'});
        }
    });

};

exports.show = function (req, res) {
    _async.waterfall([
        function (callback) {
            _Mail.findById(req.params.mailclient, callback);
        },
        function (mail, callback) {
            _async.parallel({
                services: function (cb) {
                    _ServicesMail.aggregate([
                        {$match: {send_user: mail.to}},
                        {$lookup: {from: 'mailtemplatecategories', localField: 'idCompany', foreignField: 'companyId', as: 'categories'}},
                        {
                            $unwind: {
                                path: '$categories',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {$lookup: {from: 'mailtemplates', localField: 'categories._id', foreignField: 'categoryId', as: 'categories.templates'}},
                        {$project: {'categories._id': 1, 'categories.name': 1, 'categories.templates._id': 1, 'categories.templates.name': 1, 'categories.templates.body': 1}}
                    ], cb);
                },
                tickets: function (cb) {
                    cb(null, []);
                }
            }, function (error, result) {
                mail.update({status: 3}, {new: true}, function (error, m) {//readed: 1,
                    result['mail'] = mail;
                    callback(error, result);
                });
            });
        }
    ], function (error, m) {
        res.json({code: error ? 500 : 200, data: error ? error : m});
    });
};

exports.update = function (req, res) {
    _Mail.findByIdAndUpdate(req.params.mailclient, req.body, {new: true, upsert: false}, function (error, m) {
        res.json({code: error ? 500 : 200, message: error ? error : 'Ok'});
    });
}

var rePlaceholder = function (str, obj) {
    return str.replace(/\<span class="m-t" style="background-color:#ff0">%(.*?)%\<\/span>/g, function (i, match) {
        return _.has(obj, ('field_' + match).toLowerCase()) ? obj[('field_' + match).toLowerCase()] : '';
    }).replace(/[\r\n]/g, '');
};