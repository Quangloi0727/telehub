var DFT = function ($) {
    var selectedObj={};

    var newOption = function(obj){
        var tag= {};
        if(_.isEqual(obj._id, cCateId)){
            tag= {tag: 'option', attr: {class: 'option-g', value: obj._id},  sattr: ['selected'], content: obj.name};
        }else{
            tag= {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name};
        }
        return _.Tags([
            tag
        ]);
    };

    var bindClick = function () {
        $(document).on('change', '#add-new-template #status', function () {
            $(this).val(Number($(this).is(':checked')));

        });
        $(document).on('change', '#add-new-template #companyId', function(e){
            $.get('/mail-template-categories?status=1&companyId=' + $(this).val(), function(res){
                $('#add-new-template #categoryId').empty();
                _.each(res.data, function(g, i){
                    $('#categoryId').append(newOption(g));
                });
                $("#add-new-template #categoryId").selectpicker('refresh');

            });
        });

        $("#dialog-btn-back").on('click', function(e){
            $('#frm-add-category').modal('toggle');
        })

        $('#frm-add-category').on('show.bs.modal', function () {
            var currentCompanyId= $('#add-new-template #companyId').val();
            $('#dialog_companyId option[value=' + currentCompanyId+']').attr("selected", "selected");
            $('#dialog_companyId').selectpicker('refresh');
        })

        $('#frm-add-category').on('hidden.bs.modal', function () {
            var status= $("#add-new-template #dialog_status").val()
            if(_.has(selectedObj, '_id')){
                $.get('/mail-template-categories?status=1&companyId=' + $('#add-new-template #companyId').val(), function(res){
                    $('#add-new-template #categoryId').empty();
                    _.each(res.data, function(g, i){
                        $('#categoryId').append(newOption(g));
                    });

                    var currentCategory= selectedObj._id;
                    $('#categoryId option[value=' + currentCategory+']').attr("selected", "selected");
                    $('#categoryId').selectpicker('refresh');
                    selectedObj={};
                });
            }
            $("#dialog_name").val("");
            $("#dialog_status").val(1);
        })

        //$('#dialog-btn-submit').on('click', function(){
        //    $('#add-category').validationEngine('validate', {
        //        validateNonVisibleFields: true, autoPositionUpdate: true,
        //        onValidationComplete: function(form, status){
        //            if(status){
        //
        //                _AjaxData('/mail-template-categories', 'POST', $('#add-category').getData(), function(res){
        //                    console.log(res);
        //                    if(res.code==200){
        //                        $('#frm-add-category').modal('toggle');
        //
        //                        selectedObj= res.data;
        //                    }else{
        //                        swal({title: 'Lỗi !', text: res.message, type:"error"});
        //                    }
        //                })
        //
        //            }else{
        //            }
        //        }
        //    });
        //})

        //$('#btn-submit').on('click', function(){
        //
        //    $('#add-new-template').validationEngine('validate', {
        //        validateNonVisibleFields: true, autoPositionUpdate: true,ajaxFormValidation:true,
        //            onValidationComplete: function(form, status){
        //            console.log(status)
        //            console.log(form)
        //            if(status){
        //                CKEDITOR.instances['body'].updateElement();
        //                _AjaxData('/mail-template', 'POST', $('#add-new-template').getData(), function(res){
        //                    if(res.code==200){
        //                        window.location.hash= "mail-template";
        //                    }else{
        //                        swal({title: 'Lỗi !', text: res.message, type:"error"});
        //                    }
        //                })
        //
        //            }else{
        //            }
        //        },
        //        onAjaxFormComplete: function(status, form, errors, options){
        //            console.log(107, status);
        //        }
        //    });
        //
        //})

        $('.mail-holder').on('click', function(){
            var item= $(this).attr('id');
            CKEDITOR.instances['body'].insertText("%"+item+"%");
        });

    };

    var bindSubmit= function(){
        $('#add-new-template').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function(form, status){
                if(status){

                    if(_.isEqual($('#add-new-template #current_name').val(), $('#add-new-template #name').val())){
                        CKEDITOR.instances['body'].updateElement();
                        _AjaxData(window.location.hash.replace('/edit', '').replace('#',''), 'PUT', $('#add-new-template').getData(), function(res){
                            if(res.code==200){
                                window.location.hash= "mail-template";
                            }else{
                                swal({title: 'Lỗi !', text: res.message, type:"error"});
                            }
                        })
                    }else{
                        var query= $.param({fieldId: 'name', fieldValue: $('#add-new-template #name').val(), categoryId: $('#add-new-template #categoryId').val()});
                        _Ajax("/mail-template/validate?"+query, 'GET', [], function(resp){
                            if(_.isEqual(resp[1], true)){
                                CKEDITOR.instances['body'].updateElement();
                                _AjaxData(window.location.hash.replace('/edit', '').replace('#',''), 'PUT', $('#add-new-template').getData(), function(res){
                                    if(res.code==200){
                                        window.location.hash= "mail-template";
                                    }else{
                                        swal({title: 'Lỗi !', text: res.message, type:"error"});
                                    }
                                })
                            }else{
                                $('#add-new-template #name').validationEngine('showPrompt', 'Tên template đã tồn tại', 'error');
                                $('html, body').animate({
                                    scrollTop: $("#add-new-template #name").offset().top - 100
                                }, 500);
                            }
                        });
                    }




                }else{
                }
            }

        });

        $('#add-category').validationEngine('attach', {
                    validateNonVisibleFields: true, autoPositionUpdate: true,
                    onValidationComplete: function(form, status){
                        if(status){

                            var query= $.param({fieldId: 'dialog_name', fieldValue: $('#add-category #dialog_name').val(), dialog_companyId: $('#add-category #dialog_companyId').val()});
                            _Ajax("/mail-template-categories/validate?"+query, 'GET', [], function(resp){
                                if(_.isEqual(resp[1], true)) {
                                    _AjaxData('/mail-template-categories', 'POST', $('#add-category').getData(), function(res){
                                        if(res.code==200){
                                            $('#frm-add-category').modal('toggle');
                                            selectedObj= res.data;
                                        }else{
                                            swal({title: 'Lỗi !', text: res.message, type:"error"});
                                        }
                                    })
                                }else{
                                    $('#add-category #dialog_name').validationEngine('showPrompt', 'Tên nhóm đã tồn tại', 'error')
                                    $('html, body').animate({
                                        scrollTop: $("#add-category #dialog_name").offset().top - 100
                                    }, 500);
                                }
                            });


                        }else{

                        }
                    }
                });
    }

    var bindTextValue = function () {
        $('#txt_template_name').html(_config.MESSAGE.MAIL_TEMPLATE.LIST_NAME_COL_LABEL);
        $('#txt_template_company').html(_config.MESSAGE.MAIL_TEMPLATE.LIST_COMPANY_COL_LABEL);
        $('#txt_template_category').html(_config.MESSAGE.MAIL_TEMPLATE.LIST_CATEGORY_COL_LABEL);
        $('#txt_template_body').html(_config.MESSAGE.MAIL_TEMPLATE.LABEL_BODY);
        $('#txt_template_placeholder').html(_config.MESSAGE.MAIL_TEMPLATE.LABEL_PLACE_HOLDER);
        $('#dialog_label_name').html(_config.MESSAGE.MAIL_TEMPLATE.LIST_NAME_COL_LABEL);
        $('#dialog_label_company').html(_config.MESSAGE.MAIL_TEMPLATE.LIST_CATEGORY_COL_LABEL);

    };


    return {
        init: function () {


            bindTextValue();
            CKEDITOR.document.getById('body');
            CKEDITOR.replace('body');

            //$.validationEngineLanguage.allRules['validateCategoryExist'] = {
            //    "url": "/mail-template-categories/validate",
            //    "extraData": '',
            //    "extraDataDynamic": ['#dialog_companyId'],
            //    "alertText": "* Tên nhóm đã được sử dụng",
            //    "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            //};
            //$.validationEngineLanguage.allRules['validateTemplateExist'] = {
            //    "url": "/mail-template/validate",
            //    "extraData": '',
            //    "extraDataDynamic": ['#categoryId'],
            //    "alertText": "* Tên template đã được sử dụng",
            //    "alertTextLoad": "<i class='fa fa-spinner fa-pulse m-r-5'></i> Đang kiểm tra, vui lòng đợi."
            //};

            $( document ).ready(function() {
                $.get('/mail-template-categories?status=1&companyId=' + $('#companyId').val(), function(res){
                    $('#categoryId').empty();
                    _.each(res.data, function(g, i){
                        $('#categoryId').append(newOption(g));
                    });
                    $("#categoryId").selectpicker('refresh');

                });
            });

            bindClick();
            bindSubmit();
            $(document).ready(function() {
                $(window).keydown(function(event){
                    if(event.keyCode == 13) {
                        event.preventDefault();
                        return false;
                    }
                });
            });
        },
        uncut: function(){
            $('#add-new-template #status').off('change');
            $('#add-new-template #companyId').off('change');
            $('#add-new-template').validationEngine('detach');
            $('#add-category').validationEngine('detach');
            $('#frm-add-category').off('hidden.bs.modal');
            $("#dialog-btn-back").off('click');
            $('#frm-add-category').off('show.bs.modal');
            $('.mail-holder').off('click')
        }
    };
}(jQuery);



//var test= function(field, rules, i, options){
//
//    $('#test').validationEngine('showPrompt', 'This a custom msg', 'error')
//    $('html, body').animate({
//        scrollTop: $("#test").offset().top-100
//    }, 500);
//}