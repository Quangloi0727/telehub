exports.index = {
    json: function (req, res) {
        _TicketReasonCategory.find({name: req.body['name']}, function (err, r) {
            if (r.length == 0) {
                //req.body['status'] = (_.has(req.body, 'status')&&req.body['status']!=0) ? 1 : 0;
                //req.body.createdBy = req.session.user._id;
                //_TicketReasonCategory.create(_.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value(), function (error, group) {
                //    res.json({
                //        code: (err ? 500 : 200),
                //        message: err ? err : r
                //    })
                //});
                return true;
            }else{
                return false;
            }
        });
    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;
        var query = _.cleanRequest(req.query);
        var aggregate = _TicketReasonCategory.aggregate();
        aggregate._pipeline = [];
        aggregate._pipeline.push({
                $lookup: {
                    from: 'ticketreasons',
                    localField: '_id',
                    foreignField: 'idCategory',
                    as: 'reason'
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }

            },{
                $lookup: {
                    from: 'campains',
                    localField: '_id',
                    foreignField: 'idCategoryReason',
                    as: 'campaign'
                }

            },{
                $sort:{name:1}
            }
        );
        _.allKeys(query).forEach(function (el) {
            var matchObj = {};
            if (_.isEqual(el, 'page') || _.isEqual(el, 'rows') || _.isEmpty(req.query[el])) return;
            if ( _.isEqual(el, 'category') || _.isEqual(el, 'status')) {matchObj[el] = parseInt(query[el])}
            else {matchObj[el] = {$regex: new RegExp(_.stringRegex(query[el]), 'i')}};
            aggregate._pipeline.push({$match: matchObj});
        });
        //if(!_.isEmpty(query)) _.has(query, 'status') && query['status'] = 'on',? aggregate._pipeline.push({$match:{status:1}}) : aggregate._pipeline.push({$match:{status:0}});
        _TicketReasonCategory.aggregatePaginate(aggregate, {
                page: page,
                limit: rows
            }, function (error, ticket, pageCount, count) {
                var paginator = new pagination.SearchPaginator({prelink: '/ticket-reason-category', current: page, rowsPerPage: rows, totalResult: count});
                for (var i = 0; i < ticket.length; i++) {
                    if(ticket[i].campaign.length != 0) ticket[i].campaign = ticket[i].campaign[0].name;
                    if(ticket[i].createdBy.length != 0) ticket[i].createdBy = ticket[i].createdBy[0].displayName;
                    switch(ticket[i].category){
                        case 0:
                            ticket[i].category = "Gọi vào và gọi ra"
                            break;
                        case 1:
                            ticket[i].category = "Gọi vào"
                            break;
                        case 2:
                            ticket[i].category = "Gọi ra"
                            break;
                        case 3:
                            ticket[i].category = "Chat"
                            break;
                        case 4:
                            ticket[i].category = "Email"
                            break;
                        case 5:
                            ticket[i].category = "Mạng xã hội"
                            break;
                        //case 6:
                        //    ticket[i].category = "Tất cả"
                        //    break;
                    }
                }
                ;
                _.render(req, res, 'ticket-reason-category', {
                    paging: paginator.getPaginationData(),
                    title: 'Thiết lập nhóm tình trạng',
                    plugins: [['chosen'], ['bootstrap-select']],
                    ticket: _.chain(ticket).value()
                }, true);
            }
        );
    }
}
exports.new = function (req, res) {
    _.render(req, res, 'ticket-reason-category-new', {title: 'Tạo mới nhóm tình trạng',plugins: [['bootstrap-select']]}, true);
};
exports.create = function (req, res) {
    _TicketReasonCategory.find({name: req.body['name']}, function (err, r) {
        if (r.length == 0) {
            req.body['status'] = (_.has(req.body, 'status')&&req.body['status']!=0) ? 1 : 0;
            req.body.createdBy = req.session.user._id;
            _TicketReasonCategory.create(_.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value(), function (error, group) {
                res.json({
                    code: (error ? 500 : 200),
                    message: error ? error : group
                })
            });
        }
    });
};

exports.update = function (req, res) {
    req.body = _.chain(req.body).cleanRequest().replaceMultiSpaceAndTrim().value();
    req.body['updatedDate'] = _moment()._d;
    req.body['status'] = (_.has(req.body, 'status')&&req.body['status']!=0) ? 1 : 0;
    req.body.updatedBy = req.session.user._id;
    _TicketReasonCategory.findByIdAndUpdate({_id: req.params['ticketreasoncategory']}, req.body, {new: true}, function (error, group) {
        res.json({code: (error ? 500 : 200), message: error ? error : ''})
    });
};

exports.edit = function (req, res) {
        _TicketReasonCategory.findById(req.params['ticketreasoncategory'], function (error, ticket) {
            _TicketReason.find({idCategory:req.params['ticketreasoncategory']}, null, {sort:{priority:1}}, function(error, reason){
                _.render(req, res, 'ticket-reason-category-edit', {title: 'Chỉnh sửa nhóm tình trạng',plugins: [['chosen'], ['bootstrap-select'],['jquery-ui']], currentTicket: ticket, reason:reason}, !_.isNull(ticket), error);
            });
        });
};

exports.validate = function (req, res) {
    var _query = _.chain(req.query).cleanRequest(['_', 'fieldId', 'fieldValue']).replaceMultiSpaceAndTrim().value();
    if (_.has(_query, 'x-' + _.cleanValidateKey(req.query.fieldId)) && _.isEqual(_query[_.cleanValidateKey(req.query.fieldId)], _query['x-' + _.cleanValidateKey(req.query.fieldId)])) {
        res.json([req.query.fieldId, true]);
    } else {
        delete _query['x-' + _.cleanValidateKey(req.query.fieldId)];
        _TicketReasonCategory.findOne(_query).exec(function (error, f) {
            res.json([req.query.fieldId, _.isNull(f)]);
        });
    }
};

exports.destroy = function (req, res) {
    var ids = [];
    if (!_.isEqual(req.params.ticketreasoncategory, 'all')) {
        ids = req.params.ticketreasoncategory;
    }
    else{
        ids = req.body.ids.split(",");
    }
    _TicketReasonCategory._remove(ids, function (error, group) {
        res.json({
            code: (error ? 500 : 200),
            message: error ? error : ''
        });
    });
};