
var DFT = function ($) {
    var options = {};
    // Lấy dữ liệu lọc và truy vấn server
    var getFilter = function () {
        var filter = _.chain($('.input'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')&&!_.isEqual($(el).val(), null)) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();
        var paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        _Ajax("/report-chatthread-by-time?" + $.param(filter) + paging,'GET', {}, function(resp){
            if(resp.code==200){
                datas= resp.data;
                if(datas.length){
                    initTable(datas, resp.timePerThread);
                    $('#paging').html(createPaging(resp.paging));
                }else{
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
            $(this).attr('download', todaysDate + '_Báo cáo số lượng tin nhắn.xls')
            $(this).attr('href', exportexcel);
        });
        // Load lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // Chuyển trang
        $(document).on('click', '.zpaging', function () {
            var formId = $(this).closest('form').attr('id');
            window.location.obj['page'] = $(this).attr('data-link');
            getFilter();
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

    // Hiển thị dữ liệu báo cáo lên giao diện
    var initTable= function(datas, timePerThread){
        $("#tbBody").empty();
        _.each(datas, function(data){
            console.log(data.clientId)
            var agentLi = [];
            _.each(data.agentId, function(agent){
                agentLi.push({tag: 'li', content: agent.displayName});
            });
            var tags= _.Tags([
                {tag:'tr', attr: {id: data._id}, childs: [
                    {tag:'td', attr:{class: 'text-center'}, content: data.region + '#' + data.clientId.split('-')[3]},
                    {tag:'td', attr:{class: 'text-center'}, childs: [
                        {tag: 'ul', childs: agentLi}
                    ]},
                    {tag:'td', attr:{class: 'text-center'}, content: moment(data.created).format('DD/MM/YYYY HH:mm:ss A')},
                    {tag:'td', attr:{class: 'text-center'}, content: moment(data.updated).format('DD/MM/YYYY HH:mm:ss A')},
                    {tag:'td', attr:{class: 'text-center'}, content: (data.time/1000).toFixed(1) + ' giây'}
                ]}
            ]);
            $("#tbBody").append(tags);
        });

        var lastTag = _.Tags([
            {tag:'tr', childs: [
                {tag:'td', attr:{class: 'text-center'}, content: 'Thời gian trung bình'},
                {tag:'td'},
                {tag:'td'},
                {tag:'td'},
                {tag:'td', attr:{class: 'text-center'}, content: timePerThread + ' giây'}
            ]}
        ]);
    };

    // Hiển thị dữ liệu phân trang
    var createPaging = function (paging) {
        if (!paging) return '';
        var firstPage = paging.first ? '<li><a class="zpaging" data-link="' + paging.first + '">&laquo;</a></li>' : '';
        var prePage = paging.previous ? '<li><a class="zpaging" data-link="' + paging.previous + '">&lsaquo;</a></li>' : '';
        var pageNum = '';
        for (var i = 0; i < paging.range.length; i++) {
            if (paging.range[i] == paging.current) {
                pageNum += '<li class="active"><span>' + paging.range[i] + '</span></li>';
            } else {
                pageNum += '<li><a class="zpaging" data-link="' + paging.range[i] + '">' + paging.range[i] + '</a></li>';
            }
        }
        var pageNext = paging.next ? '<li><a class="zpaging" data-link="' + paging.next + '">&rsaquo;</a></li>' : '';
        var pageLast = paging.last ? '<li><a class="zpaging" data-link="' + paging.last + '">&raquo;</a></li>' : '';
        return '<div class="paginate text-center">' + '<ul class="pagination">' + firstPage + prePage + pageNum + pageNext + pageLast + '</ul></div>';
    };

    // Cập nhật lại channel khi thay đổi công ty
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