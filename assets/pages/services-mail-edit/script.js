var DFT = function ($) {

    //var newOption_c = function(obj,id){
    //    return _.Tags([
    //        {tag: 'option', attr: {class: 'option-c', value: obj._id}, sattr: [_.isEqual(obj._id, id) ? 'selected' :''] , content: obj.name}
    //    ]);
    //};

//    var newOption_cn = function(obj,id){
//        return _.Tags([
//            {tag: 'option', attr: {class: 'option-cn', value: obj._id}, sattr: [_.isEqual(obj._id, id) ? 'selected' :''] , content: obj.name}
//        ]);
//    };

    //generate thẻ option
    var newOption_s = function(obj,id){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-s', value: obj._id}, sattr: [_.isEqual(obj._id, id) ? 'selected' :''] , content: obj.skillName}
        ]);
    };

    //var newOptionSelect = function(obj){
    //    return _.Tags([
    //        {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
    //    ]);
    //};

    var bindClick = function () {
        // Cập nhật lại kỹ năng khi thay đổi công ty
        $(document).on('change', '#idCompany', function(e){
            var $this = $(this);
//            $('#idChannel').empty().selectpicker('refresh');
//            $('.option-cn').remove();
//            var url = (_.isEqual($this.find(":checked").val(), '0')) ? '/company-channel?status=1' : ('/company-channel?status=1&idCompany=' + $this.find(":checked").val());
//            $.get(url, function(res){
//                _.each(res.channel, function(g, i){
//                    $('#idChannel').append(newOptionSelect(g)).selectpicker('refresh');
//                });
//            });

//            $('#idSkill').empty().selectpicker('refresh');
//            $('.option-s').remove();
//            var sUrl = '/skills-mail?status=1&idCompany=' + $this.find(":checked").val();
//            $.get(sUrl, function(res){
//                _.each(res, function(g, i){
//                    $('#idSkill').append(newOptionSelect(g)).selectpicker('refresh');
//                });
//            });

            $('#idSkill').empty().selectpicker('refresh');
            $('.option-s').remove();
            var sUrl = '/skills-mail?status=1&idCompany=' + $('#idCompany').val();
            $.get(sUrl, function(res){
                _.each(res, function(g){
                    $('#idSkill').append(newOption_s(g)).selectpicker('refresh');
                });
            });
        });
    };

    var bindSubmit = function () {
        // Xác nhận cập nhật service
        $('#update-service').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                if (status) {
                    var data= $('#update-service').serializeObject();
                    data.isSave= 2;
                    _socket.emit('sendTestConnection', data);


                    $('.page-loader').show();
                    //_AjaxData(window.location.hash.replace('/edit','').replace('#', ''), 'PUT', $(form).getData(), function (resp) {
                    //    if (_.isEqual(resp.code, 200)) {
                    //        window.location.hash = '#services-mail';
                    //    } else {
                    //        swal({title: 'Thông báo !', text: resp.message});
                    //    }
                    //});
                }
            }
        });
    };

    var bindSocket= function(client){
        $('#socketId').val(_socket.socket.sessionid);
        // Kiểm tra kết nối với server
        client.on('testConnectionResponse', function(data){
            //console.log(data);
            var result=data;


            var status=0;
            var reason= "";
            if(result.send_status != 0){
                status=1;
                if(result.send_status_message)
                reason= reason+ "Cấu hình gửi mail: \n"+ result.send_status_message+"\n";
            }
            if(result.receive_status != 0){
                status=1;
                if(result.receive_status_message)
                reason= reason+"Cấu hình nhận mail: \n"+ result.receive_status_message+"\n";
            }

            if(_.has(result, 'otherError')){
                status=1;
                reason= reason+ result.otherError;
            }

            if(status==0){
                if(result.isSave==0){
                    swal({title: 'Thành công', text: 'Kết nối thành công', type: "success"}, function(){
                        $('.page-loader').hide();
                        //$('#submit').show();
                        //$('')
                    });
                }else{
                    _AjaxData(window.location.hash.replace('/edit','').replace('#', ''), 'PUT', $('#update-service').getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = '#services-mail';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                    window.location.hash = 'services-mail';
                }

            }else{
                swal({title: 'Thất bại', text: reason, type: "error"}, function(){
                    $('.page-loader').hide();
                });
            }
        })
    }

    return {
        init: function () {
            $.fn.serializeObject = function() {
                var o = {};
                var a = this.serializeArray();
                $.each(a, function() {
                    if (o[this.name]) {
                        if (!o[this.name].push) {
                            o[this.name] = [o[this.name]];
                        }
                        o[this.name].push(this.value || '');
                    } else {
                        o[this.name] = this.value || '';
                    }
                });
                return o;
            };

            // Cấu hình validation
            $.validationEngineLanguage.allRules['ServiceCheck'] = {
                "url": "/services-mail/validate",
                "extraData": "",
                "extraDataDynamic": ['#name', '#idCompany', '#updateId'],
                "alertText": "* Chiến dịch đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['validateSendUser'] = {
                "url": "/mail-setting/validate",
                "extraData": '',
                "extraDataDynamic": ['#current_send_user'],
                "alertText": "* Tên đăng nhập đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            // Cấu hình validation
            $.validationEngineLanguage.allRules['validateReceiveUser'] = {
                "url": "/mail-setting/validate",
                "extraData": '',
                "extraDataDynamic": ['#current_receive_user'],
                "alertText": "* Tên đăng nhập đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();
            bindSocket(_socket);

//            //Fill company select picker
//            $('#idCompany').empty().selectpicker('refresh');
//            $('.option-c').remove();
//            var urll = '/company?status=1';
//            $.get(urll, function(res){
//                _.each(res.companies, function(g){
//                    $('#idCompany').append(newOption_c(g,companyId)).selectpicker('refresh');
//                });
//            });

            //Fill channel select picker
//            $('#idChannel').empty().selectpicker('refresh');
//            $('.option-cn').remove();
//            var url = '/company-channel?status=1&idCompany=' + $('#idCompany').val();
//            $.get(url, function(res){
//                _.each(res.channel, function(g){
//                    $('#idChannel').append(newOption_cn(g,channelId)).selectpicker('refresh');
//                });
//            });

            //Fill skill select picker
            $('#idSkill').empty().selectpicker('refresh');
            $('.option-s').remove();
            var sUrl = '/skills-mail?idCompany=' + $('#idCompany').val();
            //if(skillId.length!=0)
            $.get(sUrl, function(res){
                _.each(res, function(g){
                    $('#idSkill').append(newOption_s(g,skillId)).selectpicker('refresh');
                });
            });

        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '#status');
            $(document).off('click', '#cancelInput');
            $(document).on('change', '#idCompany')
            delete _socket.$events['testConnectionResponse'];
            $('#update-service').validationEngine('detach');
        }
    };
}(jQuery);