var DFT = function ($) {

    var STEMPLATE = [];

    var _rTemplate = function (str) {
        return str.replace(/(\%(.*)\%)/igm, "<span class='m-t' style='background-color: #ff0'>%\$2\%</span>");
    };

    var objectFormData = function (obj, form, namespace) {
        var fd = form || new FormData();
        var formKey;
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (namespace) {
                    formKey = namespace + '[' + property + ']';
                } else {
                    formKey = property;
                }
                if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
                    objectFormData(obj[property], fd, property);
                } else {
                    fd.append(formKey, obj[property]);
                }
            }
        }
        return fd;

    };

    var bindSubmit = function () {
        $('#tab-crm form#new-mail').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function (form, status) {
                if (status) {
                    var _ids = [];
                    async.each(form.find('#to').val().split(','), function (m, callback) {
                        $.ajax({ url: '/customer', method: 'POST', data: objectFormData({ field_e_mail: m }), cache: false, contentType: false, processData: false }).done(function (resp) {
                            if (_.has(resp, 'customer')) _ids.push(resp.customer._id);
                            callback(null);
                        });

                    }, function (error) {
                        var formData = form.getData();
                        formData.append('customer', _ids);
                        _AjaxData('/mail', 'POST', formData, function (resp) {
							swal({title: 'Thành công', text: 'Gửi mail thành công', type: "success"}, function(){
								$('.page-loader').hide();
							});
                        });
                    });
                }
            }
        });
    };

    var bindChange = function () {
        $(document).on('change', '#tab-crm form#new-mail select#from', function () {
            var $this = $(this);
            var _company = $this.find("option:selected").data('company');
            $('#tab-crm form#new-mail #new-mail-template-list > .panel').empty();
            if (_company) {
                _Ajax('/mail?companyId=' + _company, 'GET', [], function (resp) {
                    $('#tab-crm form#new-mail select#from').selectpicker('toggle');
                    if (_.isEqual(resp.code, 200)) {
                        var _listCategory = [];
                        STEMPLATE = [];
                        _.each(resp.data, function (t, i) {
                            if (t.ids.templates.length) {
                                _listCategory.push(
                                    {
                                        tag: 'div', attr: { class: 'panel-heading', role: 'tab', id: 'collapse-' + i },
                                        childs: [
                                            {
                                                tag: 'h5', attr: { class: 'panel-title' },
                                                childs: [{ tag: 'a', attr: { class: 'btn-block', 'data-parent': '#mail-template-list', role: 'button', 'data-toggle': 'collapse', href: '#collapse-g-' + i, 'aria-controls': 'collapse-g-' + i }, content: t.ids.name }]
                                            }
                                        ]
                                    },
                                    {
                                        tag: 'div', attr: { class: 'panel-collapse collapse', role: 'tabpanel', id: 'collapse-g-' + i, 'aria-labelledby': 'collapse-' + i },
                                        childs: [
                                            {
                                                tag: 'ul', attr: { class: 'list-group' },
                                                childs: _.chain(t.ids.templates).map(function (e) {
                                                    return { tag: 'li', attr: { class: 'list-group-item' }, childs: [{ tag: 'div', attr: { class: 'contact h-card', draggable: true, 'data-id': e._id }, content: e.name }] };
                                                }).value()
                                            }
                                        ]
                                    });
                                _.each(t.ids.templates, function (v) {
                                    STEMPLATE[v._id] = v.body;
                                });
                            }
                        });
                        $('#tab-crm form#new-mail #new-mail-template-list > .panel').html(_.Tags(_listCategory));
                        $this.trigger('click');
                    }
                });
            }
        });
    };

    return {
        init: function () {
            CKEDITOR.document.getById('new-mail-template-list').on('dragstart', function (evt) {
                if (!_.has(evt.data.getTarget().$.attributes, 'draggable')) return false;
                var target = evt.data.getTarget().getAscendant('div', true);
                CKEDITOR.plugins.clipboard.initDragDataTransfer(evt);
                var dataTransfer = evt.data.dataTransfer;
                dataTransfer.setData('content', STEMPLATE[target.data('id')]);
                dataTransfer.setData('text/html', target.getText());
                if (dataTransfer.$.setDragImage) {
                    //console.log(dataTransfer);
                    //dataTransfer.$.setDragImage(target.findOne('img').$, 0, 0);
                }
            });
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
            $('#new-mail #body_raw').ckeditor({ entities: false, basicEntities: false, entities_greek: false, entities_latin: false, removePlugins: 'elementspath', extraPlugins: 'campaigntpl,dialog' });
            $('#new-mail #to').select2({
                tags: ['cuongnm@dft.vn', 'cuongden@abc.com'],
                minimumResultsForSearch: -1,
                showSearchBox: false, tokenSeparators: [';', ' '],
                createSearchChoice: function (input) {
                    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(input) ? { id: input, text: input } : null;
                }
            });

            //$('#new-mail #to').select2({
            //    tags: true,
            //    tokenSeparators: [','],
            //    createSearchChoice: function (input) {
            //        return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(input) ? { id: input, text: input } : null;
            //    },
            //    ajax: {
            //        url: '/mail',
            //        dataType: 'json', 
            //        data: function (term, page) {
            //            return {
            //                field_e_mail: term
            //            };
            //        },
            //        results: function (data, page) {
            //            console.log(data);
            //            return {
            //                results: data
            //            };
            //        }
            //    },

            //    // Take default tags from the input value

            //});

            _socket.on('MailSentResponse', function (data) {
            });

            bindChange();
            bindSubmit();
        },
        uncut: function () {
            $(document).off('change', '#tab-crm form#new-mail select#from');
            $(document).off('dblclick', '#mail-template-list div.h-card');
            $('#tab-crm form#new-mail').validationEngine('detach');
            $('[class^="select2-"]').remove();
        }
    };
} (jQuery);