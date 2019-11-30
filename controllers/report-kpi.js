/**
 * Created by sonth on 9/20/2016.
 */

exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var _query = {}, _sort = {};
        if (_.has(req.query, 'agent')){
            _query['displayName'] = {$regex: new RegExp(_.stringRegex(req.query.agent), 'i')};
        }
        if (_.has(req.query, 'sort')){
            _sort[req.query['sort'].split(':')[0]] = (req.query['sort'].split(':')[1] == 'asc') ? 1 : -1;
        }
        else{
            _sort = {evaluation: 1};
        }
        _Users.find(_query, function(err, users){
            if (!err){
                if (users.length > 0){
                    var ids = _.pluck(users, '_id');
                    var agg = [
                        {$match: {
                            idData: _.convertObjectId(req.query.markData),
                            idAgent: {
                                $in: ids
                            }
                        }},
                        {$lookup:{
                            from: 'kpimarkings',
                            localField: 'idMarking',
                            foreignField: '_id',
                            as: 'marks'
                        }},
                        {$unwind: {
                            path: '$marks',
                            preserveNullAndEmptyArrays: true
                        }},
                        {
                            $group: {
                                _id: "$idAgent",
                                data: {
                                    $push: "$_id"
                                },
                                marks: {
                                    $push: "$marks"
                                },
                                sum: {
                                    $sum: "$marks.datas.kpi_sum"
                                },
                                max: {
                                    $sum: "$marks.datas.kpi_maxInput"
                                }
                            }
                        },
                        {
                            $project: {
                                data: 1,
                                marks: 1,
                                sum: 1,
                                max: 1,
                                evaluation: {
                                    $cond: { if: { $gt: [ "$max", 0 ] }, then: {
                                        $divide: ["$sum", "$max"]
                                    }, else: 0 }
                                }
                            }
                        },
                        {$sort: _sort}
                    ];
                    _KpiMarkTicket.aggregate(agg, function(error, tickets) {
                        if (!err){
                            _Users.populate(tickets, {
                                path: '_id'
                            }, function(err, datas){
                                res.json({code: err ? 500 : 200, data: datas});
                            });
                        }
                        else{
                            res.json({code: 500});
                        }
                    });
                }
                else{
                    //khong tim thay user
                }
            }
            else{
                res.json({code: 500});
            }
        });
    },
    html: function (req, res) {
        _KpiMarkData.find({}, function(err, resp){
            _.render(req, res, 'report-kpi', {
                title: "Báo cáo chấm điểm điện thoại viên",
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                markData: resp
            }, true, err);
        });
    }
};


