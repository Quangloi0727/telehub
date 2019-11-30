var DFT = function ($) {

    // Lấy dữ liệu tìm kiếm và truy vấn server
    var queryFilter = function () {
        var _data = $('#service').serializeJSON();
        var listFilter = _.chain(_.keys(_data))
            .reduce(function (memo, item) {
                if(!_.isEqual(_data[item], ''))
                    memo[item.replace("filter_", "")] = _data[item];
                return memo;
            }, {})
            .value();

        var listSort = '';

        listSort = _.chain($('.listHead th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('data-field') ? $(el).attr('data-field') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();

        listSort = _.isEmpty(listSort) ? '' : '&sort=' + listSort[0];

        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        window.location.hash = newUrl(window.location.hash.replace('#', ''), listFilter) + listSort + paging;
    };

    var bindClick = function () {
        // Reload lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // Xóa phần tử hiện tại
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('data-id');
            swal({
                    title: _config.MESSAGE.SERVICES.DELETE_TITLE,
                    text: _config.MESSAGE.SERVICES.DELETE_TEXT,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/services/' + _id, 'DELETE', {}, function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.SERVICES.DELETE_TEXT_SUCCESS, type: "success"});
                        _.LoadPage(window.location.hash);
                    });
                });
        });

        // Xóa các phần tử đã chọn
        $(document).on('click', '#btn-delSelection', function(){
            var ids = $.map($('.selection'), function(n, i){
                return $(n).is(":checked") ? $(n).val(): '';
            });
            swal({
                    title: _config.MESSAGE.SERVICES.DELETE_TITLE_MANY,
                    text: _config.MESSAGE.SERVICES.DELETE_TEXT_MANY,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/services/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        if(resp.code == 200){
                            var notDeletes = resp.message;
                            if(notDeletes.length == 0){
                                swal({title: 'Thành công', text: _config.MESSAGE.SERVICES.DELETE_TEXT_SUCCESS, type: "success"});
                                _.LoadPage(window.location.hash);
                            }else{
                                var failProfile = " ";
                                _.each(notDeletes, function(el,i){
                                    $('.serviceName').each(function() {
                                        var $this = this;
                                        if(_.isEqual(el.toString(), $($this).attr('data-service-id'))){
                                            failProfile += $($this).html() + (notDeletes[i+1] ? ", " : "");
                                        }
                                    });
                                });
                                swal({title: 'Thất bại', text: 'Chiến dịch đang được sử dụng : ' + failProfile, type: "warning"});
                                _.LoadPage(window.location.hash);
                            }
                        }else {
                            swal({title: 'Thất bại', text: "Có lỗi xảy ra !", type: "warning"});
                            _.LoadPage(window.location.hash);
                        }
                    });
                });
        });
        // Chọn tất cả
        $(document).on('click', '#select_all', function(){
        //$('#select_all').click(function(event) {
            if(this.checked) {
                // Iterate each checkbox
                $('.selection').each(function() {
                    this.checked = true;
                });
                $('#li-hidden').removeClass('hidden');
            }
            else {
                $('.selection').each(function() {
                    this.checked = false;
                });
                $('#li-hidden').addClass('hidden');
            }
        });

        // Chọn phần tử
        $(document).on('click', '.selection', function(){
        //$('.selection').click(function(event){
            var x = $.map($('.selection'), function(n, i){
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0){
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        })

        // Click button Lọc/Tìm kiếm
        $(document).on('click', '.btn-filter', function () {
            queryFilter();
        });

        // Sắp xếp dữ liệu
        $(document).on('click', '.listHead th', function () {
            var $this = $(this);
            if (_.isUndefined($this.attr('data-field'))) return false;

            switch ($this.attr('data-sort')) {
                case 'none':
                    $this.toggleAttr('data-sort', 'asc');
                    break;
                case 'asc':
                    $this.toggleAttr('data-sort', 'desc');
                    break;
                case 'desc':
                    $this.toggleAttr('data-sort', 'none');
                    break;
            }
            $this.siblings().toggleAttr('data-sort', 'none');
            queryFilter();
        });

        // Nhấn phím enter khi tìm kiếm
        $('#service').on('keyup', function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                queryFilter();
            }
        });
    };

    var bindSubmit = function () {
        $('#service').submit(function(e){
            e.preventDefault();
        })
    };

    // Nhấn phím enter khi tìm kiếm
    var bindPressKey = function(){
        $('#search-bar').keypress(function (event) {
            var key = event.which;
            if (key == 13) {
                var searchValue = $('#search-bar').val();
                if (searchValue !== ''){
                    window.location.hash = '/services/search?keyword=' + searchValue;
                }
            }
        });
    }

    return {
        init: function () {
            // Hiển thị dữ liệu sắp xếp
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[data-field="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            // Thông báo nếu không tìm thấy kết quả tìm kiếm
            if ($('#service tbody tr').length == 1) {
                delete window.location.obj['sort'];
                if (!_.isEmpty(window.location.obj)) {
                    swal({title: _config.MESSAGE.GROUP_PROFILE.SEARCH_TITLE, type: "warning"}, function(){
                        window.history.back();
                    });
                }
            }

            // Hiển thị dữ liệu phân trang
            if ($('.pagination')[0]) {
                delete window.location.obj.page;
                var _url = $.param(window.location.obj);
                $('.pagination a').each(function (i, v) {
                    $(v).attr('href', $(v).attr('href') + '&' + _url);
                });
            }

            bindClick();
            bindSubmit();
            bindPressKey();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '#select_all');
            $(document).off('click', '.selection');
            $(document).off('click', '.btn-filter');
            $(document).off('click', '.listHead th');
            $(document).off('click', '.zmdi-refresh');
            $('#service').unbind('keyup');
        }
    };
}(jQuery);