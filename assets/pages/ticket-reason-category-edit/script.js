var DFT = function ($) {

    var bindClick = function () {
        // Thay đổi trạng thái
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });
        // Thay đổi trạng thái
        $(document).on('change', '#reasonStatus', function () {
            $(this).val(Number($(this).is(':checked')));
            var _data = {status:Number($(this).is(':checked'))};
            _Ajax('/ticket-reason/' + $(this).attr('data-id'), 'PUT', [_data], function(resp){

            });
        });
        // Quay lại
        $(document).on('click', '#btn-back', function () {
            window.location.hash = 'ticket-reason-category';
        });
        // Click tạo mới reason
        $(document).on('click', '#new-reason', function () {
            $('#form-reason').modal('show');
        });
        // Xóa ticket reason
        $(document).on('click', '.btn-remove', function(){
            id = $(this).attr('data-id');
            url = $(this).attr('data-url');
            swal({
                    title: _config.MESSAGE.TICKETREASON.CONFIRM_DELETE_TICKET_REASON,
                    text: _config.MESSAGE.TICKETREASON.TEXT_CONFIRM_DELETE_TICKET_REASON,
                    type: 'warning', showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject(url + '/' + id, 'DELETE', {}, function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({title: 'Thành công', text: _config.MESSAGE.TICKETREASON.TEXT_SUCCESS_DELETE_TICKET_REASON, type: 'success', html: true}, function () {
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
        // Xác nhận tạo reason
        $('#create-reason').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxObject('/ticket-reason', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
        // Xác nhận cập nhật dữ liệu ticket reason category
        $('#edit-ticket').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxObject(window.location.hash.replace('/edit', '').replace('#', ''), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'ticket-reason-category';
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
    // Cập nhật thứ tự của reason trong category
    var updateIndex = function (e, ui) {
        var _order = [{'bulk-update': true}];
        $('td.index', ui.item.parent()).each(function (i, v) {
            var _o = {};
            _o[$(v).attr('data-weight')] = i + 1;
            _order.push(_o);
            $(this).html(i + 1);
        });
        _Ajax('/ticket-reason', 'POST', _order, function (resp) {
        });
    };
    // Hiển thị tên cột theo file config
    var bindTextValue = function(){
        _.each(_.allKeys(_config.MESSAGE.TICKETREASON_TXT), function(item){
            $('.' + item).html(_config.MESSAGE.TICKETREASON_TXT[item]);
        });
    }
    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['TicketCheck'] = {
                "url": "/ticket-reason-category/validate",
                "extraDataDynamic": ['#validate-ticket-for-name'],
                "alertText": "* Tên nhóm này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['TicketEditCheck'] = {
                "url": "/ticket-reason-category/validate",
                "extraDataDynamic": ['#validate-ticket-for-name', '#validate-ticket-for-x-name'],
                "alertText": "* Tên nhóm này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['ReasonCheck'] = {
                "url": "/ticket-reason/validate",
                "extraDataDynamic": ['#validate-reason-for-name', '#idCategory'],
                "alertText": "* Tên tình trạng này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['ReasonPriorityCheck'] = {
                "url": "/ticket-reason/validate",
                "extraDataDynamic": ['#validate-reason-for-priority', '#validate-reason-for-idCategory'],
                "alertText": "* Mức ưu tiên này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['ReasonEditCheck'] = {
                "url": "/ticket-reason/validate",
                "extraDataDynamic": ['#validate-reason-for-name', '#validate-reason-for-x-name'],
                "alertText": "* Tên tình trạng này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $("#ticket-reason tbody").sortable({helper: fixHelperModified, stop: updateIndex, distance: 5, opacity: 0.6, cursor: 'move'}).disableSelection();
            bindClick();
            bindSubmit();
            bindTextValue();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#status');
            $(document).off('change', '#reasonStatus');
            $(document).off('click', '#btn-back');
            $(document).off('click', '#new-reason');
            $(document).off('click', '.btn-remove');
            $('#create-reason').validationEngine('detach');
            $('#edit-ticket').validationEngine('detach');
        }
    };
}(jQuery);