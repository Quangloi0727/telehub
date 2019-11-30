/**
 * 03.Mar.2017 hoangdv updated
 */
exports.index = {
    json: function (req, res) {

    },
    html: function (req, res) {
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var _query = _.has(req.query,'idSurvey') ? {idSurvey: req.query.idSurvey} : {};

        _Surveys.findById(req.query.idSurvey, function (err, survey) {
            if(survey){
                _SurveyQuestion
                    .find(_query)
                    .populate('idNextQuestion','content')
                    .populate('createBy','name')
                    .populate('updateBy','name')
                    .sort(_.cleanSort(req.query))
                    .paginate(page, rows, function (error, items, total) {
                        var searchData = {};
                        var paginator = new pagination.SearchPaginator({prelink: '/survey-question?idSurvey='+req.query.idSurvey, current: page, rowsPerPage: rows, totalResult: total});
                        _.render(req, res, '/survey-question',
                            {
                                title: 'Danh sách câu hỏi khảo sát',
                                sortData:_.cleanSort(req.query),
                                searchData: searchData,
                                survey: req.query.idSurvey,
                                surveyName: survey.name,
                                categories: items,
                                paging: paginator.getPaginationData()
                            }
                            , true, error);
                    });
            }else {
                res.json({code: 404, message: 'Page not found'});
            }
        });
    }
};

exports.edit = function (req, res) {
    _SurveyQuestion.findById(req.params.surveyquestion)
        .populate('idSurvey','name')
        .exec(function (err, sq) {
            if(sq) {
                _SurveyQuestion.find({$and:[{idSurvey:sq.idSurvey}, {_id: {$ne: sq._id}}]}, function(err1, questionList){
                    _SurveyAnswer.find({idQuestion:sq._id})
                        .exec(function(err2, answerList){
                        _.render(req, res, 'survey-question-edit', {
                            title: 'Chỉnh sửa câu hỏi khảo sát',
                            current: sq,
                            questionList: questionList,
                            answerList: answerList,
                            plugins: [['bootstrap-select']]
                        }, !_.isNull(sq), err);
                    });
                });
            }else {
                res.json({code: 404, message: 'Page not found'});
            }

        });
};

exports.create = function (req, res) {
    req.body['createBy'] = req.session.user._id;
    req.body['created'] = new Date();

    req.body['content'] = req.body['contentQ'];

    var question = req.body;
    question = _.cleanRequest(question, ['contentQ']);

    if(_.isEqual(req.body['idNextQuestion'], '')){
        question['idNextQuestion'] = null;
    }

    for(var i = 0; i < 10; i++){
        question = _.cleanRequest(question, ['answer_'+i, 'answer_'+i+'_nextQuestion']);
    }

    _SurveyQuestion.create(question, function (error, sq) {
        if(!error){
            if(_.isEqual(req.body['answerType'],'1')  )
            {
                for(var i = 0; i < 10; i++){
                    if(!_.isEqual(req.body['answer_'+i],'')){
                        var _answer = {};
                        _answer['content'] = _.has(req.body,'answer_'+i)? req.body['answer_'+i]: undefined;
                        _answer['idNextQuestion'] = (_.has(req.body,'answer_'+i+'_nextQuestion') && !_.isEqual(req.body['answer_'+i+'_nextQuestion'], ''))? req.body['answer_'+i+'_nextQuestion']: undefined;
                        _answer['idQuestion'] = sq._id;
                        _answer['position'] = i;
                        _SurveyAnswer.create(_answer);
                    }
                }
            }
            if(question.isStart == 1){
                _SurveyQuestion.update({
                    _id: {
                        $ne: sq._id,
                        // 03 Mar 2017 hoangdv only clear isStart of questions in this survey
						idSurvey: req.query.idSurvey
                    }
                },
                    {
                        $set: {
                            isStart:0
                        }
                    },
                    {
                        multi:true
                    }, function(err) {

                });
            }
        }
        res.json({code: (error ? 500 : 200), message: error ? error : sq});
    });
};

exports.update = function (req, res) {
    req.body['updateBy'] = req.session.user._id;
    req.body['updated'] = Date.now();

    req.body['content'] = req.body['contentQ'];

    var question = req.body;
    question = _.cleanRequest(question, ['contentQ']);

    if(_.isEqual(req.body['idNextQuestion'], '')){
        question['idNextQuestion'] = null;
    }

    for(var i = 0; i < 10; i++){
        question = _.cleanRequest(question, ['answer_'+i, 'answer_'+i+'_nextQuestion']);
    }

    _SurveyQuestion.findByIdAndUpdate(req.params.surveyquestion, question, function (error, sq) {
        if(!error){
            if(_.isEqual(req.body['answerType'],'1')  )
            {
                var deleteAnswers = [];
                for(var i = 0; i < 10; i++){
                    var answerId = req.body['answer_'+i+'_id'];
                    if(!_.isEqual(req.body['answer_'+i],'')){
                        var _answer = {};
                        _answer['content'] = _.has(req.body,'answer_'+i)? req.body['answer_'+i]: undefined;
                        _answer['idNextQuestion'] = (_.has(req.body,'answer_'+i+'_nextQuestion') && !_.isEqual(req.body['answer_'+i+'_nextQuestion'], ''))? req.body['answer_'+i+'_nextQuestion']: undefined;
                        _answer['idQuestion'] = sq._id;
                        _answer['position'] = i;
                        if(_.isEmpty(answerId)){
                            _SurveyAnswer.create(_answer);
                        }else {
                            _SurveyAnswer.findByIdAndUpdate(answerId, _answer, function(err, result){

                            });
                        }
                    }else{
                        if(answerId) {
                            deleteAnswers.push(answerId);
                        }
                    }
                }

                _async.waterfall([
                    function (next) {
                        _SurveyResult.remove({answerContent: {$in: deleteAnswers}}, next);
                    },
                    function (obj, next) {
                        _SurveyAnswer.remove({_id: {$in: deleteAnswers}}, next);
                    }
                ], function(err, result){
                    //console.log(156, err, result);
                });
            }

            if(question.isStart == 1){
                _SurveyQuestion.update({
                        _id: {$ne: sq._id},
						// 03 Mar 2017 hoangdv only clear isStart of questions in this survey
						idSurvey: req.query.idSurvey
                },
                    {
                        $set:{
                            isStart: 0
                        }
                    },
                    {
                        multi: true
                    }, function(err){

                });
            }
        }
        res.json({code: (error ? 500 : 200), message: error ? error : sq});
    });
};

exports.new = function (req, res) {
    _async.parallel({
        questions: function(next){
            _SurveyQuestion.find({idSurvey:req.query.idSurvey},next);
        },
        survey: function(next){
            _Surveys.findById(req.query.idSurvey,next);
        }
    }, function(err, result){
        _.render(req, res, 'survey-question-new', {
            title: 'Tạo mới câu hỏi khảo sát',
            survey: result.survey,
            questionList:result. questions,
            plugins: [['bootstrap-select']]
        }, true);
    });
};

exports.validate = function (req, res) {
    if(req.query.updateId){
        req.query.content = req.query.contentQ;
        var _query1 = {_id: {$ne: req.query.updateId}};
        var _query2 = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'updateId', 'contentQ']);
        var _query = {$and: [_query1, _query2]};
        _SurveyQuestion.findOne(_query).exec(function (error, sv) {
            res.json([req.query.fieldId, _.isNull(sv)]);
        });
    }else {
        req.query.content = req.query.contentQ;
        var _query = _.cleanRequest(req.query, ['_', 'fieldId', 'fieldValue', 'contentQ']);
        _SurveyQuestion.findOne(_query).exec(function (error, sv) {
            res.json([req.query.fieldId, _.isNull(sv)]);
        });
    }
};

exports.destroy = function (req, res) {
    if (!_.isEqual(req.params.surveyquestion, 'all')) {
        _async.waterfall([
            function (next) {
                _SurveyResult.remove({idQuestion: req.params.surveyquestion},{multi: true}, next);
            },
            function (result, next) {
                _SurveyQuestion._deleteAll({$in: [req.params.surveyquestion]}, next);
            }
        ], function(err){
            res.json({code: (err ? 500 : 200), message: err ? err :""});
        });
    }else{
        _async.waterfall([
            function (next) {
                _SurveyResult.remove({idQuestion: {$in:req.body.ids.split(',')}},{multi: true}, next);
            },
            function (result, next) {
                _SurveyQuestion._deleteAll({$in:req.body.ids.split(',')}, next);
            }
        ], function(err){
            res.json({code: (err ? 500 : 200), message: err ? err :""});
        });
    }
};

exports.search = {
    json : function(req, res){

    },
    html : function(req, res){
        var page = _.has(req.query, 'page') ? parseInt(req.query.page) : 1;
        var rows = _.has(req.query, 'rows') ? parseInt(req.query.rows) : 10;

        var searchData = {};
        var _query = {};
        _query['idSurvey'] = req.query['idSurvey'];

        var addSearch = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = req.query[fieldName];
            searchData[fieldName] = req.query[fieldName];
        };

        var addSearchText = function(fieldName){
            if(req.query[fieldName]) _query[fieldName] = {$regex: new RegExp(_.stringRegex(req.query[fieldName]), 'i')};
            searchData[fieldName] = req.query[fieldName];
        };

        addSearchText('content');

        _async.parallel({
            mainData: function(next){
                _SurveyQuestion
                    .find(_query)
                    .populate('idNextQuestion','content')
                    .populate('createBy','name')
                    .populate('updateBy','name')
                    .sort(_.cleanSort(req.query))
                    .paginate(page, rows, function (err, items, total) {
                        next(err,{
                            items: items,
                            total: total
                        })
                    });
            },
            curSurvey: function(next){
                _Surveys.findById(req.query['idSurvey'], next);
            }
        }, function(err, result){
            searchData.dataLength = result.mainData.items.length;
            var paginator = new pagination.SearchPaginator({prelink: '/survey-question?idSurvey='+req.query.idSurvey, current: page, rowsPerPage: rows, totalResult: result.mainData.total});
            _.render(req, res, '/survey-question',
                {
                    title: 'Danh sách câu hỏi khảo sát',
                    sortData:_.cleanSort(req.query),
                    searchData: searchData,
                    survey: req.query.idSurvey,
                    surveyName: result.curSurvey.name,
                    categories: result.mainData.items,
                    paging: paginator.getPaginationData()
                }
                , true, err);
        });


    }
};