var DFT = function ($) {

    // Sự kiện submit
    var bindSubmit = function () {
        $('#add-new-product').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                for ( instance in CKEDITOR.instances )
                    CKEDITOR.instances[instance].updateElement();
                if (status) {
                    _AjaxData('/product', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'product';
                        } else {
                            window.location.href='/#product';
                        }
                    });
                }
            }
        });
    };
    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindValue = function(){
        _.each(_.allKeys(_config.MESSAGE.PRODUCT), function(item){
            $('.' + item).html(_config.MESSAGE.PRODUCT[item]);
        });
    };
    return {
        init: function () {
            CKEDITOR.document.getById('description');
            CKEDITOR.replace('description');
            $.get('/articles-category?status=1&group=' + 'quy trình', function(res){
                _.each(res, function(g, i){
                    $('#category').append(newOption(g));
                });
                $("#category").trigger("chosen:updated");
            });
            bindValue();
            bindSubmit();
        },

    };
}(jQuery);