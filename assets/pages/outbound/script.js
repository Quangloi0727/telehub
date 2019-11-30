/**
 * Created by sonth
 */
var DFT = function ($) {
    var notProcessLastSearch = {};
    var allTicketLastSearch = {};
    var pagingObject = {};
    var lastPagingData = {};
    var makeCallData = {};

    var ticketStatus = {
        NOT_PROCESS: 'Chờ xử lý',
        PROCESSING: 'Đang xử lý',
        COMPLETE: 'Hoàn thành'
    };

    var bindSocket = function (client) {
        // Nhận dữ liệu phân trang từ server
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

        client.on('getOrderStatus', function(data) {
			if (data && data.status) {
				$('#canGetOrder').bootstrapToggle('on');
            } else {
				$('#canGetOrder').bootstrapToggle('off');
            }
		});
    };

    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        var temp = [];
        _.each(_.allKeys(_config.MESSAGE.OUTCAMPAIGN), function (item) {
            var obj = $('.' + item);
            if (obj.prop('tagName')) {
                var index = obj.closest('th').index();
                obj.html(_config.MESSAGE.OUTCAMPAIGN[item]);
                temp[index] = '<li class="p-l-15 p-r-20"> ' +
                    '<div class="checkbox">' +
                    '<label> ' +
                    '<input type="checkbox" class="select-box column-display" data-index="' + index + '" checked>' +
                    '<i class="input-helper"></i>' +
                    '<a class="p-l-5 text-capitalize text-nowrap">' + _config.MESSAGE.OUTCAMPAIGN[item] + '</a>' +
                    '</label>' +
                    '</div>' +
                    '</li>';
            }
        });

        $('#showHideFields').append(temp.join(''));
    };

    var bindClick = function () {
        $(document).on('change', '#tab-not-process-ticket .filter #company', function (e) {
            //var companyId = $(this).val();
            //var opt = '';
            //company.forEach(function (el) {
            //    if (el._id == companyId) {
            //        opt = '<option selected value="">- Chọn -</option>';
            //        el.campain.forEach(function (campain) {
            //            opt += '<option value="' + campain._id + '">' + campain.name + '</option>';
            //        });
            //    }
            //});
            //
            //$('#tab-not-process-ticket #campain').html(opt);
            //$('.selectpicker').selectpicker('refresh');
        });

        $(document).on('change', '#tab-all-ticket .filter #company', function (e) {
            //var companyId = $(this).val();
            //var opt = '';
            //company.forEach(function (el) {
            //    if (el._id == companyId) {
            //        opt = '<option selected value="0">- Chọn -</option>';
            //        el.campain.forEach(function (campain) {
            //            opt += '<option value="' + campain._id + '">' + campain.name + '</option>';
            //        });
            //    }
            //});
            //
            //$('#tab-all-ticket #campain').html(opt);
            //$('.selectpicker').selectpicker('refresh');
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

        // Click button Lọc/Tìm kiếm
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

        // Nhấn phím Enter khi tìm kiếm
        $(document).on('keyup', '.filter', function(e){
            if (e.keyCode == 13){
                var formId = $(this).closest('form').attr('id');
                queryFilter(formId);
            }
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

            var url = 'outbound?updateStatus=true&ticketId=' + dataId + '&status=' + value;
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

        // thay đổi hiển thị các cột trên giao diện
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

        // Click to call trực tiếp
        $(document).on('click', '.click-to-call', function (e) {
            _socket.emit('MakeCallReq', {_id: user, sid: _socket.socket.sessionid, ticket: makeCallData[$(this).attr('data-ticket')], number: $(this).attr('data-number')});
        });

        // Làm mới trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // change status "can get order?"
        $(document).on('change', '#canGetOrder', function() {
            if (_socket && user) {
                _socket.emit('canGetOrder', {
                    agentId: user,
                    status: $(this).prop('checked')
                });
            }
		});
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
        var custom = '&socketId=' + _socket.socket.sessionid + '&formId=' + formId + '&dt=' + dateTime + '&ignoreSearch=' + (ignoreSearch ? 1: 0) ;
        var url = (newUrl(window.location.hash, filter) + sort + paging + custom).replace('#', '');
        requestTickets(formId, dateTime, url, ignoreSearch);
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

    // Hiển thị dữ liệu tiêu chí tìm kiếm lên giao diện
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

    var reversePagingData = function(formId){
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

    // Hiển thị màn hình chờ khi truy vấn
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

    // Hiển thị dữ liệu lên giao diện
    var loadData = function (formId, resp) {
        _.each(resp.makeCallData, function(ticket){
            makeCallData[ticket._id.toString()] = ticket;
        });

        var template = '<tr>' +
            '<td title="{0}">{0}</td>' +
            '<td title="{1}">{1}</td>' +
            '<td title="{10}">{10}</td>' +
            '<td class="inlineEditButton">' +
            '<div class="showButton"><span>{2}</span>{8}</div>' +
            '<div class="showSelect" style="display: none;">{9}</div>' +
            '</td>' +
            '<td title="{3}">{3}</td>' +
            '<td title="{4}">{4}</td>' +
            '<td title="{5}">{5}</td>' +
            '<td title="{6}">{6}</td>' +
            '<td class="text-center">{7}</td>' +
            '</tr>';

        var activeTDTemplate =
            '<a class="p-t-3 btn-flat-bg" ' +
            'href="#ticket-edit?ticketID={0}" ' +
            'data-toggle="tooltip"' +
            'data-placement="top" data-original-title="Sửa Ticket">' +
            '<i class="zmdi zmdi-edit c-green f-17"></i></a>' +

            '<a class="p-t-3 btn-flat-bg click-to-call" ' +
            'data-toggle="tooltip" ' +
            'data-number="{1}"' +
            'data-ticket="{2}"' +
            'role="button" ' +
            'data-placement="top"' +
            'data-original-title="Click to call">' +
            '<i class="zmdi zmdi-phone-in-talk c-green f-17 "></i></a>';

        var rows = '';
        resp.message.forEach(function (el) {
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

            var ticketCategory = el.ticketReasonCategory ? el.ticketReasonCategory : '';
            var ticketReason = el.ticketReason ? ' - ' + el.ticketReason : '';
            var ticketSubReason = el.ticketSubreason ? ' - ' + el.ticketSubreason : '';

            rows += template.str(el.company,
                el.campain,
                status,
                el.field_so_dien_thoai,
                moment(el.deadline).format('HH:mm DD/MM/YYYY'),
                moment(el.updated).format('HH:mm DD/MM/YYYY'),
                el.updateBy ? el.updateBy : '',
                activeTDTemplate.str(el._id, el.field_so_dien_thoai, el._id),
                inlineEditButton,
                inlineEditSelectPicker,
                ticketCategory + ticketReason + ticketSubReason
            );
        });

        setValueLastSearch();
        $('#' + formId + ' #ticket-body').html(rows);
        $('.selectpicker').selectpicker('refresh');
		
		window.MainContent.loadTooltip();
    };

    // Lấy dữ liệu từ url
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
            bindClick();
            bindSocket(_socket);
            bindTextValue();
            setValueLastSearch();

            var obj = {};
            // Lấy lại dữ liệu tìm kiếm trong quá khứ
            if(window.lastUrl[0].split('?')[0].replace('#', '') == window.location.hash.split('?')[0].replace('#', '')){
                obj = getUrlParams(window.lastUrl[0]);
                _.each(_.keys(obj), function(el){
                    $('#'+ obj['formId']).find('[name='+el+']').val(obj[el]);
                });
                if(_.has(obj, 'page')) window.location.obj['page'] = obj['page'];
                $('.selectpicker').selectpicker('refresh');

                if(_.isEqual(obj['formId'], 'frm-all-process-ticket')){
                    $('.TXT_CUSTOMER_RELATE_TICKET').trigger('click');
                }
            }

            // Hiển thị dữ liệu ticket
            if(obj['formId'] == 'frm-all-process-ticket'){
                queryFilter('frm-not-process-ticket', true);
                queryFilter('frm-all-process-ticket', true);
            }else {
                queryFilter('frm-all-process-ticket', true);
                queryFilter('frm-not-process-ticket', true);
            }


            $('.multi-date-picker').datepicker({
                multidate: 2,
                multidateSeparator: ' - ',
                format: 'dd/mm/yyyy'
            });

			_socket.emit('getOrderStatus', {agentId: user});
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#tab-not-process-ticket .filter #company');
            $(document).off('change', '#tab-all-ticket .filter-company');
            $(document).off('click', '.sort');
            $(document).off('click', '#btn-search');
            $(document).off('click', '.zpaging');
            $(document).off('change', '.column-display');
            $(document).off('click', '.inline-edit-button');
            $(document).off('change', '.inlineEditTicket');
            $(document).off('keyup', '.filter');
            $(document).off('click', '.click-to-call');
            $(document).off('click', '.zmdi-refresh');

            notProcessLastSearch = {};
            allTicketLastSearch = {};
            pagingObject = {};
            lastPagingData = {};
            makeCallData = {};
            delete _socket.$events['responseTicketOutboundPagingData'];
        }
    };
}(jQuery);