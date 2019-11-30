/**
 * Created by sonth on 5/17/16.
 */
exports.index = function (req, res) {

    if (!_.has(req.query, 'ticketId') || !mongodb.ObjectID.isValid(req.query.ticketId))
        return res.json({code: 500, message: 'TicketID không chính xác'});

    var ticketId = req.query.ticketId;
    var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
    var rows = 10;

    _TicketChatHistory
        .find({ticketId: ticketId})
        .populate({path: 'ticketObject.updateBy', model: _Users, select: 'name displayName'})
        .populate({path: 'ticketObject.ticketSubreason', model: _TicketSubreason, select: 'name -_id'})
        .populate({path: 'ticketObject.ticketReasonCategory', model: _TicketReasonCategory, select: 'name -_id'})
        .paginate(page, rows, function (err, result, total) {
            if (err) return res.json({code: 500, message: JSON.stringify(err)});
            var paginator = new pagination.SearchPaginator({prelink: '/ticket-chat-history?ticketId=' + ticketId, current: page, rowsPerPage: rows, totalResult: total});
            var obj = {};
            obj['data'] = result;
            obj['paging'] = paginator.getPaginationData();
            res.json({code: err ? 500 : 200, message: err ? err : obj});
        });
}