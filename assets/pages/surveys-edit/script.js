var DFT = function ($) {

    var bindClick = function () {
    };

    var bindSubmit = function () {
        // Xác nhận cập nhật dữ liệu
        $('#form-edit').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxObject(window.location.hash.replace('#','').replace('/edit', ''), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'surveys';
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
            $('#script').summernote();
            // Cấu hình validation
            $.validationEngineLanguage.allRules['SurveyCheck'] = {
                "url": "/surveys/validate",
                "extraData": "",
                "extraDataDynamic": ['#name', '#updateId'],
                "alertText": "* Đã tồn tại nhóm này",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $('#form-edit').validationEngine('detach');
        }
    };
}(jQuery);