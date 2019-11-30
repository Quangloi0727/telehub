var DFT = function ($) {
    // Tạo thẻ option cho thẻ selectpicker
    var newOption_c = function(obj,id){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-c', value: obj._id}, sattr: [_.isEqual(obj._id, id) ? 'selected' :''] , content: obj.name}
        ]);
    };

    // Tạo thẻ option cho thẻ selectpicker
    var newOption_cn = function(obj,id){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-cn', value: obj._id}, sattr: [_.isEqual(obj._id, id) ? 'selected' :''] , content: obj.name}
        ]);
    };

    // Tạo thẻ option cho thẻ selectpicker
    var newOption_s = function(obj,id){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-s', value: obj._id}, sattr: [_.isEqual(obj._id, id) ? 'selected' :''] , content: obj.skillName}
        ]);
    };

    // Tạo thẻ option cho thẻ selectpicker
    var newOptionSelect = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
        ]);
    };

    var bindClick = function () {
        // Cập nhật lại giao diện khi thay đổi công ty
        $(document).on('change', '#idCompany', function(e){
            var $this = $(this);
            $('#idChannel').empty().selectpicker('refresh');
            $('.option-cn').remove();
            var url = (_.isEqual($this.find(":checked").val(), '0')) ? '/company-channel?status=1' : ('/company-channel?status=1&idCompany=' + $this.find(":checked").val());
            $.get(url, function(res){
                _.each(res.channel, function(g, i){
                    $('#idChannel').append(newOptionSelect(g)).selectpicker('refresh');
                });
            });

            $('#idSkill').empty().selectpicker('refresh');
            $('.option-s').remove();
            var sUrl = '/skills-chat?status=1&idCompany=' + $this.find(":checked").val();
            $.get(url, function(res){
                _.each(res, function(g, i){
                    $('#idSkill').append(newOptionSelect(g)).selectpicker('refresh');
                });
            });
        });
    };

    var bindSubmit = function () {
        // Xác nhận cập nhật service
        $('#update-service').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData(window.location.hash.replace('/edit','').replace('#', ''), 'PUT', $(form).getData(), function (resp) {
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
                "extraDataDynamic": ['#name', '#idCompany', '#updateId'],
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

            bindClick();
            bindSubmit();

            //Fill company select picker
            $('#idCompany').empty().selectpicker('refresh');
            $('.option-c').remove();
            var urll = '/company?status=1';
            $.get(urll, function(res){
                _.each(res.companies, function(g){
                    $('#idCompany').append(newOption_c(g,companyId)).selectpicker('refresh');
                });
            });

            //Fill channel select picker
            $('#idChannel').empty().selectpicker('refresh');
            $('.option-cn').remove();
            var url = '/company-channel?status=1&idCompany=' + companyId;
            $.get(url, function(res){
                _.each(res.channel, function(g){
                    $('#idChannel').append(newOption_cn(g,channelId)).selectpicker('refresh');
                });
            });

            //Fill skill select picker
            $('#idSkill').empty().selectpicker('refresh');
            $('.option-s').remove();
            var sUrl = '/skills-chat?status=1&idCompany=' + companyId;
            $.get(sUrl, function(res){
                _.each(res, function(g){
                    $('#idSkill').append(newOption_s(g,skillId)).selectpicker('refresh');
                });
            });

        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#idCompany');
            $('#update-service').validationEngine('detach');
        }
    };
}(jQuery);