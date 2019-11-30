/**
 * Created by sonth on 5/17/16.
 */
var DFT = function ($) {
    var notProcessLastSearch = {};
    var allTicketLastSearch = {};
    var pagingObject = {};
    var lastPagingData = {};

    var ticketStatus = {
        NOT_PROCESS: 'Chờ xử lý',
        PROCESSING: 'Đang xử lý',
        COMPLETE: 'Hoàn thành'
    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        var temp = [];
        _.each(_.allKeys(_config.MESSAGE.INCOMING), function (item) {
            var obj = $('.' + item);
            if (obj.prop('tagName')) {
                var index = obj.closest('th').index();
                obj.html(_config.MESSAGE.INCOMING[item]);
                temp[index] = '<li class="p-l-15 p-r-20"> ' +
                    '<div class="checkbox">' +
                    '<label> ' +
                    '<input type="checkbox" class="select-box column-display" data-index="' + index + '" checked>' +
                    '<i class="input-helper"></i>' +
                    '<a class="p-l-5 text-capitalize text-nowrap">' + _config.MESSAGE.INCOMING[item] + '</a>' +
                    '</label>' +
                    '</div>' +
                    '</li>';
            }
        });

        $('#showHideFields').append(temp.join(''));
    };

    var bindClick = function () {
        $('.multi-date-picker').datepicker({
            multidate: 2,
            multidateSeparator: ' - ',
            format: 'dd/mm/yyyy'
        });
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
        // Nhấn phím enter
        $(document).on('keyup', '.filter', function (e) {
            if (e.keyCode == 13) {
                var formId = $(this).closest('form').attr('id');
                queryFilter(formId);
            }
        });

        // Chuyển trang
        $(document).on('click', '.zpaging', function () {
            var formId = $(this).closest('form').attr('id');
            window.location.obj['page'] = $(this).attr('data-link');
            queryFilter(formId);
        });
        // Sửa dữ liệu trực tiếp trên giao diện
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
        // Sửa dữ liệu ticket trực tiếp trên giao diện
        $(document).on('change', '.inlineEditTicket', function(){
            var parent = $(this).closest('td');

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
//                console.log(122, value, str);

                showButton.find('span').html(str);
                showButton.css('display', 'block');
                showSelect.css('display', 'none');
            };

            var dataId = $(this).attr('data-id');
            var value = $(this).val();

            var url = 'inbound-chat?updateStatus=true&ticketId=' + dataId + '&status=' + value;
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

        // Thay đổi hiển thị của cột trên giao diện
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

        // Hiển thị lịc sử ticket
        $(document).on('click', '.btn-view-history', function(){
            $('.ticket-history-view').removeClass('hidden');
            $.get('/report-ticket-chat?queryThread=1&threadId=' + $(this).attr('threadId'), function(resp){
                var rThread = resp.data[0];
                var $content = $('.ticket-transcript');
                $('.ticket-transcript .chat-message').remove();
                $('.ticket-transcript .chat-message-bubble').remove();
                _.each(rThread.chatlogs, function(msgObj){
                    var $time = {};
                    var customClass = '';
                    var customerColor = 'c-black';
                    if (msgObj.sentFrom.from == 0){
                        //agent chat
                        $time = _.Tags([{tag: 'div', attr: {class: 'msg-time ' + customerColor}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' (' + msgObj.sentFrom.id.displayName + ' )'}]);
                        customClass = 'chat-message chat-message-self';
                    }
                    else if (msgObj.sentFrom.from == 2){
                        customClass = 'm-b-15 p-l-5';
                    }
                    else{
                        //customer chat
                        var customerName = rThread.clientId.split('-')[0];
                        $time = _.Tags([{tag: 'div', attr: {class: 'msg-time ' + customerColor}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' (' + customerName + ' )'}]);
                        customClass = 'chat-message';
                    }
                    if (msgObj.attachment && msgObj.attachment.length > 0){
                        var _ext = ['jpg', 'png', 'bmp'];
                        var ext = msgObj.attachment[0]['fileName'].split('.')[1];
                        if ( _.filter(_ext, function(obj){
                            return ext.indexOf(obj) >= 0;
                        }).length > 0){
                            $content.append(_.Tags([{tag: 'div', attr: {class: customClass},
                                childs: [
                                    {tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor},
                                        childs: [
                                            {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                            {tag: 'div', attr: {class: 'msg-preview'},
                                                childs: [
                                                    {tag: 'img', attr: {src: window.location.protocol + '//' + window.location.hostname + ':' + _config['core-app'].port + msgObj.attachment[0]['url']}, alt: msgObj.attachment[0]['fileName']}
                                                ]
                                            }
                                        ]
                                    }
                                ]}
                            ]));
                        }
                        else{
                            $content.append(_.Tags([{tag: 'div', attr: {class: customClass},
                                childs: [
                                    {tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor},
                                        childs: [
                                            {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                            {tag: 'div', attr: {class: 'msg-preview'},
                                                childs: [
                                                    {tag: 'i', attr: {class: 'zmdi zmdi-file'}},
                                                    {tag: 'a', attr: {class: 'm-l-10', href: window.location.protocol + '//' + window.location.hostname + ':' + _config['core-app'].port + msgObj.attachment[0]['url'], target: '_blank'}, content: msgObj.attachment[0]['fileName']}
                                                ]
                                            }
                                        ]
                                    }
                                ]}
                            ]));
                        }
                    }
                    else{
                        if (msgObj.sentFrom.from != 2){
                            $content.append(_.Tags([{tag: 'div', attr: {class: customClass}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor}, content: $time + msgObj.content}]}]));
                        }
                        else{
                            $content.append(_.Tags([{tag: 'div', attr: {class: customClass}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor}, childs: [{tag: 'i', attr: {class: 'f-12'}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' - ' + msgObj.content}]}]}]));
                        }
                    }
                    $content.scrollTop($content[0].scrollHeight);
                });
            });
        });

        $(document).on('click', function (e) {
            $('.ticket-transcript .chat-message').remove();
            $('.ticket-transcript .chat-message-bubble').remove();
            var btns = $.map($('.btn-view-history'), function (n, i) {
                return $(n);
            });

            async.eachSeries(btns, function(btn, cb){
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (btn.is(e.target) || btn.has(e.target).length !== 0) {
                    $('.ticket-history-view').removeClass('hidden');
                    clickViewHistory(btn);
                    cb('click vao nut view');
                }
                else{
                    if ($('.ticket-history-view').has(e.target).length === 0){
                        $('.ticket-history-view').addClass('hidden');
                    }
                    cb();
                }
            }, function(err, resp){

            });

        });
    };
    // Lấy dữ liệu lọc và truy vấn server
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
        var custom = '&formId=' + formId + '&dt=' + dateTime + '&ignoreSearch=' + (ignoreSearch ? 1: 0) ;
        var url = (newUrl(window.location.hash, filter) + sort + paging + custom).replace('#', '');
        requestTickets(formId, dateTime, url, ignoreSearch);
    };

    // Truy vấn dữ liệu ticket
    var requestTickets = function (formId, dateTime, url, ignoreSearch) {
        if (!_.has(pagingObject, formId)) pagingObject[formId] = [];
        pagingObject[formId].push(dateTime);

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
                loadData(formId, resp);
            }
        });
    };

    // Hiển thị dữ liệu lên giao diện
    var loadData = function (formId, resp) {
        var template = '<tr>' +
            '<td>{0}</td>' +
            '<td>{1}</td>' +
            '<td>{2}</td>' +
            '<td>{3}</td>' +
            '<td>{4}</td>' +
            '<td>{5}</td>' +
            '<td>{6}</td>' +
            '<td>{7}</td>' +
            '<td class="text-center">{8}</td>' +
            '</tr>';

        var activeTDTemplate =
            '<a class="p-t-3 btn-flat-bg btn-view-history" ' +
            'role="button"' +
            'data-toggle="popover"' +
            'threadId="{0}" ' +
            'data-toggle="tooltip"' +
            'data-placement="top" data-original-title="Xem chi tiết">' +
            '<i class="zmdi zmdi-eye c-green f-17"></i></a>';

        var rows = '';
        resp.message.forEach(function (el) {
            console.log(el)
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
            rows += template.str(el.company.name,
                _.isEmpty(el.ticketReasonCategory) ? '' : el.ticketReasonCategory,
                el.field_so_dien_thoai,
                status,
                moment(el.deadline).format('HH:mm DD/MM/YYYY'),
                moment(el.updated).format('HH:mm DD/MM/YYYY'),
                el.updateBy ? el.updateBy : '',
                el.note,
                activeTDTemplate.str(el.threadId)
            );
        });

        setValueLastSearch();
        $('#' + formId + ' #ticket-body').html(rows);
        $('#' + formId + ' #ticket-paging').html(createPaging(resp.paging));
		window.MainContent.loadTooltip();
    };

    // Hiển thị lại tiêu chí đã lọc
    var setValueLastSearch = function () {
        _.each($('#tab-not-process-ticket .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = $(el).val();
            notProcessLastSearch[name] = value;
        });

        _.each($('#tab-all-process-ticket .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = $(el).val();
            allTicketLastSearch[name] = value;
        });
    };

    var reverseSearchValue = function () {
        _.each($('#tab-not-process-ticket .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = notProcessLastSearch[name] ? notProcessLastSearch[name] : '';
            $(el).val(value);
        });

        _.each($('#tab-all-process-ticket .searchColumn'), function (el) {
            var name = $(el).attr('name');
            var value = allTicketLastSearch[name] ? allTicketLastSearch[name] : '';
            $(el).val(value);
        });


        $('.selectpicker').selectpicker('refresh');
    };

    var reversePagingData = function (formId) {
        if (!_.has(lastPagingData, formId) || _.isEmpty(lastPagingData[formId])) return '';
        $('#' + formId + ' #ticket-paging').html(createPaging(lastPagingData[formId]));
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

    // Hiển thị lịch sử ticket
    var clickViewHistory = function(sender){
        $('.ticket-history-view').removeClass('hidden');
        $.get('/report-ticket-chat?queryThread=1&threadId=' + sender.attr('threadId'), function(resp){
            var rThread = resp.data[0];
            var $content = $('.ticket-transcript');
            $('.ticket-transcript .chat-message').remove();
            $('.ticket-transcript .chat-message-bubble').remove();
            _.each(rThread.chatlogs, function(msgObj){
                var $time = {};
                var customClass = '';
                var customerColor = 'c-black';
                if (msgObj.sentFrom.from == 0){
                    //agent chat
                    $time = _.Tags([{tag: 'div', attr: {class: 'msg-time ' + customerColor}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' (' + msgObj.sentFrom.id.displayName + ' )'}]);
                    customClass = 'chat-message chat-message-self';
                }
                else if (msgObj.sentFrom.from == 2){
                    customClass = 'm-b-15 p-l-5';
                }
                else{
                    //customer chat
                    var customerName = rThread.clientId.split('-')[0];
                    $time = _.Tags([{tag: 'div', attr: {class: 'msg-time ' + customerColor}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' (' + customerName + ' )'}]);
                    customClass = 'chat-message';
                }
                if (msgObj.attachment && msgObj.attachment.length > 0){
                    var _ext = ['jpg', 'png', 'bmp'];
                    var ext = msgObj.attachment[0]['fileName'].split('.')[1];
                    if ( _.filter(_ext, function(obj){
                        return ext.indexOf(obj) >= 0;
                    }).length > 0){
                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass},
                            childs: [
                                {tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor},
                                    childs: [
                                        {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                        {tag: 'div', attr: {class: 'msg-preview'},
                                            childs: [
                                                {tag: 'img', attr: {src: window.location.protocol + '//' + window.location.hostname + ':' + _config['core-app'].port + msgObj.attachment[0]['url']}, alt: msgObj.attachment[0]['fileName']}
                                            ]
                                        }
                                    ]
                                }
                            ]}
                        ]));
                    }
                    else{
                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass},
                            childs: [
                                {tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor},
                                    childs: [
                                        {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                        {tag: 'div', attr: {class: 'msg-preview'},
                                            childs: [
                                                {tag: 'i', attr: {class: 'zmdi zmdi-file'}},
                                                {tag: 'a', attr: {class: 'm-l-10', href: window.location.protocol + '//' + window.location.hostname + ':' + _config['core-app'].port + msgObj.attachment[0]['url'], target: '_blank'}, content: msgObj.attachment[0]['fileName']}
                                            ]
                                        }
                                    ]
                                }
                            ]}
                        ]));
                    }
                }
                else{
                    if (msgObj.sentFrom.from != 2){
                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor}, content: $time + msgObj.content}]}]));
                    }
                    else{
                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor}, childs: [{tag: 'i', attr: {class: 'f-12'}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' - ' + msgObj.content}]}]}]));
                    }
                }
                $content.scrollTop($content[0].scrollHeight);
            });
        });
    };

    return {
        init: function () {
            bindTextValue();
            bindClick();
            //queryFilter('frm-all-process-ticket', true);
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            notProcessLastSearch = {};
            allTicketLastSearch = {};
            pagingObject = {};
            lastPagingData = {};

            $(document).off('click', '.sort');
            $(document).off('click', '#btn-search');
            $(document).off('click', '.zmdi-refresh');
            $(document).off('keyup', '.filter');
            $(document).off('click', '.zpaging');
            $(document).off('click', '.inline-edit-button');
            $(document).off('change', '.inlineEditTicket');
            $(document).off('change', '.column-display');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);