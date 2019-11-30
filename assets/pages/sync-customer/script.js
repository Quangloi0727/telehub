var DFT = function ($) {

    var queryFilter = function () {

    };

    var bindClick = function () {
        $(document).on('click', '#restartBtn', function (e) {
            e.preventDefault();
            _socket.emit('restartSync', $(this).attr('data-id'));
        });

        $(document).on('click', '#stopBtn', function (e) {
            e.preventDefault();
            _socket.emit('stopSync', $(this).attr('data-id'));
        });
    };

    var bindSubmit = function () {

    };

    var bindPressKey = function(){

    }

    var bindSocket = function (client) {
        client.on('SyncCustomerMonitor', function (data) {
            $('#'+data._id+' .type').html(data.type == 1 ? 'Đồng bộ' : 'Tải về');
            $('#'+data._id+' .total').html(data.total);
            $('#'+data._id+' .current').html(data.current + '(' + (data.total ? parseInt((data.current/data.total)*100) : '0')+ ')%');
            $('#'+data._id+' .status').html(data.status == 1 ? 'Hoàn thành' : (data.status == 2 ? 'Dừng' : 'Đang đồng bộ'));
        });
    }

    return {
        init: function () {
            bindClick();
            bindSubmit();
            bindPressKey();
            bindSocket(_socket);
        },
        uncut: function(){

        }
    };
}(jQuery);