var DFT = function ($) {
    var _options = {id: '', url: '/kpi-mark-data', method: 'POST', data: {}};

    var queryFilter = function () {
        var params = _.chain($('.data-filter'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '') && !_.isNull($(el).val())) {
                    memo[el.name] = $(el).val();
                }
                return memo;
            }, {}).value();
        window.location.hash = newUrl(window.location.hash, params);
    };

    var bindClick = function () {

        $(document).on('click', '.btn-filter', function () {
            //Todo: Lọc bản ghi
            queryFilter();
        });

        $(document).on('click', '.addQAMarking', function(){
            //Todo: Chuyển trang thêm QA
            var id = $(this).closest('td').attr('data-id');
            $.get('/kpi-mark-data?queryTicketMark=1&idData=' + id, function(resp){
                if (resp.code == 200){
                    if (resp.count == 0){
                        window.location.hash = '#kpi-mark-data-qa?data=' + id;
                    }
                    else{
                        swal({title: 'Thất bại', text: 'Đã chấm điểm ticket của bộ dữ liệu này', type: "warning"});
                    }
                }
            });
        });

        $(document).on('click', '.addAgentMarking', function(){
            //Todo: Chuyển trang thêm agent được chấm
            var id = $(this).closest('td').attr('data-id');
            $.get('/kpi-mark-data?queryTicketMark=1&idData=' + id, function(resp){
                if (resp.code == 200){
                    if (resp.count == 0){
                        window.location.hash = '#kpi-mark-data/' + id;
                    }
                    else{
                        swal({title: 'Thất bại', text: 'Đã chấm điểm ticket của bộ dữ liệu này', type: "warning"});
                    }
                }
            });
        });

        $(document).on('click', '#btn-delSelection', function(){
            //Todo: Xóa bản ghi được tích
            var ids = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked") ? $(n).attr('data-id'): '';
            });
            swal({
                    title: _config.MESSAGE.KPI_MARK_DATA.DELETE_TITLE_MANY,
                    text: _config.MESSAGE.KPI_MARK_DATA.DELETE_TEXT_MANY,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/kpi-mark-data/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        var notDeletes = resp.data;
                        if (notDeletes.length == 0) {
                            swal({title: 'Thành công', text: _config.MESSAGE.KPI_MARK_DATA.DELETE_TEXT_SUCCESS, type: "success"});
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thất bại', text: 'Dữ liệu đang được sử dụng', type: "warning"});
                        }
                        _.LoadPage(window.location.hash);
                    });
                });
        });

        $(document).on('click', '.delete', function () {
            //Todo: Xóa bản ghi được chỉ định
            var _id = $(this).closest('td').attr('data-id');
            swal({
                    title: _config.MESSAGE.KPI_MARK_DATA.DELETE_TITLE,
                    text: _config.MESSAGE.KPI_MARK_DATA.DELETE_TEXT,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/kpi-mark-data/' + _id, 'DELETE', {}, function (resp) {
                        var notDeletes = resp.data;
                        if (notDeletes.length == 0) {
                            swal({title: 'Thành công', text: _config.MESSAGE.KPI_MARK_DATA.DELETE_TEXT_SUCCESS, type: "success"});
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thất bại', text: 'Dữ liệu đang được sử dụng', type: "warning"});
                        }
                        _.LoadPage(window.location.hash);
                    });
                });
        });

        $(document).on('click', '#status', function(){
            if(this.checked) {
                $(this).val(1);
            }
            else {
                $(this).val(0);
            }
        });

        $(document).on('click', '.sortName', function () {
            sortData('name', true);
        });

        $(document).on('click', '.sortCreateDate', function () {
            sortData('created', true);
        });

        $(document).on('click', '.sortUpdateDate', function () {
            sortData('updated', true);
        });

        $(document).on('change', '.select-box-all', function () {
            //Todo: Chọn tất cả các bản ghi
            if ($(('.select-box-cell')).length){
                $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
                if ($('.select-box-all').is(":checked"))
                {
                    $('#li-hidden').removeClass('hidden');
                }
                else{
                    $('#li-hidden').addClass('hidden');
                }
            }
        });

        $(document).on('change', '.select-box-cell', function () {
            //Todo: Chọn một bản ghi
            var x = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0){
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        });

        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

    };

    var bindSubmit = function () {
        //Validate dữ liệu
        $('#frm-item form').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true, validationEventTrigger: 'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    $('.formError').remove();
                    async.waterfall([
                        function (cb) {
                            $.get(_options.url + '/' + 'validate?validateOnSubmit=1&name=' + $('#name').val(), function (resp) {
                                if (!resp.code) {
                                    $('#name').validationEngine('showPrompt', 'Đã tồn tại dữ liệu này', 'error', 'topRight', true);
                                }
                                cb(null, resp.code);
                            });
                        }
                    ], function (err, resp) {
                        if (resp) {
                            _AjaxData(_options.url + '/' + _options.id, 'POST', form.getData(), function (resp) {
                                _.isEqual(resp.code, 200) ? _.LoadPage(window.location.hash) : swal({title: 'Thông báo !', text: resp.message});
                            });
                        }
                    });

                }
            }
        });
    };

    return {
        init: function () {
            //Luật check validate
            $.validationEngineLanguage.allRules['KpiDataName'] = {
                "url": "/kpi-mark-data/validate",
                "extraData": "",
                "extraDataDynamic": ['#name'],
                "alertText": "* Đã tồn tại chiến dịch",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            
            $.validationEngineLanguage.allRules['DurHighCheck'] = {
                "func": function () {
                    return moment($('#startDate').val(), "DD/MM/YYYY")._d <= moment($('#endDate').val(), "DD/MM/YYYY")._d;
                },
                "alertText": "* Giá trị ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
            };

            $.validationEngineLanguage.allRules['DurNumCheck'] = {
                "func": function(){
                    return _.isEqual($('#typeNumber').val(), '2') ? (Number($('#maxTicket').val()) <= 100 && Number($('#maxTicket').val()) > 0) : true;
                },
                "alertText": "* Giá trị phải nằm trong khoảng từ 1 đến 100"
            };

            if ($('.pagination')[0]) {
                delete window.location.obj.page;
                var _url = $.param(window.location.obj);
                $('.pagination a').each(function (i, v) {
                    $(v).attr('href', $(v).attr('href') + '&' + _url);
                });
            }

            bindClick();
            bindSubmit();
        },
        uncut : function(){
            $(document).off('change', '#type');
            $(document).off('click', '.table-fix th');
            $(document).off('click', '.btn-filter');
            $(document).off('click', '.task a');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '#status');
            $(document).off('click', '#select_all');
            $(document).off('click', '.selection');
            $(document).off('click', '.addQAMarking');
            $(document).off('click', '.addAgentMarking');
            $('#frm-item form').validationEngine('detach');
            $('#mark-data').unbind('keyup');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);