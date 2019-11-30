var DFT = function ($) {

    var bindClick = function () {
        // CLick tìm kiếm dữ liệu
        $(document).on('click', '#btn-search', function(e){
            var query = '?created=' + $('#created').val();
            window.location.hash = 'customer-import-history' + query;
        });

        // Download file lịch sử import
        $(document).on('click', '#btn-download', function(e){
            var $this = this;
            window.open($($this).attr('data-url'));
        });
    };

    var bindSubmit = function () {

    };

    return {
        init: function () {
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('click', '#btn-search');
            $(document).off('click', '#btn-download');
        }
    };
}(jQuery);