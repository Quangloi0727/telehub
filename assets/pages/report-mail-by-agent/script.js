
var DFT = function ($) {
    var options = {};
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        _Ajax("/report-mail-by-agent?queryMail=1&" + $.param(filter),'GET', {}, function(resp){
            if(resp.code==200){
                if(resp.users.length){
                    datas= resp.users;
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
        // Click tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_Báo cáo số lượng mail gửi, nhận theo agent.xls')
            $(this).attr('href', exportexcel);
        });
        // Tải lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
        $("#startTime").on("dp.change", function (e) {
            $('#endTime').data("DateTimePicker").minDate(e.date);
        });
        $("#endTime").on("dp.change", function (e) {
            $('#startTime').data("DateTimePicker").maxDate(e.date);
        });
    };
    var bindSubmit = function () {

    };

    // Hiển thị dữ liệu lên giao diện
    var initTable= function(datas){
        $("#tbBody").empty();
        _.each(datas, function(data, i){
            var tags= _.Tags([
                {tag:'tr', attr: {id: data._id._id}, childs: [
                    {tag:'td', attr:{class: 'text-center'}, content: data.agent.displayName},
                    {tag:'td', attr:{class: 'text-center'}, content: data.send.toString()},
                    {tag:'td', attr:{class: 'text-center'}, content: data.receive.toString()},
                    {tag:'td', attr:{class: 'text-center'}, content: data.total.toString()}
                ]}
            ]);

            $("#tbBody").append(tags);

        })
    };
//    var cascadeOption = function () {
//        $('select[name="idCompany"]').on('change', function () {
//            $.get('/report-inbound-chat-agent?queryChannel=1&idCompany=' + $(this).val(), function (res) {
//                if (res.code == 200){
//                    $('select[name="idChannel"]').empty();
//                    _.each(res.channels, function(o){
//                        $('select[name="idChannel"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.name}]));
//                    });
//                    $('select[name="idChannel"]').selectpicker('refresh');
//                }
//            });
//        });
//    };
    return {
        init: function () {
            bindClick();
//            cascadeOption();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
//            $(document).off('change', 'select[name="idCompany"]');
//            $(document).off('change', 'select[name="idChannel"]');
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);