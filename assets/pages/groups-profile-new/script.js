var DFT = function ($) {
    // Cập nhật dữ liệu kỹ năng lên màn hình
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
    }

    var bindClick = function () {
        // Thay đổi trạng thái profile
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });

        // thay đổi trạng thái ghi âm
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
        // Xác nhận tạo mới profile
        $('#add-new-profile').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    var profile = $('#add-new-profile').serializeJSON();
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
                        _Ajax('/groups-profile', 'POST', [{data: JSON.stringify(profile)}], function (resp) {
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
            // Cấu hình thẻ dua list box
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
                "extraDataDynamic": ['#name'],
                "alertText": "* Nhóm kỹ năng đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };


            $('.connected').sortable({
                connectWith: '.connected'
            });


            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#status');
            $(document).off('change', '#recordingState');
            $(document).off('change', '#idCompany');
            $('#add-new-profile').validationEngine('detach');
        }
    };
}(jQuery);