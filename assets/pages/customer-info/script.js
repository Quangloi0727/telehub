var DFT = function ($) {
    var ticketReasonChosen = {};
    var detailReason = {};
    var _oldTicketLeft = $('#tab-old-ticket .left-side');
    var _oldTicketRight = $('#tab-old-ticket .right-side');
    var saveButton = [$('#save-customer'), $('#save-new-ticket'), $('#save-ticket-detail')];
    var ticketIndex = 0;

    var detailTicketReasonCategory = {};
    var detailTicket = {};

    var bindClick = function () {
        // $(document).on('click', '.panel-heading a', function () {
        //     var dataId = $(this).attr('data-id');
        //     if (_.isEqual(dataId, 'showCustomer')) {
        //         showSaveButton(0);
        //     } else {
        //         $('.ticketTab').each(function () {
        //             var index = $(this).attr('data-id');
        //             if ($(this).hasClass('active')) {
        //                 if (index == '1') {
        //                     showSaveButton(1);
        //                 } else {
        //                     $('.left-side').css('display') == 'none' ? showSaveButton(2) : showSaveButton(3);
        //                 }
        //             }
        //         });
        //     }
        //     $('form').validationEngine('hideAll');
        //     if ($(this).parents('.panel').children('.panel-collapse').hasClass('in')) {
        //         e.stopPropagation();
        //         return;
        //     }
        // });

        // Click button Lưu ticket
        $(document).on('click', '.btn-save', function () {
            $($(this).attr('data-target')).trigger('submit');
        });

        // $(document).on('click', '.ticketTab', function () {
        // var index = $(this).attr('data-id');
        // if (index == '1') {
        //     showSaveButton(1);
        // } else {
        //     $('.left-side').css('display') == 'none' ? showSaveButton(2) : showSaveButton(3);
        // }
        // });

        // Click button chuyển trang
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

        // Click button xem chi tiết ticket liên quan
        $(document).on('click', '#tab-old-ticket td .btn-detail', function () {
            var button = $(this);
            var dataId = $(this).attr('data-id');
            var formName = '#frm-ticket-detail';

            $('.nav-tabs a[href="#profile-v"]').tab('show');
            $('#save-ticket-detail').attr('data-id', dataId);
            $('#ticketHistory').attr('data-id', dataId);

            _oldTicketLeft.fadeOut(function () {
                _Ajax('customer-info', 'POST', [{_id: dataId}], function (resp) {
                    if (resp.code == 500) return swal({title: 'Đã có lỗi xảy ra', text: resp.message});
                    _oldTicketRight.fadeIn();
                    var formId = '#frm-ticket-detail-crm ';
                    var surveyFormId = '#detail-ticket-survey-form ';

                    detailTicket = resp.message.ticket;
                    detailTicketReasonCategory = resp.message.info.ticketReasonCategory;

                    $(formId + '#title').html(resp.message.serviceName);
                    $(formId + '#ticket-detail-properties').html(zoka.showTicketInfo(
                        resp.message.ticket,
                        resp.message.info.ticketReasonCategory,
                        resp.message.info.assign,
                        resp.message.info.statisfy
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


                    $(surveyFormId).html(zoka
                        .createSurvey(resp.message.info.survey,
                            resp.message.info.surveyResult,
                            'detail-ticket-survey-form',
                            resp.message.ticket));

                    _.each($('.survey-tab'), function (el) {
                        if ($(el).hasClass('active')) {
                            if ($(el).attr('data-next-question')) {
                                $('.btn-next').show();
                            } else {
                                $('.btn-next').hide();
                            }
                        }
                    });

                    if (!resp.message.info.isEdit) {
                        disableEditTicket(formId);
                        disableSurveyEdit(surveyFormId);
                    } else {
                        enableSurveyEdit(surveyFormId);
                    }

                    refreshComponent();


                    _oldTicketRight.fadeIn();
                    bindValue();
                    $('.form-horizontal').getNiceScroll(0).doScrollTop(10000);
                });
            });
        });

        // Click button quay trở lại màn hình ticket hiện tại
        $(document).on('click', '#tab-old-ticket .right-side .btn-back', function () {
            $('#save-ticket-detail').attr('data-id', '');
            _oldTicketRight.fadeOut(function () {
                _oldTicketLeft.fadeIn();
            });
        });

        // Click button xem lịch sử ticket
        $(document).on('click', '#ticketHistory', function () {
            saveButton[2].hide();
            _Ajax('ticket-history?ticketId=' + $(this).attr('data-id'), 'GET', {}, function (resp) {
                if (resp.code == 200) {
                    var formId = '#panel-ticket-history';
                    $(formId + ' #ticket-history').html(zoka.showTicketList(null, resp.message.data, false));
                    $(formId + ' .paging-list').html(zoka.createPaging(resp.message.paging));

                    bindValue();
                } else {
                    showMessage(true, resp.message);
                }
            });
        });

        // Click button xem câu hỏi khảo sát
        $(document).on('click', 'li .survey', function(){
            saveButton[2].show();
        });

        // Click button xem danh sách ticket liên quan
        $(document).on('click', 'li .TXT_TICKET_DETAIL', function () {
            saveButton[2].show();
        });

        // Click button tìm kiếm/lọc ticket liên quan
        $(document).on('click', '#searchTicket', function () {
            var parent = $(this).closest('.left-side');
            var searchObj = '/customer-info?search=1&idCustomer=' + $(this).attr('data-id') + '&tId=' + $(this).attr('data-ticket-id');
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

                    bindValue();

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

        // Thay đổi nhóm tình trạng ticket
        $(document).on('change', '.ticketReasonCategory', function () {
            var changeValue = $(this).val();
            var parentForm = $(this).closest('form').attr('id');
            setTicketReason(changeValue, parentForm);
        });

        // Click button câu hỏi khảo sát tiếp theo
        $(document).on('click', '.btn-next', function () {
            _isDone = false;
            _.each($('.survey-tab'), function (el) {
                if ($(el).hasClass('active') && !_isDone) {
                    _isDone = true;
                    var nextQuestion = $(el).attr('data-next-question');
                    if (nextQuestion) {
                        $('.' + nextQuestion + ' a').tab('show');
                        if ($('.survey-tab.' + nextQuestion).attr('data-next-question')) {
                            $('.btn-next').show();
                        } else {
                            $('.btn-next').hide();
                        }
                    }
                }
            });
        });

        // Chọn tab câu hỏi khảo sát
        $(document).on('click', '.survey-tab', function () {
            var self = $(this);
            if (self.attr('data-next-question')) {
                $('.btn-next').show();
            } else {
                $('.btn-next').hide();
            }
        });

        $(document).click(function (e) {
            if (e.button == 0) {
                $('#label-status').fadeOut('fast', function () {
                    $(this).text(' ');
                    $(this).removeClass('c-red c-blue');
                });
            }
        });
    };

    // Sự kiện submit
    var bindSubmit = function () {
        // Xác nhận cập nhật dữ liệu khách hàng
        $('form#frm-update-customer').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/customer-info/customer-' + $('#save-customer').attr('data-id'), 'PUT', $(form).getData(), function (resp) {
                        var err = resp.code == 500 ? true : false;
                        showMessage(err, resp.message);
                    });
                }
            }
        });

        // Xác nhận cập nhật dữ liệu ticket
        $('form#frm-edit-ticket').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/customer-info/editTicket-' + $('#save-new-ticket').attr('data-id'), 'PUT', $(form).getData(), function (resp) {
                        var err = resp.code == 500 ? true : false;
                        showMessage(err, resp.message);
                    });
                }
            }
        });

        // Xác nhận cập nhật dữ liệu ticket liên quan
        $('form#frm-ticket-detail-crm').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/customer-info/editTicket-' + $('#save-ticket-detail').attr('data-id'), 'PUT', $(form).getData(), function (resp) {
                        var err = resp.code == 500 ? true : false;
                        showMessage(err, resp.message);
                    });
                }
            }
        });

        // Xác nhận cập nhật dữ liệu câu hỏi khảo sát của ticket liên quan
        $('#detail-ticket-survey-form').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                if (status) {
                    var dataLink = $('#detail-ticket-survey-form #save-survey').attr('data-link');
                    _AjaxData('/customer-info/survey-' + dataLink, 'PUT', $(form).getData(), function (resp) {
                        if (resp.code == 200) {
                            showMessage(false, 'Lưu thông tin mẫu giao tiếp thành công !');
                        } else {
                            showMessage(true, resp.message);
                        }
                    });
                }
            }
        });

        // Xác nhận cập nhật dữ liệu câu hỏi khảo sát
        $('#current-survey-form').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    var dataLink = $('#current-survey-form #save-survey').attr('data-link');
                    _AjaxData('/ticket-edit/survey-' + dataLink, 'PUT', $(form).getData(), function (resp) {
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

    // Cập nhật dữ liệu ticket reason khi thay đổi category
    var setTicketReason = function (changeValue, parentForm) {
        var trc = {}, childTicket = {};
        if (_.isEqual(parentForm, 'frm-edit-ticket')) {
            trc = ticketReasonCategory;
            childTicket = currentTicket;
        } else {
            trc = detailTicketReasonCategory;
            childTicket = detailTicket;
        }

        var htmlChange = _.Tags(zoka.createTicketSubReasonRows(childTicket, trc, changeValue));
        $('#' + parentForm + ' .ticketSubreason').html(htmlChange).trigger('chosen:updated');
    };

    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindValue = function () {
        $.getJSON("assets/const.json", function (_config) {
            _.each(_.allKeys(_config.MESSAGE.CUSTOMER_INFO), function (item) {
                $('.' + item).html(_config.MESSAGE.CUSTOMER_INFO[item]);
            });
        });
    };

    // var showSaveButton = function (index) {
    //     var displayIndex = [];
    //     for (var i = 0; i < saveButton.length; i++) {
    //         if (saveButton[i].css('display') != 'none' && i != index) displayIndex.push(saveButton[i]);
    //     }
    //     hiddenArray(displayIndex, saveButton[index]);
    // };

    var hiddenArray = function (arr, btn) {
        if (arr.length == 0) {
            if (btn) btn.fadeIn();
        } else {
            arr.shift().fadeOut(function () {
                hiddenArray(arr, btn);
            });
        }
    };

    // Thông báo kết quả sau khi truy vấn dữ liệu từ server
    var showMessage = function (err, message) {
        message = _.isString(message) ? message : JSON.stringify(message);

        if (err){
            swal("Đã có lỗi xảy ra", message, "error");
        }else{
            swal("Thành công", message, "success")
        }

        //
        // if (err) {
        //     message = 'Lỗi: ' + message;
        //     $('#label-status').addClass('c-red');
        // } else {
        //     $('#label-status').addClass('c-blue');
        // }
        // $('#label-status').fadeIn('fast', function () {
        //     $(this).text(message);
        // });
    };

    // Hiển thị dữ liệu ticket lên giao diện
    var showTicket = function () {
        var currentTicketId = '#frm-edit-ticket ';

        $(currentTicketId + '#ticket-info').html(zoka.showTicketInfo(currentTicket, ticketReasonCategory, assign, statisfy));
        setTicketReason(currentTicket.ticketReasonCategory, 'frm-edit-ticket');
        $('.selectpicker').selectpicker('refresh');
        $(currentTicketId + '#edit-ticket-history .ticket-history').html(zoka.showTicketList(currentTicket, ticketHistory.data, false));
        $(currentTicketId + '#edit-ticket-history .paging-list').html(zoka.createPaging(ticketHistory.paging));
        $('#current-survey-form').html(zoka.createSurvey(survey, surveyResult, 'current-survey-form', currentTicket));

        if (!isEdit) {
            disableEditTicket(currentTicketId);
            disableSurveyEdit('#current-survey-form');
            saveButton[1].attr('disabled', true);
        } else {
            saveButton[1].attr('disabled', false);
        }

        var ticketHistoryId = '#edit-ticket-history ';
        $(ticketHistoryId + '.ticket-history').html(zoka.showTicketList(currentTicket, ticketHistory.data, false));
        $(ticketHistoryId + '.paging-list').html(zoka.createPaging(ticketHistory.paging));

        var relateTicketId = '#tab-old-ticket ';
        $(relateTicketId + '#ticket-info').html(zoka.showTicketList(currentTicket, tickets.data, true));
        $(relateTicketId + '.paging-list').html(zoka.createPaging(tickets.paging));
        $(relateTicketId + '#ticket-detail-properties').html(zoka.showTicketInfo(null, ticketReasonCategory, null));
        $(relateTicketId + '#ticket-list').html(zoka.showTicketList(null, null, false));

        _.each($('.survey-tab'), function (el) {
            if ($(el).hasClass('active')) {
                if ($(el).attr('data-next-question')) {
                    $('.btn-next').show();
                } else {
                    $('.btn-next').hide();
                }
            }
        });

        refreshComponent();
    };

    // Khóa chức năng sửa của ticket
    var disableEditTicket = function (formId) {
        $(formId + '*').attr('readonly', true);
        $(formId + '.selectpicker').attr('disabled', true).selectpicker('refresh');
        $(formId + '.tag-select').attr('disabled', true).trigger('chosen:updated');
    };

    // Khóa chức năng sửa câu hỏi khảo sát
    var disableSurveyEdit = function (formId) {
        $(formId + '.tab-content *').attr('readonly', true);
        $(formId + ' #save-survey').attr('disabled', true);
        saveButton[2].attr('disabled', true);
    };

    // Mở chức năng sửa câu hỏi khảo sát
    var enableSurveyEdit = function (formId) {
        $(formId + '.tab-content *').attr('readonly', false);
        $(formId + ' #save-survey').attr('disabled', false);
        saveButton[2].attr('disabled', false);
    };

    // làm mới dữ liệu hiển thị
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
                format: 'HH:mm DD/MM/YYYY',
            });
            bindClick();
            bindSubmit();
            bindValue();

            showTicket();
            $('#searchTicket').trigger('click');

        },
        // Cảnh báo khi đóng popup
        showCloseAlert: function (ticketId) {
            swal({
                    title: 'Có chắc chắn muốn đóng ticket',
                    text: 'Có thể bị mất dữ liệu khi đóng ticket khi chưa lưu. Hãy chắc chắn rằng bạn đã lưu tất cả dữ liệu.',
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Có, chắc chắn !",
                    closeOnConfirm: true
                },
                function () {
                    window.parent.VoiceContainer.close(ticketId);
                });
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.panel-heading a');
            $(document).off('click', '.btn-save');
            $(document).off('click', '.ticketTab');
            $(document).off('click', '.zpaging');
            $(document).off('click', '#tab-old-ticket td .btn-detail');
            $(document).off('click', '#tab-old-ticket .right-side .btn-back');
            $(document).off('click', '#ticketHistory');
            $(document).off('click', '#searchTicket');
            $(document).off('click', '.btn-next');
            $(document).off('click', '.survey-tab');

            $('form#frm-update-customer').validationEngine('detach');
            $('form#frm-new-ticket').validationEngine('detach');
            $('form#frm-ticket-detail').validationEngine('detach');
            $('#detail-ticket-survey-form').validationEngine('detach');
        }
    };
}(jQuery);