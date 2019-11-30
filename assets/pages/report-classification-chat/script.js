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
        window.location.hash = newUrl(window.location.hash, filter);
    };

    var bindClick = function () {
        // Click tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_BaoCaoPhanLoaiChat.xls')
            $(this).attr('href', exportexcel);
        })
        // Thay đổi dữ liệu ở ô lọc theo ngày
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    }

    // Truy vấn dữ liệu ticket reason từ server
    var getDataTicketReason = function () {
        $('select[name="ticketReasonCategory"]').on('change', function () {
            $.get("/report-classification-chat", {idCategory: $(this).val()}, function (res) {
                $('select[name="ticketReason"]').empty();
                _.each(res.ticketReason, function (loop) {
                    $('select[name="ticketReason"]').append(_.Tags([{
                        tag: 'option',
                        attr: {value: loop._id},
                        content: loop.name
                    }]));
                })
                $('select[name="ticketReason"]').selectpicker('refresh');
            });
        })
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
            // Cập nhật lại dữ liệu lọc công ty
            if (_.has(window.location.obj, 'idCompany')) {
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function (loop) {
                    if (loop.split("=")[0] == "idCompany") {
                        array.push(loop.split("=")[1]);
                    }
                })
                $('select[name="idCompany"]').selectpicker("val", array).selectpicker('refresh');
            };
            // Cập nhật lại dữ liệu lọc nhóm tình trạng
            if (_.has(window.location.obj, 'ticketReasonCategory[]')) {
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function (loop) {
                    if (loop.split("=")[0] == "ticketReasonCategory[]") {
                        array.push(loop.split("=")[1]);
                    }
                })
                $('select[name="ticketReasonCategory"]').selectpicker("val", array).selectpicker('refresh');
            };
            // Cập nhật lại dữ liệu lọc tình trạng
            if (_.has(window.location.obj, 'ticketReason[]')) {
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function (loop) {
                    if (loop.split("=")[0] == "ticketReason[]") {
                        array.push(loop.split("=")[1]);
                    }
                });
                if($('select[name="ticketReasonCategory"]').val())
                {
                    $.get("/report-classification-chat", {idCategory: $('select[name="ticketReasonCategory"]').val()}, function (res) {
                        $('select[name="ticketReason"]').empty();
                        _.each(res.ticketReason, function (loop) {
                            $('select[name="ticketReason"]').append(_.Tags([{
                                tag: 'option',
                                attr: {value: loop._id},
                                content: loop.name
                            }]));
                        })
                        $('select[name="ticketReason"]').selectpicker("val", array).selectpicker('refresh');
                    });
                }
            };
            var start = _.has(window.location.obj, 'startDate') ? window.location.obj['startDate'] : "";
            var end = _.has(window.location.obj, 'endDate') ? window.location.obj['endDate'] : "";
            $('#startDate').val(start).datetimepicker({maxDate: end});
            $('#endDate').val(end).datetimepicker({minDate: start});
            bindClick();
            getDataTicketReason();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('on', 'select[name="ticketReasonCategory"]');
        }
    };
}(jQuery);
