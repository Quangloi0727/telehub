/**
 * Created by luongvanlam on 2/16/16.
 */
var DFT = function ($) {
    var bindClick = function () {
        // Hiển thị password
        $(document).on('mousedown', '.showPwd', function (e) {
        //$('.showPwd').mousedown(function(){
            $(this).parent().find(' :input').attr("type", "text");
        })

        // Ẩn password
        $(document).on('mouseup', '.showPwd', function (e) {
            //.mouseup(function(){
            $(this).parent().find(' :input').attr("type", "password");
        });

        $(document).on('click', '.showPwd', function (e) {
            e.preventDefault();
        });

        // Cậu nhật giao diện khi chọn role PM
        $("#pmRole").chosen().change(function(){
            var role = $(this).val().split('-')[0];

            $(".companyRole").each(function() {
                if (role && $(this).val().length > 0 && role.indexOf($(this).val().split('-')[0]) >= 0 ){
                    $(this).val('');
                    $(this).trigger('chosen:updated');
                }
            });
        });

        // Cập nhật giao diện khi thay đổi company Role
        $(".companyRole").chosen().change(function(){
            var role = $(this).val().split('-')[0];
            if (role && $('#pmRole').val().length > 0 && role.indexOf($('#pmRole').val().split('-')[0]) >= 0 ){
                $('#pmRole').val('');
                $('#pmRole').trigger('chosen:updated');
            }
        });
    }

    var bindSubmit = function () {
        // Xác nhận cập nhật dữ liệu User
        $('#edit-user').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData(window.location.hash.replace('/edit', '').replace('#', ''), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'users';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
    }

    // Hiển thị tên trường theo file config
    var bindTextValue = function () {
        $('#text_user_name').html(_config.MESSAGE.USER_MANAGER.TXT_USER_NAME + '<span class=\"required\">*</span>');
        $('#text_pass_word').html(_config.MESSAGE.USER_MANAGER.TXT_PASS_WORD + '<span class=\"required\">*</span>');
        $('#text_re_pass_word').html(_config.MESSAGE.USER_MANAGER.TXT_RE_PASS_WORD + '<span class=\"required\">*</span>');
        $('#text_display_name').html(_config.MESSAGE.USER_MANAGER.TXT_DISPLAY_NAME + '<span class=\"required\">*</span>');
        $('#text_email').html(_config.MESSAGE.USER_MANAGER.TXT_EMAIL + '<span class=\"required\">*</span>');
        $('#text_status').html(_config.MESSAGE.USER_MANAGER.TXT_STATUS);
        $('#txt_user_name_desc').html(_config.MESSAGE.USER_MANAGER.TXT_USER_NAME_DESC);
        $('#txt_pass_word_desc').html(_config.MESSAGE.USER_MANAGER.TXT_PASS_WORD_DESC);
        $('#txt_re_pass_word_desc').html(_config.MESSAGE.USER_MANAGER.TXT_RE_PASS_WORD_DESC);
        $('#text_display_name_desc').html(_config.MESSAGE.USER_MANAGER.TXT_DISPLAY_NAME_DESC);
        $('#text_role').html(_config.MESSAGE.USER_MANAGER.TXT_ROLE);
    }

    return {
        init: function () {
            bindClick();
            bindSubmit();
            bindTextValue();
            //$('#role-table').find('tr').not('.company').hide();

            $(".role-select").chosen({'.role-select'  : {allow_single_deselect:true}});

            // Cấu hình validation
            $.validationEngineLanguage.allRules['UserNameCheck'] = {
                "url": "/users/validate",
                "extraData": '',
                "extraDataDynamic": ['#name'],
                "alertText": "* Tên này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('mousedown', '.showPwd');
            $(document).off('mouseup', '.showPwd');
            $(document).off('click', '.showPwd');
            $('#edit-user').validationEngine('detach');
        }
    };
}(jQuery);

function checkSpaceInString(field, rules, i, options){
    if (field.val().indexOf(' ') >= 0) {
        // this allows the use of i18 for the error msgs
        return '* ' + _config.MESSAGE.USER_MANAGER.ALERT_SPACE_NOT_ALLOW;
    }
}