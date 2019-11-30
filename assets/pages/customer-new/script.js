var DFT = function ($) {
    var bindClick = function () {
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
        // Xác nhận tạo mới khách hàng
        $('#add-new-customer').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/customer', 'POST', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'customer';
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
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#fieldType');
            $(document).off('click', '#field-settings .zmdi-plus');
            $(document).off('click', '#field-settings .zmdi-minus');
            $('#add-new-customer').validationEngine('detach');
        }
    };
}(jQuery);