var DFT = function ($) {

    var bindClick = function () {
        $(document).on('click', '#formStatus', function(e){
            //Ẩn hoặc hiện các yêu cầu nhập thông tin vào form chat
            if ($(this).is(":checked")) $('.hiddenField').removeClass('hidden');
            else{
                $('.hiddenField').addClass('hidden');
            }
        });
    };

    var bindSubmit = function () {
        $(document).on('submit', '#update-channel', function(e){
            //Cập nhật thông tin kênh
            e.preventDefault();
            $('.formError').remove(); //Xóa các form cảnh báo cũ
            async.parallel({
                one: function(cb){
                    //validate tên kênh
                    $.get('/company-channel/validate?company=' + $('#company').val() + '&name=' + $('#name').val() + '&currName=' + $('.submit-edit').attr('currName'), function(resp){
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
                    _AjaxObject(window.location.hash.replace('/edit', '').replace('#', ''), 'PUT', $('#update-channel').getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = '/company-channel';
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
            $(document).off('click', '#update-channel');
        }
    };
}(jQuery);