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
        $('#add-new-survey-question').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/survey-question', 'POST', $(form).getData(), function (resp) {
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
                "extraDataDynamic": ['#contentQ', '#idSurvey'],
                "alertText": "* Đã tồn tại câu hỏi",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            bindClick();
            bindSubmit();
            $('.answer-group').hide();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#answerType');
            $('#add-new-survey-question').validationEngine('detach');
        }
    };
}(jQuery);