
var DFT = function ($) {

    var deleteOrg = function () {
        var ids = $.map($('.select-box-cell'), function (n, i) {
            return $(n).is(":checked") ? $(n).attr('data-id') : '';
        });
        swal({
                title: _config.MESSAGE.MAIL_TEMPLATE_CAT.DELETE_TITLE,
                text: _config.MESSAGE.MAIL_TEMPLATE_CAT.DELETE_TEXT,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Có, chắc chắn !",
                closeOnConfirm: false
            },
            function () {
                _Ajax('/mail-template-categories/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        swal({
                                title: _config.MESSAGE.MAIL_TEMPLATE_CAT.MSG_SUCCESS_TITLE,
                                text: _config.MESSAGE.MAIL_TEMPLATE_CAT.MSG_DELETE,
                                type: "success"
                            },
                            function () {
                                _.LoadPage(window.location.hash);
                            });
                    } else {
                        swal({title: _config.MESSAGE.MAIL_TEMPLATE_CAT.MSG_FAIL_TITLE, text: resp.message});
                    }
                });
            });
    };



    var bindClick = function () {
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        $(document).on('change', '.select-box-all', function(){
            //$('.select-box-all').change(function () {
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked") && $('.select-box-cell').length > 0) {
                $('#li-hidden').removeClass('hidden');
                if (_.isEqual(_.compact(x).length, $('.select-box-cell').length)) {
                    $('.select-box-all').prop('checked', true);
                } else {
                    $('.select-box-all').prop('checked', false);
                }
            }
            else {
                $('#li-hidden').addClass('hidden');
            }
        });

        $(document).on('change', '.select-box-cell', function () {
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

        $(document).on('click', '#btn-delSelection', deleteOrg);

        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('company-id');
            var companyName = $(this).attr('company-name');
            swal({
                title: "Bạn muốn xoá bản ghi này ?",
                text: "",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Có, chắc chắn !",
                closeOnConfirm: false
            }, function () {
                _AjaxObject('/mail-template-categories/' + _id, 'DELETE', {}, function (resp) {
                    if (_.isEqual(resp.code, 200)) {
                        swal({
                                title: _config.MESSAGE.MAIL_TEMPLATE_CAT.MSG_SUCCESS_TITLE,
                                text: _config.MESSAGE.MAIL_TEMPLATE_CAT.MSG_DELETE,
                                type: "success"
                            },
                            function () {
                                _.LoadPage(window.location.hash);
                            });
                    } else {
                        swal({title: _config.MESSAGE.MAIL_TEMPLATE_CAT.MSG_FAIL_TITLE, text: resp.message});
                    }
                });
            });
        });

        $(document).on('click', '.filter', function () {
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
            queryFilter();
        });

        $('#searchForm').bind('keydown', function (e) {
            if (e.keyCode == 13) queryFilter();
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
        $('#txt_category_name').html(_config.MESSAGE.MAIL_TEMPLATE_CAT.LIST_NAME_COL_LABEL);
        $('#txt_category_status').html(_config.MESSAGE.MAIL_TEMPLATE_CAT.LIST_STATUS_COL_LABEL);
        $('#txt_category_actions').html(_config.MESSAGE.MAIL_TEMPLATE_CAT.LIST_ACTION_COL_LABEL);
        $('#txt_category_category').html(_config.MESSAGE.MAIL_TEMPLATE_CAT.LIST_CATEGORY_COL_LABEL);
        $('#txt_category_company').html(_config.MESSAGE.MAIL_TEMPLATE_CAT.LIST_COMPANY_COL_LABEL);
    };

    return {
        init: function () {
            if (isNullCategories && Object.keys(window.location.obj).length > 0) {
                swal({
                    title: _config.MESSAGE.MAIL_TEMPLATE_CAT.SEARCH_NOT_FOUND_TITLE,
                    text: _config.MESSAGE.MAIL_TEMPLATE_CAT.SEARCH_NOT_FOUND_TEXT,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Quay lại!",
                    closeOnConfirm: true
                }, function () {
                    window.history.back();
                });
            }

            // Đổ dữ liệu vào searchInput
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
        },
        uncut : function(){
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#btn-delSelection', deleteOrg);
            $(document).off('click', '.btn-remove');
            $(document).off('click', '.filter');
            $(document).off('click', '#btn-search');
            $('#searchForm').unbind('keydown');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);