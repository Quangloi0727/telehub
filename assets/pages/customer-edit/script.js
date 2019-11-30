var DFT = function ($) {
    var bindClick = function () {
    };

    // Sự kiện submit
    var bindSubmit = function () {
        // Xác nhận cập nhật dữ liệu khách hàng
        $('#edit-customer').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData(window.location.hash.replace('/edit', '').replace('#', ''), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = '#customer';
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
            $('#sources').val($('#hsources').val().split(',')).trigger("chosen:updated");
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // Xử lý disable sự kiện khi đóng trang
            $('#edit-customer').validationEngine('detach');
        }
    };
}(jQuery);