/**
 * Created by Đại Đồng on 10/10/2016.
 */
var title = 'Báo cáo ý kiến khách hàng và tình trạng phiếu yêu cầu';
var view = 'report-customer-opinion';
var zipFolder = require('zip-folder');
exports.index = {
    json: function (req, res) {
        _.each(_.keys(_.pick(req.query, ['ticketReasonCategory', 'ticketReason', 'customerStatisfy'])), function (o) {
            switch (o) {
                case 'ticketReasonCategory':
                    _TicketReason.find({
                        status: 1,
                        idCategory: _.convertObjectId(req.query[o])
                    }, function (err, r) {
                        if (err) return res.json({code: 500, message: err.message});
                        _TicketSubreason.find({status: 1, idReason: {$in: _.pluck(r,'_id')}}, function (err, r2) {
                            if (err) return res.json({code: 500, message: err.message});
                            return res.json({code: 200, message: {ticketReason: r, ticketSubreason: r2}})
                        });
                    });
                    break;
                case 'ticketReason':
                    _TicketSubreason.find({
                        status: 1,
                        idReason: _.convertObjectId(req.query[o])
                    }, function (err, r) {
                        if (err) return res.json({code: 500, message: err.message});
                        return res.json({code: 200, message: {ticketSubreason: r}})
                    });
                    break;
                case 'customerStatisfy':
                    _CustomerStatisfyStage.find({
                        status: 1,
                        idCustomerStatisfy: _.convertObjectId(req.query[o])
                    }, function (err, r) {
                        if (err) return res.json({code: 500, message: err.message});
                        return res.json({code: 200, message: {customerStatisfyStage:r}})
                    });
                    break;
            }
        });
    },
    html: function (req, res) {
        var companyId = null;
        if (req.session.auth.company) {
            companyId = req.session.auth.company._id;
            if (!req.session.auth.company.leader) {
                _.render(req, res, view, {
                    title: title,
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    company: [],
                    satify: [],
                    satifyStage: [],
                    category: [],
                    reason: [],
                    subreason: []
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }
        _async.parallel({
            company: function (next) {
                _Company.find(companyId? {
                    _id: companyId,
                    status: 1
                } : {status: 1}, next);
            },
            satify: function (next) {
                _CustomerStatisfy.find({status: 1}, next);
            },
            satifyStage: function (next) {
                _CustomerStatisfyStage.find({status: 1}, next);
            },
            category: function (next) {
                _TicketReasonCategory.find({status: 1, category: {$in: [0, 1, 2]}}, next);
            },
            reason: function (next) {
                _TicketReasonCategory.distinct('_id', {
                    status: 1,
                    category: {$in: [0, 1, 2]}
                }, function (err, r2) {
                    _TicketReason.find({status: 1, idCategory: {$in: r2}}, next)
                });
            },
            subreason: function (next) {
                _TicketReasonCategory.distinct('_id', {
                    status: 1,
                    category: {$in: [0, 1, 2]}
                }, function (err, r2) {
                    _TicketReason.distinct('_id', {status: 1, idCategory: {$in: r2}}, function (err, r3) {
                        _TicketSubreason.find({status: 1, idReason: {$in: r3}}, next)
                    })
                });
            },
            agent: function(next){
                _Campains.distinct('_id', companyId?{idCompany: {$in: companyId}}:{}, function (err, campaign) {
                    _AgentGroups.distinct("_id", companyId ? {idParent: {$in: companyId}} : {}, function (err, group) {
                        _CampaignAgent.distinct('idAgent', {idCampaign: {$in: campaign}}, function (err, agent) {
                            _Users.distinct('_id', {$or: [{'agentGroupLeaders.group': {$in: group}}, {'agentGroupMembers.group': {$in: group}}, {'companyLeaders.company': {$in: [companyId]}}, {_id: {$in: agent}}]}).lean(true).exec(next)
                        })
                    })
                })
            }
        }, function (err, resp) {
            _.render(req, res, view, {
                title: title,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                company: resp.company,
                satify: resp.satify,
                satifyStage: resp.satifyStage,
                category: resp.category,
                reason: resp.reason,
                subreason: resp.subreason,
                agent: resp.agent,
                recordPath: _config.recordPath ? _config.recordPath.path : ''
            }, true, err);
        });
    }
};
function queryProcess(req,callback){
    var match = {status:{$ne:-1}};
    _async.waterfall([function (cb) {
        var companyId = null;
        if (req.session.auth.company && req.session.auth.company._id) {
            companyId = req.session.auth.company._id
        } else if (req.body.idCompany) {
            companyId = _.convertObjectId(req.body.idCompany)
        }
        _.each(_.keys(_.pick(req.body,['customerStatisfy','customerStatisfyStage','ticketReasonCategory','ticketReason','ticketSubreason','status','updated','type'])), function(o){
            switch(o){
                case 'customerStatisfy':
                case 'customerStatisfyStage':
                case 'ticketReasonCategory':
                case 'ticketReason':
                case 'ticketSubreason':
                    match[o] = _.convertObjectId(req.body[o]);
                    break;
                case 'status':
                    match[o] = parseInt(req.body[o]);
                    break;
                case 'type':
                    if(req.body[o] === '0'){
                        match.idService = {$ne:null};
                    }else{
                        match.idCampain = {$ne:null};
                    }
                    break;
                case 'updated':
                    var _d1 = _moment(req.body[o].split(' - ')[0], 'DD/MM/YYYY');
                    var _d2 = req.body[o].split(' - ')[1] ? _moment(req.body[o].split(' - ')[1], 'DD/MM/YYYY') : _moment().endOf('day');
                    var startDay = (_d1._d < _d2._d) ? _d1 : _d2;
                    var endDay = (_d1._d < _d2._d) ? _d2 : _d1;
                    startDay = startDay.startOf('day');
                    endDay = endDay.endOf('day');
                    match[o] = {$gte: startDay._d, $lt: endDay._d};
                    break;
            }
        });
        _Company.distinct('_id', companyId ? {_id: companyId} : {}, function (err, company) {
            if (err) return cb(err);
            _Campains.distinct('_id', {idCompany: {$in: company}}, function (err, campaign) {
                if (err) return cb(err);
                _Services.distinct('_id', {idCompany: {$in: company}}, function (err, service) {
                    if (err) return cb(err);
                    _AgentGroups.distinct("_id", {idParent: {$in: company}}, function (err, group) {
                        _CampaignAgent.distinct('idAgent', {idCampaign: {$in: campaign}}, function (err, agent) {
                            if (err) return cb(err);
                            _Users.distinct('_id', {$or: [{'agentGroupLeaders.group': {$in: group}}, {'agentGroupMembers.group': {$in: group}}, {'companyLeaders.company': {$in: company}}, {_id: {$in: agent}}]}).lean(true).exec(function (err, agents) {
                                if (err) return cb(err);
                                match.$or = [{idService:{$in:service}},{idCampain:{$in:campaign}},{idAgent:{$in:agents}}];
                                cb();
                            })
                        })
                    })
                })
            })
        })
    }], function (err) {
        callback(err,match)
    })
}
exports.create = function (req, res) {
    if(req.body.download){
        queryProcess(req, function(err,match){
            if (err) return res.json({code: 500, message: err.message});
            exportExcel(req,res,match,parseInt(req.body.totalResult));
        });
    }else{
        var page = _.has(req.body, 'page') ? parseInt(req.body.page) : 1;
        var rows = _.has(req.body, 'rows') ? parseInt(req.body.rows) : 10;
        queryProcess(req,function(err,match){
            if(err) return res.json({code:500, message:err.message});
            _Tickets.count(match, function(err,count){
                if(err) return res.json({code:500, message:err.message});
                var agg = [{$match:match},
                    {$skip:(page-1)*rows},
                    {$limit:rows}];
                agg.push.apply(agg,getTicketInfo());
                _Tickets.aggregate(agg, function(err,r){
                    if(err) return res.json({code:500, message:err.message});
                    var paginator = new pagination.SearchPaginator({
                        prelink: '/report-customer-opinion',
                        current: page,
                        rowsPerPage: rows,
                        totalResult: count
                    });
                    res.json({code: 200, message: paginator.getPaginationData(),data:statusConvert(r)})
                })
            })
        });
    }
};
function getTicketInfo() {
    return [
        {
            $lookup: {
                from: 'customerstatisfies',
                localField: 'customerStatisfy',
                foreignField: '_id',
                as: 'customerStatisfy'
            }
        },
        {
            $unwind: {path: '$customerStatisfy', preserveNullAndEmptyArrays: true}
        },
        {
            $lookup: {
                from: 'customerstatisfystages',
                localField: 'customerStatisfyStage',
                foreignField: '_id',
                as: 'customerStatisfyStage'
            }
        },
        {
            $unwind: {path: '$customerStatisfyStage', preserveNullAndEmptyArrays: true}
        },
        {
            $lookup: {
                from: 'ticketreasoncategories',
                localField: 'ticketReasonCategory',
                foreignField: '_id',
                as: 'ticketReasonCategory'
            }
        },
        {
            $unwind: {path: '$ticketReasonCategory', preserveNullAndEmptyArrays: true}
        },
        {
            $lookup: {from: 'ticketreasons', localField: 'ticketReason', foreignField: '_id', as: 'ticketReason'}
        },
        {
            $unwind: {path: '$ticketReason', preserveNullAndEmptyArrays: true}
        },
        {
            $lookup: {
                from: 'ticketsubreasons',
                localField: 'ticketSubreason',
                foreignField: '_id',
                as: 'ticketSubreason'
            }
        },
        {
            $unwind: {path: '$ticketSubreason', preserveNullAndEmptyArrays: true}
        },
        {
            $unwind: {path: '$callId', preserveNullAndEmptyArrays: true}
        },
        {
            $lookup: {from: 'cdrtransinfos', localField: 'callId', foreignField: 'callId', as: 'callId'}
        },
        {
            $unwind: {path: '$callId', preserveNullAndEmptyArrays: true}
        },
        {
            $lookup: {from: 'services', localField: 'idService', foreignField: '_id', as: 'idService'}
        },
        {
            $unwind: {path: '$idService', preserveNullAndEmptyArrays: true}
        },
        {
            $lookup: {from: 'campains', localField: 'idCampain', foreignField: '_id', as: 'idCampain'}
        },
        {
            $unwind: {path: '$idCampain', preserveNullAndEmptyArrays: true}
        },
        {
            $group:{
                _id:'$_id',
                callDuration:{$sum:{$cond:[{$eq:['$callId.serviceType',3]},'$callId.callDuration',0]}},
                recordPath:{$max:'$callId.recordPath'},
                ticketSubreason:{$max:'$ticketSubreason.name'},
                ticketReason:{$max:'$ticketReason.name'},
                ticketReasonCategory: {$max:'$ticketReasonCategory.name'},
                customerStatisfyStage: {$max: '$customerStatisfyStage.name'},
                customerStatisfy: {$max:'$customerStatisfy'},
                status:{$max:'$status'},
                service:{$max:'$idService.name'},
                campaign:{$max:'$idCampain.name'},
                companyId:{$max:{$ifNull:['$idCampain.idCompany','$idService.idCompany']}},
                updated:{$max:'$updated'}
            }
        },
        {
            $lookup: {from: 'companies', localField: 'companyId', foreignField: '_id', as: 'companyId'}
        },
        {
            $unwind: {path: '$companyId', preserveNullAndEmptyArrays: true}
        }
    ]
}
function exportExcel(req, res, conditions,totalResult) {
    var maxRecordPerFile = 2000;
    var maxParallelTask = 5;
    var waterFallTask = [];
    var currentDate = new Date();
    var folderName = req.session.user._id + "-" + currentDate.getTime();
    var fileName = title + ' ' + _moment(currentDate).format('DD-MM-YYYY');

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
            for (var i = 0; i < maxParallelTask; ++i) {
                var temp = function (callback) {
                    var agg = [{$match:conditions}];
                    if (_.isEmpty(objectId)) {
                        agg.push({$limit: maxRecordPerFile});
                    } else {
                        agg.push({$match: {_id: {$gt: objectId}}}, {$limit: maxRecordPerFile});
                    }

                    agg.push.apply(agg, getTicketInfo());

                    _Tickets.aggregate(agg, function (err, result) {
                        if (err) return callback(err, null);
                        createExcelFile(req
                            , folderName
                            , fileName + '-' + index + '-' + i
                            , statusConvert(result)
                            , callback);
                    });
                };

                tempParallelTask.push(temp);
            }
            return tempParallelTask;
        }
    } else {
        var temp = function (callback) {
            var agg = [{$match:conditions}]
            agg.push.apply(agg, getTicketInfo());
            _Tickets.aggregate(agg, function (err, result) {
                if (err) return callback(err, null);

                createExcelFile(req
                    , folderName
                    , fileName
                    , statusConvert(result)
                    , callback);
            });
        };
        waterFallTask.push(temp);
    }

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
        res.json({code: err ? 500 : 200, message: err ? err.message : folderZip});
    });
}

function createExcelFile(req, folderName, fileName, data, callback) {
    var options = {
        filename: path.join(_rootPath, 'assets', 'export', 'ticket', folderName, fileName + '.xlsx'),
        useStyles: true,
        useSharedStrings: true,
        dateFormat: 'DD/MM/YYYY HH:mm:ss'
    };

    _async.waterfall([
        function createFolder(callback) {
            fsx.mkdirs(path.join(_rootPath, 'assets', 'export', 'ticket', folderName), callback);
        },
        function (t, callback) {
            fsx.readJson(path.join(_rootPath, 'assets', 'const.json'), callback);
        },
        function createExcelFile(_config, callback) {
            var excelHeader = ['company'
                , 'category'
                , 'reason'
                , 'subreason'
                , 'satify'
                , 'stage'
                , 'status'
                , 'duration'
                , 'updated'
                , 'type'
                , 'record'];

            var workbook = new _Excel.Workbook();
            workbook.creator = req.session.user.displayName;
            workbook.created = new Date();
            var sheet = workbook.addWorksheet(title);
            var column = [];

            _.each(excelHeader, function (header) {
                column.push({
                    header: _config.MESSAGE.REPORT_CUSTOMER_OPINION[header],
                    key: header,
                    width: _config.MESSAGE.REPORT_CUSTOMER_OPINION[header].length
                });
            });
            sheet.columns = column;

            if (data !== null) {
                _async.eachSeries(data, function (item, callback) {
                    sheet.addRow([
                        item.companyId.name,
                        item.ticketReasonCategory,
                        item.ticketReason,
                        item.ticketSubreason,
                        item.customerStatisfyStage,
                        item.customerStatisfy,
                        item.status,
                        hms(item.callDuration/1000),
                        moment(item.updated).format('HH:mm DD/MM/YYYY'),
                        item.service?"Gọi vào":"Gọi ra",
                        item.recordPath]);

                    callback();
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
function statusConvert(data){
    _.each(data, function(o){
        _.each(_.keys(o), function(keys){
            if(!o[keys]) o[keys] = ""
        });
        switch(o.status){
            case 0:
                o.status = 'Chưa xử lí';
                break;
            case 1:
                o.status = 'Đang xử lí';
                break;
            case 2:
                o.status = 'Đã xử lí';
                break;
        }
    });
    return data;
}
function pad(num) {
    return ("0" + num).slice(-2);
}
function hms(secs) {
    if(isNaN(secs)) return '00:00:00';
    var sec = Math.ceil(secs);
    var minutes = Math.floor(sec / 60);
    sec = sec % 60;
    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ":" + pad(minutes) + ":" + pad(sec);
}