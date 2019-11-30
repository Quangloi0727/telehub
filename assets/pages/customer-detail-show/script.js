var DFT = function ($) {
    var _oldTicketLeft = $('#tab-old-ticket .left-side');
    var _oldTicketRight = $('#tab-old-ticket .right-side');

    // Sự kiện click
    var bindClick = function () {
        // Click xem chi tiết ticket
        $(document).on('click', '.btn-detail', function () {
            window.location.hash = 'ticket-edit?ticketID=' + $(this).attr('data-id');
        });

        // Chọn chuyển trang
        $(document).on('click', '.zpaging', function () {
            var parent = $(this).closest('.list-view');
            var queryLink = $(this).attr('data-link');

            _Ajax(queryLink, 'GET', {}, function (resp) {
                if (resp.code == 200) {
                    var ticketBody = zoka.showTicketListBody(resp.message.data, parent.hasClass('view-detail'));
                    var ticketPage = zoka.createPaging(resp.message.paging);

                    parent.find('#ticket-history-list').html(ticketBody);
                    parent.find('.paging-list').html(ticketPage);
                } else {
                    swal({
                        title: 'Đã có lỗi xảy ra',
                        text: JSON.stringify(resp.message),
                        type: "error",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Quay lại!",
                        closeOnConfirm: true
                    });
                }
            });
        });

        // Tìm kiếm ticket
        $(document).on('click', '#searchTicket', function () {
            var parent = $(this).closest('#frm-edit-ticket');

            var searchObj = '/ticket-edit?search=1&idCustomer=' + window.location.hash.split('/')[1];
            $('#searchRelateTicket .searchColumn').each(function () {
                var obj = $(this);
                if (obj.attr('name') && !_.isEmpty(obj.val())) {
                    searchObj += ('&' + obj.attr('name') + '=' + obj.val());
                }
            });
            _Ajax(searchObj, 'GET', {}, function (resp) {
                if (resp.code == 200) {
                    var str = zoka.showTicketListBody(resp.message.data, true);
                    parent.find('#ticket-history-list').html(str);
                    parent.find('.paging-list').html(zoka.createPaging(resp.message.paging));

                    $('.TXT_VIEW_DETAIL').html(_config.MESSAGE.CUSTOMER_INFO.TXT_VIEW_DETAIL);
                } else {
                    swal({
                        title: 'Đã có lỗi xảy ra',
                        text: JSON.stringify(resp.message),
                        type: "error",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Quay lại!",
                        closeOnConfirm: true
                    });
                }
            });
        });

        // Load lại trang
        $(document).on('click', '#refreshPage', function(){
            _.LoadPage(window.location.hash);
        })

        $(document).on('click', '#cancelInput', function(){
            window.history.back();
        });
    };


    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindValue = function(){
        _.each(_.allKeys(_config.MESSAGE.CUSTOMER_INFO), function(item){
            $('.' + item).html(_config.MESSAGE.CUSTOMER_INFO[item]);
        });
    };

    return {
        init: function () {
            $('.datepicker').datepicker({
                format: 'HH:mm DD/MM/YYYY',
            });

            bindClick();
            bindValue();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.btn-detail');
            $(document).off('click', '.zpaging');
            $(document).off('click', '#searchTicket');
            $(document).off('click', '#refreshPage');
            $(document).off('click', '#cancelInput');
        }
    };
}(jQuery);