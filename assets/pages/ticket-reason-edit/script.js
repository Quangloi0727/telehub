var DFT = function ($) {
    option = {};
    var bindClick = function () {
        // Thay đổi trạng thái
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });
        // Thay đổi trạng thái subreason
        $(document).on('change', '#subreasonStatus', function () {
            $(this).val(Number($(this).is(':checked')));
            var _data = {status: Number($(this).is(':checked'))};
            _Ajax('/ticket-subreason/' + $(this).attr('data-id'), 'PUT', [_data], function (resp) {
            });
        });
        // Quay lại
        $(document).on('click', '#btn-back', function () {
            window.location.hash = 'ticket-reason';
        });
        // Tạo mới subreason
        $(document).on('click', '#new-subreason', function () {
            $('#form-subreason').modal('show');
        });
        // Click nút edit
        $(document).on('click', '.btn-edit', function () {
            $('#form-edit-subreason').modal('show');
            $('#form-edit-subreason').find('#validate-subreason2-for-x-name').val($(this).attr('data-name'));
            option.id = $(this).attr('data-id');
            option.url = $(this).attr('data-url');
        });
        // Xóa phần tử hiện tại
        $(document).on('click', '.btn-remove', function () {
            var id = $(this).attr('data-id');
            var url = $(this).attr('data-url');
            swal({
                    title: _config.MESSAGE.TICKETSUBREASON.CONFIRM_DELETE_TICKET_SUBREASON,
                    text: _config.MESSAGE.TICKETSUBREASON.TEXT_CONFIRM_DELETE_TICKET_SUBREASON,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Có, chắc chắn !",
                    closeOnConfirm: false
                },
                function () {
                    _AjaxObject(url + '/' + id, 'DELETE', {}, function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({
                                title: 'Thành công',
                                text: _config.MESSAGE.TICKETSUBREASON.TEXT_SUCCESS_DELETE_TICKET_SUBREASON,
                                type: 'success',
                                html: true
                            }, function () {
                                _.LoadPage(window.location.hash);
                            });
                        } else {
                            swal({title: 'Thất bại!', text: resp.message});
                        }
                    });
                }
            );
        });
    };
    var bindSubmit = function () {
        // Xác nhận tạo mới subreason
        $('#create-subreason').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxObject('/ticket-subreason', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
        // Xác nhận cập nhật subreason
        $('#edit-subreason').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                //console.log(61, option.url + option.id);
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    //console.log(option.url + option.id);
                    _AjaxObject(option.url + '/' + option.id, 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
        // Xác nhận cập nhật reason
        $('#edit-reason').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxObject(window.location.hash.replace('/edit', '').replace('#', ''), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'ticket-reason';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
    };
    var fixHelperModified = function (e, tr) {
        var $originals = tr.children();
        var $helper = tr.clone();
        $helper.children().each(function (index) {
            $(this).width($originals.eq(index).width());
        });
        return $helper;
    };
    // Cập nhật thứ tự subreason trong reason
    var updateIndex = function (e, ui) {
        var _order = [{'bulk-update': true}];
        $('td.index', ui.item.parent()).each(function (i, v) {
            var _o = {};
            _o[$(v).attr('data-weight')] = i + 1;
            _order.push(_o);
            //console.log(_order)
            $(this).html(i + 1);
        });
        _Ajax('/ticket-subreason', 'POST', _order, function (resp) {
            //console.log(53, resp);
        });
    };
    // Hiển thị tên cột theo file config
    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.TICKETREASON_TXT), function (item) {
            $('.' + item).html(_config.MESSAGE.TICKETREASON_TXT[item]);
        });
    }
    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['ReasonEditCheck'] = {
                "url": "/ticket-reason/validate",
                "extraDataDynamic": ['#validate-reason-for-name', '#validate-reason-for-x-name'],
                "alertText": "* Tên tình trạng này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['ReasonPriorityCheck'] = {
                "url": "/ticket-reason/validate",
                "extraDataDynamic": ['#validate-reason-for-priority', '#validate-reason-for-x-priority', '#idCategory'],
                "alertText": "* Mức ưu tiên này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['SubreasonCheck'] = {
                "url": "/ticket-subreason/validate",
                "extraDataDynamic": ['#validate-subreason-for-name', '#idReason'],
                "alertText": "* Tên lí do này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['SubreasonPriorityCheck'] = {
                "url": "/ticket-subreason/validate",
                "extraDataDynamic": ['#validate-subreason-for-priority', '#validate-subreason-for-idReason'],
                "alertText": "* Mức ưu tiên này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['SubreasonEditCheck'] = {
                "url": "/ticket-subreason/validate",
                "extraDataDynamic": ['#validate-subreason2-for-name', '#validate-subreason2-for-x-name'],
                "alertText": "* Tên lí do này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $("#ticket-subreason tbody").sortable({
                helper: fixHelperModified,
                stop: updateIndex,
                distance: 5,
                opacity: 0.6,
                cursor: 'move'
            }).disableSelection();
            bindClick();
            bindSubmit();
            bindTextValue();
        },
        uncut: function () {
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#status');
            $(document).off('change', '#subreasonStatus');
            $(document).off('click', '#btn-back');
            $(document).off('click', '#new-subreason');
            $(document).off('click', '.btn-edit');
            $(document).off('click', '.btn-remove');
            $('#create-subreason').validationEngine('detach');
            $('#edit-subreason').validationEngine('detach');
            $('#edit-reason').validationEngine('detach');
        }
    };
}(jQuery);