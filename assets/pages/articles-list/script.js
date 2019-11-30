var DFT = function ($) {

    var convertUrlForQuery = function (url) {
        return url.replace('#', '');
    }

//    var _options = {id: '', url: '/articles-list', method: 'POST', data: {}};

    var searchObj = {};

    var listFilter = [];

    // Làm mới lại danh sách
    var refreshArticles = function (resp) {
        $('#tbl-articles tbody .articles').empty();
        $('.pagination').remove();
        for (var i = 0; i < resp.data.length; i = i + 2) {
            if (i == resp.data.length - 1) {
                $('#tbl-articles tbody').append(newArticle1(resp.data[i]));
            }
            else {
                $('#tbl-articles tbody').append(newArticle2(resp.data[i], resp.data[i + 1]));
            }
        }
        $('#paging').append(_.paging('articles-list', resp.paging));
    };


    // Tạo mới thẻ
    var newArticle1 = function (obj) {
        if (obj.category == null) obj.category = [];
        return _.Tags([
            {
                tag: 'tr', attr: {class: 'articles', 'data-id': obj._id, 'data-url': '/articles-list'}, childs: [
                {
                    tag: 'td', attr: {class: 'col-sm-6'}, childs: [
                    {
                        tag: 'div', childs: [
                        {tag: 'a', attr: {class: 'b task f-15', href: '/#articles/' + obj._id}, content: obj.title}
                    ]
                    },
                    {
                        tag: 'br', childs: [
                        {
                            tag: 'span',
                            attr: {class: 'task', href: '/#articles/' + obj._id},
                            content: obj.raw.length > 200 ? (obj.raw.substr(0, 200) + ' ... ') : obj.raw,
                            attr: {href: '/#articles/' + obj._id}
                        }
                    ]
                    },
                    {
                        tag: 'br', attr: {class: 'text-center'}, childs: [
                        {tag: 'b', attr: {class: 'col-sm-6'}, content: obj.author.displayName},
                        {
                            tag: 'span',
                            attr: {class: 'col-sm-6'},
                            content: moment(obj.created).format('DD/MM/YYYY HH:mm:ss')
                        }
                    ]
                    }
                ]
                },
                {tag: 'td', attr: {class: 'col-sm-6'}}
            ]
            }
        ]);
    };

    // Tạo mới thẻ
    var newArticle2 = function (obj, obj2) {
        if (obj.category == null) obj.category = [];
        if (obj2.category == null) obj.category = [];
        return _.Tags([
            {
                tag: 'tr', attr: {class: 'articles', 'data-id': obj._id, 'data-url': '/articles-list'}, childs: [
                {
                    tag: 'td', attr: {class: 'col-sm-6'}, childs: [
                    {
                        tag: 'div', childs: [
                        {tag: 'a', attr: {class: 'task f-18', href: '/#articles/' + obj._id}, content: obj.title}
                    ]
                    },

                    {
                        tag: 'span',
                        attr: {class: 'content-a'},
                        content: obj.raw.length > 200 ? (obj.raw.substr(0, 200) + ' ... ') : obj.raw
                    }
                    ,
                    {
                        tag: 'div', attr: {class: 'text-right'}, childs: [
                        {tag: 'b', attr: {class: 'm-r-20 f-12'}, content: obj.author.displayName},
                        {tag: 'span', attr: {class: 'f-11'}, content: moment(obj.created).format('DD/MM/YYYY HH:mm:ss')}
                    ]
                    }
                ]
                },
                {
                    tag: 'td', attr: {class: 'col-sm-6'}, childs: [
                    {
                        tag: 'div', childs: [
                        {tag: 'a', attr: {class: 'task f-18', href: '/#articles/' + obj2._id}, content: obj2.title}
                    ]
                    },
                    {
                        tag: 'span',
                        attr: {class: 'content-a'},
                        content: obj2.raw.length > 200 ? (obj2.raw.substr(0, 200) + ' ... ') : obj2.raw
                    }
                    ,
                    {
                        tag: 'div', attr: {class: 'text-right'}, childs: [
                        {tag: 'b', attr: {class: 'm-r-20 f-12'}, content: obj2.author.displayName},
                        {
                            tag: 'span',
                            attr: {class: 'f-11'},
                            content: moment(obj2.created).format('DD/MM/YYYY HH:mm:ss')
                        }
                    ]
                    }
                ]
                }
            ]
            }
        ]);
    };

    // Tạo thẻ option cho thẻ selectpicker
    var newOption = function (obj) {
        return _.Tags([
            {
                tag: 'a',
                attr: {
                    class: 'btn btn-default btn-icon-text m-t-10 m-r-10 waves-effect waves-effect filter-category',
                    value: obj._id
                },
                content: obj.name
            }
        ]);
    };

    // Lấy dữ liệu lọc và gửi lên server
    var queryFilter = function (msg) {
        var _data = _.pick($('#form-articles').serializeJSON(), _.identity);
        async.waterfall([
            function (cb) {
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
                    $(document).on('click', '.category', function (e) {
                        if ($(this).attr('value') != "") {
                            listFilter = {'category-name' : $(this).attr('value')};
                        }
                    });
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
                refreshArticles(resp);
            });
        });
    };

    // Lọc article
    var articleFilter = function(e){
        $('.group').empty();
        $('.width20pc').removeClass('active');
        $("#category[value='']").parent('.width20pc').addClass('active');
        e.preventDefault();
        if ($('#title').val().length > 0) {
            window.location.obj['title'] = $('#title').val();
        }
        else {
            delete window.location.obj['title'];
        }

        if ($('#raw').val().length > 0) {
            window.location.obj['raw'] = $('#raw').val();
        }
        else {
            delete window.location.obj['raw'];
        }

        if (!_.isEqual($('#category').val(), '0')) {
            window.location.obj['category'] = $('#category').val();
        }
        else {
            if (!_.isEqual($('#group').val(), '0')) {
                window.location.obj['category'] = $('#category').val();
            }
            else {
                delete window.location.obj.category;
            }
        }

        var tmpString = '?';
        searchObj = {};
        _.each(window.location.obj, function (obj, i) {
            tmpString = tmpString + i + '=' + obj + '&';
            searchObj[i] = obj;
        });
        queryFilter({filter: true});
    };

    // Gắn sự kiện click
    var bindClick = function () {
        // Click nút search
        $(document).on('click', '#btn-search', function (e) {
            articleFilter(e);
        });

        // Nhấn nút enter khi tìm kiếm
        $(document).on('keyup', '#search', function (e) {
            if(e.keyCode == 13)
                articleFilter(e);
        });
        // Reload lại trang
        $(document).on('click', '#btn-refresh', function (e) {
            _.LoadPage(window.location.hash);
        })

        // Thay đổi dữ liệu category
        $(document).on('click', '#category', function (e) {
            if ($(this).attr('value')!= "") {
                $('.page-loader').show();
                $.get('/articles-category?group=' + $(this).attr('value'), function (resp) {
                    $('.page-loader').hide();
                    $('.group').empty();
                    _.each(resp, function (obj) {
                        $('.group').append(newOption(obj));
                    });
                });
            }else{
                $('.group').empty();
            }
            $('.width20pc').removeClass('active');
            $(this).parent('.width20pc').addClass('active');
            //$('#title').val('');
            //$('#raw').val('');
            queryFilter({filter: true});
        });

        // Lọc dữ liệu category
        $(document).on('click', '.filter-category', function(){
            $('.filter-category').removeClass('focus');
            $(this).addClass('focus');
            $('.page-loader').show();
            $.get('/articles?category=' + $(this).attr('value') , function (resp) {
                $('.page-loader').hide();
                refreshArticles(resp);
            });
        });
        // Thay đổi dữ liệu call-manager
        $(document).on('change', '#call-manager', function (e) {
            if (_.isEqual($('#call-manager').val(), '1')) {
                window.location.hash = 'incoming';
            }
            else {
                window.location.hash = 'out-campain';
            }
        });
        // Chuyển trang
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


    };

    // Bắt sự kiện submit
    var bindSubmit = function () {

    };

    /**
     * Hiển thị tên trường/cột theo file config
     */
    var bindValue = function () {
        _.each(_.allKeys(_config.MESSAGE.ARTICLE), function (item) {
            $('.' + item).html(_config.MESSAGE.ARTICLE[item]);
        });
    };
    return {
        init: function () {
            bindClick();
            bindSubmit();
            bindValue();
            queryFilter();
//            var url = '/articles-list' + (_.has(window.location.obj, 'page') ? ('?page=' + window.location.obj['page']) : '');
//            $.get(url, function(resp){
//                refreshArticles(resp);
//            });
            $('.blank').html('');
        },
        uncut: function () {
            // xóa sự kiện khi rời trang
            $(document).off('click', '#btn-search');
            $(document).off('click', '.category');
            $(document).off('keyup', '#search');
            $(document).off('click', '#btn-refresh');
            $(document).off('change', '#category-name');
            $(document).off('click', '#category');
            $(document).off('change', '#call-manager');
            $(document).off('click', '.filter-category');
            $(document).off('click', '#form-articles .pagination li a');
        }
    };
}(jQuery);