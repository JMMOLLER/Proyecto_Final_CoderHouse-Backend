
(function ($) {
    "use strict";
    
    
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');
    
    $('.validate-form').on('submit',function(){
        buttonSpinner(true);
        let check = true;
        const url = new URL(window.location.href);
        for(let i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }else if(input[i].id=="re_password"){
                if(input[i].value!=input[i-1].value){
                    showValidate(input[i]);
                    check=false;
                }
            }
        }
        buttonSpinner(check);
        const to_send=$(this).serialize()+"&userid="+url.pathname.split('/')[2]
        if(check)
            $.ajax({
                url: '/api/user/completeRegister?admin=true',
                type: 'POST',
                data: to_send,
                success: (data) => {
                    if(data.status==200){
                        alert("Usuario completado correctamente");
                        location.href="/user/profile";
                    }
                },
                error: (err) => {
                    buttonSpinner(false);
                    if(err.responseJSON.status==500){
                        location.href = err.responseJSON.returnTo+`?err=${err.responseJSON.msg}`;
                    }else{
                        alert(err.responseJSON.msg);
                    }
                }
            });
        return false;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function buttonSpinner(isLoading){
        if(isLoading){
            document.getElementById("spinnerBtn").style.display = "inline-block";
            document.getElementById("spanBtnText").classList.add("visually-hidden");
        }else{
            document.getElementById("spinnerBtn").style.display = "none";
            document.getElementById("spanBtnText").classList.remove("visually-hidden");
        }
    }

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