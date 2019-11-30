/**
 * Created by luongvanlam on 1/13/16.
 */
var DFT = function ($) {

    // ------------------- Helper method ----------------------
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

        _Ajax(window.location.href, 'POST', _order, function (resp) {
        });
    };

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

    //==========================================================

    var bindClick = function () {
        $(document).on('change', '.select-box-all', function () {
            //Todo: Select tất cả các bản ghi
            var checked = $(this).is(':checked');
            $('.select-box-cell').prop('checked', checked);

            if (checked) {
                $('#li-hidden').removeClass('hidden');
            } else {
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
            deleteCollection('/kpi-mark-content/' + _id, {});
        });

        $(document).on('click', '#btn-search', function () {
            //Todo: Tìm kiếm bản ghi
            queryFilter();
        });

        $(document).on('click', '#new-content', function () {
            //Todo: Chuyển trang thêm mới tiêu chí
            window.location.hash = 'kpi-mark-content/new?collection=' + window.location.obj.collection;
        });

        $(document).on('click', '#edit-content', function(){
            //Sửa tiêu chí
            var dataId = $(this).attr('data-id');
            $.get('/kpi-mark-content?collection=' + window.location.obj.collection, 'GET', function(resp){
                if (resp.code == 500){
                    swal({title: 'Thông báo !', text: resp.message});
                }
                else{
                    window.location.hash = 'kpi-mark-content/' + dataId + '/edit?collection='+window.location.obj.collection;
                }
            });

        });

        $('#searchForm').bind('keyup', function (e) {
            if (e.keyCode == 13) queryFilter();
        });
    };

    var queryFilter = function () {
        var filter = _.chain($('.searchColumn'))
            .reduce(function (memo, el) {
                if (!_.isEqual($(el).val(), '')) memo[el.name] = $(el).val();
                return memo;
            }, {}).value();

        filter['collection'] = window.location.obj.collection;
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
        _.each(_.allKeys(_config.MESSAGE.KPI_MARK_CONTENT), function (item) {
            $('.' + item).html(_config.MESSAGE.KPI_MARK_CONTENT[item]);
        });
    };

    return {
        init: function () {
            var keys = _.keys(window.location.obj);
            if (kpi && keys.length > 1 && !_.isEqual(JSON.stringify(keys), ["collection"])) {
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
            bindTextValue();

            $("#table-kpi-content tbody")
                .sortable({
                    helper: fixHelperModified,
                    stop: updateIndex,
                    distance: 5,
                    opacity: 0.6,
                    cursor: 'move'
                }).disableSelection();
        },
        uncut: function(){
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-search');
            $(document).off('click', '#new-content');
            $(document).off('click', '#edit-content');
            $('#searchForm').unbind('keyup');
        }
    };
}(jQuery);