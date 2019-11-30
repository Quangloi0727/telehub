var DFT = function ($) {
    var _keyword = 'asc';
    var _searchPath = {};

    var switchSortType = function (type) {
        //Thay đổi param sort
        _keyword = _.isEqual(_keyword, 'asc') ? 'desc' : 'asc';
        window.location.hash = '#skills?' + type + "=" + _keyword;
    };

    var saveSearchData = function (obj) {
        //Lưu data search theo param
        if (_.has(obj, 'skillName')) {
            _searchPath.skillName = obj.skillName;
        }

        if (_.has(obj, 'idCompany')) {
            _searchPath.idCompany = obj.idCompany;
        }

        if (_.has(obj, 'alarmDurHigh')) {
            _searchPath.alarmDurHigh = obj.alarmDurHigh;
        }
        if (_.has(obj, 'alarmDurHigh')) {
            _searchPath.alarmDurLow = obj.alarmDurLow;
        }

        if (!_.isEqual(obj.status, '-1')) {
            _searchPath.status = obj.status;
        }

        if (!_.isEqual(obj.recordingState, '-1')) {
            _searchPath.recordingState = obj.recordingState;
        }
    };

    var queryFilter = function(){
        //Bắt đầu filter
        //Loại bỏ các param filter không nhập trong các text box
        _searchPath = {};
        if ($('#search_field_skillName').val().length > 0) {
            window.location.obj['skillName'] = $('#search_field_skillName').val();
        }
        else {
            delete  window.location.obj.skillName;
        }

        if ($('#search_field_idCompany').val().length > 0) {
            window.location.obj['idCompany'] = $('#search_field_idCompany').val();
        }
        else {
            delete  window.location.obj.idCompany;
        }

        if ($('#search_field_skillDurHigh').val().length > 0) {
            window.location.obj['alarmDurHigh'] = $('#search_field_skillDurHigh').val();
        }
        else {
            delete  window.location.obj.alarmDurHigh;
        }

        if ($('#search_field_skillDurLow').val().length > 0) {
            window.location.obj['alarmDurLow'] = $('#search_field_skillDurLow').val()
        }
        else {
            delete  window.location.obj.alarmDurLow;
        }

        if (!_.isEqual($('#search_field_status').val(), '-1')) {
            window.location.obj['status'] = $('#search_field_status').val();
        }
        else {
            delete  window.location.obj.status;
        }

        if (!_.isEqual($('#search_field_recordState').val(), '-1')) {
            window.location.obj['recordingState'] = $('#search_field_recordState').val();
        }
        else {
            delete  window.location.obj.recordingState;
        }

        saveSearchData(window.location.obj); //Lưu lại data search
        window.location.hash = newUrl('skills/search', window.location.obj); //reload lại trang với data search
    };

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
                    _AjaxObject('/skills/' + _id, 'DELETE', {}, function (resp) {
                        var notDeletes = resp.skills;
                        //Kĩ năng đang được sử dụng thì không được xóa
                        if (notDeletes.length == 0) {
                            swal({title: 'Thành công', text: _config.MESSAGE.SKILL.TEXT_SUCCESS_DELETE_MANY_SKILL, type: "success"});
                            _.LoadPage(window.location.hash);
                        } else {
                            var failProfile = " ";
                            _.each(notDeletes, function (el, i) {
                                failProfile += el.skillName + ", ";
                            });
                            swal({title: 'Thất bại', text: 'Kỹ năng đang được sử dụng : ' + failProfile, type: "warning"});
                            _.LoadPage(window.location.hash);
                        }
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
                    _Ajax('/skills/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        var notDeletes = resp.skills;
                        //Kĩ năng đang được sử dụng thì không được xóa
                        if (notDeletes.length == 0) {
                            swal({title: 'Thành công', text: _config.MESSAGE.SKILL.TEXT_SUCCESS_DELETE_MANY_SKILL, type: "success"});
                            _.LoadPage(window.location.hash);
                        } else {
                            var failProfile = " ";
                            _.each(notDeletes, function (el, i) {
                                failProfile += el.skillName + ", ";
                            });
                            swal({title: 'Thất bại', text: 'Kỹ năng đang được sử dụng : ' + failProfile, type: "warning"});
                            _.LoadPage(window.location.hash);
                        }
                    });
                });
        });

        $(document).on('click', '#sortByName', function () {
            //Sort theo tên kĩ năng
            switchSortType("skillName");
        });

        $(document).on('click', '#sortByDurHigh', function () {
            //Sort theo mức trên
            switchSortType("alarmDurHigh");
        });

        $(document).on('click', '#sortByDurLow', function () {
            //Sort theo mức dưới
            switchSortType("alarmDurLow");
        });

        $(document).on('click', '#btn-search', function () {
            //Click vào button search
            queryFilter();
        });

        $('#searchForm').bind('keyup', function (e) {
            //Bắt sự kiện enter trong các ô text search
            if (e.keyCode == 13) queryFilter();
        });
    };

    var bindSubmit = function () {
        $(document).on('change', '.select-box-all', function () {
            //Chọn tất cả các bản ghi
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked")) {
                $('#li-hidden').removeClass('hidden'); //hiện nút xóa nhiều bản ghi
            }
            else {
                $('#li-hidden').addClass('hidden'); //ẩn nút xóa nhiều bản ghi
            }
        });

        $(document).on('change', '.select-box-cell', function () {
            //Chọn 1 bản ghi
            var x = $.map($('.select-box-cell'), function (n, i) {
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0) {
                $('#li-hidden').removeClass('hidden'); //hiện nút xóa nhiều bản ghi
            }
            else {
                $('#li-hidden').addClass('hidden'); //ẩn nút xóa nhiều bản ghi
            }
        });
    };

    return {
        init: function () {
            //Load data search từ url vào obj
            if (_.has(window.location.obj, 'skillName')) _searchPath['skillName'] = window.location.obj['skillName'];
            if (_.has(window.location.obj, 'idCompany')) _searchPath['idCompany'] = window.location.obj['idCompany'];
            if (_.has(window.location.obj, 'alarmDurHigh')) _searchPath['alarmDurHigh'] = window.location.obj['alarmDurHigh'];
            if (_.has(window.location.obj, 'alarmDurLow')) _searchPath['alarmDurLow'] = window.location.obj['alarmDurLow'];
            if (_.has(window.location.obj, 'status')) _searchPath['status'] = window.location.obj['status'];
            if (_.has(window.location.obj, 'recordingState')) _searchPath['recordingState'] = window.location.obj['recordingState'];

            //Nếu không có bản ghi phù hợp
            if ($('#table-skills tbody tr').length == 1) {
                delete window.location.obj['sort'];
                if (!_.isEmpty(window.location.obj)) {
                    swal({
                            title: "Thông báo",
                            text: "Không tìm thấy bản ghi phù hợp",
                            type: "warning", showCancelButton: false, confirmButtonColor: "#DD6B55", confirmButtonText: "Quay lại!"
                        },
                        function () {
                            window.history.back();
                        });
                }
            }

            //Load data search từ url vào các textbox
            if (_.has(_searchPath, 'skillName')) {
                if (!_.isEqual(_searchPath['skillName'], 'asc') && !_.isEqual(_searchPath['skillName'], 'desc')) {
                    $('#search_field_skillName').val(_searchPath['skillName']);
                }
                else {
                    _keyword = _searchPath['skillName'];
                }
            }

            if (_.has(_searchPath, 'idCompany')) {
                if (!_.isEqual(_searchPath['idCompany'], 'asc') && !_.isEqual(_searchPath['idCompany'], 'desc')) {
                    $('#search_field_idCompany').val(_searchPath['idCompany']);
                }
                else {
                    _keyword = _searchPath['idCompany'];
                }
            }

            if (_.has(_searchPath, 'alarmDurHigh')) {
                if (!_.isEqual(_searchPath['alarmDurHigh'].toLowerCase(), 'asc') && !_.isEqual(_searchPath['alarmDurHigh'].toLowerCase(), 'desc')) {
                    $('#search_field_skillDurHigh').val(_searchPath['alarmDurHigh']);
                }
                else {
                    _keyword = _searchPath['alarmDurHigh'];
                }
            }
            if (_.has(_searchPath, 'alarmDurLow')) {
                if (!_.isEqual(_searchPath['alarmDurLow'], 'asc') && !_.isEqual(_searchPath['alarmDurLow'], 'desc')) {
                    $('#search_field_skillDurLow').val(_searchPath['alarmDurLow']);
                }
                else {
                    _keyword = _searchPath['alarmDurLow'];
                }
            }
            if (_.has(_searchPath, 'status') && !_.isEqual(_searchPath['status'], 'asc') && !_.isEqual(_searchPath['status'], 'desc')) {
                $('#search_field_status').val(_searchPath['status']);
            }
            if (_.has(_searchPath, 'recordingState') && !_.isEqual(_searchPath['recordingState'], 'asc') && !_.isEqual(_searchPath['recordingState'], 'desc')) {
                $('#search_field_recordState').val(_searchPath['recordingState']);
            }

            $('.selectpicker').selectpicker('refresh');

            bindClick();
            bindSubmit();
        },
        uncut: function () {
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '#sortByName');
            $(document).off('click', '#sortByDurHigh');
            $(document).off('click', '#sortByDurLow');
            $(document).off('click', '#btn-search');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '.zmdi-refresh');
            $('#searchForm').unbind('keyup');
        }
    };
}(jQuery);