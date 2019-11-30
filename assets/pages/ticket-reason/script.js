var DFT = function ($) {
    var _options = {id: '', url: '/ticket-reason', method: 'POST', data: {}};
    var bindClick = function () {
        // Tải lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // Thay đổi trạng thái
        $(document).on('change', '#queryStatus', function(){
            $(this).val(Number($(this).is(':checked')))
        });

        // Nhấn phím Enter để tìm kiếm
        $(document).on('keyup', '#searchForm', function(e){
        //$('#searchForm').bind('keydown', function(e) {
            if(e.keyCode == 13) queryFilter();
        });

        // Thay đổi trạng thái
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });

        // Click tìm kiếm
        $(document).on('click', '#btn-search', function () {
            queryFilter();
        });

        // Chọn tất cả phần tử
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

        // Xóa nhiều phần tử đã chọn
        $(document).on('click', '#btn-delSelection', function(){
            var ids = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            swal({
                    title: _config.MESSAGE.TICKETREASON.CONFIRM_DELETE_MANY_TICKET_REASON,
                    text: _config.MESSAGE.TICKETREASON.TEXT_CONFIRM_DELETE_MANY_TICKET_REASON,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/ticket-reason/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({title: 'Thành công', text: _config.MESSAGE.TICKETREASON.TEXT_SUCCESS_DELETE_TICKET_REASON, type: "success"}, function(){
                                _.LoadPage(window.location.hash);
                            });
                        } else {
                            swal({title: 'Thất bại!', text: resp.message});
                        }
                    });
                });
        });

        // Xóa ticket reason
        $(document).on('click', '.ticket-category a', function () {
            _options.id = $(this).closest('.task').attr('data-id');
            _options.url = $(this).closest('.task').attr('data-url');
            if ($(this).is('.delete')) {
                swal({
                        title: _config.MESSAGE.TICKETREASON.CONFIRM_DELETE_TICKET_REASON,
                        text: _config.MESSAGE.TICKETREASON.TEXT_CONFIRM_DELETE_TICKET_REASON,
                        type: 'warning', showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                    },
                    function () {
                        _Ajax('/ticket-reason/all', 'DELETE', [{ids: [_options.id]}], function (resp) {
                            if (_.isEqual(resp.code, 200)) {
                                swal({title: 'Thành công', text: _config.MESSAGE.TICKETREASON.TEXT_SUCCESS_DELETE_TICKET_REASON, type: "success"}, function(){
                                    _.LoadPage(window.location.hash);
                                });
                            } else {
                                swal({title: 'Thất bại!', text: resp.message});
                            }
                        });
                        //_AjaxObject(_options.url + '/' + _options.id, 'DELETE', {}, function (resp) {
                        //    if (_.isEqual(resp.code, 200)) {
                        //        swal({title: 'Thành công', text: _config.MESSAGE.TICKETREASON.TEXT_SUCCESS_DELETE_TICKET_REASON, type: 'success', html: true}, function () {
                        //            _.LoadPage(window.location.hash);
                        //        });
                        //    } else {
                        //        swal({title: 'Thất bại!', text: resp.message});
                        //    }
                        //});
                    }
                );
            }
        });
    };
    // Lấy dữ liệu lọc và truy vấn server
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

    var bindSubmit = function () {

    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function(){
        _.each(_.allKeys(_config.MESSAGE.TICKETREASON_TXT), function(item){
            $('.' + item).html(_config.MESSAGE.TICKETREASON_TXT[item]);
        });
    }

    return {
        init: function () {
            // Thông báo khi không tìm thấy kết quả
            if (isAlertSearch && Object.keys(window.location.obj).length > 0) {
                swal({
                    title: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TITLE,
                    text: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TEXT,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Quay lại!",
                    closeOnConfirm: true
                }, function () {
                    window.history.back();
                });
            }
            // hiển thị lại tiêu chí đã lọc
            _.each(window.location.obj, function (v, k) {
                var el = $('#query_' + k.replace(['[]'], '').replace('.', '\\.'));
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
            $(document).off('click', '.ticket-category a');
            $(document).off('change', '#queryStatus');
            $(document).off('keyup', '#searchForm');
            $(document).off('change', '#status');
            $(document).off('click', '#btn-search');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);