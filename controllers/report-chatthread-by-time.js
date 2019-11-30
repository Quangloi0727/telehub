/**
 * Created by sonth on 6/29/2016.
 */

exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        if (_.has(req.query, 'queryChannel')) {
            if (_.has(req.query, 'idCompany')){
                _CompanyChannel.find({idCompany: _.convertObjectId(req.query.idCompany), status: 1}, function (err, channels) {
                    res.json({code: err ? 500 : 200, channels: channels});
                });
            }
            else{
                res.status(404).json({});
            }
        }
        else {
            _async.waterfall([function(cb){
                var threadQuery = {};
                threadQuery.status = 0;
                _CompanyChannel.distinct("_id",req.query.idCompany? {idCompany: _.convertObjectId(req.query.idCompany), status: 1}:{status:1}, function (err, channels) {
                    if (_.has(req.query, 'startTime') && _.has(req.query, 'endTime')){
                        threadQuery['created'] = {
                            $gte: _moment(req.query['startTime'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d,
                            $lte: _moment(req.query['endTime'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                        }
                    }
                    else{
                        if (_.has(req.query, 'startTime')){
                            threadQuery['created'] = {
                                $gte: _moment(req.query['startTime'] + '00:00:00', 'DD/MM/YYYY hh:mm:ss')._d
                            }
                        }
                        if (_.has(req.query, 'endTime')){
                            threadQuery['created'] = {
                                $lte: _moment(req.query['endTime'] + '23:59:59', 'DD/MM/YYYY hh:mm:ss')._d
                            }
                        }
                    }
                    _ServicesChat.distinct("_id", {idChannel: req.query.idChannel ? _.convertObjectId(req.query.idChannel):{$in:channels}}, function(err,r2){
                        _TicketsChat.distinct('threadId',{idService:{$in:r2},status:{$ne:-1}}, function(err,r3){
                            threadQuery['_id'] = {$in: r3};
                            cb(err, threadQuery);
                        });
                    });
                });
            }], function(err, result){
                var agg = _ChatThread.aggregate();
                agg._pipeline = [
                    {$match: result},
                    {$sort: {created:-1}}
                ];
                _ChatThread.aggregatePaginate(agg, {page: page, limit: rows}, function (error, threads, pageCount, total) {
                    var paginator = new pagination.SearchPaginator({
                        prelink: '/report-chatthread-by-time',
                        current: page,
                        rowsPerPage: rows,
                        totalResult: total
                    });

                    _ChatThread.populate(threads, {
                        path: "agentId",
                        model: _Users
                    }, function(err, threads){
                        var totalTime = 0;
                        var rData = [];
                        _async.each(threads, function(thread, cb){
                            thread.time = _moment(thread.updated).diff(_moment(thread.created)) / thread.agentId.length;
                            rData.push(thread);
                            totalTime += thread.time;
                            cb();
                        }, function(){
                            var timePerThread = parseInt(totalTime / threads.length);
                            res.json({code: _.isNull(error) ? 200 : 500, data: rData, timePerThread: timePerThread, paging: paginator.getPaginationData()});
                        });
                    });
                });
            })
        }
    },
    html: function (req, res) {
        var companyIds = [];
        if (req.session.auth.company) {
            companyIds.push(new mongoose.Types.ObjectId(req.session.auth.company._id))
            if (!req.session.auth.company.leader) {
                _.render(req, res, 'report-chatthread-by-time', {
                    title: "Báo cáo thời gian trung bình cuộc chat",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    company: []
                }, true, new Error("Không đủ quyền truy cập"));
                return;
            }
        }

        _async.parallel({
            getCompany: function(next){
                _Company.find( req.session.auth.company ? {_id: req.session.auth.company, status: 1} : {status: 1}, next);
            }
        }, function(err, resp){
            if (!err){
                return _.render(req, res, 'report-chatthread-by-time', {
                    title: "Báo cáo thời gian trung bình cuộc chat",
                    plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker'], 'export-excel', ['chosen']],
                    company: resp.getCompany
                }, true, err);
            }
        });
    }
}
