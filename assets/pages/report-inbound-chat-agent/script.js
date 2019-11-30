
var DFT = function ($) {
    var options = {};
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        _Ajax("/report-inbound-chat-agent?" + $.param(filter),'GET', {}, function(resp){
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
        // xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_Báo cáo theo agent.xls')
            $(this).attr('href', exportexcel);
        });
        // Làm mới trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
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

    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.REPORT), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT[item]);
        });
    }

//    var newOption = function(obj){
//        return _.Tags([
//            {tag: 'option', attr: {class: 'text-center ', value: obj._id}, content: obj.name}
//        ]);
//    };
    // Hiển thị dữ liệu báo cáo
    var initTable= function(datas){
        $("#tbBody").empty();
        _.each(datas, function(data, i){
            var tags= _.Tags([
                {tag:'tr', attr: {id: data._id}, childs: [
                    {tag:'td', attr:{class: 'text-center'}, content: data.agent.displayName},
                    {tag:'td', attr:{class: 'text-center'}, content: data.total.toString()},
                    {tag:'td', attr:{class: 'text-center'}, content: data.connected.toString()},
                    {tag:'td', attr:{class: 'text-center'}, content: data.missed.toString()}
                ]}
            ]);

            $("#tbBody").append(tags);

//            for(var j=8;j<18;j++){
//                $("tr#"+data._id+" td."+j).html(data.timeBlock[j]);
//            }
        })
    };
    // Cập nhật lại dữ liệu agents khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get('/report-inbound-chat-agent?queryChannel=1&idCompany=' + $(this).val(), function (res) {
                if (res.code == 200){
                    $('select[name="idChannel"]').empty();
                    _.each(res.channels, function(o){
                        $('select[name="idChannel"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.name}]));
                    });
                    $('select[name="idChannel"]').selectpicker('refresh');
                }
            });
            $.get('/report-chat-by-time', {idParent: $(this).val()}, function (res) {
                $('select[name="agents"]').empty();
                _.each(res, function(o){
                    $('select[name="agents"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName}]));
                });
                $('select[name="agents"]').selectpicker('refresh');
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