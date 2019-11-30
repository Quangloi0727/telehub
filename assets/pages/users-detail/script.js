/**
 * Created by Computer on 5/20/2016.
 */
var DFT = function ($) {

    var bindClick = function () {
        // Quay lại trang trước
        $(document).on('click', '#btn-back', function () {
            window.location.hash = '#articles-list';
        });
    };

    var bindSubmit = function () {
        // Xác nhận cập nhật dữ liệu user
        $('#user-detail').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxObject(window.location.hash.replace('/update', '').replace('#', ''), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash;
                            swal({title: 'Thông báo !', text: "Thành công"});
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
            bindClick();
            bindSubmit();
            // Cấu hình validation
            $.validationEngineLanguage.allRules['CheckTime'] = {
                "func": function () {
                    return Number($('#notifDeadline').val()) >= Number($('#notifDeadline').val());
                },
                "alertText": "* Giá trị phải lớn hơn hoặc bằng 0"
            };
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', '#btn-back');
            $('#user-detail').validationEngine('detach');
        }
    };
}(jQuery);