//var DFT = function ($) {
//    var newAgent = function(obj){
//        return _.Tags([
//            {tag: 'tr', attr: {class: 'agent-cell'}, childs: [
//                {tag: 'td', attr: {class: 'select-cell text-center w-60'}, childs: [
//                    {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
//                        {tag: 'label', childs: [
//                            {tag: 'input', attr: {'data-id': obj._id, name: 'select', type: 'checkbox', class: 'select-box select-box-cell', value: 'all'}},
//                            {tag: 'i', attr: {class: 'input-helper'}}
//                        ]}
//                    ]}
//                ]},
//                {tag: 'td', attr: {class: 'text-center'}, childs: [
//                    {tag: 'ul', childs: companyHtml(obj.company)}
//                ]},
//                {tag: 'td', attr: 'text-center', childs: [
//                    {tag: 'ul', childs: groupHtml(obj.agentGroupLeaders.concat(obj.agentGroupMembers))}
//                ]},
//                {tag: 'td', attr: {class: 'text-center'}, content: obj.displayName},
//                {tag: 'td', attr: {class: 'text-center'}}
//            ]}
//        ]);
//    };
//
//    var ticketSearchObj = {};
//
//    var bindClick = function () {
//        $(document).on('click', '#ticket-search-btn', function (e) {
//            e.preventDefault();
//
//            var params = _.chain($('.mark-ticket-filter'))
//                .reduce(function (memo, el) {
//                    if (!_.isEqual($(el).val(), '') && !_.isNull($(el).val())) {
//                        memo[el.name] = $(el).val();
//                        ticketSearchObj[el.name] = $(el).val();
//                    }
//                    else{
//                        delete ticketSearchObj[el.name];
//                    }
//                    return memo;
//                }, {}).value();
//            queryTicket(params);
//        });
//
//        $(document).on('change', '#select_all', function () {
//            $('.select-ticket-add').prop('checked', $('#select_all').is(":checked"));
//        });
//
//        $(document).on('change', '#select_all_added', function () {
//            $('.select-ticket-added').prop('checked', $('#select_all_added').is(":checked"));
//        });
//
//        $(document).on('click', '#add-btn', function(e){
//            var x = $.map($('.select-ticket-add'), function(n, i){
//                return $(n).is(":checked") ? $(n).attr('data-id') : '';
//            });
////            $.map($('.select-box-cell'), function(n, i){
////                if ($(n).is(":checked")) $(n).closest('tr').remove();
////            });
//            if (_.compact(x).length > 0){
//                _Ajax('/kpi-mark-data-ticket?idData=' + window.location.obj['data'], 'POST', [{addIds: _.compact(x)}], function(resp){
//                    if (resp.code == 200){
//                        $('#select_all').prop('checked', false);
//                        queryTicketAdded();
//                    }
//                });
//            }
//        });
//
//        $(document).on('click', '#remove-btn', function(e){
//            swal({
//                    title: _config.MESSAGE.MARK_DATA_TICKET.CONFIRM_DELETE_TICKET,
//                    text: _config.MESSAGE.MARK_DATA_TICKET.TEXT_CONFIRM_DELETE_TICKET,
//                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
//                },
//                function () {
//                    var x = $.map($('.select-ticket-added'), function(n, i){
//                        return $(n).is(":checked") ? $(n).attr('data-id') : '';
//                    });
//                    if (_.compact(x).length > 0){
//                        _Ajax('/kpi-mark-data-ticket/all?idData=' + window.location.obj['idData'], 'DELETE', [{removeIds: _.compact(x)}], function(resp){
//                            if (resp.code == 200){
//                                swal({title: 'Thành công', text: 'Thay đổi thành công', type: "success"});
//                                $('#select_all_added').prop('checked', false);
//                                queryTicketAdded();
//                            }
//                            else{
//                                swal({title: 'Thất bại', text: 'Dữ liệu đang được sử dụng', type: "warning"});
//                            }
//                        });
//                    }
//                    else{
//                        swal({title: 'Thất bại', text: 'Không có ticket nào được chọn', type: "warning"});
//                    }
//                });
//
//        });
//
//        $(document).on('click', '#add-all-btn', function(e){
//            if (ticketIds.length > 0){
//                _Ajax('/kpi-mark-data-ticket?idData=' + window.location.obj['data'], 'POST', [{addIds: ticketIds}], function(resp){
//                    if (resp.code == 200){
//                        $('#select_all').prop('checked', false);
//                        queryTicketAdded();
//                    }
//                });
//
//            }
//        });
//
//        $(document).on('click', '#remove-all-btn', function(e){
//            swal({
//                    title: _config.MESSAGE.MARK_DATA_TICKET.CONFIRM_DELETE_ALL_TICKET,
//                    text: _config.MESSAGE.MARK_DATA_TICKET.TEXT_CONFIRM_DELETE_TICKET,
//                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
//                },
//                function () {
//                    if (ticketRemoveIds.length > 0){
//                        _Ajax('/kpi-mark-data-ticket/all?idData=' + window.location.obj['data'], 'DELETE', [{removeIds: ticketRemoveIds}], function(resp){
//                            if (resp.code == 200){
//                                swal({title: 'Thành công', text: 'Thay đổi thành công', type: "success"});
//                                $('#select_all_added').prop('checked', false);
//                                $('.added-paging li').remove();
//                                queryTicketAdded();
//                            }
//                            else{
//                                swal({title: 'Thất bại', text: 'Dữ liệu đang được sử dụng : ', type: "warning"});
//                            }
//                        });
//                    }
//                    else{
//                        swal({title: 'Thất bại', text: 'Không có agent nào được chọn', type: "warning"});
//                    }
//                });
//
//        });
//
//        $(document).on('click', '.zpaging', function () {
//            ticketSearchObj['page'] = $(this).attr('data-link');
//            queryTicket(ticketSearchObj);
//        });
//
//        $(document).on('click', '.apaging', function () {
//            queryTicketAdded($(this).attr('data-link'));
//        });
//    };
//
//    var bindSubmit = function () {
//
//    };
//
//    var ticketIds = [];
//
//    var ticketRemoveIds = [];
//
//    var queryTicket =  function(params){
//        var url = '/kpi-mark-data-ticket?data=' + window.location.obj['data'] +'&queryTicket=1&';
//        _.each(_.keys(params), function(k){
//            url = url + k + '=' + params[k] + '&';
//        });
//        _AjaxObject(url, 'GET', {}, function(resp){
//            if (_.has(resp, 'dataAllTicket')){
//                while (ticketIds.length > 0) {
//                    ticketIds.pop();
//                }
//                _.each(resp.dataAllTicket, function(ticket){
//                    ticketIds.push(ticket);
//                });
//                $('#add-count').text('Tổng: ' + resp.dataAllTicket.length);
//            }
//
//            if (!resp.data.length){
//                $('#add-all-btn').hide();
//            }
//            else{
//                $('.ticket-add-cell').remove();
//                $('#add-all-btn').show();
//            }
//            $('.add-paging').html(createPaging(resp.paging, 'zpaging'));
//            _.each(resp.data, function(ticket, i){
//                var status = 'Chờ xử lý';
//                if (ticket.status == '1'){
//                    status = 'Đang xử lý';
//                }
//                else if (ticket.status == '2'){
//                    status = 'Đã xử lý';
//                }
//                $('#form-add-ticket').append(_.Tags([{
//                    tag: 'tr', attr: {class: 'text-center ticket-add-cell'}, childs: [
//                        {tag: 'td', attr: {class: 'text-center'}, content: i + 1},
//                        {tag: 'td', attr: {class: 'select-cell text-center w-60'}, childs: [
//                            {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
//                                {tag: 'label', childs: [
//                                    {tag: 'input', attr: {'data-id': ticket._id, name: 'select', type: 'checkbox', class: 'select-box select-ticket-add', value: 'all'}},
//                                    {tag: 'i', attr: {class: 'input-helper'}}
//                                ]}
//                            ]}
//                        ]},
//                        {tag: 'td', attr: {class: 'text-center'}, content: !_.isNull(ticket.idService) ? ticket.serviceCompany[0].name : ticket.campainCompany[0].name},
//                        {tag: 'td', attr: {class: 'text-center'}, content: ticket.ticketReasonCategory[0].name},
//                        {tag: 'td', attr: {class: 'text-center'}, content: ticket.customerPhone[0].value},
//                        {tag: 'td', attr: {class: 'text-center'}, content: status}
//                    ]
//                }]));
//            });
//        });
//    };
//
//    var queryTicketAdded = function(paging){
//        var url = '/kpi-mark-data-ticket?queryTicketAdded=1&idData=' + window.location.obj['data'];
//        if (!_.isUndefined(paging)){
//           url = url + '&page=' + paging;
//        }
//        $.get(url, function(resp){
//            if (resp.code == 200){
//                if (_.has(resp, 'dataAllTicket')){
//                    while (ticketRemoveIds.length > 0) {
//                        ticketRemoveIds.pop();
//                    }
//                    _.each(resp.dataAllTicket, function(ticket){
//                        ticketRemoveIds.push(ticket);
//                    });
//
//                    $('#added-count').text('Tổng: ' + resp.dataAllTicket.length);
//                }
//                $('.ticket-added-cell').remove();
//                if (!resp.data.length){
//                    $('#remove-all-btn').hide();
//                }
//                else{
//                    $('#remove-all-btn').show();
//                    $('.added-paging').html(createPaging(resp.paging, 'apaging'));
//                }
//                _.each(resp.data, function(ticket, i){
//                    ticketRemoveIds.push(ticket._id);
//                    var status = 'Chờ xử lý';
//                    if (ticket.idTicket.status == '1'){
//                        status = 'Đang xử lý';
//                    }
//                    else if (ticket.idTicket.status == '2'){
//                        status = 'Đã xử lý';
//                    }
//                    $('#form-added-ticket').append(_.Tags([{
//                        tag: 'tr', attr: {class: 'text-center ticket-added-cell'}, childs: [
//                            {tag: 'td', attr: {class: 'text-center'}, content: i + 1},
//                            {tag: 'td', attr: {class: 'select-cell text-center w-60'}, childs: [
//                                {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
//                                    {tag: 'label', childs: [
//                                        {tag: 'input', attr: {'data-id': ticket._id, name: 'select', type: 'checkbox', class: 'select-box select-ticket-added', value: 'all'}},
//                                        {tag: 'i', attr: {class: 'input-helper'}}
//                                    ]}
//                                ]}
//                            ]},
//                            {tag: 'td', attr: {class: 'text-center'}, content: _.isNull(ticket.idTicket.idService) ? ticket.idTicket.idCampain.idCompany.name : ticket.idTicket.idService.idCompany.name},
//                            {tag: 'td', attr: {class: 'text-center'}, content: ticket.idTicket.ticketReasonCategory.name},
//                            {tag: 'td', attr: {class: 'text-center'}, content: resp.dataPhone[i]},
//                            {tag: 'td', attr: {class: 'text-center'}, content: status}
//                        ]
//                    }]));
//                });
//            }
//        });
//    };
//
//    var createPaging = function (paging, classPaging) {
//        if (!paging) return '';
//        var firstPage = paging.first ? '<li><a class="' + classPaging +'" data-link="' + paging.first + '">&laquo;</a></li>' : '';
//        var prePage = paging.previous ? '<li><a class="' + classPaging +'" data-link="' + paging.previous + '">&lsaquo;</a></li>' : '';
//        var pageNum = '';
//        for (var i = 0; i < paging.range.length; i++) {
//            if (paging.range[i] == paging.current) {
//                pageNum += '<li class="active"><span>' + paging.range[i] + '</span></li>';
//            } else {
//                pageNum += '<li><a class="' + classPaging +'" data-link="' + paging.range[i] + '">' + paging.range[i] + '</a></li>';
//            }
//        }
//        var pageNext = paging.next ? '<li><a class="' + classPaging +'" data-link="' + paging.next + '">&rsaquo;</a></li>' : '';
//        var pageLast = paging.last ? '<li><a class="' + classPaging +'" data-link="' + paging.last + '">&raquo;</a></li>' : '';
//        return '<div class="paginate text-center">' + '<ul class="pagination">' + firstPage + prePage + pageNum + pageNext + pageLast + '</ul></div>';
//    };
//
//    return {
//        init: function () {
//            bindClick();
//            bindSubmit();
//            $('#add-all-btn').hide();
//            queryTicketAdded();
//        },
//        uncut: function(){
//            $(document).off('click', '#ticket-search-btn');
//            $(document).off('change', '.select-all');
//            $(document).off('change', '#select_all_added');
//            $(document).off('click', '#add-btn');
//            $(document).off('click', '#remove-btn');
//            $(document).off('click', '.zpaging');
//            $(document).off('click', '.apaging');
//        }
//    };
//}(jQuery);