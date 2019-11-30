var DFT = function ($) {

    var bindClick = function () {
        $(document).on('change', '#status', function () {
            //active/ inactive kĩ năng
            $(this).val(Number($(this).is(':checked')));
        });
        $(document).on('click', '#btn-back', function () {
            //Back lại trang kĩ năng
            window.location.hash = 'skills';
        });
    };

    var bindSubmit = function () {
        //validate form sửa kĩ năng
        $('#edit-skill').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxObject(window.location.hash.replace('/edit', '').replace('#', ''), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'skills';
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
            //rule validate: không tồn tại 2 kĩ năng cùng tên trong 1 công ty
            $.validationEngineLanguage.allRules['SkillCheck'] = {
                "url": "/skills/validate",
                "extraData": "updateId=" + $('#updateId').val(),
                "extraDataDynamic": ['#skillName', '#idCompany'],
                "alertText": "* Đã tồn tại kỹ năng này",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            //rule validate: ngưỡng trên phải lớn hơn ngưỡng dưới
            $.validationEngineLanguage.allRules['DurHighCheck'] = {
                "func": function () {
                    return Number($('#alarmDurHigh').val()) > Number($('#alarmDurLow').val());
                },
                "alertText": "* Giá trị ngưỡng trên phải lớn hơn ngưỡng dưới"
            };
            bindClick();
            bindSubmit();
        },
        uncut: function () {
            $(document).off('change', '#status');
            $(document).off('click', '#btn-back');
            $('#edit-skill').validationEngine('detach');
        }
    };
}(jQuery);