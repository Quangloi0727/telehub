var DFT = function ($) {

    var bindClick = function () {
        // Cập nhật giao diện khi thay đổi loại câu trả lời
        $(document).on('change', '#answerType', function () {
            if(_.isEqual($('#answerType').val(),'1')){
                $('.answer-group').show();
            }else {
                $('.answer-group').hide();
            }
        });
    };


    var bindSubmit = function () {
        // Xác nhận cập nhật dữ liệu
        $('#form-edit').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxObject(window.location.hash.replace('/edit', '').replace('#',''), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'survey-question?idSurvey='+$('#idSurvey').val();
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
    };

    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['SurveyQuestionCheck'] = {
                "url": "/survey-question/validate",
                "extraData": "",
                "extraDataDynamic": ['#contentQ', '#idSurvey', '#updateId'],
                "alertText": "* Đã tồn tại câu hỏi",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            bindClick();
            bindSubmit();
            if(_.isEqual($('#answerType').val(),'1')){
                $('.answer-group').show();
            }else {
                $('.answer-group').hide();
            }

            _.each(answerList, function(answer, index){
                var position = answer.position;
                $('#answer_' + position).val(answer.content);
                $('#answer_' + position).parent().append('<input type="hidden" name="answer_'+ position +'_id" value="'+ answer._id +'">');
                $('#answer_' + position + '_nextQuestion').val(answer.idNextQuestion);
            });
            $('.selectpicker').selectpicker('refresh');
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#answerType');
            $('#form-edit').validationEngine('detach');
        }
    };
}(jQuery);