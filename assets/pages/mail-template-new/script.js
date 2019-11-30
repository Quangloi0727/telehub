var DFT = function ($) {
    var selectedObj={};

    var newOption = function(obj){
        return _.Tags([
            {tag: 'option', attr: {class: 'option-g', value: obj._id}, content: obj.name}
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
                    $('#add-new-template #categoryId').append(newOption(g));
                });
                $("#add-new-template #categoryId").selectpicker('refresh');

            });
        });

        $("#add-category #dialog-btn-back").on('click', function(e){
            $('#frm-add-category').modal('toggle');
        })

        $('#frm-add-category').on('show.bs.modal', function () {
            var currentCompanyId= $('#companyId').val();
            $('#add-category #dialog_companyId option[value=' + currentCompanyId+']').attr("selected", "selected");
            $('#add-category #dialog_companyId').selectpicker('refresh');
        })

        $('#frm-add-category').on('hidden.bs.modal', function () {
            var status= $("#add-category #dialog_status").val()
            if(_.has(selectedObj, '_id')){
                $.get('/mail-template-categories?status=1&companyId=' + $('#companyId').val(), function(res){
                    $('#add-new-template #categoryId').empty();
                    _.each(res.data, function(g, i){
                        $('#categoryId').append(newOption(g));
                    });

                    var currentCategory= selectedObj._id;
                    $('#add-new-template #categoryId option[value=' + currentCategory+']').attr("selected", "selected");
                    $('#add-new-template #categoryId').selectpicker('refresh');
                    selectedObj={};
                });
            }
            $("#dialog_name").val("");
            $("#dialog_status").val(1);
        })


        $('#add-new-template .mail-holder').on('click', function(){
            var item= $(this).attr('id');
            CKEDITOR.instances['body'].insertText("%"+item+"%");
        });

    };

    var bindSubmit= function(){
        $('#add-new-template').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function(form, status){
                if(status){

                    //var valName= [{fieldId: 'name', fieldValue: $('#name').val(), categoryId: $('#categoryId').val()}];
                    var query= $.param({fieldId: 'name', fieldValue: $('#add-new-template #name').val(), categoryId: $('#add-new-template #categoryId').val()});
                    _Ajax("/mail-template/validate?"+query, 'GET', [], function(resp){
                        if(_.isEqual(resp[1], true)){
                            CKEDITOR.instances['body'].updateElement();
                            _AjaxData('/mail-template', 'POST', $('#add-new-template').getData(), function(res){
                                if(res.code==200){
                                    window.location.hash= "mail-template";
                                }else{
                                    swal({title: 'Lỗi !', text: res.message, type:"error"});
                                }
                            })
                        }else{
                            $('#add-new-template #name').validationEngine('showPrompt', 'Tên template đã tồn tại', 'error')
                            $('html, body').animate({
                                scrollTop: $("#add-new-template #name").offset().top - 100
                            }, 500);
                        }
                    });



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