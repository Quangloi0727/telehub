var DFT = function ($) {
    var _frm = $('#frm-item');
    var _keyword = 'asc';

    var queryFilter = function () {

        var listSort = '';

        listSort = _.chain($('.listHead th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('data-field') ? $(el).attr('data-field') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();

        listSort = _.isEmpty(listSort) ? '' : '&sort=' + listSort[0];

        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        window.location.hash = newUrl(window.location.hash.replace('#', ''), []) + listSort + paging;
    };

    var fixHelperModified = function (e, tr) {
        var $originals = tr.children();
        var $helper = tr.clone();
        $helper.children().each(function (index) {
            $(this).width($originals.eq(index).width());
        });
        return $helper;
    };
    var updateIndex = function (e, ui) {
        var _order = [{'bulk-update': true}];
        $('td.index', ui.item.parent()).each(function (i, v) {
            var _o = {};
            _o[$(v).attr('data-weight')] = i + 1;
            _order.push(_o);
            $(this).html(i + 1);
        });
        _Ajax('/role', 'POST', _order, function (resp) {
        });
    };

    var bindClick = function () {
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

        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
        
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('data-id');
            swal({
                    title: _config.MESSAGE.ROLE.CONFIRM_DELETE_ROLE,
                    text: _config.MESSAGE.ROLE.TEXT_CONFIRM_DELETE_ROLE,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/role/' + _id, 'DELETE', {}, function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({title: 'Thành công', text: _config.MESSAGE.ROLE.TEXT_SUCCESS_DELETE_ROLE, type: "success"}, function(){
                                _.LoadPage(window.location.hash);
                            });
                        } else {
                            swal({title: 'Thất bại!', text: resp.message});
                        }
                    });
                });
        });

        $(document).on('click', '#btn-delSelection', function(){
            var ids = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            swal({
                    title: _config.MESSAGE.ROLE.CONFIRM_DELETE_MANY_ROLE,
                    text: _config.MESSAGE.ROLE.TEXT_CONFIRM_DELETE_MANY_ROLE,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/role/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.ROLE.TEXT_SUCCESS_DELETE_MANY_ROLE, type: "success"}, function(){
                            _.LoadPage(window.location.hash);
                        });
                    });
                });
        });

        $(document).on('click', '.btn-edit', function(){
        //$('.btn-edit').on('click', function(e){
            _frm.modal('show');
            $('#edit-name').attr('value', $(this).attr('data-name'));
            $('#edit-name').attr('data-id', $(this).attr('data-id'));
            $('#edit-status').prop('checked', (($(this).attr('data-status') == 1) ? true : false));
            $('#edit-description').attr('value', $(this).attr('data-description'));
            $('select[name=roleGroup]').val($(this).attr('data-role-group'));
            $('.selectpicker').selectpicker('refresh')
        });
    };

    var bindSubmit = function () {
//        $(document).on('change', '.lvhs-input', function () {
//            window.location.href = '/skills/search?skillName=' + $('.lvhs-input').val();
//        });

        $('#edit-role').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxObject('/role/' + $('#edit-name').attr('data-id'), 'PUT', form.getData(), function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }
            }
        });

        //Show or hide delete button
        $(document).on('change', '.select-box-all', function () {
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked"))
            {
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        });

        $(document).on('change', '.select-box-cell', function () {
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
    };

    var bindtextValue = function () {

        _.each(_.allKeys(_config.MESSAGE.ROLE), function(item){
            $('.' + item).html(_config.MESSAGE.ROLE[item]);
        });

        //$('#txt_role_actions').html(_config.MESSAGE.ROLE.TEXT_ACTIONS_ROLE);
        //$('#txt_role_status').html(_config.MESSAGE.ROLE.TEXT_STATUS_ROLE);
        //$('#txt_role_describe').html(_config.MESSAGE.ROLE.TEXT_DESCRIBLE_ROLE);
        //$('#sortByName').html(_config.MESSAGE.ROLE.TEXT_JURISDICTION_ROLE);
        //$('#txt_role_group').html(_config.MESSAGE.ROLE.TEXT_ROLE_GROUP);
        //$('#role-name-title').html(_config.MESSAGE.ROLE.TEXT_ROLE_EDIT_TITLE);
        //$('#role-name').hmtl(_config.MESSAGE.ROLE.EDIT_JURISDICTION_ROLE);
    };

    return {
        init: function () {
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[data-field="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
                var toRender = '';
                if(_.isEqual(_sort[1], 'asc')) toRender += '<i data-toggle="tooltip" data-original-title="Sắp xếp theo thứ tự tăng dần" class="zmdi zmdi-sort-asc"></i> ';
                if(_.isEqual(_sort[1], 'desc')) toRender += '<i data-toggle="tooltip" data-original-title="Sắp xếp theo thứ tự giảm dần" class="zmdi zmdi-sort-desc"></i>';
                toRender += 'Tên quyền hạn';
                $('th[data-field="' + _sort[0] + '"]').html(toRender);
            }

            $.validationEngineLanguage.allRules['RoleCheck'] = {
                "url": "/role/validate",
                "extraData": "",
                "extraDataDynamic": ['#edit-name'],
                "alertText": "* Đã tồn tại quyền hạn này",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $("#tbl-fields tbody").sortable({helper: fixHelperModified, stop: updateIndex, distance: 5, opacity: 0.6, cursor: 'move'}).disableSelection();

            bindClick();
            bindSubmit();
            bindtextValue();
        },
        uncut: function(){
            $(document).off('click', '.listHead th');
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '.btn-edit');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '.zmdi-refresh');
            $('#edit-role').validationEngine('detach');
        }
    };
}(jQuery);