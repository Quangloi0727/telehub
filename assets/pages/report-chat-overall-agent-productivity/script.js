
var DFT = function ($) {
    var options = {};
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        _Ajax("/report-chat-overall-agent-productivity?" + $.param(filter),'GET', {}, function(resp){
            if(resp.code==200){
                datas= resp.users;
                if (datas.length) {
                    initTable(datas);
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
    var bindClick = function () {
        // Click tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_Báo cáo tổng thời gian chat.xls')
            $(this).attr('href', exportexcel);
        });
        // Làm mới lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
        // Thay đổi dữ liệu ở ô lọc theo ngày
        $("#startTime").on("dp.change", function (e) {
            $('#endTime').data("DateTimePicker").minDate(e.date);
        });
        $("#endTime").on("dp.change", function (e) {
            $('#startTime').data("DateTimePicker").maxDate(e.date);
        });
    };
    var bindSubmit = function () {

    };

    // Hiển thị dữ liệu báo cáo
    var initTable= function(datas){
        $("#tbBody").empty();
        _.each(datas, function(data, i){
            var tags= _.Tags([
                {tag:'tr', attr: {id: data._id}, childs: [
                    {tag:'td', attr:{class: 'text-center'}, content: data.agent.displayName},
                    {tag:'td', attr:{class: 'text-center'}, content: data.threadCount},
                    {tag:'td', attr:{class: 'text-center'}, content: data.connected},
                    {tag:'td', attr:{class: 'text-center'}, content: hms(data.totalTime/1000)},
                    {tag:'td', attr:{class: 'text-center'}, content: hms(data.averageTime/1000)}
                ]}
            ]);

            $("#tbBody").append(tags);

        })
    };
    // Cập nhật lại agent khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get('/report-chat-by-time', {idParent: $(this).val()}, function (res) {
                $('select[name="agentId"]').empty();
                _.each(res, function(o){
                    $('select[name="agentId"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName}]));
                });
                $('select[name="agentId"]').selectpicker('refresh');
            });
        });
    };
    return {
        init: function () {
            bindClick();
            cascadeOption();
        },
        uncut: function () {
            $(document).off('change', 'select[name="idCompany"]');
            $(document).off('change', 'select[name="idChannel"]');
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);
function pad(num) {
    return ("0"+num).slice(-2);
}
// Chuyển dữ liệu từ milliseconds thành 'hh:mm:ss'
function hms(secs) {
    var sec = Math.ceil(secs);
    var minutes = Math.floor(sec / 60);
    sec = sec % 60;
    var hours = Math.floor(minutes / 60)
    minutes = minutes % 60;
    return hours + ":" + pad(minutes) + ":" + pad(sec);
}