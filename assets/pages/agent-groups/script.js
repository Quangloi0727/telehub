/**
 * Created by NghiaTM on 1/18/2016.
 */


var DFT = function ($) {
    /**
     * Lọc dữ liệu ở ô filter
     */
    var queryFilter = function(){
        if ($('#search_name').val().trim().length > 0) {
            window.location.obj['name'] = $('#search_name').val();
        } else {
            delete window.location.obj['name'];
        }

        if ($('#search_company').find(":selected").val().length > 0) {
            window.location.obj['idParent'] = $('#search_company').find(":selected").val();
        } else {
            delete window.location.obj['idParent'];
        }

        window.location.hash = newUrl('agent-groups/search', window.location.obj);
    };

    /**
     * Bắt sự kiện click
     */
    var bindClick = function () {
        // Nút lọc
        $(document).on('click', '#btn-filter', function () {
            queryFilter();
        });

        // Nút sắp xếp/sort trường dữ liệu
        $(document).on('click', '#tbl-group thead tr th.name', function () {
            window.location.obj['sortField'] = 'name';
            window.location.obj['sortValue'] = (window.location.obj['sortValue'] == 'asc') ? 'desc' : 'asc';
            window.location.hash = newUrl(window.location.hash.replace('#', ''), window.location.obj);
        });

        // Nút sắp xếp/sort trường dữ liệu
        $(document).on('click', '.updatedDate', function () {
            //sortData('updated', true);
            window.location.obj['sortField'] = 'updated';
            window.location.obj['sortValue'] = (window.location.obj['sortValue'] == 'asc') ? 'desc' : 'asc';
            window.location.hash = newUrl(window.location.hash.replace('#', ''), window.location.obj);
        });

        // Nút xóa bản ghi
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('data-id');
            swal({
                    title: "Bạn muốn xoá mục này ?",
                    text: "",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Có, chắc chắn !",
                    closeOnConfirm: false
                },
                function () {
                    // Gửi request lên server
                    _AjaxObject(window.location.hash.replace('#', '') + '/' + _id, 'DELETE', {}, function (resp) {
                        if (resp.code == 500){
                            swal({title: 'Có lỗi xảy ra !',
                                text: resp.message,
                                type: "error"});
                        }else{
                            swal({title: 'Thành công', text: 'Danh mục đã được xoá', type: "success"});
                            _.LoadPage(window.location.hash);
                        }
                    });
                });

        });

        // Nút xóa nhiều
        $(document).on('click', '#btn-delSelection', function () {
            var ids = $.map($('.selection'), function (n, i) {
                return $(n).is(":checked") ? $(n).val() : '';
            });
            swal({
                    title: "Bạn muốn xoá các group này ?",
                    text: "Các group đánh dấu sẽ bị xóa bỏ",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Có, chắc chắn !",
                    closeOnConfirm: false
                },
                function () {
                    // Gửi request lên server
                    _Ajax(window.location.hash.replace('#', '') + '/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        if (resp.code == 500){
                            swal({title: 'Có lỗi xảy ra !',
                                text: resp.message,
                                type: "error"});
                        }else{
                            swal({title: 'Thành công', text: 'Danh mục đã được xoá', type: "success"});
                            _.LoadPage(window.location.hash);
                        }
                    });
                });
        });

        // Checkbox chọn tất cả
        $(document).on('click', '#select_all', function () {
            if (this.checked) {
                // Iterate each checkbox
                $('.selection').each(function () {
                    this.checked = true;
                });
                $('#li-hidden').removeClass('hidden');
            }
            else {
                $('.selection').each(function () {
                    this.checked = false;
                });
                $('#li-hidden').addClass('hidden');
            }
        });

        // Checkbox chọn 1
        $(document).on('click', '.selection', function () {
            var x = $.map($('.selection'), function (n, i) {
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0) {
                $('#li-hidden').removeClass('hidden');
            }
            else {
                $('#li-hidden').addClass('hidden');
            }
        });

        // Nút Reload page
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // Sự kiện nhấn phím enter khi search
        $('#searchForm').bind('keydown', function (e) {
            if (e.keyCode == 13) queryFilter();
        });
    };

    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {

    };

    /**
     * Bắt sự kiện nhấn phím
     */
    var bindKeyPress = function () {
        $('.lvhs-input').keypress(function (event) {
            var key = event.which;
            if (key == 13) {
                var searchValue = $('.lvhs-input').val();
                if (searchValue !== '') {
                    window.location.hash = 'agent-groups/search?keyword=' + searchValue;
                }
            }
        });

    }

    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindtextValue = function () {
        $('#txt_agent_company').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_COMPANY);
        $('#txt_agent_dtv').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_DTV);
        $('#txt_agent_call').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_CALL);
        $('#txt_agent_chat').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_CHAT);
        $('#txt_agent_mail').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_MAIL);
        $('#txt_agent_status_agent').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_STATUS_AGENT);
        $('#txt_agent_updateby').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_UPDATE_BY);
        $('#txt_agent_updateday').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_UPDATE_DAY);
        $('#txt_agent_status').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_STATUS);
        $('#txt_agent_actions').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_ACTIONS);
        $('#txt_agent_group').html(_config.MESSAGE.AGENT_GROUPS.TXT_AGENT_GROUPS);


    };
    return {
        init: function () {
            // Bắn thông báo khi không tìm thấy kết quả search
            if (dataLength == 0 && window.location.hash.indexOf("search") > -1) {
                swal({
                        title: "Thông báo",
                        text: "Không tìm thấy bản ghi phù hợp",
                        type: "warning",
                        showCancelButton: false,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Quay lại!"
                    },
                    function () {
                        window.history.back();
                    });
            }

            $("#search_name").val(window.location.obj['name']);
            $("#search_company").val(window.location.obj['idParent']);
            $("#search_company").selectpicker('render');
            bindClick();
            bindSubmit();
            bindKeyPress();
            bindtextValue();
        },
        // xóa sự kiện khi rời trang
        uncut: function () {
            $(document).off('click', '#btn-filter');
            $(document).off('click', '#tbl-group thead tr th.name');
            $(document).off('click', '.updatedDate');
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '#select_all');
            $(document).off('click', '.selection');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);