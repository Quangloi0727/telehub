var DFT = function ($) {
    var bindClick = function () {
        // Thay đổi trạng thái
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });
        // Quay lại
        $(document).on('click', '#btn-back', function () {
            window.location.hash = 'ticket-reason-category';
        });
    };
    var bindSubmit = function () {
        // Xác nhận tạo mới reason
        $('#add-new-ticket').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true, validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxObject('/ticket-reason', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'ticket-reason';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
    };
    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.TICKETREASON_TXT), function (item) {
            $('.' + item).html(_config.MESSAGE.TICKETREASON_TXT[item]);
        });
    }
    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['ReasonCheck'] = {
                "url": "/ticket-reason/validate",
                "extraDataDynamic": ['#validate-reason-for-name', '#idCategory'],
                "alertText": "* Tên tình trạng này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['PriorityCheck'] = {
                "url": "/ticket-reason/validate",
                "extraDataDynamic": ['#priority', '#idCategory'],
                "alertText": "* Độ ưu tiên này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();
            bindTextValue();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#status');
            $(document).off('click', '#btn-back');
            $('#add-new-ticket').validationEngine('detach');
        }
    };
}(jQuery);