/**
 * Created by luongvanlam on 5/20/16.
 */

var requestKpiCollection = require(path.join(_rootPath, 'queue', 'common', 'request-kpi-collection.js'));
var titleIndex = 'Quản lý bộ tiêu chí chấm điểm';
var pagePrefix = 'kpi-mark-collection{0}';

exports.index = function (req, res) {
    //Todo: Query và show các bộ tiêu chí chấm điểm
    showCollection(req, res);
};

exports.create = function (req, res) {
    //Todo: Tạo mới bộ tiêu chí chấm điểm
    var objectId = _.convertObjectId(req.params.kpimarkcollection);
    _KpiMarking.findOne({markCollectionId: objectId}, function(err, result){
        if (result == null){
            var _body = _.chain(req.body).cleanRequest('_id').replaceMultiSpaceAndTrim().value();
            _body.status = parseInt(_body.status);
            _body.type = parseInt(_body.type);

            var coreKpi = _body.corekpi;
            delete _body.corekpi;

            if (_.has(req.query, 'currentId') && !_.isEqual(req.query.currentId, '')){
                var currentId = _.convertObjectId(req.query.currentId);
                _KpiMarkCollection.update({_id: currentId}, {$set: _body}, function(err, result){
                    res.json({code: err ? 500 : 200, message: err ? err.message : result});
                });
                return;
            }

            _async.waterfall([
                function(callback){
                    _KpiMarkCollection.create(_body, callback); //tạo bộ tiêu chí
                },
                function(collection, callback){
                    if (_.isEqual(coreKpi, '')){
                        callback(null, collection, null);
                    }else{
                        //Yêu cầu đồng bộ với CORE
                        requestKpiCollection.RequestAddKPI(coreKpi, function(){
                            callback(new Error('Request Kpi Content Time Out'));
                        }, function(obj){
                            var err = null;
                            if (!_.isNull(obj.error)){
                                err = new Error(obj.error);
                            }
                            callback(err, collection, obj.kpi);
                        })
                    }
                },
                function(collection, kpi, callback){
                    if (_.isNull(kpi) || kpi.length == 0) return callback(null, null);
                    //Todo: bulk insert
                    var batch = mongoClient.collection('kpimarkcontents').initializeUnorderedBulkOp({useLegacyOps: true});
                    _.each(kpi, function(item, index){
                        delete item._id;

                        item.idCollection = collection._id;
                        batch.insert(item);
                    });

                    batch.execute(callback);
                }
            ], function(err, result){
                res.json({code: err ? 500 : 200, message: err ? err.message : result});
            });
        }
        else{
            res.json({code: 500, message: 'Chỉ có thể sửa bộ tiêu chí khi chưa chấm điểm!'});
        }
    });

};

exports.edit = function (req, res) {
    //Todo: Sửa bộ tiêu chí
    var objectId = _.convertObjectId(req.params.kpimarkcollection);
    _KpiMarking.findOne({markCollectionId: objectId}, function(err, result){
        if (result == null){
            _KpiMarkCollection.findOne({_id: objectId}, function (err, result) {
                res.json({code: err ? 500 : 200, message: err ? err.message : result});
            });
        }
        else{
            res.json({code: 500, message: 'Chỉ có thể sửa bộ tiêu chí khi chưa chấm điểm!'});
        }
    });
};

exports.destroy = function (req, res) {
    //Todo: Xóa bộ tiêu chí
    var params = req.params['kpimarkcollection'].split('-');
    params = _.reduce(params, function(memo, item){
        if (!mongodb.ObjectID.isValid(item)) return memo;
        memo.push(_.convertObjectId(item));
        return memo;
    }, []);

    _async.parallel({
        collection: function(callback){
            _KpiMarkCollection.remove({_id: {$in: params}}, callback);
        },
        content: function(callback){
            _KpiMarkContent.remove({idCollection: {$in: params}}, callback);
        }
    }, function(err, result){
        res.json({code: err ? 500 : 200, message: err ? err.message : result});
    });
};

exports.validate = function (req, res) {
    //Todo: Check xem bộ tiêu chí có bị trùng không
    var _query = _.chain(req.query).cleanRequest().replaceMultiSpaceAndTrim().value();

    var query = _.has(_query, 'cId') ? {
        name: _query.name,
        _id: {$ne: _.convertObjectId(_query.cId)}
    } : {name: _query.name};

    _KpiMarkCollection.findOne(query, function (error, f) {
        res.json([_query.fieldId, _.isNull(f)]);
    });
};


function showCollection(req, res) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
    var agg = _KpiMarkCollection.aggregate();

    if (_.has(req.query, 'name')) {
        agg._pipeline.push({$match: {name: {$regex: new RegExp(_.stringRegex(req.query.name), 'i')}}})
    }
    if (_.has(req.query, 'status')) {
        agg._pipeline.push({$match: {status: parseInt(req.query.status)}})
    }

    if (_.has(req.query, 'sort')) {
        var stringArr = req.query.sort.split(':');
        var sortCondition = {};
        sortCondition[stringArr[0]] = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
        if (!_.isEmpty(sortCondition)){
            agg._pipeline.push({$sort: sortCondition});
        }
    }

    agg._pipeline.push(
        {
            $project: {
                _id: 1,
                name: 1,
                status: 1,
                type: 1
            }
        }
    );
    
    _async.parallel({
        fromCore : function (callback) {
            requestKpiCollection.RequestKPI({status: 1}, function(){
                var err = new Error('Request KPI Collections time out');
                callback(err);
            }, function(obj){
                var err = null;
                if (obj.error != null){
                    err = new Error(obj.error);
                }
                callback(err, obj.kpi);
            })
        },
        currentCollection: function (callback) {
            _KpiMarkCollection.aggregatePaginate(agg, {
                page: page,
                limit: rows
            }, function (err, result, node, total) {
                var paginator = new pagination.SearchPaginator({
                    prelink: '/kpi-mark-collection',
                    current: page,
                    rowsPerPage: rows,
                    totalResult: total
                });

                var obj = {paging : paginator.getPaginationData(), kpi: result};

                callback(err, obj);
            });
        }
    }, function(err, result){
        _.render(req, res, pagePrefix.zFormat(''), {
            title: titleIndex,
            kpi: result.currentCollection.kpi,
            plugins: [['bootstrap-select'], ['chosen']],
            paging: result.currentCollection.paging,
            coreKPI : result.fromCore
        }, true, err);
    });
}