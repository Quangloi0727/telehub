var DFT = function ($) {
    // Cập nhật dữ liệu kỹ năng lên giao diện
    var addSkills = function(comId){
        $('.skills-table tbody').append(_.Tags(
            _.chain(_.find(companies,function(com){
                    return _.isEqual(com._id.toString(), comId);
                }).skills)
                .reduce(function(memo,skill){
                    memo.push(
                        {tag: 'tr', attr: {class: 'text-center skill'}, childs: [
                            {tag:'td', attr: {class: 'text-center'}, content: memo.length +1},
                            {tag:'td', attr: {class: 'text-center'}, childs: [
                                {tag:'div', attr: {class: 'checkbox m-0'}, childs: [
                                    {tag:'label', childs:[
                                        {tag: 'input', attr: {class: 'selectSkill', type: 'checkbox', value:skill._id}},
                                        {tag: 'i', attr: {class: 'input-helper'}}
                                    ]}
                                ]}
                            ]},
                            {tag:'td', content: skill.skillName},
                            {tag:'td', attr: {class: 'text-center'}, childs: [
                                {tag:'input ', attr: {class: 'w-80 orderSkill', type: 'number', value: 0}}
                            ]}
                        ]}
                    );
                    return memo;
                },[])
                .value()
        ));
        _.each(currentProfile.skills, function(skill){
            var _tr = $('.skills-table').find('input[value='+ skill.idSkill +']').closest('tr');
            $(_tr).find('.selectSkill').prop('checked', 'checked');
            $(_tr).find('.orderSkill').val(skill.order);
        });
    }

    var bindClick = function () {
        // Thay đổi trạng thái profile
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });

        // Thay đổi trạng thái ghi âm
        $(document).on('change', '#recordingState', function () {
            $(this).val(Number($(this).is(':checked')));
        });

        // Thay đổi dữ liệu công ty
        $(document).on('change', '#idCompany', function () {
            $('.skills-table tbody').empty();
            addSkills($(this).val());
        });
    };

    var bindSubmit = function () {
        // Xác nhận cập nhật dữ liệu
        $('#update-profile').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    var profile = $('#update-profile').serializeJSON();
                    var skills = _.compact($.map($('.selectSkill'), function(n, i){
                        var _tr = $(n).closest('tr');
                        var _order = $(_tr).find('.orderSkill').val() ? Number($(_tr).find('.orderSkill').val()) : 0;
                        return  $(n).is(":checked") ? {idSkill: $(n).val(), order: _order} : null;
                    }));

                    if(skills.length == 0){
                        $('.skill').validationEngine('showPrompt', 'Phải có ít nhất 1 kỹ năng', 'error', 'topRight', true);
                        return false;
                    }
                    else{
                        profile.skills = skills;
                        _Ajax(window.location.hash.replace('/edit', '').replace('#',''), 'PUT', [{data: JSON.stringify(profile)}], function (resp) {
                            if (_.isEqual(resp.code, 200)) {
                                window.location.hash = 'groups-profile';
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
            // Cấu hình thẻ dual list box
            var dualList = $('select[name="skills[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng kỹ năng: {0}</b></a>"
            });

            $(".bootstrap-duallistbox-container").find(".moveall").parent().remove();
            $(".bootstrap-duallistbox-container").find(".removeall").parent().remove();

            // Cấu hình validation
            $.validationEngineLanguage.allRules['ProfileCheck'] = {
                "url": "/groups-profile/validate",
                "extraData": "",
                "extraDataDynamic": ['#name', '#updateId'],
                "alertText": "* Nhóm kỹ năng đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            }

            $('.connected').sortable({
                connectWith: '.connected'
            });

            bindClick();
            bindSubmit();

            addSkills($('#idCompany').val());
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#status');
            $(document).off('change', '#recordingState');
            $(document).off('change', '#idCompany');
            $('#update-profile').validationEngine('detach');
        }
    };
}(jQuery);