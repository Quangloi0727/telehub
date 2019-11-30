var DFT = function ($) {
    var _keyword = 'asc';
    var _searchPath = {};

    var saveSearchData = function (obj) {
        //Lưu data search theo param
        if (_.has(obj, 'skillName')) {
            _searchPath.skillName = obj.skillName;
        }
        _searchPath.status = obj.status;
    }

    var bindClick = function () {
        $(document).on('click', '.zmdi-refresh', function(){
            //Click vào nút refresh
            _.LoadPage(window.location.hash);
        });

        $(document).on('click', '.btn-remove', function () {
            //Xóa bản ghi
            var _id = $(this).attr('data-id');
            swal({
                    title: _config.MESSAGE.SKILL.CONFIRM_DELETE_SKILL,
                    text: _config.MESSAGE.SKILL.TEXT_CONFIRM_DELETE_SKILL,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/skills-mail/' + _id, 'DELETE', {}, function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.SKILL.TEXT_SUCCESS_DELETE_SKILL, type: "success"}, function () {
                            _.LoadPage(window.location.hash);
                        });
                    });
                });
        });

        $(document).on('click', '#btn-delSelection', function () {
            //Xóa các bản ghi được đánh dấu
            var ids = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            swal({
                    title: _config.MESSAGE.SKILL.CONFIRM_DELETE_MANY_SKILL,
                    text: _config.MESSAGE.SKILL.TEXT_CONFIRM_DELETE_MANY_SKILL,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/skills-mail/all', 'DELETE', [
                        {ids: _.compact(ids)}
                    ], function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.SKILL.TEXT_SUCCESS_DELETE_MANY_SKILL, type: "success"}, function () {
                            _.LoadPage(window.location.hash);
                        });
                    });
                });
        });

        $(document).on('click', '#btn-search', function () {
            //Click vào button search
            //Loại bỏ các param filter không nhập trong các text box
            _searchPath = {};
            if ($('#search_field_skillName').val().length > 0) {
                window.location.obj['skillName'] = $('#search_field_skillName').val();
            }
            else {
                delete  window.location.obj.skillName;
            }

            if ($('#search_field_company').val().length > 0) {
                window.location.obj['company'] = $('#search_field_company').val();
            }
            else {
                delete  window.location.obj.company;
            }

            if (!_.isEqual($('#search_field_status').val(), '-1')) {
                window.location.obj['status'] = $('#search_field_status').val();
            }
            else {
                delete  window.location.obj.status;
            }

            saveSearchData(window.location.obj);
            window.location.hash = newUrl('skills-mail', window.location.obj);
        });
    };

    var bindSubmit = function () {
        //Show or hide delete button
        $(document).on('change', '.select-box-all', function () {
            //Chọn tất cả các bản ghi
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked")) {
                $('#li-hidden').removeClass('hidden');
            }
            else {
                $('#li-hidden').addClass('hidden');
            }
        });

        $(document).on('change', '.select-box-cell', function () {
            //Chọn 1 bản ghi
            var x = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0) {
                $('#li-hidden').removeClass('hidden');
            }
            else {
                $('#li-hidden').addClass('hidden');
            }
        });
    };

    return {
        init: function () {
            //Load data search từ url vào obj
            if (_.has(window.location.obj, 'skillName')) _searchPath['skillName'] = window.location.obj['skillName'];
            if (_.has(window.location.obj, 'status')) _searchPath['status'] = window.location.obj['status'];
            if (_.has(window.location.obj, 'company')) _searchPath['company'] = window.location.obj['company'];

            //Nếu không có bản ghi phù hợp
            if (isZeroList && window.location.search.length > 0) {
                swal({
                        title: "Thông báo",
                        text: "Không tìm thấy bản ghi phù hợp",
                        type: "warning", showCancelButton: false, confirmButtonColor: "#DD6B55", confirmButtonText: "Quay lại!", closeOnConfirm: false
                    },
                    function () {
                        window.history.back();
                    });
            }
            if (_.has(_searchPath, 'skillName')) {
                if (!_.isEqual(_searchPath['skillName'], 'asc') && !_.isEqual(_searchPath['skillName'], 'desc')) {
                    $('#search_field_skillName').val(_searchPath['skillName']);
                }
                else {
                    _keyword = _searchPath['skillName'];
                }
            }

            if (_.has(_searchPath, 'company')) {
                if (!_.isEqual(_searchPath['company'], 'asc') && !_.isEqual(_searchPath['company'], 'desc')) {
                    $('#search_field_company').val(_searchPath['company']);
                }
                else {
                    _keyword = _searchPath['company'];
                }
            }
            if (_.has(_searchPath, 'status') && !_.isEqual(_searchPath['status'], 'asc') && !_.isEqual(_searchPath['status'], 'desc')) {
                $('#search_field_status').val(_searchPath['status']);
            }
            $('.selectpicker').selectpicker('refresh');
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '#btn-search');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);