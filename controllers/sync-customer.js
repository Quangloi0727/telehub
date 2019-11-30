/**
 * Created by NghiaTM on 1/18/2016.
 */

var syncManager = require(path.join(_rootPath, 'monitor', 'sync-customer.js'));

exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        _async.parallel({
            create: function(next) {
                //_SyncCustomerLog.create({
                //    note: 'test',
                //    type: 1,
                //    createBy: req.session.user._id,
                //}, function(err, result){
                //    syncManager.initSync(req.session.user ? req.session.user._id.toString() : null, result);
                //});

                //_SyncCustomerLog.create({
                //    name: 'test',
                //    type: 2,
                //    createBy: req.session.user._id,
                //    query: {},
                //    packageSize: 10
                //}, function(err, result){
                //    syncManager.initGet(req.session.user ? req.session.user._id.toString() : null,result);
                //});
                next(null);
            }
        }, function(err, result){
            var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
            var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

            _SyncCustomerLog
                .find({})
                .populate('createBy','name')
                .sort({created : -1})
                .paginate(page, rows, function (error, data, total) {
                    var syncCustomer = require(path.join(_rootPath, 'monitor', 'sync-customer.js'));
                    syncCustomer.setUser(req.session.user ? req.session.user._id.toString() : null);

                    var paginator = new pagination.SearchPaginator({prelink: '/sync-customer', current: page, rowsPerPage: rows, totalResult: total});
                    _.render(req, res, 'sync-customer',
                        {
                            title: 'Đồng bộ khách hàng',
                            categories: data,
                            plugins: [['bootstrap-select']],
                            paging: paginator.getPaginationData()
                        }, true, error);
                });
        });
    }
};

exports.new = function (req, res) {
    _CustomerGroups.aggregate([
        {$lookup: {from: 'customersources', localField: '_id', foreignField: 'group', as: 'sources'}},
        {$match: {status: 1}},
        {$sort: {name: 1, 'sources.name': 1}}
    ], function(err, result){
        if (err) return res.render('404', {title: '404 | Page not found'});

        _.render(req, res, 'sync-customer-new', {
            plugins: [['chosen'], ['bootstrap-select']],
            title: 'Tạo mới yêu cầu',
            groups: result
        }, true);
    });
};

exports.create = function (req, res) {
    var body = JSON.parse(req.body['data']);
    body['createBy'] = req.session.user._id;
    body.sessionId = createID();
    _async.waterfall([
        function(next){
            _SyncCustomerLog.count({name: body.name}, next);
        },
        function(count,next){
            (count == 0) ? _SyncCustomerLog.create(body, next) : next(count, null);
        }
    ],function(err, result){
        if(body.isStart){
            if(body.type == 1){
                syncManager.initSync(result);
            }else {
                syncManager.initGet(result);
            }
        }
        res.json({code: (err ? 500 : 200), message: err? 'Có lỗi xảy ra' : ''});
    });
};

exports.validate = function (req, res) {
    var query = _.has(req.query, '_id') ? {
        name: req.query.name,
        _id: {$ne: req.query._id}
    } : {name: req.query.name};

    _SyncCustomerLog.findOne(query, function (error, f) {
        res.json([req.query.fieldId, _.isNull(f)]);
    });
};

function createID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4();
}