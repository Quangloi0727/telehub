var DFT = function ($) {

    var bindClick = function () {
        $(document).on('change', '#status', function () {
            //active/ inactive kĩ năng
            $(this).val(Number($(this).is(':checked')));
        });
        $(document).on('click', '#btn-back', function () {
            //Back lại trang kĩ năng
            window.location.hash = 'skills-chat';
        });
    };

    var bindSubmit = function () {
        //validate form kĩ năng
        $('#edit-skill').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true, validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    $('.formError').remove(); //xóa các msg error nếu có
                    async.waterfall([
                        function (cb) {
                            //Check xem có tồn tại tên kĩ năng này trước đó không
                            $.get('/skills-chat/validate?company=' + $('#company').val() + '&name=' + $('#skillName').val() + '&currName=' + $('#btn-submit').val(), function (resp) {
                                if (!resp.code) {
                                    $('#skillName').validationEngine('showPrompt', 'Đã tồn tại kỹ năng này', 'error', 'topRight', true);
                                }
                                cb(null, resp.code);
                            });
                        }
                    ], function (err, resp) {
                        if (resp) {
                            //Cập nhật dữ liệu mới lên server
                            _AjaxObject(window.location.hash.replace('/edit', '').replace('#', ''), 'PUT', $('#edit-skill').getData(), function (resp) {
                                if (_.isEqual(resp.code, 200)) {
                                    window.location.hash = 'skills-chat';
                                } else {
                                    swal({title: 'Thông báo !', text: resp.message});
                                }
                            });
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
        },
        uncut: function () {
            $(document).off('change', '#status');
            $(document).off('click', '#btn-back');
            $(document).off('submit', '#edit-skill');
        }
    };
}(jQuery);