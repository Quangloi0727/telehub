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
        //window.location.hash = newUrl(window.location.hash, filter);
        _Ajax("/report-chat-by-week?"+ $.param(filter),'GET',{}, function(resp){
            if(resp.code==200){
                if (resp.data.length) {
                    initTable(resp.data)
                }else
                {
                    swal({
                        title: 'Không tìm thấy kết quả với khoá tìm kiếm',
                        text: resp.message,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Xác nhận!",
                        closeOnConfirm: true
                    })
                }
            }
        })
    };
    // Cập nhật dữ liệu lên màn hình
    var initTable= function(datas){
        $("#tbBody").empty();
        _.each(datas, function(data, i){
            var tags= _.Tags([
                {tag:'tr', attr: {id: data._id}, childs: [
                    {tag:'td', attr:{class: 'text-center'}, content: data._id.week+1 + "/" + data._id.year},//thang
                    {tag: 'td', attr: {class: 'text-center'}, content: (data.receive).toString()},//chat nhan
                    {tag: 'td', attr: {class: 'text-center'}, content: (data.answer).toString()},//chat tra loi
                    {tag: 'td', attr: {class: 'text-center'}, content: (data.receive - data.answer).toString()},//chat nho
                    {tag: 'td', attr: {class: 'text-center'}, content: Math.round((data.answer / data.receive) * 100) + "%"},//ti le phuc vu
                    {tag: 'td', attr: {class: 'text-center'}, content: (data.waiting).toString()},
                    {tag: 'td', attr: {class: 'text-center'}, content: (data.progressing).toString()},
                    {tag: 'td', attr: {class: 'text-center'}, content: (data.finish).toString()}

                ]}
            ]);

            $("#tbBody").append(tags);


        })
    }
    var bindClick = function () {
        // Click Tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_BaoCaoChatTheoNgay.xls')
            $(this).attr('href', exportexcel);
        })
        // Thay đổi dữ liệu ô lọc theo ngày
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    };
    // Cập nhật dữ liệu channel khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get('/company-channel', {idCompany: $(this).val()}, function (res) {
                $('select[name="channelId"]').empty();
                _.each(res.channel, function(o){
                    $('select[name="channelId"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.name}]));
                })
                $('select[name="channelId"]').selectpicker('refresh');
            });
        })
    }
    var bindSubmit = function () {
        var cat = [];
        var totalTime = [];
        var totalTalkTime = [];
        var answeredCall = [];
        var unansweredCall = [];
        _.each(_.pluck(result, 'date'), function (obj) {
            cat.push(moment(obj).format("MM"));
        });
        _.each(_.pluck(result, 'data'), function (obj) {
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
                categories: cat
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
                categories: cat
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
        _.each(_.allKeys(_config.MESSAGE.REPORT_CHAT_BY_), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT_CHAT_BY_[item]);
        });
    }
    return {
        init: function () {
            $(document).on('click', '.zmdi-refresh', function(){
                _.LoadPage(window.location.hash);
            });
            if (_.has(window.location.obj, 'idCompany')) $('select[name="idCompany"]').val(window.location.obj.idCompany).selectpicker('refresh');
            //if (_.has(window.location.obj, 'agentId[]')) {
            //    var item = decodeURI(window.location).split("?")[1].split("&");
            //    var array = [];
            //    _.each(item, function (o) {
            //        if (o.split("=")[0] == "agentId[]") {
            //            array.push(o.split("=")[1]);
            //        }
            //    })
            //    $('select[name="agentId"]').selectpicker("val", array).selectpicker('refresh');
            //}
            //;
            var s = _.has(window.location.obj, 'startDate') ? window.location.obj['startDate'] : "";
            var e = _.has(window.location.obj, 'endDate') ? window.location.obj['endDate'] : "";
            $('#startDate').val(s).datetimepicker({maxDate: e});
            $('#endDate').val(e).datetimepicker({minDate: s});
            bindClick();
            //bindSubmit();
            bindTextValue();
            cascadeOption();
            //$('#container').highcharts(options);
            //$('#container2').highcharts(options2);
        },
        uncut: function () {
            // disable sự kiện khi đóng trang
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('change', 'select[name="idCompany"]');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);