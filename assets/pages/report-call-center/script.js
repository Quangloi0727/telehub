var DFT = function ($) {
    var options = {};
    var options2 = {};
    // Lọc dữ liệu báo cáo
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '') && !_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        //window.location.hash = newUrl(window.location.hash, filter);
        _Ajax("/report-call-center?"+ $.param(filter),'GET',{}, function(resp){
            if(resp.code==200){
                if(!_.isEmpty(resp.total)){
                    datas= resp.data;
                    total = resp.total;
                    initTable(datas, total);
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

    // Hiển thị dữ liệu báo cáo
    var initTable= function(data, total){
        $("#tbBody").empty();
        _.each(_.range(24), function(o){
            var tags= _.Tags([
                {tag:'tr', childs: [
                    {tag:'td', attr:{class: 'text-center'}, content: o+'H - ' + (o+1) + 'H'},//day
                    {tag:'td', attr:{class: 'text-center'}, content: data[o].callIn.toString()},
                    {tag:'td', attr:{class: 'text-center'}, content: (data[o].callIn - data[o].missedCallIn).toString()},
                    {tag: 'td', attr: {class: 'text-center'}, content: data[o].callOut.toString()},
                    {tag:'td', attr:{class: 'text-center'}, content: data[o].agent.toString()},
                    {tag:'td', attr:{class: 'text-center'}, content: hms(data[o].callInDuration/1000)},
                    {tag: 'td', attr: {class: 'text-center'}, content: hms(data[o].callOutDuration/1000)},
                    {tag:'td', attr:{class: 'text-center'}, content: hms((data[o].callInDuration+data[o].callOutDuration)/(data[o].callIn + data[o].callOut - data[o].missedCallIn - data[o].missedCallOut)/1000)},
                    {tag:'td', attr:{class: 'text-center'}, content: data[o].missedCallIn.toString()},
                    {tag: 'td', attr: {class: 'text-center'}, content: (data[o].callIn?(data[o].missedCallIn*100/data[o].callIn).toFixed(2):0) + '%'},
                    {tag:'td', attr:{class: 'text-center'}, content: (data[o].callIn?((data[o].callIn-data[o].missedCallIn)*100/data[o].callIn).toFixed(2):0) + '%'},
                    {tag:'td', attr:{class: 'text-center'}, content: (data[o].onlineTime?((data[o].callInDuration+data[o].callOutDuration)*100/data[o].onlineTime).toFixed(2):0) + '%'},
                    {tag: 'td', attr: {class: 'text-center'}, content: 3600},
                    {tag: 'td', attr: {class: 'text-center'}, content: hms(data[o].onlineTime/1000)}
                ]}
            ]);
            $("#tbBody").append(tags);
        })
        $("#tbBody").append(_.Tags([
            {tag:'tr', childs: [
                {tag:'th', attr:{class: 'text-center'}, content: 'Tổng'},//day
                {tag:'th', attr:{class: 'text-center'}, content: total.callIn.toString()},
                {tag:'th', attr:{class: 'text-center'}, content: (total.callIn - total.missedCallIn).toString()},
                {tag: 'th', attr: {class: 'text-center'}, content: total.callOut.toString()},
                {tag:'th', attr:{class: 'text-center'}, content: total.agent.toString()},
                {tag:'th', attr:{class: 'text-center'}, content: hms(total.callInDuration/1000)},
                {tag: 'th', attr: {class: 'text-center'}, content: hms(total.callOutDuration/1000)},
                {tag:'th', attr:{class: 'text-center'}, content: hms((total.callInDuration+total.callOutDuration)/(total.callIn + total.callOut - total.missedCallIn - total.missedCallOut)/1000)},
                {tag:'th', attr:{class: 'text-center'}, content: total.missedCallIn.toString()},
                {tag: 'th', attr: {class: 'text-center'}, content: (total.callIn?(total.missedCallIn*100/total.callIn).toFixed(2):0) + '%'},
                {tag:'th', attr:{class: 'text-center'}, content: (total.callIn?((total.callIn-total.missedCallIn)*100/total.callIn).toFixed(2):0) + '%'},
                {tag:'th', attr:{class: 'text-center'}, content: (total.onlineTime?((total.callOutDuration+total.callOutDuration)*100/total.onlineTime).toFixed(2):0) + '%'},
                {tag: 'th', attr: {class: 'text-center'}, content: 3600},
                {tag: 'th', attr: {class: 'text-center'}, content: hms(total.onlineTime/1000)}
            ]}
        ]))
    };
    function pad(num) {
        return ("0" + num).slice(-2);
    }

    // Đưa dữ liệu từ milliseconds về 'hh:mm:ss
    function hms(secs) {
        if(isNaN(secs)) return '00:00:00';
        var sec = Math.ceil(secs);
        var minutes = Math.floor(sec / 60);
        sec = sec % 60;
        var hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        return hours + ":" + pad(minutes) + ":" + pad(sec);
    }
    var bindClick = function () {
        // Click nút Tìm kiếm
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
        // Thay đổi dữ liệu lọc theo ngày
        $("#startTime").on("dp.change", function (e) {
            $('#endTime').data("DateTimePicker").minDate(e.date);
        });
        $("#endTime").on("dp.change", function (e) {
            $('#startTime').data("DateTimePicker").maxDate(e.date);
        });
    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.REPORT_CALL_CENTER), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT_CALL_CENTER[item]);
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