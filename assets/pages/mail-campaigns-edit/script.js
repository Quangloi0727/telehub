var DFT = function ($) {
    var CAMPAIGNTEMPLATE = {};

    var _rTemplate = function (str) {
        return str.replace(/(\%(.*)\%)/igm, "<span class='m-t' style='background-color: #ff0'>%\$2\%</span>");
    };
    var bindSubmit = function () {
        $('form#new-campaigns-mail').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true, scroll: true,
            onValidationComplete: function (form, status) {
                if (status) {
                    $.get('/mail-campaigns/validate?' + $.param({fieldId: 'name', fieldValue: form.find('input#name').val(), name: form.find('input[name="old_name"]').val(), setting: form.find('#edit_setting').selectpicker('val')}), function (resp) {
                        if (!resp[1]) {
                            form.find('input#name').validationEngine('showPrompt', 'Tên chiến dịch và cấu hình này đã được sử dụng', 'error', 'topRight', true);
                        } else {
                            _AjaxData(window.location.hash.replace('#', '').replace('/edit', ''), 'PUT', form.getData(), function (resp) {
                                if (_.isEqual(resp.code, 200)) {
                                    window.location.hash = '#mail-campaigns';
                                } else {
                                    swal({title: 'Lỗi !', text: resp.message, type: 'error'});
                                }
                            });
                        }
                    });
                }
            }
        });
    };

    var bindClick = function () {
        $('#new-campaigns-mail .btn.btn-primary').on('click', function () {
            $('#new-campaigns-mail #edit_type').val($(this).data('type'));
        });

    };

    var bindChange = function () {
        $('#new-campaigns-mail input[type="file"][name="upload"]').on('change.bs.fileinput', function (event) {
            event.preventDefault();
            if ($('#new-campaigns-mail #sources').val()) {
                swal({title: 'Thông báo', text: 'Bạn đã chọn nguồn thì không thể chọn file excel nữa !'});
                $('#new-campaigns-mail .fileinput').fileinput('clear');
                return false;
            }
            var self = this;
            if (self.files.length > 0) {
                if (!(self.files[0].type.indexOf('excel') > 0 || self.files[0].type.indexOf('officedocument.spreadsheetml.sheet') > 0)) {
                    swal({title: 'Thông báo', text: 'Tệp tin không hợp lệ !'});
                    $('#new-campaigns-mail .fileinput').fileinput('clear');
                    return false;
                }
            }
        });
        $('#new-campaigns-mail select#sources').on('change', function () {
            $('#new-campaigns-mail .fileinput').fileinput('clear');
        });
        $('#new-campaigns-mail select#edit_company').on('change', function () {
            var $this = $(this);
            var _company = $this.val() ? $this.val().toString() : null;
            if (!_company) {
                $this.validationEngine('validate');
                $('#new-campaigns-mail #mail-template-list > .panel').empty();
                $('#new-campaigns-mail select#edit_setting').empty().selectpicker('refresh');
            } else {
                _Ajax('/mail-campaigns?companyId=' + $this.val()[0], 'GET', [], function (resp) {
                    $this.trigger('click');
                    if (_.isEqual(resp.code, 200)) {
                        $this.validationEngine('validate');

                        $('#new-campaigns-mail #mail-template-list > .panel').html(_.Tags(_.chain(resp.templates).map(function (s) {
                            var i = _.createID();
                            return !s.ids.templates.length ? null : [{
                                tag: 'div', attr: {class: 'panel-heading', role: 'tab', id: 'collapse-' + i},
                                childs: [
                                    {
                                        tag: 'h5', attr: {class: 'panel-title'},
                                        childs: [{tag: 'a', attr: {class: 'btn-block', 'draggable': false, 'data-parent': '#mail-template-list', role: 'button', 'data-toggle': 'collapse', href: '#collapse-g-' + i, 'aria-controls': 'collapse-g-' + i}, content: s.ids.name}]
                                    }
                                ]
                            }, {
                                tag: 'div', attr: {class: 'panel-collapse collapse', role: 'tabpanel', id: 'collapse-g-' + i, 'aria-labelledby': 'collapse-' + i},
                                childs: [
                                    {
                                        tag: 'ul', attr: {class: 'list-group'},
                                        childs: _.chain(s.ids.templates).map(function (e) {
                                            return {tag: 'li', attr: {class: 'list-group-item p-5 p-l-10 p-r-10'}, childs: [{tag: 'div', attr: {class: 'tpl', draggable: true, 'data-id': e._id}, content: e.name}]};
                                        }).value()
                                    }
                                ]
                            }];
                        }).flatten().value()));

                        CAMPAIGNTEMPLATE = _.chain(resp.templates).reduce(function (memo, item, i) {
                            _.each(item.ids.templates, function (t) {
                                memo[t._id] = t.body;
                            });
                            return memo;
                        }, {}).value();

                        $('#new-campaigns-mail select#edit_setting').html(_.Tags(_.chain(resp.setting).map(function (s) {
                            return {tag: 'option', attr: {value: s._id, 'data-subtext': ' (' + s.send_user + ')'}, content: s.name};
                        }).value())).selectpicker('refresh').validationEngine('validate');
                        $('#new-campaigns-mail select#edit_setting').trigger('change');
                    }
                });
            }
        });
        $('#new-campaigns-mail select#edit_setting').on('change', function () {
            var str = _.trim($(this).find('option:selected').data('subtext'));
            $('#new-campaigns-mail input#edit_from').val(str.substring(1, str.length - 1));
        });
    };

    return {
        init: function () {
            CKEDITOR.document.getById('new-campaigns-mail').on('dragstart', function (evt) {
                if (!_.has(evt.data.getTarget().$.attributes, 'draggable')) return false;
                var target = evt.data.getTarget().getAscendant('div', true);
                CKEDITOR.plugins.clipboard.initDragDataTransfer(evt);
                var dataTransfer = evt.data.dataTransfer;
                dataTransfer.setData('content', CAMPAIGNTEMPLATE[target.data('id')]);
                dataTransfer.setData('text/html', target.getText());
                if (dataTransfer.$.setDragImage) {
                    //console.log(dataTransfer);
                    //dataTransfer.$.setDragImage(target.findOne('img').$, 0, 0);
                }
            });
            //CKEDITOR.document.getById('mail-template-list').on('dblclick', function (evt) {
            //    var target = evt.data.getTarget().getAscendant('div', true);
            //    if (target.data('id')) {
            //        CKEDITOR.instances['body_raw'].insertHtml(STEMPLATE[target.data('id')]);
            //        CKEDITOR.instances['body_raw'].updateElement();
            //    }
            //});
            if (!_.has(CKEDITOR.plugins.registered, 'campaigntpl')) {
                CKEDITOR.plugins.add('campaigntpl', {
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
                            CKEDITOR.instances['body_raw'].updateElement();
                        });
                    }
                });
            }

            $('#new-campaigns-mail #body_raw').ckeditor({entities: false, basicEntities: false, entities_greek: false, entities_latin: false, removePlugins: 'elementspath', extraPlugins: 'campaigntpl,dialog'});
            bindClick();
            bindSubmit();
            bindChange();
            //_Ajax('/mail-campaigns?companyId=' + $('#edit_company').val(), 'GET', [], function (resp) {
            //    console.log(resp);
            //});
            $('#new-campaigns-mail select#edit_company').trigger('change');
        },
        uncut: function () {
            $('#new-campaigns-mail select#sources').off('change');
            $('#new-campaigns-mail select#edit_company').off('change');
            $('#new-campaigns-mail select#edit_setting').off('change');
            $('#new-campaigns-mail .btn.btn-primary').off('click');
            $('#new-campaigns-mail input[type="file"][name="upload"]').off('change.bs.fileinput');
            $('form#new-campaigns-mail').validationEngine('detach');
            $('#new-campaigns-mail').remove();
        }
    };
}(jQuery);