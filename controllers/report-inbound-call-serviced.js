/**
 * Created by luongvanlam on 5/9/16.
 */
var titlePage = 'Báo cáo cuộc gọi được phục vụ';
var searchNotFoundError = new Error('Không tìm thấy kết quả với khoá tìm kiếm');
var accessDenyError = new Error('Không đủ quyền truy cập');
var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));
var zipFolder = require('zip-folder');
var matchConditions = {
    transType: {$in:[1,7,8]}, // Gọi vào
    //serviceType: 3, // Cuộc gọi đến agent
    //agentId: {$ne: null},
    //callDuration: {$gte: 0},
    //waitDuration: {$gte: 0},
    startTime: {$gte: 0},
    endTime: {$gte: 0},
    //ringTime: {$gte: 0},
    //answerTime: {$gte: 0}
};
//CdrTransInfoSchema:
//transType: 1 --> gọi vào
//serviceType : Agent
//startTime: {type: Number},
//endTime: {type: Number},
//ringTime: {type: Number},
//answerTime: {type: Number},
// 4 truong khac null


exports.index = {
    json: function (req, res) {
        getCdr(req, res, function (err, result) {
            if (err && _.isString(err)) {
                var conditions = arguments[1];
                var totalResult = arguments[2];
                exportExcel(req, res, conditions, totalResult);
                return;
            }

            res.json({
                code: err ? 500 : 200,
                message: err ? err.message : result
            });
        });
    },
    html: function (req, res) {
        if (req.session.auth.company && !req.session.auth.company.leader) {
            return _.render(req, res, 'report-inbound-call-serviced', {
                title: titlePage,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-daterangepicker'], ['chosen']],
                data: null
            }, true, accessDenyError);
        }

        var isTenantLeader = _.isNull(req.session.auth.company);

        _async.parallel({
                company: function (callback) {
                    if (isTenantLeader) {
                        _Company.find({}, {_id: 1, name: 1}, callback);
                    } else {
                        if (_.has(req.session.auth.company, '_id') && _.has(req.session.auth.company, 'name')) {
							callback(null, [{
							    _id: _.convertObjectId(req.session.auth.company._id),
                                name: req.session.auth.company.name
                            }]);
                        } else {
                            callback(accessDenyError);
                        }
                    }
                },
                user: function (callback) {
                    if (isTenantLeader) {
                        _Users.find({}, {_id: 1, name: 1, displayName: 1}, callback);
                    } else {
                        var companyId = _.convertObjectId(req.session.auth.company._id);

                        _async.waterfall([
                            function (callback) {
                                _AgentGroups.find({
                                    idCompany: companyId
                                }, {_id: 1}, callback);
                            },
                            function (agId, callback) {
                                agId = _.pluck(agId, '_id');

                                _Users.find({
                                    $or: [
                                        {'agentGroupMembers.group': {$in: agId}},
                                        {'agentGroupLeaders.group': {$in: agId}},
                                        {'companyLeaders.company': companyId}
                                    ]
                                }, {_id: 1, name: 1, displayName: 1}, callback)
                            }
                        ], callback);
                    }
                },
                service: function (callback) {
                    var agg = [];
                    if (!isTenantLeader) {
                        var companyId = _.convertObjectId(req.session.auth.company._id);
                        agg.push({$match: {idCompany: companyId}})
                    }

                    agg.push(
                        {
                            $lookup: {
                                from: 'companies',
                                localField: 'idCompany',
                                foreignField: '_id',
                                as: 'company'
                            }
                        },
                        {$unwind: '$company'},
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                company: 1
                            }
                        },
                        {
                            $group: {
                                _id: '$company._id',
                                name: {$first: '$company.name'},
                                service: {$push: {_id: '$_id', name: '$name'}}
                            }
                        }
                    );

                    _Services.aggregate(agg, callback);
                }
            }, function (err, result) {
                _.render(req, res, 'report-inbound-call-serviced', {
                    title: titlePage,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-daterangepicker'], ['chosen'], ['highchart']],
                    company: result.company,
                    agent: result.user,
                    services: result.service
                }, true, err);
            }
        );
    }
};

exports.update = function (req, res) {
    var query = req.body;

    var page = _.has(query, 'page') ? parseInt(query.page) : 1;
    var rows = _.has(query, 'rows') ? parseInt(query.rows) : 10;

    _async.waterfall([
        function (callback) {
            getServicesId(req, res, callback);
        },
        function (serviceId, callback) {
            var matchObj = JSON.parse(JSON.stringify(matchConditions));

            if (!_.isNull(serviceId))
                matchObj['serviceId'] = {$in: serviceId};


            if (_.has(req.query, 'agentId'))
                matchObj['agentId'] = {$in:_.arrayObjectId(req.query.agentId)};
            var agg = [{$match: matchObj}];
            _.log(159,agg)
            switch (parseInt(req.body.type)) {
                case 0:
                    // dynamic duration
                    agg.push(
                        {
                            $match: {
                                $and: [
                                    {durationBlock: {$gte: Math.floor(query.start / 5)}},
                                    {durationBlock: {$lte: Math.floor(query.end / 5)}}
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                time: {
                                    $subtract: ['$endTime', '$answerTime']
                                }
                            }
                        }
                    );
                    break;
                case 1:
                    // dynamic waiting
                    agg.push(
                        {
                            $match: {
                                $and: [
                                    {waitingDurationBlock: {$gte: Math.floor(query.start / 5)}},
                                    {waitingDurationBlock: {$lte: Math.floor(query.end / 5)}}
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                time: {
                                    $subtract: ['$answerTime', '$ringTime']
                                }
                            }
                        }
                    );
                    break;
            }

            agg.push({
                $group: {
                    _id: null,
                    count: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {$gte: ['$time', req.body.start * 1000]},
                                        {$lte: ['$time', req.body.end * 1000]}
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            });

            _CdrTransInfo.aggregate(agg, callback);
        }
    ], function (err, result) {
        res.json({code: err ? 500 : 200, message: err ? err.message : result.length ? result[0].count : result});
    });
};

exports.show = function (req, res) {
    return res.json({code: 200, message: 'Đang tìm hiểu dữ liệu'});
    // using for sla
    var value = req.query.value;
    var temp = req.query.service.split('-');

    _async.waterfall([
        function (callback) {
            if (temp[0] == 'c') {
                // CompanyId

            } else {
                // ServiceId

            }
        }
    ], function (err, result) {

    });

};

function getCdr(req, res, callback) {
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

    var _query = _.cleanRequest(req.query, ['_']);
    _async.waterfall([
        function (callback) {
            getServicesId(req, res, callback);
        },
        function (serviceId, callback) {
            var matchObj = {};

            if (!_.isNull(serviceId)) matchObj['serviceId'] = {$in: serviceId};
            if (_.has(req.query, 'agentId')) matchObj['agentId'] = {$in:_.arrayObjectId(req.query.agentId)};

            var agg = [{$match: matchConditions}];
            agg.push({
                $group:{
                    _id:'$callId',
                    serviceId:{$max:'$serviceId'},
                    agentId:{$max:'$agentId'},
                    endTime:{$max:'$endTime'},
                    startTime:{$max:'$startTime'},
                    answerTime:{$max:'$answerTime'},
                    caller:{$max:'$caller'},
                    waitDuration:{$sum:{$cond:[{$eq:['$serviceType',3]}, '$waitDuration',0]}},
                    waitingDurationBlock:{$sum:{$cond:[{$eq:['$serviceType',3]}, '$waitingDurationBlock',0]}},
                    callDuration:{$sum:{$cond:[{$eq:['$serviceType',3]}, '$callDuration',0]}},
                    durationBlock:{$sum:{$cond:[{$eq:['$serviceType',3]}, '$durationBlock',0]}},
                }
            });
            agg.push({$match:{answerTime:{$gt:0}, agentId:{$ne:null}}});
            if (_.has(req.query, 'download') && !_.isEqual(req.query.download, '0')) {
                return callback('download', agg, parseInt(req.query.totalResult));
            }

            if (_.has(req.query, 'updated')) {
                matchObj['startTime'] = {
                    $gte: _moment(req.query.updated.split(" - ")[0], "DD/MM/YYYY").valueOf(),
                    $lte: _moment(req.query.updated.split(" - ")[1], "DD/MM/YYYY").endOf('day').valueOf(),
                }
            }
            agg.push({$match: matchObj});
            var __query = parseJSONToObject(JSON.stringify(agg));
            agg.push(
                {$skip: (page - 1) * rows},
                {$limit: rows}
            );
            agg.push.apply(agg, collectCDRInfo());
            //_.log(agg)
            _CdrTransInfo.aggregate(agg, function (err, result) {
                if (err) return callback(err, null);

                createPaging(req, __query, page, rows);

                callback(err, result);
            });
        }
    ], callback);
}

function getServicesId(req, res, callback) {
    if (_.isNull(req.session.auth.company)) {
        console.log(318)
        if (_.has(req.query, 'company')) {
            _Services.find({idCompany: {$in:_.arrayObjectId(req.query.company)}},
                {_id: 1},
                function (err, result) {
                    _.log(322,err,result);
                    callback(err, _.pluck(result, '_id'));
                });
        } else {
            callback(null, null);
        }
    } else {
        console.log(330)
        _Services.find({idCompany: {$in:_.arrayObjectId(req.query.company)}},
            {_id: 1},
            function (err, result) {
                console.log(334,err,result)
                callback(err, _.pluck(result, '_id'));
            });
    }
}

function createPaging(req, agg, page, rows) {
    //_.log(agg)
    //agg.push({
    //    $group:{
    //        _id:'$callId',
    //        serviceId:{$max:'$serviceId'},
    //        agentId:{$max:'$agentId'},
    //        answerTime:{$max:'$answerTime'},
    //        caller:{$max:'$caller'},
    //        waitingDurationBlock:{$sum:{$cond:[{$eq:['$serviceType',3]}, '$waitingDurationBlock',0]}},
    //        durationBlock:{$sum:{$cond:[{$eq:['$serviceType',3]}, '$durationBlock',0]}}
    //    }
    //});
    //agg.push({$match:{answerTime:{$gt:0}, agentId:{$ne:null},serviceId:{$ne:null}}});
    var duration_GroupField = [
        'd_lt_15',
        'd_15_30',
        'd_30_45',
        'd_45_60',
        'd_60_75',
        'd_75_90',
        'd_90_105',
        'd_105_120',
        'd_120_135',
        'd_gt_135'
    ];

    var wait_GroupField = [
        'w_lt_15',
        'w_15_30',
        'w_30_45',
        'w_45_60',
        'w_60_75',
        'w_75_90',
        'w_90_105',
        'w_105_120',
        'w_120_135',
        'w_gt_135'
    ];

    var groupCondition = {
        _id: null,
        count: {$sum: 1}
    };

    _.each(duration_GroupField, function (item) {
        createChartConditions(groupCondition, item, '$durationBlock');
    });

    _.each(wait_GroupField, function (item) {
        createChartConditions(groupCondition, item, '$waitingDurationBlock');
    });

    agg.push({$group: groupCondition});
    _CdrTransInfo.aggregate(agg, function (err, total) {
        var obj = {};
        if (err) {
            obj = {code: 500, message: err.message, formId: req.query.formId, dt: req.query.dt, extra: total[0]};
        } else {
            var _total = _.isEmpty(total[0]) ? 0 : total[0].count;
            var paginator = new pagination.SearchPaginator({
                prelink: '/report-inbound-call-serviced',
                current: page,
                rowsPerPage: rows,
                totalResult: _total
            });
            obj = {
                code: 200,
                message: paginator.getPaginationData(),
                formId: req.query.formId,
                dt: req.query.dt,
                extra: total[0]
            }
        }

        sio.sockets.socket(req.query.socketId).emit('responseReportInboundCallServicedPagingData', obj);
    });
}

function createChartConditions(groupCondition, item, field) {
    var arr = item.split('_');

    if (arr[1] == 'lt') {
        groupCondition[item] = {
            $sum: {
                $cond: [
                    {$lt: [field, Math.floor(parseInt(arr[2]) / 5)]},
                    1, 0
                ]
            }
        }
    } else if (arr[1] == 'gt') {
        groupCondition[item] = {
            $sum: {
                $cond: [
                    {$gt: [field, Math.floor(parseInt(arr[2]) / 5)]},
                    1, 0
                ]
            }
        }
    } else {
        groupCondition[item] = {
            $sum: {
                $cond: [
                    {
                        $and: [
                            {$gte: [field, Math.floor(parseInt(arr[1]) / 5)]},
                            {$lt: [field, Math.floor(parseInt(arr[2]) / 5)]}
                        ]
                    },
                    1, 0
                ]
            }
        }
    }
}

function exportExcel(req, res, conditions, totalResult) {
    var maxRecordPerFile = 2000;
    var maxParallelTask = 5;
    var waterFallTask = [];
    var currentDate = new Date();
    var folderName = req.session.user._id + "-" + currentDate.getTime();
    var fileName = titlePage + ' ' + _moment(currentDate).format('DD-MM-YYYY');

    var date = new Date().getTime();

    if (totalResult > maxRecordPerFile) {
        for (var k = 0; k < Math.ceil(totalResult / (maxRecordPerFile * maxParallelTask)); ++k) {
            var tempWaterfall = [];
            if (k == 0) {
                tempWaterfall = function (callback) {
                    _async.parallel(createParallelTask(k), callback);
                }
            } else {
                tempWaterfall = function (objectId, callback) {
                    var lastObjectId = objectId[maxParallelTask - 1];
                    _async.parallel(createParallelTask(k, lastObjectId), callback);
                }
            }

            waterFallTask.push(tempWaterfall);
        }

        var createParallelTask = function (index, objectId) {
            var tempParallelTask = [];
            var fileNames = [];
            for (var i = 0; i < maxParallelTask; i++) {
                fileNames.push(fileName + '-' + index + '-' + i);
            }
            _.each(fileNames, function (o) {
                var temp = function (callback) {
                    var agg = parseJSONToObject(JSON.stringify(conditions));
                    if (_.isEmpty(objectId)) {
                        agg.push({$limit: maxRecordPerFile});
                    } else {
                        agg.push({$match: {_id: {$gt: objectId}}}, {$limit: maxRecordPerFile});
                    }

                    agg.push.apply(agg, collectCDRInfo());

                    _CdrTransInfo.aggregate(agg, function (err, result) {
                        if (err) return callback(err, null);
                        createExcelFile(req
                            , folderName
                            , o
                            , result
                            , callback);
                    });
                };

                tempParallelTask.push(temp);
            })
            return tempParallelTask;
        }
    } else {
        var temp = function (callback) {
            conditions.push.apply(conditions, collectCDRInfo());

            _CdrTransInfo.aggregate(conditions, function (err, result) {
                if (err) return callback(err, null);
                createExcelFile(req
                    , folderName
                    , fileName
                    , result
                    , callback);
            });
        };
        waterFallTask.push(temp);
    }

    waterFallTask.push(
        function (objectId, callback) {
            _async.parallel({
                archiver: function (callback) {
                    fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'archiver'), callback);
                },
                cdr: function (callback) {
                    fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'cdr'), callback);
                }
            }, callback);
        },
        function (t, callback) {
            var folderPath = path.join(_rootPath, 'assets', 'export', 'cdr', folderName);
            var folderZip = path.join(_rootPath, 'assets', 'export', 'archiver', folderName + '.zip');
            zipFolder(folderPath, folderZip, function (err) {
                callback(err, folderZip.replace(_rootPath, ''));
            });
        }
    );

    _async.waterfall(waterFallTask, function (err, folderZip) {
        res.json({code: err ? 500 : 200, message: err ? err.message : folderZip});
    });
}

function createExcelFile(req, folderName, fileName, data, callback) {
    var options = {
        filename: path.join(_rootPath, 'assets', 'export', 'cdr', folderName, fileName + '.xlsx'),
        useStyles: true,
        useSharedStrings: true,
        dateFormat: 'DD/MM/YYYY HH:mm:ss'
    };

    _async.waterfall([
        function createFolder(callback) {
            fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'cdr', folderName), callback);
        },
        function (t, callback) {
            fsx.readJson(path.join(_rootPath, 'assets', 'const.json'), callback);
        },
        function createExcelFile(_config, callback) {
            var excelHeader = [
                'TXT_COMPANY'
                , 'TXT_PHONE_NUMBER'
                , 'TXT_AGENT'
                , 'TXT_CONNECT_TIME'
                , 'TXT_CALL_START_TIME'
                , 'TXT_WAIT_TIME'
                , 'TXT_CALL_DURATION_TIME'
                , 'TXT_CALL_END_TIME'
            ];

            var workbook = new _Excel.Workbook();
            workbook.creator = req.session.user.displayName;
            workbook.created = new Date();
            var sheet = workbook.addWorksheet(titlePage);
            var column = [];

            _.each(excelHeader, function (header) {
                column.push({
                    header: _config.MESSAGE.REPORT_INBOUND_CALL_SERVICES[header],
                    key: header,
                    width: _config.MESSAGE.REPORT_INBOUND_CALL_SERVICES[header].length
                });
            });
            sheet.columns = column;

            if (data !== null) {
                _async.eachSeries(data, function (item, callback) {
                    sheet.addRow([
                        item.company
                        , item.called
                        , item.user
                        , _moment(item.startTime).format("HH:mm:ss DD/MM/YYYY")
                        , _moment(item.answerTime).format("HH:mm:ss DD/MM/YYYY")
                        , _moment().startOf('day').seconds(Math.ceil(item.waitDuration / 1000)).format('HH:mm:ss')
                        , _moment().startOf('day').seconds(Math.ceil(item.callDuration / 1000)).format('HH:mm:ss')
                        , _moment(item.endTime).format("HH:mm:ss DD/MM/YYYY")
                    ]);

                    callback(null);
                }, function (err, result) {
                    workbook.xlsx.writeFile(options.filename)
                        .then(callback);
                });
            } else {
                workbook.xlsx.writeFile(options.filename)
                    .then(callback);
            }
        }
    ], function (err, result) {
        callback(err, data[data.length - 1]._id);
    });
};

function collectCDRInfo() {
    return [
        //{
        //    $lookup: {from: 'tickets', localField: 'callId', foreignField: 'callId', as: 'tickets'}
        //},
        //{
        //    $unwind: '$tickets'
        //},
        //{
        //    $lookup: {
        //        from: 'field_so_dien_thoai',
        //        localField: 'tickets.idCustomer',
        //        foreignField: 'entityId',
        //        as: 'phone'
        //    }
        //},
        //{
        //    $unwind: {path:'$phone', preserveNullAndEmptyArrays:true}
        //},
        {
            $lookup: {
                from: 'services',
                localField: 'serviceId',
                foreignField: '_id',
                as: 'serviceId'
            }
        },
        {$unwind: '$serviceId'},
        {
            $lookup: {
                from: 'companies',
                localField: 'serviceId.idCompany',
                foreignField: '_id',
                as: 'company'
            }
        },
        {$unwind: '$company'},
        {
            $lookup: {
                from: 'users',
                localField: 'agentId',
                foreignField: '_id',
                as: 'user'
            }
        },
        {$unwind: {path:'$user', preserveNullAndEmptyArrays:true}},
        {
            $project: {
                _id: 1,
                company: '$company.name',
                startTime: 1,
                called: 1,
                caller: 1,
                user: {$concat: ['$user.displayName', ' (', '$user.name', ')']},
                answerTime: 1,
                waitDuration: {$cond:[{$gte:['$waitDuration',0]},'$waitDuration',0]},
                callDuration: 1,
                endTime: 1,
                //phone: "$phone.value"
            }
        }
    ];
}