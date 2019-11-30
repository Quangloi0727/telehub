
var DFT = function ($) {
    var options = {};
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        _Ajax("/report-message-chat?" + $.param(filter),'GET', {}, function(resp){
            if(resp.code==200){
                if(resp.data){
                    initTable(resp.data);
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
            $(this).attr('download', todaysDate + '_Báo cáo số lượng tin nhắn.xls')
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
    var initTable= function(data){
        console.log(data)
        $("#tbBody").empty();
        var tags= _.Tags([
            {tag:'tr', attr: {id: data._id}, childs: [
                {tag:'td', attr:{class: 'text-center'}, content: data.count},
                {tag:'td', attr:{class: 'text-center'}, content: data.message},
                {tag:'td', attr:{class: 'text-center'}, content: data.avgMessage.toFixed(0)}
            ]}
        ]);

        $("#tbBody").append(tags);
    };

    // Cập nhật lại danh sách agent khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get('/report-message-chat?queryChannel=1&idCompany=' + $(this).val(), function (res) {
                if (res.code == 200){
                    $('select[name="idChannel"]').empty();
                    _.each(res.channels, function(o){
                        $('select[name="idChannel"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.name}]));
                    });
                    $('select[name="idChannel"]').selectpicker('refresh');
                }
            });
        });
    };
    return {
        init: function () {
            bindClick();
            cascadeOption();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('change', 'select[name="idCompany"]');
            $(document).off('change', 'select[name="idChannel"]');
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);