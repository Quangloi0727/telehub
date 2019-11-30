var DFT = function ($) {

    var refreshArticles = function(resp){
        $('#form-articles #tbl-articles tbody .articles').empty();
        $('#form-articles .pagination').remove();
        _.each(resp.data, function (tk, i){
            $('#tbl-articles tbody').append(newArticle(tk));
        });
        $('#form-articles').append(_.paging('articles', resp.paging));
    };

    // Tạo thẻ option cho selectpicker
    var newOption = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
        ]);
    };

    // Sự kiện click
    var bindClick = function () {

        // Thay đổi nhóm
        $(document).on('change', '#group', function(e){
            $.get('/articles-category?status=1&group=' + $(this).val(), function(res){
                $('#category').empty();
                _.each(res, function(g, i){
                    $('#category').append(newOption(g));
                });
                $("#category").trigger("chosen:updated");
            });
        });

    };

    // Sự kiện submit
    var bindSubmit = function () {
        $('#add-new-article').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                for ( instance in CKEDITOR.instances )
                    CKEDITOR.instances[instance].updateElement();
                if (status) {
                    _AjaxData('/articles', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'articles';
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
            CKEDITOR.document.getById('body');
            CKEDITOR.replace('body');
            $.get('/articles-category?status=1&group=' + 'quy trình', function(res){
                _.each(res, function(g, i){
                    $('#category').append(newOption(g));
                });
                $("#category").trigger("chosen:updated");
            });
            bindValue();
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $(document).off('change', '#group');
            $('#add-new-article').validationEngine('detach');
        }
    };
}(jQuery);