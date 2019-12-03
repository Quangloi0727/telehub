var DFT = function ($) {
    var bindClick = function () {

    };
    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindValue = function(){
        _.each(_.allKeys(_config.MESSAGE.PRODUCT), function(item){
            $('.' + item).html(_config.MESSAGE.PRODUCT[item]);
        });
    };
    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {
        $('#update-product').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxObject(window.location.hash.replace('#','').replace('/edit', ''), 'PUT', form.getData(), function(err, resp) {
                        window.location.href = '/#product';
                    });
                }
            }
        });
    };

    return {
        init: function () {
        
            bindValue();
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $('#update-product').validationEngine('detach');
        }
    };
}(jQuery);