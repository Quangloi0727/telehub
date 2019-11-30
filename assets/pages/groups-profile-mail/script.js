var DFT = function ($) {
    var queryFilter = function () {
        var _data = $('#group-profile').serializeJSON();
        var listFilter = _.chain(_.keys(_data))
            .reduce(function (memo, item) {
                if(!_.isEqual(_data[item], ''))
                    memo[item.replace("filter_", "")] = _data[item];
                return memo;
            }, {})
            .value();

        var listSort = '';
        listSort = _.chain($('.listHead th').not('[data-sort="none"]'))
            .map(function (el) {
                return $(el).attr('data-field') ? $(el).attr('data-field') + ':' + $(el).attr('data-sort') : '';
            })
            .compact()
            .value();
        listSort = _.isEmpty(listSort) ? '' : '&sort=' + listSort[0];
        paging = _.has(window.location.obj, 'page') ? '&page=' + window.location.obj.page : '';
        window.location.hash = newUrl(window.location.hash.replace('/', ''), listFilter) + listSort + paging;
    };

    var bindClick = function () {
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('data-id');
            swal({
                    title: _config.MESSAGE.GROUP_PROFILE.DELETE_TITLE,
                    text: _config.MESSAGE.GROUP_PROFILE.DELETE_TEXT,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/groups-profile-mail/' + _id, 'DELETE', {}, function (resp) {
                        if(resp.code == 200){
                            swal({title: 'Thành công', text: _config.MESSAGE.GROUP_PROFILE.DELETE_TEXT_SUCCESS, type: "success"} , function(){
                                _.LoadPage(window.location.hash);
                            });
                        }else {
                            var failProfile = " ";
                            _.each(resp.message, function(el,i){
                                failProfile += el.name +", ";
                            });

                            swal({title: 'Thất bại', text: _config.MESSAGE.GROUP_PROFILE.DELETE_TEXT_FAIL + failProfile, type: "warning"} , function(){
                                _.LoadPage(window.location.hash);
                            });
                        }
                    });
                });
        });

        $(document).on('click', '.btn-filter', function () {
            queryFilter();
        });

        $(document).on('click', '#btn-delSelection', function(){
            var ids = $.map($('.selection'), function(n, i){
                return $(n).is(":checked") ? $(n).val(): '';
            });
            swal({
                    title: _config.MESSAGE.GROUP_PROFILE.DELETE_TITLE_MANY,
                    text: _config.MESSAGE.GROUP_PROFILE.DELETE_TEXT_MANY,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/groups-profile-mail/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        if(resp.code == 200){
                            swal({title: 'Thành công', text: _config.MESSAGE.GROUP_PROFILE.DELETE_TEXT_SUCCESS, type: "success"} , function(){
                                _.LoadPage(window.location.hash);
                            });
                        }else {
                            var failProfile = " ";
                            _.each(resp.message, function(el,i){
                                failProfile += el.name +", ";
                            });

                            swal({title: 'Thất bại', text: _config.MESSAGE.GROUP_PROFILE.DELETE_TEXT_FAIL + failProfile, type: "warning"} , function(){
                                _.LoadPage(window.location.hash);
                            });
                        }
                    });
                });
        });

        $(document).on('click', '.listHead th', function () {
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

        $('#select_all').click(function(event) {
            if(this.checked) {
                // Iterate each checkbox
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

        $('.selection').click(function(event){
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

    }

    return {
        init: function () {
            if (_.has(window.location.obj, 'sort')) {
                var _sort = window.location.obj.sort.split(':');
                $('th[data-field="' + _sort[0] + '"]').attr('data-sort', _sort[1]);
            }

            if ($('#group-profile tbody tr').length == 1) {
                delete window.location.obj['sort'];
                if (!_.isEmpty(window.location.obj)) {
                    swal({title: _config.MESSAGE.GROUP_PROFILE.SEARCH_TITLE, type: "warning"}, function(){
                        window.location.hash = 'groups-profile-mail';
                    });
                }
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
            bindPressKey();
        },
        uncut: function(){
            $(document).off('click', '.btn-remove');
            $(document).off('click', '.btn-filter');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '.listHead th');
            $(document).off('click', '#select_all');
            $(document).off('click', '.selection');
            $('#group-profile').unbind('keyup');
        }
    };
}(jQuery);