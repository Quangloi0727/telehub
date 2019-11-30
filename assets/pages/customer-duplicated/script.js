var DFT = function ($) {

    var queryBuilder = function () {

    };

    var bindClick = function () {
        $(document).on('change', '.column-display', function () {
            var self = $(this);
            $('[data-field="' + self.val() + '"').toggleClass('hidden');
        });

        $(document).on('click', '.btn-delete', function () {
            var id = $(this).attr('data-id');
            swal({
                    title: 'Cảnh báo !', text: 'Bạn có chắc muốn xoá khách hàng này không ?',
                    type: 'warning', showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/customer/' + id, 'DELETE', {}, function (resp) {
                        swal({title: 'Thành công', text: resp.message, type: 'success'}, function () {
                            window.location.reload();
                        });
                    });
                }
            );
        });
    };

    var bindSubmit = function () {

    };

    return {
        init: function () {
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            $(document).off('change', '.column-display');
            $(document).off('click', '.btn-delete');
        }
    };
}(jQuery);