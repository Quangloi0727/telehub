var DFT = function ($) {

    var filter = [];

    var bindClick = function () {

    };

    var bindSubmit = function () {
        $('#add-new-sync').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    var result = $('#add-new-sync').serializeJSON();
                    _.each(filter, function(el){
                        if(_.isEqual(el._id.toString(), result.query)){
                            result.query = el.query;
                            result.filterId = el._id.toString();
                        }
                    });

                    _Ajax('/sync-customer', 'POST', [{data: JSON.stringify(result)}], function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            window.location.hash = 'sync-customer';
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });
    };

    var bindSocket = function (client) {
        client.on('getCustomerFilterRes', function (data) {
            filter = data;
            $('#query option').each(function(i,e){
                if(!_.isEqual($(e).val(),''))e.remove();
            });

            _.each(data, function (el, i){
                $('#query').append(_.Tags([{
                    tag: 'option', attr: {value: el._id}, content: el.name
                }]));
            });
            $('#query').selectpicker('refresh');
        });
    }

    return {
        init: function () {

            $.validationEngineLanguage.allRules['NameCheck'] = {
                "url": "/sync-customer/validate",
                "extraData": "",
                "extraDataDynamic": ['#name'],
                "alertText": "* Tên đã tồn tại",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            _socket.emit('getCustomerFilterReq', {_id: user, sid: _socket.socket.sessionid});
            bindSocket(_socket);

            bindClick();
            bindSubmit();
        },
        uncut: function(){

        }
    };
}(jQuery);