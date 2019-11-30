var DFT = function ($) {
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        window.location.hash = newUrl(window.location.hash, filter)
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
            $(this).attr('download', todaysDate + '_Báo cáo mail - Báo cáo theo khung giờ.xls')
            $(this).attr('href', exportexcel);
        });
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });
    };
    var bindSubmit = function(){

    };
    // Cập nhật lại danh sách agent khi thay đổi công ty
    var cascade = function(){
        $('select[name="idCompany"]').on('change', function () {
            $.get('/report-mail-by-time', {idParent: $(this).val()}, function (res) {
                $('select[name="agentId"]').empty();
                _.each(res, function(o){
                    $('select[name="agentId"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName}]));
                });
                $('select[name="agentId"]').selectpicker('refresh');
            });
        });
    };
    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.REPORT_MAIL_BY_TIME), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT_MAIL_BY_TIME[item]);
        });
    }

    return {
        init: function () {
            // Thông báo khi không tìm thấy kết quả tìm kiếm
            if (isAlertSearch && Object.keys(window.location.obj).length > 0) {
                swal({
                    title: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TITLE,
                    text: _config.MESSAGE.TICKETREASON_TXT.SEARCH_NOT_FOUND_TEXT,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Quay lại!",
                    closeOnConfirm: true
                }, function () {
                    window.history.back();
                });
            }
            // Hiển thị lại tiêu chí đã lọc
            _.each(window.location.obj, function (v, k) {
                var el = $('#' + k.replace(['[]'], ''));
                if (el[0]) {
                    switch (el.prop('tagName')) {
                        case 'INPUT':
                            el.val(v);
                            break;
                        case 'SELECT':
                            el.val(v);
                            if (el.is('.selectpicker')) el.selectpicker('refresh');
                            break;
                    }
                }
            });
            // Hiển thị lại tiêu chí đã lọc
            if (_.has(window.location.obj, 'agentId[]')){
                var item = decodeURI(window.location).split("?")[1].split("&");
                var array = [];
                _.each(item, function(o){
                    if(o.split("=")[0]=="agentId[]"){
                        array.push(o.split("=")[1]);
                    }
                })
                $('select[name="agentId"]').selectpicker("val", array).selectpicker('refresh');
            };
            bindClick();
            bindSubmit();
            bindTextValue();
            cascade();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('change','select[name="idCompany"]');
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
        }
    };
}(jQuery);