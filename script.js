// Obtendo elementos a serem manipulados
const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItensContainer = document.getElementById("cart-itens")
const cartTotal = document.getElementById("cart-total")
const checkOutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCount = document.getElementById("cart-count")

// Obtenha a referência para o seletor de pagamento e o campo de troco
const paymentMethodSelect = document.getElementById("payment-method");
const trocoSection = document.getElementById("troco-section");
const trocoValue = document.getElementById("troco");


// Adicione um ouvinte de evento para o seletor de pagamento
paymentMethodSelect.addEventListener("change", function() {
    const selectedOption = paymentMethodSelect.value;
    if (selectedOption === "Dinheiro") {
        // Se a opção selecionada for "dinheiro", mostre o campo de troco
        trocoSection.style.display = "block";
    } else {
        // Caso contrário, oculte o campo de troco
        trocoSection.style.display = "none";
    }
});


let cart = [];


// Abrindo Modal
cartBtn.addEventListener("click", function() {
    updateCartModal()

    cartModal.style.display = "flex"
})

// Fechando com click fora
cartModal.addEventListener("click", function(event){
    if(event.target === cartModal){
        cartModal.style.display = "none"
    }
})

// Fechando Modal
closeModalBtn.addEventListener("click", function(){
    cartModal.style.display = "none"
})

// Obtendo o Produto Selecionado
menu.addEventListener("click", function(event){

    let parentButton = event.target.closest(".add-to-cart-btn")

    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))
        
        // Adicionando no Carrinho
        addToCart(name, price)
    }
})

// Adicionando no Carrrinho
function addToCart(name, price){

    const existingItem = cart.find(item => item.name === name)

    if(existingItem){
        // Se o item ja existe no carrinho aumenta a quantidade + 1
        existingItem.qtd += 1

        Toastify({
            text: `${name} foi adicionado no carrinho!`,
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#005b32",
            },
        }).showToast();

    } else{
        cart.push({
            name,
            price,
            qtd: 1,
        });

        Toastify({
            text: `${name} foi adicionado no carrinho!`,
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#005b32",
            },
        }).showToast();
    }

    updateCartModal()
}

// Atualiza o Carrinho
function updateCartModal(){
    cartItensContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item =>{
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex","justify-between","mb-4","flex-col")

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>   
                    <p class="font-bold ">${item.name}</p>
                    <p>Quantidade: ${item.qtd}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-btn mx-1" data-name="${item.name}">
                    Remover
                </button>
            </div>
        `
        total += item.price * item.qtd


        cartItensContainer.appendChild(cartItemElement);
    })

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })

    cartCount.innerText = cart.length;
}

// Removendo Item do Carrinho
cartItensContainer.addEventListener("click", function(event){

    if(event.target.classList.contains("remove-btn")){
        const name = event.target.getAttribute("data-name")

        removeItemCart(name);
        Toastify({
            text: `${name} foi removido do carrinho!`,
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast();

    }
})

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name)

    if(index !== -1){
        const item = cart[index];

        if(item.qtd > 1){
            item.qtd -= 1;
            updateCartModal()
            return;
        }

        cart.splice(index, 1)
        updateCartModal()
    }
}


// Finalizar Pedido
checkOutBtn.addEventListener("click", function(){

    const isOpen = checkOpen()
    if(!isOpen){

        Toastify({
            text: "Estamos Fechados no momento!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast();

        return;
    }

    if(cart.length === 0) return;

    // Calcula o total dos itens no carrinho
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qtd;
    });

    // enviar via whatsapp
    const cartItens = cart.map((item) => {
        return(
        `${item.name}
        Quantidade: ( ${item.qtd} )
        Preço: R$ ${item.price.toFixed(2)}\n\n`
            )
    }).join("")

    const valorSelecionado = paymentMethodSelect.options[paymentMethodSelect.selectedIndex].value;

    if(valorSelecionado === "Dinheiro"){

        // Pegando e tratando o valor inserido
        const valorPagamentoStr = trocoValue.value.trim().replace("R$", "").replace(",", ".").replace(" ", "");
        const valorPagamento = parseFloat(valorPagamentoStr);

        if (isNaN(valorPagamento)) {
            Toastify({
                text: `Insira um valor válido para o pagamento`,
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "#ef4444",
                },
            }).showToast();
            return;
        }

        if (valorPagamento < total) {
            Toastify({
                text: `O valor pago (R$ ${valorPagamento.toFixed(2)}) é menor que o total do pedido (R$ ${total.toFixed(2)}).`,
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "#ef4444",
                },
            }).showToast();

            return;
        }

        const trocoCalculado = valorPagamento - total;

        const message = encodeURI(`Olá! Gostaria de fazer um pedido:\n\n${cartItens}\nTotal: R$ ${total.toFixed(2)}\n\nForma de Pagamento: *${valorSelecionado}*\nValor Pagamento: *${trocoValue.value}*
        \nTroco: *R$ ${trocoCalculado.toFixed(2)}*`)

        const phone = "12997918975"

        window.open(`https://wa.me/${phone}?text=${message}`,"_blank")
    }else{
        const message = encodeURI(`Olá! Gostaria de fazer um pedido:\n\n${cartItens}\nTotal: R$ ${total.toFixed(2)}\nForma de Pagamento: *${valorSelecionado}*`)

        const phone = "12997918975"
    
        window.open(`https://wa.me/${phone}?text=${message}`,"_blank")
    }
    cart = []
    trocoValue.value = ""
    adressInput.value = ""
    cartModal.style.display = "none"

    updateCartModal()
    
})


// Verificando Horario 
function checkOpen(){
    const data = new Date();
    const hora = data.getHours();
  
    return hora >= 6 && hora < 21; // True = aberto
}

const spanDate = document.getElementById("date-span")
const isOpen = checkOpen();

if(isOpen === true){
    spanDate.classList.remove("bg-red-500")
    spanDate.classList.add("bg-green-500")
} else {
    spanDate.classList.remove("bg-green-500")
    spanDate.classList.add("bg-red-500")
    
}







