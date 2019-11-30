/**
 * Created by baygiomoidc
 */
var DFT = function ($) {
    var lastSearch = {};
    var pagingObject = {};
    var lastPagingData = {};

    var bindSocket = function (client) {

    };

    var bindClick = function () {
        // Reload lại page
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // Click tìm kiếm
        $(document).on('click', '#btn-search', function () {
            var formId = $(this).closest('form').attr('id');
            queryFilter(formId);
        });

        // Sang trang khác
        $(document).on('click', '.zpaging', function () {
            var formId = $(this).closest('form').attr('id');
            window.location.obj['page'] = $(this).attr('data-link');
            queryFilter(formId);
        });

        // tải file báo cáo
        $(document).on('click', '#download-excel', function () {
            queryFilter('report-customer-statify', true, true);
        });
    };

    // Lấy dữ liệu lọc và truy vấn server
    var queryFilter = function (formId, ignoreSearch, downloadExcel) {
        var filter = _.chain($('#' + formId + ' .searchColumn'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')) {
                    memo[el.name] = $(el).val();
                }
                return memo;
            }, {}).value();
        var paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';


        var custom = '&formId=' + formId
            + '&ignoreSearch='
            + (ignoreSearch ? 1 : 0)
            + '&download=' + (downloadExcel ? 1 : 0);
        var url = (newUrl(window.location.hash, filter) + paging + custom).replace('#', '');
        if (downloadExcel){
            downloadExcelReport(url);
        }else{
            requestTickets(formId, url, ignoreSearch);
        }
    };

    // tải file báo cáo
    var downloadExcelReport = function(url){
        $('.page-loader').show();
        $.get(url, function( resp ) {
            $('.page-loader').hide();
            if (resp.code == 500){
                swal({
                    title: 'Đã có lỗi xảy ra',
                    text: resp.message,
                    type: "error"
                });
            }else{
				downloadFromUrl(window.location.origin + resp.message);
            }
        });
    };

    // Tải dữ liệu ticket
    var requestTickets = function (formId, url, ignoreSearch) {
        _AjaxData(url, 'GET', null, function (resp) {
            if (resp.code == 500) {
                swal({
                    title: 'Có lỗi xảy ra',
                    text: resp.message,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Xác nhận!",
                    closeOnConfirm: true
                }, function () {

                });
            } else {
                loadData(formId, resp);
            }
        });
    };


    // Hiển thị dữ liệu phân trang
    var createPaging = function (paging) {
        if (!paging) return '';
        var firstPage = paging.first ? '<li><a role="button" class="zpaging" data-link="' + paging.first + '">&laquo;</a></li>' : '';
        var prePage = paging.previous ? '<li><a role="button" class="zpaging" data-link="' + paging.previous + '">&lsaquo;</a></li>' : '';
        var pageNum = '';
        for (var i = 0; i < paging.range.length; i++) {
            if (paging.range[i] == paging.current) {
                pageNum += '<li class="active"><span>' + paging.range[i] + '</span></li>';
            } else {
                pageNum += '<li><a role="button" class="zpaging" data-link="' + paging.range[i] + '">' + paging.range[i] + '</a></li>';
            }
        }
        var pageNext = paging.next ? '<li><a role="button" class="zpaging" data-link="' + paging.next + '">&rsaquo;</a></li>' : '';
        var pageLast = paging.last ? '<li><a role="button" class="zpaging" data-link="' + paging.last + '">&raquo;</a></li>' : '';
        return '<div class="paginate text-center">' + '<ul class="pagination">' + firstPage + prePage + pageNum + pageNext + pageLast + '</ul></div>';
    };

    // Hiển thị dữ liệu báo cáo
    var loadData = function (formId, resp) {
        var total = 0;
        resp.message.data.forEach(function (el) {
            if (_.isEmpty(el)) return;
            total += el.count;
        });
        if(resp.message.paging){
            $('#' + formId + ' #tbl-paging').html(createPaging(resp.message.paging));
        };

        $('#tbl-total').html('<b>' +
            '<span class="">Tổng số phiếu </span>: ' +
            '<span class="bold c-red" id="tbl-total">' + total + '</span>' +
            '</b>');

        var template = '<tr>' +
            '<td title="{0}">{0}</td>' +
            '<td title="{1}">{1}</td>' +
            '<td title="{2}" class="text-center">{2}</td>' +
            '<td title="{3}" class="text-center">{3}</td>'
            '</tr>';

        var rows = '';
        var emptyObj = null;
        resp.message.data.forEach(function (el) {
            if (el.count <= 0) return;
            if(!el._id) {
                emptyObj = el;
                return;
            };
            rows += template.str(el.customerStatisfyStage,
                el.customerStatisfy,
                el.count,
                parseInt((el.count/total)*100)+'%'
            );
        });
        // TODO: Đẩy giá trị null xuống dưới cùng
        if(emptyObj) rows += template.str('None',
            'None',
            emptyObj.count,
            parseInt((emptyObj.count/total)*100)+'%'
        );
        $('#' + formId + ' #tbl-body').html(rows);
        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");
		window.MainContent.loadTooltip();
    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        var temp = [];
        _.each(_.allKeys(_config.MESSAGE.REPORT_CUSTOMER_STATISFY), function (item) {
            var obj = $('.' + item);
            if (obj.prop('tagName')) {
                obj.html(_config.MESSAGE.REPORT_CUSTOMER_STATISFY[item]);
            }
        });
    };

    return {
        init: function () {
            bindSocket(_socket);
            bindClick();
            bindTextValue();

            $('.multi-date-picker').datepicker({
                multidate: 2,
                multidateSeparator: ' - ',
                format: 'dd/mm/yyyy'
            });

            //queryFilter('frm-report-campaign-ticket', true);
        },
        uncut: function () {
            // disable sự kiện khi đóng trang
            lastSearch = {};
            pagingObject = {};
            lastPagingData = {};
            $(document).off('change', 'select[name="company"]');
            $(document).off('click', '.sort');
            $(document).off('click', '#btn-search');
            $(document).off('click', '.zpaging');
            $(document).off('keyup', '.filter');
            $(document).off('change', '.column-display');
            $(document).off('click', '#download-excel');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);