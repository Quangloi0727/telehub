
var DFT = function ($) {
    var options = {};
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        _Ajax("/report-inout-general?"+ $.param(filter), 'GET', {}, function(resp){
            if(resp.code==200){
                if(!$.isEmptyObject(resp.datas)){
                    initTable(resp.datas);
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
            $(this).attr('download', todaysDate + '_Báo cáo gọi vào - Cuộc gọi nhỡ.xls')
            $(this).attr('href', exportexcel);
        })
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    };

    // Hiển thị tên cột theo file config
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
    // Hiển thị dữ liệu lên giao diện
    var initTable= function(data){
        $("#tbBody").empty();


            var tag= _.Tags([
                {tag: 'tr', childs:[
                    {tag:'td', attr:{class: 'text-center'}, content: ""+data.callsOut},
                    {tag:'td', attr:{class: 'text-center'}, content: ""+data.pickedOutCalls},
                    {tag:'td', attr:{class: 'text-center'}, content: ""+data.ticketsOut},
                    {tag:'td', attr:{class: 'text-center'}, content: ""+data.callsIn},
                    {tag:'td', attr:{class: 'text-center'}, content: ""+data.pickedInCalls },
                    {tag:'td', attr:{class: 'text-center'}, content: ""+data.missInCalls},
                    {tag:'td', attr:{class: 'text-center'}, content: ""+data.ticketsIn}
                ]}
            ]);
            $("#tbBody").append(tag);
    }
    function pad2(number) {

        return (number < 10 ? '0' : '') + number

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
            //bindSubmit();
            bindTextValue();
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