;(function ($) {
    var timeIdle = 120; //Thời gian default chuyển trạng thái idle là 120s

    var _this = function (s) {
        return 'body > .tab-content > .tab-pane#tab-chat ' + s;
    }

    /**
     * Thay đổi trạng thái khách hàng
     * @param state - trạng thái (online, khách hàng mới, đợi mức 1, đợi mức 2)
     * @param sender - biến jquery
     */
    var changeStateCustomer = function(state, sender){
        //Thay đổi trạng thái hiển thị của khách hàng
        //i-online: đang online
        //i-online-new: đang online và gửi tin nhắn đầu tiên
        //i-lowAlert: tin nhắn mới chưa được trả lời sau x(s)
        //i-highAlert: tin nhắn mới chưa được trả lời sau y(s)
        //x, y được cấu hình ở module company-channel và x < y
        var newClass = 'i-online';
        if (_.isEqual(state, 1)){
            //new-online
            newClass = 'i-online-new';
        }
        else if (_.isEqual(state, 2)){
            newClass = 'i-lowAlert';
        }
        else if (_.isEqual(state, 3)){
            newClass = 'i-highAlert';
        }

        async.each(['i-online', 'i-online-new', 'i-lowAlert', 'i-highAlert'], function(cl, next){
            sender.removeClass(cl);
            next();
        }, function(e){
            if (!e){
                sender.addClass(newClass);
            }
        });
    };

    var bindClick = function (socket) {
        /**
         * Click vào hyper link
         */
        $(document).on('click', _this('#chat-task-lists a.task'), function () {
            var $this = $(this);
            $this.addClass('active').siblings('.task').removeClass('active');
            $($this.attr('data-target')).show().siblings(':not(.lv-header-alt)').hide();
            $(_this('.row.visitor h2.lvh-label')).text($this.contents().get(0).nodeValue);
        });

        /**
         * Click vao popup, bat cua so chat
         */
        $(document).on('click', _this('#chat-bars-container li :not(.zmdi-close)'), function () {
            var $this = $(this).closest('li');
            if (_.isEqual($this.attr('i-c'), 'true')) return;
            $('.chat-dialog').hide();
            var $dialog = $('.chat-dialog[data-id="' + $this.attr('data-id') + '"]');
            $this.attr('i-c', true).attr('i-u', false).siblings().attr('i-c', false);
            $dialog.css({top: '15px', left: (($(window).width() - 800) / 2) + 'px'}).fadeIn().find('.msg-txt').focus();

            changeStateCustomer(4, $this.find('.icon-tab')); //trạng thái online

            //Cap nhat giao dien chat request neu co
            var customerId = $this.attr('data-id');
            var id = 'cus-' + customerId;
            var customer = ChatContainer._customers[customerId];
            if (customer.newMsg == 1){
                customer.newMsg = 0;
                $('#visitor-panel #chat-tbl-request-visitor').bootstrapTable('removeByUniqueId', customerId).bootstrapTable('refresh');
                ChatContainer.updateBadge('visitor-panel', 'cquest', -1);
                ChatContainer.updateCounter(false);
            }
        });

        /**
         * Đóng cửa sổ chat
         */
        $(document).on('click', _this('#chat-bars-container li .zmdi-close'), function () {
            var $this = $(this).closest('li');
            var $dialog = $('.chat-dialog[data-id="' + $this.attr('data-id') + '"]');
            var customer = ChatContainer._customers[$this.attr('data-id')];
            if (customer.newMsg == 1) {
                customer.newMsg = 0;
                ChatContainer.updateBadge('visitor-panel', 'cquest', -1);
                ChatContainer.updateCounter(false);
            }
            if (_.has(customer, 'left')){
                //Khách hàng đã out, đóng cuộc chat
                delete customer['left'];
                $.ajax({
                    url: '/chat-client/' + customer.customer.threadId,
                    data: {
                        typeUpdate: 4,
                        agentId: customer.customer.aid,
                        send: customer.send,
                        receive: customer.receive,
                        response: customer.response
                    },
                    type: 'PUT',
                    dataType: "json",
                    success: function (resp) {
                        console.log(106, resp);
                    }});
            }
            $this.remove();
            $dialog.remove();
        });

        /**
         * Click vào cửa sổ chat, giảm số lượng chat yêu cầu mới trên view
         */
        $(document).on('click', _this('.chat-dialog > h5.ui-widget-header > .zmdi-minus'), function () {
            var $this = $(this).closest('.chat-dialog');
            $this.effect('transfer', {to: '#chat-bars-container li[data-id="' + $this.attr('data-id') + '"]', className: "ui-effects-transfer"}, 500, function () {
                $(_this('#chat-bars-container li[data-id="' + ($this.attr('data-id')) + '"]')).attr('i-c', false).attr('i-u', false);
            }).dequeue().effect('fade', {});
            var id = $(this).closest('div.chat-dialog').attr('data-id');
            if (ChatContainer._customers[id].newMsg == 1){
                ChatContainer._customers[id].newMsg = 0;
                ChatContainer.updateCounter(false);
                $('#visitor-panel #chat-tbl-request-visitor').bootstrapTable('removeByUniqueId', id).bootstrapTable('refresh');
                ChatContainer.updateBadge('visitor-panel', 'cquest', -1);
            }
        });

        /**
         * Tạo ghi chú mới về khách hàng
         */
        $(document).on('keyup', _this('.chat-dialog .left-side .note-txt'), function (e) {
            if (!_.isEqual(e.keyCode, 13)) return;
            var $this = $(this);
            var $content = $this.prev('div');
            //update database here.
            var data = {agentId: user, clientId: $this.closest('.chat-dialog').attr('data-id'), content: _.stripTags($this.val()), createNote: 1};
            $.ajax({
                url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/chat-client',
                data: data,
                type: 'POST',
                dataType: "json",
                success: function (data) {
//                    console.log(69, data);
                }
            });
            $content.append(_.Tags([{tag: 'div', childs: [{tag: 'strong', content: /*$('.profile-info').text()*/ ChatContainer._agent.displayName + ' : '}, {tag: 'span', content: _.stripTags($this.val())}]}]));
            $content.scrollTop($content[0].scrollHeight);
            $this.val('');
        });

        /**
         * Agent chat
         */
        $(document).on('keyup', _this('.chat-dialog .right-side .msg-txt'), function (e) {
            var $this = $(this);
            var $dialog = $this.closest('.chat-dialog');
            var _dialogId = $dialog.attr('data-id');

            //Xóa nhấp nháy ở mini-tab
            setTimeout(function(){
                $dialog.find('.chat-message.c-orange').removeClass('c-orange');
            }, 200);
            if (_.isEqual(e.keyCode, 13) && !e.shiftKey && (_.trim($this.val()).length > 0)) {
                var $content = $(_this('.chat-dialog[data-id="' + _dialogId + '"] .right-side .chat-msg-container'));
                var $widget = $(this).closest('.ui-widget-content');
                var $time = _.Tags([{tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')}]);
                $content.append(_.Tags([{tag: 'div', attr: {class: 'chat-message chat-message-self'}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble'}, content: $time + _.stripTags($this.val())}]}]));
                $content.scrollTop($content[0].scrollHeight);
                //Cap nhat giao dien chat request neu co
                var id = 'cus-' + _dialogId;
                var customer = ChatContainer._customers[_dialogId];
                //Xóa schedule chuyển icon customer sang vàng + đỏ
                var $miniBar = $('#chat-bars-container li[data-id="' + _dialogId + '"]');
                $miniBar.attr('i-c', true).attr('i-u', false).siblings().attr('i-c', false);
                changeStateCustomer(4, $miniBar.find('.icon-tab'));
                if (_.has(customer, 'lowAlert')){
                    clearTimeout(customer['lowAlert']);
                    delete customer['lowAlert'];
                }

                if (_.has(customer, 'highAlert')){
                    clearTimeout(customer['highAlert']);
                    delete customer['highAlert'];
                }

                if (_.has(customer, 'SLA')){
                    clearTimeout(customer['SLA']);
                    delete customer['SLA'];
                }

				
                if (customer.newMsg == 1){
                    customer.newMsg = 0;
                    ChatContainer.updateCounter(false);
                    $('#visitor-panel #chat-tbl-request-visitor').bootstrapTable('removeByUniqueId', _dialogId).bootstrapTable('refresh');
                    ChatContainer.updateBadge('visitor-panel', 'cquest', -1);
                }

                //Cập nhật đã trả lời tin nhắn
                $.ajax({
                    url: '/chat-client/' + customer.customer.threadId,
                    data: {typeUpdate: 1},
                    type: 'PUT',
                    dataType: "json",
                    success: function (resp) {
                    }});

                if (_.has(customer, 'newThread')){
                    //Cập nhật agent id vào danh sách agent đã hỗ trợ cuộc chat này
                    $.ajax({
                        url: '/chat-client/' + customer.customer.threadId,
                        type: 'PUT',
                        data: "agentId=" + user + "&typeUpdate=0",
                        success: function(data) {
                        }
                    });

                    delete customer['newThread'];
                }
                customer.send += 1;
                if (_.isEqual(customer.response, 0) && _.has(customer, 'timeReceive') && !_.isEqual(customer.timeReceive, 0)){
                    customer.response = customer.timer - customer.timeReceive;
                }
                socket.emit('agent-msg', {queueName: _configServer.activemq.queueName, threadId: customer.customer.threadId, id: user, from: $widget.attr('data-id'), msg: _.stripTags($this.val())});
                $this.val('');
            }
        });

        /**
         * Hiển thị tab chat
         */
        $(document).on('click', _this('#btn-visitor'), function (e) {
            $(_this('#visitor-panel')).removeClass('hidden');
            $(_this('#history-panel')).addClass('hidden');
            $(_this('#supervisior-panel')).addClass('hidden');
            $(_this('.history-view')).addClass('hidden');

            $(_this('#btn-visitor')).addClass('active');
            $(_this('#btn-history')).removeClass('active');
            $(_this('#btn-supervisior')).removeClass('active');
        });

        /**
         * Hiển thị tab supervisor
         */
        $(document).on('click', _this('#btn-supervisior'), function (e) {
            //Hiển thị panel supervisor
            $(_this('#supervisior-panel')).removeClass('hidden');
            $(_this('#visitor-panel')).addClass('hidden');
            $(_this('#history-panel')).addClass('hidden');
            $(_this('.history-view')).addClass('hidden');

            $(_this('#btn-visitor')).removeClass('active');
            $(_this('#btn-history')).removeClass('active');
            $(_this('#btn-supervisior')).addClass('active');

        });

        /**
         * Hiển thị tab lịch sử chat
         */
        $(document).on('click', _this('#btn-history'), function () {
            var _agent = ChatContainer._agent;
            if (!((_.has(_agent, 'companyLeaders') && _agent.companyLeaders.length) || (_.has(_agent, 'ternalLeaders') && _agent.ternalLeaders.length) || (_.has(_agent, 'agentGroupLeaders') && _agent.agentGroupLeaders.length))){
                $(_this('#history-panel #agent-search-chat')).val(ChatContainer._agent.displayName);
                $(_this('#history-panel #agent-search-chat')).attr('readonly', 'readonly');
                $(_this('#history-panel #agent-search-chat')).attr('style', 'background-color: lightgrey');
            }

            $(_this('#visitor-panel')).addClass('hidden');
            $(_this('#history-panel')).removeClass('hidden');
            $(_this('#supervisior-panel')).addClass('hidden');

            $(_this('#btn-history')).addClass('active');
            $(_this('#btn-visitor')).removeClass('active');
            $(_this('#btn-supervisior')).removeClass('active');
            $(_this("#chat-tbl-history")).bootstrapTable('removeAll');
            var url = '/chat-client?queryType=0&searchType=1&agentId=' + ChatContainer._agent._id;
            if (!ChatContainer._agentSearch){
                url = '/chat-client?queryType=0&searchType=0&userId=' + ChatContainer._agent._id;
            }
            $.get(url, function(resp){
                if (resp.code == 200){
                    ChatContainer.updateThread(resp.data);
                    $(_this("#chat-tbl-history")).bootstrapTable('hideLoading');
                    _.each(resp.data, function (obj, i){
                        if (obj.chatlogs.length > 0) {
                            if (obj.chatlogs[obj.chatlogs.length - 1].content.length == 0) {
                                //File attachment
                                obj.chatlogs[obj.chatlogs.length - 1].content = obj.chatlogs[obj.chatlogs.length - 1].attachment[0].fileName;
                            }
                            var contentTag = _.Tags([{ tag: 'div', childs: [{ tag: 'span', content: obj.chatlogs[obj.chatlogs.length - 1].content.length <= 35 ? obj.chatlogs[obj.chatlogs.length - 1].content : obj.chatlogs[obj.chatlogs.length - 1].content.substring(0, 35) + ' ...' }] }]);
                            if (_.find(obj.chatlogs, function (log) {
                                    return log.attachment.length > 0;
                                }) != undefined) {
                                contentTag = _.Tags([{ tag: 'div', childs: [{ tag: 'span', content: obj.chatlogs[obj.chatlogs.length - 1].content.length <= 35 ? obj.chatlogs[obj.chatlogs.length - 1].content : obj.chatlogs[obj.chatlogs.length - 1].content.substring(0, 35) + ' ...' }, { tag: 'i', attr: { class: 'zmdi zmdi-attachment-alt p-5 p-l-15 f-22' } }] }])
                            };
                            $(_this('#chat-tbl-history')).bootstrapTable('insertRow', {
                                index: 0,
                                row: {
                                    id: obj._id,
                                    customer: (obj['field_ho_ten'].length == 0) ? (obj['country'] + ' (' + obj.region + ') ' + '#' + obj.clientId.split('-')[3]) : obj['field_ho_ten'][0].value,
                                    content: contentTag,
                                    location: obj['region'],
                                    time: moment(obj.updated).format('DD/MMM/YYYY')
                                }
                            }).bootstrapTable('refresh');
                        }
                    });
                }
            });
        });

        /**
         * Agent click vào nút hỗ trợ điện thoại viên trên khung chat
         */
        $(document).on('change', _this('.select-helper'), function(){
            //Các chức năng: đóng chat - chuyển chat - chặn
            if ($(this).val() != '1'){
                swal({
                    title: 'Thông báo',
                    text: 'Chức năng đang phát triển?',
                    type: "warning", confirmButtonColor: "#DD6B55", confirmButtonText: "Quay lại!", closeOnConfirm: true
                });
                $(this).val('');
                return;
            }
            $(this).val('');
            var self = $(this);
            swal({
                    title: 'Thông báo',
                    text: 'Bạn muốn dừng cuộc chat này?',
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn!", closeOnConfirm: false
                },
                function () {
                    var id = self.closest('.chat-dialog').attr('data-id');
                    var customer = ChatContainer._customers[id];
                    var data = "typeUpdate=2&clientId=" + id + "&region=" + customer.customer.region + "&country=" + customer.customer.country;
                    if (_.has(customer, 'idCustomer') && customer['idCustomer'] != null && customer['idCustomer'] != undefined){
                        data = data + '&customerId=' + customer['idCustomer'];
                    }
                    //Cập nhật db
                    $.ajax({
                        url: '/chat-client/' + customer.customer.threadId,
                        type: 'PUT',
                        data: "typeUpdate=2&clientId=" + id + "&region=" + customer.customer.region + "&country=" + customer.customer.country + "&agentId=" + customer.customer.aid + "&send=" + customer.send + "&receive="+ customer.receive + "&response=" + customer.response,
                        success: function(data) {
                            if (data.code == 200){
                                swal({title: 'Thành công', text: "Đóng cuộc chat thành công", type: "success"});
                                customer.threadId = data.newThread;
                                customer.customer.threadId = data.newThread;
                                customer.newThread = 1;
                                customer.receive = 0;
                                customer.send = 0;
                                customer.response = 0;
                                customer.timeReceive = customer.timer;
                                if (_.has(customer, 'lowAlert')){
                                    clearTimeout(customer['lowAlert']);
                                    delete customer['lowAlert'];
                                }

                                if (_.has(customer, 'highAlert')){
                                    clearTimeout(customer['highAlert']);
                                    delete customer['highAlert'];
                                }

                                if (_.has(customer, 'SLA')){
                                    clearTimeout(customer['SLA']);
                                    delete customer['SLA'];
                                }
                            }
                            else{
                                swal({title: 'Thất bại', text: 'Đóng cuộc chat thất bại', type: "warning"});
                            }
                        }
                    });
                });
        });

        /**
         * Render danh sách tin nhắn cũ
         */
        $(document).on('click', _this('#chat-tbl-history tr:gt(0) '), function(){
            $(_this('.history-view')).removeClass('hidden');
            var self = this;
            var rThread = _.find(ChatContainer._threadChats, function(thread){
                return _.isEqual(thread._id, self.getAttribute('data-uniqueid'));
            });
            //tab-transcript
            var $content = $('.transcript');
            $(_this('.transcript .chat-message')).remove();
            $(_this('.transcript .chat-message-bubble')).remove();
            _.each(rThread.chatlogs, function(msgObj){
                var $time = {};
                var customClass = '';
                var customerColor = 'c-black';
                if (msgObj.sentFrom.from == 0){
                    //agent chat
                    $time = _.Tags([{tag: 'div', attr: {class: 'msg-time ' + customerColor}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' (' + msgObj.sentFrom.id.displayName + ' )'}]);
                    customClass = 'chat-message chat-message-self';
                }
                else if (msgObj.sentFrom.from == 2){
                    customClass = 'm-b-15 p-l-5';
                }
                else{
                    //customer chat
                    var customerName = rThread.clientId.split('-')[0];
                    $time = _.Tags([{tag: 'div', attr: {class: 'msg-time ' + customerColor}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' (' + customerName + ' )'}]);
                    customClass = 'chat-message';
                }
                if (msgObj.attachment && msgObj.attachment.length > 0){
                    var _ext = ['jpg', 'png', 'bmp'];
                    var ext = msgObj.attachment[0]['fileName'].split('.')[1];
                    if ( _.filter(_ext, function(obj){
                            return ext.indexOf(obj) >= 0;
                        }).length > 0){
                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass},
                            childs: [
                                {tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor},
                                    childs: [
                                        {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                        {tag: 'div', attr: {class: 'msg-preview'},
                                            childs: [
                                                {tag: 'img', attr: {src: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + msgObj.attachment[0]['url']}, alt: msgObj.attachment[0]['fileName']}
                                            ]
                                        }
                                    ]
                                }
                            ]}
                        ]));
                    }
                    else{
                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass},
                            childs: [
                                {tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor},
                                    childs: [
                                        {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                        {tag: 'div', attr: {class: 'msg-preview'},
                                            childs: [
                                                {tag: 'i', attr: {class: 'zmdi zmdi-file'}},
                                                {tag: 'a', attr: {class: 'm-l-10', href: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + msgObj.attachment[0]['url'], target: '_blank'}, content: msgObj.attachment[0]['fileName']}
                                            ]
                                        }
                                    ]
                                }
                            ]}
                        ]));
                    }
                }
                else{
                    if (msgObj.sentFrom.from != 2){
                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor}, content: $time + msgObj.content}]}]));
                    }
                    else{
                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble ' + customerColor}, childs: [{tag: 'i', attr: {class: 'f-12'}, content: moment(msgObj.updated).format('HH:mm:ss A') + ' - ' + msgObj.content}]}]}]));
                    }
                }
                $content.scrollTop($content[0].scrollHeight);
            });

            //tab-info
            $(_this('.data-info')).remove();
            $(_this('#info-location')).append(_.Tags([{tag: 'span', attr: {class: 'data-info'}, content: rThread.region + ' - ' + rThread.country}]));
            $(_this('#info-ip')).append(_.Tags([{tag: 'span', attr: {class: 'data-info'}, content: rThread.clientId.split('-')[0]}]));
            var $popup = $(_this('.info'));
            QueryDatabase('/chat-client?queryType=4', {}, 'GET', function(resp) {
                _.each(resp, function (field) {
                    if (field.displayName != 'clientid') {
                        if (field.fieldType != 4){
                            $popup.append(_.Tags([
                                {tag: 'div', attr: {class: 'data-info'}, childs: [
                                    {tag: 'span', content: field.displayName + ":"},
                                    {tag: 'span', attr: {class: 'data-info', id: field.modalName}, content: ' ' + (rThread[field.modalName].length ? rThread[field.modalName][0].value : '')}
                                ]}
                            ]));
                        }

                    }
                });
            });
            QueryDatabase('/chat-client?queryCustomer=1&clientId=' + rThread.clientId, {}, 'GET', function(resp){
                //Nếu có rồi thì load ra và sử dụng thông tin đó luôn
                var fields_info = {};
                if (resp.code == 200 && !_.isNull(resp.customer)){
                    var fields_info = _.pick(resp.customer, function(v, k, o){
                        return k.indexOf('field_') >= 0;
                    });
                }
                async.each(_.keys(fields_info), function(field, cb){
                    $popup.find('#' + field).text(fields_info[field].length > 0 ? (" " + fields_info[field][0].value) : ' ');
                    cb();
                }, function(err, resp){
//                    $popup.find(fields_info)
//                    _w.find('.cus-phone').text(customer.field_so_dien_thoai);
//                    _w.find('.cus-mail').text(customer.field_mail);
                });
            });

            //tab-note
            var $content = $('.note');
            $(_this('.note .chat-message')).remove();
            $(_this('.note .chat-message-bubble')).remove();
            QueryDatabase('/chat-client?queryType=2&clientId=' + rThread.clientId, {}, 'GET', function(resp){
                //Nếu có rồi thì load ra và sử dụng thông tin đó luôn
                _.each(resp, function(note){
//                    var $time = _.Tags([{tag: 'div', attr: {class: 'msg-time '}, content: moment(note.created).format('HH:mm:ss A') + ' (' + note.agentId.displayName + ' )'}]);
                    $content.append(_.Tags([{tag: 'div', attr: {class: 'm-b-15 p-l-5'}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble '}, childs: [{tag: 'i', attr: {class: 'f-12'}, content: moment(note.created).format('HH:mm:ss A') + ' - ' + note.agentId.displayName + ": " + note.content}]}]}]));
                    $content.scrollTop($content[0].scrollHeight);
                });

            });
        });

        /**
         * Render cửa sổ chat với khách hàng
         */
        $(document).on('click', _this('#visitor-panel #chat-tbl-active-visitor tr:gt(0)'), function(){
            var customer = ChatContainer._customers[this.getAttribute('data-uniqueid')].customer;
            var customerId = customer.ip + '-' + customer.channel + '-' + customer.service + '-' + customer.cookie;
            ChatContainer.open(customerId, customer, {showDialog: 1});
        });

        /**
         * Render cửa sổ chat với khách hàng
         */
        $(document).on('click', _this('#visitor-panel #chat-tbl-idle-visitor tr:gt(0)'), function(){
            var customer = ChatContainer._customers[this.getAttribute('data-uniqueid')].customer;
            var customerId = customer.ip + '-' + customer.channel + '-' + customer.service + '-' + customer.cookie;
            ChatContainer.open(customerId, customer, {showDialog: 1});
        });

        /**
         * Render cửa sổ chat với khách hàng
         */
        $(document).on('click', _this('#visitor-panel #chat-tbl-request-visitor tr:gt(0)'), function(){
            var customerId = this.getAttribute('data-uniqueid');
            var customer = ChatContainer._customers[customerId];
            //Cap nhat giao dien chat request neu co
            if (customer.newMsg == 1){
                customer.newMsg = 0;
                var info = customer.customer.name ? customer.customer.name : '';
                if (!info) info = customer.customer.phone ? customer.customer.phone : '';
                if (!info) info = customer.customer.mail ? customer.customer.mail : customer.customer.region + ' #' + customer.customer.cookie;
                $(_this('#visitor-panel #chat-tbl-request-visitor')).bootstrapTable('removeByUniqueId', id).bootstrapTable('refresh');
                ChatContainer.updateBadge('visitor-panel', 'cquest', -1);
                ChatContainer.updateTable('visitor-panel', 'cquest', -1, customerId);
            }

            ChatContainer.open(customerId, customer.customer, {showDialog: 1});
        });

        /**
         * Đóng khung lịch sử chat
         */
        $(document).on('click', _this('#close-history-view'), function(e){
            $(_this('.history-view')).addClass('hidden');
        });

        /**
         * Chuyển sang tab tin nhắn bên lịch sủ chat
         */
        $(document).on('click', _this('#tab-transcript'), function(e){
            $(_this('.transcript')).removeClass('hidden');
            $(_this('.info')).addClass('hidden');
            $(_this('.note')).addClass('hidden');
        });

        /**
         * Chuyển sang tab thông tin khách hàng bên lịch sủ chat
         */
        $(document).on('click', _this('#tab-info'), function(e){
            $(_this('.transcript')).addClass('hidden');
            $(_this('.info')).removeClass('hidden');
            $(_this('.note')).addClass('hidden');
        });

        /**
         * Chuyển sang tab ghi chú bên lịch sủ chat
         */
        $(document).on('click', _this('#tab-note'), function(e){
            $(_this('.transcript')).addClass('hidden');
            $(_this('.info')).addClass('hidden');
            $(_this('.note')).removeClass('hidden');
        });

        /**
         *  validation edit customer
         */
        $(document).on('submit', _this('#save-customer'), function(e){
            e.preventDefault();
            var $this = $(this);
            var customer = ChatContainer._customers[$(this).closest('.content-info').attr('data-id')];
            var $ui_header = this.closest('.chat-dialog > h5.ui-widget-header');
            _AjaxObject('/chat-client', 'POST', $(_this('#save-customer')).getData(), function (resp) {
                swal({title: 'Thông báo !', text: resp.message});
                var fields_info = {};
                if (resp.code == 200 && !_.isNull(resp.customer)){
                    var fields_info = _.pick(resp.customer, function(v, k, o){
                        return k.indexOf('field_') >= 0;
                    });
                    async.each(_.keys(fields_info), function(field, cb){
                        customer.customer[field] = fields_info[field].length > 0 ? fields_info[field][0].value : '';
                        cb();
                    }, function(err, resp){
                        $(_this('.cus-phone')).text(customer.customer.field_so_dien_thoai);
                        $(_this('.cus-mail')).text(customer.customer.field_mail);
                    });
                }
            });
        });

        /**
         * Click vào nút xuất lịch sử
         */
        $(document).on('click', _this('#btn-show-export-history'), function(){
            if ($(_this('.frm-export-history')).hasClass('hidden')) {
                $(_this('.frm-export-history')).removeClass('hidden');
            }
            else{
                $(_this('.frm-export-history')).addClass('hidden');
            }
        });

        /**
         * Yêu cầu xuất lịch sử chat
         */
        $(document).on('submit', _this('.frm-export-history'), function(e){
            //Yêu cầu agent xác nhận
            e.preventDefault();
            var self = $(this);
            swal({
                    title: 'Thông báo',
                    text: 'Bạn muốn xuất lịch sử chat?',
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    var url = '/chat-client?queryType=0&searchType=1&userId=' + ChatContainer._agent._id;
                    if (!ChatContainer._agentSearch){
                        url = '/chat-client?queryType=0&searchType=0&userId=' + ChatContainer._agent._id;
                    }
                    _AjaxData(url, 'POST', self.getData(), function(resp){
                        if (resp.code == 200){
                            swal({title: 'Thành công', text: "Xuất lịch sử thành công!", type: "success"});
                        }
                        else{
                            swal({title: 'Thất bại', text: 'Xuất lịch sử thất bại', type: "warning"});
                        }
                    });
                });
        });

        /**
         * Click vào nút upload file
         */
        $(document).on('click', _this('.zmdi-attachment-alt'), function(e){
            $(_this('#fupload')).click();
        });

        /**
         * Up file đính kèm lên server
         */
        $(document).on('change', _this('#fupload'), function(){
            var $self = this;
            var self = $(this);
            var ext = ['image', 'zip', 'rar', 'text', 'sheet', 'document', 'pdf'];
            if(!$self.files.length) return false;
            if ($self.files[0].size > 1000000){
                swal({title: 'Thông báo', text: 'Kích cỡ file quá lớn !'});
                return false;
            }
            var formData = new FormData($('#upload-file')[0]);
            if (_.filter(ext, function(obj){
                    //Giới hạn loại file
                    return ($self.files[0].type.indexOf(obj) >= 0);
                }).length > 0){
                $.ajax({
                    url: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + '/chat-client',
                    data: formData,
                    type: 'POST',
                    dataType: "json",
                    success: function (data) {
                        var $widget = self.closest('.ui-widget-content');
                        var _dialogId = self.closest('.chat-dialog').attr('data-id');
                        var $content = $(_this('.chat-dialog[data-id="' + _dialogId + '"] .right-side .chat-msg-container'));
                        var _ext = ['jpg', 'png', 'bmp'];
                        var ext = data.fileName.split('.')[1];
                        if ( _.filter(_ext, function(obj){
                                return ext.indexOf(obj) >= 0;
                            }).length > 0){
                            $content.append(_.Tags([{tag: 'div', attr: {class: 'chat-message chat-message-self'},
                                childs: [
                                    {tag: 'div', attr: {class: 'chat-message-bubble'},
                                        childs: [
                                            {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                            {tag: 'div', attr: {class: 'msg-preview'},
                                                childs: [
                                                    {tag: 'img', attr: {src: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + data.url, target: '_blank'}, alt: data.fileName}
                                                ]
                                            }
                                        ]
                                    }
                                ]}
                            ]));
                        }
                        else{
                            $content.append(_.Tags([{tag: 'div', attr: {class: 'chat-message chat-message-self'},
                                childs: [
                                    {tag: 'div', attr: {class: 'chat-message-bubble'},
                                        childs: [
                                            {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                            {tag: 'div', attr: {class: 'msg-preview'},
                                                childs: [
                                                    {tag: 'i', attr: {class: 'zmdi zmdi-file'}},
                                                    {tag: 'a', attr: {class: 'm-l-10', href: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + data.url, target: '_blank'}, content: data.fileName}
                                                ]
                                            }
                                        ]
                                    }
                                ]}
                            ]));
                        }
                        $content.scrollTop($content[0].scrollHeight);
                        var msg = {msg: '', attachment: [{url: data.url, fileName: data.fileName}], from: $widget.attr('data-id'), id: user};
                        socket.emit('agent-msg', msg);
                        $('#fupload').val('');
                        var customer = ChatContainer._customers[_dialogId];
                        var $miniBar = $('#chat-bars-container li[data-id="' + _dialogId + '"]');
                        $miniBar.attr('i-c', true).attr('i-u', false).siblings().attr('i-c', false);
                        changeStateCustomer(4, $miniBar.find('.icon-tab'));
                        if (_.has(customer, 'lowAlert')){
                            clearTimeout(customer['lowAlert']);
                            delete customer['lowAlert'];
                        }

                        if (_.has(customer, 'highAlert')){
                            clearTimeout(customer['highAlert']);
                            delete customer['highAlert'];
                        }

                        if (_.has(customer, 'SLA')){
                            clearTimeout(customer['SLA']);
                            delete customer['SLA'];
                        }

                        if (customer.newMsg == 1){
                            customer.newMsg = 0;
                            ChatContainer.updateCounter(false);
                            $('#visitor-panel #chat-tbl-request-visitor').bootstrapTable('removeByUniqueId', _dialogId).bootstrapTable('refresh');
                            ChatContainer.updateBadge('visitor-panel', 'cquest', -1);
                        }
                    },
                    cache: false,
                    contentType: false,
                    processData: false
                });
            }
            else{
                swal({title: 'Thông báo', text: 'File không hỗ trợ !'});
                return false;
            }
        });

        /**
         * Tìm kiếm lịch sử chat
         */
        $(document).on('click', _this('#btn-search-history-chat'), function(){
            $('.page-loader').show();
            var params = {};
            $('#history-filter-toolbar').find('.filter[name]').each(function(){
                params[$(this).attr('name')] = $(this).val();
            });
            //agent search
            params['searchType'] = ChatContainer._agentSearch ? 1 : 0;
            if (ChatContainer._agentSearch) {
                params['agentId'] = ChatContainer._agent._id;
            }
            else {
                params['userId'] = ChatContainer._agent._id;
            }
            //send ajax request tới server
            _AjaxObject('/chat-client?' + ObjectToQueryParams(params) + 'queryType=0', 'GET', null, function(resp){
                ChatContainer.updateThread(resp.data);
                $(_this("#chat-tbl-history")).bootstrapTable('removeAll');
                $(_this("#chat-tbl-history")).bootstrapTable('hideLoading');
                _.each(resp.data, function(obj, i){
                    if (obj.chatlogs.length > 0){
                        $(_this('#chat-tbl-history')).bootstrapTable('insertRow', {
                            index: (i + 1),
                            row: {
                                id: obj._id,
                                customer: (obj['field_ho_ten'].length == 0) ? (obj['country'] + ' (' + obj.region + ') ' + '#' + obj.clientId.split('-')[3]) : obj['field_ho_ten'][0].value,
                                content: obj.chatlogs[obj.chatlogs.length - 1].content,
                                location: obj['region'],
                                time: moment(obj.updated).format('DD/MMM/YYYY')
                            }
                        }).bootstrapTable('refresh');
                    }
                });
                $('.page-loader').hide();
            });
        });

        /**
         * Agent chuyển trạng thái on/ off
         */
        $(_this('.chat-status')).on('click', function () {
            socket.emit('changeAgentStatus', {
                changeBy: user,
                clientId: user,
                status: $(this).attr('data-chat-status')
            });
        });

        /**
         * Bắt các sự kiện thay đổi giao diện khung chat, phóng to/ thu nhỏ các block trên giao diện
         */
        $(document).on('click', _this('.btn-switch'), function(){
            var id = $(this).attr('data-id');
            var $panel_info = $('.chat-dialog[data-id="' + id + '"]').find('.left-side');
            var $panel_ticket = $('.chat-dialog[data-id="' + id + '"]').find('.content-ticket');
            if ($(this).attr('data-status') == 'on'){
                $(this).attr('data-status', 'off');
                $panel_ticket.removeClass('col-sm-4');
                $panel_info.addClass('hidden');
                $panel_ticket.addClass('col-sm-8');
            }
            else{
                $(this).attr('data-status', 'on');
                $panel_ticket.removeClass('col-sm-8');
                $panel_info.removeClass('hidden');
                $panel_ticket.addClass('col-sm-4');
            }
        });

        /**
         * Bắt các sự kiện thay đổi giao diện khung chat, phóng to/ thu nhỏ các block trên giao diện
         */
        $(document).on('click', _this('.chat-title'), function(){
            var id = $(this).attr('data-id');
            var $panel_info = $('.chat-dialog[data-id="' + id + '"]').find('.left-side');
            var $panel_chat = $('.chat-dialog[data-id="' + id + '"]').find('.chat-panel');
            var $panel_ticket = $('.chat-dialog[data-id="' + id + '"]').find('.ticket-panel');
            var $btn_switch = $('.chat-dialog[data-id="' + id + '"]').find('.btn-switch');
            if ($(this).attr('data-status') == 'on'){
                $(this).attr('data-status', 'off');
                $panel_chat.removeClass('col-sm-12');
                $panel_ticket.removeClass('hidden');
                $btn_switch.removeClass('hidden');
                if ($btn_switch.attr('data-status') == 'on'){
                    $panel_info.removeClass('hidden');
                    $panel_chat.addClass('col-sm-4');
                    $panel_ticket.addClass('col-sm-4');
                }
                else{
                    $panel_info.addClass('hidden');
                    $panel_chat.addClass('col-sm-4');
                    $panel_ticket.addClass('col-sm-8');
                }
            }
            else{
                $(this).attr('data-status', 'on');
                $panel_chat.removeClass('col-sm-4');
                $panel_chat.removeClass('col-sm-8');
                $btn_switch.addClass('hidden');
                $panel_info.addClass('hidden');
                $panel_chat.addClass('col-sm-12');
                $panel_ticket.addClass('hidden');
            }
        });

        /**
         * Bắt các sự kiện thay đổi giao diện khung chat, phóng to/ thu nhỏ các block trên giao diện
         */
        $(document).on('click', _this('.ticket-title'), function(){
            var id = $(this).attr('data-id');
            var $panel_info = $('.chat-dialog[data-id="' + id + '"]').find('.left-side');
            var $panel_chat = $('.chat-dialog[data-id="' + id + '"]').find('.chat-panel');
            var $panel_ticket = $('.chat-dialog[data-id="' + id + '"]').find('.ticket-panel');
            var $btn_switch = $('.chat-dialog[data-id="' + id + '"]').find('.btn-switch');
            if ($(this).attr('data-status') == 'on'){
                $(this).attr('data-status', 'off');
                $panel_ticket.removeClass('col-sm-12');
                $panel_chat.removeClass('hidden');
                $btn_switch.removeClass('hidden');
                if ($btn_switch.attr('data-status') == 'on'){
                    $panel_info.removeClass('hidden');
                    $panel_chat.addClass('col-sm-4');
                    $panel_ticket.addClass('col-sm-4');
                }
                else{
                    $panel_info.addClass('hidden');
                    $panel_chat.addClass('col-sm-4');
                    $panel_ticket.addClass('col-sm-8');
                }
            }
            else{
                $(this).attr('data-status', 'on');
                $panel_ticket.removeClass('col-sm-4');
                $panel_ticket.removeClass('col-sm-8');
                $btn_switch.addClass('hidden');
                $panel_info.addClass('hidden');
                $panel_ticket.addClass('col-sm-12');
                $panel_chat.addClass('hidden');
            }
        });

    };

    var _configServer = {};
    var __isConnected = false;

    var ChatInit = function () {
        async.waterfall([
            function(cb){
                //Lấy các thông tin trong file config.json
                $.get('/chat-client?queryType=6', function(resp){
                    _configServer = resp;
                    cb();
                });
            }
        ], function(err, resp) {
            //Connect socket
            var csocket = io.connect(window.location.protocol + '//' + window.location.hostname + ':' + _configServer.services.chat, {
                'reconnect': true,
                'reconnection delay': 5000,
                'max reconnection attempts': 10,
                'force new connection': true
            });

            csocket.on('connect', function (s) {
                if (!__isConnected){
                    __isConnected = true;
                    var self = this;
                    $(_this('.right-side .chat-msg-container') + ',' + _this('.left-side .note-container .content')).niceScroll({cursorwidth: "7px", cursorcolor: "##B7B7B7", autohidemode: "leave", zindex: 1001, railpadding: {top: 0, right: 0, left: -5, bottom: 0}, horizrailenabled: false});
                    bindClick(self);
                    ChatContainer._socket = self;
                    $.get('/chat-client', function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            ChatContainer._agent = resp.data;
                            var _channel = {};
                            _.each(resp.data.company, function (c) {
                                _.each(c.channels, function (ch) {
                                    _channel[ch._id] = _.chain(ch.skills).map(function (x) {
                                        return x._id
                                    }).value();
                                });
                            });
                            var _customers = ChatContainer._customers;
                            self.emit('agent-connect', {_id: user, displayName: resp.data.displayName, channel: _channel, services: resp.data.services, sid: self.socket.sessionid, maxChatSession: resp.data.maxChatSession});
                            if (resp.data.agentGroupLeaders.length > 0 || resp.data.companyLeaders.length > 0 || resp.data.ternalLeaders.length > 0){
                                //Bật tab supervisior và emit socket lên
                                $(_this('.navbar-left')).append(_.Tags([{tag: 'li', attr: {id: 'btn-supervisior'}, childs: [{tag: 'a', childs: [{tag: 'i', attr: {class: 'zmdi zmdi-time f-22 p-relative t-2 m-r-5'}}], content: 'Supervisor'}]}]));
                                ChatContainer._agentSearch  = false; //Dùng để phân biệt khi search history
                                self.emit('supervisior-connect', {_id: user, displayName: resp.data.displayName, sid: self.socket.sessionid, agentGroupLeaders: resp.data.agentGroupLeaders, companyLeaders: resp.data.companyLeaders, ternalLeaders: resp.data.ternalLeaders});
                                self.on('supervisior-mapped', function(data){
                                    var agent = data.agent;
                                    var customer = data.customer;
                                    var info = customer.name ? customer.name : '';
                                    if (!info) info = customer.phone ? customer.phone : '';
                                    if (!info) info = customer.mail ? customer.mail : customer.region + ' #' + customer.cookie;
                                    var customerId = customer.ip + '-' + customer.channel + '-' + customer.service + '-' + customer.cookie;

                                    //Chỉnh lại cho phù hợp với các trường của CCKFields
                                    customer['field_ho_ten'] = customer.name;
                                    customer['field_so_dien_thoai'] = customer.phone;
                                    customer['field_mail'] = customer.mail;
                                    customer['agent'] = agent.displayName;
                                    if (!_.has(_customers, customerId)){
                                        ChatContainer.updateCustomer(customerId, { customer: customer, countDown: new CountDownTimer(timeIdle), timer: customer.timer, newMsg: 0 }, function () {
                                            _customers[customerId].countDown.start();
                                            var tbl = customer.status == 1 ? '#chat-tbl-active-visitor' : '#chat-tbl-idle-visitor';
                                            if ($(_this('#supervisior-panel ' + tbl)).bootstrapTable('getRowByUniqueId', customerId) == null){
                                                //Thêm bản ghi
                                                ChatContainer.updateTable('supervisior-panel', customer.status == 1 ? 'active' : 'idle', 1, customerId);
                                                ChatContainer.updateBadge('supervisior-panel', customer.status == 1 ? 'active' : 'idle', 1);
                                            }
                                            else{
                                                $(_this('#supervisior-panel ' + tbl)).bootstrapTable('updateByUniqueId', {
                                                    id: customerId,
                                                    row: {
                                                        id: customerId,
                                                        customer: info,
                                                        location: _.Tags([{ tag: 'i', attr: { title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode } }]) + customer.region,
                                                        online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60)) + " phút" : 'Vừa online',
                                                        viewing: _.Tags([{ tag: 'a', attr: { href: customer.url, target: '_blank' }, content: customer.title }]),
                                                        agent: _.has(agent, 'displayName') ? agent.displayName : ''
                                                    }
                                                }).bootstrapTable('refresh');
                                            }

                                            _customers[customerId].countDown.onTick(function (minutes, seconds) {
                                                _customers[customerId].timer += 1;
                                                if (parseInt(_customers[customerId].timer) % 60 == 0) {
                                                    //Cập nhật thời gian online
                                                    if ($('.chat-dialog[data-id="' + customerId + '"]')[0]) {
                                                        $('.chat-dialog[data-id="' + customerId + '"]').find('.cus-timer').text((parseInt(_customers[customerId].timer) / 60 == 0) ? 'Vừa online' : (parseInt(_customers[customerId].timer) / 60 + ' phút'));
                                                    }
                                                    var tbl = '#chat-tbl-active-visitor';
                                                    if (_customers[customerId].customer.status == 0) {
                                                        tbl = '#chat-tbl-idle-visitor';
                                                    }
                                                    $(_this('#supervisior-panel ' + tbl)).bootstrapTable('updateByUniqueId', {
                                                        id: customerId,
                                                        row: {
                                                            id: customerId,
                                                            customer: info,
                                                            location: _.Tags([{ tag: 'i', attr: { title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode } }]) + customer.region,
                                                            online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60)) + " phút" : 'Vừa online',
                                                            viewing: _.Tags([{ tag: 'a', attr: { href: customer.url, target: '_blank' }, content: customer.title }])
                                                        }
                                                    }).bootstrapTable('refresh');
                                                }
                                                if (minutes == 0 && seconds == 0) {
                                                    _customers[customerId].countDown.start();
                                                }
                                            });
                                        });

                                    }
                                    else{
                                        //Update
                                        ChatContainer.updateCustomer(customerId, { customer: customer, countDown: new CountDownTimer(timeIdle), timer: customer.timer, newMsg: 0 }, function () {
                                            var tbl = customer.status == 1 ? '#chat-tbl-active-visitor' : '#chat-tbl-idle-visitor';
                                            if ($(_this('#supervisior-panel ' + tbl)).bootstrapTable('getRowByUniqueId', customerId) == null){
                                                ChatContainer.updateTable('supervisior-panel', customer.status == 1 ? 'active' : 'idle', 1, customerId);
                                                ChatContainer.updateBadge('supervisior-panel', customer.status == 1 ? 'active' : 'idle', 1);
                                            }
                                            else{
                                                $(_this('#supervisior-panel ' + tbl)).bootstrapTable('updateByUniqueId', {
                                                    id: customerId,
                                                    row: {
                                                        id: customerId,
                                                        customer: info,
                                                        location: _.Tags([{ tag: 'i', attr: { title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode } }]) + customer.region,
                                                        online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60)) + " phút" : 'Vừa online',
                                                        viewing: _.Tags([{ tag: 'a', attr: { href: customer.url, target: '_blank' }, content: customer.title }]),
                                                        agent: _.has(agent, 'displayName') ? agent.displayName : ''
                                                    }
                                                }).bootstrapTable('refresh');
                                            }
                                        });
                                    }
                                });
                            }

                            var updatePanelIfIdle = function(panelId, data){
                                if (_customers[data.clientId].customer.status == 1) {
                                    _customers[data.clientId].customer.status = 0;
                                    //Update supervisior panel
                                    ChatContainer.updateBadge(panelId, 'active', -1);
                                    ChatContainer.updateBadge(panelId, 'idle', 1);
                                    ChatContainer.updateTable(panelId, 'active', -1, data.clientId);
                                    ChatContainer.updateTable(panelId, 'idle', 1, data.clientId);
                                }
                            }

                            self.on('client-idle', function(data){
                                //Khách hàng idle
                                updatePanelIfIdle('visitor-panel', data);
                            });

                            self.on('supervisior-idle', function(data){
                                //Khách hàng idle, cập nhật cho supervisor tab
                                updatePanelIfIdle('supervisior-panel', data);
                            });

                            self.on('customer-mapped', function (customer) {
                                //Được route khách hàng
                                //Cập nhật id vào danh sách các agent hỗ trợ cuộc chat
                                $.ajax({
                                    url: '/chat-client/' + customer.threadId,
                                    type: 'PUT',
                                    data: {
                                        typeUpdate: 0,
                                        clientId: customer.clientId,
                                        region: customer.region,
                                        country: customer.country,
                                        agentId: customer.aid,
                                        send: 0,
                                        receive: 0,
                                        response: 0
                                    },
                                    success: function(data) {
                                    }
                                });

                                //Thêm/cập nhật bản ghi vào bảng danh sách khách hàng đang online
                                var offline = customer.offline;
                                var info = customer.name ? customer.name : '';
                                if (!info) info = customer.phone ? customer.phone : '';
                                if (!info) info = customer.mail ? customer.mail : customer.region + ' #' + customer.cookie;
                                var customerId = customer.ip + '-' + customer.channel + '-' + customer.service + '-' + customer.cookie;
                                var dataQuery = 'queryCustomer=1' + ((!_.isUndefined(customer.idCustomer) && customer.idCustomer != null) ? ('&idCustomer=' + customer.idCustomer) : '');
                                $.ajax({
                                    url: '/chat-client',
                                    type: 'GET',
                                    data: dataQuery,
                                    success: function(data){
                                        if (data.customer != null){
                                            var fields_info = _.pick(data.customer, function(v, k, o){
                                                return k.indexOf('field_') >= 0;
                                            });
                                            async.each(_.keys(fields_info), function(field, cb){
                                                customer[field] = (fields_info[field] != null && fields_info[field].length) > 0 ? fields_info[field][0].value : '';
                                                cb();
                                            }, function(err, resp){
                                                if (!_.has(customer, 'field_ho_ten')) customer['field_ho_ten'] = customer.name;
                                                if (!_.has(customer, 'field_so_dien_thoai')) customer['field_so_dien_thoai'] = customer.phone;
                                                if (!_.has(customer, 'field_mail')) customer['field_mail'] = customer.mail;
//                        if (_.has(_customers, customerId)) return; //agent dang nhap cua so moi, khong insert lai customer o cua so cu
                                                var id = 'cus-' + customerId;
                                                ChatContainer.updateCustomer(customerId, {customer: customer, countDown: new CountDownTimer(timeIdle), timer: customer.timer, newMsg: 0, send: 0, receive: 0, response: 0}, function(){
                                                    _customers[customerId].countDown.start();
                                                    _customers[customerId].countDown.onTick(function(minutes, seconds){
                                                        _customers[customerId].timer += 1;
                                                        if (parseInt(_customers[customerId].timer) % 60 == 0){
                                                            if ($(_this('.chat-dialog[data-id="' + customerId + '"]'))[0]){
                                                                $(_this('.chat-dialog[data-id="' + customerId + '"]')).find('.cus-timer').text((parseInt(_customers[customerId].timer) / 60 == 0) ? 'Vừa online' : (parseInt(_customers[customerId].timer) / 60  + ' phút'));
                                                            }
                                                            if (_customers[customerId].customer.status == 1){
                                                                $(_this('#visitor-panel #chat-tbl-active-visitor')).bootstrapTable('updateByUniqueId', {
                                                                    id: customerId,
                                                                    row: {
                                                                        id: customerId,
                                                                        customer: info,
                                                                        location: _.Tags([{tag: 'i', attr: {title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode}}]) + customer.region,
                                                                        online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60))  + " phút" : 'Vừa online',
                                                                        viewing: _.Tags([{tag: 'a', attr: {href: customer.url, target: '_blank'}, content: customer.title}])
                                                                    }
                                                                }).bootstrapTable('refresh');
                                                            }
                                                            else{
                                                                $(_this('#visitor-panel #chat-tbl-idle-visitor')).bootstrapTable('updateByUniqueId', {
                                                                    id: customerId,
                                                                    row: {
                                                                        id: customerId,
                                                                        customer: info,
                                                                        location: _.Tags([{tag: 'i', attr: {title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode}}]) + customer.region,
                                                                        online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60))  + " phút" : 'Vừa online',
                                                                        viewing: _.Tags([{tag: 'a', attr: {href: customer.url, target: '_blank'}, content: customer.title}])
                                                                    }
                                                                }).bootstrapTable('refresh');
                                                            }
                                                        }
                                                        if (minutes == 0 && seconds == 0){
                                                            _customers[customerId].countDown.start();
                                                        }
                                                    });
                                                    var tbl = _customers[customerId].customer.status == 1 ? '#chat-tbl-active-visitor' : '#chat-tbl-idle-visitor';

                                                    //Thêm bản ghi vào phần active
                                                    ChatContainer.updateTable('visitor-panel', _customers[customerId].customer.status == 1 ? 'active' : 'idle', 1, customerId);
                                                    ChatContainer.updateBadge('visitor-panel', _customers[customerId].customer.status == 1 ? 'active' : 'idle', 1);
                                                    //Bật mini popup
                                                    if (offline == 1){
                                                        ChatContainer.open(customerId, customer, {});
                                                    }
                                                });
                                            });
                                        }
                                        else{
                                            if (!_.has(customer, 'field_ho_ten')) customer['field_ho_ten'] = customer.name;
                                            if (!_.has(customer, 'field_so_dien_thoai')) customer['field_so_dien_thoai'] = customer.phone;
                                            if (!_.has(customer, 'field_mail')) customer['field_mail'] = customer.mail;
                                            ChatContainer.updateCustomer(customerId, {customer: customer, countDown: new CountDownTimer(timeIdle), timer: customer.timer, newMsg: 0, send: 0, receive: 0, response: 0}, function(){
                                                _customers[customerId].countDown.start();
                                                _customers[customerId].countDown.onTick(function(minutes, seconds){
                                                    _customers[customerId].timer += 1;
                                                    if (parseInt(_customers[customerId].timer) % 60 == 0){
                                                        if ($(_this('.chat-dialog[data-id="' + customerId + '"]'))[0]){
                                                            $(_this('.chat-dialog[data-id="' + customerId + '"]')).find('.cus-timer').text((parseInt(_customers[customerId].timer) / 60 == 0) ? 'Vừa online' : (parseInt(_customers[customerId].timer) / 60  + ' phút'));
                                                        }
                                                        if (_customers[customerId].customer.status == 1){
                                                            $(_this('#visitor-panel #chat-tbl-active-visitor')).bootstrapTable('updateByUniqueId', {
                                                                id: customerId,
                                                                row: {
                                                                    id: customerId,
                                                                    customer: info,
                                                                    location: _.Tags([{tag: 'i', attr: {title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode}}]) + customer.region,
                                                                    online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60))  + " phút" : 'Vừa online',
                                                                    viewing: _.Tags([{tag: 'a', attr: {href: customer.url, target: '_blank'}, content: customer.title}])
                                                                }
                                                            }).bootstrapTable('refresh');
                                                        }
                                                        else{
                                                            $(_this('#visitor-panel #chat-tbl-idle-visitor')).bootstrapTable('updateByUniqueId', {
                                                                id: customerId,
                                                                row: {
                                                                    id: customerId,
                                                                    customer: info,
                                                                    location: _.Tags([{tag: 'i', attr: {title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode}}]) + customer.region,
                                                                    online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60))  + " phút" : 'Vừa online',
                                                                    viewing: _.Tags([{tag: 'a', attr: {href: customer.url, target: '_blank'}, content: customer.title}])
                                                                }
                                                            }).bootstrapTable('refresh');
                                                        }
                                                    }
                                                    if (minutes == 0 && seconds == 0){
                                                        _customers[customerId].countDown.start();
                                                    }
                                                });
                                                var tbl = _customers[customerId].customer.status == 1 ? '#chat-tbl-active-visitor' : '#chat-tbl-idle-visitor';

                                                //Thêm bản ghi vào phần active
                                                ChatContainer.updateTable('visitor-panel', _customers[customerId].customer.status == 1 ? 'active' : 'idle', 1, customerId);
                                                ChatContainer.updateBadge('visitor-panel', _customers[customerId].customer.status == 1 ? 'active' : 'idle', 1);
                                                //Bật mini popup
                                                if (offline == 1){
                                                    ChatContainer.open(customerId, customer, {});
                                                }
                                            });
                                        }
                                    }
                                });
                            });

                            self.on('supervisior-agent-leave', function(customer){
                                //Cập nhật trong tab supervisor khi có agent rời hệ thống chat
                                var info = customer.name ? customer.name : '';
                                if (!info) info = customer.phone ? customer.phone : '';
                                if (!info) info = customer.mail ? customer.mail : customer.region + ' #' + customer.cookie;
                                var customerId = customer.ip + '-' + customer.channel + '-' + customer.service + '-' + customer.cookie;
                                var tbl = '#chat-tbl-idle-visitor';
                                if (_customers[customer.clientId].status == 1){
                                    $(_this('#supervisior-panel ' + tbl)).bootstrapTable('updateByUniqueId', {
                                        id: customerId,
                                        row: {
                                            id: customerId,
                                            customer: info,
                                            location: _.Tags([{ tag: 'i', attr: { title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode } }]) + customer.region,
                                            online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60)) + " phút" : 'Vừa online',
                                            viewing: _.Tags([{ tag: 'a', attr: { href: customer.url, target: '_blank' }, content: customer.title }]),
                                            agent: ''
                                        }
                                    }).bootstrapTable('refresh');
                                }
                            });

                            self.on('close-thread', function(data){
                                //Cuộc chat bị đóng lại
                                _customers[data.customerId].customer.threadId = data.customer.threadId;
                                _customers[data.customerId].customer.newThread = 1;
                                delete _customers[data.customerId].customer.ticketId;
                                ChatContainer.open(data.customerId, data.customer, {msg: data.msg, type: 2});
                            });

                            self.on('auto-close-thread', function(data){
                                //Listen sự kiện cuộc chat bị đóng tự động
                                ChatContainer.open(data.clientId, {}, {msg: data.msg, type: 2});
                            });

                            self.on('customer-msg', function (data) {
                                //Listen sự kiện tin nhắn mới của khách hàng
                                var customerId = data.customer.ip + '-' + data.customer.channel + '-' + data.customer.service + '-' + data.customer.cookie;
                                NotiHelper.notiNewMessage(data.customer, data.msg, data.fileName);
                                //update agentId for thread
                                if (_.has(_customers[customerId].customer, 'newThread')){
                                    $.ajax({
                                        url: '/chat-client/' + _customers[customerId].customer.threadId,
                                        type: 'PUT',
                                        data: "agentId=" + user + "&typeUpdate=0",
                                        success: function(data) {
                                        }
                                    });
                                    delete _customers[customerId].customer['newThread'];
                                }

                                var lowAlert = 5000, highAlert = 10000, timeSLA = 100000; //giá trị default
                                var sv = _.find(ChatContainer._agent.services, function(s){
                                    return _.isEqual(s._id, data.customer.service);
                                });
                                //Thay thế giá trị default bằng các giá trị đã cấu hình bên CRM
                                if (!_.isUndefined(sv)){
                                    lowAlert = Number(sv.lowAlert) * 1000;
                                    highAlert = Number(sv.highAlert) * 1000;
                                    timeSLA = Number(sv.SLA) * 1000;
                                }
                                setTimeout(function(){
                                    //chờ minibar render xong
                                    var $iconTab = $('#chat-bars-container li[data-id="' + customerId + '"]').find('.icon-tab');
                                    if (!_.has(_customers[customerId], 'lowAlert')){
                                        _customers[customerId].lowAlert = setTimeout(function(){
                                            changeStateCustomer(2, $iconTab);
                                        }, lowAlert);
                                    }

                                    if (!_.has(_customers[customerId], 'highAlert')){
                                        _customers[customerId].highAlert = setTimeout(function(){
                                            changeStateCustomer(3, $iconTab);
                                        }, highAlert);
                                    }

                                    if (!_.has(_customers[customerId], 'SLA')){
                                        _customers[customerId].SLA = setTimeout(function(){
                                            var customer = ChatContainer._customers[customerId];
                                            $.ajax({
                                                url: '/chat-client/' + customer.customer.threadId,
                                                type: 'PUT',
                                                data: {
                                                    typeUpdate: 2,
                                                    clientId: customerId,
                                                    region: customer.customer.region,
                                                    country: customer.customer.country,
                                                    agentId: customer.customer.aid,
                                                    send: customer.send,
                                                    receive: customer.receive,
                                                    response: customer.response,
                                                    outSLA: 1
                                                },
                                                success: function(data) {
                                                    if (data.code == 200){
                                                        customer.threadId = data.newThread;
                                                        customer.customer.threadId = data.newThread;
                                                        customer.newThread = 1;
                                                        customer.receive = 0;
                                                        customer.send = 0;
                                                        customer.response = 0;
                                                        customer.timeReceive = customer.timer;
                                                    }
                                                }
                                            });
                                        }, timeSLA);
                                    }
                                }, 100);

                                var customer = _customers[customerId].customer;
                                ChatContainer._customers[customerId].timeReceive = _customers[customerId].timer;
                                ChatContainer._customers[customerId].receive += 1;
                                var info = customer.name ? customer.name : '';
                                if (!info) info = customer.phone ? customer.phone : '';
                                var id = 'cus-' + customerId;
                                if (!info) info = customer.mail ? customer.mail : customer.region + ' #' + customer.cookie;
                                //Cập nhật label active/idle
                                if (_customers[customerId].customer.status == 0){
                                    ChatContainer.updateBadge('visitor-panel', 'active', 1);
                                    ChatContainer.updateBadge('visitor-panel', 'idle', -1);
                                    ChatContainer.updateTable('visitor-panel', 'active', 1, customerId);
                                    ChatContainer.updateTable('visitor-panel', 'idle', -1, customerId);
                                    _customers[customerId].customer.status = 1;
                                }
                                if (_customers[customerId].newMsg == 0){
                                    //Cap nhat giao dien chat request table
                                    $(_this('#visitor-panel #chat-tbl-request-visitor')).bootstrapTable('insertRow', {
                                        index: 0,
                                        row: {
                                            id: customerId,
                                            customer: info,
                                            location: _.Tags([{tag: 'i', attr: {title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode}}]) + customer.region,
                                            online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60))  + " phút" : 'Vừa online',
                                            viewing: _.Tags([{tag: 'a', attr: {href: customer.url, target: '_blank'}, content: customer.title}])
                                        }
                                    }).bootstrapTable('refresh');
                                }
                                ChatContainer.open(customerId, data.customer, data['url-attachment'] ? {msg: data.msg, attachment: data['url-attachment'], fileName: data['fileName']/*, threadId: data.threadId*/} : {msg: data.msg/*, threadId: data.threadId*/});
                            });

                            self.on('supervisior-customer-msg', function (data) {
                                //Cập nhật bên tab supervisor
                                var customerId = data.customer.ip + '-' + data.customer.channel + '-' + data.customer.service + '-' + data.customer.cookie;
                                var customer = _customers[customerId].customer;
                                var info = customer.name ? customer.name : '';
                                if (!info) info = customer.phone ? customer.phone : '';
                                var id = 'cus-' + customerId;
                                if (!info) info = customer.mail ? customer.mail : customer.region + ' #' + customer.cookie;
                                //Cập nhật label active/idle
                                if (_.has(_customers, customerId) && _customers[customerId].customer.status == 0){
                                    ChatContainer.updateBadge('supervisior-panel', 'active', 1);
                                    ChatContainer.updateBadge('supervisior-panel', 'idle', -1);
                                    ChatContainer.updateTable('supervisior-panel', 'active', 1, customerId);
                                    ChatContainer.updateTable('supervisior-panel', 'idle', -1, customerId);
                                    _customers[customerId].customer.status = 1;
                                }
                            });

                            self.on('customer-leave', function (data) {
                                //Khách hàng rời cuộc chat
                                var customerId = data.customer.ip + '-' + data.customer.channel + '-' + data.customer.service + '-' + data.customer.cookie;
                                var $tbl = $(_this('#visitor-panel tr[data-uniqueid="' + customerId + '"]')).closest('table');
                                ChatContainer._customers[customerId]['left'] = 1;
                                ChatContainer.customerStatus(customerId, 'Offline');
                                ChatContainer.updateBadge('visitor-panel', $tbl.attr('data-type'), -1);
                                $tbl.bootstrapTable('removeByUniqueId', data.customer.ip + '-' + data.customer.channel + '-' + data.customer.service + '-' + data.customer.cookie).bootstrapTable('refresh');
                            });

                            self.on('supervisior-customer-leave', function(data){
                                //Khách hàng rời cuộc chat, cập nhật cho tab supervisor
                                var customerId = data.clientId;
                                var $tbl = $(_this('#supervisior-panel tr[data-uniqueid="' + customerId + '"]')).closest('table');
                                ChatContainer.customerStatus(customerId, 'Offline');
                                ChatContainer.updateBadge('supervisior-panel', $tbl.attr('data-type'), -1);
                                $tbl.bootstrapTable('removeByUniqueId', customerId).bootstrapTable('refresh');
                            });

                            self.on('changeAgentStatus', function(data){
                                //Agent đổi trạng thái on/off, cập nhật giao diện
                                var status = Number(data.status);
                                $.map($(_this('.chat-status')), function (n, i) {
                                    if ($(n).attr('data-chat-status') == status) {
                                        var htmlText = '<i class="zmdi zmdi-account m-r-5"></i>' + $(n).html() + ' <span class="caret"></span>';
                                        if (status == 1){
                                            htmlText = '<i class="zmdi c-green zmdi-account m-r-5"></i>' + $(n).html() + ' <span class="caret"></span>';
                                        }
                                        $(_this('#chat-status-info')).html(htmlText);
                                    }
                                });
                            });

                            self.on('customer-change-view', function(data){
                                //Khách hàng thay đổi trang đang theo dõi
                                //Cập nhật layout
                                var w = $('.chat-dialog[data-id="' + data.customerId + '"]');
                                var $currTitle = w.find('.cus-url').find('a');
                                var $oldTitle = w.find('.cus-oldUrl').find('a');
                                $oldTitle.text($currTitle.text());
                                $oldTitle.attr('href', $currTitle.attr('href'));
                                $currTitle.text(data.title);
                                $currTitle.attr('href', data.url);
                            });
                        }
                    });
                }
            });
        });
    }

        /**
     * Object helper to show Notification and Sound
     * @type {{}}
     */
        // Check tab chat is active
    var isActive = false;
    var notiSetting = {
        enableSound: true,
        enableNoti: true
    };
    var NotiHelper = (function() {
        var iconUrl = '/assets/images/chat-notification-icon.png';
        var iconTelehub = '/assets/images/logo-pos.png';
        var soundAlert = '/assets/sounds/alert.ogg';
        var exports = {};
        function requestPermission(callback) {
            $.notification.requestPermission().then(callback);
        }

        function permissionLevel() {
            return $.notification.permissionLevel();
        }


        /**
         * Hiển thị thông báo desktop
         * @param title
         * @param msg
         * @param tag
         * @param onClick
         */
        function showNotification(title, msg, tag, onClick) {
            if (!$('#label-tab-chat').hasClass('active') || !document.hasFocus()) {
                var icon = iconUrl;
                switch (tag) {
                    case 'telehub':
                        icon = iconTelehub;
                        break;
                    default: break;
                }
                if (notiSetting.enableNoti) {
                    var options = {
                        iconUrl: icon,
                        title: title,
                        body: msg,
                        tag: tag,
                        autoclose: true,
                        timeout: 10 * 1000,
                        requireInteraction: true,
                        onclick: onClick
                    };
                    $.notification(options);
                }
                if (notiSetting.enableSound) {
                    fireSound(soundAlert);
                }
            }
        }

        /**
         * Trick load cache audio file
         */
        function preloadAudio() {
            var audio = new Audio();
            audio.scr = soundAlert;
            audio.addEventListener('canplaythrough', function() {
                fireSound(soundAlert);
            });
        }

        function fireSound(src) {
            var audio = new Audio(src);
            audio.play();
        }

        exports.init = function() {
            $(window).focus(function() {
                isActive = true;
            });
            $(window).blur(function() {
                isActive = false;
            });
            requestPermission(function(permistion) {
                notiSetting.enableNoti = permistion === 'granted';
                if (notiSetting.enableNoti) {
                    showNotification('TELEHUB', 'Thông báo desktop được bật!', 'telehub');
                }
            });
        };
        exports.requestPermission = requestPermission;
        exports.notiNewMessage = function(customer, msg, fileName) {
            var title = customer.phone || customer.cookie;
            var message = msg;
            var tag = 'newmsg-' + customer.clientId;
            if (!_.isEmpty(fileName)) {
                message = 'Đã gửi một file [' + fileName + ']';
                tag = 'newfile-' + customer.clientId;
            }
            showNotification(title, message, tag, function() {
                $('a[href$="#tab-chat"]').trigger('click');
                $('#chat-bars-container').find('li[data-id="' + customer.clientId + '"] :not(.zmdi-close)').trigger( "click" );
                var container = $('.chat-dialog[data-id="' + customer.clientId + '"]').find('.chat-msg-container');
                container.scrollTop(container[0].scrollHeight);
            });
        };
        return exports;
    })();

    //Object ChatContainer
    var ChatContainer = window.ChatContainer = Object.create({
        topIndex: 10,
        childs: {},
        container: null,
        barcontainer: null,
        tabCounter: null,
        counter: 0,
        _threadChats: [], //thread history chat
        _customers: {}, //khách hàng
        _socket: {},
        _agent: {}, //agent
        _agentSearch: true,
        init: function () {
            this.container = $('.tab-pane#tab-chat');
            this.barcontainer = $('.tab-pane#tab-chat #chat-bars-container');
            this.tabCounter = $('a[href="#tab-chat"] i.tmn-counts');
            ChatInit();
            NotiHelper.init();
            return this;
        },

        /**
         * Update số lượng khách hàng mới
         * @param add - số lượng
         * @returns {ChatContainer}
         */
        updateCounter: function (add) {
            var self = this;
            add ? self.counter++ : self.counter--;
            self.tabCounter.text(self.counter);
            _.isEqual(self.counter, 0) ? self.tabCounter.hide() : self.tabCounter.show();
            return self;
        },

        /**
         * Mở cửa sổ chat
         * @param tid - id client khách hàng
         * @param customer - thông tin khách hàng
         * @param msg - msg nếu có
         */
        open: function (tid, customer, msg) {
            var self = this;
            self.topIndex++;
            var _w = {};
            var _customer = self._customers[tid].customer;
            var info = _customer['field_ho_ten'] ? _customer['field_ho_ten'] : '';
            if (!info) info = _customer['field_so_dien_thoai'] ? _customer['field_so_dien_thoai'] : '';
            if (!info) info = _customer['field_mail'] ? _customer['field_mail'] : _customer.region + ' #' + _customer.cookie;

            var _wb = $('#chat-bars-container li[data-id="' + tid + '"]');
            if (_wb[0]){
                //Đã có chat bar và dialog
                //Thêm msg mới vào dialog
                _w = $('.chat-dialog[data-id="' + tid + '"]');
                _w.css('z-index', self.topIndex);
                if (_.has(_customer, 'phone') && customer.phone.length) _w.find('.cus-phone').text(_customer['field_so_dien_thoai']);
                if (_.has(_customer, 'mail') && customer.mail.length) _w.find('.cus-mail').text(_customer['field_mail']);
                if (_.has(_customer, 'title') && customer.title.length && _.has(customer, 'url') && _customer.url.length) _w.find('.cus-url').html(_.Tags([{tag: 'a', attr: {href: customer.url}, content: customer.title}]));
                _wb.attr('i-c', false).attr('i-u', true).siblings().attr('i-u', false);
                if (_wb.find('i.icon-tab').hasClass('i-offline')){
                    //Khách hàng quay trở lại
                    _w.attr('data-status', 'offline');
                }
                else{
                    _w.attr('data-status', 'online');
                }

                self.customerStatus(tid, 'Online');
                if (_.has(msg, 'msg')){
                    if (!_.has(msg, 'type') && self._customers[tid].newMsg == 0){
                        _wb.attr('i-u', true);
                        self._customers[tid].newMsg = 1;
                        self.updateCounter(true);
                        self.updateBadge('visitor-panel', 'cquest', 1);
                    }
                    else{
                        if (_.has(msg, 'type') && msg['type'] == 2){
                            $('.content-ticket[data-id="' + tid +'"] iframe').remove();
                            var ticketId = self._customers[tid].customer.ticketId;
                            var ticketParam = (ticketId != null && ticketId != undefined) ? ('&ticketId=' + ticketId) : '';
                            if (_.has(self._customers[tid].customer, 'idCustomer') && self._customers[tid].customer.idCustomer != null){
                                ticketParam = ticketParam  + '&CustomerId=' + self._customers[tid].customer.idCustomer;
                            }
                            $(_this(".content-ticket[data-id='" + tid + "']")).append('<iframe width="100%" height="100%" border="none" src="/ticket?type=chat&service=' + tid.split('-')[2] + '&threadId='+ self._customers[tid].customer.threadId +'&dialogId=' + tid + ticketParam +'"></iframe>');
                            $('.page-loader').show();
                            setTimeout(function(){
                                self._customers[tid].customer.ticketId = window.getTicketId('chat', tid);
                                $('.page-loader').hide();
                            }, 1000);

//                            var ticketId = window.getTicketId('chat', self._customers[tid].customer.threadId );
//                            var ticketParam = (ticketId != null) ? ('&ticketId=' + ticketId) : '';
//                            $(_this(".content-ticket[data-id='" + tid + "']")).html('<iframe width="100%" height="100%" border="none" src="/ticket?type=chat&service=' + tid.split('-')[2] + '&threadId='+ self._customers[tid].customer.threadId +'&dialogId=' + tid + ticketParam +'"></iframe>');
                        }
                    }
                    var $content = _w.find('.chat-msg-container');
                    if (_.has(msg, 'attachment')){
                        var _ext = ['jpg', 'png', 'bmp'];
                        var ext = msg['fileName'].split('.')[1];
                        if ( _.filter(_ext, function(obj){
                                return ext.indexOf(obj) >= 0;
                            }).length > 0){
                            $content.append(_.Tags([{tag: 'div', attr: {class: 'chat-message c-orange'},
                                childs: [
                                    {tag: 'div', attr: {class: 'chat-message-bubble'},
                                        childs: [
                                            {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                            {tag: 'div', attr: {class: 'msg-preview'},
                                                childs: [
                                                    {tag: 'img', attr: {src: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + msg['attachment']}, alt: msg['fileName']}
                                                ]
                                            }
                                        ]
                                    }
                                ]}
                            ]));
                        }
                        else{
                            $content.append(_.Tags([{tag: 'div', attr: {class: 'chat-message c-orange'},
                                childs: [
                                    {tag: 'div', attr: {class: 'chat-message-bubble'},
                                        childs: [
                                            {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                            {tag: 'div', attr: {class: 'msg-preview'},
                                                childs: [
                                                    {tag: 'i', attr: {class: 'zmdi zmdi-file'}},
                                                    {tag: 'a', attr: {class: 'm-l-10', href: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + msg['attachment'], target: '_blank'}, content: msg['fileName']}
                                                ]
                                            }
                                        ]
                                    }
                                ]}
                            ]));
                        }
                    }
                    else{
                        var $time = _.Tags([{tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')}]);
                        if (_.has(msg, 'type') && (msg['type'] == 2)){
                            //2: tự agent close chat và cần refresh lại trang tạo ticket
                            $time = _.Tags([{tag: 'div', attr: {class: 'msg-time'}, childs: [{tag: 'i', content: moment().format('HH:mm:ss A')}]}]);
                            $content.append(_.Tags([{tag: 'div', attr: {class: 'm-b-15'}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble'}, childs: [{tag: 'i', attr: {class: 'f-12'}, content: $time + msg.msg}]}]}]));
                        }
                        else{
                            $content.append(_.Tags([{tag: 'div', attr: {class: 'chat-message'}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble'}, content: $time + msg.msg}]}]));
                        }
                        $content.scrollTop($content[0].scrollHeight);
                    }
                }
            }
            else{
                //Chưa có chat bar và dialog
                //Tạo mới và load history
                customer['clientId'] = tid;
                if (_.has(msg, 'msg')){
                    self._customers[tid].newMsg = 1;
                    self.updateCounter(true);
                    self.updateBadge('visitor-panel', 'cquest', 1);
                }
                //Check db xem đã có thông tin khách hàng này chưa?
                _w = $(_.Tags([{
                    tag: 'div', attr: {class: 'chat-dialog ui-widget-content p-0 p-absolute', 'data-id': tid, /*'data-threadId': msg.threadId, */style: 'display:none;z-index:' + self.topIndex}, childs: [
                        {tag: 'h5', attr: {class: 'ui-widget-header m-0 p-5 p-l-10 bgm-orange'}, content: info, childs: [
                            {tag: 'select', attr: {class: 'select-helper c-black r-30'}, childs: [
                                {tag: 'option', attr: {value: ''}, content: '-- Chọn --'},
                                {tag: 'option', attr: {value: '1'}, content: 'Kết thúc chat'},
                                {tag: 'option', attr: {value: '2'}, content: 'Chuyển chat'},
                                {tag: 'option', attr: {value: '3'}, content: 'Chặn'}
                            ]},
                            {tag: 'i', attr: {class: 'zmdi zmdi-minus p-absolute t-5 r-10 f-22'}}
                        ]},
                        {
                            tag: 'div', attr: {class: 'content', 'data-id': tid}, childs: [
                            {
                                tag: 'div', attr: {class: 'col-sm-4 left-side h-p-100 p-0 info-panel', style: 'border-right:solid 1px rgba(220, 220, 220, 0.36)'},
                                childs: [
                                    {tag: 'h5', attr: {class: 'pane-title'}, content: 'THÔNG TIN'},
                                    {
                                        tag: 'table', attr: {class: 'table table-fixed f-13', style: "height: 51%"},
                                        childs: [
                                            {
                                                tag: 'tr',
                                                childs: [{tag: 'td', childs: [{tag: 'div', content: 'số điện thoại'}], attr: {class: 'text-uppercase f-11'}}, {tag: 'td', attr: {class: 'w-3'}, content: ':'}, {tag: 'td', childs: [{tag: 'span', attr: {clientId: customer['clientId'], class: 'cus-phone'}, content: _customer && _.has(_customer, 'field_so_dien_thoai') ? _customer.field_so_dien_thoai : ''}]}]
                                            },
                                            {
                                                tag: 'tr',
                                                childs: [{tag: 'td', childs: [{tag: 'div', content: 'mail'}], attr: {class: 'text-uppercase f-11'}}, {tag: 'td', attr: {class: 'w-3'}, content: ':'}, {tag: 'td', childs: [{tag: 'span', attr: {clientId: customer['clientId'], class: 'cus-mail'}, content: _customer && _.has(_customer, 'field_mail') ? _customer.field_mail : ''}]}]
                                            },
                                            {
                                                tag: 'tr',
                                                childs: [{tag: 'td', childs: [{tag: 'div', content: 'đang xem'}], attr: {class: 'text-uppercase f-11'}}, {tag: 'td', attr: {class: 'w-3'}, content: ':'}, {tag: 'td', attr: {class: 'cus-url'}, childs: [{tag: 'a', attr: {href: customer.url, target: '_blank'}, content: customer.title}]}]
                                            },
                                            {
                                                tag: 'tr',
                                                childs: [{tag: 'td', childs: [{tag: 'div', content: 'vừa xem'}], attr: {class: 'text-uppercase f-11'}}, {tag: 'td', attr: {class: 'w-3'}, content: ':'}, {tag: 'td', attr: {class: 'cus-oldUrl'}, childs: [{tag: 'a', attr: {href: customer.oldUrl, target: '_blank'}, content: customer.oldTitle}]}]
                                            },
                                            {
                                                tag: 'tr',
                                                childs: [{tag: 'td', childs: [{tag: 'div', content: 'thời gian trên website'}], attr: {class: 'text-uppercase f-11'}}, {tag: 'td', attr: {class: 'w-3'}, content: ':'}, {tag: 'td', childs: [{tag: 'span', attr: {class: 'cus-timer'}, content: (parseInt(ChatContainer._customers[customer.clientId].timer) / 60 < 1) ? 'Vừa online' : (parseInt(ChatContainer._customers[customer.clientId].timer / 60)  + ' phút')}]}]
                                            },
                                            {
                                                tag: 'tr',
                                                childs: [{tag: 'td', childs: [{tag: 'div', content: 'browser'}], attr: {class: 'text-uppercase f-11'}}, {tag: 'td', attr: {class: 'w-3'}, content: ':'}, {tag: 'td', childs: [{tag: 'span', attr: {class: 'cus-browser'}, content: customer.browser.browser}]}]
                                            },
                                            {
                                                tag: 'tr',
                                                childs: [{tag: 'td', childs: [{tag: 'div', content: 'OS'}], attr: {class: 'text-uppercase f-11'}}, {tag: 'td', attr: {class: 'w-3'}, content: ':'}, {tag: 'td', childs: [{tag: 'span', attr: {class: 'cus-version'}, content: customer.browser.version}]}]
                                            }
                                        ]
                                    },
                                    {tag: 'hr', attr: {class: 'm-0 p-0'}},
                                    {tag: 'h5', attr: {class: 'pane-title'}, content: 'GHI CHÚ'},
                                    {
                                        tag: 'div', attr: {class: 'note-container p-relative', style: 'height:39%'},
                                        childs: [{tag: 'div', attr: {class: 'content p-5 f-13', style: 'height:82%;overflow-y:auto;color: #777777;'}}, {tag: 'input', attr: {class: 'form-control note-txt', placeholder: 'Viết ghi chú', type: 'text'}}]
                                    }
                                ]
                            },
                            {
                                tag: 'div', attr: {class: 'col-sm-4 right-side h-p-100 p-0 chat-panel', style: 'border-right:solid 1px rgba(220, 220, 220, 0.36)'},
                                childs: [
                                    {tag: 'h5', attr: {class: 'pane-title chat-title', role: 'button', 'data-id': tid, 'data-status': 'off'}, content: 'CHAT'},
                                    {tag: 'div', attr: {class: 'chat-msg-container m-b-5 m-r-0 p-r-5 p-relative c-overflow', style: 'width: 99.4%; height: 80%; overflow: scroll'}, childs: [{tag: 'div', attr: {class: 'drag-container', id: 'drag-container'}}]},
                                    {tag: 'hr', attr: {class: 'm-0 p-0'}},
                                    {
                                        tag: 'div', attr: {class: 'chat-task-container input-group'},
                                        childs: [
                                            {tag: 'input', attr: {type: 'text', class: 'form-control msg-txt p-5 h-25 typeahead', autocomplete: "off", spellcheck: "false", rows: 1, style: 'resize:none', placeholder: 'Gõ và nhấn Enter để chat'}},
                                            {tag: 'span', attr: {class: 'input-group-addon'}, childs: [{tag: 'i', attr: {class: 'zmdi zmdi-attachment-alt p-5 p-l-15 f-22', role: 'button', href: 'javascript:void(0)'}}]},
                                            {tag: 'form', attr: {id: 'upload-file', role: 'form', class: 'form-horizontal', enctype: 'multipart/form-data', method: 'post'}, childs: [
                                                {tag: 'input', attr: {type: 'file', class: 'hidden', id: "fupload", name: "upload", 'data-prompt-position': "inline", 'data-prompt-target': "file-upload"}}
                                            ]}
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'div', attr: {class: 'col-sm-4 content-ticket right-side h-p-100 p-0 ticket-panel', 'data-id': tid}, childs: [
                                {tag: 'h5', attr: {class: 'pane-title ticket-title', role: 'button', 'data-id': tid, 'data-status': 'off'}, content: 'TICKET'}
                            ]
                            },
                            {tag: 'div', attr: {class: 'layer-ticket-chat'}, childs: [
                                {tag: 'a', attr: {role: 'button', class: 'btn-remove btn-flat-bg btn-switch hidden', 'data-id': tid, 'data-status': 'on'}, childs: [
                                    {tag: 'i', attr: {class: 'zmdi zmdi zmdi-arrow-forward'}}
                                ]}
                            ]}
                        ]
                        }
                    ]
                }]));
                var _wb = $(_.Tags([{
                    tag: 'li', attr: {'i-u': true, 'i-c': false, class: 'p-relative', 'data-id': tid},
                    childs: [{tag: 'i', attr: {class: 'icon-tab i-online-new'}}, {tag: 'span', content: info}, {tag: 'i', attr: {class: 'zmdi zmdi-close f-22 p-relative t-3 m-r-10'}}]
                }]));
                _w.appendTo(self.container);
                _wb.appendTo(self.barcontainer);
                _w.draggable({snap: false, handle: '.ui-widget-header', iframeFix: true, containment: "parent", refreshPositions: false}).find('.ui-widget-header').bind('mousedown', function () {
                    self.topIndex++;
                    $(this).closest('.chat-dialog').css('z-index', self.topIndex);
                });

                QueryDatabase('chat-client?queryCustomer=1&clientId=' + customer['clientId'], {}, 'GET', function(resp){
                    //Nếu có rồi thì load ra và sử dụng thông tin đó luôn
                    var fields_info = {};
                    if (resp.code == 200 && !_.isNull(resp.customer)){
                        var fields_info = _.pick(resp.customer, function(v, k, o){
                            return k.indexOf('field_') >= 0;
                        });
                    }
                    async.each(_.keys(fields_info), function(field, cb){
                        customer[field] = fields_info[field].length > 0 ? fields_info[field][0].value : '';
                        cb();
                    }, function(err, resp){
                        _w.find('.cus-phone').text(customer.field_so_dien_thoai);
                        _w.find('.cus-mail').text(customer.field_mail);
                    });
                });
                //query note
                $.get('/chat-client?queryType=2&clientId=' + tid, function(resp){
                    var $content = _w.find('.note-container .content');
                    for (var i = 0; i < resp.length; ++i){
                        $content.append(_.Tags([{tag: 'div', childs: [{tag: 'strong', content: resp[i].agentId.displayName + ' : '}, {tag: 'span', content: _.stripTags(resp[i].content)}]}]));
                        $content.scrollTop($content[0].scrollHeight);
                    }
                });
                //query history chat
                $.get('/chat-client?queryType=0&searchType=1&clientId=' + tid, function(resp){
                    var $content = _w.find('.chat-msg-container');
                    if (resp.code == 200){
                        resp.data = resp.data.reverse();
                        for (var i = 0; i < resp.data.length; ++i){
                            var threads = resp.data[i];
                            for (var j = 0; j < threads.chatlogs.length; ++j){
                                var msgObj = threads.chatlogs[j];
                                var $time = _.Tags([{tag: 'div', attr: {class: 'msg-time'}, content: moment(msgObj.created).format('HH:mm:ss A')}]);
                                var customClass = 'chat-message';
                                if (msgObj['sentFrom'].from == 0){
                                    //agent chat
                                    customClass = 'chat-message chat-message-self';
                                }
                                else if (msgObj['sentFrom'].from == 2){
                                    //system
                                    $time = _.Tags([{tag: 'div', attr: {class: 'msg-time'}, childs: [{tag: 'i', content: moment(msgObj.created).format('HH:mm:ss A')}]}]);
                                    customClass = 'm-b-15';
                                }

                                if (msgObj.status == 0 && msgObj['sentFrom'].from == 1){
                                    customClass += ' c-orange';
                                }
                                if (msgObj.attachment && msgObj.attachment.length > 0){
                                    var _ext = ['jpg', 'png', 'bmp'];
                                    var ext = msgObj.attachment[0]['fileName'].split('.')[1];
                                    if ( _.filter(_ext, function(obj){
                                            return ext.indexOf(obj) >= 0;
                                        }).length > 0){
                                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass},
                                            childs: [
                                                {tag: 'div', attr: {class: 'chat-message-bubble'},
                                                    childs: [
                                                        {tag: 'div', attr: {class: 'msg-time'}, content: moment(msgObj.updated).format('HH:mm:ss A')},
                                                        {tag: 'div', attr: {class: 'msg-preview'},
                                                            childs: [
                                                                {tag: 'img', attr: {src: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + msgObj.attachment[0]['url'], alt: msgObj.attachment[0]['fileName']}}
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]}
                                        ]));
                                    }
                                    else{
                                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass},
                                            childs: [
                                                {tag: 'div', attr: {class: 'chat-message-bubble'},
                                                    childs: [
                                                        {tag: 'div', attr: {class: 'msg-time'}, content: moment().format('HH:mm:ss A')},
                                                        {tag: 'div', attr: {class: 'msg-preview'},
                                                            childs: [
                                                                {tag: 'i', attr: {class: 'zmdi zmdi-file'}},
                                                                {tag: 'a', attr: {class: 'm-l-10', href: window.location.protocol + '//' + window.location.hostname + ':' + _configServer['services'].chat + msgObj.attachment[0]['url'], target: '_blank'}, content: msgObj.attachment[0]['fileName']}
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]}
                                        ]));
                                    }
                                }
                                else{
                                    if (msgObj.sentFrom.from == 2){
                                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble'}, childs: [{tag: 'i', attr: {class: 'f-12'}, content: $time + msgObj.content}]}]}]));
                                    }
                                    else{
                                        $content.append(_.Tags([{tag: 'div', attr: {class: customClass}, childs: [{tag: 'div', attr: {class: 'chat-message-bubble'}, content: $time + msgObj.content}]}]));
                                    }
                                    $content.scrollTop($content[0].scrollHeight);
                                }
                                $content.scrollTop($content[0].scrollHeight);
                            }
                        }
                    }
                });

                var availableTags = [];
                $.get('/chat-client?queryType=5&status=1&channelId=' + customer['channel'], function(resp){
                    _.each(resp.templates, function(t){
                        availableTags.push(t.raw);
                    });
                    $(_w.find('input.typeahead')).autocomplete({
                        source: availableTags
                    });
                });

                //Load form ticket
                var ticketId = self._customers[tid].customer.ticketId;
                var ticketParam = (ticketId != null && ticketId != undefined) ? ('&ticketId=' + ticketId) : '';
                if (_.has(self._customers[tid].customer, 'idCustomer') && self._customers[tid].customer.idCustomer != null){
                    ticketParam = ticketParam  + '&CustomerId=' + self._customers[tid].customer.idCustomer;
                }
                else{
                    if (_.has(self._customers[tid].customer, 'field_so_dien_thoai') && self._customers[tid].customer.field_so_dien_thoai.length){
                        ticketParam = ticketParam + '&field_so_dien_thoai=' + self._customers[tid].customer.field_so_dien_thoai;
                    }
                    if (_.has(self._customers[tid].customer, 'field_mail') && self._customers[tid].customer.field_mail.length){
                        ticketParam = ticketParam + '&field_e_mail=' + self._customers[tid].customer.field_mail;
                    }
                }

                $(_this(".content-ticket[data-id='" + tid + "']")).append('<iframe width="100%" height="100%" border="none" src="/ticket?type=chat&service=' + tid.split('-')[2] + '&threadId='+ self._customers[tid].customer.threadId +'&dialogId=' + tid + ticketParam +'"></iframe>');

            }
        },

        /**
         * Thêm dòng trạng thái online/ offline khách hàng trên màn hình chat của agent
         * @param tid - id client khách hàng
         * @param status - trạng thái on/ off
         * @returns {ChatContainer}
         */
        customerStatus: function (tid, status) {
            var self = this;
            var _w = $('.chat-dialog[data-id="' + tid + '"]');
            if (_w[0] && !_.isEqual(_w.attr('data-status'), status.toLowerCase())) {
                var $content = _w.find('.chat-msg-container');
                $content.append(_.Tags([{tag: 'div', attr: {class: 'chat-status ' + status.toLowerCase()}, content: 'Khách hàng đã ' + status + ' (' + moment().format('HH:mm:ss A') + ')'}]));
                $content.scrollTop($content[0].scrollHeight);
                $('#chat-bars-container li[data-id="' + tid + '"] .icon-tab').attr('class', 'icon-tab i-' + status.toLowerCase());
                _w.attr('data-status', status.toLowerCase());
            }
            return self;
        },

        /**
         * Update số lượng tin nhắn mới trên 3 tab: active, idle, chat request
         * @param tab - tab active, idle, chat request
         * @param type - active, idle, cquest
         * @param val - số lượng
         */
        updateBadge: function (tab, type, val) {
            var _badge = {};
            switch (type) {
                case 'active':
                    _badge = $('#' + tab + ' a[data-id="#chat-tbl-active-visitor-container"] > .badge');
                    _badge.text(Number(_badge.val()) + val);
                    (Number(_badge.val()) + val) > 0 ? _badge.show() : _badge.hide();
                    break;
                case 'idle':
                    _badge = $('#' + tab + ' a[data-id="#chat-tbl-idle-visitor-container"] > .badge');
                    _badge.text(Number(_badge.val()) + val);
                    (Number(_badge.val()) + val) > 0 ? _badge.show() : _badge.hide();
                    break;
                case 'cquest':
                    _badge = $('#' + tab + ' a[data-id="#chat-tbl-request-visitor-container"] > .badge');
                    _badge.text(Number(_badge.val()) + val);
                    (Number(_badge.val()) + val) > 0 ? _badge.show() : _badge.hide();
                    break;
            }
            _badge.attr('value', Number(_badge.val()) + val);
        },

        /**
         * Update các bảng active, idle, request ở các tab
         * @param tab - tab active, idle, chat request
         * @param type - active, idle, cquest
         * @param val - số lượng
         * @param id - id khách hàng
         */
        updateTable: function(tab, type, val, id){
            var _table = {};
            var _customers = this._customers;
            switch (type) {
                case 'active':
                    _table = $(_this('#' + tab + ' #chat-tbl-active-visitor'));
                    break;
                case 'idle':
                    _table = $(_this('#' + tab + ' #chat-tbl-idle-visitor'));
                    break;
                case 'cquest':
                    _table = $(_this('#' + tab + ' #chat-tbl-request-visitor'));
                    break;
            }
            var customer = _customers[id].customer;
            if (val == 1){
                var info = customer.name ? customer.name : '';
                if (!info) info = customer.phone ? customer.phone : '';
                if (!info) info = customer.mail ? customer.mail : customer.region + ' #' + customer.cookie;
                var customerId = customer.ip + '-' + customer.channel + '-' + customer.service + '-' + customer.cookie;
                if (tab == 'visitor-panel'){
                    _table.bootstrapTable('insertRow', {
                        index: 0,
                        row: {
                            id: id,
                            customer: info,
                            location: _.Tags([{ tag: 'i', attr: { title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode } }]) + customer.region,
                            online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60)) + " phút" : 'Vừa online',
                            viewing: _.Tags([{ tag: 'a', attr: { href: customer.url, target: '_blank' }, content: customer.title }])
                        }
                    }).bootstrapTable('refresh');
                }
                else{
                    _table.bootstrapTable('insertRow', {
                        index: 0,
                        row: {
                            id: id,
                            customer: info,
                            location: _.Tags([{ tag: 'i', attr: { title: customer.ip, class: 'm-b--1 flag-all flag-' + customer.countryCode } }]) + customer.region,
                            online: (parseInt(_customers[customerId].timer / 60) > 0) ? (parseInt(_customers[customerId].timer / 60)) + " phút" : 'Vừa online',
                            viewing: _.Tags([{ tag: 'a', attr: { href: customer.url, target: '_blank' }, content: customer.title }]),
                            agent: customer.agent
                        }
                    }).bootstrapTable('refresh');
                }
            }
            else{
                _table.bootstrapTable('removeByUniqueId', id).bootstrapTable('refresh');
            }
        },

        /**
         * Đóng cửa sổ chat với khách hàng
         * @param tid - id client khách hàng
         * @returns {*|ChatContainer}
         */
        close: function (tid) {
            var self = this;
            $('#v-' + tid).fadeOut(function () {
                $('#v-' + tid).remove();
            });
            return self.updateCounter();
        },

        /**
         * Cập nhật danh sách cuộc chat
         * @param newThread
         */
        updateThread: function(newThread){
            this._threadChats = newThread;
        },

        /**
         * Câp nhật dữ liệu khách hàng
         * @param customerId - id khách hàng
         * @param value - dữ liệu
         * @param cb
         */
        updateCustomer: function(customerId, value, cb){
            this._customers[customerId] = value;
            cb();
        },

        /**
         * listen dữ liệu customer sau khi save ticket
         * @param data - dữ liệu
         */
        updatedCustomer: function(data){
            var self = this;
            $.ajax({
                url: '/chat-client/' + self._customers[data.dialog].customer.threadId,
                data: {typeUpdate: 3, customerId: data.customer._id, clientId: data.dialog},
                type: 'PUT',
                dataType: "json",
                success: function (resp) {}});
            //Cập nhật dữ liệu khách hàng trên view
            self._customers[data.dialog].customer.idCustomer = data.customer._id; //Lưu lại customer id
            self._customers[data.dialog].customer.ticketId = window.getTicketId('chat', data.dialog);
            self._socket.emit('customer-edit', {clientId: data.dialog, customerId: data.customer._id, ticketId: self._customers[data.dialog].customer.ticketId});
            var fields_info = _.pick(data.customer, function(v, k, o){
                return k.indexOf('field_') >= 0;
            });
            async.each(_.keys(fields_info), function(field, cb){
                self._customers[data.dialog].customer[field] = (fields_info[field] != null && fields_info[field].length) > 0 ? fields_info[field] : '';
                cb();
            }, function(err, resp){
                $(_this('.cus-phone[clientid="' + data.dialog + '"]')).text(self._customers[data.dialog].customer.field_so_dien_thoai);
                $(_this('.cus-mail[clientid="' + data.dialog + '"]')).text(self._customers[data.dialog].customer.field_mail);
            });
        }
    });

    // -------------------------- Helper method ------------------------------------
    /**
     * Convert từ obj sang string param
     * @param obj
     * @returns {string}
     * @constructor
     */
    var ObjectToQueryParams = function(obj){
        var queryParams = '';
        for (var i = 0; i < _.keys(obj).length; ++i){
            if (obj[_.keys(obj)[i]].length > 0 || parseInt(obj[_.keys(obj)[i]]) > 0){
                queryParams += _.keys(obj)[i] + '=' + obj[_.keys(obj)[i]] + '&';
            }
        }
        return queryParams;
    };

    /**
     * helper send ajax request
     * @param url
     * @param data - dữ liệu
     * @param method - phương thức
     * @param callback
     * @constructor
     */
    var QueryDatabase = function(url, data, method, callback){
        $.ajax({
            url: url,
            data: data,
            type: method,
            dataType: "json",
            success: callback
        });
    };

    /**
     * Đếm ngược
     * @param duration - thời gian count down
     * @param granularity - delta time
     * @constructor
     */
    function CountDownTimer(duration, granularity) {
        this.duration = duration;
        this.granularity = granularity || 1000;
        this.tickFtns = [];
        this.running = false;
    }

    /**
     * Bắt đầu
     */
    CountDownTimer.prototype.start = function() {
        if (this.running) {
            return;
        }
        this.running = true;
        var start = Date.now(),
            that = this,
            diff, obj;

        (function timer() {
            diff = that.duration - (((Date.now() - start) / 1000) | 0);

            if (diff > 0) {
                setTimeout(timer, that.granularity);
            } else {
                diff = 0;
                that.running = false;
            }

            obj = CountDownTimer.parse(diff);
            that.tickFtns.forEach(function(ftn) {
                ftn.call(this, obj.minutes, obj.seconds);
            }, that);
        }());
    };

    /**
     * Gọi khi qua mỗi delta time
     */
    CountDownTimer.prototype.onTick = function(ftn) {
        if (typeof ftn === 'function') {
            this.tickFtns.push(ftn);
        }
        return this;
    };

    /**
     * Check xem count down có đang chạy không
     * @returns {boolean} - true: đang chạy, false: kết thúc
     */
    CountDownTimer.prototype.expired = function() {
        return !this.running;
    };

    /**
     * parse số giây sang dạng {phút, giây}
     * @param seconds
     * @returns {{minutes: number, seconds: number}}
     */
    CountDownTimer.parse = function(seconds) {
        return {
            'minutes': (seconds / 60) | 0,
            'seconds': (seconds % 60) | 0
        };
    };

    // ==============================================================================

    $(document).ready(function () {
        ChatContainer.init();
    });
})(jQuery);