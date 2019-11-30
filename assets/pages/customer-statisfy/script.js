var DFT = function ($) {
    var validator = {};
    var statisfyOptions = {id: '', url: '/customer-statisfy', method: 'POST', data: {}, stage: 0};
    var sourceOptions = {id: '', url: '/customer-statisfy', method: 'POST', data: {}, stage: 1};


    var configstatisfy = function (self) {
        self.find('.modal-title').text('Tạo mới mức độ hài lòng khách hàng');
        self.find('.modal-footer .create').show();
        self.find('.modal-footer .update').hide();
        self.find('input[name="name"]').attr('class', 'form-control input-sm validate[required,ajax[StatisfyCheck]]');
        statisfyOptions.url = '/customer-statisfy';
        statisfyOptions.id = '';
        statisfyOptions.method = 'POST';
    };

    var configSource = function (self) {
        self.find('.modal-title').text('Tạo tiêu chí mới');
        self.find('.modal-footer .create').show();
        self.find('.modal-footer .update').hide();
        self.find('input[name="name"]').attr('class', 'form-control input-sm validate[required,ajax[StageCheck]]');
        sourceOptions.url = '/customer-statisfy';
        sourceOptions.id = '';
        sourceOptions.method = 'POST';
    };

    var bindClick = function () {
        $('#frm-statisfy').on('hidden.bs.modal', function () {
            var self = $(this);
            self.find('form').validationEngine('hide')[0].reset();
            configstatisfy(self);
        });

        $('#frm-source').on('hidden.bs.modal', function () {
            var self = $(this);
            self.find('form').validationEngine('hide')[0].reset();
            configSource(self);
        });

        $(document).on('click', '.statisfy-task.customer-source a', function () {
            sourceOptions.id = $(this).closest('div').attr('data-id');
            sourceOptions.url = $(this).closest('div').attr('data-url');
            if (!sourceOptions.url) return false;
            if ($(this).is('.delete')) {
                swal({
                        title: 'Cảnh báo !',
                        text: 'Bạn có chắc muốn xoá tiêu chí này không ?',
                        html: true,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Có, chắc chắn !",
                        closeOnConfirm: false
                    },
                    function () {
                        _AjaxObject(sourceOptions.url + '/' + sourceOptions.id + '?stage=' + sourceOptions.stage,
                            'DELETE',
                            {},
                            function (resp) {
                                swal({title: 'Thành công', text: resp.message, type: 'success', html: true}, function () {
                                    _.LoadPage(window.location.hash);
                                });
                            });
                    }
                );
            }
            if ($(this).is('.edit')) {
                $.get(sourceOptions.url + '/' + sourceOptions.id + '/edit?stage=' + sourceOptions.stage, function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        //['#validate-stage-for-name', '#validate-stage-for-statisfy', '#validate-stage-for-x-name'],
                        var _frmSource = $('#frm-source');
                        sourceOptions.method = 'PUT';
                        _frmSource.find('#validate-stage-for-x-name').val(resp.message.name);
                        _frmSource.find('#validate-stage-for-statisfy').val(resp.message.idCustomerStatisfy);
                        _frmSource.find('.modal-title').text('Sửa tiêu chí ' + resp.message.name);
                        _frmSource.find('input[name="name"]').val(resp.message.name).attr('class', 'form-control input-sm validate[required,ajax[StageEditCheck]]');
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

        $(document).on('click', '.statisfy-task.customer-statisfy a', function () {
            statisfyOptions.id = $(this).closest('.statisfy-task').attr('data-id');
            statisfyOptions.url = $(this).closest('.statisfy-task').attr('data-url');
            if ($(this).is('.delete')) {
                swal({
                        title: 'Cảnh báo !',
                        text: 'Bạn có chắc muốn xoá mức độ hài lòng này không ?',
                        html: true,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Có, chắc chắn !",
                        closeOnConfirm: false
                    },
                    function () {

                        _AjaxObject(statisfyOptions.url + '/' + statisfyOptions.id + '?stage=' + statisfyOptions.stage,
                            'DELETE',
                            {},
                            function (resp) {
                                swal({title: 'Thành công', text: resp.message, type: 'success', html: true}, function () {
                                    _.LoadPage(window.location.hash);
                                });
                            });
                    }
                );
            }
            if ($(this).is('.edit')) {
                $.get(statisfyOptions.url + '/' + statisfyOptions.id + '/edit?stage=' + statisfyOptions.stage, function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        var _frmstatisfy = $('#frm-statisfy');
                        statisfyOptions.method = 'PUT';
                        _frmstatisfy.find('#validate-statisfys-for-x-name').val(resp.message.name);
                        _frmstatisfy.find('.modal-title').text('Sửa mức độ hài lòng: ' + resp.message.name);
                        _frmstatisfy.find('input[name="name"]').val(resp.message.name).attr('class', 'form-control input-sm validate[required,ajax[StatisfyEditCheck]]');
                        _frmstatisfy.find('#status').val(resp.message.status).prop('checked', resp.message.status);
                        _frmstatisfy.find('.modal-footer .update').hide();
                        _frmstatisfy.find('.modal-footer .create').show();
                        _frmstatisfy.modal('show');
                    } else {
                        swal({title: 'Thông báo !', text: resp.message});
                    }
                });
            }
            if ($(this).is('.add')) {
                $.get(statisfyOptions.url + '/' + statisfyOptions.id + '/edit?stage=' + statisfyOptions.stage, function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        var _frmSource = $('#frm-source');
                        statisfyOptions.url = '/customer-statisfy';
                        statisfyOptions.id = '';
                        statisfyOptions.method = 'POST';
                        _frmSource.find('#validate-stage-for-x-name').val(resp.message.name);
                        _frmSource.find('#validate-stage-for-statisfy').val(resp.message._id);
                        _frmSource.find('.modal-title').text('Tạo tiêu chí thuộc mức độ: ' + resp.message.name);
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

    var bindSubmit = function () {
        $('#frm-statisfy form').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });

                if (status) {
                    _AjaxData(statisfyOptions.url + '/' + statisfyOptions.id + '?stage=' + statisfyOptions.stage,
                        statisfyOptions.method,
                        form.getData(),
                        function (resp) {
                            if (resp.code == 200) {
                                _.LoadPage(window.location.hash);
                            } else {
                                swal({title: 'Thông báo !', text: resp.message});
                            }
                        });
                } else {
                    form.on('submit', function (e) {
                        e.preventDefault();
                    });
                }
            }
        });

        $('#frm-source form').validationEngine('attach', {
            validateNonVisibleFields: true,
            autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                form.on('submit', function (e) {
                    e.preventDefault();
                });
                if (status) {
                    _AjaxData(sourceOptions.url + '/' + sourceOptions.id + '?stage=' + sourceOptions.stage,
                        sourceOptions.method,
                        form.getData(),
                        function (resp) {
                            if (resp.code == 200) {
                                _.LoadPage(window.location.hash);
                            } else {
                                swal({title: 'Thông báo !', text: resp.message});
                            }
                        });
                }
            }
        });
    };

    return {
        init: function () {
            $.validationEngineLanguage.allRules['StatisfyCheck'] = {
                "url": "/customer-statisfy/validate",
                "extraDataDynamic": ['#validate-statisfy-for-name'],
                "alertText": "* Tên nhóm này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $.validationEngineLanguage.allRules['StatisfyEditCheck'] = {
                "url": "/customer-statisfy/validate",
                "extraDataDynamic": ['#validate-statisfy-for-name', '#validate-statisfy-for-x-name'],
                "alertText": "* Tên nhóm này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $.validationEngineLanguage.allRules['StageCheck'] = {
                "url": "/customer-statisfy/validate?stage=1",
                "extraDataDynamic": ['#validate-stage-for-name', '#validate-stage-for-statisfy'],
                "alertText": "* Tiêu chí này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            $.validationEngineLanguage.allRules['StageEditCheck'] = {
                "url": "/customer-statisfy/validate?stage=1",
                "extraDataDynamic": ['#validate-stage-for-name', '#validate-stage-for-statisfy', '#validate-stage-for-x-name'],
                "alertText": "* Tiêu chí này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            bindClick();
            bindSubmit();

            configstatisfy($('#frm-statisfy'));
            configSource($('#frm-source'));
        },
        uncut: function () {
            $(document).off('click', '.statisfy-task.customer-source a');
            $(document).off('click', '.statisfy-task.customer-statisfy a');
            $(document).off('click', '#status');
            $('#frm-statisfy form').validationEngine('detach');
            $('#frm-source form').validationEngine('detach');
        }
    };
}(jQuery);