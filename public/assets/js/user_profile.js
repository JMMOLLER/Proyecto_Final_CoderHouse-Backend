let editMode = false;

function EnableEditeMode() {
    editMode = !editMode;
    const delete_btn = document.getElementById("btn_delete");
    const btn_save = document.getElementById("btn_saveChanges");
    const addres_input = document.getElementById("input_address");
    const age_input = document.getElementById("input_age");
    const phone_input = document.getElementById("input_phone");
    const uploadFile = document.getElementById("uploadFile");
    if (editMode) {
        delete_btn.style.display = "none";
        btn_save.style.display = "block";
        uploadFile.style.display = "block";
        addres_input.contentEditable = true;
        age_input.contentEditable = true;
        phone_input.contentEditable = true;
        addres_input.style.border = "1px solid #ccc";
        age_input.style.border = "1px solid #ccc";
        phone_input.style.border = "1px solid #ccc";
    } else {
        delete_btn.style.display = "block";
        btn_save.style.display = "none";
        uploadFile.style.display = "none";
        addres_input.contentEditable = false;
        age_input.contentEditable = false;
        phone_input.contentEditable = false;
        addres_input.style.border = "none";
        age_input.style.border = "none";
        phone_input.style.border = "none";
    }
}
function spinnerAnimation(isLoading) {
    const spinner = document.getElementsByClassName("container_change")[0];
    if (isLoading) {
        document.body.style.overflow = "hidden";
        spinner.classList.remove("spinner-hidden");
    } else {
        spinner.classList.add("spinner-hidden");
    }
}
async function saveChanges() {
    spinnerAnimation(true);
    const phone_number = document.getElementById("input_phone").innerHTML;
    const address = document.getElementById("input_address").innerHTML;
    const age = document.getElementById("input_age").innerHTML;
    const avatar = document.getElementById("uploadFile").files[0];
    const data = new FormData();
    data.append("phone_number", phone_number);
    data.append("address", address);
    data.append("age", age);
    data.append("avatar", avatar);
    await $.ajax({
        url: "/api/user/update?admin=true",
        type: "PUT",
        data: data,
        processData: false,
        contentType: false,
        success: (data) => {
            if (data.status === 200) {
                alert("Cambios guardados");
                location.reload();
            } else {
                alert("Error al guardar los cambios");
            }
        },
        error: (err) => {
            alert("Error al guardar los cambios");
            location.href = err.responseJSON.returnTo+`?err=${err.responseJSON.msg}`;
        }
    })
    spinnerAnimation(false);
}

async function deleteUser() {
    if (confirm("¿Está seguro de eliminar su cuenta?")) {
        $.ajax({
            url: "/api/user/?admin=true",
            type: "DELETE",
            success: (data) => {
                if (data.status === 200 && data.value) {
                    window.location.href = "/";
                }
            },
            error: (err) => {
                alert(err.responseJSON.msg);
                console.log(err);
            },
        });
    }
}
