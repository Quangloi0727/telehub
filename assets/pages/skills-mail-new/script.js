var DFT = function ($) {

    var bindClick = function () {
        $(document).on('change', '#status', function () {
            //active/ inactive kĩ năng
            $(this).val(Number($(this).is(':checked')));
        });
        $(document).on('click', '#btn-back', function () {
            //Back lại trang kĩ năng
            window.location.hash = 'skills-mail';
        });
    };

    var bindSubmit = function () {
        $(document).on('submit', '#add-new-skill', function(e){
            //Thêm kĩ năng mới
            e.preventDefault();
            $('.formError').remove(); //xóa bỏ các msg error nếu có
            async.waterfall([
                function(cb){
                    //Check xem có tồn tại tên kĩ năng này trước đó không
                    $.get('/skills-mail/validate?company=' + $('#company').val() + '&name=' + $('#skillName').val() + '&currName=' + $('#btn-submit').val(), function(resp){
                        if (!resp.code){
                            $('#skillName').validationEngine('showPrompt', 'Đã tồn tại kỹ năng này', 'error', 'topRight', true);
                        }
                        cb(null, resp.code);
                    });
                }
            ], function(err, resp){
                if (resp){
                    //Cập nhật dữ liệu mới lên server
                    _AjaxObject('/skills-mail', 'POST', $('#add-new-skill').getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'skills-mail';
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
            $.validationEngineLanguage.allRules['SkillCheck'] = {
                "url": "/skills-chat/validate",
                "extraData": "",
                "extraDataDynamic": ['#skillName'],
                "alertText": "* Đã tồn tại kỹ năng này",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            $(document).off('change', '#status');
            $(document).off('click', '#btn-back');
            $(document).off('submit', '#add-new-skill');
        }
    };
}(jQuery);