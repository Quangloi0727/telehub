/**
 * Created by NghiaTM on 1/18/2016.
 */

var DFT = function ($) {
    //var addProfile = function (comId) {
    //    $('#idProfile option').each(function (i, e) {
    //        if (!_.isEqual($(e).val(), ''))e.remove();
    //    });
    //
    //    $('#idProfile').append(_.Tags(
    //        _.chain(_.find(companies, function (com) {
    //                return _.isEqual(com._id.toString(), comId);
    //            }).groupprofiles)
    //            .reduce(function (memo, profile) {
    //                memo.push(
    //                    {tag: 'option', attr: {value: profile._id}, content: profile.name}
    //                );
    //                return memo;
    //            }, [])
    //            .value()
    //    ));
    //    $('#idProfile').selectpicker('refresh');
    //};

    /**
     * Tạo thẻ của option của thẻ selectpicker
     * @returns {*}
     */
    var newOption = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
        ]);
    };

    /**
     * Bắt sự kiện click
     */
    var bindClick = function () {
        // Thay đổi trạng thái
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));

        });

        // Nhấn nút back
        $(document).on('click', '#btn-back', function () {
            window.location.hash = 'agent-groups';
        });

        // Khi thay đổi giá trị của công ty
        $(document).on('change', '#idParent', function () {
            $.get('/agent-groups', {idCompany: $('#idParent').val(), status:1, code: 1}, function(res){
                $('#add-new-group #idProfile').empty();
                $('#add-new-group #idProfile').append('<option value="" selected>---- Chọn ----</option>');
                _.each(res, function(g, i){
                    $('#add-new-group #idProfile').append(newOption(g));
                });
                $("#add-new-group #idProfile").selectpicker('refresh');
            });
            $.get('/agent-groups', {idCompany: $('#idParent').val(), status:1, code: 2}, function(res){
                $('#add-new-group #idProfileChat').empty();
                $('#add-new-group #idProfileChat').append('<option value="" selected>---- Chọn ----</option>');
                _.each(res, function(g, i){
                    $('#add-new-group #idProfileChat').append(newOption(g));
                });
                $("#add-new-group #idProfileChat").selectpicker('refresh');
            });
            $.get('/agent-groups', {idCompany: $('#idParent').val(), status:1, code: 3}, function(res){
                $('#add-new-group #idProfileMail').empty();
                $('#add-new-group #idProfileMail').append('<option value="" selected>---- Chọn ----</option>');
                _.each(res, function(g, i){
                    $('#add-new-group #idProfileMail').append(newOption(g));
                });
                $("#add-new-group #idProfileMail").selectpicker('refresh');
            });
        });

        // Khi thay đổi giá trị của danh sách trưởng nhóm
        $(document).on('change', '#leaders', function () {
            var leaders = $(this).val();
            var members = $('#members').val();
            $('#members').bootstrapDualListbox().val(_.difference(members, leaders));
            $('#members').bootstrapDualListbox('refresh');
        });

        // Khi thay đổi giá trị của thành viên trong nhóm
        $(document).on('change', '#members', function () {
            var members = $(this).val();
            var leaders = $('#leaders').val();
            $('#leaders').bootstrapDualListbox().val(_.difference(leaders, members));
            $('#leaders').bootstrapDualListbox('refresh');
        });
    };

    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {
        $('#add-new-group').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    //var notPass = (_.isNull($('#idProfile').val()) && _.isNull($('#idProfileChat').val())&& _.isNull($('#idProfileMail').val()));
                    //if (!notPass) {
                        _AjaxData('/agent-groups', 'POST', $(form).getData(), function (resp) {
                            if (_.isEqual(resp.code, 200)) {
                                window.location.hash = 'agent-groups';
                            } else {
                                swal({title: 'Thông báo !', text: resp.message.message});
                            }
                        });
                    //}
                    //else {
                    //    $('#idProfile').validationEngine('showPrompt', 'Phải có ít nhất 1 kỹ năng', 'error', 'topRight', true);
                    //    $('#idProfileChat').validationEngine('showPrompt', 'Phải có ít nhất 1 kỹ năng', 'error', 'topRight', true);
                    //    $('#idProfileMail').validationEngine('showPrompt', 'Phải có ít nhất 1 kỹ năng', 'error', 'topRight', true);
                    //    return false;
                    //}
                }
            }
        });
    };

    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindtextValue = function () {
        $('#new_agent_name_group').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_GROUPS);
        $('#new_agent_company').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_COMPANY);
        $('#new_agent_call').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_CALL);
        $('#new_agent_chat').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_CHAT);
        $('#new_agent_mail').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_MAIL);
        $('#new_agent_status_agent').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_STATUS_AGENT);
        $('#new_agent_list_leader').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_LIST_LEADER);
        $('#new_agent_lits_agent').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_LIST_AGENT);
        $('#new_agent_status').html(_config.MESSAGE.AGENT_GROUPS.NEW_TEXT_AGENT_STATUS);

    };
    return {
        init: function () {
            // Cấu hình thẻ dual list box
            var dualListLeader = $('select[name="leaders[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng leader: {0}</b></a>"
            });

            var dualListAgent = $('select[name="members[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng agent: {0}</b></a>"
            });
            $(".bootstrap-duallistbox-container").find(".moveall").parent().remove();
            $(".bootstrap-duallistbox-container").find(".removeall").parent().remove();

            // Cấu hình validation
            $.validationEngineLanguage.allRules['GroupAvailCheck'] = {
                "url": "/agent-groups/validate",
                "extraData": "type=new",
                "extraDataDynamic": ['#name'],
                "alertText": "* Nhóm này đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            bindClick();
            bindSubmit();
            bindtextValue();

        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $(document).off('change', '#status');
            $(document).off('change', '#idParent');
            $(document).off('change', '#leaders');
            $(document).off('change', '#members');
            $(document).off('click', '#btn-back');
            $('#add-new-group').validationEngine('detach');
        }
    };
}(jQuery);