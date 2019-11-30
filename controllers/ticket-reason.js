exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = _.cleanRequest(req.query);
        var aggregate = _TicketReason.aggregate();
        aggregate._pipeline = [];
        //aggregate._pipeline.push({
        //    $lookup: {
        //        from: 'ticketreasoncategories',
        //        localField: 'idCategory',
        //        foreignField: '_id',
        //        as: 'reason'
        //    }
        //});
        //if (!_.isEmpty(query)) aggregate._pipeline.push({$match: {idCategory: mongoose.Types.ObjectId(query.idCategory)}});
        _.allKeys(query).forEach(function (el) {
            var matchObj = {};
            if (_.isEqual(el, 'page') || _.isEqual(el, 'rows') || _.isEmpty(req.query[el])) return;
            if ( _.isEqual(el, 'idCategory') || _.isEqual(el, 'status')) {matchObj[el] = parseInt(query[el])}
            else {matchObj[el] = {$regex: new RegExp(_.stringRegex(query[el]), 'i')}};
            aggregate._pipeline.push({$match: matchObj});
        });
        aggregate._pipeline.push({$sort: {priority: 1}});
        _TicketReason.aggregatePaginate(aggregate, {
            page: (_.isEqual(page, 1) ? 0 : ((page - 1) * rows)),
            limit: rows
        }, function (error, ticket, pageCount, count) {
            var x = _.chain(ticket).value()
            res.json({code: (error ? 500 : 200), message: error ? error : x});
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = _.cleanRequest(req.query);
        var aggregate = _TicketReason.aggregate();
        var category = [];
        aggregate._pipeline = [];
        aggregate._pipeline.push({
                $lookup: {
                    from: 'ticketreasoncategories',
                    localField: 'idCategory',
                    foreignField: '_id',
                    as: 'idCategory'
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }

            }, {
                $lookup: {
                    from: 'ticketsubreasons',
                    localField: '_id',
                    foreignField: 'idReason',
                    as: 'subreason'
                }

            }, {
                $sort: {'idCategory.name': 1}
            }
        );
        _.allKeys(query).forEach(function (el) {
            var matchObj = {};
            if (_.isEqual(el, 'page') || _.isEqual(el, 'rows') || _.isEmpty(query[el])) return;
            if (_.isEqual(el, 'status')) {matchObj[el] = parseInt(query[el]);}
            else{matchObj[el] = {$regex: new RegExp(_.stringRegex(query[el]), 'i')};}
            aggregate._pipeline.push({$match: matchObj});
        });

        _TicketReason.aggregatePaginate(aggregate, {
                page: page,
                limit: rows
            }, function (error, ticket, pageCount, count) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/ticket-reason',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: count
                });
                for (var i = 0; i < ticket.length; i++) {
                    ticket[i].idCategory = ticket[i].idCategory[0].name;
                    ticket[i].createdBy = ticket[i].createdBy[0].displayName
                    if (ticket[i].category == 0) {
                        ticket[i].category = "Cả hai";
                    } else if (ticket[i].category == 1) {
                        ticket[i].category = "Gọi vào";
                    } else {
                        ticket[i].category = "Gọi ra";
                    }
                }
                ;
                _TicketReasonCategory.find({}, function(err, r){
                    //category = r;
                    _.render(req, res, 'ticket-reason', {
                        title: 'Danh sách tình trạng',
                        paging: paginator.getPaginationData(),
                        plugins: [['chosen'], ['bootstrap-select']],
                        ticket: _.chain(ticket).value(),
                        category: r
                    }, true);
                });
            }
        );
    }
}
exports.new = function (req, res) {
    _TicketReasonCategory.find({}, function(err, r){
        _.render(req, res, 'ticket-reason-new', {title: 'Tạo mới tình trạng',plugins: [['bootstrap-select']], cat:r}, true);
    });
};
exports.create = function (req, res) {
    if (_.has(req.body['priority'])) req.body['priority'] = Number(req.body['priority']);
    if (_.has(req.body, 'bulk-update') && req.body['bulk-update']) {
        var _body = _.chain(req.body).cleanRequest().toLower().value();
        delete _body['bulk-update'];
        mongodb.MongoClient.connect(_dbPath, function (err, db) {
            if (err) return callback(err);
            var batch = db.collection('ticketreasons').initializeUnorderedBulkOp({useLegacyOps: true});
            _.each(_body, function (p, id) {
                batch.find({_id: new mongodb.ObjectId(id)}).updateOne({$set: {priority: Number(p)}});
            });
            batch.execute(function (error, result) {
                db.close();
                res.json({code: error ? 500 : 200, message: error ? error : result.nModified});
            });
        });
    }
    else {
        _TicketReason.find({name: req.body['name'], idCategory: req.body['idCategory']}, function (err, r) {
            if (r.length == 0) {
                _async.waterfall([function (cb) {
                    if (_.has(req.body['priority'])) req.body['priority'] = Number(req.body['priority']);
                    req.body['status'] = (_.has(req.body, 'status')&&req.body['status']!=0) ? 1 : 0;
                    req.body['createdBy'] = req.session.user ? req.session.user._id : null;
                    var _body = _.chain(req.body).cleanRequest().value();
                    cb(null, _body);
                }], function (err, _body) {
                    _TicketReason.create(_body, function (error, result) {
                        console.log(139, error, result)
                        res.json({code: error ? 500 : 200, message: error ? error : result});
                    });
                })
            }
        });
    }
};

exports.edit = function (req, res) {
    _TicketReason.findById(req.params.ticketreason).populate('idCategory','name').exec(function (error, rea) {
        _TicketSubreason.find({idReason:req.params.ticketreason}, null, {sort:{priority:1}},function(err, sub){
            _.render(req, res, 'ticket-reason-edit', {
                title: 'Chỉnh sửa tình trạng',
                plugins: [['chosen'], ['bootstrap-select'], ['jquery-ui']],
                currentReason: rea,
                subreason:sub
            }, !_.isNull(rea), error);
        });
    });
};

exports.update = function (req, res) {
    req.body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
    req.body['status'] = (_.has(req.body, 'status')&&req.body['status']!=0) ? 1 : 0;
    req.body['updatedDate'] = _moment()._d;
    _TicketReason.update({_id: req.params['ticketreason']}, req.body, {new: true}, function (error, group) {
        console.log(error)
        res.json({code: (error ? 500 : 200), message: error ? error : 'Cập nhật thành công !'})
    });
};

exports.destroy = function (req, res) {
    _TicketReason._remove(req.body.ids.split(','), function (error, group) {
        res.json({
            code: (error ? 500 : 200),
            message: error ? error : ''
        });
    });
};

exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value();
    if (_.has(_query, 'x-' + _.cleanValidateKey(req.query.fieldId)) && _.isEqual(_query[_.cleanValidateKey(req.query.fieldId)], _query['x-' + _.cleanValidateKey(req.query.fieldId)])) {
        res.json([req.query.fieldId, true]);
    } else {
        delete _query['x-' + _.cleanValidateKey(req.query.fieldId)];
        _TicketReason.findOne(_query).exec(function (error, f) {
            res.json([req.query.fieldId, _.isNull(f)]);
        });
    }
};