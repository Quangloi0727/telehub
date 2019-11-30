/**
 * Created by luongvanlam on 4/25/16.
 */
var DFT = function ($) {
    var pagingObject = [];
    var inboundLastSearch = {};
    var outboundLastSearch = {};
    var lastPagingData = {};
    var _inbound = {};
    var _outbound = {};
    var notifDelay = 3600;

    var ticketStatus = {
        NOT_PROCESS: 'Chờ xử lý',
        PROCESSING: 'Đang xử lý',
        COMPLETE: 'Hoàn thành'
    };

    // Cấu hình nhận dữ liệu socket từ server
    var bindSocket = function (client) {
        // Dữ liệu phân trang của outbound
        client.on('responseTicketOutboundPagingData', function (resp) {
            var index =  _.indexOf(pagingObject[resp.formId], Number(resp.dt));
            if (_.has(pagingObject, resp.formId) && index >= 0) {
                pagingObject[resp.formId] = _.reject(pagingObject[resp.formId], function(el, i){
                    return i <= index;
                });

                if (resp.code == 200) {
                    lastPagingData[resp.formId] = resp.message;
                    $('#' + resp.formId + ' #ticket-paging').html(createPaging(resp.message));
                    $('#' + resp.formId + ' #ticket-total').html('<b>' +
                        '<span>Tổng</span>: ' +
                        '<span class="bold c-red">' + resp.message.totalResult + '</span>' +
                        '</b>');
                } else {
                    $('#' + resp.formId + ' #ticket-paging').html('');
                    $('#' + resp.formId + ' #ticket-total').html('');
                }
            }
        });

        // Dữ liệu phân trang của inbound
        client.on('responseTicketInboundPagingData', function (resp) {
            var index = _.indexOf(pagingObject[resp.formId], Number(resp.dt));
            if (_.has(pagingObject, resp.formId) && index >= 0) {
                pagingObject[resp.formId] = _.reject(pagingObject[resp.formId], function (el, i) {
                    return i <= index;
                });

                if (resp.code == 200) {
                    lastPagingData[resp.formId] = resp.message;
                    $('#' + resp.formId + ' #ticket-paging').html(createPaging(resp.message));
                    $('#' + resp.formId + ' #ticket-total').html('<b>' +
                        '<span>Tổng</span>: ' +
                        '<span class="bold c-red">' + resp.message.totalResult + '</span>' +
                        '</b>');
                } else {
                    $('#' + resp.formId + ' #ticket-paging').html('');
                    $('#' + resp.formId + ' #ticket-total').html('');
                }
            }
        });
    };

    // Sự kiện click
    var bindClick = function () {
        // Nhấn phím enter khi tìm kiếm
        $(document).on('keyup', '.filter', function(e){
            if (e.keyCode == 13){
                var formId = $(this).closest('form').attr('id');
                queryFilter(formId);
            }
        });

        // Thay đổi tab inbound/outbound
        $(document).on('click', '.ticketTab', function(){
            var dataId = $(this).attr('data-id');
            var temp = [];
            var formId = dataId === '1' ? '#tab-inbound': '#tab-outbound';

            _.each($(formId + ' th'), function(el, index){
                var text = $(el).find('span').text();
                var index = $(el).index();
                var checked = $(el).css('display') == 'none' ? '' : 'checked';
                temp[index] = createColumnDisplay(index, text, checked);
            });

            $('#showHideFields').html(temp.join(''));
        });

        // Thay đổi danh sách các cột hiển thị trên giao diện
        $(document).on('change', '.column-display', function (e) {
            var dataIndex = $(this).attr('data-index');
            var checked = $(this).is(":checked");
            var formId = $('#showHideFields').attr('formId');

            _.each($('#' + formId + ' th'), function (el) {
                var index = $(el).index();
                if (index == dataIndex) {
                    if (checked) {
                        $(el).show();
                    } else {
                        $(el).hide();
                    }
                }
            });

            _.each($('#' + formId + ' td'), function (el) {
                var index = $(el).index();
                if (index == dataIndex) {
                    if (checked) {
                        $(el).show();
                    } else {
                        $(el).hide();
                    }
                }
            })
        })

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

        // Button Lọc/Tìm kiếm
        $(document).on('click', '#btn-search', function () {
            var formId = $(this).closest('form').attr('id');
            queryFilter(formId);
        });

        // Chọn chuyển trang
        $(document).on('click', '.zpaging', function () {
            var formId = $(this).closest('form').attr('id');
            window.location.obj['page'] = $(this).attr('data-link');
            queryFilter(formId);
        });

        // Cập nhật dữ liệu trực tiếp trên giao diện
        $(document).on('click', '.inline-edit-button', function () {
            var parent = $(this).closest('td');

            var allInlineEditTd = $('.inlineEditButton');
            _.each(allInlineEditTd, function(item){
                $(item).find('.showButton').css('display', 'block');
                $(item).find('.showSelect').css('display', 'none');
            });

            parent.find('.showButton').css('display', 'none');
            parent.find('.showSelect').css('display', 'block');
        });

        // Cập nhật dữ liệu ticket trực tiếp trên giao diện
        $(document).on('change', '.inlineEditTicket', function(){
            var parent = $(this).closest('td');
            var formId = $(this).closest('form').attr('id');

            var updateTicketStatus = function(value){
                var showButton = parent.find('.showButton');
                var showSelect = parent.find('.showSelect');

                value = _.isString(value) ? parseInt(value) : value;

                var str = ''
                switch (value){
                    case 1:
                        str = ticketStatus.PROCESSING;
                        break;
                    case 2:
                        str = ticketStatus.COMPLETE;
                        break;
                    default:
                        str = ticketStatus.NOT_PROCESS;
                        break;
                }

                showButton.find('span').html(str);
                showButton.css('display', 'block');
                showSelect.css('display', 'none');
            };

            var dataId = $(this).attr('data-id');
            var value = $(this).val();

            var url = 'following?updateStatus=true&ticketId=' + dataId + '&status=' + value + '&formId=' + formId;
            _AjaxData(url, 'GET', null, function (resp) {
                var title = '';
                var message = '';
                var type = '';
                if (resp.code == 500){
                    title = 'Đã có lỗi xảy ra';
                    message = resp.message;
                    type = 'error';
                }else{
                    title = 'Cập nhật dữ liệu thành công';
                    message = '';
                    type = 'success';
                }

                swal({
                    title: title,
                    text: message,
                    type: type,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Xác nhận!",
                    closeOnConfirm: true
                }, function(){
                    updateTicketStatus(value);
                });
            });
        });

        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        })
    };

    // Lấy dữ liệu tìm kiếm và truy vấn server
    var queryFilter = function (formId, ignoreSearch) {
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
        var custom = '&socketId=' + _socket.socket.sessionid + '&formId=' + formId + '&dt=' + dateTime + '&ignoreSearch=' + (ignoreSearch ? 1: 0);
        var url = (newUrl(window.location.hash, filter) + sort + paging + custom).replace('#', '');
        requestTickets(formId, dateTime, url, ignoreSearch);
    };

    // Hiển thị tên cột dữ liệu theo file config
    var bindTextValue = function () {
        var ibc = [];
        var obc = [];

        _.each(_.allKeys(_config.MESSAGE.INCOMING), function (item) {
            var obj = $('.' + item);
            if (obj.prop('tagName')) {
                var index = obj.closest('th').index();
                obj.html(_config.MESSAGE.INCOMING[item]);
                ibc[index] = createColumnDisplay(index, _config.MESSAGE.INCOMING[item], 'checked');
            }
        });

        _.each(_.allKeys(_config.MESSAGE.OUTCAMPAIGN), function (item) {
            var obj = $('.' + item);
            if (obj.prop('tagName')) {
                var index = obj.closest('th').index();
                obj.html(_config.MESSAGE.OUTCAMPAIGN[item]);
                obc[index] = createColumnDisplay(index, _config.MESSAGE.OUTCAMPAIGN[item], 'checked');
            }
        });

        _.each($('.tab-pane'), function(el){
            if ($(el).hasClass('active')){
                if ($(el).attr('id') === 'tab-inbound'){
                    $('#showHideFields').html(ibc.join(''));
                    $('#showHideFields').attr('formId', 'frm-inbound');
                }else{
                    $('#showHideFields').html(obc.join(''));
                    $('#showHideFields').attr('formId', 'frm-outbound');
                }
            }
        });
    };

    // Tạo cột dữ liệu
    var createColumnDisplay = function(dataIndex, text, checked){
        return '<li class="p-l-15 p-r-20"> ' +
            '<div class="checkbox">' +
            '<label> ' +
            '<input type="checkbox" class="select-box column-display" data-index="' + dataIndex + '" '+ checked +'>' +
            '<i class="input-helper"></i>' +
            '<a class="p-l-5 text-capitalize text-nowrap">' + text + '</a>' +
            '</label>' +
            '</div>' +
            '</li>';
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
                    text: 'Không tìm thấy kết quả với khoá tìm kiếm',
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Xác nhận!",
                    closeOnConfirm: true
                }, function () {
                    reverseSearchValue();
                    reversePagingData(formId);
                });
            } else {
                window.lastUrl[window.lastUrl.length - 1] = url;
                loadData(formId, resp);
            }
        });
    };

    // Tạo phân trang
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

    // Load dữ liệu lên màn hình
    var loadData = function(formId, resp){
        if (formId === 'frm-inbound'){
            loadInboundTickets('frm-inbound', resp);
        }else{
            loadOutboundTickets('frm-outbound', resp);
        }
    };

    // Load dữ liệu gọi vào
    var loadInboundTickets = function (formId, resp) {
        _.each(_inbound, function(t){
            if (_.has(t, 'process')){
                clearInterval(t['process']);
            }
            if (_.has(t, 'over')){
                clearInterval(t['over']);
            }
        });
        _inbound = {};

        //var template = '<tr id={11}>' +
        //    '<td>{0}</td>' +
        //    '<td>{1}</td>' +
        //    '<td>{2}</td>' +
        //    '<td class="inlineEditButton">' +
        //    '<div class="showButton"><span>{3}</span>{9}</div>' +
        //    '<div class="showSelect" style="display: none;">{10}</div>' +
        //    '</td>' +
        //    '<td>{4}</td>' +
        //    '<td>{5}</td>' +
        //    '<td>{6}</td>' +
        //    '<td>{7}</td>' +
        //    '<td class="text-center">{8}</td>' +
        //    '</tr>';

        var activeTDTemplate =
            '<a class="p-t-3 btn-flat-bg" ' +
            'href="#ticket-edit?ticketID={0}" ' +
            'data-toggle="tooltip"' +
            'data-placement="top" data-original-title="Sửa Ticket">' +
            '<i class="zmdi zmdi-edit c-green f-17"></i></a>' +
            '<a class="p-t-3 btn-flat-bg" ' +
            'data-toggle="tooltip" ' +
            'data-number="{1}"' +
            'role="button" ' +
            'data-placement="top"' +
            'data-original-title="Click to call">' +
            '<i class="zmdi zmdi-phone-in-talk c-green f-17 "></i></a>';

        var rows = '';
        resp.message.forEach(function (el) {
            if (_.isEmpty(el)) return;
            var warnClass = "";
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

            var inlineEditButton =
                '<a class="p-t-3 btn-flat-bg inline-edit-button" ' +
                'data-id="' + el._id + '"' +
                'data-toggle="tooltip"' +
                'data-placement="top" data-original-title="Sửa Ticket">' +
                '<i class="zmdi zmdi-edit c-green f-17"></i></a>';

            var inlineEditSelectPicker =
                '<select class="selectpicker inlineEditTicket" data-id="' + el._id + '">' +
                '<option value="0" ' + (el.status == 0 ? 'selected' : '') + '>'+ ticketStatus.NOT_PROCESS +'</option>' +
                '<option value="1" ' + (el.status == 1 ? 'selected' : '') + '>'+ ticketStatus.PROCESSING +'</option>' +
                '<option value="2" ' + (el.status == 2 ? 'selected' : '') + '>'+ ticketStatus.COMPLETE +'</option>' +
                '</select>';

            var currentColor = 'white';

            //if (el.deadline){
            //    var deadlineTime = moment(el.deadline).valueOf() - (new Date()).getTime();
            //    if (deadlineTime < 0){
            //        currentColor = 'red';
            //    }else if (deadlineTime >= 0 && deadlineTime < 36000000){
            //        currentColor = 'yellow';
            //    }
            //}

            if (!_.isNull(el.deadline)){
                var minutesEnd = moment.duration(moment(el.deadline).diff(moment(new Date()))).asMinutes();
                if (minutesEnd > 0){
                    currentColor = 'yellow';
                    _inbound[el._id] = {};
                    if (minutesEnd * 60 > notifDelay){
                        //chua den han xu ly va chua den luc canh bao
                        _inbound[el._id]['process'] = setTimeout(function(){
                            $('#' + formId).find('#' + el._id).addClass('warning-deadline');
                        }, (minutesEnd * 60 - notifDelay) * 1000);
                    }
                    else{
                        //chua den han xu ly nhung da den luc canh bao
                        warnClass = "warning-deadline";
                    }
                    //qua han
                    _inbound[el._id]['over'] = setTimeout(function(){
                        var self = $('#' + formId).find('#' + el._id).addClass('warning-deadline');
                        self.removeClass('warning-deadline');
                        self.addClass('over-deadline');
                    }, minutesEnd * 60 * 1000);
                }
                else{
                    currentColor = 'red';
                    warnClass = "over-deadline";
                }
            }

            var ticketCategory = el.ticketReasonCategory ? el.ticketReasonCategory : '';
            var ticketReason = el.ticketReason ? ' - ' + el.ticketReason : '';
            var ticketSubReason = el.ticketSubreason ? ' - ' + el.ticketSubreason : '';

            var template = '<tr class={11} >' +
                '<td title="{0}">{0}</td>' +
                '<td title="{1}">{1}</td>' +
                '<td title="{2}">{2}</td>' +
                '<td class="inlineEditButton">' +
                '<div class="showButton"><span>{3}</span>{9}</div>' +
                '<div class="showSelect" style="display: none;">{10}</div>' +
                '</td>' +
                '<td title="{4}">{4}</td>' +
                '<td title="{5}">{5}</td>' +
                '<td title="{6}">{6}</td>' +
                '<td title="{7}">{7}</td>' +
                '<td class="text-center">{8}</td>' +
                '</tr>';

            rows += template.str(el.company,
                ticketCategory + ticketReason + ticketSubReason,
                el.field_so_dien_thoai,
                status,
                moment(el.deadline).format('HH:mm DD/MM/YYYY'),
                moment(el.updated).format('HH:mm DD/MM/YYYY'),
                el.updateBy ? el.updateBy : '',
                el.note,
                activeTDTemplate.str(el._id, el.field_so_dien_thoai),
                inlineEditButton,
                inlineEditSelectPicker,
                warnClass
            );
        });

        setValueLastSearch();
        $('#' + formId + ' #ticket-body').html(rows);
        $('.inlineEditTicket').selectpicker('refresh');
		
		window.MainContent.loadTooltip();
    };


    // Load dữ liệu gọi ra
    var loadOutboundTickets = function (formId, resp) {
        _.each(_outbound, function(t){
            if (_.has(t, 'process')){
                clearInterval(t['process']);
            }
            if (_.has(t, 'over')){
                clearInterval(t['over']);
            }
        });
        _outbound = {};

        //var template = '<tr id={10}>' +
        //    '<td>{0}</td>' +
        //    '<td>{1}</td>' +
        //    '<td class="inlineEditButton">' +
        //    '<div class="showButton"><span>{2}</span>{8}</div>' +
        //    '<div class="showSelect" style="display: none;">{9}</div>' +
        //    '</td>' +
        //    '<td>{3}</td>' +
        //    '<td>{4}</td>' +
        //    '<td>{5}</td>' +
        //    '<td>{6}</td>' +
        //    '<td class="text-center">{7}</td>' +
        //    '</tr>';

        var activeTDTemplate =
            '<a class="p-t-3 btn-flat-bg" ' +
            'href="#ticket-edit?ticketID={0}" ' +
            'data-toggle="tooltip"' +
            'data-placement="top" data-original-title="Sửa Ticket">' +
            '<i class="zmdi zmdi-edit c-green f-17"></i></a>' +

            '<a class="p-t-3 btn-flat-bg" ' +
            'data-toggle="tooltip" ' +
            'data-number="{1}"' +
            'role="button" ' +
            'data-placement="top"' +
            'data-original-title="Click to call">' +
            '<i class="zmdi zmdi-phone-in-talk c-green f-17 "></i></a>';

        var rows = '';
        resp.message.forEach(function (el) {
            if (_.isEmpty(el)) return;
            var warnClass = "";

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

            var inlineEditButton =
                '<a class="p-t-3 btn-flat-bg inline-edit-button" ' +
                'data-id="' + el._id + '"' +
                'data-toggle="tooltip"' +
                'data-placement="top" data-original-title="Sửa Ticket">' +
                '<i class="zmdi zmdi-edit c-green f-17"></i></a>';

            var inlineEditSelectPicker =
                '<select class="selectpicker inlineEditTicket" data-id="' + el._id + '">' +
                '<option value="0" ' + (el.status == 0 ? 'selected' : '') + '>'+ ticketStatus.NOT_PROCESS +'</option>' +
                '<option value="1" ' + (el.status == 1 ? 'selected' : '') + '>'+ ticketStatus.PROCESSING +'</option>' +
                '<option value="2" ' + (el.status == 2 ? 'selected' : '') + '>'+ ticketStatus.COMPLETE +'</option>' +
                '</select>';

            var currentColor = 'white';

            //if (el.deadline){
            //    var deadlineTime = moment(el.deadline).valueOf() - (new Date()).getTime();
            //    if (deadlineTime < 0){
            //        currentColor = 'red';
            //    }else if (deadlineTime >= 0 && deadlineTime < 36000000){
            //        currentColor = 'yellow';
            //    }
            //}

            if (!_.isNull(el.deadline)){
                var minutesEnd = moment.duration(moment(el.deadline).diff(moment(new Date()))).asMinutes();
                if (minutesEnd > 0){
                    currentColor = 'yellow';
                    _outbound[el._id] = {};
                    if (minutesEnd * 60 > notifDelay){
                        //chua den han xu ly va chua den luc canh bao
                        _outbound[el._id]['process'] = setTimeout(function(){
                            $('#' + formId).find('#' + el._id).addClass('warning-deadline');
                        }, (minutesEnd * 60 - notifDelay) * 1000);
                    }
                    else{
                        //chua den han xu ly nhung da den luc canh bao
                        warnClass = "warning-deadline";
                    }
                    //qua han
                    _outbound[el._id]['over'] = setTimeout(function(){
                        var self = $('#' + formId).find('#' + el._id).addClass('warning-deadline');
                        self.removeClass('warning-deadline');
                        self.addClass('over-deadline');
                    }, minutesEnd * 60 * 1000);
                }
                else{
                    currentColor = 'red';
                    warnClass = "over-deadline";
                }
            }

            var ticketCategory = el.ticketReasonCategory ? el.ticketReasonCategory : '';
            var ticketReason = el.ticketReason ? ' - ' + el.ticketReason : '';
            var ticketSubReason = el.ticketSubreason ? ' - ' + el.ticketSubreason : '';

            var template = '<tr class={10}>' +
                '<td>{0}</td>' +
                '<td>{1}</td>' +
                '<td title="{11}">{11}</td>' +
                '<td class="inlineEditButton">' +
                '<div class="showButton"><span>{2}</span>{8}</div>' +
                '<div class="showSelect" style="display: none;">{9}</div>' +
                '</td>' +
                '<td>{3}</td>' +
                '<td>{4}</td>' +
                '<td>{5}</td>' +
                '<td>{6}</td>' +
                '<td class="text-center">{7}</td>' +
                '</tr>';

            rows += template.str(el.company,
                el.campain,
                status,
                el.field_so_dien_thoai,
                moment(el.deadline).format('HH:mm DD/MM/YYYY'),
                moment(el.updated).format('HH:mm DD/MM/YYYY'),
                el.updateBy ? el.updateBy : '',
                activeTDTemplate.str(el._id, el.field_so_dien_thoai),
                inlineEditButton,
                inlineEditSelectPicker,
                warnClass,
                ticketCategory + ticketReason + ticketSubReason
            );
        });

        setValueLastSearch();
        $('#' + formId + ' #ticket-body').html(rows);
        $('.selectpicker').selectpicker('refresh');
    };

    // Đưa dữ liệu tiêu chí tìm kiếm lên giao diện
    var setValueLastSearch = function () {
        _.each($('#frm-inbound .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = $(el).val();
            inboundLastSearch[name] = value;
        });

        _.each($('#frm-outbound .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = $(el).val();
            outboundLastSearch[name] = value;
        });
    };

    var reverseSearchValue = function () {
        _.each($('#tab-inbound .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = inboundLastSearch[name] ? inboundLastSearch[name] : '';
            $(el).val(value);
        });

        _.each($('#tab-outbound .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = outboundLastSearch[name] ? outboundLastSearch[name] : '';
            $(el).val(value);
        });


        $('.selectpicker').selectpicker('refresh');
    };

    var reversePagingData = function(formId){
        if (!_.has(lastPagingData, formId) || _.isEmpty(lastPagingData[formId])) return '';
        $('#' + formId + ' #ticket-paging').html(createPaging(lastPagingData[formId]));
    };

    // Tạo màn hình chờ khi truy vấn dữ liệu
    var createLoadingPaging = function (formId) {
        var htmlCode = '<div class="paginate text-center">' +
            '<ul class="pagination">' +
            '<li>' +
            '<img src="assets/images/loading.gif"/>'+
            '</div> ' +
            '</li>' +
            '</ul></div>';
        $('#' + formId + ' #ticket-paging').html(htmlCode);
    };

    // Lấy dữ liệu tìm kiếm từ url
    var getUrlParams = function(url){
        var obj = {};
        for (var i, o = /\+/g, a = /([^&=]+)=?([^&]*)/g, r = function(e) {
            return decodeURIComponent(e.replace(o, " "))
        }, c = url.split("?")[1]; i = a.exec(c);) {

            obj[r(i[1])] = r(i[2]);
        }
        delete obj.undefined;
        return obj;
    }

    return {
        init: function () {
            bindTextValue();
            bindClick();
            bindSocket(_socket);

            // Lấy dữ liệu cấu hình cảnh báo của user và hiển thị dữ liệu ticket
            $.get('/users?_id=' + user, function(resp){
                if (resp.length > 0){
                    notifDelay = Number(resp[0].notifDelay);

                    var obj = {};
                    if(window.lastUrl[0].split('?')[0].replace('#', '') == window.location.hash.split('?')[0].replace('#', '')){
                        obj = getUrlParams(window.lastUrl[0]);
                        _.each(_.keys(obj), function(el){
                            $('#'+ obj['formId']).find('[name='+el+']').val(obj[el]);
                        });
                        if(_.has(obj, 'page')) window.location.obj['page'] = obj['page'];
                        $('.selectpicker').selectpicker('refresh');

                        if(_.isEqual(obj['formId'], 'frm-outbound')){
                            $('.TXT_CUSTOMER_RELATE_TICKET').trigger('click');
                        }
                    }

                    if(obj['formId'] == 'frm-outbound'){
                        queryFilter('frm-inbound', true);
                        queryFilter('frm-outbound', true);
                    }else {
                        queryFilter('frm-outbound', true);
                        queryFilter('frm-inbound', true);
                    }
                }
            });

            var queryString = '?reload=' + new Date().getTime();
            $('head link[rel="stylesheet"]').each(function () {
                var hrefArr = this.href.split('/');
                if (hrefArr[hrefArr.length - 1] == 'style.css' && hrefArr[hrefArr.length - 2] == 'css'){
                    this.href = this.href.replace(/\?.*|$/, queryString);
                }
            });

            $('.multi-date-picker').datepicker({
                multidate: 2,
                multidateSeparator: ' - ',
                format: 'dd/mm/yyyy'
            });
        },
        uncut : function(){
            // Disable sự kiện khi đóng trang
            pagingObject = [];
            inboundLastSearch = {};
            outboundLastSearch = {};
            lastPagingData = {};
            $(document).off('keyup', '.filter');
            $(document).off('click', '.ticketTab');
            $(document).off('change', '.column-display');
            $(document).off('click', '.sort');
            $(document).off('click', '#btn-search');
            $(document).off('click', '.zpaging');
            $(document).off('click', '.inline-edit-button');
            $(document).off('change', '.inlineEditTicket');
            $(document).off('click', '.zmdi-refresh');
            delete _socket.$events['responseTicketInboundPagingData'];
            delete _socket.$events['responseTicketOutboundPagingData'];
        }
    };
}(jQuery);