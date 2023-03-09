
(function ($) {
    "use strict";
    
    
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');
    
    $('.validate-form').on('submit',function(){
        buttonSpinner(true);
        let check = true;
        const toFetch = '/api/auth'+window.location.pathname
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

        let toSend;

        if(window.location.pathname=="/register"){
            toSend = new FormData(this);
        }else{
            toSend = new URLSearchParams(new FormData(this));
        }
        
        if(check){
            fetch(toFetch, {
                method: 'POST',
                body: toSend,
            }).then((res) => {
                return res.json()
            }).then((data) => {
                if(data.status === 201 || data.status === 202){
                    window.location.href = data.returnTo || '/user/profile';
                }else{
                    buttonSpinner(false);
                    window.location.href = data.returnTo+`?err=${data.msg}`;
                }
            }).catch((err) => {
                buttonSpinner(false);
                alert(err);
            })
        }
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