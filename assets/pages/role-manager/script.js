var DFT = function ($) {
    var _rootId = window._rootId = '';
    var topOfTheWorld = '57032832296c50d9b723d12e';
    var bindClick = function () {
        $(document).on('change', 'input.checkall', function () {
            var $this = $(this);
            $('input[c="' + $this.attr('data-column') + '"]').prop('checked', $this.is(':checked'));
            _Ajax('/role-manager/all', 'PUT', [{ids: 'all'}, {type: Number($this.is(':checked'))}, {role: [$this.attr('id')]}], function (resp) {
            });
        });

        $(document).on('change', '#tbl-menu input[type="checkbox"]:not(.checkall)', function () {
            var $this = $(this);
            var _checkall = $('#' + $(this).attr('id') + '.checkall');
            _Ajax('/role-manager/' + $this.closest('tr').attr('id').replace('r-', ''), 'PUT',
                [
                    {ids: [$this.closest('tr').attr('id').replace('r-', '')]},
                    {type: Number($this.is(':checked'))},
                    {role: [$this.attr('id')]},
                    {crud: $this.closest('tr').attr('crud')}
                ],
                function (resp) {
                    if (resp) {
                        _.each(resp, function (id) {
                            $('input[l="l-' + $this.attr('c') + '-' + id + '"]').prop('checked', $this.is(':checked'));
                        });
                    }
                    _checkall.prop('checked', _.isEqual($('input[id="' + $($this).attr('id') + '"]:checked').not(_checkall).length, $('#tbl-menu tr').length - 2));
                });
        });
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
    };

    var buildCheckAllRole = function () {
        var i = 0;
        return _.chain(_roles).reduce(function (memo, d) {
            var _checked = _.isEqual(d._id, topOfTheWorld);
            var _disabled = false;// _.isEqual(d._id, topOfTheWorld);
            memo.push({
                tag: 'td', attr: {class: 'text-center p-0'},
                childs: [
                    {
                        tag: 'div', attr: {class: 'checkbox p-0 m-0'}, childs: [
                        {
                            tag: 'label',
                            childs: [
                                {
                                    tag: 'input',
                                    attr: {type: 'checkbox', class: 'checkall', 'data-column': i, id: d._id, value: _checked ? 1 : 0},
                                    sattr: [_checked ? 'checked' : '', _disabled ? 'disabled' : '']
                                },
                                {tag: 'i', attr: {class: 'input-helper'}}
                            ]
                        }
                    ]
                    }
                ]
            });
            i++;
            return memo;
        }, []).value();
    };

    var buildCRUD = function (d, url) {
        return [{
            tag: 'div', attr: {class: 'checkbox p-0 m-0'}, childs: [
                {
                    tag: 'label',
                    childs: [
                        {tag: 'input', attr: {type: 'checkbox'}, sattr: ['checked']},
                        {tag: 'i', attr: {class: 'input-helper'}}
                    ]
                }
            ]
        }]
    }

    var buildRole = function (url, key) {
        var i = 0;
        return _.chain(_roles).reduce(function (memo, d) {
            var _checked = false;
            if (!!key) {
                _checked = (url[key].indexOf(d._id) >= 0);
            } else {
                _checked = _.isEqual(d._id, topOfTheWorld) || (url.role.indexOf(d._id) >= 0);
            }
            var _disabled = false; // _.isEqual(d._id, topOfTheWorld);
            memo.push({
                tag: 'td', attr: {class: 'text-center p-0'},
                childs: [
                    {
                        tag: 'div', attr: {class: 'checkbox p-0 m-0'}, childs: [
                        {
                            tag: 'label',
                            childs: [
                                {
                                    tag: 'input',
                                    attr: {type: 'checkbox', c: i, l: 'l-' + (i) + '-' + url._id, id: d._id, value: _checked ? 1 : 0},
                                    sattr: [_checked ? 'checked' : '', _disabled ? 'disabled' : '']
                                },
                                {tag: 'i', attr: {class: 'input-helper'}}
                            ]
                        }
                    ]
                    }
                ]
            });
            i++;
            return memo;
        }, []).value();
    };

    var buildTreeContent = function (rawContext, isLast) {
        var first = _.Tags([{
            tag: 'div',
            attr: {class: 'indentation w-40 m-l-20 m-r-10 tree-child'},
            content: '&nbsp;'
        }]);

        var last = _.Tags([{
            tag: 'div',
            attr: {class: 'indentation w-40 m-l-20 m-r-10 tree-child-last'},
            content: '&nbsp;'
        }]);

        return rawContext + (isLast ? last : first);
    };

    var buildTable = function (data, parents, depth, rawContext) {
        var _result = '';
        var _indentation = depth ? _.Tags([{tag: 'div', attr: {class: 'indentation tree-child-horizontal'}, content: '&nbsp;'}]) : '';

        var treeLeft = _.Tags([{
            tag: 'div',
            attr: {class: 'indentation w-40 m-l-20 m-r-10 tree-child-left'},
            content: '&nbsp;'
        }]);

        var treeNoBg = _.Tags([{
            tag: 'div',
            attr: {class: 'indentation w-40 m-l-20 m-r-10 tree-child-left nobg'},
            content: '&nbsp;'
        }]);

        depth++;


        _.each(data, function (d, index, list) {
            var isLast = _.isEqual(index, list.length - 1);
            _result += _.Tags([{
                tag: 'tr', attr: {class: '', id: 'r-' + d._id, l: depth}, childs: _.union([
                    {
                        tag: 'td',
                        attr: {class: 'p-l-20'},
                        content: buildTreeContent(rawContext, isLast),
                        childs: [
                            {
                                tag: 'a',
                                attr: {role: 'button'},
                                childs: [{tag: 'span', attr: {class: 'p-r-10'}, content: d.name}, {
                                    tag: 'span',
                                    attr: {class: 'text-muted f-12'},
                                    content: '(access menu)'
                                }]
                            },
                            {tag: 'input', attr: {type: 'hidden', class: 'link-id', name: 'link-' + d._id + '[id]', value: d._id}},
                            {tag: 'input', attr: {type: 'hidden', class: 'row-depth', name: 'link-' + d._id + '[depth]', value: depth}}
                        ]
                    }
                ], buildRole(d))
            },
                d.crud ? {
                    tag: 'tr', attr: {class: '', id: 'r-' + d._id, l: depth + 1, crud: 'create'}, childs: _.union([
                        {
                            tag: 'td',
                            attr: {class: 'p-l-20'},
                            content: buildTreeContent(rawContext + (isLast ? treeNoBg : treeLeft)),
                            childs: [
                                {
                                    tag: 'a',
                                    attr: {role: 'button'},
                                    childs: [{tag: 'span', attr: {class: 'p-r-10'}, content: 'Tạo mới'}, {
                                        tag: 'span',
                                        attr: {class: 'text-muted f-12'},
                                        content: ''
                                    }]
                                },
                                {tag: 'input', attr: {type: 'hidden', class: 'link-id', name: 'link-' + d._id + '[id]', value: d._id}},
                                {tag: 'input', attr: {type: 'hidden', class: 'row-depth', name: 'link-' + d._id + '[depth]', value: depth}}
                            ]
                        }
                    ], buildRole(d, 'create'))
                } : null,
                d.crud ? {
                    tag: 'tr', attr: {class: '', id: 'r-' + d._id, l: depth + 1, crud: 'update'}, childs: _.union([
                        {
                            tag: 'td',
                            attr: {class: 'p-l-20'},
                            content: buildTreeContent(rawContext + (isLast ? treeNoBg : treeLeft)),
                            childs: [
                                {
                                    tag: 'a',
                                    attr: {role: 'button'},
                                    childs: [{tag: 'span', attr: {class: 'p-r-10'}, content: 'Cập nhật'}, {
                                        tag: 'span',
                                        attr: {class: 'text-muted f-12'},
                                        content: ''
                                    }]
                                },
                                {tag: 'input', attr: {type: 'hidden', class: 'link-id', name: 'link-' + d._id + '[id]', value: d._id}},
                                {tag: 'input', attr: {type: 'hidden', class: 'row-depth', name: 'link-' + d._id + '[depth]', value: depth}}
                            ]
                        }
                    ], buildRole(d, 'update'))
                } : null,
                d.crud ? {
                    tag: 'tr', attr: {class: '', id: 'r-' + d._id, l: depth + 1, crud: 'destroy'}, childs: _.union([
                        {
                            tag: 'td',
                            attr: {class: 'p-l-20'},
                            content: buildTreeContent(rawContext + (isLast ? treeNoBg : treeLeft), true),
                            childs: [
                                {
                                    tag: 'a',
                                    attr: {role: 'button'},
                                    childs: [{tag: 'span', attr: {class: 'p-r-10'}, content: 'Xoá'}, {
                                        tag: 'span',
                                        attr: {class: 'text-muted f-12'},
                                        content: ''
                                    }]
                                },
                                {tag: 'input', attr: {type: 'hidden', class: 'link-id', name: 'link-' + d._id + '[id]', value: d._id}},
                                {tag: 'input', attr: {type: 'hidden', class: 'row-depth', name: 'link-' + d._id + '[depth]', value: depth}}
                            ]
                        }
                    ], buildRole(d, 'destroy'))
                } : null
            ]);
            if (d.children.length) {
                var preContext = (index == (list.length - 1)) ? treeNoBg : treeLeft;
                _result += buildTable(d.children, parents, depth, rawContext + preContext);
            }
        });
        return _result;
    };

    return {
        init: function () {
            $.get('/role-manager', function (data) {
                if (data && _.has(data, 'children') && data.children) {
                    _rootId = data._id;
                    $('#tbl-menu tbody').html(buildTable(data.children, data.list, 0, ''))
                        .prepend(_.Tags([{
                            tag: 'tr',
                            childs: _.union([{
                                tag: 'td',
                                attr: {class: 'text-right c-gray'},
                                content: 'chọn toàn bộ >',
                            }], buildCheckAllRole())
                        }]));
                    $('#tbl-menu td div.indentation:first-child').addClass('tree-child-last');
                    $('#tbl-menu .checkall').each(function (i, e) {
                        var $this = $(e);
                        $this.prop('checked', _.isEqual($('input[id="' + $(e).attr('id') + '"]:checked').not($this).length, $('#tbl-menu tr').length - 2));
                    });
                    $('#my-table').fixedHeader();
                }
                $('[data-toggle="tooltip"]').tooltip();
            });
            bindClick();
        },
        uncut: function () {
            $(document).off('change', 'input.checkall');
            $(document).off('change', '#tbl-menu input[type="checkbox"]:not(.checkall)');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);