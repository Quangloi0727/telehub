var DFT = function ($) {

    var _options = {id: '', url: '/product', method: 'POST', data: {}};

    var convertUrlForQuery = function(url){
        return url.replace('#', '');
    }

    var bindClick = function () {
        // Nút Lọc/Search
        $(document).on('click', '#btn-search', function (e) {
            e.preventDefault();
            if ($('#title').val().length > 0 ){
                window.location.obj['title'] = $('#title').val();
            }
            else{
                delete window.location.obj['title'];
            }

            if ($('#raw').val().length > 0 ){
                window.location.obj['raw'] = $('#raw').val();
            }
            else{
                delete window.location.obj['raw'];
            }

            if (!_.isEqual($('#category').val(), '0')){
                window.location.obj['category'] = $('#category').val();
            }
            else{
                if (!_.isEqual($('#group').val(), '0')){
                    window.location.obj['category'] = $('#category').val();
                }
                else{
                    delete window.location.obj.category;
                }
            }

            if ($('#author').val().length > 0 ){
                window.location.obj['author'] = $('#author').val();
            }
            else{
                delete window.location.obj.author;
            }

            if ($('#updater').val().length > 0 ){
                window.location.obj['updater'] = $('#updater').val();
            }
            else{
                delete window.location.obj.updater;
            }

            if ($('#created').val().length > 0 ){
                window.location.obj['created'] = $('#created').val();
            }
            else{
                delete window.location.obj.created;
            }

            var tmpString = '?';
            searchObj = {};
            _.each(window.location.obj, function (obj, i) {
                tmpString = tmpString + i + '=' + obj + '&';
                searchObj[i] = obj;
            });
            queryFilter({filter: true});
        });

        // Thay đổi category
        $(document).on('change', '#group-select', function(e){
            var $this = $(this);
            $('#category').empty().selectpicker('refresh');
            $('.option-g').remove();
            $('#category').append(newOption({_id: 0, name: 'Tất cả'})).selectpicker('refresh');
            var url = (_.isEqual($this.find(":checked").val(), '0')) ? '/articles-category?status=1' : ('/articles-category?status=1&group=' + $this.find(":checked").val());
            $('.page-loader').show();
            $.get(url, function(res){
                $('.page-loader').hide();
                _.each(res, function(g, i){
                    $('#category').append(newOption(g)).selectpicker('refresh');
                });
            });
        });

        $(document).on('click', '#refresh', function(e){
            _.LoadPage('articles');
        });
    };

    // Xóa 1 phần tử
    $(document).on('click', '.btn-remove', function () {
        var _id = $(this).attr('data-id');
        swal({
                title: "Bạn muốn xoá mục này ?",
                text: "Tất cả các bài viết có trong mục này sẽ được cập nhật",
                type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
            },
            function () {
                _AjaxObject('/product/' + _id, 'DELETE', {}, function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        swal({title: 'Thất bại!', text: resp.message});
                    } else { 
                        swal({title: 'Thành công', text: 'Danh mục đã được xoá', type: "success"});
                        _.LoadPage(window.location.href="/#product");
                    }
                });
            });
    });


    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {

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
            bindClick();
            bindSubmit();
            bindValue();
            var url = '/product' + (_.has(window.location.obj, 'page') ? ('?page=' + window.location.obj['page']) : '');
            $('.page-loader').show();
            $.get(url, function(resp){
                $('.page-loader').hide();
                refreshArticles(resp);
            });

        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $(document).off('click', '#btn-search');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#form-articles .pagination li a');
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '.sort');
            $(document).off('change', '#group-select');
        }
    };
}(jQuery);