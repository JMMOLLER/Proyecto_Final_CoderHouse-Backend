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
        setTimeout(() => {
            const elemment = document.querySelector('.sucess_purchase');
            elemment.style.display = 'none';
        }, "2500")
        validateTotal();
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

function validateTotal(){
    const value = Number(document.querySelector('#subtotal').textContent.substr(1));
    const quantity = Number(document.querySelector('#quantity').textContent.substr(0,1)).toFixed();
    const btn_ship = document.querySelector('#type_shipping');
    const btn_buy = document.querySelector('#buy');
    if (value <= 0 && quantity <= 0){
        btn_ship.setAttribute('disabled', '');
        btn_ship.style.cursor = 'not-allowed';
        btn_buy.setAttribute('disabled', '');
    }
}

validateTotal();