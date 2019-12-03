var DFT = function ($) {
    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {
        $('#update-appointmentconfigs').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxObject(window.location.hash.replace('#','').replace('/edit', ''), 'PUT', form.getData(), function(err, resp) {
                        window.location.href = '/#appointmentconfigs';
                    });
                }
            }
        });
    };

    return {
        init: function () {
            bindSubmit();
        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $('#update-appointmentconfigs').validationEngine('detach');
        }
    };
}(jQuery);