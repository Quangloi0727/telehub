/**
 * Created by luongvanlam on 2/16/16.
 */
var DFT = function ($) {
    var bindClick = function () {
        // Sắp xếp dữ liệu
        $(document).on('click', '.filter', function () {
            var $this = $(this);
            //if (_.isUndefined($this.attr('data-field'))) return false;
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

        // Click tìm kiếm
        $(document).on('click', '#btn-search', function () {
            queryFilter();
        });

        // Nhấn phím enter
        $(document).on('keyup', '#searchForm', function (e) {
        //$('#searchForm').bind('keydown', function(e) {
            if(e.keyCode == 13) queryFilter();
        });

        // tải lại trang
        $(document).on('click', '.zmdi-refresh', function () {
            window.location.hash = 'users';
        });
    }

    var bindSubmit = function () {
        // Xác nhận tạo mới user
        $('#add-user').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/users', 'POST', $(form).getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'users';
                        } else {
                            swal({title: 'Thông báo !', text: JSON.stringify(resp.message)});
                        }
                    });
                }
            }
        });
    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        $('#text_user_name').html(_config.MESSAGE.USER_MANAGER.TXT_USER_NAME );
        $('#text_display_name').html(_config.MESSAGE.USER_MANAGER.TXT_DISPLAY_NAME);
        $('#text_email').html(_config.MESSAGE.USER_MANAGER.TXT_EMAIL);
        $('#text_status').html(_config.MESSAGE.USER_MANAGER.TXT_STATUS);
        $('#text_actions').html(_config.MESSAGE.USER_MANAGER.TXT_ACTION);
        $('#text_accountcode').html(_config.MESSAGE.USER_MANAGER.TXT_ACCOUNT_CODE);
    };

    // Lấy dữ liệu lọc và truy vấn server
    var queryFilter = function () {
        var filter = _.chain($('.searchColumn'))
            .reduce(function(memo, el){
                if(!_.isEqual($(el).val(), '')) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();

        // Thực ra chỉ có 1 object ở chỗ này, do mình đã thực hiện siblings
        // với click event, chưa hiểu tại sao phải dùng đến map ở đây
        var sort = _.chain($('thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('sortName') ? $(el).attr('sortName') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        sort = _.isEmpty(sort) || _.isEqual(sort.length, 0) ? '' : '&sort=' + sort[0];
        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        window.location.hash = newUrl(window.location.hash, filter) + sort + paging;
    };

    return {
        init: function () {
            // Thông báo khi không tìm thấy kết quả
            if (isNullUser && Object.keys(window.location.obj).length > 0) {
                swal({
                    title: _config.MESSAGE.USER_MANAGER.SEARCH_NOT_FOUND_TITLE,
                    text: _config.MESSAGE.USER_MANAGER.SEARCH_NOT_FOUND_TEXT,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Quay lại!",
                    closeOnConfirm: true
                }, function () {
                    window.history.back();
                });
            }

            // Đổ dữ liệu vào searchInput
            _.each(window.location.obj, function (v, k) {
                var el = $('#search_' + k.replace(['[]'], ''));
                if (el[0]) {
                    switch (el.prop('tagName')) {
                        case 'INPUT':
                            el.val(v);
                            break;
                        case 'SELECT':
                            el.val(v);
                            if (el.is('.selectpicker')) el.selectpicker('refresh');
                            break;
                    }
                }
            });

            // Hiển thị dữ liệu sắp xếp
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[sortName="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            // Cập nhật dữ liệu phân trang
            if ($('.pagination')[0]) {
                delete window.location.obj.page;
                var _url = $.param(window.location.obj);
                $('.pagination a').each(function (i, v) {
                    $(v).attr('href', $(v).attr('href') + '&' + _url);
                });
            }

            bindClick();
            bindSubmit();
            bindTextValue();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.filter');
            $(document).off('click', '#btn-search');
            $(document).off('keyup', '#searchForm');
            $('#add-user').validationEngine('detach');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);