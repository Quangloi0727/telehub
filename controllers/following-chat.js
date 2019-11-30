/**
 * Created by luongvanlam on 4/25/16.
 */

var parseJSONToObject = require(path.join(_rootPath, 'queue', 'common', 'parseJSONToObject.js'));
var inboundTicket = require(path.join(_rootPath, 'controllers', 'inbound-chat.js'));

exports.index = {
    json: function(req, res){
        if (req.query.formId.indexOf('inbound') >= 0){
            // Lấy dữ liệu gọi vào
            inboundTicket.index.json(req, res);
        }
    },
    html: function (req, res) {
        _async.parallel({
            company: function (callback) {
                // Lấy dữ liệu công ty
                var agg = [{$match: {status: 1}}];
                if (!_.isEmpty(req.session.auth.company))
                    agg.push({$match: {_id: _.convertObjectId(req.session.auth.company._id)}});

                agg.push({$project: {_id: 1, name: 1}});

                _Company.aggregate(agg, callback);
            },
            ticketReasonCategory: function (callback) {
                // Lấy dữ liệu nhóm tình trạng ticket
                _TicketReasonCategory.aggregate([
                    {$match: {status: 1, category: {$ne: 2}}},
                    {$project: {_id: 1, name: 1}}
                ], callback)
            }
        }, function(err, result){
            _.render(req, res, 'following-chat', {
                title: 'Danh sách theo dõi',
                inbound: result,
                plugins: ['moment', ['bootstrap-select'], ['bootstrap-datetimepicker']]
            }, true, err);
        });
    }
};