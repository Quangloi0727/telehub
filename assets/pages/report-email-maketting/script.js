
var DFT = function ($) {
    // Truy vấn dữ liệu báo cáo
    var getData = function($this){
        var _url = $this ? $this.attr('href') : '/report-email-maketting';
        var data = _.pick($('#filter-data').serializeJSON(), function(value, key, object){
            return !_.isEqual(value,'');
        });

        var sort = _.chain($('#table thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('sortName') ? $(el).attr('sortName') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        sort = _.isEmpty(sort) || _.isEqual(sort.length, 0) ? '' : '?sort=' + sort[0];
        _url += sort;

        _Ajax(_url, 'POST', [{data: JSON.stringify(data)}], function (resp) {
            if(resp.code == 200){
                if(resp.result.length){
                    $('#table tbody').empty();
                    $('.paging').remove();
                    $('#table tbody').append(tableTag(resp.result));
                    $('<div class="text-center paging">' +  _.paging('/report-email-maketting', resp.paging) + '</div>').insertAfter('#table');
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
        });
    }

    // Hiển thị dữ liệu báo cáo lên giao diện
    var tableTag = function(data){
        var trs = [];
        _.each(data, function(data){
            var tds = [];
            tds.push({tag:'td', content: data.name});
            tds.push({tag:'td', content: data.service});
            tds.push({tag:'td', content: data.company});
            tds.push({tag:'td', content: ''+data.amount});
            tds.push({tag:'td', content: ''+data.completed});
            tds.push({tag:'td', content: parseInt(data.amount ? (data.completed/data.amount)*100 : 0) + '%'});
            tds.push({tag:'td', content: moment(data.sendDate).format('DD/MM/YYYY')});
            tds.push({tag:'td', content: moment(data.created).format('DD/MM/YYYY')});
            trs.push({tag: 'tr', attr: {class: 'text-center'}, childs: tds});
        });

        return _.Tags(trs);
    }

    var bindClick = function () {
        // Click tìm kiếm
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
            $(this).attr('download', todaysDate + '_Báo cáo chiến dịch email maketting.xls')
            $(this).attr('href', exportexcel);
        });
        // Cập nhật lại giao diện khi thay đổi ngày lọc
        $("#startDate").on("dp.change", function (e) {
            $('#endDate').data("DateTimePicker").minDate(e.date);
        });
        $("#endDate").on("dp.change", function (e) {
            $('#startDate').data("DateTimePicker").maxDate(e.date);
        });

        // Sắp xếp dữ liệu
        $(document).on('click', '.sort', function () {
            var $this = $(this);
            switch ($this.attr('data-sort')) {
                case 'none':
                    $this.toggleAttr('data-sort', 'asc');
                    break;
                case 'asc':
                    $this.toggleAttr('data-sort', 'desc');
                    break;
                case 'desc':
                    $this.toggleAttr('data-sort', 'none');
                    break;
            }
            $this.siblings().toggleAttr('data-sort', 'none');
            var formId = $(this).closest('form').attr('id');
            getData(null);
        });
    };

    return {
        init: function () {
            bindClick();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', '#exportexcel');
            $(document).off('click', '#searchBtn');
            $(document).off('click', '.paging .pagination li a');
            $(document).off('click', '.sort');
        }
    };
}(jQuery);