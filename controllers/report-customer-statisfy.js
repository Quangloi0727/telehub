/**
 * Created by baygiomoidc on 8/24/16.
 */
var titlePage = 'Báo cáo chi tiết khảo sát gọi ra';
var searchNotFoundError = new Error('Không tìm thấy kết quả với khoá tìm kiếm');
var accessDenyError = new Error('Không đủ quyền truy cập');
var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));
var zipFolder = require('zip-folder');
var cond = [];

exports.index = {
    json: function (req, res) {
        if (_.has(req.query, 'status')) req.query.status = parseInt(req.query.status);
        getTickets(req, res, function (err, result) {
            if (err && _.isString(err)) {
                var conditions = arguments[1];
                exportExcel(req, res, conditions);
                return;
            }

            if (err) return res.json({ code: 500, message: err.message });
            res.json({
                code: 200,
                message: result
            })
        });
    },
    html: function (req, res) {
        if(!(req.session.auth && req.session.auth)) return res.render('404', {title: '404 | Page not found'});
        var _company = null;
        var _agentQuery = null;

        if (req.session.auth.company && !req.session.auth.company.leader) {
            _company = req.session.auth.company._id;
            if(req.session.auth.company.group.leader){
                // Team lead
                var _group = req.session.auth.company.group._id;
                _agentQuery = {$or: [
                    {agentGroupLeaders: {$elemMatch: {group: _group}}},
                    {agentGroupMembers: {$elemMatch: {group: _group}}}
                ]}
            }else{
                // Agent
                _agentQuery = {_id:  new mongodb.ObjectId(req.session.user._id.toString())};
            }
        }else if(req.session.auth.company && req.session.auth.company.leader){
            // Company Leader
            _company = req.session.auth.company._id;
        }else if(!req.session.auth.company){
            // Leader
        };

        _async.parallel({
            companies: function(next){
                // Truy vấn danh sách công ty
                _Company.find(_company ? {_id: _company} : {}, next);
            },
            agents: function(next){
                // Truy vấn danh sách agent
                _Users.find(_agentQuery ? _agentQuery : {}).sort({displayName: 1}).exec(next);
            },
            customerStatisfy: function (next) {
                // Truy vấn danh sách mức độ hài lòng
                var aggs = [];
                aggs.push({$lookup:{ from: 'customerstatisfystages', localField: '_id', foreignField: 'idCustomerStatisfy', as: 'stages' }});
                _CustomerStatisfy.aggregate(aggs, next);
            },
        }, function(err, result){
            return _.render(req, res, 'report-customer-statisfy', _.extend({
                title: titlePage,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-daterangepicker'], ['chosen']]
            }, result), true, err);
        });
    }
};

/**
 * Phân quyền dữ liệu
 * @param req
 * @param callback
 * @returns {*}
 */
function permissionConditions(req, callback) {
    if(!(req.session.auth && req.session.auth)) {
        var err = new Error('session auth null');
        return callback(err);
    };

    var cond = [];
    var _group = null;
    var _comIds = [];
    if (req.session.auth.company && !req.session.auth.company.leader) {
        _comIds.push(req.session.auth.company._id);
        if(req.session.auth.company.group.leader){
            // Team lead
            _group = req.session.auth.company.group._id;
        }else{
            // Agent
            cond.push({$match: {idAgent:  new mongodb.ObjectId(req.session.user._id.toString())}});
        }
    }else if(req.session.auth.company && req.session.auth.company.leader){
        // Company Leader
        _comIds.push(req.session.auth.company._id);
    }else if(!req.session.auth.company){
        // Leader
    };

    var _cpsIds = [];
    var _svsIds = [];

    if(_.has(req.query, 'idCompany') && req.query.idCompany.length > 0) _comIds = _.union(_comIds, req.query.idCompany);

    _async.waterfall([
        function(next){
            if(_group){
                _Users.distinct('_id', {$or: [
                    {agentGroupLeaders: {$elemMatch: {group: _group}}},
                    {agentGroupMembers: {$elemMatch: {group: _group}}}
                ]}, next);
            }else {
                next(null, null);
            };
        },
        function(userIds, next){
            if(userIds) cond.push({$match: {idAgent:  {$in: userIds}}});
            _Campains.distinct('_id', _comIds.length > 0 ? {idCompany: {$in: _comIds}} : {}, next);
        },
        function(ids, next){
            _cpsIds = ids;
            _Services.distinct('_id', _comIds.length > 0 ? {idCompany: {$in: _comIds}} : {}, next);
        }
    ], function(err, ids){
        _svsIds = ids;
        var orConds = [];
        orConds.push({ idCampain: { $in: _cpsIds} });
        orConds.push({ idService: { $in: _svsIds} });
        cond.push({ $match: {$or: orConds}});
        callback(err, cond);
    });
}
/**
 * Truy vấn dữ liệu ticket
 * @param req
 * @param res
 * @param callback
 */
function getTickets(req, res, callback) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

    var _query = _.cleanRequest(req.query, ['_'
        , 'idCompany'
        , 'created'
        , 'statisfy'
        , 'formId'
        , 'dt'
        , 'ignoreSearch'
        , 'socketId'
        , 'download'
        , 'totalResult'
        , 'field_so_dien_thoai'
    ]);

    _async.waterfall([
        function (next) {
            permissionConditions(req, next);
        },
        function (cond, next) {
            var obj = {};
            if(_.has(req.query, 'idAgent') && req.query.idAgent.length > 0) obj.idAgent = {$in: _.arrayObjectId(req.query.idAgent)};

            if (req.query.created) {
                var _d1 = _moment(req.query.created.split(' - ')[0], 'DD/MM/YYYY');
                var _d2 = req.query.created.split(' - ')[1] ? _moment(req.query.created.split(' - ')[1], 'DD/MM/YYYY') : _moment(_d1).endOf('day');

                var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
                var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
                startDay = startDay.startOf('day');
                endDay = endDay.endOf('day');

                obj['created'] = {$gte: startDay._d, $lt: endDay._d};
            };

            if (req.query.statisfy) {
                var statisfy = req.query.statisfy.split('-')[0];
                var statisfyStage = req.query.statisfy.split('-')[1];
                obj['customerStatisfy'] = _.convertObjectId(statisfy);
                if(statisfyStage) obj['customerStatisfyStage'] = _.convertObjectId(statisfyStage);
            };

            cond.push({$match: obj});

            cond.push({$group : {
                _id: '$customerStatisfyStage',
                count: { $sum: 1 }
            }});

            cond.push({
                $lookup: {
                    from: 'customerstatisfystages',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerStatisfyStage'
                }
            });
            cond.push({ $unwind: { path: '$customerStatisfyStage', preserveNullAndEmptyArrays: true } });
            cond.push({
                $lookup: {
                    from: 'customerstatisfies',
                    localField: 'customerStatisfyStage.idCustomerStatisfy',
                    foreignField: '_id',
                    as: 'customerStatisfy'
                }
            });
            cond.push({ $unwind: { path: '$customerStatisfy', preserveNullAndEmptyArrays: true } });
            cond.push({
                $group: {
                    _id: '$_id',
                    customerStatisfyStage: { $first: '$customerStatisfyStage.name' },
                    customerStatisfyId: { $first: '$customerStatisfy._id' },
                    customerStatisfy: { $first: '$customerStatisfy.name' },
                    count: { $first: '$count' }
                }
            });
            cond.push({
                $sort: {customerStatisfy : 1, customerStatisfyStage: 1}
            });

            if (_.has(req.query, 'download') && !_.isEqual(req.query.download, '0')) {
                return callback('download', cond);
            };

            _Tickets.aggregate(cond, function (err, result) {
                next(err, {data: result});
            });

            //_Tickets.aggregatePaginate(_Tickets.aggregate(cond), {page: page, limit: rows}, function (err, result, pageCount, count) {
            //    var paginator = new pagination.SearchPaginator({prelink: '/report-customer-statify', current: page, rowsPerPage: rows, totalResult: count});
            //    next(err, {data: result, paging: paginator.getPaginationData()});
            //});
        }
    ], function(err, result){
        callback(err, result);
    });
};

/**
 * Xuất file báo cáo
 * @param req
 * @param res
 * @param conditions Điều kiên truy vấn
 */
function exportExcel(req, res, conditions) {
    var maxRecordPerFile = 2000;
    var maxParallelTask = 5;
    var waterFallTask = [];
    var currentDate = new Date();
    var folderName = req.session.user._id + "-" + currentDate.getTime();
    var fileName = titlePage + ' ' + _moment(currentDate).format('DD-MM-YYYY');

    var temp = function (callback) {
        _Tickets.aggregate(conditions, function (err, result) {
            if (err) return callback(err, null);
            createExcelFile(req
                , folderName
                , fileName
                , result
                , callback);
        });
    };
    waterFallTask.push(temp);

    waterFallTask.push(
        function (objectId, callback) {
            fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'archiver'), callback);
        },
        function (t, callback) {
            var folderPath = path.join(_rootPath, 'assets', 'export', 'ticket', folderName);
            var folderZip = path.join(_rootPath, 'assets', 'export', 'archiver', folderName + '.zip');
            zipFolder(folderPath, folderZip, function (err) {
                callback(err, folderZip.replace(_rootPath, ''));
            });
        }
    );

    _async.waterfall(waterFallTask, function (err, folderZip) {
        res.json({ code: err ? 500 : 200, message: err ? err.message : folderZip });
    });
}
/**
 * Tạo file excel
 * @param req
 * @param folderName
 * @param fileName
 * @param data
 * @param callback
 */
function createExcelFile(req, folderName, fileName, data, callback) {
    var options = {
        filename: path.join(_rootPath, 'assets', 'export', 'ticket', folderName, fileName + '.xlsx'),
        useStyles: true,
        useSharedStrings: true,
        dateFormat: 'DD/MM/YYYY HH:mm:ss'
    };

    _async.waterfall([
        function (next) {
            fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'ticket', folderName), next);
        },
        function (t, next) {
            fsx.readJson(path.join(_rootPath, 'assets', 'const.json'), next);
        },
        function (_config, next) {
            var excelHeader = ['TXT_STAGE'
                , 'TXT_STATISFY'
                , 'TXT_COUNT'
                , 'TXT_RATIO'
            ];

            var workbook = new _Excel.Workbook();
            workbook.creator = req.session.user.displayName;
            workbook.created = new Date();
            var sheet = workbook.addWorksheet(titlePage);
            var column = [];

            _.each(excelHeader, function (header) {
                column.push({
                    header: _config.MESSAGE.REPORT_CUSTOMER_STATISFY[header],
                    key: header,
                    width: _config.MESSAGE.REPORT_CUSTOMER_STATISFY[header].length
                });
            });

            sheet.columns = column;

            if (data !== null) {
                var total = 0;

                _.each(data ,function (el) {
                    if (_.isEmpty(el)) return;
                    total += el.count;
                });

                _async.eachSeries(data, function (item, cb) {
                    var row = [item.customerStatisfyStage ? item.customerStatisfyStage : 'None'
                        ,item.customerStatisfy ? item.customerStatisfy : 'None'
                        ,item.count ? item.count : ''
                        ,parseInt((item.count/total)*100)+'%'];
                    sheet.addRow(row);
                    cb(null, null);
                }, function (err, result) {
                    workbook.xlsx.writeFile(options.filename)
                        .then(next);
                });
            } else {
                workbook.xlsx.writeFile(options.filename)
                    .then(next);
            }
        }
    ], function (err, result) {
        callback(err, data[data.length - 1]._id);
    });
};

function changeStatus(status) {
    switch (status) {
        case 0:
            return 'Chờ xử lý';
        case 1:
            return 'Đang xử lý';
        default:
            return 'Hoàn thành';
    }
}