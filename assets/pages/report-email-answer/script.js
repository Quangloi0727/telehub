
var DFT = function ($) {
    // Cập nhật lại dữ liệu service
    var addService = function (comId) {
        $('#idService option').each(function (i, e) {
            if (!_.isEqual($(e).val(), ''))e.remove();
        });

        $('#idService').append(_.Tags(
            _.chain(_.find(companies, function (com) {
                    return _.isEqual(com._id.toString(), comId);
                }).servicemails)
                .reduce(function (memo, service) {
                    memo.push(
                        {tag: 'option', attr: {value: service._id}, content: service.name}
                    );
                    return memo;
                }, [])
                .value()
        ));
        $('#idService').selectpicker('refresh');
    };

    // Truy vấn dữ liệu báo cáo
    var getData = function($this){
        var _url = $this ? $this.attr('href') : '/report-email-answer';
        var data = _.pick($('#filter-data').serializeJSON(), function(value, key, object){
            return !_.isEqual(value,'');
        });

        _Ajax(_url, 'POST', [{data: JSON.stringify(data)}], function (resp) {
            if(resp.code == 200){
                if(!resp.timeAnswer.length || !resp.services.length){
                    swal({
                        title: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TITLE,
                        text: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TEXT,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Quay lại!",
                        closeOnConfirm: true
                    })
                }else{
                    $('#table tbody').empty();
                    $('.paging').remove();
                    $('#table tbody').append(tableTag(resp.services, resp.timeAnswer));
                    $('<div class="text-center paging">' +  _.paging('/report-email-answer', resp.paging) + '</div>').insertAfter('#table');
                }
            }
        });
    }

    // Hiển thị dữ liệu báo cáo
    var tableTag = function(data, timeAnswer){
        var trs = [];
        _.each(data, function(data){
            _.each(timeAnswer, function(time){
                if(_.isEqual(time._id.toString(), data._id.toString())){
                    var tds = [];
                    tds.push({tag:'td', content: data.name});
                    tds.push({tag:'td', content: data.company});
                    tds.push({tag:'td', content: hms(time.total)});
                    tds.push({tag:'td', content: hms(time.total/time.count)});
                    tds.push({tag:'td', content: time.count});
                    trs.push({tag: 'tr', attr: {class: 'text-center'}, childs: tds});
                }
            });
        });

        return _.Tags(trs);
    }

    // Đưa milliseconds về 'hh:mm:ss'
    function hms(secs) {
        if(_.isNaN(secs)) return "0:00:00";
        var sec = Math.ceil(secs/1000);
        var minutes = Math.floor(sec / 60);
        sec = sec % 60;
        var hours = Math.floor(minutes / 60)
        minutes = minutes % 60;
        return hours + ":" + pad(minutes) + ":" + pad(sec);
    }
    function pad(num) {
        return ("0"+num).slice(-2);
    }
    var bindClick = function () {
        // Cập nhật giao diện khi thay đổi công ty
        $('#idCompany').change(function () {
            _.each(companies, function(com){
                if(_.isEqual(com._id, $('#idCompany').val())){
                    addService($('#idCompany').val());
                }
            });
        });

        // CLick tìm kiếm
        $('#searchBtn').click(function () {
            getData(null);
        });

        // Chuyển trang
        $(document).on('click', '.paging .pagination li a', function (e) {
            e.preventDefault();
            var $this = $(this);
            getData($this);
        });

        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_Báo cáo tổng thời gian trả lời email.xls')
            $(this).attr('href', exportexcel);
        })
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    };

    return {
        init: function () {
            bindClick();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', '#exportexcel');
            $(document).off('change', '#idCompany');
            $(document).off('click', '#searchBtn');
            $(document).off('click', '.paging .pagination li a');
        }
    };
}(jQuery);