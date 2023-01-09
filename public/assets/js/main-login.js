
(function ($) {
    "use strict";
    
    
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');
    
    $('.validate-form').on('submit',function(){
        let check = true;
        let isRegister = false;
        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }else if(input[i].id=="re_password"){
                isRegister = true;
                if(input[i].value!=input[i-1].value){
                    showValidate(input[i]);
                    check=false;
                }
            }
        }
        if(check && isRegister)
            process(event);
        return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();
        
        if(input.id=="phone")
            $(thisAlert).addClass('phone-error');
        else
            $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);