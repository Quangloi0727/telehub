/**
 * Created by luongvanlam on 1/13/16.
 */
var DFT = function ($) {

    // Sự kiện click
    var bindClick = function () {
        // Thay đổi trạng thái công ty
        $(document).on('change', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });

        //$(document).on('change', 'select.tag-select', function () {
        //    $(this).validationEngine.hide();
        //});

        $(document).on('click', '#cancelInput', function () {
        //$("#cancelInput").click(function(){
            window.history.back();
        });
    };

    // Sự kiện submit
    var bindSubmit = function () {
        // Click xác nhận tạo mới công ty
        $('#add-new-company').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            useSuffix: "_chosen",
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    //_AjaxData('/company', 'POST', $(form).getData(), function (resp) {
                    //    if (_.isEqual(resp.code, 200)) {
                    //        window.location.hash = 'company';
                    //    } else {
                    //        swal({title: 'Thông báo !', text: JSON.stringify(resp.message)});
                    //    }
                    //});
                    var newTrunks= _.map($('select[name="trunks[]_helper2"] option'), function(item, index){
                        return $(item).val()
                    })
                    var data= {trunks: newTrunks, socketId: _socket.socket.sessionid};
                    _socket.emit('checkTrunkReq', data);

                    $('.page-loader').show();
                }
            }
        });
    };

    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindTextValue = function(){
        //$('#company-profile-text').val(_config.MESSAGE.COMPANY.COMPANY_PROFILE + '<span class="required">*</span>');
        $('#txt_company_name').html(_config.MESSAGE.COMPANY.TEXT_COMPANY_NAME + "<span class='required'>*</span>");
        $('#txt_company_profile').html(_config.MESSAGE.COMPANY.TEXT_COMPANY_PROFILE + "<span class='required'>*</span>");
        $('#txt_company_leader').html(_config.MESSAGE.COMPANY.TEXT_COMPANY_LEADER + "<span class='required'>*</span>");
        $('#txt_recipe_SLA').html(_config.MESSAGE.COMPANY.TEXT_RECIPE_SLA);
        $('#txt_recipe_SLA_Chat').html(_config.MESSAGE.COMPANY.TEXT_RECIPE_SLA_CHAT);
        $('#txt_company_agent').html(_config.MESSAGE.COMPANY.TEXT_COMPANY_AGENT_GROUP);
        $('#txt_company_status').html(_config.MESSAGE.COMPANY.TEXT_STATUS);
        $('#txt_company_trunk').html(_config.MESSAGE.COMPANY.TEXT_TRUNK + "<span class='required'>*</span>");
    };

    // Cấu hình nhận socket từ server
    var bindSocket= function(client){
        $('#socketId').val(_socket.socket.sessionid);
        // Nhận dữ liệu Trunk
        client.on('checkTrunkResponse', function(data){
            //console.log(data);
            var result=data;

            if(result.resCode==0){
                //chưa tồn tại
                _AjaxData('/company', 'POST', $("#add-new-company").getData(), function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        window.location.hash = 'company';
                    } else {
                        swal({title: 'Thông báo !', text: JSON.stringify(resp.message)});
                    }
                });
            }else{
                $('.page-loader').hide();
                $('#trunks').validationEngine('showPrompt', 'Trunk đã được sử dụng', 'error')

                $('html, body').animate({
                    scrollTop: $("#trunks").offset().top-100
                }, 500);
            }
        })
    }

    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['CompanyNameCheck'] = {
                "url": "/company/validate",
                "extraData": '',
                "extraDataDynamic": ['#name'],
                "alertText": "* Trùng tên công ty",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            // Cấu hình thẻ dual list box
            var dualList = $('select[name="managerId[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng user: {0}</b></a>"
            });

            var dualListAgent = $('select[name="agentId[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng AgentGroup: {0}</b></a>"
            });
            var dualListTrunks = $('select[name="trunks[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng Trunk: {0}</b></a>"
            });

            //var dualListProfile = $('select[name="companyProfileId[]"]').bootstrapDualListbox({
            //    filterTextClear: 'Filter',
            //    infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
            //    infoText: "<a class='c-blue' ><b>Số lượng hồ sơ: {0}</b></a>"
            //});

            $(".bootstrap-duallistbox-container").find(".moveall").parent().remove();
            $(".bootstrap-duallistbox-container").find(".removeall").parent().remove();

            bindClick();
            bindSubmit();
            bindTextValue();
            bindSocket(_socket);
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#status');
            $(document).off('click', '#cancelInput');
            $('#add-new-company').validationEngine('detach');
            delete _socket.$events['checkTrunkResponse'];
        }
    };
}(jQuery);