var titlePage = 'Mức độ hài lòng khách hàng';

exports.index = {
    json: function (req, res) {
        //var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        //var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        //var query = _.cleanRequest(req.query);
        //var aggregate = _CustomerGroups.aggregate();
        //aggregate._pipeline = [];
        //aggregate._pipeline.push({$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}});
        //if (!_.isEmpty(query)) aggregate._pipeline.push({$match: query});
        //aggregate._pipeline.push({$sort: {'sources.name': -1}});
        //_CustomerGroups.aggregatePaginate(aggregate, {
        //    page: (_.isEqual(page, 1) ? 0 : ((page - 1) * rows)),
        //    limit: rows
        //}, function (error, groups, pageCount, count) {
        //    var x = _.chain(groups)
        //        .each(function (g) {
        //            g.sources = _.sortBy(g.sources, 'amount').reverse();
        //            g.total = _.reduce(g.sources, function (memo, num) {
        //                return memo + num.amount;
        //            }, 0);
        //        })
        //        .value();
        //    res.json(x);
        //});
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = _.cleanRequest(req.query);
        var aggregate = _CustomerStatisfy.aggregate();
        aggregate._pipeline = [];
        aggregate._pipeline.push({
            $lookup: {
                from: 'customerstatisfystages',
                localField: '_id',
                foreignField: 'idCustomerStatisfy',
                as: 'stage'
            }
        });

        aggregate._pipeline.push({$sort: {name: 1}});

        _CustomerStatisfy.aggregatePaginate(
            aggregate,
            {page: (_.isEqual(page, 1) ? 0 : ((page - 1) * rows)), limit: rows},
            function (error, cs, pageCount, count) {
                var paginator = new pagination.SearchPaginator({prelink: '/customer-statisfy', current: page, rowsPerPage: rows, totalResult: count});
                _.render(req, res, 'customer-statisfy', {
                    title: titlePage,
                    paging: paginator.getPaginationData(),
                    statisfy: cs
                }, true);
            });
    }
};

exports.edit = function (req, res) {
    if (_.isEqual(req.query.stage, '0')) {
        _CustomerStatisfy.findById(req.params.customerstatisfy, function (error, cs) {
            res.json({code: (error ? 500 : 200), message: error ? error.message : cs});
        });
    } else {
        _CustomerStatisfyStage.findById(req.params.customerstatisfy, function (error, cs) {
            res.json({code: (error ? 500 : 200), message: error ? error.message : cs});
        })
    }
};

exports.create = function (req, res) {
    if (_.isEqual(req.query.stage, '0')) {
        _CustomerStatisfy.create(_.chain(req.body).cleanRequest().mapObject(_.trimValue).value(), function (error, cs) {
            res.json({code: (error ? 500 : 200), message: error ? error : 'OK'})
        });
    } else {
        var _body = {name: req.body.name, idCustomerStatisfy: _.convertObjectId(req.body.statisfy), status: req.body.status};
        _CustomerStatisfyStage.create(_.chain(_body).mapObject(_.trimValue).value(), function (err, r) {
            res.json({code: err ? 500 : 200, message: err ? err.message : r});
        })
    }
};

exports.update = function (req, res) {
    if (_.isEqual(req.query.stage, '0')) {
        _CustomerStatisfy.update(
            {_id: req.params.customerstatisfy},
            _.chain(req.body).cleanRequest().mapObject(_.trimValue).value(),
            {new: true},
            function (error) {
                res.json({code: (error ? 500 : 200), message: error ? error : 'OK'})
            });
    } else {
        _CustomerStatisfyStage.update(
            {_id: req.params.customerstatisfy},
            _.chain(req.body).cleanRequest().mapObject(_.trimValue).value(),
            {new: true},
            function (error) {
                console.log(101, error);
                res.json({code: (error ? 500 : 200), message: error ? error : 'OK'})
            });
    }
};

exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).mapObject(_.trimValue).value();
    if (_.has(req.query, 'stage')) {
        var temp = {idCustomerStatisfy: _.convertObjectId(_query.statisfy)};

        if (_.has(_query, 'x-name')) {
            temp['$and'] = [
                {name: _query.name},
                {name: {$ne: _query['x-name']}}
            ];
        } else {
            temp['name'] = _query.name;
        }
        _CustomerStatisfyStage.findOne(
            temp,
            function (err, f) {
                res.json([req.query.fieldId, _.isNull(f)]);
            }
        )
    } else {
        if (_.has(_query, 'x-' + _.cleanValidateKey(req.query.fieldId))
            && _.isEqual(_query[_.cleanValidateKey(req.query.fieldId)], _query['x-' + _.cleanValidateKey(req.query.fieldId)])) {
            res.json([req.query.fieldId, true]);
        } else {
            delete _query['x-' + _.cleanValidateKey(req.query.fieldId)];

            _CustomerStatisfy.findOne(_query).exec(function (error, f) {
                res.json([req.query.fieldId, _.isNull(f)]);
            });
        }
    }
};

exports.destroy = function (req, res) {
    var objectId = _.convertObjectId(req.params.customerstatisfy);

    if (_.has(req.query, 'stage') === '0'){
        // Check _CustomerStatisfy
        _async.waterfall([
            function(callback){
                _CustomerStatisfyStage.findOne({idCustomerStatisfy: objectId}, {_id: 1}, callback);
            },
            function(t, callback){
                if (!_.isNull(t)) return callback(new Error('Đang có tiêu chí nằm trong mức độ này !'));
                _Tickets.findOne({customerStatisfy: objectId}, {_id: 1}, function(err, result){
                    if (err) return callback(err);
                    if (!_.isNull(result)) return callback(new Error('Đang có ticket sử dụng mức độ này'));
                    callback();
                });
            }
        ], function(err){
            if (err) return res.json({code: 500, message: err.message});

            _CustomerStatisfy.remove({_id: objectId}, function(err){
                res.json({code: err ? 500 : 200, message: err ? err.message: 'OK'});
            })
        });
    }else{
        _Tickets.findOne({customerStatisfyStage: objectId}, {_id: 1}, function(err, result){
            if (err) return res.json({code: 500, message: err.message});
            if (!_.isNull(result)) return res.json({code: 500, message: 'Đang có ticket sử dụng tiêu chí này'});

            _CustomerStatisfyStage.remove({_id: objectId}, function(err){
                res.json({code: err ? 500 : 200, message: err ? err.message: 'OK'});
            })
        });
    }
}

//var page = 1;
//var rows = 10;
//var aggregate = _CustomerStatisfy.aggregate();
//aggregate._pipeline = [];
//aggregate._pipeline.push({
//    $lookup: {
//        from: 'customerstatisfystages',
//        localField: '_id',
//        foreignField: 'idCustomerStatisfy',
//        as: 'stage'
//    }
//});
//
//aggregate._pipeline.push({$sort: {name: 1}});
//
//_CustomerStatisfy.aggregatePaginate(
//    aggregate,
//    {page: (_.isEqual(page, 1) ? 0 : ((page - 1) * rows)), limit: rows},
//    function (error, cs, pageCount, count) {
//        var paginator = new pagination.SearchPaginator({
//            prelink: '/customer-statisfy',
//            current: page,
//            rowsPerPage: rows,
//            totalResult: count
//        });
//
//        console.log(113, cs);
//    });