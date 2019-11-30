var DFT = function ($) {
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        window.location.hash = newUrl(window.location.hash, filter);
    };
    var bindClick = function () {
        // Tải lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            window.location.hash = window.location.hash.split("?")[0];
        });
        // Click tìm kiếm
        $('a.btn.bgm-blue.uppercase.c-white').click(function () {
            getFilter();
        });
        // Xuất file báo cáo
        $('#exportexcel').on('click', function (event) {
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_BaoCaoNangSuatTongQuatDTVGoiRa.xls')
            $(this).attr('href', exportexcel);
        });
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
        _.each(_.allKeys(_config.MESSAGE.REPORT_OVERALL_AGENT_PRODUCTIVITY), function (item) {
            $('.' + item).html(_config.MESSAGE.REPORT_OVERALL_AGENT_PRODUCTIVITY[item]);
        });
    }
    // Cập nhật lại danh sách agent khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="idCompany"]').on('change', function () {
            $.get('/report-outbound-overall-agent-productivity', {company: $(this).val()}, function (res) {
                $('select[name="agentId"]').empty();
                $('select[name="idCampaign"]').empty();
                _.each(res.campaign, function(o){
                    $('select[name="idCampaign"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.name}]));
                });
                _.each(res.agent, function(o){
                    $('select[name="agentId"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName}]));
                });
                $('select[name="agentId"]').selectpicker('refresh');
                $('select[name="idCampaign"]').selectpicker('refresh');
            });
        });
    };
    return {
        init: function () {
            // Thông báo khi không tìm thấy kết quả
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
            // Hiển thị lại tiêu chí đã lọc
            _.each(window.location.obj, function (v, k) {
                var el = $('#' + k.replace(['[]'], '').replace('.', '\\.'));
                if (el[0]) {
                    switch (el.prop('tagName')) {
                        case 'INPUT':
                            el.val(v);
                            break;
                        case 'SELECT':
                            el.val(v);
                            if (el.is('.selectpicker')){
                                el.val(v).selectpicker('refresh');
                            }
                            break;
                    }
                }
            });
            bindClick();
            bindSubmit();
            bindTextValue();
            cascadeOption();

            _.each(_.keys(window.location.obj), function(key){
                $('#'+key).val(window.location.obj[key]);
            });
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('change', 'select[name="idCompany"]');
            $(document).off('click', 'a.btn.bgm-blue.uppercase.c-white');
            $(document).off('click', '#exportexcel');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);