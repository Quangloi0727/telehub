
;(function ($) {

    var _this = function (s) {
        return 'body #tab-crm #header .header-inner .pull-right .top-menu ' + s;
    };

    var bindClick = function (socket) {
        var setNotifyReaded = function(){
            //Đã đọc notification
            $.ajax({
                url: '/notification/all',
                data: {},
                type: 'PUT',
                dataType: "json",
                success: function (result) {
                    if (result.code == 200) {
                        resetData();
                    }
                }
            });
        };

        $(_this('a[role=' + 'button' + ']')).on('click', function () {
            setNotifyReaded();
        });

    };
    
    var resetData = function () { 
        $.get('/notification', function (result) {
            if (result.code == 200) {
                NotificationTab.clearContainer();
                NotificationTab.updateCounter(false);
                _.each(result.result, function (noti) {
                    NotificationTab.updateContainer(noti);
                    if (!noti.status) NotificationTab.updateCounter(true);
                });
            }
        });
    };
    
    var bindSocket = function (client) { 
        client.on('connect', function (s) {
            var self = this;
            var _obj = { _id: user, sid: self.socket.sessionid };
            //Reset notification tab
            resetData();

            self.on('notification', function (data) {
                //Có tin cảnh báo mới
                resetData();
            });
        });
    }

    $(document).ready(function () {
        NotificationTab.init();
        bindSocket(_socket);
        bindClick();
    });

    var NotificationTab = window.NotificationTab = Object.create({
        counter: 0,
        bodyContainer: null,
        tabCounter: null,

        init: function () {
            this.tabCounter = $(_this('i.tmn-counts'));
            this.bodyContainer = $(_this('.lv-body'));
        },
        
        clearContainer: function () {
            $(_this('.lv-body')).empty();
        },
        
        updateContainer: function (noti) {
            //Update danh sách tin cảnh báo
            var colorWarning = '';
            var imgSrc = '/assets/images/notification_img_2.png';
            switch (Number(noti.type)) {
                case 0: {
                    //Nhắc ticket đến giờ hẹn xử lý
                    colorWarning = noti.status == 0 ? '#FF3333' : '#FFF';
                    break;
                }
                case 1: {
                    //Ticket được ủy quyền
                    colorWarning = noti.status == 0 ? '#C6E2FF' : '#FFF';
                    break;
                }
                case 2: {
                    //Được assign vào 1 nhóm
                    imgSrc = '/assets/images/notification_img_1.png';
                    colorWarning = noti.status == 0 ? '#C6E2FF' : '#FFF';
                    break;
                }
                case 3: {
                    //Có tin bài mới
                    colorWarning = noti.status == 0 ? '#C6E2FF' : '#FFF';
                    break;
                }
                default: {
                    colorWarning = noti.status == 0 ? '#C6E2FF' : '#FFF';
                    break;
                }
            }

            var date1 = moment(noti.created);
            var date2 = moment(new Date());
            var differenceInMs = date2.diff(date1); // diff yields milliseconds
            var duration = moment.duration(differenceInMs); // moment.duration accepts ms
            var differenceInMinutes = parseInt(duration.asMinutes());
            var differenceInHour = parseInt(duration.asHours());
            var msg = 'Vừa xong';
            if (differenceInHour > 0 && differenceInHour < 24){
                msg = differenceInHour + ' giờ trước';
            }
            else if (differenceInHour > 0 && differenceInHour < 48){
                msg = 'Hôm qua lúc ' + moment(noti.created).format('HH:mm');
            }
            else if (differenceInHour >= 48){
                msg = moment(noti.created).format('DD/MM/YYYY HH:mm');
            }
            else{
                if (differenceInMinutes > 0){
                    msg = differenceInMinutes + ' phút trước';
                }
            }
            var cell = _.Tags([
                {
                    tag: 'a', attr: {class: 'lv-item', href: '#' + (noti.url.length ? noti.url : ('notification/' + user)), style: "background-color: " + colorWarning }, childs: [
                        {
                            tag: 'div', attr: { class: 'media' }, childs: [
                                {
                                    tag: 'div', attr: { class: 'pull-left' }, childs: [
                                        {tag: 'img', attr: {class: 'lv-img-sm', src: imgSrc}, sattr: ['alt']}
                                    ]
                                },
                                {
                                    tag: 'div', attr: { class: 'media-body-msg' }, childs: [
                                        {
                                            tag: 'div', attr: { class: 'lv-title' }, content: noti.msg
                                        },
                                        {
                                            tag: 'small', attr: {class: 'lv-small'}, content: msg
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]);

            this.bodyContainer.append(cell);
        },

        updateCounter: function (add) {
            //Update số lượng tin cảnh báo mới
            if (add) {
                this.counter++;
                this.tabCounter.text(this.counter);
                this.tabCounter.show();
            }
            else {
                this.counter = 0;
                this.tabCounter.hide();
            }
        }
    });
})(jQuery);