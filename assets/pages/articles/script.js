var DFT = function ($) {

    var _options = {id: '', url: '/articles', method: 'POST', data: {}};

    var convertUrlForQuery = function(url){
        return url.replace('#', '');
    }

    var searchObj = {};
    var oldQuery = {};
    var listFilter = [];

    /**
     * làm mới danh sách articles
     * @param resp
     */
    var refreshArticles = function(resp){
        $('#form-articles #tbl-articles tbody .articles').empty();
        $('#form-articles .pagination').remove();
        _.each(resp.data, function (tk, i){
            $('#tbl-articles tbody').append(newArticle(tk));
        });
        $('#paging').append(_.paging('articles', resp.paging));
		
		setTimeout(function(){
				window.MainContent.loadTooltip();
		},1000);
    };

    /**
     * Tạo thẻ html của category
     * @param category
     * @returns {Array}
     */
    var newListCategory = function(category){
        var lsHtml = [];
        _.each(category, function(obj, i){
            lsHtml.push({tag: 'span', content: obj.name});
        });
        return lsHtml;
    };

    /**
     * Tạo thẻ html hiển thị article
     * @param obj Dữ liệu article
     * @returns {*}
     */
    var newArticle = function(obj){
        if (obj.category == null) obj.category = [];
        return _.Tags([
            {tag: 'tr', attr: {class: 'articles ' + obj.warning, 'data-id': obj._id, 'data-url': '/#articles'}, childs: [
                {tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'div', attr: {class: 'checkbox m-0'}, childs: [
                        {tag: 'label', childs: [
                            {tag: 'input', attr: {name: 'select', type: 'checkbox', class : "select-box select-box-cell", 'data-id': obj._id}},
                            {tag: 'i', attr: {class: 'input-helper'}}
                        ]}
                    ]}
                ]},
                {tag: 'td', attr: {class: 'task text-center'}, childs: [
                    {tag: 'a', content: obj.title, attr: {href: '/#articles/' + obj._id}}
                ]},
                {tag: 'td', attr: {class: 'task text-justify'}, childs: [
                    {tag: 'a', content: obj.raw.length > 50 ? (obj.raw.substr(0, 50) + ' ... ') : obj.raw, attr: {href: '/#articles/' + obj._id}}
                ]},
                {tag: 'td', attr: {class: 'task text-center text-capitalize'}, childs: [
                    {tag: 'span', content: obj.category.length > 0 ? obj.category[0].group : ''}
                ]},
                {tag: 'td', attr: {class: 'task text-center'}, childs: obj.category.length > 0 ? newListCategory(obj.category) : ''},
                {tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'span', content: obj.author.displayName}
                ]},
                {tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'span', content: obj.updater.displayName}
                ]},
                {tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'span', content: moment(obj.updated).format('DD/MM/YYYY HH:mm:ss')}
                ]},
                {tag: 'td', attr: {class: 'text-center'}, childs: [
                    {tag: 'a', attr: {class: 'p-t-3 btn-flat-bg', href: "/#articles/" + obj._id + '/edit', 'data-toggle': 'tooltip', 'data-placement': "top", 'data-original-title': "Sửa"}, childs: [
                        {tag: 'i', attr: {class: "zmdi zmdi-edit green f-17"}}
                    ]},
                    {tag: 'a', attr: {class: 'btn-remove btn-flat-bg', role: 'button', 'data-toggle': 'tooltip', 'data-placement': "top", 'data-original-title': "Xóa", 'data-id': obj._id}, childs: [
                        {tag: 'i', attr: {class: "zmdi zmdi-close red f-23"}}
                    ]}
                ]}
            ]}
        ]);
    };

    /**
     * Tạo dữ liệu option của thẻ selectpicker
     * @param obj
     * @returns {*}
     */
    var newOption = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
        ]);
    };

    /**
     * Lấy dữ liệu search và gửi lên server
     * @param msg
     */
    var queryFilter = function (msg) {
        var _data = _.pick($('#form-articles').serializeJSON(), _.identity);
        async.waterfall([
            function(cb){
                if (_.has(msg, 'filter')) {
                    listFilter = _.chain($('.filter'))
                        .map(function (el) {
                            return _.has(_data, $(el).attr('id')) ? _.object([$(el).attr('id')], [_data[$(el).attr('id')]]) : null;
                        })
                        .compact()
                        .reduce(function (memo, item) {
                            memo[_.keys(item)] = _.values(item)[0];
                            return memo;
                        }, {})
                        .value();
                }
                cb();
            }
        ], function (err) {
            var listSort = _.chain($('thead tr th').not('[data-sort="none"]'))
                .map(function (el) {
                    return $(el).attr('data-field') ? $(el).attr('data-field') + ':' + $(el).attr('data-sort') : '';
                })
                .compact()
                .value();
            listSort = _.isEmpty(listSort) ? '' : '&sort=' + listSort[0];
            $('.page-loader').show();
            $.get(convertUrlForQuery(newUrl('articles', listFilter) + listSort + (_.has(window.location.obj, 'ticket-href') ? ('&' + window.location.obj['ticket-href']) : '')), function (resp) {
                $('.page-loader').hide();
                if (resp.data.length == 0 && Object.keys(window.location.obj).length > 0) {
                    swal({
                        title: _config.MESSAGE.ARTICLE.SEARCH_NOT_FOUND_TITLE,
                        text: _config.MESSAGE.ARTICLE.SEARCH_NOT_FOUND_TEXT,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Quay lại!",
                        closeOnConfirm: true
                    }, function () {
                        _.each(oldQuery, function (v, k) {
                            var el = $('#' + k);
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
                    });
                }else{
                    oldQuery = listFilter;
                    refreshArticles(resp);
                }
            });
        });
    };

    /**
     * Bắt sự kiện click
     */
    var bindClick = function () {
        // Nút Lọc/Search
        $(document).on('click', '#btn-search', function (e) {
            e.preventDefault();
            if ($('#title').val().length > 0 ){
                window.location.obj['title'] = $('#title').val();
            }
            else{
                delete window.location.obj['title'];
            }

            if ($('#raw').val().length > 0 ){
                window.location.obj['raw'] = $('#raw').val();
            }
            else{
                delete window.location.obj['raw'];
            }

            if (!_.isEqual($('#category').val(), '0')){
                window.location.obj['category'] = $('#category').val();
            }
            else{
                if (!_.isEqual($('#group').val(), '0')){
                    window.location.obj['category'] = $('#category').val();
                }
                else{
                    delete window.location.obj.category;
                }
            }

            if ($('#author').val().length > 0 ){
                window.location.obj['author'] = $('#author').val();
            }
            else{
                delete window.location.obj.author;
            }

            if ($('#updater').val().length > 0 ){
                window.location.obj['updater'] = $('#updater').val();
            }
            else{
                delete window.location.obj.updater;
            }

            if ($('#created').val().length > 0 ){
                window.location.obj['created'] = $('#created').val();
            }
            else{
                delete window.location.obj.created;
            }

            var tmpString = '?';
            searchObj = {};
            _.each(window.location.obj, function (obj, i) {
                tmpString = tmpString + i + '=' + obj + '&';
                searchObj[i] = obj;
            });
            queryFilter({filter: true});
        });

        // Thay đổi giá trị của nút select all
        $(document).on('change', '.select-box-all', function () {
            $('.select-box-cell').prop('checked', $('.select-box-all').is(":checked"));
            if ($('.select-box-all').is(":checked"))
            {
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        });

        // Thay đổi giá trị của nút select từng phần tử
        $(document).on('change', '.select-box-cell', function () {
            var x = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked");
            });
            if (_.compact(x).length > 0){
                $('#li-hidden').removeClass('hidden');
            }
            else{
                $('#li-hidden').addClass('hidden');
            }
        });

        // Click sang trang khác
        $(document).on('click', '#form-articles .pagination li a', function (e) {
            e.preventDefault();
            var $this = $(this);
            var tmpString = '&';
            _.each(searchObj, function (obj, i) {
                tmpString = tmpString + i + '=' + obj + '&';
            });
            window.location.obj['ticket-href'] = $this.attr('href').split('?')[1];
            queryFilter();
        });

        // Xóa 1 phần tử
        $(document).on('click', '.btn-remove', function () {
            var _id = $(this).attr('data-id');
            swal({
                    title: _config.MESSAGE.ARTICLE.CONFIRM_DELETE_ARTICLE,
                    text: _config.MESSAGE.ARTICLE.TEXT_CONFIRM_DELETE_ARTICLE,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/articles/' + _id, 'DELETE', {}, function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({title: 'Thành công', text: _config.MESSAGE.ARTICLE.TEXT_SUCCESS_DELETE_ARTICLE, type: "success"});
                            _.LoadPage(window.location.hash);
                        } else {
                            swal({title: 'Thất bại!', text: resp.message});
                        }
                    });
                });
        });

        // Xóa nhiều phần tử đã chọn
        $(document).on('click', '#btn-delSelection', function(){
            var ids = $.map($('.select-box-cell'), function(n, i){
                return $(n).is(":checked") ? $(n).attr('data-id') : '';
            });
            swal({
                    title: _config.MESSAGE.ARTICLE.CONFIRM_DELETE_MANY_ARTICLE,
                    text: _config.MESSAGE.ARTICLE.TEXT_CONFIRM_DELETE_MANY_ARTICLE,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _Ajax('/articles/all', 'DELETE', [{ids: _.compact(ids)}], function (resp) {
                        swal({title: 'Thành công', text: _config.MESSAGE.SKILL.TEXT_SUCCESS_DELETE_MANY_SKILL, type: "success"});
                        _.LoadPage(window.location.hash);
                    });
                });
        });

        // Sort
        $(document).on('click', '.sort' , function(e){
            var $this = $(this);
            var sort = 'none';
            if (_.isUndefined($this.attr('data-field'))) return false;
            switch ($this.attr('data-sort')) {
                case 'none':
                    sort = 'asc';
                    $this.toggleAttr('data-sort', sort);
                    break;
                case 'asc':
                    sort = 'desc';
                    $this.toggleAttr('data-sort', sort);
                    break;
                case 'desc':
                    $this.toggleAttr('data-sort', 'none');
                    break;
            }
            $this.siblings().toggleAttr('data-sort', 'none');
            $this.children('i').removeClass('zmdi-sort-asc');
            $this.children('i').removeClass('zmdi-sort-desc');
            $this.children('i').addClass(_.isEqual(sort, 'none') ? '' : ('zmdi-sort-' + sort));
            $this.children('i').attr('data-original-title', _.isEqual(sort, 'asc') ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần');
            queryFilter({filter: true});
        });

        // Thay đổi category
        $(document).on('change', '#group-select', function(e){
            var $this = $(this);
            $('#category').empty().selectpicker('refresh');
            $('.option-g').remove();
            $('#category').append(newOption({_id: 0, name: 'Tất cả'})).selectpicker('refresh');
            var url = (_.isEqual($this.find(":checked").val(), '0')) ? '/articles-category?status=1' : ('/articles-category?status=1&group=' + $this.find(":checked").val());
            $('.page-loader').show();
            $.get(url, function(res){
                $('.page-loader').hide();
                _.each(res, function(g, i){
                    $('#category').append(newOption(g)).selectpicker('refresh');
                });
            });
        });

        $(document).on('click', '#refresh', function(e){
            _.LoadPage('articles');
        });
    };

    /**
     * Bắt sự kiện submit
     */
    var bindSubmit = function () {

    };

    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindValue = function(){
        _.each(_.allKeys(_config.MESSAGE.ARTICLE), function(item){
            $('.' + item).html(_config.MESSAGE.ARTICLE[item]);
        });
    };
    return {
        init: function () {
            bindClick();
            bindSubmit();
            bindValue();
            var url = '/articles' + (_.has(window.location.obj, 'page') ? ('?page=' + window.location.obj['page']) : '');
            $('.page-loader').show();
            $.get(url, function(resp){
                $('.page-loader').hide();
                refreshArticles(resp);
            });

        },
        uncut: function(){
            // xóa sự kiện khi rời trang
            $(document).off('click', '#btn-search');
            $(document).off('change', '.select-box-all');
            $(document).off('change', '.select-box-cell');
            $(document).off('click', '#form-articles .pagination li a');
            $(document).off('click', '.btn-remove');
            $(document).off('click', '#btn-delSelection');
            $(document).off('click', '.sort');
            $(document).off('change', '#group-select');
        }
    };
}(jQuery);