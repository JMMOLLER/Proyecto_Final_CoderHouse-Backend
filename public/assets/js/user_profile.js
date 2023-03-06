async function deleteUser(){
    if(confirm('¿Está seguro de eliminar su cuenta?')){
        $.ajax({
            url: '/api/user/?admin=true',
            type: 'DELETE',
            success: (data) => {
                if(data.status === 200 && data.value){
                    window.location.href = '/';
                }
            },
            error: (err) => {
                alert(err.responseJSON.msg)
                console.log(err);
            }
        })
    }
}
