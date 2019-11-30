/**
 * Created by sonth
 */
var DFT = function ($) {
    var lastSearch = {},
        _kpiMarkData = ''

    function bindTextValue() {
        var temp = [];
        _.each(_.allKeys(_config.MESSAGE.REPORT_KPI), function (item) {
            var obj = $('.' + item);
            if (obj.prop('tagName')) {
                obj.html(_config.MESSAGE.REPORT_KPI[item]);

                var index = obj.closest('th').index();
                temp[index] = '<li class="p-l-15 p-r-20"> ' +
                    '<div class="checkbox">' +
                    '<label> ' +
                    '<input type="checkbox" class="select-box column-display" data-index="' + index + '" checked>' +
                    '<i class="input-helper"></i>' +
                    '<a class="p-l-5 text-capitalize text-nowrap">' + _config.MESSAGE.REPORT_KPI[item] + '</a>' +
                    '</label>' +
                    '</div>' +
                    '</li>';
            }
        });

        $('#showHideFields').append(temp.join(''));
    };

    function bindClick() {
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

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
            //var formId = $(this).closest('form').attr('id');
            queryFilter('search-input');
        });

        $(document).on('click', '#btn-search', function () {
            var formId = $(this).closest('form').attr('id');
            queryFilter(formId);
        });

        //$(document).on('click', '.zpaging', function () {
        //    var formId = $(this).closest('form').attr('id');
        //    window.location.obj['page'] = $(this).attr('data-link');
        //    queryFilter(formId);
        //});

        $(document).on('keyup', '.filter', function (e) {
            if (e.keyCode == 13) {
                var formId = $(this).closest('form').attr('id');
                queryFilter(formId);
            }
        });

        $(document).on('change', '.column-display', function (e) {
            var dataIndex = $(this).attr('data-index');
            var checked = $(this).is(":checked");

            _.each($('th'), function (el) {
                var index = $(el).index();

                if (index == dataIndex) {
                    if (checked) {
                        $(el).show();
                    } else {
                        $(el).hide();
                    }
                }
            });

            _.each($('td'), function (el) {
                var index = $(el).index();
                if (index == dataIndex) {
                    if (checked) {
                        $(el).show();
                    } else {
                        $(el).hide();
                    }
                }
            })
        });

        $(document).on('click', '#download-excel', function () {
            //queryFilter('frm-report-kpi', true, true, lastPagingData['frm-report-kpi'].totalResult);
            var todaysDate = moment().format('DD-MM-YYYY');
            var exportexcel = tableToExcel('exceldata', 'My Worksheet');
            $(this).attr('download', todaysDate + '_Báo cáo KPI.xls')
            $(this).attr('href', exportexcel);
        });
    };

    function queryFilter(formId, downloadExcel) {
        var filter = _.chain($('#' + formId + ' .searchColumn'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')) {
                    memo[el.name] = $(el).val();
                }
                return memo;
            }, {}).value();

        var sort = _.chain($('#frm-report-kpi' + ' thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('sortName') ? $(el).attr('sortName') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        sort = _.isEmpty(sort) || _.isEqual(sort.length, 0) ? '' : '&sort=' + sort[0];
        var paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';

        var dateTime = (new Date()).getTime();
        var custom = '&download=' + (downloadExcel ? 1 : 0);
        var url = (newUrl(window.location.hash, filter) + sort + paging + custom).replace('#', '');
        if (downloadExcel) {
            downloadExcelReport(url);
        } else {
            requestTickets(url);
        }
    };

    function downloadExcelReport(url) {
        $('.page-loader').show();
        $.get(url, function (resp) {
            $('.page-loader').hide();

            if (resp.code == 500) {
                swal({
                    title: 'Đã có lỗi xảy ra',
                    text: resp.message,
                    type: "error"
                });
            } else {
				downloadFromUrl(window.location.origin + resp.message);
            }
        });
    };

    function requestTickets(url) {
        createLoadingPaging('frm-report-kpi');
        _AjaxData(url, 'GET', null, function (resp) {
            if (resp.code == 500 || (resp.data.length == 0)) {
                swal({
                    title: 'Thông báo',
                    text: 'Không tìm thấy kết quả với khoá tìm kiếm',
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Xác nhận!",
                    closeOnConfirm: true
                }, function () {
                    reverseSearchValue();
                    //reversePagingData(formId);
                });
            } else {
                loadData('frm-report-kpi', resp);
            }
            $('#ticket-paging').remove();
        });
    };

    function setValueLastSearch() {
        _.each($(' .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = $(el).val();
            lastSearch[name] = value;
        });
    };

    function reverseSearchValue() {
        _.each($('.searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = lastSearch[name] ? lastSearch[name] : '';
            $(el).val(value);
        });

        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");
    };

    //function reversePagingData(formId) {
    //    if (!_.has(lastPagingData, formId) || _.isEmpty(lastPagingData[formId])) return '';
    //    $('#' + formId + ' #ticket-paging').html(createPaging(lastPagingData[formId]));
    //};

    //function createPaging(paging) {
    //    if (!paging) return '';
    //    var firstPage = paging.first ? '<li><a class="zpaging" data-link="' + paging.first + '">&laquo;</a></li>' : '';
    //    var prePage = paging.previous ? '<li><a class="zpaging" data-link="' + paging.previous + '">&lsaquo;</a></li>' : '';
    //    var pageNum = '';
    //    for (var i = 0; i < paging.range.length; i++) {
    //        if (paging.range[i] == paging.current) {
    //            pageNum += '<li class="active"><span>' + paging.range[i] + '</span></li>';
    //        } else {
    //            pageNum += '<li><a class="zpaging" data-link="' + paging.range[i] + '">' + paging.range[i] + '</a></li>';
    //        }
    //    }
    //    var pageNext = paging.next ? '<li><a class="zpaging" data-link="' + paging.next + '">&rsaquo;</a></li>' : '';
    //    var pageLast = paging.last ? '<li><a class="zpaging" data-link="' + paging.last + '">&raquo;</a></li>' : '';
    //    return '<div class="paginate text-center">' + '<ul class="pagination">' + firstPage + prePage + pageNum + pageNext + pageLast + '</ul></div>';
    //};

    function createLoadingPaging(formId) {
        var htmlCode = '<div class="paginate text-center">' +
            '<ul class="pagination">' +
            '<li>' +
            '<img src="assets/images/loading.gif"/>' +
            '</div> ' +
            '</li>' +
            '</ul></div>';
        $('#' + formId + ' #ticket-paging').html(htmlCode);
    };

    function loadData(formId, resp) {
        var template = '<tr>' +
            '<td class="text-center">{0}</td>' +
            '<td class="text-center">{1}</td>' +
            '<td class="text-center">{2}</td>' +
            '<td class="text-center">{3}</td>' +
            '<td class="text-center">{4}</td>' +
            '<td class="text-center">{5}</td>' +
            '<td class="text-center">{6}</td>' +
            '<td class="text-center">{7}</td>' +
            '<td class="text-center">{8}</td>' +
            '<td class="text-center">{9}</td>' +
            '<td class="text-center">{10}</td>' +
            '<td class="text-center">{11}</td>' +
            '<td class="text-center">{12}</td>' +
            '</tr>';
        _kpiMarkData = $("#markData :selected").text();
        var rows = '';
        resp.data.forEach(function (el) {
            if (_.isEmpty(el)) return;
            var num_ok = 0, num_good = 0, num_distinction = 0, num_excellent = 0;
            var evaluation = 'YẾU';
            if (el.evaluation >= 0.9){
                evaluation = 'XUẤT SẮC';
            }
            else if (el.evaluation >= 0.8){
                evaluation = 'GIỎI';
            }
            else if (el.evaluation >= 0.7){
                evaluation = 'KHÁ';
            }
            else if (el.evaluation >= 0.5){
                evaluation = 'TRUNG BÌNH';
            }

            async.each(el.marks, function(ticket, fn){
                var sum = ticket.datas['kpi_sum'];
                var max = ticket.datas['kpi_maxInput'];
                num_ok = (sum >= max * 0.5) ? (num_ok + 1) : num_ok;
                num_good= (sum >= max * 0.7) ? (num_good + 1) : num_good;
                num_distinction = (sum >= max * 0.8) ? (num_distinction + 1) : num_distinction;
                num_excellent = (sum >= max * 0.9) ? (num_excellent + 1) : num_excellent;
                fn();
            }, function(err){
                rows += template.str(_kpiMarkData,
                    el._id.displayName,
                    el.data.length,
                    el.marks.length,
                    el.data.length - el.marks.length,
                    num_ok,
                    el.marks.length - num_ok,
                    num_good,
                    num_distinction,
                    num_excellent,
                    (el.marks.length == 0 || num_good == 0) ? 0 : (parseFloat(num_good * 100 / el.marks.length).toFixed(2)) + '%',
                    el.sum,
                    evaluation
                );
            });
        });

        setValueLastSearch();
        $('#' + formId + ' #ticket-body').html(rows);
        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");
		window.MainContent.loadTooltip();
    };

    function updateView() {
        // resize chosen picker
        $(".chosen-container").each(function () {
            $(this).attr('style', 'width: 100%');
        });
    };

    return {
        init: function () {
            bindTextValue();
            //updateView();
            //setValueLastSearch();
            bindClick();
        },
        uncut: function () {
            lastSearch = {};
            $(document).off('click', '.sort');
            $(document).off('click', '#btn-search');
            $(document).off('keyup', '.filter');
            $(document).off('change', '.column-display');
            $(document).off('click', '#download-excel');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);