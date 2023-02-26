async function deleteUser(){
    if(confirm('¿Está seguro de eliminar su cuenta?')){
        const response = await fetch('/api/user', {
            method: 'DELETE'
        });
        const responseJSON = await response.json();
        if(responseJSON.status){
            location.href = '/logout';
        }else{
            alert('Error al eliminar el usuario');
        }
    }
}
