var DFT = function ($) {
    var _rootId = window._rootId = '';
    var _datalist = window._datalis = [];
    var _oldLinkName = window._oldLinkName = '';
    var _oldLinkUrl = window._oldLinkName = '';
    $.fn.replaceWithCallback = function (replace, callback) {
        var ret = $.fn.replaceWith.call(this, replace); // Call replaceWith
        if (typeof callback === 'function') {
            return callback.call(replace); // Call your callback
        }
        return ret;  // For chaining
    };
    var bindClick = function () {
        $(document).on('click', '.zmdi-refresh', function(){
            _.LoadPage(window.location.hash);
        });
        
        //Todo: update status
        $(document).on('change', '#tbl-menu input[type="checkbox"]', function () {
            var $this = $(this);
            $this.val(Number($this.is(':checked')));
            var _id = $this.prop('id').replace('link-', '');
            if (!_.isEqual(_id, 'status') && !_.isEqual(_id, 'crud')) {
                var _data = {};
                _data[$this.prop('name').match(/\[(.*)\]/).pop()] = $this.val();
                _Ajax('/menu-manager/' + _id, 'PUT', [_data], function (resp) {
                    if (resp && $this.prop('name').indexOf('status') > 0) {
                        _.each(resp, function (id) {
                            $('input[name="link-' + id + '[status]"]').val($this.val()).prop('checked', $this.is(':checked'));
                        });
                    }
                });
            }
        });

        $(document).on('click', '#tbl-menu .btn-add', function () {
            var $tr = $(this).closest('tr');
            $('.edit-linkformError').remove();
            var _url = _.clean(_.trim($('#edit-link').val()));
            if (!_url) {
                $('#edit-link').validationEngine('showPrompt', 'Đường dẫn không được để trống', 'error', 'topRight', true);
                return false;
            }
            if (!_.isNaN(Number(_url[0]))) {
                $('#edit-link').validationEngine('showPrompt', 'Không được bắt đầu bằng chữ số', 'error', 'topRight', true);
                return false;
            }
            if (/\s/g.test(_url)) {
                $('#edit-link').validationEngine('showPrompt', 'Không được có khoảng trắng', 'error', 'topRight', true);
                return false;
            }
            var formData = new FormData();
            _.each($tr.find('input,select,checkbox'), function (e) {
                var $el = $(e);
                if ($el.prop('name')) {
                    formData.append($el.prop('name').replace('link-', ''), $el.val());
                }
            });
            _AjaxData('/menu-manager', 'POST', formData, function (resp) {
                if (_.isEqual(resp.code, 200)) {
                    window.location.reload();
                } else {
                    $('#edit-link').validationEngine('showPrompt', resp.message, 'error', 'topRight', true);
                }
            });
        });

        $(document).on('click', '#tbl-menu .btn-edit', function () {
            var $this = $(this);
            var _id = $this.closest('tr').prop('id').replace('r-', '');
            var $_name = $('#edit-name-' + _id);
            var $_link = $('#edit-link-' + _id);
            $('#tbl-menu td *').not('.btn-save,.btn-cancel').addClass('disabled');
            $this.closest('td').find('.btn-edit,.btn-delete').addClass('hidden');
            $this.closest('td').find('.btn-save,.btn-cancel').removeClass('hidden');
            if ($_name) {
                _oldLinkName = $_name.text();
                $_name.replaceWith(_.Tags([{tag: 'input', attr: {type: 'text', id: 'edit-name-' + _id, name: 'name', value: $_name.text(), class: 'left form-control', style: 'width:auto;height:24px;padding:0 5px'}}]));
            }
            if ($_link) {
                _oldLinkUrl = $_link.text().replace('/', '');
                $_link.replaceWithCallback(_.Tags([{tag: 'input', attr: {type: 'text', id: 'edit-link-' + _id, name: 'link', value: $_link.text().replace('/', ''), class: 'left form-control', style: 'height:24px;padding:0 5px'}}]), function () {
                    $('#edit-link-' + _id).keyup(function () {
                        this.value = _.cleanString(_.ltrim(this.value));
                    });
                });
            }
        });

        $(document).on('click', '#tbl-menu .btn-cancel', function () {
            var $this = $(this);
            var _id = $this.closest('tr').prop('id').replace('r-', '');
            $('#edit-link-' + _id).unbind().replaceWith(_.Tags([{tag: 'a', attr: {id: 'edit-link-' + _id, href: _oldLinkUrl ? '/' + _oldLinkUrl : '#', class: 'f-13', target: '_blank'}, content: _oldLinkUrl ? '/' + _oldLinkUrl : ''}]));
            $('#edit-name-' + _id).unbind().replaceWith(_.Tags([{tag: 'a', attr: {id: 'edit-name-' + _id, href: _oldLinkUrl ? '/' + _oldLinkUrl : '#'}, content: _oldLinkName}]));
            $('#tbl-menu td *').removeClass('disabled');
            $(this).closest('td').find('.btn-edit,.btn-delete').removeClass('hidden');
            $(this).closest('td').find('.btn-save,.btn-cancel').addClass('hidden');
            _oldLinkName = _oldLinkUrl = '';
            $('#tbl-menu').validationEngine('hideAll');
        });

        $(document).on('click', '#tbl-menu .btn-save', function () {
            var $this = $(this);
            var _id = $this.closest('tr').prop('id').replace('r-', '');
            var _url = _.clean(_.trim($('#edit-link-' + _id).val()));
            $('.edit-link-' + _id + 'formError,.edit-name-' + _id + 'formError').remove();
            if (!_.clean(_.trim($('#edit-name-' + _id).val()))) {
                $('#edit-name-' + _id).validationEngine('showPrompt', 'Tiêu đề không được để trống', 'error', 'topRight', true);
                return false;
            }
            if (!_url) {
                $('#edit-link-' + _id).validationEngine('showPrompt', 'Đường dẫn không được để trống', 'error', 'topRight', true);
                return false;
            }
            if (!_.isNaN(Number(_url[0]))) {
                $('#edit-link-' + _id).validationEngine('showPrompt', 'Không được bắt đầu bằng chữ số', 'error', 'topRight', true);
                return false;
            }
            if (/\s/g.test(_url)) {
                $('#edit-link-' + _id).validationEngine('showPrompt', 'Không được có khoảng trắng', 'error', 'topRight', true);
                return false;
            }
            var formData = new FormData();
            _.each($this.closest('tr').find('input,select,checkbox'), function (e) {
                var $el = $(e);
                if ($el.prop('name') && (_.isEqual($el.prop('name'), 'name') || _.isEqual($el.prop('name'), 'link'))) {
                    formData.append($el.prop('name').replace('link-', ''), $el.val());
                }
            });
            formData.append('old', _oldLinkUrl);
            formData.append('pk', 'y');
            _AjaxData('/menu-manager/' + _id, 'PUT', formData, function (resp) {
                if (_.isEqual(resp.code, 200)) {
                    _oldLinkName = resp.message.name;
                    _oldLinkUrl = _.isEqual(resp.message.link, 'none') ? null : resp.message.link;
                    $this.closest('td').find('.btn-cancel').trigger('click');
                } else {
                    $('#edit-link-' + _id).validationEngine('showPrompt', resp.message, 'error', 'topRight', true);
                }
            });
        });
        $(document).on('click', '#tbl-menu .btn-delete', function () {
            var _id = $(this).closest('tr').attr('id').replace('r-', '');
            swal({
                    title: "Cảnh báo !",
                    text: "<div class='c-red f-18 p-l-20 p-r-20 text-justify'>Khi xoá một URL : " +
                    "<ul class='m-t-10'>" +
                    "<li class='m-b-10'>Toàn bộ URL con sẽ bị xoá bỏ</li>" +
                    "<li>Hành động này không thể khôi phục</li>" +
                    "</ul>Bạn vẫn muốn tiếp tục ?</div>",
                    html: true,
                    type: "warning", showCancelButton: true, confirmButtonColor: "#DD6B55", confirmButtonText: "Có, chắc chắn !", closeOnConfirm: false
                },
                function () {
                    _AjaxObject('/menu-manager/' + _id, 'DELETE', {}, function (resp) {
                        if (_.isEqual(resp.code, 200)) {
                            swal({title: 'Thành công', text: 'Trường dữ liệu đã được xoá', type: "success"}, function () {
                                if (resp.message.length) {
                                    _.each(resp.message, function (tr) {
                                        $('tr#r-' + tr).remove();
                                    });
                                }
                                $('tr#r-' + _id).remove();
                            });
                        } else {
                            swal({title: 'Đã có lỗi xảy ra', text: 'Đã có lỗi xảy ra', type: "error"});
                        }
                    });
                });
        });
    };

    var bindSubmit = function () {

        $('#tbl-menu').validationEngine();

        $(document).on('tabledrag:droprow', function (e, tbl) {
            if (!_rootId || !tbl.changed) return false;
            var $tr = $(tbl.oldRowElement);
            if ($tr.prop('id') == 'r-new') {
                _.each($tr.find('input,select,checkbox'), function (e) {
                    var $el = $(e);
                    //console.log($el.prop('name'), $el.val(), $el.prop('tagName'), $el.prop('type'));
                });
                tbl.changed = false;
            } else {
                _AjaxData('/menu-manager/' + _rootId, 'PUT', $('#tbl-menu').getData(), function (resp) {
                    tbl.changed = false;
                });
            }
        });
    };

    var createRow = function (d, depth, parent) {
        return _.Tags([{
            tag: 'tr', attr: {class: 'draggable', id: 'r-' + (d ? d._id : 'new')}, childs: [
                {
                    tag: 'td',
                    childs: [
                        d ? {tag: 'a', attr: {id: 'edit-name-' + d._id, href: _.has(d, 'link') ? (_.isEqual(d.link, '/none') ? '' : (_.startsWith(d.link, '/', 0) ? '/#' + d.link.substring(1) : '#' + d.link)) : '/'}, content: d.name} : {tag: 'input', attr: {class: 'left form-control', name: 'link-name', style: 'width:auto;height:24px;padding:0 5px'}},
                        d ? {tag: 'input', attr: {type: 'hidden', class: 'link-id', name: 'link-' + (d ? d._id + '[id]' : 'new'), value: (d ? d._id : 'new')}} : null,
                        {tag: 'input', attr: {type: 'hidden', class: 'row-depth', name: 'link-' + (d ? d._id + '[depth]' : 'depth'), value: depth}}
                    ]
                },
                {
                    tag: 'td',
                    childs: [
                        d ? {tag: 'a', attr: {id: 'edit-link-' + d._id, href: _.has(d, 'link') ? (_.isEqual(d.link, '/none') ? '' : (_.startsWith(d.link, '/', 0) ? '/#' + d.link.substring(1) : '#' + d.link)) : '/', class: 'f-13'}, content: (_.isEqual(d.link, '/none') ? '' : d.link)} : {
                            tag: 'input',
                            attr: {class: 'left form-control', id: 'edit-link', name: 'link-link', style: 'height:24px;padding:0 5px'}
                        },
                    ]
                },
                {
                    tag: 'td', attr: {class: 'text-center p-0'},
                    childs: [
                        {
                            tag: 'div', attr: {class: 'checkbox p-0 m-0'}, childs: [
                            {
                                tag: 'label',
                                childs: [
                                    {tag: 'input', attr: {type: 'checkbox', id: 'link-' + (d ? d._id : 'status'), name: 'link-' + (d ? d._id + '[status]' : 'status'), value: (d ? d.status : 0)}, sattr: (d ? [d.status === 1 ? 'checked' : ''] : [])},
                                    {tag: 'i', attr: {class: 'input-helper'}}
                                ]
                            }
                        ]
                        }
                    ]
                },
                {
                    tag: 'td', attr: {class: 'text-center p-0'},
                    childs: [
                        {
                            tag: 'div', attr: {class: 'checkbox p-0 m-0'}, childs: [
                            {
                                tag: 'label',
                                childs: [
                                    {tag: 'input', attr: {type: 'checkbox', id: 'link-' + (d ? d._id : 'crud'), name: 'link-' + (d ? d._id + '[crud]' : 'crud'), value: (d ? d.crud : 0)}, sattr: (d ? [d.crud === 1 ? 'checked' : ''] : [])},
                                    {tag: 'i', attr: {class: 'input-helper'}}
                                ]
                            }
                        ]
                        }
                    ]
                },
                {
                    tag: 'td', attr: {class: 'text-center p-0'},
                    childs: [
                        {
                            tag: 'div', attr: {class: 'checkbox p-0 m-0'}, childs: [
                            {
                                tag: 'label',
                                childs: [
                                    {tag: 'input', attr: {type: 'checkbox', id: 'link-' + (d ? d._id : 'hidden'), name: 'link-' + (d ? d._id + '[hidden]' : 'hidden'), value: (d ? d.hidden : 0)}, sattr: (d ? [d.hidden === 1 ? 'checked' : ''] : [])},
                                    {tag: 'i', attr: {class: 'input-helper'}}
                                ]
                            }
                        ]
                        }
                    ]
                },
                {
                    tag: 'td', attr: {class: 'text-center'},
                    childs: [
                        d ? {tag: 'a', attr: {role: 'button', class: 'p-t-3 btn-flat-bg btn-edit', 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-original-title': 'Sửa'}, childs: [{tag: 'i', attr: {class: 'zmdi zmdi-edit green f-17'}}]} : {
                            tag: 'a', attr: {role: 'button', class: 'p-t-3 btn-flat-bg btn-add', 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-original-title': 'Lưu'},
                            childs: [{tag: 'i', attr: {class: 'zmdi zmdi-check-all green f-17'}}]
                        },
                        d ? {tag: 'a', attr: {role: 'button', class: 'p-t-3 btn-flat-bg btn-save hidden', 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-original-title': 'Lưu'}, childs: [{tag: 'i', attr: {class: 'zmdi zmdi-check-all green f-17'}}]} : null,
                        d ? {tag: 'a', attr: {role: 'button', class: 'p-t-3 btn-flat-bg btn-cancel hidden', 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-original-title': 'Bỏ qua'}, childs: [{tag: 'i', attr: {class: 'zmdi zmdi-close red f-17'}}]} : null,
                        d ? {tag: 'a', attr: {role: 'button', class: 'p-t-3 btn-flat-bg btn-delete', 'data-toggle': 'tooltip', 'data-placement': 'top', 'data-original-title': 'Xoá'}, childs: [{tag: 'i', attr: {class: 'zmdi zmdi-close red f-17'}}]} : null,
                    ]
                },
                {
                    tag: 'td', childs: [{tag: 'select', attr: {class: 'row-weight selectpicker', id: 'w-' + (d ? d._id : 'new'), name: 'link-' + (d ? d._id + '[weight]' : 'weight')}, content: _.parseOptionArray(_.range(1, _datalist.length), (d ? d.weight : 1))}]
                },
                {
                    tag: 'td', childs: [{tag: 'select', attr: {class: 'row-parent selectpicker', name: 'link-' + (d ? d._id + '[parent]' : 'parent')}, content: _.parseOptions(_datalist, parent)}]
                }
            ]
        }]);
    };

    var buildTable = function (data, depth, parent) {
        var _result = '';
        depth++;
        _.each(data, function (d) {
            _result += createRow(d, depth, parent);
            if (d.children.length) {
                _result += buildTable(d.children, depth, d._id);
            }
        });
        return _result;
    };


    return {
        init: function () {
            $('.page-loader').show();
            $.get('/menu-manager', function (data) {
                $('.page-loader').hide();
                if (data && _.has(data, 'children') && data.children) {
                    _rootId = data._id;
                    _datalist = data.list;
                    $('#tbl-menu tbody').html(buildTable(data.children, 0, 0)).append(createRow(null, 0, _rootId));
                    $('#tbl-menu table').tableDrag();
                    $('#tbl-menu table #edit-link').keyup(function () {
                        this.value = _.cleanString(_.ltrim(this.value));
                    });
                    $('#tbl-menu [data-toggle="tooltip"]').tooltip();
                    $('.selectpicker').selectpicker();
                    $('input[name="link-name"]').donetyping(function () {
                        var $this = $(this);
                        var $tr = $this.closest('tr');
                        if (!$this.val().length) {
                            $tr.find('a[role="button"]').hide();
                            $tr.attr('style', null);
                        } else {
                            $tr.find('a[role="button"]').show();
                            $tr.attr('style', 'background-color:rgba(243, 233, 122, 0.36) !important');
                        }
                    });
                }
            });
            bindClick();
            bindSubmit();
        },
        uncut: function(){
            $(document).off('change', '#tbl-menu input[type="checkbox"]');
            $(document).off('click', '#tbl-menu .btn-add');
            $(document).off('click', '#tbl-menu .btn-edit');
            $(document).off('click', '#tbl-menu .btn-cancel');
            $(document).off('click', '#tbl-menu .btn-save');
            $(document).off('click', '#tbl-menu .btn-delete');
            $(document).off('click', '.zmdi-refresh');
        }
    };
}(jQuery);

(function ($) {

    $.fn.autoGrowInput = function (o) {

        o = $.extend({
            maxWidth: 1000,
            minWidth: 0,
            comfortZone: 70
        }, o);

        this.filter('input:text').each(function () {

            var minWidth = o.minWidth || $(this).width(),
                val = '',
                input = $(this),
                testSubject = $('<tester/>').css({
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    width: 'auto',
                    fontSize: input.css('fontSize'),
                    fontFamily: input.css('fontFamily'),
                    fontWeight: input.css('fontWeight'),
                    letterSpacing: input.css('letterSpacing'),
                    whiteSpace: 'nowrap'
                }),
                check = function () {

                    if (val === (val = input.val())) {
                        return;
                    }

                    // Enter new content into testSubject
                    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    testSubject.html(escaped);

                    // Calculate new width + whether to change
                    var testerWidth = testSubject.width(),
                        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone - 50 : minWidth,
                        currentWidth = input.width(),
                        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                            || (newWidth > minWidth && newWidth < o.maxWidth);

                    // Animate width
                    if (isValidWidthChange) {
                        input.width(newWidth);
                    }

                };

            testSubject.insertAfter(input);

            $(this).bind('keyup keydown blur update', check);

        });

        return this;

    };

})(jQuery);