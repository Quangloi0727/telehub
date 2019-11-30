var DFT = function ($) {

    // Tạo thẻ option cho thẻ selectpicker
    var newOption = function(obj,selected){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-g', value: obj._id}, sattr:[selected.indexOf(obj._id) >= 0 ? 'selected' :''] , content: obj.name}
        ]);
    };

    // Gắn sự kiện click
    var bindClick = function () {
        // Thay đổi giá trị nhóm
        $(document).on('change', '#group', function(e){
            $.get('/articles-category?status=1&group=' + $(this).val(), function(res){
                $('#category').empty();
                _.each(res, function(g, i){
                    $('#category').append(newOption(g,[]));
                });
                $("#category").trigger("chosen:updated");
            });
        });
        $(document).on('DOMSubtreeModified', '.fileinput-filename', function(e){
            if($(this).text()!=""){
                $(this).next('#hidden').val($(this).attr('data-id'));
            }else{
                $(this).next('#hidden').val(null);
            }
        });
        // Xóa dữ liệu
        $(document).on('click', '.delete', function () {
            var index = $(this).attr('data-index');
            swal({
                    title: _config.MESSAGE.ARTICLE.TXT_DELETE_ATTACHMENT,
                    text: _config.MESSAGE.ARTICLE.TXT_CONFIRM_DELETE_ATTACHMENT,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax(window.location.hash.replace('/edit', '').replace('#',''), 'PUT', [{delete:index}] , function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({title: 'Thành công', text: _config.MESSAGE.ARTICLE.TXT_SUCCESS_DELETE_ATTACHMENT, type: "success"});
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                });
        });
    };

    // Sự kiện submit
    var bindSubmit = function () {
        $('#update-article').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                //console.log(form);
                //return;
                for ( instance in CKEDITOR.instances )
                    CKEDITOR.instances[instance].updateElement();
                if (status) {
                    _AjaxData(window.location.hash.replace('/edit', '').replace('#',''), 'PUT', form.getData() , function (resp) {
                        //[{article: JSON.stringify({title: $('#title').val(), category: $('#category').val(), body: CKEDITOR.instances['body'].getData(), status: $('#status').val()})}]
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
            var _selected = [];
            if (!_.isNull(categoryId)){
                for(var i = 0; i < categoryId.length; i++){
                    _selected.push(categoryId[i]._id);
                }
            }

            CKEDITOR.document.getById('body');
            CKEDITOR.replace('body');
            $.get('/articles-category?status=1&group=' + $('#group').val(), function(res){
                _.each(res, function(g){
                    $('#category').append(newOption(g,_selected));
                });
                $("#category").trigger("chosen:updated");
            });


            bindValue();
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $(document).off('DOMSubtreeModified', '.fileinput-filename');
            $(document).off('change', '#group');
            $(document).off('click', '.delete');
            $('#update-article').validationEngine('detach');
        }
    };
}(jQuery);