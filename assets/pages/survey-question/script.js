var DFT = function ($) {

    // Sắp xếp dữ liệu
    var sortData = function(_sortField, param){

        var _value = '';
        window.location.obj['sortField'] = _sortField;
        if(_.has(window.location.obj,'sortValue')) _value = window.location.obj['sortValue'];

        if(!param){
            window.location.obj['sortValue'] = (_.isEqual(_value,'desc')) ? 'asc' : 'desc';
        }else {
            window.location.obj['sortValue'] = (_.isEqual(_value,'asc')) ? 'desc' : 'asc';
        }

        window.location.hash = newUrl(window.location.hash.replace('#',''),window.location.obj);
    }

    var bindSearch = function(fieldName){
        if(_.isEqual($('#search_' + fieldName).val(), ''))
            delete window.location.obj[fieldName];
        else
            window.location.obj[fieldName] = $('#search_' + fieldName).val();
    }

    // Hiển thị lại tiêu chí đã lọc
    var bindSearchText = function(fieldName){
        if($('#search_' + fieldName).val().trim().length > 0)
            window.location.obj[fieldName] = $('#search_' + fieldName).val();
        else
            delete window.location.obj[fieldName];
    }

    var bindClick = function () {
        // Tải lại trang
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });

        // Xóa phần tử hiện tại
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('data-id');
            swal({
                    title: _config.MESSAGE.SURVEY_QUESTION.DELETE_TITLE,
                    text: _config.MESSAGE.SURVEY_QUESTION.DELETE_TEXT,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/survey-question/' + _id, 'DELETE', {}, function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.SURVEY_QUESTION.DELETE_TEXT_SUCCESS, type: "success"});
                        _.LoadPage(window.location.hash);
                    });
                });
        });

        // CLick tìm kiếm
        $(document).on('click', '#btn-filter', function () {
            bindSearchText('content');
            window.location.hash = newUrl('survey-question/search',window.location.obj);
        });

        // Nhấn phím emter
        $('.row-filter').bind('keyup', function (e) {
            if (e.keyCode == 13){
                bindSearchText('content');
                window.location.hash = newUrl('survey-question/search',window.location.obj);
            }
        });

        // XÓa các phần tử đã chọn
        $(document).on('click', '#btn-delSelection', function(){
            var ids = $.map($('.selection'), function(n, i){
                return $(n).is(":checked") ? $(n).val(): '';
            });
            swal({
                    title: _config.MESSAGE.SURVEY_QUESTION.DELETE_TITLE_MANY,
                    text: _config.MESSAGE.SURVEY_QUESTION.DELETE_TEXT_MANY,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/survey-question/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.SURVEY_QUESTION.DELETE_TEXT_SUCCESS, type: "success"});
                        _.LoadPage(window.location.hash);
                    });
                });
        });

        // Chọn nhiều phần tử
        $(document).on('click', '#select_all', function(){
        //$('#select_all').click(function(event) {
            if(this.checked) {
                $('.selection').each(function() {
                    this.checked = true;
                });
                $('#li-hidden').removeClass('hidden');
            }
            else {
                $('.selection').each(function() {
                    this.checked = false;
                });
                $('#li-hidden').addClass('hidden');
            }
        });

        // Chọn một phần tử
        $(document).on('click', '.selection', function(){
        //$('.selection').click(function(event){
            var x = $.map($('.selection'), function(n, i){
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0){
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        })
        
    };

    var bindSubmit = function () {

    };

    var bindPressKey = function(){
        // Nhấn phím enter
        $('#search-bar').keypress(function (event) {
            var key = event.which;
            if (key == 13) {
                var searchValue = $('#search-bar').val();
                if (searchValue !== ''){
                    window.location.obj['keyword'] = searchValue;
                    var idSurveyParam = window.location.obj['idSurvey'] ? '&idSurvey=' + window.location.obj['idSurvey'] : '';
                    window.location.hash = '/survey-question/search?keyword=' + searchValue + idSurveyParam;
                }
            }
        });
    }

    return {
        init: function () {
            if(!_.isUndefined(window.location.obj['idSurvey'])){
                $('.pagination a').each(function(i,el){
                    var oldLink = $(el).attr('href');
                    $(el).attr('href',oldLink.replace('?page','&page'));
                })
            }

            // Thông báo nếu không tìm thấy kết quả
            if(!_.isUndefined(searchData.dataLength)  && searchData.dataLength <= 0){
                swal({title: _config.MESSAGE.SURVEY_QUESTION.SEARCH_TITLE, type: "warning"}, function(){
                    window.history.back();
                });
            }

            bindClick();
            bindSubmit();
            bindPressKey();
        },
        uncut: function(){
            // Disable sự kiện khi đóng trang
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-filter');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '#select_all');
            $(document).off('click', '.selection');
            $(document).off('click', '.zmdi-refresh');
            $('.row-filter').unbind('keyup');
        }
    };
}(jQuery);