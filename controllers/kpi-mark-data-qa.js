exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'queryQA')){
            //Todo: Query danh sách agent là QA
            _KpiMarkData.findById(req.query.data).exec(function(err, resp){
                if (!err && resp){
                    var _query = {$or: [
                        {'qaMembers.ternal': new mongodb.ObjectId(_config.app._id)},
                        {'qaMembers.company': {$in: resp.idCompany}}
                    ]};
                    if (_.has(req.query, 'name')){
                        _query['displayName'] = { $regex: new RegExp(_.stringRegex(req.query['name']), 'i') };
                    }
                    _Users
                        .find(_query)
                        .populate('qaMembers.company')
                        .paginate(page, rows, function (error, users, pageCount) {
                            var paginator = new pagination.SearchPaginator({prelink: '/kpi-mark-data-qa', current: page, rowsPerPage: rows, totalResult: pageCount});
                            res.json({code: error ? 500 : 200, users: users, paging: paginator.getPaginationData()});
                        });
                }
                else{
                    res.json({code: 500});
                }
            });

        }
        else if (_.has(req.query, 'queryDataTicket')){
            //Todo: Query danh sách ticket của bộ dữ liệu
            _KpiMarkData.findById(req.query['data']).populate('qaList').exec(function(e, r){
                if (!e && r.qaList){
                    var qaIds = r.qaList;
                    _Company.find().exec(function(err, resp) {
                        var companyIds = _.map(resp, function (c) {
                            return c._id;
                        });
                        _Users.find({_id: {$in: qaIds}, $or: [
                            {'qaMembers.ternal': new mongodb.ObjectId(_config.app._id)},
                            {'qaMembers.company': {$in: companyIds}}
                        ]}).exec(function(err, resp){
                            //Kiem tra xem cac user nay co con quyen QA khong?
                            var uStrings = _.map(resp, function(u){
                                return u._id.toString();
                            });
                            var qaStrings = _.map(qaIds, function(u){
                                return u._id.toString();
                            });
                            removeIds(_.difference(qaStrings, uStrings), req.query['data'], function(){

                            });
                            var qaReturn = [];
                            _async.each(resp, function(qa, n){
                                var temp = {_id: qa._id, displayName: qa.displayName};
                                _async.parallel({
                                    countAssign: function(next){
                                        //Todo: Đếm số lượng ticket đã được assign
                                        _KpiMarkTicket.count({qa: qa._id, idData: new mongodb.ObjectId(req.query.data)}, function(e, count){
                                            temp.ticketCount = count;
                                            next();
                                        });
                                    },
                                    countTotal: function(next){
                                        //Todo: Đếm tổng số lượng ticket
                                        if (_.has(qa.qaMembers[0], 'ternal')){
                                            _KpiMarkTicket.count({qa: {$eq: null}, idData: new mongodb.ObjectId(req.query.data)}, function(err, count){
                                                temp.totalCount = count;
                                                next();
                                            });
                                        }
                                        else{
                                            var companyIds = _.pluck(qa.qaMembers, 'company');
                                            var agg = [
                                                {$match: {
                                                    $and: [
                                                        {
                                                            $or: [
                                                                {
                                                                    qa: {$eq: null}
                                                                },
                                                                {
                                                                    qa: qa._id
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            idData: new mongodb.ObjectId(req.query.data)
                                                        }
                                                    ]
                                                }},
                                                {$lookup:{
                                                    from: 'tickets',
                                                    localField: 'idTicket',
                                                    foreignField: '_id',
                                                    as: 'idTicket'
                                                }},
                                                {$unwind: {path: '$idTicket', preserveNullAndEmptyArrays: true}},
                                                {$lookup:{
                                                    from: 'campains',
                                                    localField: 'idTicket.idCampain',
                                                    foreignField: '_id',
                                                    as: 'idCampain'
                                                }},
                                                {$lookup:{
                                                    from: 'services',
                                                    localField: 'idTicket.idService',
                                                    foreignField: '_id',
                                                    as: 'idService'
                                                }},
                                                {$unwind: {path: '$idService', preserveNullAndEmptyArrays: true}},
                                                {$unwind: {path: '$idCampain', preserveNullAndEmptyArrays: true}},
                                                {$match: {
                                                    $or: [
                                                        {'idService.idCompany': {$in: companyIds}},
                                                        {'idCampain.idCompany': {$in: companyIds}}
                                                    ]
                                                }}
                                            ];
                                            _KpiMarkTicket.aggregate(agg, function(err, resp){
                                                temp.totalCount = resp.length;
                                                next();
                                            });
                                        }
                                    }
                                }, function(err1, resp1){
                                    qaReturn.push(temp);
                                    n();
                                })
                            }, function(err, resp){
                                res.json({code: err ? 500 : 200, data: qaReturn});
                            });
                        });
                    });

                }
            });
        }
        else if (_.has(req.query, 'queryData')){
            //Query chi tiết của bộ dữ liệu
            _async.parallel({
                countTicket: function(next){
                    _KpiMarkTicket.count({idData: new mongodb.ObjectId(req.query.idData)}, next);
                },
                countTicketNotUse: function(next){
                    _KpiMarkTicket.count({qa: {$eq: null}, idData: new mongodb.ObjectId(req.query.idData)}, next);
                }
            }, function(err, resp){
                _KpiMarkData.findById(req.query.idData).populate('idCollection').exec(function(e, r){
                    res.json({code: e ? 500 : 200, data: r, total: resp.countTicket, notUse: resp.countTicketNotUse});
                });
            });
        }
        else if (_.has(req.query, 'queryDataQa')){
            _KpiMarkData.findById(req.query.idData).populate('qaList').exec(function(err, data) {
                res.json({code: err ? 500 : 200, data: data.qaList});
            });
        }
    },
    html: function (req, res) {
        //Todo: Render trang quản lý danh sách chấm điểm
        _.render(req, res, 'kpi-mark-data-qa', {
            title: 'Quản lý danh sách chấm điểm',
            plugins: ['moment', ['bootstrap-datetimepicker'], ['bootstrap-duallistbox'], ['bootstrap-select']]
        }, true);
    }
};

exports.create = function (req, res) {
    if (_.has(req.body, 'addIds')){
        //Todo: Thêm ticket vào danh sách cần chấm
        var ids = req.body.addIds.split(',');
        var _kpiTicketBulk = mongoClient.collection('kpimarktickets').initializeUnorderedBulkOp({useLegacyOps: true});
        _KpiMarkTicket.find({}, function(error, result){
            var rIds = _.map(result, function(r){
                return r.idTicket.toString();
            });
            var insertIds = _.difference(ids, rIds);
            if (insertIds.length > 0){
                _async.each(insertIds, function(id, cb) {
                    _kpiTicketBulk.insert({
                        idTicket: new mongodb.ObjectId(id),
                        idData: new mongodb.ObjectId(req.query.idData),
                        createBy: new mongodb.ObjectId(req.session.user._id),
                        updateBy: new mongodb.ObjectId(req.session.user._id),
                        status: 1
                    });
                    cb();
                }, function(er, re){
                    _kpiTicketBulk.execute(function(err, list){
                        res.json({code: err ? 500 : 200});
                    });
                });
            }
            else{
                res.json({code: 500});
            }
        });
    }
};

exports.destroy = function (req, res) {
    if (_.has(req.body, 'removeIds')){
        //Todo: Xóa ticket cần chấm
        var ids = req.body.removeIds.split(',');
        var ticketIds = _.map(ids, function(id){
            return new mongodb.ObjectId(id);
        });
        _KpiMarkTicket.remove({_id : {$in: ticketIds}}, function (err, result) {
            res.json({code: err ? 500 : 200});
        });
    }
};

exports.update = function (req, res) {
    if (_.has(req.body, 'addIds')) {
        //Todo: Thêm qa vào danh sách người chấm điểm
        var ids = req.body.addIds.split(',');
        _KpiMarkData.update({ _id: new mongodb.ObjectId(req.params['kpimarkdataqa'])}, {$addToSet: {qaList: {$each: ids}}}, {multi: true}, function (err, result) {
            _KpiMarkData.findById(req.params['kpimarkdataqa']).populate('qaList').exec(function(err, data) {
                res.json({code: err ? 500 : 200, data: data.qaList});
            });
        });
    }
    else if (_.has(req.body, 'add')){
        //Todo: Gán ticket cần chấm cho QA
        if (Number(req.body.add) > 0){
            _Users.findById(new mongodb.ObjectId(req.query.idQa), function(err, qa){
                if (!err){
                    _async.waterfall([
                        function(cb){
                            if (_.has(qa.qaMembers[0], 'ternal')){
                                _KpiMarkTicket.find({qa: {$eq: null}, idData: new mongodb.ObjectId(req.params.kpimarkdataqa)}).limit(Number(req.body.add)).exec(function(err, tickets){
                                    if (!err){
                                        cb(null, _.pluck(tickets, '_id'));
                                    }
                                    else{
                                        cb(null, []);
                                    }
                                });
                            }
                            else {
                                var companyIds = _.map(qa.qaMembers, function (company) {
                                    return company.company;
                                });
                                var agg = [
                                    {$match: {
                                        $and: [
                                            {
                                                $or: [
                                                    {
                                                        qa: {$eq: null}
                                                    }
                                                ]
                                            },
                                            {
                                                idData: new mongodb.ObjectId(req.params.kpimarkdataqa)
                                            }
                                        ]
                                    }},
                                    {$lookup: {
                                        from: 'tickets',
                                        localField: 'idTicket',
                                        foreignField: '_id',
                                        as: 'idTicket'
                                    }},
                                    {$unwind: {path: '$idTicket', preserveNullAndEmptyArrays: true}},
                                    {$lookup: {
                                        from: 'campains',
                                        localField: 'idTicket.idCampain',
                                        foreignField: '_id',
                                        as: 'idCampain'
                                    }},
                                    {$lookup: {
                                        from: 'services',
                                        localField: 'idTicket.idService',
                                        foreignField: '_id',
                                        as: 'idService'
                                    }},
                                    {$unwind: {path: '$idService', preserveNullAndEmptyArrays: true}},
                                    {$unwind: {path: '$idCampain', preserveNullAndEmptyArrays: true}},
                                    {$match: {
                                        $or: [
                                            {'idService.idCompany': {$in: companyIds}},
                                            {'idCampain.idCompany': {$in: companyIds}}
                                        ]
                                    }},
                                    {$limit: Number(req.body.add)}
                                ];
                                _KpiMarkTicket.aggregate(agg, function (err, resp) {
                                    if (!err){
                                        cb(null, _.pluck(resp, '_id'));
                                    }
                                    else{
                                        cb(null, []);
                                    }
                                });
                            }
                        }
                    ], function(err, resp){
                        if (!err){
                            if (resp.length >= Number(req.body.add)){
                                _KpiMarkTicket
                                    .update({_id: {$in: resp}}, {qa: new mongodb.ObjectId(req.query.idQa)}, {multi: true})
                                    .exec(function(err, resp){
                                        res.json({code: err ? 500 : 200, msg: 'Cập nhật thành công!'});
                                    });
                            }
                            else{
                                //Số bản ghi còn lại lớn hơn số bản ghi cần gán
                                res.json({code: 500, msg: 'Số lượng ticket còn lại không đủ'});
                            }
                        }
                        else{
                            res.json({code: 500, msg: 'Lỗi hệ thống!'});
                        }

                    });

                }
            });

//            _KpiMarkTicket.count({qa: {$eq: null}, idData: new mongodb.ObjectId(req.params.kpimarkdataqa)}, function(err, count){
//                if (count >= Number(req.body.add)){
//                    _KpiMarkTicket.find({qa: {$eq: null}, idData: new mongodb.ObjectId(req.params.kpimarkdataqa)}).limit(Number(req.body.add)).exec(function(err, resp){
//                        var ids = _.map(resp, function(o){
//                            return o._id;
//                        });
//                        _KpiMarkTicket
//                            .update({_id: {$in: ids}}, {qa: new mongodb.ObjectId(req.query.idQa)}, {multi: true})
//                            .exec(function(err, resp){
//                                res.json({code: err ? 500 : 200, msg: 'Cập nhật thành công!'});
//                            });
//                    });
//                }
//                else{
//                    //Số bản ghi còn lại lớn hơn số bản ghi cần gán
//                    res.json({code: 500, msg: 'Số lượng ticket còn lại không đủ'});
//                }
//            });
        }
        else{
            _KpiMarkTicket.find({qa: new mongodb.ObjectId(req.query.idQa), idData: new mongodb.ObjectId(req.params.kpimarkdataqa)}).limit(-1 * Number(req.body.add)).exec(function(err, resp){
                var ids = _.map(resp, function(o){
                    return o._id;
                });
                _KpiMarkTicket
                    .update({_id: {$in: ids}}, {qa: null}, {multi: true})
                    .exec(function(err, resp){
                        res.json({code: err ? 500 : 200, msg: 'Cập nhật thành công!'});
                    });
            });
        }
    }
    else if (_.has(req.body, 'removeIds')){
        //Todo: Xóa qa khỏi danh sách người chấm điểm
        var ids = req.body.removeIds.split(',');
        removeIds(ids, req.params['kpimarkdataqa'], function(err, data){
            res.json({ code: err ? 500 : 200});
        });
    }
};

function removeIds(ids, kpimarkdataqa, cb){
    if (ids.length == 0){
        cb();
    }
    var mongoIds = _.map(ids, function(id){
        return new mongodb.ObjectId(id);
    })
    _KpiMarkData.update({ _id: new mongodb.ObjectId(kpimarkdataqa)}, {$pull: {qaList: {$in: ids}}}, function (err, result) {
        _KpiMarkTicket.update({qa: {$in: mongoIds}}, {qa: null}, {multi: true}, cb);
    });
}
