/**
 * Created by NghiaTM on 1/18/2016.
 */

var DFT = function ($) {
    //var addProfile = function(comId){
    //    $('#idProfile option').each(function(i,e){
    //        if(!_.isEqual($(e).val(),''))e.remove();
    //    });
    //
    //    $('#idProfile').append(_.Tags(
    //        _.chain(_.find(companies,function(com){
    //                return _.isEqual(com._id.toString(), comId);
    //            }).groupprofiles)
    //            .reduce(function(memo,profile){
    //                memo.push(
    //                    {tag: 'option', attr: {value: profile._id}, content: profile.name}
    //                );
    //                return memo;
    //            },[])
    //            .value()
    //    ));
    //    $('#idProfile').val(currGroup.idProfile);
    //    $('#idProfile').selectpicker('refresh');
    //};

    /**
     * Tạo thẻ của option của thẻ selectpicker
     * @param obj Dữ liệu của thẻ
     * @param selected Chọn hay không
     * @returns {*}
     */
    var newOption = function (obj, selected) {
        var tag = {};
        if (!_.isUndefined(selected) &&  !_.isNull(selected)) {
            if (_.isEqual(selected, obj._id)) {
                tag = {
                    tag: 'option',
                    attr: {class: 'option-g', value: obj._id},
                    sattr: ['selected'],
                    content: obj.name
                };
            } else {
                tag = {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name};
            }
        } else {
            tag = {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name};
        }
        return _.Tags([
            tag
        ]);
    };

    /**
     * Lấy dữ liệu group profile từ server và hiển thị lên giao diện
     */
    var initGroupProfiles = function () {
        $.get('/agent-groups', {idCompany: $('#idParent').val(), status: 1, code: 1}, function (res) {
            $('#update-group #idProfile').empty();
            $('#update-group #idProfile').append('<option value="" >---- Chọn ----</option>');
            _.each(res, function (g, i) {
                $('#update-group #idProfile').append(newOption(g, currGroup.idProfile));
            });
            $("#update-group #idProfile").selectpicker('refresh');
        });
        $.get('/agent-groups', {idCompany: $('#idParent').val(), status: 1, code: 2}, function (res) {
            $('#update-group #idProfileChat').empty();
            $('#update-group #idProfileChat').append('<option value="" >---- Chọn ----</option>');
            _.each(res, function (g, i) {
                $('#update-group #idProfileChat').append(newOption(g, currGroup.idProfileChat));
            });
            $("#update-group #idProfileChat").selectpicker('refresh');
        });
        $.get('/agent-groups', {idCompany: $('#idParent').val(), status: 1, code: 3}, function (res) {
            $('#update-group #idProfileMail').empty();
            $('#update-group #idProfileMail').append('<option value="" >---- Chọn ----</option>');
            _.each(res, function (g, i) {
                $('#update-group #idProfileMail').append(newOption(g, currGroup.idProfileMail));
            });
            $("#update-group #idProfileMail").selectpicker('refresh');
        });
    }

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
            initGroupProfiles();
        });

        // Khi thay đổi giá trị của danh sách trưởng nhóm
        $(document).on('change', '#leaders', function () {
            var leaders = $(this).val();
            var members = $('#members').val();
            $('#members').bootstrapDualListbox().val(_.difference(members, leaders));
            $('#members').bootstrapDualListbox('refresh');
            setDisableSelect($('#disableAgents').val());

        });

        // Khi thay đổi giá trị của thành viên trong nhóm
        $(document).on('change', '#members', function () {
            var members = $(this).val();
            var leaders = $('#leaders').val();
            $('#leaders').bootstrapDualListbox().val(_.difference(leaders, members));
            $('#leaders').bootstrapDualListbox('refresh');
            setDisableSelect($('#disableAgents').val());
        });
    };

    // Cập nhật danh sách agent NoACD
    var setDisableSelect = function(selected){
        var html = '';
        $('#leaders').children('option').each(function () {
            if($(this).attr('selected')){
                html += '<option class="duallist-option" value="'+ $(this).attr('value') +'">  '+ $(this).html() +' </option>';
            };
        });

        $('#members').children('option').each(function () {
            if($(this).attr('selected')){
                html += '<option class="duallist-option" value="'+ $(this).attr('value') +'">  '+ $(this).html() +' </option>';
            };
        });

        $('#disableAgents').html(html);
        $('#disableAgents').bootstrapDualListbox().val(selected);
        $('#disableAgents').bootstrapDualListbox('refresh');
    };

    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {

        $('#update-group').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData(window.location.hash.replace('/edit', '').replace('#', ''), 'PUT', $(form).getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'agent-groups';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message.message});
                        }
                    });
                }
            }
        });
    };

    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindtextValue = function () {
        $('#edit_agent_name_group').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_GROUPS);
        $('#edit_agent_company').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_COMPANY);
        $('#edit_agent_call').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_CALL);
        $('#edit_agent_chat').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_CHAT);
        $('#edit_agent_mail').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_MAIL);
        $('#edit_agent_status_agent').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_STATUS_AGENT);
        $('#edit_agent_list_leader').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_LIST_LEADER);
        $('#edit_agent_lits_agent').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_LIST_AGENT);
        $('#edit_agent_status').html(_config.MESSAGE.AGENT_GROUPS.EDIT_TEXT_AGENT_STATUS);


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

            var dualListAgent = $('select[name="disableAgents[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng agent: {0}</b></a>"
            });

            $(".bootstrap-duallistbox-container").find(".moveall").parent().remove();
            $(".bootstrap-duallistbox-container").find(".removeall").parent().remove();

            // Cấu hình validation
            $.validationEngineLanguage.allRules['GroupAvailCheck'] = {
                "url": "/agent-groups/validate",
                "extraData": "type=update",
                "extraDataDynamic": ['#name,#cName'],
                "alertText": "* Nhóm này đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            bindClick();
            bindSubmit();
            bindtextValue();

            //addProfile($('#idParent').val());
            initGroupProfiles();
            setDisableSelect(agentDisable);
        },
        // xóa sự kiện khi rời trang
        uncut: function () {
            $(document).off('change', '#status');
            $(document).off('change', '#idParent');
            $(document).off('change', '#leaders');
            $(document).off('change', '#members');
            $(document).off('click', '#btn-back');
            $('#update-group').validationEngine('detach');
        }
    };
}(jQuery);