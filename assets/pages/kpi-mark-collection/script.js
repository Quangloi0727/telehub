/**
 * Created by luongvanlam on 1/13/16.
 */
var DFT = function ($) {

    var deleteCollection = function (url, obj) {
        swal({
            title: 'Xoá các bộ dữ liệu đã chọn',
            text: 'Bạn có muốn xoá dữ liệu này hay không',
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Có, chắc chắn !",
            closeOnConfirm: false
        }, function () {
            _AjaxObject(url, 'DELETE', obj, function (resp) {
                if (_.isEqual(resp.code, 200)) {
                    swal({
                        title: 'Xoá thành công',
                        text: '',
                        type: "success"
                    }, function () {
                        window.location.hash = 'kpi-mark-collection';
                    });
                } else {
                    swal({title: 'Đã có lỗi xảy ra', text: resp.message});
                }
            });
        });
    };

    var bindClick = function () {
        $(document).on('change', '.select-box-all', function () {
            //Todo: Select tất cả các bản ghi
            var checked = $(this).is(':checked');
            $('.select-box-cell').prop('checked', checked);

            if (checked){
                $('#li-hidden').removeClass('hidden');
            }else{
                $('#li-hidden').addClass('hidden');
            }
        });

        $(document).on('change', '.select-box-cell', function () {
            //Todo: Select một bản ghi
            var x = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0) {
                $('#li-hidden').removeClass('hidden');
                if (_.isEqual(_.compact(x).length, $('.select-box-cell').length)) {
                    $('.select-box-all').prop('checked', true);
                } else {
                    $('.select-box-all').prop('checked', false);
                }
            }
            else {
                $('#li-hidden').addClass('hidden');
                $('.select-box-all').prop('checked', false);
            }
        });

        $(document).on('click', '#btn-delSelection', function () {
            //Todo: Xóa các bản ghi được đánh dấu
            var ids = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            var str = _.compact(ids).join('-');

            deleteCollection('/kpi-mark-collection/' + str);
        });

        $(document).on('click', '.btn-remove', function () {
            //Todo: Xóa bản ghi được chỉ định
            var _id = $(this).attr('data-id');
            deleteCollection('/kpi-mark-collection/' + _id, {});
        });

        $(document).on('click', '.filter', function () {
            //Todo: Sort bản ghi
            var $this = $(this);
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

        $(document).on('click', '#btn-search', function () {
            //Todo: Lọc bản ghi
            queryFilter();
        });

        $(document).on('click', '#add-new-kpi-collection', function () {
            //Todo: Show form tạo mới bộ tiêu chí
            var _form = $('#frm-kpi');
            _form.find('.modal-title').text(_config.MESSAGE.KPI_MARK.KPI_COLLECTION_NEW);
            _form.find('input[name="name"]').attr('class', 'form-control input-sm validate[required,ajax[KPINewCheck]]');
            _form.find('input[name="name"]').val('');
            _form.find('.corekpi').show();
            _form.find('input[name="status"]').attr('checked', true);
            _form.find('select[name="type"]').val('0');
            _form.find('#cId').val('');
            _form.modal('show');

            $('.selectpicker').selectpicker('refresh');
        });

        $(document).on('click', '#edit-collection', function () {
            //Todo: Sửa bộ tiêu chí
            var dataId = $(this).attr('data-id');
            var checked = $(this).attr('data-status') === '1';
            var dataName = $(this).attr('data-name');
            var type = $(this).attr('data-type');


            var _form = $('#frm-kpi');
            _form.find('.modal-title').text(_config.MESSAGE.KPI_MARK.KPI_COLLECTION_EDIT);
            _form.find('input[name="name"]').attr('class', 'form-control input-sm validate[required,ajax[KPIEditCheck]]');
            _form.find('input[name="name"]').val(dataName);
            _form.find('.corekpi').hide();
            _form.find('input[name="status"]').attr('checked', checked);
            _form.find('select[name="type"]').val(type);
            _form.find('#cId').val(dataId);
            _form.modal('show');

            $('.selectpicker').selectpicker('refresh');
            //$('.tag-select').trigger("chosen:updated");
        });

        $(document).on('click', '.zmdi-refresh', function(){
            //Todo: Load lại trang
            _.LoadPage(window.location.hash);
        });

        $('#searchForm').bind('keyup', function (e) {
            if (e.keyCode == 13) queryFilter();
        });
    };

    var bindSubmit = function () {
        //Todo: Validate bản ghi có hợp lệ không
        //Nếu có, gửi request tạo bản ghi lên server
        $('#frm-kpi form').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                var currentId = $('#cId').val();
                if (status) {
                    _AjaxData('/kpi-mark-collection?currentId=' + currentId, 'POST', form.getData(), function (resp) {
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

    var queryFilter = function () {
        var filter = _.chain($('.searchColumn'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();

        var sort = _.chain($('thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('sortName') ? $(el).attr('sortName') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        sort = _.isEmpty(sort) || _.isEqual(sort.length, 0) ? '' : '&sort=' + sort[0];
        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';

        window.location.hash = newUrl(window.location.hash, filter) + sort + paging;
    };

    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.KPI_MARK), function (item) {
            $('.' + item).html(_config.MESSAGE.KPI_MARK[item]);
        });
    };

    var hideModal = function (isEdit) {
        var _form = $('#frm-kpi');

        _form.on('hidden.bs.modal', function () {
            _form.find('form').validationEngine('hide')[0].reset();
            _form.find('.modal-title').text(_config.MESSAGE.KPI_MARK.KPI_COLLECTION_NEW);
        });
    };

    return {
        init: function () {
            if (kpi && Object.keys(window.location.obj).length > 0) {
                swal({
                    title: 'Không tìm thấy kết quả với khoá tìm kiếm',
                    text: '',
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Quay lại!",
                    closeOnConfirm: true
                }, function () {
                    window.history.back();
                });
            }

            //Điều kiện validate
            $.validationEngineLanguage.allRules['KPINewCheck'] = {
                "url": "/kpi-mark-collection/validate",
                "extraDataDynamic": ['#name'],
                "alertText": "* Tên nhóm này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            $.validationEngineLanguage.allRules['KPIEditCheck'] = {
                "url": "/kpi-mark-collection/validate",
                "extraDataDynamic": ['#name', '#cId'],
                "alertText": "* Tên nhóm này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            _.each(window.location.obj, function (v, k) {
                var el = $('#search_' + k.replace(['[]'], ''));
                if (el[0]) {
                    switch (el.prop('tagName')) {
                        case 'INPUT':
                            el.val(v);
                            break;
                        case 'SELECT':
                            el.val(v);
                            if (el.is('.selectpicker')) el.selectpicker('refresh');
                            break;
                    }
                }
            });

            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[sortName="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            if ($('.pagination')[0]) {
                delete window.location.obj.page;
                var _url = $.param(window.location.obj);
                $('.pagination a').each(function (i, v) {
                    $(v).attr('href', $(v).attr('href') + '&' + _url);
                });
            }

            bindClick();
            bindSubmit();
            bindTextValue();
            hideModal();

        },
        uncut: function(){
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '.btn-remove');
            $(document).off('click', '.filter');
            $(document).off('click', '#btn-search');
            $(document).off('click', '#add-new-kpi-collection');
            $(document).off('click', '#edit-collection');
            $('#searchForm').unbind('keyup');
            $('#frm-kpi form').validationEngine('detach');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);