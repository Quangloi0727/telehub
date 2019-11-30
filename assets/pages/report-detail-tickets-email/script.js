/**
 * Created by Computer on 5/23/2016.
 */
var DFT = function ($) {
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '') && !_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();

        var sort = _.chain($('thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('sortName') ? $(el).attr('sortName') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        sort = _.isEmpty(sort) || _.isEqual(sort.length, 0) ? '' : '&sort=' + sort[0];
        window.location.hash = newUrl(window.location.hash, filter) + sort;
    };

    var bindClick = function () {
        // Click tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // tải file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_BaoCaoChiTietTickets.xls')
            $(this).attr('href', exportexcel);
        });
        // Thay đổi ô lọc theo ngày
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });

        // Sắp xếp dữ liệu
        $(document).on('click', '.sort', function () {
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
            getFilter();
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
            // Cập nhật lại dữ liệu lọc
            if (_.has(window.location.obj, 'periodTime')) {
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function (loop) {
                    if (loop.split("=")[0] == "periodTime") {
                        array.push(loop.split("=")[1]);
                    }
                })
                $('select[name="periodTime"]').selectpicker("val", array).selectpicker('refresh');
            };
            // Cập nhật lại dữ liệu lọc
            if (_.has(window.location.obj, 'idAgent[]')) {
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function (loop) {
                    if (loop.split("=")[0] == "idAgent[]") {
                        array.push(loop.split("=")[1]);
                    }
                })
                $('select[name="idAgent"]').selectpicker("val", array).selectpicker('refresh');
            };
            // Hiển thị dữ liệu phân trang
            if ($('.pagination')[0]) {
                delete window.location.obj.page;
                var _url = "";
                if(currentPage.current > 1){
                    _url = window.location.hash.split("?")[1].replace(('page=' + currentPage.current + '&'), '');
                }
                else {
                    _url = window.location.hash.split("?")[1];
                }
                $('.pagination a').each(function (index, value) {
                    $(value).attr('href', $(value).attr('href') + '&' + _url);
                });
            };
            // Cập nhật lại dữ liệu lọc
            _.each(window.location.obj, function (value, key) {
                var el = $('#query_' + key.replace(['[]'], '\\[\\]').replace('.', '\\.'));
                if (el[0]) {
                    switch (el.prop('tagName')) {
                        case 'INPUT':
                            el.val(value);
                            break;
                        case 'SELECT':
                            el.val(value);
                            if (el.is('.selectpicker')) el.selectpicker('refresh');
                            break;
                    }
                }
            });

            var start = _.has(window.location.obj, 'startDate') ? window.location.obj['startDate'] : "";
            var end = _.has(window.location.obj, 'endDate') ? window.location.obj['endDate'] : "";
            $('#startDate').val(start).datetimepicker({maxDate: end});
            $('#endDate').val(end).datetimepicker({minDate: start});
            bindClick();
        },
        uncut: function () {
            // disable sự kiện khi đóng trang
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
        }
    };
}(jQuery);
