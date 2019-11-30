/**
 * Created by sonth on 13/01/2016.
 */
// GET

exports.index = {
    json: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 4;
        var sort = _.cleanSort(req.query, '');
        var query = {};

    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

//        if (_.has(req.query, 'search_by_company')){
//            req.query.company = req.query["search_by_company"];
//        }
//
//        if (_.has(req.query, 'search_by_group')){
//            req.query.group = req.query["search_by_group"];
//        }

        if (_.has(req.query, 'maxsession')){
            req.query.maxChatSession = req.query["maxsession"];
        }

        if (_.isEqual(req.query["status"], '-1')) {
            delete  req.query.status;
        }
//        console.log(39, req.query);

        var _query = _.chain([{name: 'name', type: 1}, {name: 'maxChatSession', type: 2}, {name: 'status', type: 2}])
            .map(function (o) {
                return _.has(req.query, o.name) ? _.object([o.name], [_.switchAgg(o.type, req.query[o.name])]) : null;
            })
            .compact()
            .reduce(function (memo, item) {
                memo[_.keys(item)] = _.values(item)[0];
                return memo;
            }, {})
            .value();

//        var matchGroup = {};
//        if (_.has(req.query, 'group')){
//            matchGroup.name = {$regex: new RegExp(_.stringRegex(req.query['group']), 'i')};
//        }
//
//        var matchCompany = {};
//        if (_.has(req.query, 'company')){
//            matchCompany.name = {$regex: new RegExp(_.stringRegex(req.query['company']), 'i')};
//        }
        _Users
            .find(_query)
            .populate({
                path: 'agentGroupMembers.group',
//                match: matchGroup,
                model: _AgentGroups,
                populate: {
                    path: 'idParent',
//                    match: matchCompany,
                    model: _Company
                }
            })
            .sort(_.cleanSort(req.query))
            .paginate(page, rows, function (error, users, total) {
                var paginator = new pagination.SearchPaginator({prelink: '/user-chat-settings', current: page, rowsPerPage: rows, totalResult: total});
                _.render(req, res, 'user-chat-settings', {title: 'User chat setting ', users: users, paging: paginator.getPaginationData(), plugins: ['moment', ['bootstrap-select']]}, true, error);
            });
    }
};

exports.update = function (req, res) {
    if (_.isEqual(req.params.userchatsetting, 'all')){
        var data = JSON.parse(req.body.data);
        var ids = data.ids;
        var value = data.value;
        _async.eachSeries(ids, function iteratee(item, callback) {
            _Users
                .findOneAndUpdate({_id : item},{
                    $set: {
                        maxChatSession : parseInt(value)
                    }
                }, {new: true}, function(err, result){
                    if (!err){
//                        console.log(108, 'send user updated : ' + result);
                        QUEUE_TernalPublish.queuePublish('Users', 2, result);
                    }
                    callback();
                });
        }, function done(err, result){
            res.json({
                code : err ? 500: 200,
                message: err ? err : result
            })
        });
    }
    else{
        _Users
            .findOneAndUpdate({_id : req.params.userchatsetting},{
                $set: {
                    maxChatSession : parseInt(req.body.value)
                }
            }, {new: true}, function(err, result){
                if (!err){
//                    console.log(108, 'send user updated : ' + result);
                    QUEUE_TernalPublish.queuePublish('Users', 2, result);
                }
                res.json({
                    code : err ? 500: 200,
                    message: err ? err : result
                })
            })
    }

};
