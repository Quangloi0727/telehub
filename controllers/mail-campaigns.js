var mkdirp = require('mkdirp');
var request = require('request');
var fs = require('fs');

exports.index = {
    json: function (req, res) {
        if (!_.has(req.query, 'companyId')) return res.status(404).json({code: 404});
        var _companyId = new mongodb.ObjectId(req.query.companyId);
        _async.parallel({
            templates: function (callback) {
                _MailTemplateCategory.aggregate([
                    {$match: {companyId: _companyId}},
                    {$group: {'_id': '$companyId', 'ids': {$push: {_id: '$_id', name: '$name'}}}},
                    {$unwind: {path: '$ids', preserveNullAndEmptyArrays: true}},
                    {$lookup: {from: 'mailtemplates', localField: 'ids._id', foreignField: 'categoryId', as: 'ids.templates'}},
                    {$project: {'ids.name': 1, 'ids.templates.name': 1, 'ids.templates._id': 1, 'ids.templates.body': 1}}
                ], callback);
            },
            setting: function (callback) {
                _ServicesMail.find({'idCompany': _companyId}, 'name send_user').lean().exec(callback);
            }
        }, function (error, result) {
            res.status(error ? 500 : 200).json(_.extend({code: error ? error : 200}, result));
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var sort = _.cleanSort(req.query, '');
        var query = _.cleanRequest(req.query);

        if (_.has(sort, 'company')) {
            sort['setting.idCompany._id'] = sort.company;
            delete sort.company;
        }
        if (_.isEmpty(sort)) sort.created = -1;
        if (_.has(query, 'company')) {
            query['setting.idCompany._id'] = new mongodb.ObjectId(query.company);
            delete query.company;
        }
        if (_.has(query, 'name')) query.name = {$regex: new RegExp(_.stringRegex(query.name)), $options: "si"};
        var agg = _MailCampaigns.aggregate();
        agg._pipeline = [
            {$lookup: {from: 'servicemails', localField: 'setting', foreignField: '_id', as: 'setting'}},
            {$unwind: {path: "$setting", preserveNullAndEmptyArrays: true}},
            {$lookup: {from: 'companies', localField: 'setting.idCompany', foreignField: '_id', as: 'setting.idCompany'}},
            {$unwind: {path: "$setting.idCompany", preserveNullAndEmptyArrays: true}},
            {$match: query},
            {$sort: sort}
        ];
        _async.parallel({
            company: function (callback) {
                _Company.find({}, 'name').lean().exec(callback);
            }
        }, function (error, result) {
            _MailCampaigns.aggregatePaginate(agg, {page: page, limit: rows}, function (error, mails, pageCount, count) {
                var paginator = new pagination.SearchPaginator({prelink: '/agent-groups', current: page, rowsPerPage: rows, totalResult: count});
                _.render(req, res, 'mail-campaigns', _.extend({
                    title: 'Danh sách chiến dịch Mail',
                    paging: paginator.getPaginationData(),
                    plugins: [['chosen'], ['bootstrap-select'], ['bootstrap-datetimepicker']],
                    mails: mails
                }, result), true, error);
            });
        });

    }
};

exports.create = function (req, res) {
    var _req = _.cleanRequest(req.body);
    _req["attachments"] = [];
    _req["attachments_orginal"] = [];
    _req["_id"] = new mongoose.Types.ObjectId();
    _req["files"] = [];
    _async.waterfall([
        function (next) {
            if (!req.files || _.isEmpty(req.files)) return next(null);
            var fFolder = _req["_id"].toString();
            fsx.mkdirs(path.join(_rootPath, "assets", "uploads", "attachments", fFolder), function (error) {
                if (error) return next(error);
                _async.eachSeries(req.files, function (f, _next) {
                    var fUrl = path.join(_rootPath, "assets", "uploads", "attachments", fFolder, f.originalname);
                    fsx.move(f.path, fUrl, function (error) {
                        if (_.isEqual(_req.type, "send")) _req.attachments_orginal.push(fs.createReadStream(fUrl));
                        _req.files.push(fUrl);
                        _req.attachments.push("/assets/uploads/attachments/" + fFolder + "/" + f.originalname);
                        _next(error);
                    });
                }, function (error) {
                    if (error) return next(error);
                    if (!_.isEqual(_req.type, 'send')) return next(null);
                    request.post({
                        url: 'https://' + _config['database-core'].ip + ':8000/attachment',
                        rejectUnauthorized: false, agent: false, requestCert: true, formData: {attachments: _req.attachments_orginal}
                    }, function optionalCallback(err, httpResponse, body) {
                        if (err) return next(err);
                        _req.attachments_orginal = JSON.parse(body);
                        next(err);
                    });
                });
            });
        },
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
            lookup.push({$match: {'field_e_mail.value': {$ne: null}}});
            _Customer.aggregate([{$match: {sources: {$in: _.arrayObjectId(_req.sources)}}}, {$group: {'_id': '$_id'}}].concat(lookup), function (error, customers) {
                if (customers.length <= 0) return next('Không có khách hàng nào trong nhóm có email');
                if (!_.isEqual(_req.type, 'send')) {
                    _MailCampaigns.create(_.extend(_req, {amount: customers.length}), next);
                } else {
                    var _mailBulk = mongoClient.collection('mails').initializeUnorderedBulkOp({useLegacyOps: true});
                    var _mailToSend = [];
                    _req._id = new mongodb.ObjectId();
                    _async.each(customers, function (cus, callback) {
                        var _cus = _.chain(cus).pick(function (value, key, object) {
                            return _.isArray(value) && !_.isEmpty(value);
                        }).mapObject(function (v) {
                            return v[0].value;
                        }).value();
                        var _body = _.unescapeHTML(rePlaceholder(_req.body_raw, _cus));
                        var _mailId = new mongodb.ObjectId();
                        var _mail = {
                            _id: _mailId,
                            to: _cus.field_e_mail,
                            from: _req.from,
                            subject: _req.subject,
                            subject_raw: _req.subject,
                            body: _.stripTags(_body).toLowerCase(),
                            body_raw: [_body, _.htmlTags([{tag: 'span', attr: {style: 'font-size:0px'}, content: 'dft-start-config' + [_config.app._id, req.session.user._id, _mailId, _req._id].join('-') + 'dft-end-config'}])].join(' '),
                            status: _.switch(_req.type, ['save', 'send'], [0, 1]),
                            attachments: _req.attachments,
                            campaign: _req._id,
                            sendDate: _moment(req.body.sendDate, "MM/DD/YYYY hh:mm A")._d,
                            err_message: null,
                            created: new Date(),
                            process_date: null,
                            mail_type: 1,
                            readed: 1
                        };
                        _mailBulk.insert(_mail);
                        if (_.isEqual(_req.type, 'send')) _mailToSend.push(_.extend(_.clone(_mail), {created: _moment().format('YYYY-MM-DD HH:mm:ss'), attachments: _req.attachments_orginal, sendDate: _moment(req.body.sendDate, "MM/DD/YYYY hh:mm A").format('YYYY-MM-DD HH:mm:ss')}));
                        callback(null);
                    }, function (error) {
                        if (_.isEqual(_req.type, 'send') && _mailToSend.length > 0) _ActiveMQ.publish('/queue/SendMail', JSON.stringify({mails: _mailToSend, sentNow: 0}));
                        _mailBulk.execute(function (err, result) {
                            _MailCampaigns.create(_.extend(_req, {amount: result.nInserted}), next);
                        });
                    });
                }
            });
        }
    ], function (error, result) {
        res.json({code: error ? 500 : 200, message: error, error: error});
    });
};

exports.update = function (req, res) {
    _MailCampaigns.findById(req.params.mailcampaign).populate({path: 'setting', model: _ServicesMail, select: 'idCompany idSkill name _id'}).exec(function (error, campaign) {
        if (error) return res.json({code: 500, message: null, error: error});
        if (_.isNull(campaign) || _.isUndefined(campaign)) return res.json({code: 404, message: 'Not Found!'});
        var _req = _.cleanRequest(req.body);
        _req["attachments"] = campaign.attachments || [];
        _req["attachments_orginal"] = [];
        _req["_id"] = req.params.mailcampaign;
        _req["files"] = campaign.files || [];
        _async.waterfall([
            function (next) {
                _Mail.remove({campaign: req.params.mailcampaign}, next);
            },
            function (arg, next) {
                if (!req.files || _.isEmpty(req.files)) return next(null);
                var fFolder = req.params.mailcampaign;
                fsx.mkdirs(path.join(_rootPath, "assets", "uploads", "attachments", fFolder), function (error) {
                    if (error) return next(error); 
                    _async.eachSeries(req.files, function (f, _next) {
                        var fUrl = path.join(_rootPath, "assets", "uploads", "attachments", fFolder, f.originalname);
                        if (_req.files.indexOf(fUrl) < 0) {
                            fsx.move(f.path, fUrl, function (error) {
                                if(error) return next(error);
                                _req.files.push(fUrl);
                                _req.attachments.push("/assets/uploads/attachments/" + fFolder + "/" + f.originalname);
                                _next(null);
                            });
                        } else {
                            _next(null);
                        }
                    }, function (error) {
                        if (error) return next(error);
                        if (!_.isEqual(_req.type, 'send')) return next(null);
                        _async.eachSeries(_req.files, function (f, _next) {
                            _req.attachments_orginal.push(fs.createReadStream(f));
                            _next(null);
                        }, function (error) {
                            request.post({
                                url: 'https://' + _config['database-core'].ip + ':8000/attachment',
                                rejectUnauthorized: false, agent: false, requestCert: true, formData: {attachments: _req.attachments_orginal}
                            }, function optionalCallback(err, httpResponse, body) {
                                if (err) return next(err);
                                _req.attachments_orginal = JSON.parse(body);
                                next(err);
                            });
                        });
                    });
                });
            },
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
                lookup.push({$match: {'field_e_mail.value': {$ne: null}}});
                _Customer.aggregate([{$match: {sources: {$in: _.arrayObjectId(_req.sources)}}}, {$group: {'_id': '$_id'}}].concat(lookup), function (error, customers) {
                    if (customers.length <= 0) return next('Không có khách hàng nào trong nhóm có email');
                    if (!_.isEqual(_req.type, 'send')) {
                        delete  _req._id;
                        _MailCampaigns.findByIdAndUpdate(req.params.mailcampaign, _.extend(_req, {amount: customers.length}), next);
                    } else {
                        var _mailBulk = mongoClient.collection('mails').initializeUnorderedBulkOp({useLegacyOps: true});
                        var _mailToSend = [];
                        _req._id = new mongodb.ObjectId();
                        _async.each(customers, function (cus, callback) {
                            var _cus = _.chain(cus).pick(function (value, key, object) {
                                return _.isArray(value) && !_.isEmpty(value);
                            }).mapObject(function (v) {
                                return v[0].value;
                            }).value();
                            var _body = _.unescapeHTML(rePlaceholder(_req.body_raw, _cus));
                            var _mailId = new mongodb.ObjectId();
                            var _mail = {
                                _id: _mailId,
                                to: _cus.field_e_mail,
                                from: _req.from,
                                subject: _req.subject,
                                subject_raw: _req.subject,
                                body: _.stripTags(_body).toLowerCase(),
                                body_raw: [_body, _.htmlTags([{tag: 'span', attr: {style: 'font-size:0px'}, content: 'dft-start-config' + [_config.app._id, req.session.user._id, _mailId, _req._id].join('-') + 'dft-end-config'}])].join(' '),
                                status: _.switch(_req.type, ['save', 'send'], [0, 1]),
                                attachments: _req.attachments,
                                campaign: _req._id,
                                sendDate: _moment(req.body.sendDate, "MM/DD/YYYY hh:mm A")._d,
                                err_message: null,
                                created: new Date(),
                                process_date: null,
                                mail_type: 1,
                                readed: 1
                            };
                            _mailBulk.insert(_mail);
                            if (_.isEqual(_req.type, 'send')) _mailToSend.push(_.extend(_.clone(_mail), {created: _moment().format('YYYY-MM-DD HH:mm:ss'), attachments: _req.attachments_orginal, sendDate: _moment(req.body.sendDate, "MM/DD/YYYY hh:mm A").format('YYYY-MM-DD HH:mm:ss')}));
                            callback(null);
                        }, function (error) {
                            if (_.isEqual(_req.type, 'send') && _mailToSend.length > 0) _ActiveMQ.publish('/queue/SendMail', JSON.stringify({mails: _mailToSend, sentNow: 0}));
                            _mailBulk.execute(function (err, result) {
                                delete  _req._id;
                                _MailCampaigns.findByIdAndUpdate(req.params.mailcampaign, _.extend(_req, {amount: result.nInserted}), next);
                            });
                        });
                    }
                });
            }
        ], function (error, result) {
            console.log(285, error);
            res.json({code: error ? 500 : 200, message: result, error: error});
        });
    });
};

exports.new = function (req, res) {
    _async.parallel({
        services: function (callback) {
            _ServicesMail.find({}, 'name send_user idCompany').lean().exec(callback);
        },
        templates: function (callback) {
            _MailTemplateCategory.aggregate([{$group: {'_id': '$companyId'}}], callback);
        },
        company: function (callback) {
            _Company.find({}, 'name').lean().exec(callback);
        },
        groups: function (callback) {
            _CustomerGroups.aggregate([
                {$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}},
                {$match: {status: 1}},
                {$sort: {'name': -1, 'sources.name': -1}}
            ], callback);
        }
    }, function (error, result) {
        _.render(req, res, 'mail-campaigns-new', _.extend({title: 'Tạo mail', plugins: [['chosen'], 'fileinput', ['bootstrap-select'], ['bootstrap-datetimepicker']]}, result), true, error);
    });
};

exports.edit = function (req, res) {
    _async.parallel({
        services: function (callback) {
            _ServicesMail.find({}, 'name send_user idCompany').lean().exec(callback);
        },
        templates: function (callback) {
            _MailTemplateCategory.aggregate([{$group: {'_id': '$companyId'}}], callback);
        },
        company: function (callback) {
            _Company.find({}, 'name').lean().exec(callback);
        },
        groups: function (callback) {
            _CustomerGroups.aggregate([
                {$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}},
                {$match: {status: 1}},
                {$sort: {'name': -1, 'sources.name': -1}}
            ], callback);
        },
        mail: function (callback) {
            _MailCampaigns.findById(req.params.mailcampaign).populate({path: 'setting', model: _ServicesMail, select: 'idCompany idSkill name _id'}).exec(callback);
        }
    }, function (error, result) {
        _.render(req, res, 'mail-campaigns-edit', _.extend({title: 'Tạo mail', plugins: [['chosen'], 'fileinput', ['bootstrap-select'], ['bootstrap-datetimepicker']]}, result), !_.isNull(result.mail), error);
    });
};

exports.validate = function (req, res) {
    var _query = {};
    _query[req.query['fieldId']] = req.query['fieldValue'];
    if (_.has(req.query, 'setting')) _query.setting = _.isString(req.query.setting) ? req.query.setting : req.query.setting[0];
    if (_.has(req.query, 'name') && _.isEqual(req.query['fieldId'], 'name') && _.isEqual(req.query['fieldValue'], req.query.name)) return res.json([req.query.fieldId, true]);
    _MailCampaigns.findOne(_query).exec(function (error, f) {
        res.json([req.query.fieldId, (_.isNull(f) || _.isUndefined(f))]);
    });
};

var rePlaceholder = function (str, obj) {
    return str.replace(/\<span class="m-t" style="background-color:#ff0">%(.*?)%\<\/span>/g, function (i, match) {
        return _.has(obj, ('field_' + match).toLowerCase()) ? obj[('field_' + match).toLowerCase()] : '';
    }).replace(/[\r\n]/g, '');
};
 