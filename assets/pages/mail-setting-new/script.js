/**
 * Created by NghiaTM on 4/6/2016.
 */
var DFT = function ($) {

    var bindClick = function () {
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

        $(document).on('click', '#submit', function(){
            $('#add-new-service').validationEngine('validate', {
                onValidationComplete: function (form, status) {
                    if (status) {
                        var data= $('#add-new-service').serializeObject();
                        data.isSave= 1;
                        _socket.emit('sendTestConnection', data);

                        $('.page-loader').show();
                    }
                }
            });
        })

        $(document).on('click', '#testConnection', function(){

            $('#add-new-service').validationEngine('validate', {
                onValidationComplete: function(form, status){
                    if(status){

                        var data= $('#add-new-service').serializeObject();
                        data.isSave= 0;
                        _socket.emit('sendTestConnection', data);

                        $('.page-loader').show();
                    }else{
                    }
                }
            });

        })
    };
    var bindSocket= function(client){
        $('#socketId').val(_socket.socket.sessionid);
        client.on('testConnectionResponse', function(data){
                var result=data;


                var status=0;
                var reason= "";
                if(result.send_status != 0){
                    status=1;

                    reason= reason+ "Cấu hình gửi mail: \n"+ result.send_status_message+"\n";
                }
                if(result.receive_status != 0){
                    status=1;
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
                        window.location.hash = 'mail-setting';
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

            $.validationEngineLanguage.allRules['validateServiceName'] = {
                "url": "/mail-setting/validate",
                "extraData": '',
                "extraDataDynamic": ['#name'],
                "alertText": "* Tên service đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $.validationEngineLanguage.allRules['validateSendUser'] = {
                "url": "/mail-setting/validate",
                "extraData": '',
                "extraDataDynamic": '',
                "alertText": "* Tên đăng nhập đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $.validationEngineLanguage.allRules['validateReceiveUser'] = {
                "url": "/mail-setting/validate",
                "extraData": '',
                "extraDataDynamic": '',
                "alertText": "* Tên đăng nhập đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            bindClick();
            bindSocket(_socket);
        },
        uncut: function(){
            $(document).off('change', '#status');
            $(document).off('click', '#cancelInput');
            delete _socket.$events['testConnectionResponse'];
            $('#add-new-service').validationEngine('detach');

        }
    };
}(jQuery);