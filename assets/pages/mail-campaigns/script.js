var DFT = function ($) {
    var queryFilter = function () {
        var _data = _.pick($('#mail-campaigns').serializeJSON(), _.identity);
        //console.log(_data);
        //var listFilter = _.chain($('.column-display'))
        //    .map(function (el) {
        //        return $(el).is(':checked') && _.has(_data, $(el).val()) ? _.object([$(el).val()], [_data[$(el).val()]]) : null;
        //    })
        //    .compact()
        //    .reduce(function (memo, item) {
        //        memo[_.keys(item)] = _.values(item)[0];
        //        return memo;
        //    }, {})
        //    .value();
        var listSort = _.chain($('#mail-campaigns thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).data('field') ? $(el).data('field') + ':' + $(el).data('sort') : '';
            })
            .compact()
            .value();

        listSort = _.isEmpty(listSort) ? '' : '&sort=' + listSort[0];

        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        window.location.hash = newUrl(window.location.hash, _data) + listSort + paging;
    };

    var bindClick = function () {
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        $(document).on('click', '#mail-campaigns .btn-filter', function () {
            queryFilter();
        });

        $(document).on('click', '#mail-campaigns .table-fix th', function () {
            var $this = $(this);
            if (_.isUndefined($this.data('field'))) return false;
            switch ($this.attr('data-sort')) {
                case 'none':
                    $this.attr('data-sort', 'asc');
                    break;
                case 'asc':
                    $this.attr('data-sort', 'desc');
                    break;
                case 'desc':
                    $this.attr('data-sort', 'none');
                    break;
            }
            $this.siblings().attr('data-sort', 'none');
            queryFilter();
        });

        //$(document).on('click', '.btn-delete', function () {
        //    var id = $(this).attr('data-id');
        //    swal({
        //            title: 'Cảnh báo !',
        //            text: 'Bạn có chắc muốn xoá khách hàng này không ?',
        //            type: 'warning',
        //            showCancelButton: true,
        //            confirmButtonColor: "#DD6B55",
        //            confirmButtonText: "Có, chắc chắn !",
        //            closeOnConfirm: false
        //        },
        //        function () {
        //            _AjaxObject('/customer/' + id, 'DELETE', {}, function (resp) {
        //                swal({title: 'Thành công', text: resp.message, type: 'success'}, function () {
        //                    _.LoadPage(window.location.hash);
        //                });
        //            });
        //        }
        //    );
        //});

    };

    //var bindSubmit = function () {
    //    $('#frm-source form').validationEngine('attach', {
    //        validateNonVisibleFields: true, autoPositionUpdate: true,
    //        onValidationComplete: function (form, status) {
    //            if (status) {
    //                var form = $('#frm-source');
    //                var data = {};
    //                data.name = form.find("input[name='name']").val();
    //                data.type = form.find("input[name='type']").val();
    //                data.status = form.find("input[type='checkbox']").is(':checked') ? 1 : 0;
    //                data.query = JSON.stringify(searchToObj());
    //
    //                $.post("/customer-sources", data, function (resp) {
    //                    _.isEqual(resp.code, 200) ? swal({
    //                        title: 'Thành công',
    //                        text: resp.message,
    //                        type: 'success'
    //                    }, function () {
    //                        _.LoadPage(window.location.hash);
    //                    }) : swal({title: 'Thông báo !', text: resp.message});
    //                });
    //            }
    //        }
    //    });
    //};

    //$(document).on('click', '.btn-delete-all', function () {
    //    var ids = _.chain($('input:checkbox.check-list:checked')).map(function (e) {
    //        return $(e).attr('id');
    //    }).value();
    //    if (_.isEmpty(ids)) return false;
    //    swal({
    //            title: 'Cảnh báo !',
    //            text: 'Bạn có chắc muốn xoá toàn bộ khách hàng đã chọn không ?',
    //            type: 'warning',
    //            showCancelButton: true,
    //            confirmButtonColor: "#DD6B55",
    //            confirmButtonText: "Có, chắc chắn !",
    //            closeOnConfirm: false
    //        },
    //        function () {
    //            _AjaxObject('/customer/all?ids=' + ids.join(), 'DELETE', {}, function (resp) {
    //                swal({title: 'Thành công', text: resp.message, type: 'success'}, function () {
    //                    _.LoadPage(window.location.hash);
    //                });
    //            });
    //        }
    //    );
    //});

    return {
        init: function () {
            _.each(window.location.obj, function (v, k) {
                var el = $('#edit_' + k.replace(['[]'], ''));
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
            if ($('.pagination')[0]) {
                delete window.location.obj.page;
                var _url = $.param(window.location.obj);
                $('.pagination a').each(function (i, v) {
                    $(v).attr('href', $(v).attr('href') + '&' + _url);
                });
            }
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[data-field="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            _socket.on('MailCampaignsUpdated', function (c) { 
                $('#completed-' + c._id).text(c.completed);
            });
            //if ($('#mail-campaigns tbody tr').length == 1) {
            //    delete window.location.obj['sort'];
            //    if (_.isEmpty(window.location.obj)) {
            //        $('<div class="text-center p-20">Chưa có khách hàng nào trong cơ sở dữ liệu !</div>').insertBefore('div.paginate');
            //    } else {
            //        $('<div class="text-center p-20">Không có khách hàng nào đáp ứng điều kiện tìm kiếm !</div>').insertBefore('div.paginate');
            //    }
            //}
            bindClick();
            //bindSubmit();
            //bindDeleteAll();
            //_Ajax('/mail-campaigns', 'GET', [], function (resp) {
            //    console.log(resp)
            //}); 
        },
        uncut: function () {
            $(document).off('click', '#mail-campaigns .table-fix th');
            $(document).off('click', '#mail-campaigns .btn-filter');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);