var DFT = function ($) {
    // Tạo thẻ option cho thẻ selectpicker
    var addSkill = function(comId){
        $('#idSkill option').each(function(i,e){
            if(!_.isEqual($(e).val(),''))e.remove();
        });

        $('#idSkill').append(_.Tags(
            _.chain(_.find(companies,function(com){
                    return _.isEqual(com._id.toString(), comId);
                }).skills)
                .reduce(function(memo,skill){
                    memo.push(
                        {tag: 'option', attr: {value: skill._id}, content: skill.skillName}
                    );
                    return memo;
                },[])
                .value()
        ));
        $('#idSkill').selectpicker('refresh');
    };

    var bindClick = function () {
        // Cập nhật lại kỹ năng khi thay đổi công ty
        $(document).on('change', '#idCompany', function () {
            addSkill($(this).val());
        });
    };

    var bindSubmit = function () {
        // Xác nhận cập nhật service
        $('#add-new-service').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _socket.emit('CheckQueueNumberReq', {_id: user, sid: _socket.socket.sessionid, number: $('#queueNumber').val()});
                }
            }
        });
    };

    var bindSocket = function (client) {
        // Nhận dữ liệu đầu số có thể tạo service
        client.on('getQueueNumberRes', function (data) {
            $('#queueNumber option').each(function(i,e){
                if(!_.isEqual($(e).val(),''))e.remove();
            });

            _.each(data, function (number, i){
                $('#queueNumber').append(_.Tags([{
                    tag: 'option', attr: {value:number}, content: number
                }]));
            });
            $('#queueNumber').selectpicker('refresh');
        });

        // Kiểm tra đầu số có hợp lệ để tạo hay không
        client.on('CheckQueueNumberRes', function (data) {
            if(data){
                _AjaxData('/services', 'POST', $('#add-new-service').getData(), function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        window.location.hash = 'services';
                    } else {
                        swal({title: 'Thông báo !', text: resp.message});
                    }
                });
            }
        });
    }

    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['ServiceCheck'] = {
                "url": "/services/validate",
                "extraData": "",
                "extraDataDynamic": ['#name', '#idCompany'],
                "alertText": "* Chiến dịch đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            _socket.emit('getQueueNumberReq', {_id: user, sid: _socket.socket.sessionid});
            bindSocket(_socket);

            bindClick();
            bindSubmit();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            delete _socket.$events['getQueueNumberRes'];
            delete _socket.$events['CheckQueueNumberRes'];
            $(document).off('change', '#idCompany');
            $('#add-new-service').validationEngine('detach');
        }
    };
}(jQuery);