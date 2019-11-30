var DFT = function ($) {
    var bindClick = function () {

    };
    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindValue = function(){
        _.each(_.allKeys(_config.MESSAGE.ARTICLE), function(item){
            $('.' + item).html(_config.MESSAGE.ARTICLE[item]);
        });
    };

    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {
        $('#frm-edit').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxObject(window.location.hash.replace('#','').replace('/edit', ''), 'PUT', form.getData(), function(err, resp) {
                        window.location.hash = 'articles-category';
                    });
                }
            }
        });
    };

    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['name'] = {
                "url": "/articles-category/validate",
                //"extraData": "currCategory=" + $('#frm-name').val() + "&" + "group=" + $('#frm-edit').attr('data-group'),
                "extraDataDynamic": ['#name', "#x-name"],
                "alertText": "* Đã tồn tại kỹ năng này",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindValue();
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $('#frm-edit').validationEngine('detach');
        }
    };
}(jQuery);