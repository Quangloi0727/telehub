/**
 * Created by luongvanlam on 1/13/16.
 */
var DFT = function ($) {
    var bindClick = function () {
        //$(document).on('click', '.filter', function () {
        //    var $this = $(this);
        //    switch ($this.attr('data-sort')) {
        //        case 'none':
        //            $this.toggleAttr('data-sort', 'asc');
        //            break;
        //        case 'asc':
        //            $this.toggleAttr('data-sort', 'desc');
        //            break;
        //        case 'desc':
        //            $this.toggleAttr('data-sort', 'none');
        //            break;
        //    }
        //    $this.siblings().toggleAttr('data-sort', 'none');
        //    queryFilter();
        //});
        //
        //$(document).on('click', '#btn-search', function () {
        //    queryFilter();
        //});

        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        //$('#searchForm').bind('keyup', function (e) {
        //    if (e.keyCode == 13) queryFilter();
        //});
    };

    var bindSubmit = function () {
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

        //window.location.hash = newUrl(window.location.pathname.replace('#', ''), filter) + sort + paging;
    };

    var bindTextValue = function () {
        _.each(_.allKeys(_config.MESSAGE.KPI_MARK), function (item) {
            $('.' + item).html(_config.MESSAGE.KPI_MARK[item]);
        });
    };

    return {
        init: function () {
            if (datas && Object.keys(window.location.obj).length > 0) {
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
            $(document).off('change', '#kpitype');
            $('#searchForm').unbind('keyup');
            $('#frm-kpi form').validationEngine('detach');
        }
    };
}(jQuery);