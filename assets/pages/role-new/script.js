var DFT = function ($) {
    var bindClick = function () {
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });
        $(document).on('click', '#btn-back', function () {
            window.location.hash = 'role';
        });
    };

    var bindSubmit = function () {
        $('#add-new-role').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true, validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxObject('/role', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'role';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
    };
    var bindtextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.ROLE), function(item){
            $('.' + item).html(_config.MESSAGE.ROLE[item]);
        });
    };

    return {
        init: function () {
            $.validationEngineLanguage.allRules['RoleCheck'] = {
                "url": "/role/validate",
                "extraData": "",
                "extraDataDynamic": ['#name'],
                "alertText": "* Đã tồn tại kỹ năng này",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();
            bindtextValue();
        },
        uncut: function(){
            $(document).off('change', '#status');
            $(document).off('click', '#btn-back');
            $('#add-new-role').validationEngine('detach');
        }
    };
}(jQuery);