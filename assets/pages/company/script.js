/**
 * Created by luongvanlam on 1/13/16.
 */
var DFT = function ($) {

    // Xóa công ty
    var deleteOrg = function () {
        var ids = $.map($('.select-box-cell'), function (n, i) {
            return $(n).is(":checked") ? $(n).attr('data-id') : '';
        });
        swal({
                title: _config.MESSAGE.COMPANY.DELETE_TITLE,
                text: _config.MESSAGE.COMPANY.DELETE_TEXT,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Có, chắc chắn !",
                closeOnConfirm: false
            },
            function () {
                _Ajax('/company/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        swal({
                                title: _config.MESSAGE.COMPANY.MSG_SUCCESS_TITLE,
                                text: _config.MESSAGE.COMPANY.MSG_DELETE,
                                type: "success"
                            },
                            function () {
                                _.LoadPage(window.location.hash);
                            });
                    } else {
                        swal({title: _config.MESSAGE.COMPANY.MSG_FAIL_TITLE, text: resp.message});
                    }
                });
            });
    };

    // Sự kiện Click
    var bindClick = function () {
        // Chọn toàn bộ
        $(document).on('change', '.select-box-all', function(){
        //$('.select-box-all').change(function () {
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

        // Xóa nhiều phần tử được chọn
        $(document).on('click', '#btn-delSelection', deleteOrg);

        // Xóa phần tử
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('company-id');
            var companyName = $(this).attr('company-name');
            swal({
                title: "Bạn muốn xoá công ty " + companyName + " ?",
                text: "Thông tin về công ty này sẽ không còn hiệu lực trong tương lai",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Có, chắc chắn !",
                closeOnConfirm: false
            }, function () {
                _AjaxObject('/company/' + _id, 'DELETE', {}, function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        swal({
                                title: _config.MESSAGE.COMPANY.MSG_SUCCESS_TITLE,
                                text: _config.MESSAGE.COMPANY.MSG_DELETE,
                                type: "success"
                            },
                            function () {
                                _.LoadPage(window.location.hash);
                            });
                    } else {
                        swal({title: _config.MESSAGE.COMPANY.MSG_FAIL_TITLE, text: resp.message});
                    }
                });
            });
        });

        // Sắp xếp dữ liệu
        $(document).on('click', '.filter', function () {
            var $this = $(this);
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

        // Click nút Lọc/Tìm kiếm
        $(document).on('click', '#btn-search', function () {
            queryFilter();
        });

        // Sự kiện nhấn nút enter khi tìm kiếm
        $('#searchForm').bind('keyup', function (e) {
            if (e.keyCode == 13) queryFilter();
        });

        // Làm mới trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
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

    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindTextValue = function () {
        $('#txt_company_name').html(_config.MESSAGE.COMPANY.TEXT_COMPANY_NAME);
        $('#txt_company_profile').html(_config.MESSAGE.COMPANY.TEXT_COMPANY_PROFILE);
        $('#txt_company_leader').html(_config.MESSAGE.COMPANY.TEXT_COMPANY_LEADER);
        $('#txt_company_agent').html(_config.MESSAGE.COMPANY.TEXT_COMPANY_AGENT_GROUP);
        $('#txt_company_status').html(_config.MESSAGE.COMPANY.TEXT_STATUS);
        $('#txt_company_actions').html(_config.MESSAGE.COMPANY.TEXT_ACTIONS);
    };

    return {
        init: function () {
            // Hiển thị thông báo khi không tìm thấy kết quả
            if (isNullCompany && Object.keys(window.location.obj).length > 0) {
                swal({
                    title: _config.MESSAGE.COMPANY.SEARCH_NOT_FOUND_TITLE,
                    text: _config.MESSAGE.COMPANY.SEARCH_NOT_FOUND_TEXT,
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

            // Cấu hình Sort
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[sortName="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            // Cấu hình phân trang
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
        uncut : function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#btn-delSelection', deleteOrg);
            $(document).off('click', '.btn-remove');
            $(document).off('click', '.filter');
            $(document).off('click', '#btn-search');
            $('#searchForm').unbind('keyup');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);