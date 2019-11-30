var DFT = function ($) {
    var bindClick = function () {
        // Cập nhật giao diện khi thay đổi fieldType
        $(document).on('change', '#fieldType', function () {
            var _type = Number($(this).val());
            $('#field-settings .input-group.m-b-20').remove();
            switch (_type) {
                case 4:
                case 5:
                    $('#field-settings').removeClass('hidden').find('input[type="text"]').val('');
                    break;
                default:
                    $('#field-settings').addClass('hidden');
                    break;
            }
        });
        // Cập nhật giao diện khi click setting
        $(document).on('click', '#field-settings .zmdi-plus', function () {
            $(this).closest('.fg-line').prepend(_.Tags([{
                tag: 'div', attr: {class: 'input-group m-b-20'},
                childs: [
                    {tag: 'input', attr: {type: 'text', class: "form-control", name: "fieldValue[]", placeholder: "..."}},
                    {
                        tag: 'span', attr: {class: "input-group-addon p-l-10 bgm-gray c-white"},
                        childs: [
                            {tag: 'i', attr: {role: "button", class: "m-r-10 zmdi zmdi-plus"}},
                            {tag: 'i', attr: {role: "button", class: "m-l-10 zmdi zmdi-minus"}}
                        ]
                    }
                ]
            }]));
        });
        $(document).on('click', '#field-settings .zmdi-minus', function () {
            $(this).closest('.input-group').remove();
        });
    };

    var bindSubmit = function () {
        // Xác nhận tạo mới subreason
        $('#add-new-subreason').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/ticket-subreason', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.href = '/ticket';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
    };

    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['SubreasonCheck'] = {
                "url": "/ticket-subreason/validate",
                "extraDataDynamic": ['#validate-subreason-for-name'],
                "alertText": "* Tên lí do này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.zmdi-refresh');
            $(document).off('click', '#field-settings .zmdi-minus');
            $(document).off('click', '#field-settings .zmdi-plus');
            $(document).off('change', '#fieldType');
            $('#frm-item form').validationEngine('detach');
        }
    };
}(jQuery);