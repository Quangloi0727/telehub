/**
 * Created by NghiaTM on 5/30/2016.
 */

exports.index = {
    html: function (req, res) {
        //query danh sách các bộ cần chấm
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var aggregate= _KpiMarkData.aggregate();
        var pipelines= aggregate._pipeline;
        pipelines.push({$match: {status: 1, qaList:{$in: [_.convertObjectId(req.session.user._id)]}}});

        if (_.has(req.query, 'name')) {
            pipelines.push({$match: {name: {$regex: new RegExp(_.stringRegex(req.query.name), 'i')}}})
        }
        if (_.has(req.query, 'status')) {
            pipelines.push({$match: {status: parseInt(req.query.status)}})
        }

        if (_.has(req.query, 'sort')) {
            var stringArr = req.query.sort.split(':');
            var sortCondition = {};
            sortCondition[stringArr[0]] = _.isEqual(stringArr[1], 'asc') ? 1 : -1;
            if (!_.isEmpty(sortCondition)){
                pipelines.push({$sort: sortCondition});
            }
        }

        _KpiMarkData.aggregatePaginate(aggregate, {
            page: page,
            limit: rows
        }, function(error, items, pageCount, total){

            var paginator = new pagination.SearchPaginator({
                prelink: '/kpi-marking',
                current: page,
                rowsPerPage: rows,
                totalResult: total
            });

            _.render(req, res, 'kpi-marking', {
                title: 'Danh sách chấm điểm',
                datas: items,
                paging: paginator.getPaginationData(),
                plugins: [['bootstrap-select']]
            }, true, error);
        });
    }
}

exports.show = function(req, res){
    //Vào trang chấm điểm
    var kpiDataId = req.params.kpimarking;
    _async.waterfall([
        function(callback){
            _KpiMarkData.findById(kpiDataId, function(err, item){
                if (item != null){
                    callback(err, item);
                }
                else{
                    callback('-error-');
                }
            })
        },
        function(kpiData, callback){
            var idCollection= kpiData.idCollection;
            _KpiMarkContent.find({
                status:1,
                idCollection: idCollection
            }, function(err1, contents){
                callback(err1, contents, kpiData);
            })
        }
    ], function(error, contents, kpiData){
        if (!error){
            var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
            var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
            var agg = [];
            if (req.session.auth.role && _.isEqual(req.session.auth.role._id, '575fcbdeae34bf7c1064e631')){
                if (_.has(req.session.auth.role, 'company') && req.session.auth.role.company.length){
                    //auth với quyền QA cấp company
                    var companyIds = _.convertObjectId(req.session.auth.role.company);
                    agg = [
                        {$match: {idData: kpiData._id, qa:{$in:[_.convertObjectId(req.session.user._id)]}}},
                        {$lookup:{
                            from: 'tickets',
                            localField: 'idTicket',
                            foreignField: '_id',
                            as: 'idTicket'
                        }},
                        {$unwind: {
                            path: '$idTicket',
                            preserveNullAndEmptyArrays: true
                        }},
                        {
                            $project: {
                                _id: 1,
                                idTicket: {
                                    _id: 1,
                                    createBy: 1,
                                    deadline: 1,
                                    status: 1,
                                    ticketReasonCategory: 1,
                                    callId: 1,
                                    idAgent: 1,
                                    idService: 1,
                                    idCampain: 1,
                                    idCustomer: 1
                                },
                                idData: 1,
                                idAgent: 1,
                                qa: 1,
                                idMarking: 1,
                                createBy: 1,
                                status: 1
                            }
                        },
                        {$lookup:{
                            from: 'services',
                            localField: 'idTicket.idService',
                            foreignField: '_id',
                            as: 'services'
                        }},
                        {$lookup:{
                            from: 'campains',
                            localField: 'idTicket.idCampain',
                            foreignField: '_id',
                            as: 'campains'
                        }},
                        {$unwind: {
                            path: '$campains',
                            preserveNullAndEmptyArrays: true
                        }},
                        {$unwind: {
                            path: '$services',
                            preserveNullAndEmptyArrays: true
                        }},
                        {$match: {
                            $or: [
                                {'campains.idCompany': companyIds},
                                {'services.idCompany': companyIds}
                            ]
                        }},
                        {$lookup:{
                            from: 'customerindex',
                            localField: 'idTicket.idCustomer',
                            foreignField: '_id',
                            as: 'customerindex'
                        }},
                        {$unwind: {
                            path: '$customerindex',
                            preserveNullAndEmptyArrays: false
                        }},
                        {$unwind: {
                            path: '$idTicket.callId',
                            preserveNullAndEmptyArrays: false
                        }},
                        {$lookup:{
                            from: 'cdrtransinfos',
                            localField: 'idTicket.callId',
                            foreignField: 'callId',
                            as: 'trans'
                        }},
                        {$unwind: {
                            path: '$trans',
                            preserveNullAndEmptyArrays: false
                        }},
                        {
                            $match: {'trans.serviceType': 3}
                        },
                        {$group:{
                            _id: "$_id",
                            idTicket: {
                                $first: "$idTicket"
                            },
                            idData: {
                                $first: "$idData"
                            },
                            customerindex: {
                                $first: "$customerindex"
                            },
                            idMarking: {
                                $first: "$idMarking"
                            },
                            cdrTransInfos: {
                                $push: "$trans"
                            }
                        }}
                    ];
                }
                else{
                    //auth với quyền QA cấp ternal
                    agg = [
                        {$match: {idData: kpiData._id, qa:{$in:[_.convertObjectId(req.session.user._id)]}}},
                        {$lookup:{
                            from: 'tickets',
                            localField: 'idTicket',
                            foreignField: '_id',
                            as: 'idTicket'
                        }},
                        {$unwind: {
                            path: '$idTicket',
                            preserveNullAndEmptyArrays: true
                        }},
                        {
                            $project: {
                                _id: 1,
                                idTicket: {
                                    _id: 1,
                                    createBy: 1,
                                    deadline: 1,
                                    status: 1,
                                    ticketReasonCategory: 1,
                                    callId: 1,
                                    idAgent: 1,
                                    idService: 1,
                                    idCampain: 1,
                                    idCustomer: 1
                                },
                                idData: 1,
                                idAgent: 1,
                                qa: 1,
                                idMarking: 1,
                                createBy: 1,
                                status: 1
                            }
                        },
                        {$lookup:{
                            from: 'customerindex',
                            localField: 'idTicket.idCustomer',
                            foreignField: '_id',
                            as: 'customerindex'
                        }},
                        {$unwind: {
                            path: '$customerindex',
                            preserveNullAndEmptyArrays: false
                        }},
                        {$unwind: {
                            path: '$idTicket.callId',
                            preserveNullAndEmptyArrays: false
                        }},
                        {$lookup:{
                            from: 'cdrtransinfos',
                            localField: 'idTicket.callId',
                            foreignField: 'callId',
                            as: 'trans'
                        }},
                        {$unwind: {
                            path: '$trans',
                            preserveNullAndEmptyArrays: false
                        }},
                        {
                            $match: {'trans.serviceType': 3}
                        },
                        {$group:{
                            _id: "$_id",
                            idTicket: {
                                $first: "$idTicket"
                            },
                            idData: {
                                $first: "$idData"
                            },
                            customerindex: {
                                $first: "$customerindex"
                            },
                            idMarking: {
                                $first: "$idMarking"
                            },
                            cdrTransInfos: {
                                $push: "$trans"
                            }
                        }}
                    ];
                }

                var aggregate= _KpiMarkTicket.aggregate(agg);

                _KpiMarkTicket.aggregatePaginate(aggregate, {
                    page: page,
                    limit: rows
                }, function(error, tickets, pageCount, total){
                    var paginator = new pagination.SearchPaginator({
                        prelink: '/kpi-marking/'+kpiDataId,
                        current: page,
                        rowsPerPage: rows,
                        totalResult: total
                    });
                    _KpiMarkTicket.populate(tickets,
                        [
                            /*{
                             model: _Tickets,
                             path: 'idTicket'
                             },*/
                            {
                                model: _KpiMarking,
                                path: 'idMarking'
                            }
                        ], function(error, resp1){
                            _KpiMarkTicket.populate(resp1, {
                                model: _Users,
                                path: 'idTicket.idAgent'
                            }, function(error, resp2){
                                _KpiMarkTicket.populate(resp2, {
                                    model: _Campains,
                                    path: 'idTicket.idCampain',
                                    populate: {
                                        model: _Company,
                                        path: 'idCompany',
                                        select: 'name idCompany'
                                    }
                                }, function(error, resp3){
                                    _KpiMarkTicket.populate(resp3, {
                                        model: _Services,
                                        path: 'idTicket.idService',
                                        populate: {
                                            model: _Company,
                                            path: 'idCompany',
                                            select: 'name idCompany'
                                        }
                                    }, function(error, resp4) {
                                        _.render(req, res, 'kpi-marking-detail', {
                                            title: 'Chấm điểm',
                                            contents: contents,
                                            tickets: resp4,
                                            paging: paginator.getPaginationData(),
                                            plugins: [
                                                ['bootstrap-select'],
                                                ['mrblack-table']
                                            ]
                                        }, true, error);
                                    });
                                });
                            });
                        });
                });
            }
            else{
                _.render(req, res, 'kpi-marking-detail', {
                    title: 'Chấm điểm',
                    contents: contents,
                    plugins: [
                        ['bootstrap-select'],
                        ['mrblack-table']
                    ]
                }, true, new Error("Không đủ quyền truy cập"));

            }
        }
    })
};

exports.update = function(req, res){
    //Cập nhật dữ liệu chấm điểm
    var markData = _.omit(req.body, 'ticketId', 'agentId', 'idCollection', 'ticketMarkId');
    _KpiMarking.findOneAndUpdate(
        {idData: new mongodb.ObjectId(req.params.kpimarking), ticketId: new mongodb.ObjectId(req.body.ticketId)},
        {idData: new mongodb.ObjectId(req.params.kpimarking), agentId: new mongodb.ObjectId(req.body.agentId), ticketId: new mongodb.ObjectId(req.body.ticketId), markCollectionId: new mongodb.ObjectId(req.body.idCollection), datas: markData, updated: new Date()},
        {upsert: true, new: true},
        function(err, resp){
            if (!err && resp){
                _KpiMarkTicket.findOneAndUpdate({_id: req.body['ticketMarkId']}, {idMarking: resp._id}, function (error) {
                    res.json({code: error ? 500 : 200});
                });
            }
        });
};