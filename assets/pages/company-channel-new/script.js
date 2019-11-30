var DFT = function ($) {

    var bindClick = function () {
        //Ẩn hoặc hiện các yêu cầu nhập thông tin vào form chat
        $(document).on('click', '#formStatus', function(e){
            if ($(this).is(":checked")) $('.hiddenField').removeClass('hidden');
            else{
                $('.hiddenField').addClass('hidden');
            }
        });
    };

    var bindSubmit = function () {
        $(document).on('submit', '#add-new-channel', function(e){
            //Tạo kênh mới
            e.preventDefault();
            $('.formError').remove(); //Xóa các form cảnh báo cũ
            async.parallel({
                one: function(cb){
                    //validate tên kênh
                    $.get('/company-channel/validate?company=' + $('#idCompany').val() + '&name=' + $('#name').val(), function(resp){
                        if (!resp.code){
                            $('#name').validationEngine('showPrompt', 'Đã tồn tại channel này', 'error', 'topRight', true);
                        }
                        cb(null, resp.code);
                    });
                }
            }, function(err, resp){
                if (resp.one){
                    //Đã pass qua các validate rule
                    //Gửi request update
                    _AjaxObject('/company-channel', 'POST', $('#add-new-channel').getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = '#company-channel';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            });
        });
    };

    return {
        init: function () {
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            $(document).off('click', '#formStatus');
            $(document).off('submit', '#add-new-channel');
            $(document).off('change', '#name');
            $(document).off('change', '#website');
            $(document).off('change', '#idCompany');
        }
    };
}(jQuery);