var DFT = function ($) {
    var options = {};
    var options2 = {};
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
        // Tải lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            window.location.hash = window.location.hash.split("?")[0];
        });
        // Click tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_BaoCaoGoiRaTheoThoiGian.xls')
            $(this).attr('href', exportexcel);
        });
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    };
    // Cập nhật lại danh sách agent khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get('/report-outbound-by-time', {idParent: $(this).val()}, function (res) {
                $('select[name="agentId"]').empty();
                _.each(res, function(o){
                    $('select[name="agentId"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName}]));
                })
                $('select[name="agentId"]').selectpicker('refresh');
            });
        })
    }
    var bindSubmit = function () {
        var totalTime = [];
        var totalTalkTime = [];
        var answeredCall = [];
        var unansweredCall = [];
        _.each(result, function (obj) {
            totalTime.push(obj.totalDuration / 1000);
            totalTalkTime.push(obj.callDuration / 1000);
            answeredCall.push(obj.connected);
            unansweredCall.push(obj.totalCall - obj.connected);
        });
        options = {
            title: {
                text: 'Biểu đồ thời gian gọi',
                x: -20 //center
            },
            xAxis: {
                categories: listMonth
            },
            yAxis: {
                title: {
                    text: "Thời lượng(giây)"
                }
            },
            tooltip: {
                valueSuffix: ' giây'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [
                {
                    name: 'Tổng thời lượng',
                    data: totalTime
                }, {
                    name: 'Thời lượng gọi',
                    data: totalTalkTime
                }
            ]
        };
        options2 = {
            title: {
                text: 'Biểu đồ trả lời cuộc gọi',
                x: -20 //center
            },
            xAxis: {
                categories: listMonth
            },
            yAxis: {
                title: {
                    text: "Cuộc gọi"
                }
            },
            tooltip: {
                valueSuffix: ' cuộc'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [
                {
                    name: 'Cuộc gọi được phục vụ',
                    data: answeredCall
                }, {
                    name: 'Cuộc gọi không trả lời',
                    data: unansweredCall
                }
            ]
        };
    };
    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.REPORT_OUTBOUND_BY_TIME), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT_OUTBOUND_BY_TIME[item]);
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
            // Hiển thị lại tiêu chí đã lọc
            if (_.has(window.location.obj, 'agentId[]')) {
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function (o) {
                    if (o.split("=")[0] == "agentId[]") {
                        array.push(o.split("=")[1]);
                    }
                })
                $('select[name="agentId"]').selectpicker("val", array).selectpicker('refresh');
            };
            // Hiển thị lại tiêu chí đã lọc
            _.each(window.location.obj, function (v, k) {
                var el = $('#' + k.replace(['[]'], '').replace('.', '\\.'));
                if (el[0]) {
                    switch (el.prop('tagName')) {
                        case 'INPUT':
                            el.val(v);
                            break;
                        case 'SELECT':
                            el.val(v);
                            if (el.is('.selectpicker')){
                                el.val(v).selectpicker('refresh');
                            }
                            break;
                    }
                }
            });
            bindClick();
            bindSubmit();
            bindTextValue();
            cascadeOption();
            $('#container').highcharts(options);
            $('#container2').highcharts(options2);
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('change', 'select[name="idCompany"]');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);