/**
 * Created by luongvanlam on 4/25/16.
 */

var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));
var inboundTicket = require(path.join(_rootPath, 'controllers', 'inbound.js'));
var outboundTicket = require(path.join(_rootPath, 'controllers', 'outbound.js'));

exports.index = {
    json: function(req, res){
        if (req.query.formId.indexOf('inbound') >= 0){
            // Lấy dữ liệu ticket outbound
            inboundTicket.index.json(req, res);
        }else{
            // Lấy dữ liệu ticket inbound
            outboundTicket.index.json(req, res);
        }
    },
    html: function (req, res) {
        _async.parallel({
            reasons_in: function(next){
                // Lấy dữ liệu nhóm tình trạng ticket cho gọi vào
                var aggs = [];
                aggs.push({$match: {category: {$in: [0,1]}}}); // TODO: loại reason là tất cả và gọi vào
                aggs.push({$lookup: {from: 'ticketreasons', localField: '_id', foreignField: 'idCategory', as: 'reasons'}});
                aggs.push({$unwind: '$reasons'});
                aggs.push({$lookup: {from: 'ticketsubreasons', localField: 'reasons._id', foreignField: 'idReason', as: 'reasons.subreasons'}});
                aggs.push({
                    $group: {
                        _id: '$_id',
                        reasons: {$push: '$reasons'},
                        name: {$first: '$name'}
                    }
                });

                _TicketReasonCategory.aggregate(aggs, next);
            },
            reasons_out: function(next){
                // Lấy dữ liệu nhóm tình trạng ticket cho gọi ra
                var aggs = [];
                aggs.push({$match: {category: {$in: [0,2]}}}); // TODO: loại reason là tất cả và gọi ra
                aggs.push({$lookup: {from: 'ticketreasons', localField: '_id', foreignField: 'idCategory', as: 'reasons'}});
                aggs.push({$unwind: '$reasons'});
                aggs.push({$lookup: {from: 'ticketsubreasons', localField: 'reasons._id', foreignField: 'idReason', as: 'reasons.subreasons'}});
                aggs.push({
                    $group: {
                        _id: '$_id',
                        reasons: {$push: '$reasons'},
                        name: {$first: '$name'}
                    }
                });

                _TicketReasonCategory.aggregate(aggs, next);
            },
            inbound: function(callback){
                // Lấy dữ liệu công ty cho gọi vào
                _async.parallel({
                    company: function (callback) {
                        var agg = [{$match: {status: 1}}];
                        if (!_.isEmpty(req.session.auth.company))
                            agg.push({$match: {_id: _.convertObjectId(req.session.auth.company._id)}});

                        agg.push({$project: {_id: 1, name: 1}});

                        _Company.aggregate(agg, callback);
                    }
                }, callback);
            },
            outbound: function(callback){
                // Lấy dữ liệu công ty cho gọi ra
                var agg = [{$match: {status: 1}}];
                if (!_.isEmpty(req.session.auth.company)) {
                    agg.push({$match: {_id: _.convertObjectId(req.session.auth.company._id)}});
                }

                agg.push(
                    {
                        $lookup: {
                            from: 'campains',
                            localField: '_id',
                            foreignField: 'idCompany',
                            as: 'campain'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            campain: {
                                _id: 1,
                                name: 1
                            }
                        }
                    }
                );

                _Company.aggregate(agg, callback);
            }
        }, function(err, result){
            _.render(req, res, 'following', {
                title: 'Danh sách theo dõi',
                reasons_in: result.reasons_in,
                reasons_out: result.reasons_out,
                inbound: result.inbound,
                outbound: result.outbound,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']]
            }, true, err);
        });
    }
};