
var DFT = function ($) {
    var options = {};
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();

        _Ajax("/report-outbound-agent?"+ $.param(filter),'GET',{}, function(resp){
            if(resp.code==200){
                if(resp.data.length){
                    datas= resp.data;
                    initTable(datas);
                }else{
                    swal({
                        title: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TITLE,
                        text: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TEXT,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Xác nhận!",
                        closeOnConfirm: true
                    });
                }
            }
        })
    };
    var bindClick = function () {
        // Tải lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
        // Click tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_Báo cáo gọi ra - Năng suất ĐTV - Theo thời gian.xls')
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

    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.REPORT), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT[item]);
        });
    }

    var newOption = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'text-center ', value: obj._id}, content: obj.name}
        ]);
    };
    // Cập nhật lại danh sách agent khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get('/report-inbound-agent', {cascade: $(this).val()}, function (res) {
                $('select[name="agents"]').empty();
                _.each(res, function(o){
                    $('select[name="agents"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName}]));
                });
                $('select[name="agents"]').selectpicker('refresh');
            });
        });
    };
    // Hiển thị dữ liệu lên giao diện
    var initTable= function(datas){
        $("#tbBody").empty();
        _.each(datas, function(data, i){
            var tags= _.Tags([
                {tag:'tr', attr: {id: data._id}, childs: [
                    {tag:'td', attr:{class: 'text-left'}, content: data.name},
                    {tag:'td', attr:{class: 'text-center 0'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 1'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 2'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 3'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 4'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 5'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 6'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 7'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 8'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 9'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 10'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 11'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 12'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 13'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 14'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 15'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 16'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 17'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 18'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 19'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 20'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 21'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 22'}, content: ''},
                    {tag:'td', attr:{class: 'text-center 23'}, content: ''}
                ]}
            ]);

            $("#tbBody").append(tags);

            for(var j=0;j<24;j++){
                $("tr#"+data._id+" td."+j).html(data.timeBlock[j]?data.timeBlock[j]:"");
            }
        })
    }
    return {
        init: function () {
            //if (_.has(window.location.obj, 'idCampain')) $('select[name="idCampain"]').val(window.location.obj.idCampain).selectpicker('refresh');
            //if (_.has(window.location.obj, 'idCompany')) $('select[name="idCompany"]').val(window.location.obj.idCampain).selectpicker('refresh');
            //if (_.has(window.location.obj, 'type')) $('select[name="type"]').val(window.location.obj.type).selectpicker('refresh');
            //var s = _.has(window.location.obj, 'startDate') ? moment(window.location.obj['startDate'], "DD/MM/YYYY").format("DD/MM/YYYY") : "";
            //var e = _.has(window.location.obj, 'endDate') ? moment(window.location.obj['endDate'], "DD/MM/YYYY").format("DD/MM/YYYY") : "";
            //$('#startDate').val(s).datetimepicker({maxDate: e});
            //$('#endDate').val(e).datetimepicker({minDate: s});
            bindClick();
            cascadeOption();
            //bindSubmit();
            //bindTextValue();
            //$('#container').highcharts(options);

            //initTable();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);