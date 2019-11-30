var DFT = function ($) {
    var validator = {};
    var groupOptions = {id: '', url: '/customer-groups', method: 'POST', data: {}};
    var sourceOptions = {id: '', url: '/customer-sources', method: 'POST', data: {}};

    // Cấu hình khi click tạo nhóm mới
    var configGroup = function (self) {
        self.find('.modal-title').text('Tạo nhóm mới');
        self.find('.modal-footer .create').show();
        self.find('.modal-footer .update').hide();
        self.find('input[name="name"]').attr('class', 'form-control input-sm validate[required,ajax[GroupCheck]]');
        groupOptions.url = '/customer-groups';
        groupOptions.id = '';
        groupOptions.method = 'POST';
    };

    // Cấu hình khi click tạo nguồn mới
    var configSource = function (self) {
        self.find('.modal-title').text('Tạo nguồn mới');
        self.find('.modal-footer .create').show();
        self.find('.modal-footer .update').hide();
        self.find('input[name="name"]').attr('class', 'form-control input-sm validate[required,ajax[SourceCheck]]');
        sourceOptions.url = '/customer-sources';
        sourceOptions.id = '';
        sourceOptions.method = 'POST';
    };

    // Sự kiện click
    var bindClick = function () {
        // Xử lý khi ẩn form tạo mới nhóm khách hàng
        $('#frm-group').on('hidden.bs.modal', function () {
            var self = $(this);
            self.find('form').validationEngine('hide')[0].reset();
            configGroup(self);
        });

        // Xử lý khi ẩn form tạo mới nguồn khách hàng
        $('#frm-source').on('hidden.bs.modal', function () {
            var self = $(this);
            self.find('form').validationEngine('hide')[0].reset();
            configSource(self);
        });

        // Click xóa/cập nhật nguồn
        $(document).on('click', '.group-task.customer-source a', function () {
            sourceOptions.id = $(this).closest('div').attr('data-id');
            sourceOptions.url = $(this).closest('div').attr('data-url');
            if (!sourceOptions.url) return false;
            if ($(this).is('.delete')) {
                swal({
                        title: 'Cảnh báo !',
                        text: 'Bạn có chắc muốn xoá nguồn này không ?',
                        html: true,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Có, chắc chắn !",
                        closeOnConfirm: false
                    },
                    function () {
                        _AjaxObject(sourceOptions.url + '/' + sourceOptions.id, 'DELETE', {}, function (resp) {
                            swal({title: 'Thành công', text: resp.message, type: 'success', html: true}, function () {
                                _.LoadPage(window.location.hash);
                            });
                        });
                    }
                );
            }
            if ($(this).is('.edit')) {
                $.get(sourceOptions.url + '/' + sourceOptions.id + '/edit', function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        var _frmSource = $('#frm-source');
                        sourceOptions.method = 'PUT';
                        _frmSource.find('#validate-source-for-x-name').val(resp.message.name);
                        _frmSource.find('#validate-source-for-group').val(resp.message.group);
                        _frmSource.find('.modal-title').text('Sửa nguồn ' + resp.message.name);
                        _frmSource.find('input[name="name"]').val(resp.message.name).attr('class', 'form-control input-sm validate[required,ajax[SourceEditCheck]]');
                        _frmSource.find('#status').val(resp.message.status).prop('checked', resp.message.status);
                        _frmSource.find('.modal-footer .update').hide();
                        _frmSource.find('.modal-footer .create').show();
                        _frmSource.modal('show');
                    } else {
                        swal({title: 'Thông báo !', text: resp.message});
                    }
                });
            }
        });

        // Click xóa/cập nhật nhóm, thêm nguồn
        $(document).on('click', '.group-task.customer-group a', function () {
            groupOptions.id = $(this).closest('.group-task').attr('data-id');
            groupOptions.url = $(this).closest('.group-task').attr('data-url');
            if ($(this).is('.delete')) {
                swal({
                        title: 'Cảnh báo !',
                        text: 'Bạn có chắc muốn xoá nhóm này không ?',
                        html: true,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Có, chắc chắn !",
                        closeOnConfirm: false
                    },
                    function () {
                        _AjaxObject(groupOptions.url + '/' + groupOptions.id, 'DELETE', {}, function (resp) {
                            swal({title: 'Thành công', text: resp.message, type: 'success', html: true}, function () {
                                _.LoadPage(window.location.hash);
                            });
                        });
                    }
                );
            }
            if ($(this).is('.edit')) {
                $.get(groupOptions.url + '/' + groupOptions.id + '/edit', function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        var _frmGroup = $('#frm-group');
                        groupOptions.method = 'PUT';
                        _frmGroup.find('#validate-groups-for-x-name').val(resp.message.name);
                        _frmGroup.find('.modal-title').text('Sửa nhóm ' + resp.message.name);
                        _frmGroup.find('input[name="name"]').val(resp.message.name).attr('class', 'form-control input-sm validate[required,ajax[GroupEditCheck]]');
                        _frmGroup.find('#status').val(resp.message.status).prop('checked', resp.message.status);
                        _frmGroup.find('.modal-footer .update').hide();
                        _frmGroup.find('.modal-footer .create').show();
                        _frmGroup.modal('show');
                    } else {
                        swal({title: 'Thông báo !', text: resp.message});
                    }
                });
            }
            if ($(this).is('.add')) {
                $.get(groupOptions.url + '/' + groupOptions.id + '/edit', function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        var _frmSource = $('#frm-source');
                        groupOptions.url = '/customer-sources';
                        groupOptions.id = '';
                        groupOptions.method = 'POST';
                        _frmSource.find('#validate-source-for-x-name').val(resp.message.name);
                        _frmSource.find('#validate-source-for-group').val(resp.message._id);
                        _frmSource.find('.modal-title').text('Tạo nguồn trong nhóm ' + resp.message.name);
                        _frmSource.find('.modal-footer .update').hide();
                        _frmSource.find('.modal-footer .create').show();
                        _frmSource.modal('show');
                    } else {
                        swal({title: 'Thông báo !', text: resp.message});
                    }
                });
            }
        });

        $(document).on('click', '#status', function () {
            $(this).val(Number($(this).is(':checked')));
        });
    };

    // Sự kiện submit
    var bindSubmit = function () {
        // Xử lý xóa/sửa/thêm nguồn của nhóm khách hàng
        $('#frm-group form').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });

                if (status) {
                    _AjaxData(groupOptions.url + '/' + groupOptions.id, groupOptions.method, form.getData(), function (resp) {
                        if (resp.code == 200) {
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thông báo !', text: resp.message});
                        }
                    });
                }else{
                    form.on('submit', function (e) {
                        e.preventDefault();
                    });
                }
            }
        });

        // Xử lý xóa/sửa nguồn của nhóm khách hàng
        $('#frm-source form').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxData(sourceOptions.url + '/' + sourceOptions.id, sourceOptions.method, form.getData(), function (resp) {
                        _.isEqual(resp.code, 200) ? _.LoadPage(window.location.hash) : swal({title: 'Thông báo !', text: resp.message});
                    });
                }
            }
        });
    };

    return {
        init: function () {
            // Cấu hình validation
            $.validationEngineLanguage.allRules['GroupCheck'] = {
                "url": "/customer-groups/validate",
                "extraDataDynamic": ['#validate-groups-for-name'],
                "alertText": "* Tên nhóm này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $.validationEngineLanguage.allRules['GroupEditCheck'] = {
                "url": "/customer-groups/validate",
                "extraDataDynamic": ['#validate-groups-for-name', '#validate-groups-for-x-name'],
                "alertText": "* Tên nhóm này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $.validationEngineLanguage.allRules['SourceCheck'] = {
                "url": "/customer-sources/validate",
                "extraDataDynamic": ['#validate-source-for-name', '#validate-source-for-group'],
                "alertText": "* Tên nguồn này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $.validationEngineLanguage.allRules['SourceEditCheck'] = {
                "url": "/customer-sources/validate",
                "extraDataDynamic": ['#validate-source-for-name', '#validate-source-for-group', '#validate-source-for-x-name'],
                "alertText": "* Tên nguồn này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();

            configGroup($('#frm-group'));
            configSource($('#frm-source'));
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.group-task.customer-source a');
            $(document).off('click', '.group-task.customer-group a');
            $(document).off('click', '#status');
            $('#frm-group form').validationEngine('detach');
            $('#frm-source form').validationEngine('detach');
        }
    };
}(jQuery);