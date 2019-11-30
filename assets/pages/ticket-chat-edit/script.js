var DFT = function ($) {
    var _oldTicketLeft = $('#tab-old-ticket .left-side');
    var _oldTicketRight = $('#tab-old-ticket .right-side');
    var detailTicketReasonCategory = {};
    var detailTicket = {};

    var bindClick = function () {
        // Hiển thị dữ liệu ticket liên quan
        $(document).on('click', '.btn-detail', function () {
            $('.nav-tabs a[href="#profile-v"]').tab('show');
            var button = $(this);
            var dataId = $(this).attr('data-id');
            $('#save-ticket-detail-crm').attr('data-id', dataId);
            _oldTicketLeft.fadeOut(function () {
                _Ajax('ticket-edit', 'POST', [{_id: button.attr('data-id')}], function (resp) {
                    if (resp.code == 500) return swal({title: 'Đã có lỗi xảy ra', text: resp.message});
                    _oldTicketRight.fadeIn();
                    var formId = '#frm-ticket-detail-crm ';

                    detailTicket = resp.message.ticket;
                    detailTicketReasonCategory = resp.message.info.ticketReasonCategory;

                    $(formId + '#title').html(resp.message.serviceName);
                    $(formId + '#ticket-detail-properties').html(zoka.showTicketInfo(
                        resp.message.ticket,
                        resp.message.info.ticketReasonCategory,
                        resp.message.info.assign,
                        resp.message.info.statisfy,
                        3
                    ));

                    $(formId + '#ticket-history-list').html(zoka
                        .showTicketListBody(
                            zoka.validObject(resp.message, 'info', 'ticketHistory', 'data'),
                            false
                        ));

                    $(formId + '.paging-list').html(zoka
                        .createPaging(
                            zoka.validObject(resp.message, 'info', 'ticketHistory', 'paging')
                        ));


                    $('#detail-survey-form').html(zoka.createSurvey(resp.message.survey, resp.message.surveyResult, 'detail-survey-form', resp.message));

                    if (!resp.message.info.isEdit) {
                        disableEditTicket(formId);
                    }

                    refreshComponent();
                });
            });
        });

        // Nhấn nút lưu ticket
        $(document).on('click', '.btn-save', function () {
            $($(this).attr('data-target')).trigger('submit');
        });

        // Chuyển trang
        $(document).on('click', '.zpaging', function () {
            var parent = $(this).closest('.list-view');
            var queryLink = $(this).attr('data-link');

            _Ajax(queryLink, 'GET', {}, function (resp) {
                if (resp.code == 200) {
                    var ticketBody = zoka.showTicketListBody(resp.message.data, parent.hasClass('view-detail'));
                    var ticketPage = zoka.createPaging(resp.message.paging);

                    parent.find('#ticket-history-list').html(ticketBody);
                    parent.find('.paging-list').html(ticketPage);
                } else {
                    swal({
                        title: 'Đã có lỗi xảy ra',
                        text: JSON.stringify(resp.message),
                        type: "error",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Quay lại!",
                        closeOnConfirm: true
                    });
                }
            });
        });

        $(document).on('click', '#cancelInput', function () {
            window.history.back();
        });

        // Hiển thị dữ liệu lịch sử ticket
        $(document).on('click', '#tab-old-ticket .right-side .btn-back', function () {
            $(MainContent.prefix('#save-ticket-detail-crm')).attr('data-id', '');
            _oldTicketRight.fadeOut(function () {
                _oldTicketLeft.fadeIn();
            });
        });

        // Tìm kiếm lịch sử ticket
        $(document).on('click', '#searchTicket', function () {
            var parent = $(this).closest('.left-side');
            var searchObj = '/ticket-chat-edit?search=1&idCustomer=' + $(this).attr('data-id') + '&tId=' + $(this).attr('data-ticket-id');
            $('#searchRelateTicket .searchColumn').each(function () {
                var obj = $(this);
                if (obj.attr('name') && !_.isEmpty(obj.val())) {
                    searchObj += ('&' + obj.attr('name') + '=' + obj.val());
                }
            });
            _Ajax(searchObj, 'GET', {}, function (resp) {
                if (resp.code == 200) {
                    var str = zoka.showTicketListBody(resp.message.data, true);
                    parent.find('#ticket-history-list').html(str);
                    parent.find('.paging-list').html(zoka.createPaging(resp.message.paging));
                } else {
                    swal({
                        title: 'Đã có lỗi xảy ra',
                        text: JSON.stringify(resp.message),
                        type: "error",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Quay lại!",
                        closeOnConfirm: true
                    });
                }
            });
        });

        // Tải lại trang
        $(document).on('click', '#refreshPage', function () {
            _.LoadPage(window.location.hash);
        });

        // Gọi ra trực tiếp từ giao diện
        $(document).on('click', '.clickToCall', function (e) {
            _socket.emit('MakeCallReq', {_id: user, sid: _socket.socket.sessionid, number: $(this).attr('data-phone-number'), ticket: currentTicket});
        });

        // Cập nhật giao diện khi thay đổi nhóm tình trạng ticket
        $(document).on('change', '.ticketReasonCategory', function(){
            setTicketReason($(this).val(), $(this).closest('form').attr('id'));

            //var changeValue = $(this).val();
            //var parentForm = $(this).closest('form').attr('id');
            //var trc = {}, childTicket = {};
            //if ( _.isEqual(parentForm, 'frm-edit-ticket')){
            //    trc = ticketReasonCategory;
            //    childTicket = currentTicket;
            //}else{
            //    trc = detailTicketReasonCategory;
            //    childTicket = detailTicket;
            //}
            //
            //var htmlChange = _.Tags(zoka.createTicketSubReasonRows(childTicket, trc, changeValue));
            //$('#' + parentForm + ' .ticketSubreason').html(htmlChange).trigger('chosen:updated');
        });
    };

    var bindSubmit = function () {
        // Xác nhận cập nhật thông tin khách hàng
        $('#frm-update-customer').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/ticket-chat-edit/customer-' + $('#save-customer').attr('data-id'), 'PUT', $(form).getData(), function (resp) {
                        if (resp.code == 200) {
                            swal({
                                title: 'Cập nhật thành công',
                                text: '',
                                type: "success",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Xác nhận",
                                closeOnConfirm: true
                            });
                        } else {
                            swal({
                                title: 'Đã có lỗi xảy ra',
                                text: resp.message,
                                type: "error",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Quay lại!",
                                closeOnConfirm: true
                            });
                        }
                    });
                }
            }
        });

        $('#frm-edit-ticket').validationEngine('attach', {
            // Xác nhận cập nhật thông tin ticket
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/ticket-chat-edit/editTicket-' + $('#save-new-ticket').attr('data-id'), 'PUT', $(form).getData(), function (resp) {

                        if (resp.code == 200) {
                            swal({
                                title: 'Cập nhật thành công',
                                text: '',
                                type: "success",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Xác nhận",
                                closeOnConfirm: true
                            });
                            $('#tab-edit-ticket').find('#ticket-history-list').html(zoka.showTicketListBody(resp.message.data, false));
                            $('#tab-edit-ticket').find('.paging-list').html(zoka.createPaging(resp.message.paging));
                        } else {
                            swal({
                                title: 'Đã có lỗi xảy ra',
                                text: resp.message,
                                type: "error",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Quay lại!",
                                closeOnConfirm: true
                            });
                        }
                        ;
                    });
                }
            }
        });

        $('#frm-ticket-detail-crm').validationEngine('attach', {
            // Xác nhận cập nhật dữ liệu ticket liên quan
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/ticket-chat-edit/editTicket-' + $('#save-ticket-detail-crm').attr('data-id'), 'PUT', $(form).getData(), function (resp) {
                        if (resp.code == 200) {
                            swal({
                                title: 'Cập nhật thành công',
                                text: '',
                                type: "success",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Xác nhận",
                                closeOnConfirm: true
                            });
                            $('#ticket-detail-history').find('#ticket-history-list').html(zoka.showTicketListBody(resp.message.data, false));
                            $('#ticket-detail-history').find('.paging-list').html(zoka.createPaging(resp.message.paging));
                        } else {
                            swal({
                                title: 'Đã có lỗi xảy ra',
                                text: resp.message,
                                type: "error",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Quay lại!",
                                closeOnConfirm: true
                            });
                        }
                    });
                }
            }
        });

        $('#current-survey-form').validationEngine('attach', {
            // Xác nhận cập nhật dữ liệu câu hỏi khảo sát
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    var dataLink = $('#current-survey-form #save-survey').attr('data-link');
                    _AjaxData('/survey-result/' + dataLink, 'PUT', $(form).getData(), function (resp) {
                        if (resp.code == 200) {
                            swal({title: 'Lưu thông tin thành công', text: resp.message});
                        } else {
                            swal({title: 'Đã có lỗi xảy ra', text: resp.message});
                        }
                    });
                }
            }
        });

        $('#detail-survey-form').validationEngine('attach', {
            // Xác nhận cập nhật câu hỏi khảo sát của ticket liên quan
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    var dataLink = $('#detail-survey-form #save-survey').attr('data-link');
                    _AjaxData('/survey-result/' + dataLink, 'PUT', $(form).getData(), function (resp) {
                        if (resp.code == 200) {
                            swal({title: 'Lưu thông tin thành công', text: resp.message});
                        } else {
                            swal({title: 'Đã có lỗi xảy ra', text: resp.message});
                        }
                    });
                }
            }
        });
    };

    // Hiển thị tên cột theo file config
    var bindValue = function () {
        _.each(_.allKeys(_config.MESSAGE.CUSTOMER_INFO), function (item) {
            $('.' + item).html(_config.MESSAGE.CUSTOMER_INFO[item]);
        });
    };

    // Cập nhật dữ liệu tình trạng ticket
    var setTicketReason = function(changeValue, parentForm){
        var trc = {}, childTicket = {};
        if ( _.isEqual(parentForm, 'frm-edit-ticket')){
            trc = ticketReasonCategory;
            childTicket = currentTicket;
        }else{
            trc = detailTicketReasonCategory;
            childTicket = detailTicket;
        }

        var htmlChange = _.Tags(zoka.createTicketSubReasonRows(childTicket, trc, changeValue));
        $('#' + parentForm + ' .ticketSubreason').html(htmlChange).trigger('chosen:updated');
    };

    // Hiển thị dữ liệu ticket lên giao diện
    var showTicket = function () {
        var currentTicketId = '#frm-edit-ticket ';
        $(currentTicketId + '#ticket-info').html(zoka.showTicketInfo(currentTicket, ticketReasonCategory, assign, statisfy, 3));
        setTicketReason(currentTicket.ticketReasonCategory, 'frm-edit-ticket');
        $('.selectpicker').selectpicker('refresh');
        $(currentTicketId + '#edit-ticket-history .ticket-history').html(zoka.showTicketList(currentTicket, ticketHistory.data, false));
        $(currentTicketId + '#edit-ticket-history .paging-list').html(zoka.createPaging(ticketHistory.paging));
        $(currentTicketId + '#current-survey-form').html(zoka.createSurvey(survey, surveyResult, 'current-survey-form', currentTicket));

        if (!isEdit){
            disableEditTicket(currentTicketId);
        }

        var ticketHistoryId = '#edit-ticket-history ';
        $(ticketHistoryId + '.ticket-history').html(zoka.showTicketList(currentTicket, ticketHistory.data, false));
        $(ticketHistoryId + '.paging-list').html(zoka.createPaging(ticketHistory.paging));

        var relateTicketId = '#tab-old-ticket ';
        $(relateTicketId + '#ticket-info').html(zoka.showTicketList(currentTicket, tickets.data, true));
        $(relateTicketId + '.paging-list').html(zoka.createPaging(tickets.paging));
        $(relateTicketId + '#ticket-detail-properties').html(zoka.showTicketInfo(null, ticketReasonCategory, null, 3));
        $(relateTicketId + '#ticket-list').html(zoka.showTicketList(null, null, false));

        refreshComponent();
    };

    // Khóa chức năng cập nhật ticket
    var disableEditTicket = function(formId){
        $(formId + '*').attr('readonly', true);
        $(formId + '.selectpicker').attr('disabled',true).selectpicker('refresh');
        $(formId + '.tag-select').attr('disabled',true).trigger('chosen:updated');
        $(formId + 'button').attr('disabled', true);
    };

    var refreshComponent = function () {
        bindValue();

        $('.selectpicker').selectpicker();
        $('.tag-select').chosen();
        $('.chosen-container').css('width', '100%');
        $('.date-time-picker').datetimepicker();
    };

    return {
        init: function () {
            var closest = $('.selectpicker').closest('div');
            closest.addClass('validate-select-picker');
            closest.css('position', 'relative');
            $('.datepicker').datepicker({
                format: 'HH:mm DD/MM/YYYY'
            });

            bindClick();
            bindSubmit();
            bindValue();
            showTicket();
            //zoka.ticketReasonEvent($, '#frm-edit-ticket', '#ticketReasonCategory', '#ticketSubreason', '.tReason', {});
            //$('.testthoima').html('<select class="select-picker form-control" id="123conma">' +
            //    '<option>123123123</option>' +
            //    '<option>123123123</option>' +
            //    '<option>123123123</option>' +
            //    '<option>123123123</option>' +
            //    '<option>123123123</option>' +
            //    '</select>');
            //
            //$('#123conma').selectpicker()
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.btn-detail');
            $(document).off('click', '.btn-save');
            $(document).off('click', '.zpaging');
            $(document).off('click', '#tab-old-ticket .right-side .btn-back');
            $(document).off('click', '#searchTicket');
            $(document).off('click', '#refreshPage');
            $(document).off('click', '#cancelInput');
            $(document).off('click', '.clickToCall');
            $(document).off('change', '.ticketReasonCategory');
            $('#frm-update-customer').validationEngine('detach');
            $('#frm-edit-ticket').validationEngine('detach');
            $('#frm-ticket-detail-crm').validationEngine('detach');
            $('#current-survey-form').validationEngine('detach');
            $('#detail-survey-form').validationEngine('detach');
        }
    };
}(jQuery);