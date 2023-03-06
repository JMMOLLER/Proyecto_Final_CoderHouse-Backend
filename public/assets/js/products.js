window.onload = async () => {
    await checkNewProduct();
    const items = document.querySelectorAll(".cart-button");
    items.forEach((item) => {
        item.addEventListener("click", async () => {
            const spinner = document.querySelector(".container_change");
            spinner.classList.remove("spinner-hidden");
            document.body.style.overflow = "hidden";
            if (await checkStock({ id: item.dataset.value, cant: "++" })) {
                const status = await addToCart(item.dataset.value);
                if (status === 200) {
                    alert("Producto agregado al carrito");
                } else {
                    alert("Error al agregar el producto al carrito");
                }
            } else {
                alert("No hay stock suficiente");
            }
            spinner.classList.add("spinner-hidden");
            document.body.style.overflow = "auto";
        });
    });
};
async function addToCart(product) {
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
    if (data.status == 401 && !data.value) {
        window.location.href = "/login";
    }
    if (data.status == 500 && !data.value) {
        location.href = data.returnTo + `?err=${data.msg}`;
    }
    return response.status;
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
async function getProducts() {
    const response = await fetch("/api/productos?admin=true", {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });
    const data = await response.json();
    if (data.status == 500 && !data.value) {
        location.href = data.returnTo + `?err=${data.msg}`;
    }
    return data.products;
}
async function checkNewProduct(product) {
    try {
        const products = await getProducts();
        const currentDay = new Date().toISOString().slice(0, 10);
        for (let i = 0; i < products.length; i++) {
            if (currentDay === products[i].timestamp.slice(0, 10)) {
                const element = document.getElementById(
                    `product-${products[i].code}`
                );
                const child = element.getElementsByClassName("part-1")[0];
                child.innerHTML += `<span class="new">new</span>`;
            }
        }
    } catch (err) {
        location.href = "/fatal_error" + `?err=${err.message}`;
    }
}
