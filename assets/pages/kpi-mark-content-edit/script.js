var DFT = function ($) {

    function onChangeType(type) {
        $('#field-settings .fg-line').validationEngine('hide');
        //$('#field-settings .input-group.m-b-20').remove();

        _.each($('.switchType'), function (el) {
            var dataType = parseInt($(el).attr('data-type'));

            if (dataType == type) {
                $(el).removeClass('hidden').removeClass('disabled');
            } else {
                $(el).addClass('hidden').addClass('disabled');
            }
        });
    }

    var bindClick = function () {
        $(document).on('change', '#fieldType', function () {
            var _type = Number($(this).val());
            onChangeType(_type);
        });
        $(document).on('click', '#field-settings .zmdi-plus', function () {
            $('#field-settings .fg-line').validationEngine('updatePromptsPosition');
            $(this).closest('.fg-line').prepend(_.Tags([{
                tag: 'div', attr: {class: 'input-group m-b-20'},
                childs: [
                    {tag: 'input', attr: {type: 'text', class: "form-control", name: "fieldValue[]", placeholder: "..."}},
                    {
                        tag: 'span', attr: {class: "input-group-addon p-l-10 bgm-gray c-white"},
                        childs: [
                            {tag: 'i', attr: {role: "button", class: "m-r-10 zmdi zmdi-plus"}},
                            {tag: 'i', attr: {role: "button", class: "m-l-10 zmdi zmdi-minus"}}
                        ]
                    }
                ]
            }]));
        });
        $(document).on('click', '#field-settings .zmdi-minus', function () {
            $(this).closest('.input-group').remove();
            $('#field-settings .fg-line').validationEngine('updatePromptsPosition');
        });
        $(document).on('click', '#kpi-mark-conten-back', function () {
            window.location.hash = 'kpi-mark-content?collection=' + window.location.obj.collection
        });

        $(document).on('click', '.appendTo', function () {
            var dataName = $(this).attr('data-name');
            var after = _.chain(dataName).cleanString().underscored().value();
            var obj = $('#fnTextArea');

            var text = obj.text();
            text += after;
            obj.text(text);
            obj.val(text);
        });

        $('#fnTextArea').bind('input propertychange', function () {
            var value = this.value;
            $('#fnTextArea').text(value);
        });
    };

    var bindSubmit = function () {
        //Todo: Validate bản ghi
        $('#add-new-fields').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    var cont = true;
                    var type = parseInt($('#fieldType').val());
                    var errTitle = 'Vui lòng kiểm tra lại giá trị nhập vào';
                    var errContent = null;

                    switch (type) {
                        case 0:
                            //Giá trị max >= min
                            var minValue = $('#__minValue').val(),
                                maxValue = $('#__maxValue').val();

                            if (minValue == '' && maxValue == '') {
                                // ok. ko gioi han
                            } else if ((minValue == '' && maxValue != '') || (minValue != '' && maxValue == '')) {
                                cont = false;
                                errContent = 'Có ô giá trị bị bỏ trống, vui lòng kiểm tra lại';
                            } else if (parseInt(minValue) >= parseInt(maxValue)) {
                                cont = false;
                                errContent = 'Giá trị max phải lớn hơn giá trị min';
                            }
                            break;
                        case 1:
                            break;
                        case 2:
                            var fn = null;
                            try {
                                //Check công thức hợp lệ
                                var fnStr = $('#fnTextArea').val();

                                fn = eval('(' + fnStr + ')');

                                if (typeof fn != 'function') {
                                    cont = false;
                                    errContent = 'Công thức tính phải là function của javascript';
                                }
                            } catch (e) {
                                cont = false;
                                errContent = e.message;
                            }
                            break;
                    }


                    if (cont) {
                        var collection = window.location.obj.collection;
                        var _jdata = form.serializeJSON();
                        var _data  = form.getData();
//                        _data.delete('fnTextArea');
                        _data.append('fnTextAreaEncode', window.btoa(encodeURIComponent(_jdata.fnTextArea)));
                        _AjaxData('/kpi-mark-content/'+ _currentKpi._id +'?collection=' + collection,
                            'PUT',
                            _data,
                            function (resp) {
                                if (_.isEqual(resp.code, 200)) {
                                    window.location.hash = 'kpi-mark-content?collection=' + collection;
                                } else {
                                    swal({title: 'Thông báo !', text: resp.message});
                                }
                            });
                    } else {
                        swal(errTitle, errContent, 'error');
                    }
                }
            }
        });
    };

    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.KPI_MARK_CONTENT), function (item) {
            $('.' + item).html(_config.MESSAGE.KPI_MARK_CONTENT[item]);
        });

        $('.selectpicker').selectpicker('refresh')
    };


    return {
        init: function () {
            $.validationEngineLanguage.allRules['FieldCheck'] = {
                "url": "/kpi-mark-content/validate?collection=" + window.location.obj.collection + "&currentId=" + _currentKpi._id,
                "extraDataDynamic": ['#name'],
                "alertText": "* Tên trường này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            var content = decodeURIComponent(window.atob(_currentKpi.contentBase64));
            $('#fnTextArea').val(content);

            bindClick();
            bindSubmit();
            bindTextValue();

            onChangeType($('#fieldType').val());
            $('.add-margin-after').addClass('m-b-20');
        },
        uncut: function () {
            $(document).off('change', '#fieldType');
            $(document).off('click', '#field-settings .zmdi-plus');
            $(document).off('click', '#field-settings .zmdi-minus');
            $(document).off('click', '#kpi-mark-conten-back');
            $(document).off('click', '.appendTo');
            $('#fnTextArea').unbind('input propertychange');
            $('#add-new-fields').validationEngine('detach');
        }
    };
}(jQuery);