const phoneInputField = document.querySelector("#phone");
const phoneInput = window.intlTelInput(phoneInputField, {
    utilsScript:
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});
function process(event) {
    event.preventDefault();
    const phoneNumber = phoneInput.getNumber();
    phoneInputField.value = phoneNumber;
    event.target.submit();
}
function dropdown(){
    const input = document.querySelector(".input-avatar");
    const select = document.querySelector("#selector");
    if (select.value == 0) {
        input.type = "text";
        input.placeholder = "URL";
    } else {
        input.type = "file";
        input.placeholder = "Archivo";
    }
}
window.onload = () => {
    const element = document.querySelector(".iti--allow-dropdown");
    element.style.width = "100%";
    const div = document.querySelector(".form-option");
    const arrow = document.querySelector(".arrow");
    div.addEventListener('click', dropdown);
};