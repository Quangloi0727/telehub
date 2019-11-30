/**
 * Created by MrBlack on 4/11/2016.
 */
window.mail_filter = {
    mail_type: 2,
    readed: 0
};

function MailFilterParams() {
    delete mail_filter.sort;
    var _options = $('#mail-tbl-' + $('#mail-task-lists .list-group-item.active').data('type') + '-container table').bootstrapTable('getOptions') || {};

    if (_.has(_options, 'sortName')) mail_filter['sort'] = _options.sortName + ':' + _options.sortOrder;
    var _search = $('#mail-tbl-' + $('#mail-task-lists .list-group-item.active').data('type') + '-container input[type="text"]').val();
    return _search ? _.extend(mail_filter, {keyword: _search}) : _.omit(mail_filter, 'keyword');
};

function truncateOnWord(str, limit) {
    var trimmable = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF';
    var reg = new RegExp('(?=[' + trimmable + '])');
    var words = str.split(reg);
    var count = 0;
    return words.filter(function (word) {
        count += word.length;
        return count <= limit;
    }).join('');
};

function TableCellDateFormat(value) {
    return moment(value, 'DD/MM/YYYY HH:mm:ss', true).isValid() ? moment(value, 'DD/MM/YYYY HH:mm:ss').format("DD/MM/YYYY HH:mm") : moment(value).format("DD/MM/YYYY HH:mm");
}

(function ($) {
    "use strict";
    var TABTEMPLATE = [];
    var REPLACEMENTS = {};

    var _this = function (s) {
        return _.trim('body > .tab-content > .tab-pane#tab-mail ' + s);
    };

    var _rTemplate = function (str) {
        return str.replace(/(\%(.*)\%)/igm, "<span class='m-t' style='background-color: #ff0'>%\$2\%</span>");
    };

    var decodeEntities = (function () {
        var element = document.createElement('div');

        function decodeHTMLEntities(str) {
            if (str && typeof str === 'string') {
                // strip script/html tags
                str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
                str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                element.innerHTML = str;
                str = element.textContent;
                element.textContent = '';
            }

            return str;
        }

        return decodeHTMLEntities;
    })();

    var _currentMail = {};

    var MailContainer = window.MailContainer = Object.create({
        init: function () {
            this.container = $(_this);
            this.counter = 0;
            this.tabCounter = Object.create({
                counter: 0,
                tab: $('ul.main-tabs a[href="#tab-mail"]'),
                bagde: $('ul.main-tabs a[href="#tab-mail"] i.tmn-counts'),
                update: function (add) {
                    add ? this.counter += add : (this.counter == 0 ? 0 : this.counter--);
                    add ? this.tab.removeClass('blink').addClass('blink') : null;
                    this.bagde.text(this.counter);
                    this.counter ? this.bagde.show() : this.bagde.hide();
                    return this.parent;
                }
            });
            this.tabCounter.parent = this;
            return this;
        },
        addRow: function (table, row, type) {
            $(_this('#mail-tbl-' + table + '-container table')).bootstrapTable('insertRow',
                {
                    index: -1,
                    row: _.extend(_.omit(row, 'body_raw', 'subject_raw'), {
                        body: truncateOnWord(row.body, 200),
                        checked: false,
                        created: moment(row.created).format('DD/MM/YYYY')
                    })
                });
            $(_this('#mail-tbl-' + table + '-container table')).bootstrapTable('refresh');
            return this;
        },
        removeRow: function (table, row) {
            console.log(_.omit(row, 'body_raw', 'subject_raw'));
            return this;
        },
        updatedCustomer: function (customer) {
            console.log(customer);
        },
        updatedTicket: function (data) {
            if (data.ticket && !_.isUndefined(_currentMail)) {
                _currentMail.mail_status = data.ticket.status;
            }
        }
    });

    $(document).ready(function () {

        var STEMPLATE = null;

        $(this).on('click', _this('#mail-task-lists a.task'), function () {
            var $this = $(this);
            var query = '?';
            switch ($this.data('type')) {
                case 'new':
                    window.mail_filter = {
                        readed: 0
                    };
                    break;
                case 'unprogressing':
                    window.mail_filter = {
                        readed: 1
                    };
                    break;
                case 'progressing':
                    window.mail_filter = {
                        readed: 1,
                        ticket: 1
                    };
                    break;
                case 'progressed':
                    window.mail_filter = {
                        readed: 1,
                        ticket: 2
                    };
                    break;
            }
            window.mail_filter['page'] = $(_this('#mail-tbl-' + $this.data('type') + '-container .pagination .page-number.active')).text() || 1;
            $(_this('#mail-tbl-' + $this.data('type') + '-container table')).bootstrapTable('refresh');
            $(_this('#list-mail')).show();
            $(_this('#detail-mail')).hide();

            //$('#iframe1').contents().find('html')
            //_Ajax('/mail-client?' + $.param(query), 'GET', [], function (resp) {
            //    if (!_.isEqual(resp.code, 200)) return;
            //    $(_this('#mail-tbl-' + $this.data('type') + '-container table')).bootstrapTable('removeAll');
            //    _.each(resp.data, function (m) {
            //        MailContainer.addRow($this.data('type'), m, 'prepend');
            //    });
            //    $this.addClass('active').siblings('.task').removeClass('active');
            //});

            $this.addClass('active').siblings('.task').removeClass('active');
            $($this.data('target')).show().siblings(':not(.lv-header-alt)').hide();
            $(_this('.lv-header-alt h2.lvh-label')).text($this.data('text'));
            //MailContainer.detail.h(function () {
            //    _currentMail = {};
            //    MailContainer.lists.s();
            //});
        });

        $(this).on('click', _this('#detail-mail button.btn-reply'), function () {
            _currentMail.body = decodeEntities(_.trim(_.stripTags(CKEDITOR.instances['reply-container'].document.getBody().getHtml())));
            if (!_currentMail.body.length) return;
            _currentMail.body_raw = CKEDITOR.instances['reply-container'].getData();
            //_currentMail.body_raw = CKEDITOR.instances['reply-container'].document.getBody().getHtml();
            var formData = new FormData();
            $.each(_currentMail, function (i, o) {
                formData.append(i, o);
            });
            _AjaxData('/mail-client', 'POST', formData, function (resp) {
                if (_.isEqual(resp.code, 200)) {
                    $(_this('#mail-task-lists a.task.active')).trigger('click');
                } else {
                    console.log(resp);
                }
            });
        });

        $(this).on('click', _this('.btn-refresh-tbl'), function () {
            if ($('#avdSearchModalContent_advancedTable form')[0]) $('#avdSearchModalContent_advancedTable form')[0].reset();
            $(_this('table[data-toggle="table"]')).bootstrapTable('clear');
        });

        $(this).on('click', _this('#mail-tbl-new-container .pagination a'), function () {
            console.log(window.mail_filter);
        });

        //$(this).on('click', _this('table[data-toggle="table"] tr'), function () {
        //    $(_this('#list-mail')).hide();
        //    $(_this('#detail-mail')).show();
        //});

        $(_this('table[data-toggle="table"]')).on('click-row.bs.table', function (e, row, $element) {
            //$.get('/mail-client/' + row._id, function (res) {
            //    console.log(res);
            //})
            _currentMail = {from: row.to, to: row.from, subject: row.subject, subject_raw: row.subject_raw, mailId: row._id};
            CKEDITOR.instances['reply-container'].setData('');
            $(_this('#list-mail')).hide();
            $(_this('#detail-mail > h4')).text(row.subject_raw);
            $(_this('#detail-mail #from.text-muted')).text(row.from);
            $(_this('#detail-mail .content iframe')).contents().find('html').html(row.body_raw);
            $(_this('#detail-mail')).show();
            $(_this('#detail-mail a[href="#tab-1"]')).trigger('click');
            $(_this('#detail-mail .tab-content #tab-2')).empty().append(_.Tags([
                {tag: 'iframe', attr: {style: 'width: 100%;border: none;min-height: 500px;', src: '/ticket?' + $.param({type: 'mail', service: row.service._id, mailId: row._id, field_e_mail: _.trim(row.from)})}}
            ]));
            _Ajax('/mail?companyId=' + row.service.idCompany, 'GET', [], function (resp) {
                if (_.isEqual(resp.code, 200)) {
                    var _listCategory = [];
                    TABTEMPLATE = [];
                    _.each(resp.data, function (t, i) {
                        _listCategory.push({
                            tag: 'div', attr: {class: 'panel-heading', role: 'tab', id: 'collapse-' + i},
                            childs: [
                                {
                                    tag: 'h5', attr: {class: 'panel-title'},
                                    childs: [{tag: 'a', attr: {class: 'btn-block', 'data-parent': '#mail-template-list', role: 'button', 'data-toggle': 'collapse', href: '#collapse-g-' + i, 'aria-controls': 'collapse-g-' + i}, content: t.ids.name}]
                                }
                            ]
                        }, {
                            tag: 'div', attr: {class: 'panel-collapse collapse', role: 'tabpanel', id: 'collapse-g-' + i, 'aria-labelledby': 'collapse-' + i},
                            childs: [
                                {
                                    tag: 'ul', attr: {class: 'list-group'},
                                    childs: _.chain(t.ids.templates).map(function (e) {
                                        return {tag: 'li', attr: {class: 'list-group-item'}, childs: [{tag: 'div', attr: {class: 'contact h-card', draggable: true, 'data-id': e._id}, content: e.name}]};
                                    }).value()
                                }
                            ]
                        });
                        _.each(t.ids.templates, function (v) {
                            TABTEMPLATE[v._id] = v.body;
                        });
                    });
                    $(_this('#detail-mail .tab-content #tab-1 #tab-mail-template-list')).html(_.Tags(_listCategory));
                }
            });
            _Ajax('/mail-client/' + row._id, 'PUT', [{readed: 1}], function (resp) {
                console.log(resp);
            });
        });

        _socket.on('connect', function (data) {
            console.log(this.socket.sessionid);
        });

        _socket.on('MailSentResponse', function (data) {
            console.log(data);
        });

        _socket.on('MailComming', function (data) {
            console.log(data);
            MailContainer.addRow('new', data, 'prepend').tabCounter.update(1);
        });
        CKEDITOR.document.getById('tab-mail-template-list').on('dragstart', function (evt) {
            if (!_.has(evt.data.getTarget().$.attributes, 'draggable')) return false;
            var target = evt.data.getTarget().getAscendant('div', true);
            CKEDITOR.plugins.clipboard.initDragDataTransfer(evt);
            var dataTransfer = evt.data.dataTransfer;
            dataTransfer.setData('content', TABTEMPLATE[target.data('id')]);
            dataTransfer.setData('text/html', target.getText());
            if (dataTransfer.$.setDragImage) {
                //console.log(dataTransfer);
                //dataTransfer.$.setDragImage(target.findOne('img').$, 0, 0);
            }
        });
        if (!_.has(CKEDITOR.plugins.registered, 'replytpl')) {
            CKEDITOR.plugins.add('replytpl', {
                requires: 'widget',
                init: function (editor) {
                    editor.widgets.add('stemplate', {
                        allowedContent: 'span(!m-t); a[href](!u-email,!p-name); span(!p-tel)',
                        requiredContent: 'span(m-t)',
                        pathName: 'stemplate',
                        upcast: function (el) {
                            return el.name == 'span' && el.hasClass('m-t');
                        }
                    });
                    editor.addFeature(editor.widgets.registered.stemplate);
                    editor.on('paste', function (evt) {
                        var _content = evt.data.dataTransfer.getData('content');
                        if (_content) evt.data.dataValue = _rTemplate(_content);
                        CKEDITOR.instances['reply-container'].updateElement();
                    });
                }
            });
        }

        $(_this('#reply-container')).ckeditor({entities: false, basicEntities: false, entities_greek: false, entities_latin: false, removePlugins: 'elementspath', extraPlugins: 'replytpl,dialog'});

        MailContainer.init();
    });
})(jQuery);