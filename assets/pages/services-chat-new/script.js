var DFT = function ($) {
    // Tạo thẻ option cho thẻ selectpicker
    var newOption = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
        ]);
    };

    // Tạo thẻ option cho thẻ selectpicker
    var newOption_s = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-s', value: obj._id}, content: obj.skillName}
        ]);
    };

    var bindClick = function () {
//        $(document).on('change', '#idCompany', function () {
//            console.log($('#idCompany').val());
//        });

        // Cập nhật lại giao diện khi thay đổi công ty
        $(document).on('change', '#idCompany', function(e){
            var $this = $(this);
            $('#idChannel').empty().selectpicker('refresh');
            $('.option-g').remove();
            var url = (_.isEqual($this.find(":checked").val(), '0')) ? '/company-channel?status=1' : ('/company-channel?status=1&idCompany=' + $this.find(":checked").val());
            $.get(url, function(res){
                _.each(res.channel, function(g, i){
                    $('#idChannel').append(newOption(g)).selectpicker('refresh');
                });
            });

            $('#idSkill').empty().selectpicker('refresh');
            $('.option-s').remove();
            $.get('/skills-chat?status=1&idCompany=' + $this.find(":checked").val(), function(res){
                _.each(res, function(g, i){
                    $('#idSkill').append(newOption_s(g)).selectpicker('refresh');
                });
            });
        });
    };

    var bindSubmit = function () {
        // Xác nhận cập nhật service
        $('#add-new-service').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('/services-chat', 'POST', $(form).getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = '#services-chat';
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
            $.validationEngineLanguage.allRules['ServiceCheck'] = {
                "url": "/services-chat/validate",
                "extraData": "",
                "extraDataDynamic": ['#name', '#idChannel'],
                "alertText": "* Chiến dịch đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            // Cấu hình validation
            $.validationEngineLanguage.allRules['DurLowCheck'] = {
                "func": function(){
                    return Number($('#highAlert').val()) > Number($('#lowAlert').val());
                },
                "alertText": "* Giá trị ngưỡng vàng phải nhỏ hơn ngưỡng đỏ"
            };

            $('#idSkill').empty().selectpicker('refresh');
            $('.option-s').remove();
            $.get('/skills-chat?status=1&idCompany=' + $('#idCompany').find(":checked").val(), function(res){
                _.each(res, function(g, i){
                    $('#idSkill').append(newOption_s(g)).selectpicker('refresh');
                });
            });

            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#idCompany');
            $('#add-new-service').validationEngine('detach');
        }
    };
}(jQuery);