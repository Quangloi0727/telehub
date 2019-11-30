var DFT = function ($) {

    // Lấy dữ liệu tìm kiếm và truy vấn server
    var queryFilter = function () {
        var _data = _.pick($('#customer').serializeJSON(), _.identity);
        var listFilter = _.chain($('.column-display'))
            .map(function (el) {
                return $(el).is(':checked') && _.has(_data, $(el).val()) ? _.object([$(el).val()], [_data[$(el).val()]]) : null;
            })
            .compact()
            .reduce(function (memo, item) {
                memo[_.keys(item)] = _.values(item)[0];
                return memo;
            }, {})
            .value();
        var listSort = _.chain($('#customer thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('data-field')  ? $(el).attr('data-field') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        listSort = _.isEmpty(listSort) ? '' : '&sort=' + listSort[0];
        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        window.location.hash = newUrl(window.location.hash, listFilter) + listSort + paging;
    };

    // Sự kiện click
    var bindClick = function () {
        // ẩn/hiện trường thông tin khách hàng
        $(document).on('change', '.column-display', function () {
            var self = $(this);
            _Ajax('/customer-fields/' + self.attr('data-id'), 'PUT', [{isDefault: Number(self.is(':checked'))}], function (resp) {
                $('[data-field="' + self.val() + '"').toggleClass('hidden');
            });
        });

        // Click nút Lọc/Tìm kiếm
        $(document).on('click', '.btn-filter', function () {
            queryFilter();
        });

        // Làm mới lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // Sắp xếp dữ liệu
        $(document).on('click', '.table-fix th', function () {
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

        // Nhấn phìm enter khi tìm kiếm
        $('#searchForm').bind('keyup', function (e) {
            if (e.keyCode == 13) queryFilter();
        });
    };

    // Sự kiện submit
    var bindSubmit = function () {
        // Xác nhận tạo mới nguồn
        $('#frm-source form').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            validationEventTrigger:'keyup',
            onValidationComplete: function (form, status) {
                if (status) {
                    var form = $('#frm-source');
                    var data = {};
                    data.name = form.find("input[name='name']").val();
                    data.type = form.find("input[name='type']").val();
                    data.status = form.find("input[type='checkbox']").is(':checked') ? 1 : 0;
                    data.query = JSON.stringify(searchToObj());

                    $.post("/customer-sources", data, function (resp) {
                        _.isEqual(resp.code, 200) ? swal({
                            title: 'Thành công',
                            text: resp.message,
                            type: 'success'
                        }, function () {
                            _.LoadPage(window.location.hash);
                        }) : swal({title: 'Thông báo !', text: resp.message});
                    });
                }
            }
        });
    };

    // Xóa tất cả phần tử đã chọn
    $(document).on('click', '.btn-delete-all', function () {
        var ids = _.chain($('input:checkbox.check-list:checked')).map(function (e) {
            return $(e).attr('id');
        }).value();
        if (_.isEmpty(ids)) return false;
        swal({
                title: 'Cảnh báo !',
                text: 'Bạn có chắc muốn xoá toàn bộ khách hàng đã chọn không ?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Có, chắc chắn !",
                closeOnConfirm: false
            },
            function () {
                _AjaxObject('/customer/all?ids=' + ids.join(), 'DELETE', {}, function (resp) {
                    swal({title: 'Thành công', text: resp.message, type: 'success'}, function () {
                        _.LoadPage(window.location.hash);
                    });
                });
            }
        );
    });

    var checkAddGroup = function () {
        var x = searchToObj();
        delete x['sort'];

        if (_.isEmpty(x)) {
            $('#btn-add-group').css('visibility', 'hidden');
        }
    }

    // Đưa dữ liệu tìm kiếm ở url về object
    var searchToObj = function () {
        var pairs = window.location.search.substring(1).split("&"),
            obj = {},
            pair,
            i;

        for (i in pairs) {
            if (pairs[i] === "") continue;

            pair = pairs[i].split("=");
            obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        //console.log(obj);
        return obj;
    }
    
    return {
        init: function () {
            // Đưa tiêu chí tìm kiếm lên giao diện
            _.each($.deparam(window.location.hash.split('?')[1] || ''), function (v, k) {
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

            // Cấu hình phân trang
            if ($('.pagination')[0]) {
                delete window.location.obj.page;
                var _url = $.param(window.location.obj);
                $('.pagination a').each(function (i, v) {
                    $(v).attr('href', $(v).attr('href') + '&' + _url);
                });
            }

            // Cấu hình sắp xếp dữ liệu
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[data-field="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            // Cấu hình validaton
            $.validationEngineLanguage.allRules['SourceCheck'] = {
                "url": "/customer-sources/validate",
                "extraData": "type=0",
                "extraDataDynamic": ['#validate-source-for-name'],
                "alertText": "* Tên nguồn này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };
            checkAddGroup();

            // Thông báo nếu không tìm thấy dữ liệu
            if ($('#customer tbody tr').length == 1) {
                delete window.location.obj['sort'];
                if (_.isEmpty(window.location.obj)) {
                    $('<div class="text-center p-20">Chưa có khách hàng nào trong cơ sở dữ liệu !</div>').insertBefore('div.paginate');
                } else {
                    $('<div class="text-center p-20">Không có khách hàng nào đáp ứng điều kiện tìm kiếm !</div>').insertBefore('div.paginate');
                }
            }
            bindClick();
            bindSubmit();
            //bindDeleteAll();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('change', '.column-display');
            $(document).off('click', '.btn-filter');
            $(document).off('click', '.table-fix th');
            $(document).off('click', '.btn-delete-all');
            $('#searchForm').unbind('keyup');
            $('#frm-source form').validationEngine('detach');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);