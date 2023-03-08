const input_element = document.querySelector("input");
const buyBTN = document.getElementById("buy");

document.getElementById('type_shipping').addEventListener('change', updatePrice)

input_element.addEventListener("keyup", () => {
    input_element.setAttribute("value", input_element.value);
});

async function purchase(shipping_value) {
    const data = await fetch("/api/user/buy?admin=true", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ shipping: shipping_value }),
    });
    const response = await data.json();
    return response;
}

buyBTN.addEventListener("click", async () => {
    purchaseAnimation();
    const shipping = document.getElementById("type_shipping");
    const shipping_value = Number(
        shipping.options[shipping.selectedIndex].value
    );
    const response = await purchase(shipping_value);
    if (response.status == 200) {
        changeStatus("success");
        setTimeout(() => {
            window.location.href = response.returnTo || '/user/ordenes';
        }, "3500");
    } else {
        changeStatus("failed");
        setTimeout(() => {
            const elemment = document.querySelector(".sucess_purchase");
            elemment.style.display = "none";
            if(response.status == 500){
                window.location.href = response.returnTo+`?err=${response.msg}`;
            }
        }, "2500");
        validateTotal();
    }
});

function purchaseAnimation() {
    const elemment = document.querySelector(".sucess_purchase");
    document.body.style.overflow = "hidden";
    elemment.style.display = "flex";
}

function changeStatus(status) {
    const el = document.querySelector(".circle-loader");
    el.classList.remove();
    el.classList.add("circle-loader");
    el.classList.add(status);
}

function calculateSubTotal() {
    const subTotal = document.getElementById("subtotal");
    const quantity = document.getElementById("quantity");
    const products = document.getElementsByClassName("hr-products");
    let subTotal_price = 0;
    let total_quantity = 0;
    for (let i = 0; i < products.length; i++) {
        const price = Number(
            products[i].previousElementSibling.childNodes[7].innerText.split(
                "$"
            )[1]
        );
        const quantity = Number(
            products[i].previousElementSibling.querySelector(
                "input[type=number]"
            ).value
        );
        subTotal_price += price * quantity;
        total_quantity += quantity;
    }
    subTotal.innerText = "$ " + subTotal_price.toFixed(2);
    quantity.innerText = total_quantity + " items";
    return Number(subTotal_price.toFixed(2));
}

function updatePrice() {
    const total = calculateSubTotal();
    const shipping = document.getElementById("type_shipping");
    const shipping_price = Number(
        shipping.options[shipping.selectedIndex].value
    );
    const total_price = Number(total + shipping_price);
    document.getElementById("total").innerText = "$ " + total_price.toFixed(2);
}

function changeAnimation(isLoading) {
    const el = document.getElementsByClassName("container_change")[0];
    if (isLoading) {
        el.classList.remove("spinner-hidden");
        el.style.height = window.innerHeight + "px";
    } else {
        el.classList.add("spinner-hidden");
    }
}

async function quantityUp(e) {
    changeAnimation(true);
    const id = e.dataset.target;
    if (await checkStock({ id, cant:"++" })) {
        if (await updateCart(id)) {
            e.parentNode.querySelector("input[type=number]").stepUp();
            updatePrice();
        } else {
            alert("Se generó un error al actualizar el carrito");
        }
    } else {
        alert("No hay stock suficiente");
    }
    changeAnimation(false);
}

async function quantityDown(e) {
    if (Number(e.parentNode.querySelector("input[type=number]").value) > 1) {
        changeAnimation(true);
        const id = e.dataset.target;
        if (await decreaseQuantityCart(id)) {
            e.parentNode.querySelector("input[type=number]").stepDown();
            updatePrice();
        } else {
            alert("Se generó un error al actualizar el carrito");
        }
        changeAnimation(false);
    }
}

async function deleteProduct(e) {
    changeAnimation(true);
    let hrIndex;
    const id = e.dataset.target;
    const element = e.parentNode.parentNode.parentNode;
    const container = document.getElementById("all_products").children;
    for (let i = 0; i < container.length; i++) {
        if (container[i].id == id) {
            hrIndex = i;
        }
    }
    if (await reqDeleteProduct(id)) {
        element.remove();
        container[hrIndex].remove();
    } else {
        alert("Se generó un error al actualizar el carrito");
    }
    updatePrice();
    changeAnimation(false);
}

async function reqDeleteProduct(id) {
    const response = await fetch(`/api/carrito/producto/all/${id}?admin=true`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    if (data.status == 401) {
        window.location.href = "/login";
    }
    if (!data.value) {
        console.log(data);
    }
    return data.value;
}

async function checkStock({ id, cant }) {
    const response = await fetch(
        `/api/productos/stock/${id}/${cant}?admin=true`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    const data = await response.json();
    if (data.status == 401 && !data.value) {
        window.location.href = "/login";
    }
    if (data.status == 500 && !data.value) {
        location.href = data.returnTo + `?err=${data.msg}`;
    }
    return data.value;
}

async function updateCart(product) {
    const response = await fetch(
        `/api/carrito/add/producto/${product}?admin=true`,
        {
            method: "PUT",
            headers: {
                Accept: "application/json",
            },
        }
    );
    const data = await response.json();
    if (data.status == 401) {
        window.location.href = "/login";
    }
    if (!data.value) {
        console.log(data);
    }
    return data.value;
}

async function decreaseQuantityCart(id_prod) {
    const response = await fetch(
        `/api/carrito/producto/${id_prod}?admin=true`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
            },
        }
    );
    const data = await response.json();
    if (data.status == 401) {
        window.location.href = "/login";
    }
    if (!data.value) {
        console.log(data);
    }
    return data.value;
}

function validateTotal() {
    const value = Number(
        document.querySelector("#subtotal").textContent.substr(1)
    );
    const quantity = Number(
        document.querySelector("#quantity").textContent.substr(0, 1)
    ).toFixed();
    const btn_ship = document.querySelector("#type_shipping");
    const btn_buy = document.querySelector("#buy");
    if (value <= 0 && quantity <= 0) {
        btn_ship.setAttribute("disabled", "");
        btn_ship.style.cursor = "not-allowed";
        btn_buy.setAttribute("disabled", "");
    }
}

validateTotal();