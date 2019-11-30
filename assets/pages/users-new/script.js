/**
 * Created by luongvanlam on 4/8/16.
 */
var DFT = function ($) {

    // Hiển thị thông báo
    var showAlert = function(resp){
        if (resp.code == 500) {
            swal({
                title: "Đã có lỗi xảy ra",
                text: resp.message,
                type: "error",
                confirmButtonText: "Xác nhận",
                closeOnConfirm: true
            });
        } else {
            swal({
                title: "Thành công",
                text: "Đã gửi yêu cầu thêm mới user.\nHệ thống sẽ xử lý trong thời gian sớm nhất",
                type: "success",
                confirmButtonText: "Xác nhận",
                closeOnConfirm: true
            }, function () {
                _.LoadPage(window.location.hash);
            });
        }
    };

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

        // Nhấn phím Enter khi tìm kiếm
        $(document).on('keyup', '#searchForm', function (e) {
            if (e.keyCode == 13) queryFilter();
        });

        // Chọn tất cả phần tử
        $(document).on('change', '.select-box-all', function () {
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked") && $('.select-box-cell').length > 0) {
                $('#li-hidden').removeClass('hidden');
                if (_.isEqual(_.compact(x).length, $('.select-box-cell').length)) {
                    $('.select-box-all').prop('checked', true);
                } else {
                    $('.select-box-all').prop('checked', false);
                }
            }
            else {
                $('#li-hidden').addClass('hidden');
            }
        });

        // Chọn 1 phần tử
        $(document).on('change', '.select-box-cell', function () {
            var x = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0) {
                $('#li-hidden').removeClass('hidden');
                if (_.isEqual(_.compact(x).length, $('.select-box-cell').length)) {
                    $('.select-box-all').prop('checked', true);
                } else {
                    $('.select-box-all').prop('checked', false);
                }
            }
            else {
                $('#li-hidden').addClass('hidden');
                $('.select-box-all').prop('checked', false);
            }
        });

        // Xác nhận add user
        $(document).on('click', '#btn-addSelection', function () {
            var ids = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });

            _Ajax('/users', 'POST', [{uId: _.compact(ids)}], showAlert);
        });

        // Xác nhận add user
        $(document).on('click', '.add-user', function () {
            var dataId = $(this).attr('data-id');
            _Ajax('users', 'POST', [{uId: dataId}], showAlert);
        });
    };

    // Hiển thị tên trường theo file config
    var bindTextValue = function () {
        $('#text_user_name').html(_config.MESSAGE.USER_MANAGER.TXT_USER_NAME);
        $('#text_display_name').html(_config.MESSAGE.USER_MANAGER.TXT_DISPLAY_NAME);
        $('#text_email').html(_config.MESSAGE.USER_MANAGER.TXT_EMAIL);
        $('#text_status').html(_config.MESSAGE.USER_MANAGER.TXT_STATUS);
        $('#text_actions').html(_config.MESSAGE.USER_MANAGER.TXT_ACTION);
        $('#text_accountcode').html(_config.MESSAGE.USER_MANAGER.TXT_ACCOUNT_CODE);
    };

    // Lấy dữ liệu tìm kiếm và truy vấn server
    var queryFilter = function () {
        var filter = _.chain($('.searchColumn'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();

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
            bindTextValue();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.filter');
            $(document).off('click', '#btn-search');
            $(document).off('keyup', '#searchForm');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#btn-addSelection');
            $(document).off('click', '.add-user');
            $('#add-user').validationEngine('detach');
        }
    };
}(jQuery);