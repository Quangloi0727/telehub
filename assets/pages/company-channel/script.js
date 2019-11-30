var DFT = function ($) {

    var bindClick = function () {
        //Bắt sự kiện click vào button search
        $(document).on('click', '#btn-search', function (e) {
            e.preventDefault();
            if ($('#name').val().length > 0 ){
                window.location.obj['name'] = $('#name').val();
            }
            else{
                delete window.location.obj['name'];
            }

            if ($('#company').val().length > 0 ){
                window.location.obj['company'] = $('#company').val();
            }
            else{
                delete window.location.obj['company'];
            }

            if (!_.isEqual($('#status').val(), '-1')){
                window.location.obj['status'] = $('#status').val();
            }
            else{
                delete window.location.obj['status'];
            }

            window.location.hash = newUrl('company-channel', window.location.obj);

        });

        $(document).on('change', '.select-box-all', function () {
            //Chọn tất cả các bản ghi
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked"))
            {
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        });

        $(document).on('change', '.select-box-cell', function () {
            //Chọn bản ghi đơn lẻ
            var x = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0){
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        });

        $(document).on('click', '.btn-remove', function () {
            //Xóa 1 bản ghi
            var _id = $(this).attr('data-id');
            //Hiện alert cảnh báo
            swal({
                    title: _config.MESSAGE.COMPANY_CHANNEL.CONFIRM_DELETE_CHANNEL,
                    text: _config.MESSAGE.COMPANY_CHANNEL.TEXT_CONFIRM_DELETE_CHANNEL,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/company-channel/' + _id, 'DELETE', {}, function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.COMPANY_CHANNEL.TEXT_SUCCESS_DELETE_CHANNEL, type: "success"}, function(){
                            _.LoadPage(window.location.hash);
                        });
                    });
                });
        });

        $(document).on('click', '.btn-code', function () {
            //Lấy mã nhúng kênh chat
            var _id = $(this).attr('data-id');
            var h = "//" + window.location.hostname;
            swal({title: 'Mã nhúng', customClass :'xxxx', text: '<title>Xin chao</title>' +
                '<script type="text/javascript">' +
                'var n = window.location.protocol == "https:" ? "https:" : "http:";' +
                'var r = document.createElement("script");' +
                'r.className = "hs-widget";' +
                'r.id = "'+_id+'";' +
                'r.type = "text/javascript";' +
                'r.async = true;' +
                'r.src = n + "' + h + ':' + _chatPort + '/assets/js/loader.js";' +
                'var i = document.getElementsByTagName("script")[0];' +
                'i.parentNode.insertBefore(r, i)' +
                '</script>'});
        });

        $(document).on('click', '#btn-delSelection', function(){
            //Xóa các bản ghi được chọn
            var ids = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            swal({
                    title: _config.MESSAGE.COMPANY_CHANNEL.CONFIRM_DELETE_MANY_CHANNEL,
                    text: _config.MESSAGE.COMPANY_CHANNEL.TEXT_CONFIRM_DELETE_MANY_CHANNEL,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/company-channel/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.COMPANY_CHANNEL.TEXT_SUCCESS_DELETE_MANY_CHANNEL, type: "success"}, function(){
                            _.LoadPage(window.location.hash);
                        });
                    });
                });
        });

        $(document).on('click', '#btn-refresh', function(){
            //reload lại trang
            _.LoadPage(window.location.hash);
        });
    };

    return {
        init: function () {
            bindClick();

            //bind các giá trị vào ô tìm kiếm từ url đang load
            if (_.has(window.location.obj, 'name')){
                $('#name').val(window.location.obj.name);
            }

            if (_.has(window.location.obj, 'company')){
                $('#company').val(window.location.obj.company);
            }

            if (_.has(window.location.obj, 'status')){
                $('#status').val(window.location.obj.status);
            }

            $('.selectpicker').selectpicker('refresh'); //refresh 1 lần duy nhất khi load trang

        },
        uncut: function(){
            $('#btn-search').off('click');
            $('.select-box-all').off('change');
            $('.select-box-cell').off('change');
            $('.btn-remove').off('click');
            $('.btn-code').off('click');
            $('#btn-delSelection').off('click');
        }
    };
}(jQuery);