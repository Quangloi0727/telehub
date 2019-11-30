var DFT = function ($) {
    var selectedObj={};


    var bindClick = function () {
        $(document).on('change', '#add-new-template #status', function () {
            $(this).val(Number($(this).is(':checked')));
        });


        $("#add-category #btn-back").on('click', function(e){
            window.history.back();
        })



    };

    var bindSubmit= function(){

        $('#add-category').validationEngine('attach', {
                    validateNonVisibleFields: true, autoPositionUpdate: true,
                    onValidationComplete: function(form, status){
                        if(status){

                            var query= $.param({fieldId: 'name', fieldValue: $('#add-category #name').val(), dialog_companyId: $('#add-category #companyId').val()});
                            _Ajax("/mail-template-categories/validate?"+query, 'GET', [], function(resp){
                                if(_.isEqual(resp[1], true)) {
                                    _AjaxData('/mail-template-categories', 'POST', $('#add-category').getData(), function(res){
                                        if(res.code==200){
                                            window.location.hash='/mail-template-categories';
                                        }else{
                                            swal({title: 'Lỗi !', text: res.message, type:"error"});
                                        }
                                    })
                                }else{
                                    $('#add-category #name').validationEngine('showPrompt', 'Tên nhóm đã tồn tại', 'error')
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
        $('#label_name').html(_config.MESSAGE.MAIL_TEMPLATE_CAT.LIST_NAME_COL_LABEL);
        $('#label_company').html(_config.MESSAGE.MAIL_TEMPLATE_CAT.LIST_COMPANY_COL_LABEL);
        $('#label_status').html(_config.MESSAGE.MAIL_TEMPLATE_CAT.LIST_STATUS_COL_LABEL);

    };


    return {
        init: function () {



            bindClick();
            bindSubmit();
            bindTextValue();
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