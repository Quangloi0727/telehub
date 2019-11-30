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
        // Xác nhận tạo category
        $('#add-new-ticket').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true, validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                });
                if (status) {
                    _AjaxObject('/ticket-reason-category', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'ticket-reason-category';
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
            $.validationEngineLanguage.allRules['TicketCheck'] = {
                "url": "/ticket-reason-category/validate",
                "extraDataDynamic": ['#validate-ticket-for-name'],
                "alertText": "* Tên nhóm này đã được sử dụng",
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