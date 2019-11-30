var DFTSOCKET = function ($) {
	function logout(msg) {
		$.get('/logout', function (data) {
			window.onbeforeunload = null;
			alert(msg);
			history.replaceState({}, document.title, "/");
			window.location.reload();
		});
	}

    function retryConnectOnFailure() {
        if (window._socket) {
            $.get('/ping', function(result) {
                if (result.userId && result.userId == window.user) {
                    window._socket.socket.reconnect();
                } else {
                    // User session is out of date ?????
					logout('Hệ thống phát hiện bạn đã đăng xuất, vui lòng đăng nhập lại!');
                }
			});
        }
	}

    return {
        init: function (socket) {
            socket.on('LogOutUser', function (data) {
            	logout("Bạn bị chiếm quyền đăng nhập !");
            });

            socket.on('IncommingCall', function (data) {
                console.log(data);
                VoiceContainer.open(data.id, data.title);
            });

            socket.on('IncommingCallOut', function (data) {
                console.log('IncommingCallOut ', data);
                swal({title: 'Gọi ra thành công', text: ''});
            });

            socket.on('MakeCallRes', function (data) {
                swal({title: 'Gọi ra thất bại', text: data.resultExp});
            });

            socket.on('DisconnectByLeader', function (data) {
                swal({title: 'Kết thúc cuộc gọi', text: 'Ngắt kết nối bởi quản trị viên'});
            });

            /* 28/nov2016 hoangdv */
			socket.on('AccountIsUse', function() {
				console.log("this is multi tab")
			});

			socket.on('disconnect', function() {
				retryConnectOnFailure();
			});
        }
    };
}(jQuery);