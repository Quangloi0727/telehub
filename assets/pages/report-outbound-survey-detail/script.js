/**
 * Created by baygiomoidc
 */
var DFT = function ($) {
    var lastSearch = {};
    var pagingObject = {};
    var lastPagingData = {};

    var ticketStatus = {
        NOT_PROCESS: 'Chờ xử lý',
        PROCESSING: 'Đang xử lý',
        COMPLETE: 'Hoàn thành'
    };

    var bindSocket = function (client) {

    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        var temp = [];
        _.each(_.allKeys(_config.MESSAGE.REPORT_OUTBOUND_SURVEY_DETAIL), function (item) {
            var obj = $('.' + item);
            if (obj.prop('tagName')) {
                obj.html(_config.MESSAGE.REPORT_OUTBOUND_SURVEY_DETAIL[item]);
                obj.closest('th').attr('data-header', _config.MESSAGE.REPORT_OUTBOUND_SURVEY_DETAIL[item]);
                obj.closest('th').attr('id', item);

                var index = obj.closest('th').index();
                temp[index] = '<li class="p-l-15 p-r-20"> ' +
                    '<div class="checkbox">' +
                    '<label> ' +
                    '<input type="checkbox" class="select-box column-display" data-index="' + index + '" data-id="'+ item +'" checked>' +
                    '<i class="input-helper"></i>' +
                    '<a class="p-l-5 text-capitalize text-nowrap">' + _config.MESSAGE.REPORT_OUTBOUND_SURVEY_DETAIL[item] + '</a>' +
                    '</label>' +
                    '</div>' +
                    '</li>';
            }
        });

        $('#showHideFields').append(temp.join(''));
    };
    // Cập nhật lại danh sách user khi thay đổi công ty
    var cascadeOption = function () {
        $('select[name="company"]').on('change', function () {
            var query = {};
            if($(this).val()!=="") query.idParent = $(this).val();
            $.get('/report-inbound-overall-agent-productivity', query, function (res) {
                $('select[name="updateBy"]').empty();
                $('select[name="updateBy"]').append(_.Tags([{tag: 'option', attr: {value: "", selected:true}, content: "- Chọn -"}]));
                _.each(res, function(o){
                    $('select[name="updateBy"]').append(_.Tags([{tag: 'option', attr: {value: o._id}, content: o.displayName + "(" + o.name + ")"}]));
                });
                $('select[name="updateBy"]').trigger("chosen:updated");
            });
        });
    };
    var bindClick = function () {
        // Tải lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
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
            queryFilter(formId);
        });

        // Click tìm kiếm
        $(document).on('click', '#btn-search', function () {
            var formId = $(this).closest('form').attr('id');
            queryFilter(formId);
        });

        // Chuyển trang
        $(document).on('click', '.zpaging', function () {
            var formId = $(this).closest('form').attr('id');
            window.location.obj['page'] = $(this).attr('data-link');
            queryFilter(formId);
        });
        // Nhấn phím enter
        $(document).on('keyup', '.filter', function (e) {
            if (e.keyCode == 13) {
                var formId = $(this).closest('form').attr('id');
                queryFilter(formId);
            }
        });

        // Thay đổi hiển thị các cột trên giao diện
        $(document).on('change', '.column-display', function (e) {
            var dataIndex = $(this).attr('data-index');
            var checked = $(this).is(":checked");

            displayColumn(dataIndex, checked);
        });
        // Tải file báo cáo
        $(document).on('click', '#download-excel', function () {
            queryFilter('frm-report-outbound-survey', true, true, lastPagingData['frm-report-outbound-survey'].totalResult);
        });
    };

    /**
     * Thay đổi hiển thị các cột trên giao diện
     * @param dataIndex Thứ tự của cột
     * @param checked Ẩn/hiện
     */
    var displayColumn = function(dataIndex, checked){
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
    }

    // Lấy dữ liệu lọc và truy vấn server
    var queryFilter = function (formId, ignoreSearch, downloadExcel, totalResult) {
        var filter = _.chain($('#' + formId + ' .searchColumn'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')) {
                    memo[el.name] = $(el).val();
                }
                return memo;
            }, {}).value();

        var sort = _.chain($('#' + formId + ' thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('sortName') ? $(el).attr('sortName') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        sort = _.isEmpty(sort) || _.isEqual(sort.length, 0) ? '' : '&sort=' + sort[0];
        var paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';

        var dateTime = (new Date()).getTime();
        var custom = '&socketId=' + _socket.socket.sessionid
            + '&formId=' + formId
            + '&dt=' + dateTime
            + '&ignoreSearch='
            + (ignoreSearch ? 1 : 0)
            + '&download=' + (downloadExcel ? 1 : 0)
            + '&totalResult=' + (totalResult ? totalResult: 0);
        var url = (newUrl(window.location.hash, filter) + sort + paging + custom).replace('#', '');
        if (downloadExcel){
            downloadExcelReport(url);
        }else{
            requestTickets(formId, dateTime, url, ignoreSearch);
        }
    };

    // Tải file báo cáo
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

    // Truy vấn dữ liệu ticket
    var requestTickets = function (formId, dateTime, url, ignoreSearch) {
        if (!_.has(pagingObject, formId)) pagingObject[formId] = [];
        pagingObject[formId].push(dateTime);
        createLoadingPaging(formId);

        _AjaxData(url, 'GET', null, function (resp) {
            if (resp.code == 500 || (resp.message.length == 0 && !ignoreSearch)) {
                swal({
                    title: 'Không tìm thấy kết quả với khoá tìm kiếm',
                    text: resp.message,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Xác nhận!",
                    closeOnConfirm: true
                }, function () {
                    reverseSearchValue();
                    reversePagingData(formId);
                });
            } else {
                loadData(formId, resp);
            }
        });
    };

    // Hiển thị lại tiêu chí đã lọc
    var setValueLastSearch = function () {
        _.each($(' .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = $(el).val();
            lastSearch[name] = value;
        });
    };

    var reverseSearchValue = function () {
        _.each($('.searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = lastSearch[name] ? lastSearch[name] : '';
            $(el).val(value);
        });

        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");
    };

    var reversePagingData = function (formId) {
        if (!_.has(lastPagingData, formId) || _.isEmpty(lastPagingData[formId])){
            $('#' + formId + ' #ticket-paging').html('');
        } else {
            $('#' + formId + ' #ticket-paging').html(createPaging(lastPagingData[formId]));
        }
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

    // Tạo màn hình chờ khi truy vấn
    var createLoadingPaging = function (formId) {
        var htmlCode = '<div class="paginate text-center">' +
            '<ul class="pagination">' +
            '<li>' +
            '<img src="assets/images/loading.gif"/>' +
            '</div> ' +
            '</li>' +
            '</ul></div>';
        $('#' + formId + ' #ticket-paging').html(htmlCode);
    };

    /**
     * Cập nhật các cột dữ liệu lên giao diện
     * @param formId
     */
    var loadSHFields = function(formId){
        var shFieldsTags = '';
        $('#'+formId + ' table tr th').each(function(){
            var index = $(this).closest('th').index();
            var headerContent = $(this).attr('data-header');
            var dataId = $(this).attr('id');
            var isSelect = !($('#showHideFields').find('input[data-id="'+dataId+'"]').prop('checked') == false);
            shFieldsTags += '<li class="p-l-15 p-r-20"> ' +
                '<div class="checkbox">' +
                '<label> ' +
                '<input type="checkbox" class="select-box column-display" data-id="'+ dataId +'" data-index="' + index + '" '+(isSelect ? 'checked' : '')+'>' +
                '<i class="input-helper"></i>' +
                '<a class="p-l-5 text-capitalize text-nowrap" title="'+ headerContent +'">' +
                (headerContent.length <= 20 ? headerContent : headerContent.substring(0,19) + '...') +
                '</a>' +
                '</label>' +
                '</div>' +
                '</li>';
        });
        $('#showHideFields').html(shFieldsTags);
    }

    // Hiển thị dữ liệu truy vấn được lên giao diện
    var loadData = function (formId, resp) {
        if(resp.message.paging){
            lastPagingData[formId] = resp.message.paging;
            $('#' + formId + ' #ticket-paging').html(createPaging(resp.message.paging));
            $('#ticket-total').html('<b>' +
                '<span class="TXT_TOTAL"></span>: ' +
                '<span class="bold c-red" id="ticket-total">' + resp.message.paging.totalResult + '</span>' +
                '</b>');
            $('.TXT_TOTAL').html(_config.MESSAGE.REPORT_OUTBOUND_TICKETS.TXT_TOTAL);
            //$('#download-excel').show();
        };

        var template = '<tr>' +
            '<td title="{0}">{0}</td>' +
            '<td title="{1}" class="text-center">{1}</td>' +
            '<td title="{2}" class="text-center">{2}</td>' +
            '<td title="{3}" class="text-center">{3}</td>' +
            '<td title="{4}" class="text-center">{4}</td>' +
            '<td title="{5}" class="text-center">{5}</td>' +
            '<td title="{6}">{6}</td>' +
            '<td title="{7}" class="text-center">{7}</td>' +
            '{8}' +
            '<td class="text-center"></td>' +
            '</tr>';

        var questions = resp.message.questions;
        var hTags = '';
        var inTags = '';

        _.each(_.keys(questions), function(key , i){
            hTags += '<th class="bgm-orange c-white text-center qHeader" id="'+key+'" data-header="'+ questions[key].content +'"> ' +
                '<div title="'+ questions[key].content +'">'+ questions[key].content +'</div>' +
                '</th>';
            hTags += '<th class="bgm-orange c-white text-center qHeader" id="'+key+'_note'+'" data-header="Ghi chú"> ' +
                '<span>Ghi chú</span> ' +
                '</th>';

            inTags += '<td class="qInput"></td>';
            inTags += '<td class="qInput"></td>';
        });

        $('.qHeader').remove();
        $(hTags).insertBefore($('.TXT_ACTION').parent());

        $('.qInput').remove();
        $(inTags).insertBefore($('#btn-search').parent());

        loadSHFields(formId);

        var rows = '';
        resp.message.data.forEach(function (el) {
            if (_.isEmpty(el)) return;
            var status = '';
            switch (el.status) {
                case 0:
                    status = ticketStatus.NOT_PROCESS;
                    break;
                case 1:
                    status = ticketStatus.PROCESSING;
                    break;
                case 2:
                    status = ticketStatus.COMPLETE;
                    break;
            }

            var updatedBy = el.ubdisplayName === null ? '' : el.ubdisplayName + " (" + el.ubName + ")";

            var qContent = '';
            _.each(_.keys(questions), function(key){
                var answer = '';
                var note = '';
                _.each(el.surveyresult, function(el2){
                    if(_.isEqual(key, el2.idQuestion.toString())){
                        _.each(questions[key].answers, function(el3){
                            if(!_.isUndefined(el.answerContent) && !_.isNull(el.answerContent) && _.isEqual(el2.answerContent.toString(), el3._id.toString())){
                                answer = el3.content;
                            };
                        });
                        if(!answer.length && !_.isUndefined(el.answerContent) && !_.isNull(el.answerContent) && el2.answerContent.length) answer = el2.answerContent;
                        note = el2.answerNote ? el2.answerNote : '';
                    };
                });
                qContent += '<td title="'+ answer +'">'+answer+'</td><td title="'+ note +'">'+note+'</td>';
            });

            rows += template.str(el.company,
                el.campain,
                el.agent,
                el.field_so_dien_thoai,
                status,
                moment(el.updated).format('HH:mm DD/MM/YYYY'),
                el.note,
                updatedBy,
                qContent
            );
        });

        setValueLastSearch();
        $('#' + formId + ' #ticket-body').html(rows);
        $('.selectpicker').selectpicker('refresh');
        $('.tag-select').trigger("chosen:updated");

        $('#'+formId + ' table tr th').each(function(){
            var index = $(this).closest('th').index();
            var dataId = $(this).attr('id');
            var isSelect = !($('#showHideFields').find('input[data-id="'+dataId+'"]').prop('checked') == false);
            displayColumn(index, isSelect);
        });
		
		window.MainContent.loadTooltip();
    };

    var updateView = function () {
        // resize chosen picker
        $(".chosen-container").each(function () {
            $(this).attr('style', 'width: 100%');
        });

        // Setup date range picker
        $('.daterangepicker').daterangepicker({
                autoUpdateInput: false,
                opens: "left",
                locale: {
                    format: 'DD/MM/YYYY',
                    cancelLabel: 'Clear'
                }
            })
            .on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            })
            .on('cancel.daterangepicker', function (ev, picker) {
                $(this).val('');
            });
    };

    return {
        init: function () {
            bindSocket(_socket);
            bindTextValue();
            updateView();
            setValueLastSearch();
            cascadeOption();
            bindClick();

            $('.multi-date-picker').datepicker({
                multidate: 2,
                multidateSeparator: ' - ',
                format: 'dd/mm/yyyy'
            });

            //queryFilter('frm-report-campaign-ticket', true);
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
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