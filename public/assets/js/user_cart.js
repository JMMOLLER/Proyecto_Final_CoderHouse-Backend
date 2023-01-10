const input_element = document.querySelector("input");
const buyBTN = document.getElementById('buy');

input_element.addEventListener("keyup", () => {
    input_element.setAttribute("value", input_element.value);
})

async function purchase(){
    const data = await fetch('/api/user/buy', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        }
    });
    const response = await data.json();
    return response;
}

buyBTN.addEventListener('click', async() => {
    purchaseAnimation()
    const response = await purchase();
    console.log(response);
    if(response.status){
        changeStatus('success');
        setTimeout(() => {
        window.location.href = '/';
        }, "3500")
    }else{
        changeStatus('failed');
        alert('No se pudo realizar la compra');
    }
});

function purchaseAnimation(){
    const elemment = document.querySelector('.sucess_purchase');
    document.body.style.overflow = 'hidden';
    elemment.style.display = 'flex';
}

function changeStatus(status){
    const el = document.querySelector('.circle-loader')
    el.classList.remove();
    el.classList.add('circle-loader');
    el.classList.add(status);
}