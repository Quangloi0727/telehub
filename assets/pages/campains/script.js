var DFT = function ($) {

    var _frm = $('#frm-item');
    var _options = {id: '', url: '/campains', method: 'POST', data: {}};

    // Lấy dữ liệu search và gửi lên server
    var queryFilter = function () {
        var _data = _.pick($('#campain').serializeJSON(), _.identity);
        var listFilter = _.chain(_.keys(_data))
            .reduce(function (memo, item) {
                memo[item.replace("filter_", "")] = _data[item];
                return memo;
            }, {})
            .value();
        var listSort = _.chain($('.listHead th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('data-field') ? $(el).attr('data-field') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        listSort = _.isEmpty(listSort) ? '' : '&sort=' + listSort[0];
        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        window.location.hash = newUrl(window.location.hash.replace('#', ''), listFilter) + listSort + paging;
    };


    // Bắt sự kiện click
    var bindClick = function () {
        // Thay đổi loại của campaign
        $(document).on('change', '#type', function () {
            if(!_.isEqual($(this).val(), '1')){
                $.map($('.auto-dialing'), function(n, i){
                    $(n).removeClass('hidden');
                });
            }else {
                $.map($('.auto-dialing'), function(n, i){
                    $(n).addClass('hidden');
                });
            }
        });

        // Khi chọn sort/sắp xếp
        $(document).on('click', '.listHead th', function () {
            var $this = $(this);
            if (_.isUndefined($this.attr('data-field'))) return false;
            switch ($this.attr('data-sort')) {
                case 'none':
                    $this.toggleAttr('data-sort', 'asc');
                    break;
                case 'asc':
                    $this.toggleAttr('data-sort', 'desc');
                    break;
                case 'desc':
                    $this.toggleAttr('data-sort', 'none');
                    break;
            }
            $this.siblings().toggleAttr('data-sort', 'none');
            queryFilter();
        });

        // Click nút lọc
        $(document).on('click', '.btn-filter', function () {
            queryFilter();
        });

        // Không dùng
        _frm.on('hidden.bs.modal', function () {
            _frm.find('form').validationEngine('hide')[0].reset();
            _frm.find('.modal-title').text('Tạo nhóm mới');
            _frm.find('.modal-footer .create').show();
            _frm.find('.modal-footer .update').hide();
            _frm.find('input[name="name"]').attr('class', 'form-control input-sm validate[required,ajax[NewCheck]]');
            _frm.find('input[name="idCompany"]').attr('class', 'form-control input-sm validate[required,ajax[NewCheck]]');

            _frm.find('input[name="note"]').prop( "disabled", false);
            _frm.find('input[name="startDate"]').prop( "disabled", false);
            _frm.find('input[name="endDate"]').prop( "disabled", false);
            _frm.find('select[name="idCompany"]').val(null).prop( "disabled", false).selectpicker('refresh');
            _frm.find('select[name="trunk"]').empty().selectpicker('refresh');
            _frm.find('select[name="type"]').val(null).prop( "disabled", false).selectpicker('refresh');
            $.map($('.auto-dialing'), function(n, i){
                $(n).addClass('hidden');
            });
            _frm.find('input[name="delayTime:number"]').val(0).prop( "disabled", false);
            _frm.find('input[name="retry:number"]').val(0).prop( "disabled", false);
            _frm.find('input[name="retryTime:number"]').val(0).prop( "disabled", false);
            _frm.find('select[name="autoDialingStatus"]').val(0).prop( "disabled", false).selectpicker('refresh');
            _frm.find('select[name="agents[]"]').empty().bootstrapDualListbox('refresh');
            _frm.find('select[name="idCategoryReason"]').val(null).prop( "disabled", false).selectpicker('refresh');
            _frm.find('select[name="idSurvey"]').val(null).prop( "disabled", false).selectpicker('refresh');
            _frm.find('select[name="idCampainParent"]').val(null).prop( "disabled", false).selectpicker('refresh');
            _frm.find('#status').val(1).prop( "disabled", false).prop('checked', 'checked');

            _frm.find('option[value="'+_options.id+'"]').removeAttr('disabled');
            _frm.find('#status-span').html('Kích hoạt');
            _options.url = '/campains';
            _options.id = '';
            _options.method = 'POST';
        });

        // Xóa 1 phần tử
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('data-id');
            swal({
                    title: _config.MESSAGE.CAMPAIN.DELETE_TITLE,
                    text: _config.MESSAGE.CAMPAIN.DELETE_TEXT,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/campains/' + _id, 'DELETE', {}, function (resp) {
                        if(resp.code == 200){
                            swal({title: 'Thành công', text: _config.MESSAGE.CAMPAIN.DELETE_TEXT_SUCCESS, type: "success"});
                        }else {
                            swal({title: 'Thất bại', text: 'Xóa thất bại', type: "warning"});
                        }
                        _.LoadPage(window.location.hash);
                    });
                });
        });

        //$(document).on('click', '.task a', function () {
        //    _options.id = $(this).closest('td').attr('data-id');
        //    _options.url = $(this).closest('td').attr('data-url');
        //
        //    if (!_options.url) return false;
        //    if ($(this).is('.delete')) {
        //        swal({
        //                title: _config.MESSAGE.CAMPAIN.DELETE_TITLE, text: _config.MESSAGE.CAMPAIN.DELETE_TEXT, html: true,
        //                type: 'warning', showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
        //            },
        //            function () {
        //                _AjaxObject(_options.url + '/' + _options.id, 'DELETE', {}, function (resp) {
        //                    swal({title: 'Thành công', text: _config.MESSAGE.CAMPAIN.DELETE_TEXT_SUCCESS, type: 'success'});
        //                    _.LoadPage(window.location.hash);
        //                });
        //            }
        //        );
        //    }
        //
        //    if ($(this).is('.edit')) {
        //        $.get(_options.url + '/' + _options.id + '/edit', function (resp) {
        //            if (_.isEqual(resp.code, 200)) {
        //                _options.method = 'PUT';
        //                var canEdit = resp.canEdit;
        //                _frm.find('input[name="name"]').val(resp.message.name);
        //                _frm.find('input[name="name"]').attr('class', 'form-control input-sm validate[required,ajax[EditCheck]]');
        //                _frm.find('select[name="idCompany"]').attr('class', 'selectpicker validate[required,ajax[EditCheck]]');
        //                _frm.find('#updateId').val(resp.message._id);
        //                _frm.find('input[name="note"]').val(resp.message.note).prop( "disabled", canEdit ? false : true);
        //                _frm.find('input[name="startDate"]').val(moment(resp.message.startDate).format('MM/DD/YYYY h:mm a')).prop( "disabled", canEdit ? false : true);
        //                _frm.find('input[name="endDate"]').val(moment(resp.message.endDate).format('MM/DD/YYYY h:mm a')).prop( "disabled", canEdit ? false : true);
        //                _frm.find('select[name="idCompany"]').val(resp.message.idCompany).prop( "disabled", canEdit ? false : true).selectpicker('refresh');
        //                var params= {};
        //                params.status=1;
        //                params.idCompany= $('#idCompany').find(":selected").val();
        //                $('#trunk').empty().selectpicker('refresh');
        //                var curTrunk = resp.message.trunk;
        //                $.get("/trunk?"+ $.param(params), function(resp){
        //                    if(resp.code==200){
        //                        _.each(resp.data, function(g, i){
        //                            $('#trunk').append(newOption(g)).selectpicker('refresh');
        //                        });
        //                        _frm.find('select[name="trunk"]').val(curTrunk).selectpicker('refresh');
        //                    }
        //                })
        //
        //                $('#agents').empty()
        //                var curAgents = resp.message.agents;
        //                _Ajax('/campains'+ '?type=getAgent&idCompany='+$('#idCompany').val(), 'GET', {}, function (resp) {
        //                    _.each(resp.message, function(g, i){
        //                        $('#agents').append('<option class="duallist-option" value='+g._id+'>'+ g.displayName+'</option>').bootstrapDualListbox('refresh');
        //                    });
        //                    _frm.find('select[name="agents[]"]').val(curAgents).prop( "disabled", canEdit ? false : true).bootstrapDualListbox('refresh');
        //                    $('#agents').bootstrapDualListbox('refresh');
        //                });
        //
        //                _frm.find('select[name="idSurvey"]').val(resp.message.idSurvey).prop( "disabled", canEdit ? false : true).selectpicker('refresh');
        //                _frm.find('select[name="idCategoryReason"]').val(resp.message.idCategoryReason).prop( "disabled", canEdit ? false : true).selectpicker('refresh');
        //                _frm.find('select[name="idCampainParent"]').val(resp.message.idCampainParent).prop( "disabled", canEdit ? false : true).selectpicker('refresh');
        //                _frm.find('.modal-title').text('Sửa chiến dịch ' + resp.message.name);
        //                _frm.find('#status').val(resp.message.status).prop('checked', resp.message.status ? 'checked' : '');
        //                _frm.find('#status-span').html(resp.message.status ? 'Kích hoạt' : 'Không kích hoạt');
        //                _frm.find('select[name="type"]').val(resp.message.type).prop( "disabled", canEdit ? false : true).selectpicker('refresh');
        //                if(resp.message.type != 1){
        //                    $.map($('.auto-dialing'), function(n, i){
        //                        $(n).removeClass('hidden');
        //                    });
        //                }else {
        //                    $.map($('.auto-dialing'), function(n, i){
        //                        $(n).addClass('hidden');
        //                    });
        //                }
        //                _frm.find('input[name="delayTime:number"]').val(resp.message.delayTime);
        //                _frm.find('input[name="retry:number"]').val(resp.message.retry);
        //                _frm.find('input[name="retryTime:number"]').val(resp.message.retryTime);
        //                _frm.find('select[name="autoDialingStatus"]').val(resp.message.autoDialingStatus).selectpicker('refresh');
        //                _frm.find('select[name="idCampainParent"]').prop( "disabled", canEdit ? false : true).selectpicker('refresh');
        //
        //                _frm.find('.modal-footer .update').hide();
        //                _frm.find('.modal-footer .create').show();
        //                _frm.find('option[value="'+_options.id+'"]').attr('disabled','disabled');
        //                _frm.modal('show');
        //            } else {
        //                swal({title: 'Thông báo !', text: resp.message});
        //            }
        //        });
        //    }
        //});

        // Xóa nhiều phần tử đã chọn
        $(document).on('click', '#btn-delSelection', function(){
            var ids = $.map($('.selection'), function(n, i){
                return $(n).is(":checked") ? $(n).val(): '';
            });
            swal({
                    title: _config.MESSAGE.CAMPAIN.DELETE_TITLE_MANY,
                    text: _config.MESSAGE.CAMPAIN.DELETE_TEXT_MANY,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/campains/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.CAMPAIN.DELETE_TEXT_SUCCESS, type: "success"});
                        _.LoadPage(window.location.hash);
                    });
                });
        });

        // thay đổi trạng thái
        $(document).on('click', '#status', function(){
        //$('#status').click(function(event) {
            if(this.checked) {
                $(this).val(1);
            }
            else {
                $(this).val(0);
            }
        });

        // Xử lý khi chọn select tất cả
        $(document).on('click', '#select_all', function(){
        //$('#select_all').click(function(event) {
            if(this.checked) {
                // Iterate each checkbox
                $('.selection').each(function() {
                    this.checked = true;
                });
                $('#li-hidden').removeClass('hidden');
            }
            else {
                $('.selection').each(function() {
                    this.checked = false;
                });
                $('#li-hidden').addClass('hidden');
            }
        });

        // Chọn 1 phần tử
        $(document).on('click', '.selection', function(){
        //$('.selection').click(function(event){
            var x = $.map($('.selection'), function(n, i){
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0){
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        })

        // Sắp xếm theo tên
        $(document).on('click', '.sortName', function () {
            sortData('name', true);
        });

        // Sắp xếm theo ngày tạo
        $(document).on('click', '.sortCreateDate', function () {
            sortData('created', true);
        });

        // Sắp xếm theo ngày cập nhật
        $(document).on('click', '.sortUpdateDate', function () {
            sortData('updated', true);
        });

        // Nhấn enter khi search
        $('#campain').on('keyup', function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                e.preventDefault();
                queryFilter();
            }
        });

        // Thay đổi giá trị công ty
        $('#idCompany').on('change', function(){
            var params= {};
            params.status=1;
            params.idCompany= $('#idCompany').find(":selected").val();
            $('#trunk').empty().selectpicker('refresh');

            $.get("/trunk?"+ $.param(params), function(resp){
                if(resp.code==200){
                    _.each(resp.data, function(g, i){
                        $('#trunk').append(newOption(g)).selectpicker('refresh');
                    });
                }
            })

            $('#agents').empty();

            _Ajax('/campains'+ '?type=getAgent&idCompany='+params.idCompany, 'GET', {}, function (resp) {
                _.each(resp.message, function(g, i){
                    $('#agents').append('<option class="duallist-option" value='+g._id+'>'+ g.displayName+'</option>').bootstrapDualListbox('refresh');
                });
                $('#agents').bootstrapDualListbox('refresh');
            });
        });
    };

    // Tạo thẻ option cho thẻ selectpicker
    var newOption = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-s', value: obj._id}, content: obj.name}
        ]);
    };

    // Gắn sự kiện submit
    var bindSubmit = function () {
        $('#campain').submit(function(e){
            e.preventDefault();
        });

        $('#frm-item form').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    _AjaxData(_options.url + '/' + _options.id, _options.method, form.getData(), function (resp) {
                        _.isEqual(resp.code, 200) ? _.LoadPage(window.location.hash) : swal({title: 'Thông báo !', text: resp.message});
                    });
                }
            }
        });
    };

    var bindPressKey = function(){

    }

    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['NewCheck'] = {
                "url": "/campains/validate",
                "extraDataDynamic": ['#name', '#idCompany'],
                "alertText": "* Đã tồn tại chiến dịch",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            $.validationEngineLanguage.allRules['EditCheck'] = {
                "url": "/campains/validate",
                "extraDataDynamic": ['#name', '#idCompany', '#updateId'],
                "alertText": "* Đã tồn tại chiến dịch",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            $.validationEngineLanguage.allRules['DurHighCheck'] = {
                "func": function(){
                    return moment($('#startDate').val(),"MM/DD/YYYY h:mm a")._d <= moment($('#endDate').val(),"MM/DD/YYYY h:mm a")._d;
                },
                "alertText": "* Giá trị ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
            };


            // Xử lý paging
            if ($('.pagination')[0]) {
                delete window.location.obj.page;
                var _url = $.param(window.location.obj);
                $('.pagination a').each(function (i, v) {
                    $(v).attr('href', $(v).attr('href') + '&' + _url);
                });
            }
            // Xử lý sort
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[data-field="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            // Thông báo khi không tìm thấy kết quả tìm kiếm
            if ($('#campain tbody tr').length == 1) {
                delete window.location.obj['sort'];
                if (!_.isEmpty(window.location.obj)) {
                    swal({title: _config.MESSAGE.CAMPAIN.SEARCH_TITLE, type: "warning"}, function(){
                        window.history.back();
                    });
                }
            }

            // Cấu hình dual list box
            var dualListAgent = $('select[name="agents[]"]').bootstrapDualListbox({
                filterTextClear: 'Filter',
                infoTextEmpty: "<a class='c-red' ><b>Chưa chọn giá trị</b></a>",
                infoText: "<a class='c-blue' ><b>Số lượng agent: {0}</b></a>"
            });
            $(".bootstrap-duallistbox-container").find(".moveall").parent().remove();
            $(".bootstrap-duallistbox-container").find(".removeall").parent().remove();

            //$(".date-time-picker").datetimepicker();

            bindClick();
            bindSubmit();
            bindPressKey();
        },
        uncut : function(){
            // Disable sự kiện của thẻ
            $(document).off('change', '#type');
            $(document).off('click', '.listHead th');
            $(document).off('click', '.btn-filter');
            $(document).off('click', '.task a');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '#status');
            $(document).off('click', '#select_all');
            $(document).off('click', '.selection');
            $(document).off('click', '.sortName');
            $(document).off('click', '.sortCreateDate');
            $(document).off('click', '.sortUpdateDate');
            $('#frm-item form').validationEngine('detach');
            $('#campain').unbind('keyup');
        }
    };
}(jQuery);