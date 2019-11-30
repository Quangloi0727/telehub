var DFT = function ($) {
    var groupData = null;
    var callData = null;
    var myTimer = null;
    var selectAgent = null;
    var selectGroup = null;

    var bindClick = function () {
        // Chọn cấu hình cho group/queue
        $(document).on('click', '#type-setting', function(){
            if(_.isEqual($(this).val().toString(), '1')){
                $('#group-setting').removeClass('hidden');
                $('#queue-setting').addClass('hidden');
            }else {
                $('#group-setting').addClass('hidden');
                $('#queue-setting').removeClass('hidden');
            }
        });

        // Click button setting
        $(document).on('click', '#setting-btn', function(){
            $('#frm-item').modal('show');
        });

        // Transer call
        $(document).on('click', '#transfer-btn', function(){
            var transAgent = $('#transfer-agent').val();
            if(!_.isEmpty(transAgent))
            _socket.emit('GroupCallControl', {
                _id: selectAgent,
                transAgent: transAgent,
                type: '3',
                option: $('#transfer-type').val(),
                agentID: user
            });
        });

        // Thao tác với agent trên queue
        $(document).on('change', '#queue-agent-control', function(){
            _socket.emit('QueueAgentStatus', {
                agent: $(this).parent().parent().attr('data-agent-id'),
                queue: $(this).parent().parent().parent().parent().attr('id').split('queue-agent-tbl-')[1],
                status: Number($(this).val()),
                user: user
            });
            //$(this).val('0');
            //$('.selectpicker').selectpicker('refresh');
        });

        // Thay đổi trạng thái của agent
        $(document).on('click', '#change-agent-status-btn', function(){
            var newStatus = $('#agent-status-list').val();
            _socket.emit('ChangeAgentStatus', {
                changeBy: user,
                user: selectAgent,
                status: newStatus,
                sid: _socket.socket.sessionid
            });
        });

        // Thao tác với cuộc gọi trên queue
        $(document).on('change', '#queue-call-control', function(){
            if(_.isEqual($(this).val(), '3')){
                var selectService = $(this).parent().parent().parent().parent().attr('id').split('tbl-')[1];
                _socket.emit('GetQueueAgents', $(this).attr('data-call-id'), user, selectService);
            }else {
                _socket.emit('QueueCallControl', {_id: $(this).attr('data-call-id'), type: $(this).val(), agentID: user, channelID: $(this).attr('data-channel-id')});
            }
            $(this).val('0').selectpicker('refresh');
        });

        // Thao tác với cuộc gọi của nhóm
        $(document).on('change', '#group-call-control', function(){
            if(_.isEqual($(this).val(), '3')){
                selectAgent = $(this).parent().parent().attr('data-agent-id');
                selectGroup = $(this).parent().parent().parent().parent().attr('id').split('tbl-')[1];
                _socket.emit('GetGroupAgents', selectGroup);
            }else if(_.isEqual($(this).val(), '7')){
                selectAgent = $(this).parent().parent().attr('data-agent-id');
                $('#change-agent-status').modal('show');
            }else {
                _socket.emit('GroupCallControl', {_id: $(this).parent().parent().attr('data-agent-id'), type: $(this).val(), agentID: user});
            }
            $(this).val('0').selectpicker('refresh');
        });

    };

    var bindSubmit = function () {
        // Xác nhận cập nhật cấu hình monitor
        $('#frm-item form').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData('monitor/' + user, 'PUT', form.getData(), function (resp) {
                        _.isEqual(resp.code, 200) ? _.LoadPage(window.location.hash) : swal({title: 'Thông báo !', text: resp.message});
                    });
                }
            }
        });
    };

    var bindPressKey = function(){

    };

    var resetControlButton = function(){

    };

    // Hiển thị dữ liệu service lên giao diện
    var serviceContentTag = function(sendData, serviceData){
        var thead = {tag:'thead', childs: [
            {tag:'tr', attr: {class: 'f-12'}, childs: [
                {tag:'th', attr: {class: 'bgm-orange c-white text-center w-200'}, content: 'Agent'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Call Type'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Call Status'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Caller'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Called'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Duration Call'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Time Call'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Tác vụ'},
            ]}
        ]};
        var trs = [];
        _.each(sendData, function(ag){
            trs.push(callTag(ag));
        });

        var tbody = {tag:'tbody', childs: trs};
        var table = {tag:'table', attr: {class: 'table table-bordered table-fix', id: 'tbl-'+serviceData._id}, childs: [thead, tbody]};
        var infoDiv = {tag:'div', attr: {class: 'p-r-10 p-t-10 p-b-10 text-right'}, childs: [
            {tag:'input', attr: {value: 'Gọi: 0', disabled: '', class: 'text-center callRate0', style: 'margin-right: 5px; width: 90px'}},
            {tag:'input', attr: {value: 'Nghe: 0', disabled: '', class: 'text-center callRate1', style: 'margin-right: 5px; width: 90px'}},
            {tag:'input', attr: {value: 'Rớt: 0', disabled: '', class: 'text-center callRate2', style: 'margin-right: 5px; width: 90px'}},
            {tag:'input', attr: {value: 'Đàm thoại: 0', disabled: '', class: 'text-center callDuration', style: 'margin-right: 5px;'}},
            {tag:'input', attr: {value: ' Tỉ lệ rớt: 0%', disabled: '', class: 'text-center callDropRate', style: 'margin-right: 5px;'}},
            {tag:'input', attr: {value: ' Tổng g nhỡ: 0', disabled: '', class: 'text-center missCall', style: 'margin-right: 5px;'}},
            {tag:'input', attr: {value: ' KH Đợi: 0', disabled: '', class: 'text-center waitingCustomer', style: 'margin-right: 5px;'}},
            {tag:'input', attr: {value: ' Agents: 0', disabled: '', class: 'text-center totalAgent'}},
        ]};

        var blankLabel = {tag:'label', attr: {class: 'blank'}};
        var thead2 = {tag:'thead', childs: [
            {tag:'tr', attr: {class: 'f-12'}, childs: [
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Agent'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Extension'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Status'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Tác vụ'}
            ]}
        ]};

        var tbody2 = {tag:'tbody', childs: []};
        var table2 = {tag:'table', attr: {class: 'table table-bordered table-fix', id: 'queue-agent-tbl-'+serviceData._id}, childs: [thead2, tbody2]};

        var div = {
            tag:'div',
            attr: {
                role: 'tabpanel',
                style:"height: 100%",
                class: ($('#tab-list-service').children('li').html() ? 'tab-pane animated' : 'tab-pane animated active'),
                id: 'tab-'+serviceData._id},
            childs: [infoDiv,table2,blankLabel,table]
        };

        return _.Tags([div]);
    }

    // Hiển thị dữ liệu của nhóm lên giao diện
    var groupContentTag = function(group ,groupAgents){
        var thead = {tag:'thead', childs: [
            {tag:'tr', attr: {class: 'f-12'}, childs: [
                {tag:'th', attr: {class: 'bgm-orange c-white text-center w-200'}, content: 'Agent'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Extension'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Call Type'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Status'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Call Status'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Caller'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Called'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Duration Call'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Time Call'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Status Duration'},
                {tag:'th', attr: {class: 'bgm-orange c-white text-center'}, content: 'Tác vụ'},
            ]}
        ]};
        var trs = [];
        _.each(groupAgents, function(ag){
            trs.push(agentTag(ag));
        });
        var tbody = {tag:'tbody', childs: trs};
        var table = {tag:'table', attr: {class: 'table table-bordered table-fix', id: 'tbl-'+group._id}, childs: [thead, tbody]};
        var noAcdDiv = {tag:'div', attr: {class: 'p-r-10 p-t-10 p-b-10 text-right'}, childs: [
            {tag:'input', attr: {value: 'Gọi: 0', disabled: '', class: 'text-center callRate0', style: 'margin-right: 5px; width: 90px'}},
            {tag:'input', attr: {value: 'Nghe: 0', disabled: '', class: 'text-center callRate1', style: 'margin-right: 5px; width: 90px'}},
            {tag:'input', attr: {value: 'Rớt: 0', disabled: '', class: 'text-center callRate2', style: 'margin-right: 5px; width: 90px'}},
            {tag:'input', attr: {value: 'Đàm thoại: 0', disabled: '', class: 'text-center callDuration', style: 'margin-right: 5px;'}},
            {tag:'input', attr: {value: 'Sẵn sàng: 0', disabled: '', class: 'text-center availableTime', style: 'margin-right: 5px;'}},
            {tag:'input', attr: {value: 'Nghỉ: 0', disabled: '', class: 'text-center breakTime', style: 'margin-right: 5px;'}},
            {tag:'input', attr: {value: 'Tạm nghỉ: 0', disabled: '', class: 'text-center agentNoAcd'}}
        ]};

        var div = {
            tag:'div',
            attr: {
                role: 'tabpanel',
                style:"height: 100%",
                class: ($('#tab-list-group').children('li').html() ? 'tab-pane animated' : 'tab-pane animated active'),
                id: 'tab-'+group._id
            },
            childs: [noAcdDiv,table]};

        return _.Tags([div]);
    }

    // Tạo tab group mới trên giao diện
    var groupTabTag = function(group, tablist){
        return _.Tags(
            [{tag: 'li', attr: {class: $(tablist).children('li').html() ? '' : 'active',role :"presentation", id: 'tab-header-'+group._id}, childs: [
                {tag:'a', attr: {class: 'col-sm-6 p-5 f-10', href :"#tab-"+group._id, 'aria-controls':"", role:"tab", 'data-toggle': "tab", 'aria-expanded': "false"}, content: group.name}
            ]}]
        );
    }

    // Cập nhật dữ liệu agent lên giao diện
    var agentTag = function(agent){
        var tds = [];
        tds.push({tag:'td', attr: {class: 'text-center name'}, content: agent.displayName + ' - ' + agent.name});
        tds.push({tag:'td', attr: {class: 'text-center extension'}, content: agent.extension});
        tds.push({tag:'td', attr: {class: 'text-center callType'}, content: agent.callStatus != 5 ? agent.callType : ""});
        var curStatus = getStatus(agent.status);
        tds.push({tag:'td', attr: {class: 'status'}, content: curStatus ? curStatus.name : 'UNKNOW'});
        tds.push({tag:'td', attr: {class: 'text-center callStatus'}, content: getCallStatus(agent.callStatus)});
        tds.push({tag:'td', attr: {class: 'text-center caller'}, content: agent.caller});
        tds.push({tag:'td', attr: {class: 'text-center called'}, content: agent.called});
        tds.push({tag:'td', attr: {class: 'text-center duration-call'}, content: '00:00:00'});
        tds.push({tag:'td', attr: {class: 'text-center callTime'}, content: agent.callTime});
        tds.push({tag:'td', attr: {class: 'text-center duration-status'}, content: '00:00:00'});
        tds.push({tag:'td', attr: {class: 'text-center'}, childs: [
            {tag: 'select', attr: {class: 'selectpicker', id: 'group-call-control'}, childs: [
                {tag:'option', attr: {value: '0'}, content: 'Chọn'},
                {tag:'option', attr: {value: '1'}, content: 'Disconnect'},
                {tag:'option', attr: {value: '2'}, content: 'Pickup'},
                {tag:'option', attr: {value: '3'}, content: 'Transfer'},
                {tag:'option', attr: {value: '4'}, content: 'Listen'},
                {tag:'option', attr: {value: '5'}, content: 'Whisper'},
                {tag:'option', attr: {value: '6'}, content: 'Join'},
                {tag:'option', attr: {value: '7'}, content: 'Change Status'}
            ]}
        ]});

        return {tag: 'tr', attr: {class: 'f-12 agent-tag', 'data-agent-id': agent._id.toString()}, childs: tds};
    }

    // Cập nhật dữ liệu call lên giao diện
    var callTag = function(agent){
        var tds = [];
        tds.push({tag:'td', attr: {class: 'text-center name'}, content: agent.name });
        //tds.push({tag:'td', attr: {class: 'text-center extension'}, content: agent.extension});
        tds.push({tag:'td', attr: {class: 'text-center callType'}, content: agent.callType});
        tds.push({tag:'td', attr: {class: 'text-center callStatus'}, content: agent.callStatus});
        tds.push({tag:'td', attr: {class: 'text-center caller'}, content: agent.caller});
        tds.push({tag:'td', attr: {class: 'text-center called'}, content: agent.called});
        tds.push({tag:'td', attr: {class: 'text-center duration-call'}, content: '00:00:00'});
        tds.push({tag:'td', attr: {class: 'text-center callTime'}, content: agent.callTime});
        tds.push({tag:'td', attr: {class: 'text-center'}, childs: [
            {tag: 'select',
                attr: {
                    class: 'selectpicker',
                    id: 'queue-call-control',
                    'data-call-id': agent._id.toString(),
                    'data-channel-id': agent.channelID.toString()
                },
                childs: [
                    {tag:'option', attr: {value: '0'}, content: 'Chọn'},
                    {tag:'option', attr: {value: '1'}, content: 'Disconnect'},
                    {tag:'option', attr: {value: '2'}, content: 'Pickup'},
                    {tag:'option', attr: {value: '3'}, content: 'Assign'}
                ]
            }
        ]});

        return {tag: 'tr', attr: {class: 'f-12 call-tag', 'data-agent-id': agent._id.toString()}, childs: tds};
    }

    // Định kỳ cập nhật dữ liệu call của agent trên giao diện
    var timer = function(){
        _.each(groupData, function(agentData, i){
            agentData.callDuration += 1000;
            agentData.statusDuration += 1000;

            $('.agent-tag').each(function() {
                var $this = this;
                if(_.isEqual(agentData._id.toString(), $($this).attr('data-agent-id'))){
                    $($this).children('.duration-call').html((agentData.callStatus == 4) ? msToTime(agentData.callDuration) : '00:00:00');
                    $($this).children('.duration-status').html(msToTime(agentData.statusDuration));
                }
            });
        });

        _.each(callData, function(call){
            call.callDuration += (call.callDuration ? 1000 : 0);

            $('.call-tag').each(function() {
                var $this = this;
                if(_.isEqual(call._id.toString(), $($this).attr('data-agent-id'))){
                    $($this).children('.duration-call').html(msToTime(call.callDuration));
                }
            });
        });
    }

    // Chuyển dữ liệu từ milliseconds sang 'hh:mm:ss'
    var msToTime = function(s) {
        if(s == 0) return '00:00:00';
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        return _.pad(hrs, 2, '0') + ':' + _.pad(mins, 2, '0') + ':' + _.pad(secs, 2, '0');
    }

    // Lấy tên trạng thái làm việc
    var getStatus = function(sts){
        if(sts == 4) {
            return {name: 'Not Answering'};
        }else {
            return _.find(statusData, function(stsData){
                return stsData.statusCode == sts;
            });
        }
    }

    // Lấy tên trạng thái call
    var getCallStatus = function(status){
        switch (status) {
            case -1:
                return 'CALLING';
                break;
            case 0:
                return 'UNKOWN';
                break;
            case 1:
                return 'PROCESSING';
                break;
            case 2:
                return 'CALLING';
                break;
            case 3:
                return 'RINGING';
                break;
            case 4:
                return 'CONNECTED';
                break;
            case 5:
                return 'DISCONNECTED';
                break;
            case 6:
                return 'HOLD';
                break;
            case 7:
                return 'RESUME';
                break;
            case 8:
                return 'TRANSFER';
                break;
            case 9:
                return 'COUNT';
                break;
        };
    }

    // Cập nhật dữ liệu nhóm agent khi có sự thay đổi
    var updateGroupData = function(sendData){
        $('.agent-tag').each(function() {
            var $this = this;
            if(_.isEqual(sendData._id.toString(), $($this).attr('data-agent-id'))){
                var curStatus = getStatus(sendData.status);
                $($this).children('.callType').html(sendData.callStatus != 5 ? sendData.callType : "");
                $($this).children('.status').html(curStatus ? curStatus.name : 'UNKNOW');
                $($this).children('.callStatus').html(getCallStatus(sendData.callStatus));
                $($this).children('.caller').html(sendData.caller);
                $($this).children('.called').html(sendData.called);
                $($this).children('.duration-call').html((sendData.callStatus == 4) ? msToTime(sendData.callDuration) : '00:00:00');
                $($this).children('.callTime').html(sendData.callTime);
                $($this).children('.duration-status').html(msToTime(sendData.statusDuration));
            }
        });
    }

    // Thêm nhóm agent
    var addGroupData = function(addData){
        _.each(addData.groups, function(groupId){
            $('#tbl-'+groupId+' tbody').append(_.Tags([agentTag(addData)]));
        });
        $('.selectpicker').selectpicker('refresh');
    }

    // Cập nhật dữ liệu call trên queue
    var updateCallData = function(sendData){
        $('.call-tag').each(function() {
            var $this = this;
            if(_.isEqual(sendData._id.toString(), $($this).attr('data-agent-id'))){
                $($this).children('.callType').html(sendData.callType);
                $($this).children('.name').html(sendData.name);
                $($this).children('.extension').html(sendData.extension);
                $($this).children('.callStatus').html(sendData.callStatus);
                $($this).children('.caller').html(sendData.caller);
                $($this).children('.called').html(sendData.called);
                $($this).children('.duration-call').html(msToTime(sendData.callDuration));
                $($this).children('.callTime').html(sendData.callTime);
                $($this).children('td').children('select').attr('data-channel-id', sendData.channelID);
            }
        });
    }

    // Add call trên queue
    var addCallData = function(addData){
        $('#tbl-'+addData.service+' tbody').append(_.Tags([callTag(addData)]));
        $('.selectpicker').selectpicker('refresh');
    }

    // Thêm danh sách agent có thể transfer
    var addTransferAgents = function(agents){
        $('#transfer-agent option').each(function(i,e){
            if(!_.isEqual($(e).val(),""))e.remove();
        });
        _.each(agents, function(agent){
            if(!_.isEqual(agent._id.toString(), selectAgent))
                $('#transfer-agent').append('<option value="'+ agent._id.toString() +'">'+ agent.displayName + '-' + agent.name +'</option>');
        });
        $('#transfer-agent').selectpicker('refresh');
    };

    // Cập nhật agent lên giao diện queue
    var queueAgentTag = function(agent){
        var tds = [];
        tds.push({tag:'td', attr: {class: 'text-center name'}, content: agent.name + ' - ' + agent.displayName });
        tds.push({tag:'td', attr: {class: 'text-center extension'}, content: agent.extension});
        tds.push({tag:'td', attr: {class: 'text-center queue-status'}, content: agent.active ? 'Enable' : 'Disable'});
        tds.push({tag:'td', attr: {class: 'text-center'}, childs: [
            {tag: 'select',
                attr: {
                    class: 'selectpicker',
                    id: 'queue-agent-control',
                    'data-agent-id': agent._id.toString()
                },
                childs: [
                    {tag:'option', attr: {value: '0'}, content: 'Chọn'},
                    {tag:'option', attr: {value: '1'}, content: 'Enable'},
                    {tag:'option', attr: {value: '2'}, content: 'Disable'}
                ]
            }
        ]});
        return tds;
    }

    // Cập nhật danh sách agent trên queue
    var bindAgentList = function(serviceId, agentList){
        _.each(agentList, function(agentData){
            var isNew = 1;
            $('#queue-agent-tbl-'+serviceId+' tbody tr').each(function() {
                if(_.isEqual($(this).attr('data-agent-id'), agentData._id.toString())) {
                    isNew = 0;
                    $(this).children('.name').html(agentData.name + ' - ' + agentData.displayName);
                    $(this).children('.extension').html(agentData.extension);
                    $(this).children('.queue-status').html(agentData.active ? 'Enable' : 'Disable');
                }
            });
            if(isNew){
                $('#queue-agent-tbl-'+serviceId+' tbody').append('<tr class="f-12" data-agent-id="'+ agentData._id.toString() +'">' + _.Tags(queueAgentTag(agentData)) + '</tr>');
                $('.selectpicker').selectpicker('refresh');
            }
        });

        $('#queue-agent-tbl-'+serviceId+' tbody tr').each(function() {
            if(_.pluck(agentList,'_id').indexOf($(this).attr('data-agent-id')) < 0) {
                $(this).remove();
            }
        });
    };

    var bindSocket = function (client) {
        // Nhận cảnh báo service từ server
        client.on('ServiceWarning', function (sender, sendData) {
            var isWarning = false;
            async.forEachOf(sendData, function(warn, i, callback){
                switch (warn.field) {
                    case 'callRate':
                        $('#tab-'+ sender + ' div .callRate0').val('Gọi: '+ warn.data[0]);
                        $('#tab-'+ sender + ' div .callRate1').val('Nghe: '+ warn.data[1]);
                        $('#tab-'+ sender + ' div .callRate2').val('Rớt: '+ warn.data[2]);
                        break;
                    case 'callDuration':
                        $('#tab-'+ sender + ' div .callDuration').val('Đàm thoại: '+ msToTime(warn.data));
                        break;
                    case 'callDropRate':
                        $('#tab-'+ sender + ' div .callDropRate').val('Tỉ lệ rớt: ' + warn.data + '%');
                        break;
                    case 'waitingCustomer':
                        $('#tab-'+ sender + ' div .waitingCustomer').val('KH đợi: ' + warn.data);
                        break;
                    case 'missCall':
                        $('#tab-'+ sender + ' div .missCall').val('Tổng g nhỡ: ' + warn.data);
                        break;
                    case 'totalAgent':
                        $('#tab-'+ sender + ' div .totalAgent').val('Agents: ' + warn.data);
                        break;
                    case 'agentList':
                        bindAgentList(sender, warn.data);
                        break;
                }

                if(warn.isWarning){
                    $('#tab-'+ sender + ' div .'+warn.field).addClass('warning');
                    isWarning = true;
                }else {
                    $('#tab-'+ sender + ' div .'+warn.field).removeClass('warning');
                }
                callback();
            }, function (err){
                if(isWarning) {
                    $('#tab-header-'+ sender).addClass('warning');
                }else {
                    $('#tab-header-'+ sender).removeClass('warning');
                }
            });
        });

        // Cảnh báo của nhóm từ server
        client.on('GroupWarning', function (sender, sendData) {
            var isWarning = false;
            async.forEachOf(sendData, function(warn, i, callback){
                if(_.isEqual(warn.field, 'agentNoAcd')){
                    $('#tab-'+ sender + ' div .agentNoAcd').val('Tạm nghỉ: '+warn.data);
                    if(warn.isWarning){
                        $('#tab-'+ sender + ' div .agentNoAcd').addClass('warning');
                        isWarning = true;
                    }else {
                        $('#tab-'+ sender + ' div .agentNoAcd').removeClass('warning');
                    }
                }else if(_.isEqual(warn.field, 'availableTime')){
                    $('#tab-'+ sender + ' div .availableTime').val('Sẵn sàng: '+ msToTime(warn.data));
                }else if(_.isEqual(warn.field, 'breakTime')){
                    $('#tab-'+ sender + ' div .breakTime').val('Nghỉ: '+ msToTime(warn.data));
                }else if(_.isEqual(warn.field, 'callDuration')){
                    $('#tab-'+ sender + ' div .callDuration').val('Đàm thoại: '+ msToTime(warn.data));
                }else if(_.isEqual(warn.field, 'callRate')){
                    $('#tab-'+ sender + ' div .callRate0').val('Gọi: '+ warn.data[0]);
                    $('#tab-'+ sender + ' div .callRate1').val('Nghe: '+ warn.data[1]);
                    $('#tab-'+ sender + ' div .callRate2').val('Rớt: '+ warn.data[2]);
                }else {
                    $('#tbl-'+sender+' tbody .agent-tag').each(function() {
                        var $this = this;
                        if(_.isEqual(warn.data.toString(), $($this).attr('data-agent-id'))){
                            if(warn.field.length == 0){
                                $($this).removeAttr('bgcolor');
                                $($this).children().removeAttr('bgcolor');
                            }else {
                                isWarning = true;
                                $($this).attr('bgcolor', 'red');
                                _.each(warn.field, function(field){
                                    $($this).children('.'+field).attr('bgcolor', 'yellow');
                                });
                                $($this).prependTo($($this).parent());
                            }
                        }
                    });
                }
                callback();
            }, function (err){
                if(isWarning) {
                    $('#tab-header-'+ sender).addClass('warning');
                }else {
                    $('#tab-header-'+ sender).removeClass('warning');
                }
            });
        });

        // Loại service khỏi danh sách monitor
        client.on('RemoveService', function (serviceId) {
            $('#tab-header-' + serviceId).remove();
            $('#tab-'+serviceId).remove();
        });

        // Thêm mới service vào danh sách monitor
        client.on('AddService', function (sendData, serviceData) {
            if($('#tbl-'+serviceData._id).html()){
                $('#tab-header-' + serviceData._id + ' a').html(serviceData.name);
            }else {
                $('#tab-content-service').append(serviceContentTag(sendData, serviceData));
                $('.selectpicker').selectpicker('refresh');
                $('#tab-list-service').append(groupTabTag(serviceData, '#tab-list-service'));
            }
        });

        // Loại nhóm khỏi danh sách monitor
        client.on('RemoveGroup', function (groupId) {
            $('#tab-header-' + groupId).remove();
            $('#tab-'+groupId).remove();
        });

        // Cập nhật dữ liệu của nhóm lên giao diện
        client.on('AddGroup', function (sendData, groupInfo) {
            if($('#tbl-'+groupInfo._id).html()){
                $('#tab-header-' + groupInfo._id + ' a').html(groupInfo.name);
                $('#tbl-'+groupInfo._id+' tbody').empty();
                _.each(sendData, function(agent){
                    $('#tbl-'+groupInfo._id+' tbody').append(_.Tags([agentTag(agent)]));
                });
            }else {
                $('#tab-content-group').append(groupContentTag(groupInfo,sendData));
                $('.selectpicker').selectpicker('refresh');
                $('#tab-list-group').append(groupTabTag(groupInfo, '#tab-list-group'));
            }
            _.each(sendData, function(newData){
                var isUpdate = false;
                async.forEachOf(groupData, function(agent, i, callback){
                    if(_.isEqual(agent._id.toString(), newData._id.toString())){
                        groupData[i] = newData;
                        isUpdate = true;
                    };
                    callback();
                }, function (err){
                    if(!isUpdate) groupData.push(newData);
                });
            });
        });

        // Cập nhật dữ liệu của agent
        client.on('MonitorAgent', function (sendData) {
            var isUpdate = false;
            async.forEachOf(groupData, function(agent, i, callback){
                if(_.isEqual(agent._id.toString(), sendData._id.toString())){
                    groupData[i] = sendData;
                    isUpdate = true;
                };
                callback();
            }, function (err){
                if(isUpdate){
                    updateGroupData(sendData);
                }else {
                    groupData.push(sendData);
                    addGroupData(sendData);
                }
            });
        });

        // Cập nhật dữ liệu call
        client.on('MonitorCall', function (sendData) {
            var isUpdate = false;
            async.forEachOf(callData, function(agent, i, callback){
                if(_.isEqual(agent._id.toString(), sendData._id.toString())){
                    callData[i] = sendData;
                    isUpdate = true;
                };
                callback();
            }, function (err){
                if(isUpdate){
                    updateCallData(sendData);
                }else {
                    callData.push(sendData);
                    addCallData(sendData);
                }
            });
        });

        // Loại agent khỏi danh sách monitor
        client.on('RemoveAgent', function (sendData) {
            $('.agent-tag').each(function() {
                var $this = this;
                if(_.isEqual(sendData, $($this).attr('data-agent-id'))){
                    $($this).remove();
                }
            });
            _.each(groupData, function(agent, i){
                if(agent._id && _.isEqual(agent._id.toString(), sendData)){
                    groupData.splice(i, 1);
                }

                if(!agent._id){
                    groupData.splice(i, 1);
                }
            });
        });

        // Loại call khỏi danh sách monitor
        client.on('RemoveCall', function (sendData) {
            $('.call-tag').each(function() {
                var $this = this;
                if(_.isEqual(sendData, $($this).attr('data-agent-id'))){
                    $($this).remove();
                }
            });
            _.each(callData, function(agent, i){
                console.log(666, agent);
                if(agent._id && _.isEqual(agent._id.toString(), sendData)){
                    callData.splice(i, 1);
                }
            });
        });

        // Tryt vấn dữ liệu agent trong nhóm để transfer
        client.on('GetGroupAgents', function (selectAgent) {
            addTransferAgents(selectAgent);
            $('#transfer-info').modal('show');
        });

        // Truy vấn dữ liệu agent phục vụ queue để transfer
        client.on('GetQueueAgents', function (queueData, fromAgent) {
            selectAgent = fromAgent;
            addTransferAgents(queueData);
            $('#transfer-info').modal('show');
        });
    }

    return {
        init: function () {
            bindClick();
            bindSubmit();
            bindPressKey();
            bindSocket(_socket);

            groupData = monitorData;
            callData = serviceData;

            // Hiển thị dữ liệu monitor lên giao diện
            _.each(firstGroups, function(el, i){
                $('#tab-content-group').append(groupContentTag(el, []));
                $('#tab-list-group').append(groupTabTag(el,'#tab-list-group'));
            });

            _.each(groupData, function(el,i){
                addGroupData(el);
            });

            _.each(firstServices, function(el, i){
                $('#tab-content-service').append(serviceContentTag([], el));
                $('#tab-list-service').append(groupTabTag(el,'#tab-list-service'));
            });

            _.each(callData, function(el,i){
                addCallData(el);
            });

            $('.selectpicker').selectpicker('refresh');
            myTimer = setInterval(timer, 1000);
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            clearInterval(myTimer);
            $(document).off('click', '#type-setting');
            $(document).off('click', '#setting-btn');
            $(document).off('click', '#transfer-btn');
            $(document).off('click', '#change-agent-status-btn');
            $(document).off('change', '#queue-call-control');
            $(document).off('change', '#group-call-control');
            $(document).off('change', '#queue-agent-control');
        }
    };
}(jQuery);