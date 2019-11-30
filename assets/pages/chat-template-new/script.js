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
            var url = '/company-channel?status=1&idCompany=' + $(this).val();
            if ($(this).val () == '-1'){
                url = '/company-channel?status=1';
            }
            $.get(url, function(res){
                $('#add-new-template #channelId').empty();
                _.each(res.channel, function(g, i){
                    $('#add-new-template #channelId').append(newOption(g));
                });
                $("#add-new-template #channelId").selectpicker('refresh');
            });
        });

//        $('#add-new-template .mail-holder').on('click', function(){
//            var item= $(this).attr('id');
//            CKEDITOR.instances['body'].insertText("%"+item+"%");
//        });

    };

    var bindSubmit= function(){
        $('#add-new-template').validationEngine('attach', {
            validateNonVisibleFields: true, autoPositionUpdate: true,
            onValidationComplete: function(form, status){
                if(status){
                    //var valName= [{fieldId: 'name', fieldValue: $('#name').val(), categoryId: $('#categoryId').val()}];
                    var query= $.param({fieldId: 'name', fieldValue: $('#add-new-template #name').val(), channelId: $('#add-new-template #channelId').val()});
                    _Ajax("/chat-template/validate?"+query, 'GET', [], function(resp){
                        if(_.isEqual(resp[1], true)){
                            CKEDITOR.instances['body'].updateElement();
                            _AjaxData('/chat-template', 'POST', $('#add-new-template').getData(), function(res){
                                if(res.code==200){
                                    window.location.hash= "chat-template";
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

    }


    return {
        init: function () {
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