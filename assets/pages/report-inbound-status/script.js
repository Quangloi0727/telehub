var DFT = function ($) {
    var options = {},
        options2 = {};
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
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
            $(this).attr('download', todaysDate + '_BaoCaoYeuCauGoiRa.xls')
            $(this).attr('href', exportexcel);
        });
        // Reload lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            window.location.hash = window.location.hash.split("?")[0];
        });
        // Cập nhật lại giao diện khi thay đổi ngày lọc
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    };
    var bindSubmit = function () {
        $(function () {
            var items = [];
            var items2 = []
            _.each(_.keys(data), function (obj) {
                var object = {name:obj,data:[]};
                _.each(listMonth, function(o){
                    object.data.push(data[obj][o]?data[obj][o]:0)
                })
                items.push(object);
                items2.push({name: obj, y: parseFloat((data[obj].total*100/ total.count).toFixed(2))})
            });
            options = {
                title: {
                    text: "Báo cáo yêu cầu"
                },
                xAxis: {
                    categories: listMonth
                },
                yAxis: {
                    title: {
                        text: 'Số lượng'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: items
            };
            options2 = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Báo cáo yêu cầu'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [{
                    name: 'Brands',
                    colorByPoint: true,
                    data: items2
                }]
            };
        });
    };
    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.REPORT), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT[item]);
        });
    }
    // Cập nhật lại danh sách agent khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get('/report-inbound-status', {idParent: $(this).val()}, function (res) {
                $('select[name="idAgent"]').empty();
                _.each(res, function(o){
                    $('select[name="idAgent"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName}]));
                })
                $('select[name="idAgent"]').selectpicker('refresh');
            });
        })
    }
    return {
        init: function () {
            // Thông báo khi không tìm thấy kết quả tìm kiếm
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
            _.each(window.location.obj, function (v, k) {
                var el = $('#' + k.replace(['[]'], ''));
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
            // Cập nhật lại dữ liệu đã lọc
            if (_.has(window.location.obj, 'idAgent[]')) {
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function(o){
                    if(o.split("=")[0]=="idAgent[]"){
                        array.push(o.split("=")[1]);
                    }
                })
                $('select[name="idAgent"]').selectpicker("val", array).selectpicker('refresh');
            };
            // Cập nhật lại dữ liệu đã lọc
            if (_.has(window.location.obj, 'ticketReasonCategory[]')){
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function(o){
                    if(o.split("=")[0]=="ticketReasonCategory[]"){
                        array.push(o.split("=")[1]);
                    }
                })
                $('select[name="ticketReasonCategory"]').selectpicker("val", array).selectpicker('refresh');
            };
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
            $(document).off('on', 'select[name="idCompany"]');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);