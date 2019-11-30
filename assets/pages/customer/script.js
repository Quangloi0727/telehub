var DFT = function ($) {

    // Lấy tiêu chí tìm kiếm và truy vấn server
    var queryFilter = function () {
        var _data = _.pick($('#customer').serializeJSON(), _.identity);

        var listFilter = _.chain($('.column-display'))
            .map(function (el) {
                var fieldName = $(el).val().replace(['[]'], '');
                return $(el).is(':checked') && _.has(_data, fieldName) ? _.object([$(el).val()], [_data[fieldName]]) : null;
            })
            .compact()
            .reduce(function (memo, item) {
                memo[_.keys(item)] = _.values(item)[0];
                return memo;
            }, {})
            .value();

        var listSort = _.chain($('thead tr th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('data-field') ? $(el).attr('data-field') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        listSort = _.isEmpty(listSort) ? '' : '&sort=' + listSort[0];
        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        window.location.hash = newUrl(window.location.hash, listFilter) + listSort;
    };

    // Sự kiện click
    var bindClick = function () {
        // Thay đổi dữ liệu nguồn khách hàng
        $(document).on('change', '.source-display', function () {
            $('[data-field="' + 'source' + '"').toggleClass('hidden');
        });

        // Thay đổi cột dữ liệu
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

        // Xóa khách hàng
        $(document).on('click', '.btn-delete', function () {
            var id = $(this).attr('data-id');
            swal({
                    title: 'Cảnh báo !',
                    text: 'Bạn có chắc muốn xoá khách hàng này không ?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Có, chắc chắn !",
                    closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/customer/' + id, 'DELETE', {}, function (resp) {
                        if(resp.code == 200){
                            swal({title: 'Thành công', text: resp.message, type: 'success'}, function () {
                                _.LoadPage(window.location.hash);
                            });
                        }else if(resp.code == 500){
                            swal({title: 'Thất bại', text: resp.message, type: 'error'}, function () {
                                _.LoadPage(window.location.hash);
                            });
                        }
                    });
                }
            );
        });

        // Nút download file template mẫu
        $(document).on('click', '#download-excel', function(){
            window.open($(this).attr('data-url'));
        });

        // Xóa nhiều khách hàng đã chọn
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

        // Sự kiện nhấn phím enter khi tìm kiếm
        $('#customer').on('keyup', function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                //e.preventDefault();
                queryFilter();
            }
        });

        // Làm mới trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
    };

    // Sự kiện submit
    var bindSubmit = function () {
        // Xác nhận tạo mới nguồn
        $('#frm-source form').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
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

    var checkAddGroup = function () {
        var x = searchToObj();
        delete x['sort'];

        if (_.isEmpty(x)) {
            $('#btn-add-group').css('visibility', 'hidden');
        }
    }

    // Đưa dữ liệu tìm kiếm trên url về object
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

    // HTML thẻ phân trang
    var getPaging = function(paging, _url){
        var newPaging = [];
        if (paging.first) {
            newPaging.push({tag:'li', childs: [{
                tag:'a', attr: {href: paging.prelink + '?page=' + paging.first +  (_.isEmpty(_url) ? '' : '&' + _url) + '&count='+paging.totalResult}, content: '&laquo;'
            }]});
        }
        if (paging.previous) {
            newPaging.push({tag:'li', childs: [{
                tag:'a', attr: {href: paging.prelink + '?page=' + paging.previous +  (_.isEmpty(_url) ? '' : '&' + _url) + '&count='+paging.totalResult}, content: '&lsaquo;'
            }]});
        }
        for ( var i = 0; i < paging.range.length; i++ ) {
            if(paging.range[i] == paging.current){
                newPaging.push({tag:'li', attr: {class: 'active'}, childs: [{
                    tag:'a', content: paging.range[i]
                }]});
            }else{
                newPaging.push({tag:'li', childs: [{
                    tag:'a', attr: {href: paging.prelink+'?page='+ paging.range[i] +  (_.isEmpty(_url) ? '' : '&' + _url) + '&count='+paging.totalResult},content: paging.range[i]
                }]});
            }
        }
        if (paging.next) {
            newPaging.push({tag:'li', childs: [{
                tag:'a', attr: {href: paging.prelink + '?page=' + paging.next +  (_.isEmpty(_url) ? '' : '&' + _url) + '&count='+paging.totalResult}, content: '&rsaquo;'
            }]});
        }
        if (paging.last) {
            newPaging.push({tag:'li', childs: [{
                tag:'a', attr: {href: paging.prelink + '?page=' + paging.last +  (_.isEmpty(_url) ? '' : '&' + _url) + '&count='+paging.totalResult}, content: '&raquo;'
            }]});
        }

        return _.Tags(newPaging);
    }
    
    return {
        init: function () {
            // Đưa dữ liệu tìm kiếm trước đó vào input
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
                            if(el.chosen()) el.trigger("chosen:updated");
                            break;
                    }
                }
            });

            // Cấu hình chức năng phân trang
            if ($('.pagination')[0]) {
                var paramObj = $.deparam(window.location.href.split('?')[1] || '');
                delete paramObj.page;
                var _url = $.param(paramObj);

                $('.pagination a').each(function (i, v) {
                    $(v).attr('href',  $(v).attr('href') +  (_.isEmpty(_url) ? '' : '&' + _url));
                });

                var paginationLength = $('.pagination a').length;
                if(paginationLength){
                    var pageCount = $.deparam($('.pagination a')[paginationLength - 1].href.split('?')[1] || '').count;
                    if(!pageCount){
                        $('.pagination a').each(function (i, v) {
                            if(_.isEqual($(v).html(),'»')) {
                                $(v).empty();
                                $(v).append('<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...');
                            }
                        });
                        _Ajax('/customer?'+ _url, 'GET', {}, function (resp) {
                            if(resp.code == 200) {
                                $('.pagination').empty();
                                resp.message.prelink = '/#customer'
                                $('.pagination').append(getPaging(resp.message, _url));
                            }
                        });
                    }
                }
            }
            // Sắp xếp dữ liệu nếu có
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[data-field="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            // Cấu hình validation
            $.validationEngineLanguage.allRules['SourceCheck'] = {
                "url": "/customer-sources/validate",
                "extraData": "type=0",
                "extraDataDynamic": ['#validate-source-for-name'],
                "alertText": "* Tên nguồn này đã được sử dụng",
                "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            };

            checkAddGroup();
            // Thông báo khi không có kết quả tìm kiếm
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
            // Disable sự kiện sau khi đóng trang
            $(document).off('change', '.source-display');
            $(document).off('change', '.column-display');
            $(document).off('click', '.btn-filter');
            $(document).off('click', '.table-fix th');
            $(document).off('click', '.btn-delete');
            $(document).off('click', '#download-excel');
            $(document).off('click', '.btn-delete-all');
            $('#frm-source form').validationEngine('detach');
            $('#customer').unbind('keyup');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);