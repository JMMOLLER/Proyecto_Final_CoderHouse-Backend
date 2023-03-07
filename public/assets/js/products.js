
window.onload = async () => {
    await checkNewProduct();

    document.querySelector("input[type=search]").addEventListener("keyup", (e) => {
        if (e.keyCode === 13) {
            filterProducts();
        }
    });

    const items = document.querySelectorAll(".cart-button");
    items.forEach((item) => {
        item.addEventListener("click", async () => {
            const spinner = document.querySelector(".container_change");
            spinner.clientHeight = getActualWidth();
            spinner.classList.remove("spinner-hidden");
            document.body.style.overflow = "hidden";
            const response = await checkStock({
                id: item.dataset.value,
                cant: "++",
            });
            if (response.value) {
                const status = await addToCart(item.dataset.value);
                if (status === 200) {
                    alert("Producto agregado al carrito");
                } else {
                    alert("Error al agregar el producto al carrito");
                }
            } else if (response.status == 409 && !response.value) {
                alert("No hay stock suficiente");
            }
            spinner.classList.add("spinner-hidden");
            document.body.style.overflow = "auto";
        });
    });
};

function filterProducts(){
    const filter = document.querySelector("input[type=search]").value;
    const list = document.querySelectorAll(".row")[1].childNodes;
    list.forEach((item) => {
        if (item.nodeName === "DIV") {
            if(filter !== ""){
                if (item.dataset.value != filter) {
                    item.style.display = "none";
                } else {
                    item.style.display = "block";
                }
            }else{
                item.style.display = "block";
            }
        }
    });
}

function getActualWidth() {
    const actualWidth =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth ||
        document.body.offsetWidth;

    return actualWidth.toString()+"px";
}

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
    return data;
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
