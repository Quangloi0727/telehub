var DFT = function ($) {
    var _keyword = 'asc';
    var _searchPath = {};

    var saveSearchData = function (obj) {
        //Lưu lại dữ liệu search
        if (_.has(obj, 'name')) {
            _searchPath.name = obj.name;
        }
        if (_.has(obj, 'company')) {
            _searchPath.company = obj.company;
        }
        if (_.has(obj, 'group')) {
            _searchPath.group = obj.group;
        }

        if (_.has(obj, 'maxsession')) {
            _searchPath.maxsession = obj.maxsession;
        }

        if (!_.isEqual(obj.status, '-1')) {
            _searchPath.status = obj.status;
        }

    }

    var bindClick = function () {
        $(document).on('click', '.zmdi-refresh', function () {
            //Reload lại trang
            _.LoadPage(window.location.hash);
        });

        $(document).on('click', '.apply-single', function () {
            //Thay đổi setting user
            var _id = $(this).attr('data-id');
            var self = $(this);
            //Bật dialog confirm
            swal({
                    title: _config.MESSAGE.USER_CHAT_SETTING.CONFIRM_APPLY,
                    text: _config.MESSAGE.USER_CHAT_SETTING.TEXT_CONFIRM_APPLY,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Có, chắc chắn !",
                    closeOnConfirm: false
                },
                function () {
                    var data = {value: self.closest('tr').find('#max_chat_session').val()};
                    _Ajax('/user-chat-settings/' + _id, 'PUT', [data], function (resp) {
                        swal({
                            title: 'Thành công',
                            text: _config.MESSAGE.USER_CHAT_SETTING.TEXT_APPLY_SUCCESS,
                            type: "success"
                        }, function () {
                            _.LoadPage(window.location.hash);
                        });
                    });
                });
        });

        $(document).on('click', '.apply-all', function () {
            //Thay đổi toàn bộ các user được tích
            var ids = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            var self = $(this);
            swal({
                    title: _config.MESSAGE.USER_CHAT_SETTING.CONFIRM_APPLY_ALL,
                    text: _config.MESSAGE.USER_CHAT_SETTING.TEXT_CONFIRM_APPLY_ALL,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Có, chắc chắn !",
                    closeOnConfirm: false
                },
                function () {
                    var data = {ids: _.compact(ids), value: self.closest('tr').find('#max_chat_session').val()};
                    _Ajax('/user-chat-settings/all', 'PUT', [{data: JSON.stringify(data)}], function (resp) {
                        swal({
                            title: 'Thành công',
                            text: _config.MESSAGE.USER_CHAT_SETTING.TEXT_APPLY_SUCCESS,
                            type: "success"
                        }, function () {
                            _.LoadPage(window.location.hash);
                        });
                    });
                });
        });

        $(document).on('click', '#btn-search', function () {
            //Click button search
            //Truyền các value search trong form và thay thế url
            _searchPath = {};
            if ($('#search_by_name').val().length > 0) {
                window.location.obj['name'] = $('#search_by_name').val();
            }
            else {
                delete  window.location.obj.name;
            }

            if ($('#search_by_company').val().length > 0) {
                window.location.obj['company'] = $('#search_by_company').val();
            }
            else {
                delete  window.location.obj.company;
            }

            if ($('#search_by_group').val().length > 0) {
                window.location.obj['group'] = $('#search_by_group').val()
            }
            else {
                delete  window.location.obj.group;
            }

            if ($('#search_by_max_session').val().length > 0) {
                window.location.obj['maxsession'] = $('#search_by_max_session').val()
            }
            else {
                delete  window.location.obj.maxsession;
            }

            if (!_.isEqual($('#search_by_status').val(), '-1')) {
                window.location.obj['status'] = $('#search_by_status').val();
            }
            else {
                delete  window.location.obj.status;
            }
            saveSearchData(window.location.obj);
            window.location.hash = newUrl('user-chat-settings', window.location.obj); //reload lại với url mới

        });
    };

    var bindSubmit = function () {
        //Show or hide delete button
        $(document).on('change', '.select-box-all', function () {
            //Chọn tất cả các bản ghi
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked")) {
                $('.apply-all').removeClass('hidden'); //hiện nút apply tất cả
            }
            else {
                $('.apply-all').addClass('hidden'); //ẩn nút apply tất cả
            }
        });

        $(document).on('change', '.select-box-cell', function () {
            //Chọn 1 bản ghi
            var x = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0) {
                $('.apply-all').removeClass('hidden'); //hiện nút apply tất cả
            }
            else {
                $('.apply-all').addClass('hidden'); //ẩn nút apply tất cả
            }
        });
    };

    return {
        init: function () {
            //Load các param search trên url
            if (_.has(window.location.obj, 'name')) _searchPath['name'] = window.location.obj['name'];
            if (_.has(window.location.obj, 'company')) _searchPath['company'] = window.location.obj['company'];
            if (_.has(window.location.obj, 'group')) _searchPath['group'] = window.location.obj['group'];
            if (_.has(window.location.obj, 'status')) _searchPath['status'] = window.location.obj['status'];
            if (_.has(window.location.obj, 'maxsession')) _searchPath['maxsession'] = window.location.obj['maxsession'];

            //Không có bản ghi phù hợp -> show thông báo
            if (isZeroList && window.location.search.length > 0) {
                swal({
                        title: "Thông báo",
                        text: "Không tìm thấy bản ghi phù hợp",
                        type: "warning",
                        showCancelButton: false,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Quay lại!",
                        closeOnConfirm: false
                    },
                    function () {
                        window.location.hash = 'user-chat-settings';
                    });
            }

            //Fill các param search trên url vào form
            if (_.has(_searchPath, 'name')) {
                if (!_.isEqual(_searchPath['name'], 'asc') && !_.isEqual(_searchPath['name'], 'desc')) {
                    $('#search_by_name').val(_searchPath['name']);
                }
                else {
                    _keyword = _searchPath['name'];
                }
            }
            if (_.has(_searchPath, 'company')) {
                if (!_.isEqual(_searchPath['company'].toLowerCase(), 'asc') && !_.isEqual(_searchPath['company'].toLowerCase(), 'desc')) {
                    $('#search_by_company').val(_searchPath['company']);
                }
                else {
                    _keyword = _searchPath['company'];
                }
            }
            if (_.has(_searchPath, 'group')) {
                if (!_.isEqual(_searchPath['group'], 'asc') && !_.isEqual(_searchPath['group'], 'desc')) {
                    $('#search_by_group').val(_searchPath['group']);
                }
                else {
                    _keyword = _searchPath['group'];
                }
            }
            if (_.has(_searchPath, 'status') && !_.isEqual(_searchPath['status'], 'asc') && !_.isEqual(_searchPath['status'], 'desc')) {
                $('#search_by_status').val(_searchPath['status']);
            }
            if (_.has(_searchPath, 'maxsession') && !_.isEqual(_searchPath['maxsession'], 'asc') && !_.isEqual(_searchPath['maxsession'], 'desc')) {
                if (!_.isEqual(_searchPath['maxsession'], 'asc') && !_.isEqual(_searchPath['maxsession'], 'desc')) {
                    $('#search_by_max_session').val(_searchPath['maxsession']);
                }
                else {
                    _keyword = _searchPath['maxsession'];
                }s
            }

            $('.selectpicker').selectpicker('refresh');
            bindClick();
            bindSubmit();
        },
        uncut: function () {
            $(document).off('click', '.apply-single');
            $(document).off('click', '.apply-all');
            $(document).off('click', '##btn-search');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);