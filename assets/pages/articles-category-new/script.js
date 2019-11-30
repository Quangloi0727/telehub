var DFT = function ($) {

    // Bắt sự kiện click
    var bindClick = function () {
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });
    };

    // Bắt sự kiện submit
    var bindSubmit = function () {
        $('#add-new-category').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/articles-category', 'POST', $(form).getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'articles-category';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
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
        _.each(_.allKeys(_config.MESSAGE.ARTICLE), function(item){
            $('.' + item).html(_config.MESSAGE.ARTICLE[item]);
        });
    };
    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['CategoryCheck'] = {
                "url": "/articles-category/validate",
                "extraDataDynamic": ['#name'],
                "alertText": "* Danh mục này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();
            bindValue();
        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $(document).off('change', '#status');
            $('#add-new-category').validationEngine('detach');
        }
    };
}(jQuery);