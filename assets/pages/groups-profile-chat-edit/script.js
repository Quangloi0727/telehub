var DFT = function ($) {

    var bindClick = function () {

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
                    profile.skills = skills;
                    if(profile.skills.length == 0) return false;

                    _Ajax(window.location.hash.replace('/edit','').replace('#', ''), 'PUT', [{data: JSON.stringify(profile)}], function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'groups-profile-chat';
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
                "url": "/groups-profile-chat/validate",
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
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $('#update-profile').validationEngine('detach');
        }
    };
}(jQuery);