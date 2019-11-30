var DFT = function ($) {
    var options = {};
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
            $(this).attr('download', todaysDate + '_BaoCaoTinhTrang.xls')
            $(this).attr('href', exportexcel);
        });
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    };
    var bindSubmit = function () {
        $(function () {
            var colors = Highcharts.getOptions().colors;
            var items = [];
            var items2 = [];
            var i = 0;
            _.each(results,function(obj){
                var j = 0;
                var a = {};
                a.name = obj._id.name ? obj._id.name : "Trống";
                a.y = parseFloat((obj.count*100/total).toFixed(2));
                a.color = colors[i];
                items.push(a);
                if(obj.subreason.length){
                    _.each(obj.subreason, function(obj2){
                        var b = {}
                        b.name = obj2.name ? obj2.name : "Trống";
                        b.y = parseFloat((obj2.count*100/total).toFixed(2));
                        b.color = Highcharts.Color(colors[i]).brighten(0.2 - (j/obj.subreason.length)/5).get();
                        items2.push(b);
                        j++;
                    })
                }
                i++;
            });
            options = {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: $('select[name=idCampain] option:selected').text()
                },
                yAxis: {
                    title: {
                        text: 'Báo cáo tình trạng'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%']
                    }
                },
                tooltip: {
                    valueSuffix: '%'
                },
                series: [{
                    name: 'Tình trạng',
                    data: items,
                    size: '60%',
                    dataLabels: {
                        formatter: function () {
                            return this.y > 5 ? this.point.name : null;
                        },
                        color: '#ffffff',
                        distance: -30
                    }
                }]
            };
            if(type){
                options.series.push({
                    name: 'Lí do',
                    data: items2,
                    size: '80%',
                    innerSize: '60%',
                    dataLabels: {
                        formatter: function () {
                            // display only if larger than 1
                            return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null;
                        }
                    }
                })
            }
        });
    };
    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.REPORT), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT[item]);
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
            // Hiển thị lại tiêu chí đã lọc
            if (_.has(window.location.obj, 'idAgent[]')){
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function(o){
                    if(o.split("=")[0]=="idAgent[]"){
                        array.push(o.split("=")[1]);
                    }
                })
                $('select[name="idAgent"]').selectpicker("val", array).selectpicker('refresh');
            };
            bindClick();
            bindSubmit();
            bindTextValue();
            $('#container').highcharts(options);
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);