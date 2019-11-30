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
            {tag: 'tr', attr: {class: 'skill'}, childs: [
                {tag: 'td', attr: {class: 'text-center'}, content: (obj.index + 1)},
                {tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
                        {tag: 'label', childs: [
                            {tag: 'input', attr: {class: 'selectSkill', type: "checkbox", value: obj._id}},
                            {tag: 'i', attr: {class: 'input-helper'}}
                        ]}
                    ]}
                ]},
                {tag: 'td', content: obj.skillName},
                {tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'input', attr: {class: 'w-80 orderSkill', type: "number", value: "0"}}
                ]}
            ]}
        ]);
    };

    var bindClick = function () {
        // Thay đổi trạng thái profile
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });

        $(document).on('click', '#skills-setting .zmdi-plus', function () {
            $('#field-settings .fg-line').validationEngine('updatePromptsPosition');
            $(this).closest('.fg-line').append(_.Tags([{
                tag: 'div', attr: {class: 'input-group m-t-20'},
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

        $(document).on('click', '#skills-setting .zmdi-minus', function () {
            $(this).closest('.input-group').remove();
            $('#skills-setting .fg-line').validationEngine('updatePromptsPosition');
        });

        $(document).on('change', '#idCompany', function(e){
            $('#group-skill').empty().selectpicker('refresh');
            $('.option-s').remove();
            var url = '/groups-profile-chat?idCompany=' + $(this).find(":checked").val();
            $.get(url, function(res){
                _.each(res, function(g, i){
                    g.index = i;
                    $('#group-skill').append(newOption_s(g)).selectpicker('refresh');
                });
            });
        });
    };

    var bindSubmit = function () {
        $('#add-new-profile').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    var profile = $('#add-new-profile').serializeJSON();
                    var skills = _.compact($.map($('.selectSkill'), function(n, i){
                        var _tr = $(n).closest('tr');
                        var _order = $(_tr).find('.orderSkill').val() ? Number($(_tr).find('.orderSkill').val()) : 0;
                        return  $(n).is(":checked") ? {idSkill: $(n).val(), order: _order} : null;
                    }));

                    if (skills.length == 0){
                        $('.skill').validationEngine('showPrompt', 'Phải có ít nhất 1 kỹ năng', 'error', 'topRight', true);
                        return false;
                    }
                    else{
                        profile.skills = skills;
                        _Ajax('/groups-profile-chat', 'POST', [{data: JSON.stringify(profile)}], function (resp) {
                            if (_.isEqual(resp.code, 200)) {
                                window.location.hash = 'groups-profile-chat';
                            } else {
                                swal({title: 'Thông báo !', text: resp.message});
                            }
                        });
                    }
                }
            }
        });
    };

    return {
        init: function () {
            var dualList = $('select[name="skills[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng kỹ năng: {0}</b></a>"
            });

            $(".bootstrap-duallistbox-container").find(".moveall").parent().remove();
            $(".bootstrap-duallistbox-container").find(".removeall").parent().remove();

            $.validationEngineLanguage.allRules['ProfileCheck'] = {
                "url": "/groups-profile-chat/validate",
                "extraData": "",
                "extraDataDynamic": ['#name'],
                "alertText": "* Nhóm kỹ năng đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };


            $('.connected').sortable({
                connectWith: '.connected'
            });

            //Fill company select picker
            $('#idCompany').empty().selectpicker('refresh');
            var urll = '/company?status=1';
            $.get(urll, function(res){
                _.each(res.companies, function(g, i){
                    g.index = i;
                    $('#idCompany').append(newOption(g)).selectpicker('refresh');
                });

                $('#group-skill').empty().selectpicker('refresh');
                $('.option-s').remove();
                var url = '/groups-profile-chat?idCompany=' + res.companies[0]._id;
                $.get(url, function(res){
                    _.each(res, function(g, i){
                        g.index = i;
                        $('#group-skill').append(newOption_s(g)).selectpicker('refresh');
                    });
                });
            });


            bindClick();
            bindSubmit();
        },
        uncut: function(){
            $(document).off('change', '#status');
            $(document).off('click', '#skills-setting .zmdi-plus');
            $(document).off('click', '#skills-setting .zmdi-minus');
            $(document).off('change', '#idCompany');
            $('#add-new-profile').validationEngine('detach');
        }
    };
}(jQuery);