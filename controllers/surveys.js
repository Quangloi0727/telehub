

//_Surveys.aggregate(aggregate._pipeline, function(err, data) {
//    var newData = _.chain(data).each(function (g) {
//        //g.sources = _.sortBy(g.questions, 'amount').reverse();
//        g.totals = g.questions.length;
//    }).value();
//    console.log(newData);
//});
////_Surveys.aggregatePaginate(aggregate, {page: 1, limit: 10}, function(err, data){
////    console.log(data);
////});


exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var sort = _.cleanSort(req.query,'');
        var query = _.cleanRequest(req.query);

        var aggregate = _Surveys.aggregate();
        aggregate._pipeline = [];
        aggregate._pipeline.push({$lookup: {from: 'surveyquestions', localField: '_id', foreignField: 'idSurvey', as: 'questions'}});
        var _query = {};
        if(query['name']) _query['name'] = {$regex: new RegExp(_.stringRegex(query['name']), 'i')};
        if(query['note']) _query['note'] = {$regex: new RegExp(_.stringRegex(query['note']), 'i')};
        if(query['status']) _query['status'] = Number(query['status']);

        if (!_.isEmpty(_query)) aggregate._pipeline.push({$match: _query});
        if (!_.isEmpty(sort)) aggregate._pipeline.push({$sort: sort});

        _Surveys.aggregatePaginate(aggregate, {page: (_.isEqual(page, 1) ? 0 : ((page - 1) * rows)), limit: rows}, function (error, surveys, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink: '/surveys', current: page, rowsPerPage: rows, totalResult: count});
            _Users.populate(surveys,{path: 'createBy updateBy', select: 'name'},function(err, newItems){
                newItems = _.chain(newItems).each(function (g) {
                        g.numQuest = g.questions.length;
                    })
                    .value();

                var _sort = {};
                if(sort['numQuest']){
                    newItems = (sort['numQuest'] == 1) ? _.sortBy(newItems, 1) : _.sortBy(newItems, 1).reverse();
                }

                _.render(req, res, 'surveys',
                    {
                        title: 'Danh sách nhóm câu hỏi khảo sát',
                        searchData: query,
                        categories: newItems,
                        paging: paginator.getPaginationData(),
                        plugins: [['bootstrap-select']]
                    }, true, error);
            });
        });
    }
}

exports.edit = function (req, res) {
    _Surveys.findById(req.params.survey, function (err, survey) {
        if(survey){
            _.render(req, res, 'surveys-edit', {title: 'Chỉnh sửa nhóm câu hỏi khảo sát', current: survey, plugins: [['summernote']]}, !_.isNull(survey), err);
        }else{
            res.json({code: 404, message: 'Page not found'});
        }
    });
};

exports.create = function (req, res) {
    req.body['createBy'] = req.session.user._id;
    req.body['created'] = new Date();

    _async.waterfall([
        function(next){
            _Surveys.count({name: req.body.name}, next);
        },
        function(count,next){
            (count == 0) ? _Surveys.create(req.body, next) : next(count, null);
        }
    ],function(err, result){
        res.json({code: (err ? 500 : 200), message: err? 'Có lỗi xảy ra' : ''});
    });
};

exports.update = function (req, res) {
    req.body['updateBy'] = req.session.user._id;
    req.body['updated'] = Date.now();

    _Surveys.findByIdAndUpdate(req.params.survey, req.body, {new: true}, function (error, sv) {
        res.json({code: (error ? 500 : 200), message: error ? error : sv});
    });
};

exports.new = function (req, res) {
    _.render(req, res, 'surveys-new', {title: 'Tạo mới nhóm câu hỏi khảo sát', plugins: [['summernote']]}, true);
};

exports.validate = function (req, res) {
    if(req.query.updateId){
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId']);
        var _query = {$and: [_query1, _query2]};
        _Surveys.findOne(_query).exec(function (error, sv) {
            res.json([req.query.fieldId, _.isNull(sv)]);
        });
    }else {
        var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue']);
        _Surveys.findOne(_query).exec(function (error, sv) {
            res.json([req.query.fieldId, _.isNull(sv)]);
        });
    }
};

exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.survey, 'all')) {
        _Surveys._deleteAll({$in: [req.params.survey]}, function (error) {
            res.json({code: (error ? 500 : 200), message: error ? error :""});
        });
    }else{
        _Surveys._deleteAll({$in:req.body.ids.split(',')}, function (error) {
            res.json({code: (error ? 500 : 200), message: error ? error : ""});
        });
    }
};

exports.search = {
    json : function(req, res){
        var name = req.query.name;

        _Surveys
            .find({name: new RegExp('^'+name+'$')}, function(error, result){
                res.json({code: (error ? 500 : 200), message: error ? error : result});
            });
    },
    html : function(req, res){
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var aggregate = _Surveys.aggregate();
        aggregate._pipeline = [];
        aggregate._pipeline.push({$lookup: {from: 'surveyquestions', localField: '_id', foreignField: 'idSurvey', as: 'questions'}});

        var _query = {};
        var searchData = {};

        var addSearch = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = req.query[fieldName];
            searchData[fieldName] = req.query[fieldName];
        }

        var addSearchNumber = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = Number(req.query[fieldName]);
            searchData[fieldName] = req.query[fieldName];
        }

        var addSearchText = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = {$regex: new RegExp(_.stringRegex(req.query[fieldName]), 'i')};
            searchData[fieldName] = req.query[fieldName];
        }

        addSearchText('name');
        addSearchText('note');
        addSearchNumber('status');

        aggregate._pipeline.push({$match: {$and: [_query]}});

        _Surveys.aggregatePaginate(aggregate, {page: (_.isEqual(page, 1) ? 0 : ((page - 1) * rows)), limit: rows}, function (error, surveys, pageCount, count) {
            var paginator = new pagination.SearchPaginator({prelink: '/surveys', current: page, rowsPerPage: rows, totalResult: count});

            _Users.populate(surveys,{path: 'createBy updateBy', select: 'name'},function(err, newItems){
                var _sort = {};
                searchData.dataLength = newItems.length;
                newItems = _.chain(newItems).each(function (g) {
                        g.numQuest = g.questions.length;
                    })
                    .value();
                if(req.query['sortField']){
                    _sort[req.query['sortField']] = _.isEqual(req.query['sortValue'], 'asc') ? 1 : -1;
                    newItems = _.isEqual(req.query['sortValue'], 'asc') ? _.sortBy(newItems, req.query['sortField']) : _.sortBy(newItems, req.query['sortField']).reverse();
                }

                _.render(req, res, 'surveys',
                    {
                        title: 'Danh sách nhóm câu hỏi khảo sát',
                        searchData: searchData,
                        sortData: _sort,
                        categories: newItems,
                        paging: paginator.getPaginationData(),
                        plugins: [['bootstrap-select']]
                    }, true, error);
            });
        });
    }
}