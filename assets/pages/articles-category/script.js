var DFT = function ($) {
    var _searchPath = {};

    // Lưu giá trị search cũ
    var saveSearchData = function(obj){
        if (_.has(obj, 'name')){
            _searchPath.name = obj.name;
        }
        if (!_.isEqual(obj.status, '-1')){
            _searchPath.status = obj.status;
        }

    }

    /**
     * Bắt sự kiện click
     */
    var bindClick = function () {
        // Xóa 1 phần tử
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('data-id');
            swal({
                    title: "Bạn muốn xoá mục này ?",
                    text: "Tất cả các bài viết có trong mục này sẽ được cập nhật",
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/articles-category/' + _id, 'DELETE', {}, function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({title: 'Thành công', text: 'Danh mục đã được xoá', type: "success"});
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thất bại!', text: resp.message});
                        }
                    });
                });
        });

        // Xóa nhiều phần tử đã chọn
        $(document).on('click', '#btn-delSelection', function(){
            var ids = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            swal({
                    title: "Bạn muốn xoá các mục này ?",
                    text: "Tất cả các bài viết có trong các mục này sẽ được cập nhật",
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/articles-category/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({title: 'Thành công', text: 'Danh mục đã được xoá', type: "success"});
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thất bại!', text: resp.message});
                        }
                    });
                });
        });

        // Chọn tất cả
        $(document).on('change', '.select-box-all', function () {
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked"))
            {
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        });

        // Chọn 1 phần tử
        $(document).on('change', '.select-box-cell', function () {
            var x = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0){
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        });

        // Click nút Lọc/Search
        $(document).on('click', '#btn-search', function(){
            queryFilter();
        });

        // Nhấn enter khi search
        $(document).on('keyup', '#searchForm', function(e){
            //$('#searchForm').bind('keydown', function(e) {
            if(e.keyCode == 13) queryFilter();
        });

        // Load lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
    };

    // Lấy dữ liệu search và gửi lên server
    var queryFilter = function(){
        _searchPath = {};
        if ($('#name').val().length > 0 ){
            window.location.obj['name'] = $('#name').val();
        }
        else{
            delete  window.location.obj.name;
        }

        if (!_.isEqual($('#status').val(), '-1')){
            window.location.obj['status'] = $('#status').val();
        }
        else{
            delete  window.location.obj.status;
        }

        saveSearchData(window.location.obj);
        window.location.hash = newUrl('articles-category', window.location.obj);
    }

    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {

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

            bindValue();
            bindClick();
            bindSubmit();

            if (_.has(window.location.obj, 'name')) _searchPath['name'] = window.location.obj['name'];
            if (_.has(window.location.obj, 'status')) _searchPath['status'] = window.location.obj['status'];

            // Xử lý sau khi search
            if ($('#table-categorys tbody tr').length == 1) {
                delete window.location.obj['sort'];
                if (!_.isEmpty(window.location.obj)) {
                    swal({
                            title: "Thông báo",
                            text: "Không tìm thấy bản ghi phù hợp",
                            type: "warning", showCancelButton: false, confirmButtonColor: "#DD6B55", confirmButtonText: "Quay lại!"
                        },
                        function () {
                            window.history.back();
                        });
                }
            }

            if (_.has(_searchPath, 'name')){
                if (!_.isEqual(_searchPath['name'], 'asc') && !_.isEqual(_searchPath['name'], 'desc')){
                    $('#name').val(_searchPath['name']);
                }
                else{
                    _keyword = _searchPath['name'];
                }
            }

            if (_.has(_searchPath, 'status') && !_.isEqual(_searchPath['status'], 'asc') && !_.isEqual(_searchPath['status'], 'desc')){
                $('#status').val(_searchPath['status']);
            }

            $('.selectpicker').selectpicker('refresh');
        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-delSelection');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#btn-search');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);