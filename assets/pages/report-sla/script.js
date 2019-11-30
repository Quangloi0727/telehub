/**
 * Created by Computer on 5/30/2016.
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
        $('.btn.bgm-blue.uppercase.c-white').on('click', function (event) {
            getFilter();
        })
        // Tải file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_BaoCaoSLA.xls')
            $(this).attr('href', exportexcel);
        });
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    }

    // Cập nhật lại danh sách service khi thay đổi công ty
    var getDataCompany = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get("/report-sla", {idCompany: $(this).val()}, function (res) {
                $('select[name="serviceId"]').empty();
                _.each(res.serviceId, function (loop) {
                    $('select[name="serviceId"]').append(_.Tags([{
                        tag: 'option',
                        attr: {value: loop._id},
                        content: loop.name
                    }]));
                })
                $('select[name="serviceId"]').selectpicker('refresh');
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
            // Hiển thị lại tiêu chí đã lọc
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
            // Hiển thị lại tiêu chí đã lọc
            if (_.has(window.location.obj, 'serviceId[]')) {
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function (loop) {
                    if (loop.split("=")[0] == "serviceId[]") {
                        array.push(loop.split("=")[1]);
                    }
                })
                $('select[name="serviceId"]').selectpicker("val", array).selectpicker('refresh');
            };
            bindClick();
            getDataCompany();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('on', 'select[name="idCompany"]');
        }
    };
}(jQuery);
