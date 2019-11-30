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
        _Ajax("/report-mail-by-day?"+ $.param(filter),'GET',{}, function(resp){
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
    // Hiển thị dữ liệu lên giao diện
    var initTable= function(datas){
        $("#tbBody").empty();
        _.each(datas, function(data, i){
            var tags= _.Tags([
                {tag:'tr', attr: {id: data._id}, childs: [
                    {tag:'td', attr:{class: 'text-center'}, content: data._id.day+"/"+data._id.month + "/" + data._id.year},//day
                    {tag:'td', attr:{class: 'text-center'}, content: data.receive.toString()},
                    {tag:'td', attr:{class: 'text-center'}, content: data.send.toString()},
                    {tag: 'td', attr: {class: 'text-center'}, content: data.total.toString()}
                ]}
            ]);

            $("#tbBody").append(tags);


        })
    }
    var bindClick = function () {
        // Click tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_BaoCaoMailGuiNhanTheoThang.xls')
            $(this).attr('href', exportexcel);
        });
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    };
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

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.REPORT_MAIL_BY_), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT_MAIL_BY_[item]);
        });
    }
    return {
        init: function () {
            $(document).on('click', '.zmdi-refresh', function(){
                _.LoadPage(window.location.hash);
            });
            bindClick();
            bindTextValue();
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