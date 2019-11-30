/**
 * Created by NghiaTM on 5/12/2016.
 */
var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));
var zipFolder = require('zip-folder');

exports.index = {
    json: function (req, res) {
        var dateArr = [];
        if (req.query.startDate) dateArr.push({
            startTime: {
                $gte: moment(req.query.startDate, "DD/MM/YYYY").startOf('days').valueOf()
            }
        });
        if (req.query.endDate) dateArr.push({
            startTime: {
                $lte: moment(req.query.endDate, "DD/MM/YYYY").endOf('days').valueOf()
            }
        });
        var dateFilter = dateArr.length ? {
            $and: dateArr
        } : null;

        /*
         1: Khách hàng route đến agent rồi dập máy  -            serviceType:3 | reason: 0 | subreason: 1  | answerTime: 0
         2: Khách hàng dập máy trên Queue -                      serviceType:2 | reason: 0 | subreason: 1  | answerTime: 0
         3: Điện thoại viên không nhấc máy -                     serviceType:3 | reason: 0 | subreason: 4  | answerTime: 0 agentAnswer = 0
         4: Điện thoại viên từ chối cuộc gọi (ấn nút reject) -   serviceType:3 | reason: 8 | subreason: 5  | answerTime: 0
         5: Tất cả các điện thoại viện đều bận -                 serviceType:2 | reason: 0 | subreason: 15 | answerTime: 0
         */

        _async.waterfall([
            function (next) {
                permissionConditions(req, next);
            },
            function (cond, next) {
                if (dateFilter) cond.push({
                    $match: dateFilter
                });
                cond.push({
                    $match: {
                        transType: {
                            $in: [1, 7]
                        }
                    }
                }, {
                    $project: {
                        _id: 1,
                        callId: 1,
                        serviceId: 1,
                        serviceType: 1,
                        reason: 1,
                        subReason: 1,
                        answerTime: 1,
                        waitDuration: 1,
                        type: {
                            "$cond": {
                                "if": {
                                    "$and": [{
                                        $eq: ["$serviceType", 3]
                                    }, {
                                        $eq: ["$reason", 0]
                                    }, {
                                        $eq: ["$subReason", 1]
                                    }]
                                },
                                "then": 1,
                                "else": {
                                    "$cond": {
                                        "if": {
                                            "$and": [{
                                                $eq: ["$serviceType", 2]
                                            }, {
                                                $eq: ["$reason", 0]
                                            }, {
                                                $eq: ["$subReason", 1]
                                            }]
                                        },
                                        "then": 2,
                                        "else": {
                                            "$cond": {
                                                "if": {
                                                    "$and": [{
                                                        $eq: ["$serviceType", 3]
                                                    }, {
                                                        $eq: ["$reason", 0]
                                                    }, {
                                                        $eq: ["$subReason", 4]
                                                    }]
                                                },
                                                "then": 3,
                                                "else": {
                                                    "$cond": {
                                                        "if": {
                                                            "$and": [{
                                                                $eq: ["$serviceType", 3]
                                                            }, {
                                                                $eq: ["$reason", 8]
                                                            }, {
                                                                $eq: ["$subReason", 5]
                                                            }]
                                                        },
                                                        "then": 4,
                                                        "else": {
                                                            "$cond": {
                                                                "if": {
                                                                    "$and": [{
                                                                        $eq: ["$serviceType", 2]
                                                                    }, {
                                                                        $eq: ["$reason", 0]
                                                                    }, {
                                                                        $eq: ["$subReason", 15]
                                                                    }]
                                                                },
                                                                "then": 5,
                                                                "else": 6
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }, {
                    $group: {
                        _id: {
                            _id: "$callId",
                            serviceId: "$serviceId"
                        },
                        type: {
                            $last: "$type"
                        },
                        queueAnswer: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$serviceType", 2]
                                }, "$answerTime", 0]
                            }
                        },
                        agentAnswer: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$serviceType", 3]
                                }, "$answerTime", 0]
                            }
                        },
                        type_1_dur: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 1]
                                }, "$waitDuration", 0]
                            }
                        },
                        type_2_dur: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 2]
                                }, "$waitDuration", 0]
                            }
                        },
                        type_3_dur: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 3]
                                }, "$waitDuration", 0]
                            }
                        },
                        type_4_dur: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 4]
                                }, "$waitDuration", 0]
                            }
                        },
                        type_5_dur: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 5]
                                }, "$waitDuration", 0]
                            }
                        },
                        totalDur: {
                            $sum: "$waitDuration"
                        }
                    }
                }, {
                    $match: {
                        agentAnswer: 0
                    }
                }, {
                    $group: {
                        _id: "$_id.serviceId",
                        type_1: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 1]
                                }, 1, 0]
                            }
                        },
                        type_2: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 2]
                                }, 1, 0]
                            }
                        },
                        type_3: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 3]
                                }, 1, 0]
                            }
                        },
                        type_4: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 4]
                                }, 1, 0]
                            }
                        },
                        type_5: {
                            $sum: {
                                $cond: [{
                                    $eq: ["$type", 5]
                                }, 1, 0]
                            }
                        },

                        type_1_dur: {
                            $sum: "$type_1_dur"
                        },
                        type_2_dur: {
                            $sum: "$type_2_dur"
                        },
                        type_3_dur: {
                            $sum: "$type_3_dur"
                        },
                        type_4_dur: {
                            $sum: "$type_4_dur"
                        },
                        type_5_dur: {
                            $sum: "$type_5_dur"
                        },

                        total: {
                            $sum: 1
                        },
                        totalDur: {
                            $sum: "$totalDur"
                        },
                        avgDur: {
                            $avg: "$totalDur"
                        }
                    }
                }, {
                    $lookup: {
                        from: 'services',
                        localField: '_id',
                        foreignField: '_id',
                        as: '_id'
                    }
                }, {
                    $unwind: "$_id"
                }, {
                    $lookup: {
                        from: 'companies',
                        localField: '_id.idCompany',
                        foreignField: '_id',
                        as: '_id'
                    }
                }, {
                    $unwind: "$_id"
                }, {
                    $group: {
                        _id: "$_id._id",
                        name: {
                            $first: "$_id.name"
                        },
                        type_1: {
                            $sum: "$type_1"
                        },
                        type_2: {
                            $sum: "$type_2"
                        },
                        type_3: {
                            $sum: "$type_3"
                        },
                        type_4: {
                            $sum: "$type_4"
                        },
                        type_5: {
                            $sum: "$type_5"
                        },

                        type_1_dur: {
                            $sum: "$type_1_dur"
                        },
                        type_2_dur: {
                            $sum: "$type_2_dur"
                        },
                        type_3_dur: {
                            $sum: "$type_3_dur"
                        },
                        type_4_dur: {
                            $sum: "$type_4_dur"
                        },
                        type_5_dur: {
                            $sum: "$type_5_dur"
                        },

                        total: {
                            $sum: "$total"
                        },
                        totalDur: {
                            $sum: "$totalDur"
                        },
                        avgDur: {
                            $sum: "$avgDur"
                        }
                    }
                });
                _CdrTransInfo.aggregate(cond, next);
            }
        ], function (err, result) {
            if (err) return res.json({
                code: 500,
                message: err.message
            });
            if (_.has(req.query, 'download')) {
                exportExcel(req, res, result);
                return;
            } else {
                res.json({
                    code: err ? 500 : 200,
                    message: err ? err.message : result
                });
            }
        });

        //_async.waterfall([
        //    function (next) {
        //        if (req.query.companies)
        //            companyIds._id = {
        //                $in: _.map(req.query.companies, function (o) {
        //                    return _.convertObjectId(o)
        //                })
        //            };
        //        _Company.find(companyIds, next);
        //    }, function (a, next) {
        //        _async.each(a, function (item, callback) {
        //            _async.waterfall([function(cb){
        //                _Services.distinct('_id', {idCompany: item._id},cb)
        //            }, function(b,cb){
        //                _CdrTransInfo.aggregate([
        //                    {$match: {serviceId:{$in:b}}},
        //                    {$match: companyIds},
        //                    {$match: {transType: 1}},
        //                    {
        //                        $match: {
        //                            $or: [
        //                                {
        //                                    $and: [
        //                                        {callDuration: null},
        //                                        {serviceType: 3}]
        //                                },
        //                                {
        //                                    $and: [
        //                                        {subreason: 1},
        //                                        {serviceType: 2}]
        //                                },
        //                                {
        //                                    $and: [
        //                                        {subreason: 15},
        //                                        {serviceType: 2}]
        //                                }
        //                            ]
        //                        }
        //                    },
        //                    {
        //                        $group: {
        //                            _id: "$callId",
        //                            total: {$sum: {$cond: [{$eq: [{$max: "$callDuration"}, null]}, {$cond: [{$eq: ["$serviceType", 3]}, 1, 0]}, {$cond: [{$eq: ["$serviceType", 2]}, 1, 0]}]}},
        //                            clientDrop: {$sum: {$cond: [{$and: [{$eq: ["$serviceType", 2]}, {$eq: ["$subreason", 1]}]}, 1, 0]}},
        //                            outOfTime: {$sum: {$cond: [{$or: [{$and: [{$eq: ["$serviceType", 3]}, {$eq: ["$subreason", 4]}, {$eq: ["$reason", 0]}]}, {$and: [{$eq: ["$serviceType", 2]}, {$eq: ["$subreason", 15]}, {$eq: ["$reason", 0]}]}]}, 1, 0]}},
        //                            waitingTime: {$sum: '$waitDuration'},
        //                            status: {$max: "$answerTime"}
        //                        }
        //                    },
        //                    {$match: {status: {$in: [null, 0]}}},
        //                    {
        //                        $group: {
        //                            _id: 0,
        //                            total: {$sum: "$total"},
        //                            clientDrop: {$sum: "$clientDrop"},
        //                            outOfTime: {$sum: "$outOfTime"},
        //                            waitingTime: {$sum: "$waitingTime"}
        //                        }
        //                    },
        //                ]).allowDiskUse(true).exec(function (err, r) {
        //                    var obj = r.length ? {name:item.name,total:r[0].total,clientDrop:r[0].clientDrop,waitingTime:r[0].waitingTime,outOfTime:r[0].outOfTime}:{name:item.name,total:0,clientDrop:0,waitingTime:0,outOfTime:0};
        //                    result.push(obj)
        //                    cb();
        //                });
        //            }],function(err){
        //                callback()
        //            })
        //        }, function(err){
        //            next(err)
        //        })
        //    }
        //], function (error) {
        //    res.json({code: (error) ? 500 : 200, datas: result});
        //})
    },
    html: function (req, res) {
        var companyId = {};
        if (req.session.auth.company) {
            companyId._id = _.convertObjectId(req.session.auth.company._id);
        }
        _Company.find(companyId, function (err, companies) {
            _.render(req, res, 'report-inbound-misscall', {
                title: "Báo cáo gọi vào - Cuộc gọi bị nhỡ",
                plugins: ['moment', 'highchart', ['bootstrap-select'],
                    ['bootstrap-datetimepicker'], 'export-excel', ['chosen']
                ],
                companies: companies
            }, true, err);
        })
    }
};

/**
 * Xuất báo cáo ra file excel, trả lại đường dẫn file excel trên server
 * @param req
 * @param data
 * @param callback
 */
function exportExcel(req, data, callback) {
    var waterFallTask = [];
    var currentDate = new Date();
    var folderName = req.session.user._id + "-" + currentDate.getTime();
    var fileName = 'BÁO CÁO GỌI VÀO - CUỘC GỌI BỊ NHỠ ' + _moment(currentDate).format('DD-MM-YYYY');


    waterFallTask.push(function (next) {
        createExcelFile(req, folderName, fileName, data, next);
    });

    waterFallTask.push(
        function (objectId, next) {
            fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'archiver'), next);
        },
        function (t, next) {
            var folderPath = path.join(_rootPath, 'assets', 'export', 'ticket', folderName);
            var folderZip = path.join(_rootPath, 'assets', 'export', 'archiver', folderName + '.zip');
            zipFolder(folderPath, folderZip, function (err) {
                next(err, folderZip.replace(_rootPath, ''));
            });
        }
    );

    _async.waterfall(waterFallTask, callback);
}

function permissionConditions(req, callback) {
    if (!(req.session && req.session.auth)) {
        var err = new Error('session auth null');
        return callback(err);
    };
    var _company = null;
    var _group = null;
    var cond = [];
    if (req.session.auth.company && !req.session.auth.company.leader) {
        // Team lead - Agent
        _company = req.session.auth.company._id;
        if (req.session.auth.company.group.leader) {
            // Team lead
            _group = req.session.auth.company.group._id;
        } else {
            // Agent
            cond.push({
                $match: {
                    agentId: new mongodb.ObjectId(req.session.user._id.toString())
                }
            });
        }
    } else if (req.session.auth.company && req.session.auth.company.leader) {
        // Company Leader
        _company = req.session.auth.company._id;
    } else if (!req.session.auth.company) {
        // Leader
    };

    _async.waterfall([
        function (next) {
            if (_group) {
                _Users.distinct('_id', {
                    $or: [{
                        agentGroupLeaders: {
                            $elemMatch: {
                                group: _group
                            }
                        }
                    }, {
                        agentGroupMembers: {
                            $elemMatch: {
                                group: _group
                            }
                        }
                    }]
                }, function (err, result) {
                    cond.push({
                        $match: {
                            agentId: {
                                $in: result
                            }
                        }
                    });
                    next(err);
                });
            } else {
                next(null);
            };
        },
        function (next) {
            var aggs = [];
            if (_company) aggs.push({
                $match: {
                    _id: new mongodb.ObjectId(_company.toString())
                }
            });
            if (req.query.companies && req.query.companies.length > 0) aggs.push({
                $match: {
                    _id: {
                        $in: _.arrayObjectId(req.query.companies)
                    }
                }
            });
            aggs.push({
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: 'idCompany',
                    as: 'services'
                }
            });
            aggs.push({
                $unwind: "$services"
            });
            aggs.push({
                $group: {
                    _id: '$services._id'
                }
            });

            _Company.aggregate(aggs, next);
        }
    ], function (err, result) {
        cond.push({
            $match: {
                serviceId: {
                    $in: _.pluck(result, '_id')
                }
            }
        });
        callback(err, cond);
    });
};

/**
 * Tạo file excel trên hệ thống
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
            var excelHeader = [
                'TXT_COMPANY',
                'TXT_PHONE_NUMBER',
                'TXT_START_TIME',
                'TXT_END_TIME',
                'TXT_WAIT_DURATION',
                'TXT_REASON'
            ];

            var workbook = new _Excel.Workbook();
            workbook.creator = req.session.user.displayName;
            workbook.created = new Date();
            var sheet = workbook.addWorksheet('Chi tiết');
            var column = [];

            _.each(excelHeader, function (header) {
                column.push({
                    header: _config.MESSAGE.REPORT_INBOUND_MISSCALL[header],
                    key: header,
                    width: _config.MESSAGE.REPORT_INBOUND_MISSCALL[header].length
                });
            });

            sheet.columns = column;

            if (data !== null) {
                function hms(secs) {
                    var sec = Math.ceil(secs);
                    var minutes = Math.floor(sec / 60);
                    sec = sec % 60;
                    var hours = Math.floor(minutes / 60);
                    minutes = minutes % 60;
                    return _.pad(hours, 2, '0') + ":" + _.pad(minutes, 2, '0') + ":" + _.pad(sec, 2, '0');
                }
                function getType(type) {
                    switch (type) {
                        case 1:
                            return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_1'];
                        case 2:
                            return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_2'];
                        case 3:
                            return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_3'];
                        case 4:
                            return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_4'];
                        case 5:
                            return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_5'];
                        case 6:
                            return _config.MESSAGE.REPORT_INBOUND_MISSCALL['TXT_TYPE_OTHER'];
                        default: return '';
                    }
                }
                _async.eachSeries(data, function (item, cb) {
                    var row = [
                            item.name ? item.name : '',
                            item.caller ? item.caller : '',
                            item.startTime ? moment(item.startTime).format('HH:mm:ss DD/MM/YYYY') : '',
                            item.endTime ? moment(item.endTime).format('HH:mm:ss DD/MM/YYYY') : '',
                            item.waitDuration ? hms(item.waitDuration / 1000) : '',
                            item.type ? getType(item.type) : ''
                        ];
                    sheet.addRow(row);
                    cb();
                }, function(err, result) {
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
}

var msToTime = function (s) {
    if (s == 0) return '00:00:00';
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return _.pad(hrs, 2, '0') + ':' + _.pad(mins, 2, '0') + ':' + _.pad(secs, 2, '0');
};

// DUONGNB: Add detail misscall report
exports.new = function (req, res) {
    var dateArr = [];
    if (req.query.startDate) dateArr.push({
        startTime: {
            $gte: moment(req.query.startDate, "DD/MM/YYYY").startOf('days').valueOf()
        }
    });
    if (req.query.endDate) dateArr.push({
        startTime: {
            $lte: moment(req.query.endDate, "DD/MM/YYYY").endOf('days').valueOf()
        }
    });
    var dateFilter = dateArr.length ? {
        $and: dateArr
    } : null;

    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

    var sort = _.cleanSort(req.query, '');

    var _query = _.cleanRequest(req.query, ['_', 'updated', 'note', 'formId', 'dt', 'ignoreSearch', 'socketId', 'download', 'totalResult']);

    _async.waterfall([
        function (next) {
            permissionConditions(req, next);
        },
        function (cond, next) {
            if (dateFilter) cond.push({
                $match: dateFilter
            });
            cond.push({
                $match: {
                    transType: {
                        $in: [1, 7]
                    }
                }
            }, {
                $project: {
                    _id: 1,
                    callId: 1,
                    serviceId: 1,
                    serviceType: 1,
                    reason: 1,
                    subReason: 1,
                    answerTime: 1,
                    waitDuration: 1,
                    startTime: 1,
                    endTime: 1,
                    caller: 1,
                    type: {
                        "$cond": {
                            "if": {
                                "$and": [{
                                    $eq: ["$serviceType", 3]
                                }, {
                                    $eq: ["$reason", 0]
                                }, {
                                    $eq: ["$subReason", 1]
                                }]
                            },
                            "then": 1,
                            "else": {
                                "$cond": {
                                    "if": {
                                        "$and": [{
                                            $eq: ["$serviceType", 2]
                                        }, {
                                            $eq: ["$reason", 0]
                                        }, {
                                            $eq: ["$subReason", 1]
                                        }]
                                    },
                                    "then": 2,
                                    "else": {
                                        "$cond": {
                                            "if": {
                                                "$and": [{
                                                    $eq: ["$serviceType", 3]
                                                }, {
                                                    $eq: ["$reason", 0]
                                                }, {
                                                    $eq: ["$subReason", 4]
                                                }]
                                            },
                                            "then": 3,
                                            "else": {
                                                "$cond": {
                                                    "if": {
                                                        "$and": [{
                                                            $eq: ["$serviceType", 3]
                                                        }, {
                                                            $eq: ["$reason", 8]
                                                        }, {
                                                            $eq: ["$subReason", 5]
                                                        }]
                                                    },
                                                    "then": 4,
                                                    "else": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": [{
                                                                    $eq: ["$serviceType", 2]
                                                                }, {
                                                                    $eq: ["$reason", 0]
                                                                }, {
                                                                    $eq: ["$subReason", 15]
                                                                }]
                                                            },
                                                            "then": 5,
                                                            "else": 6
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }, {
                $group: {
                    _id: {
                        _id: "$callId",
                        serviceId: "$serviceId"
                    },
                    type: {
                        $min: "$type"
                    },
                    caller: {
                        $first: '$caller'
                    },
                    startTime: {
                        $min: '$startTime'
                    },
                    endTime: {
                        $max: '$endTime'
                    },
                    queueAnswer: {
                        $sum: {
                            $cond: [{
                                $eq: ["$serviceType", 2]
                            }, "$answerTime", 0]
                        }
                    },
                    agentAnswer: {
                        $sum: {
                            $cond: [{
                                $eq: ["$serviceType", 3]
                            }, "$answerTime", 0]
                        }
                    },
                    type_1_dur: {
                        $sum: {
                            $cond: [{
                                $eq: ["$type", 1]
                            }, "$waitDuration", 0]
                        }
                    },
                    type_2_dur: {
                        $sum: {
                            $cond: [{
                                $eq: ["$type", 2]
                            }, "$waitDuration", 0]
                        }
                    },
                    type_3_dur: {
                        $sum: {
                            $cond: [{
                                $eq: ["$type", 3]
                            }, "$waitDuration", 0]
                        }
                    },
                    type_4_dur: {
                        $sum: {
                            $cond: [{
                                $eq: ["$type", 4]
                            }, "$waitDuration", 0]
                        }
                    },
                    type_5_dur: {
                        $sum: {
                            $cond: [{
                                $eq: ["$type", 5]
                            }, "$waitDuration", 0]
                        }
                    },
                    totalDur: {
                        $sum: "$waitDuration"
                    }
                }
            }, {
                $match: {
                    agentAnswer: {
                        $lt: 1
                    }
                }
            }, {
                $lookup: {
                    from: 'services',
                    localField: '_id.serviceId',
                    foreignField: '_id',
                    as: '_id.serviceId'
                }
            }, {
                $unwind: "$_id.serviceId"
            }, {
                $lookup: {
                    from: 'companies',
                    localField: '_id.serviceId.idCompany',
                    foreignField: '_id',
                    as: '_id.serviceId.idCompany'
                }
            }, {
                $unwind: "$_id.serviceId.idCompany"
            }, {
                $project: {
                    _id: 1,
                    name: "$_id.serviceId.idCompany.name",
                    type: 1,
                    caller: 1,
                    startTime: 1,
                    endTime: 1,
                    waitDuration: {
                        "$cond": {
                            "if": {
                                $eq: ["$type", 1]
                            },
                            "then": '$type_1_dur',
                            "else": {
                                "$cond": {
                                    "if": {
                                        $eq: ["$type", 2]
                                    },
                                    "then": '$type_2_dur',
                                    "else": {
                                        "$cond": {
                                            "if": {
                                                $eq: ["$type", 3]
                                            },
                                            "then": '$type_3_dur',
                                            "else": {
                                                "$cond": {
                                                    "if": {
                                                        $eq: ["$type", 4]
                                                    },
                                                    "then": '$type_4_dur',
                                                    "else": {
                                                        "$cond": {
                                                            "if": {
                                                                $eq: ["$type", 5]
                                                            },
                                                            "then": '$type_5_dur',
                                                            "else": {
                                                                $subtract: ['$endTime', '$startTime']
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            var __query = parseJSONToObject(cond);

            if (!_.isEmpty(sort)) cond.push({
                $sort: sort
            });
            var isDownload = false;
            if (_.has(req.query, 'download') && req.query['download'] == 1) {
                isDownload = true;
            } else {
                isDownload = false;
                cond.push({
                    $skip: (page - 1) * rows
                }, {
                    $limit: rows
                });
            }
            _CdrTransInfo.aggregate(cond, function (err, result) {
                if (err) return callback(err, null);
                if (isDownload) {
                    exportExcel(req, result, next);
                } else {
                    if (_.has(req.query, 'socketId') &&
                        result.length > 0) {
                        createPaging(req, __query, page, rows);
                    }
                    next(err, result);
                }
            });
        }
    ], function (err, result) {
        res.json({
            code: err ? 500 : 200,
            message: err ? err.message : result
        });
    });
};

function createPaging(req, aggregate, page, rows) {
    aggregate.push({
        $group: {
            _id: '$status',
            count: {
                $sum: 1
            }
        }
    });

    _CdrTransInfo.aggregate(aggregate, function (err, result) {
        var obj = {};
        if (err) {
            obj = {
                code: 500,
                message: err.message,
                formId: req.query.formId,
                dt: req.query.dt
            };
        } else {
            var total = _.chain(result)
                .pluck('count')
                .reduce(function (memo, item) {
                    return memo + item;
                }, 0)
                .value();

            var paginator = new pagination.SearchPaginator({
                prelink: '/report-inbound-misscall',
                current: page,
                rowsPerPage: rows,
                totalResult: total
            });

            obj = {
                code: 200,
                message: paginator.getPaginationData(),
                formId: req.query.formId,
                dt: req.query.dt
            }
        }

        sio.sockets.socket(req.query.socketId).emit('responseReportInboundMissCallData', obj);
    });
}

