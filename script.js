/* Constantes */
const images = 'images/';
const price = (el) => el.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});
const qs = (el) => document.querySelector(el);
const qsa = (el) => document.querySelectorAll(el);

let cart = [];
let modalQt = 1;
let modalIndex = 0;

/* Listagem das pizzas */
pizzaJson.map((pizza, index) => {

    // Modelo da pizza
    let pizzaItem = qs('.models .pizza-item').cloneNode(true);

    // Adiciona as informações no modelo
    pizzaItem.setAttribute('data-index', index);
    pizzaItem.querySelector('.pizza-item--img img').src = images + pizza.img;
    pizzaItem.querySelector('.pizza-item--priceP').innerHTML = 'Pequena: ' + price(pizza.price[0]);
    pizzaItem.querySelector('.pizza-item--priceM').innerHTML = 'Média: ' + price(pizza.price[1]);
    pizzaItem.querySelector('.pizza-item--priceG').innerHTML = 'Grande: ' + price(pizza.price[2]);
    pizzaItem.querySelector('.pizza-item--name').innerHTML = pizza.name;
    pizzaItem.querySelector('.pizza-item--desc').innerHTML = pizza.description;
    pizzaItem.querySelector('a').title = pizza.name;

    // Ao clicar na pizza
    pizzaItem.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();

        // Pega a pizza selecionada
        let index = e.target.closest('.pizza-item').getAttribute('data-index');
        let pizzaIndex = pizzaJson[index];
        modalIndex = index;

        addInfoModal(pizzaIndex);
        resetModal();

        qsa('.pizzaInfo--size').forEach((size, sizeIndex) => {
            if (sizeIndex == 2) { // Pizza Grande
                size.classList.add('selected');
            }
            size.querySelector('span').innerHTML = pizzaIndex.sizes[sizeIndex]
        });

        showModal();
    });

    qs('.pizza-area').append(pizzaItem);

});

/* Eventos do Modal */
function addInfoModal(pizzaIndex) {
    qs('.pizzaBig img').src = images + pizzaIndex.img;
    qs('.pizzaInfo--name').innerHTML = pizzaIndex.name;
    qs('.pizzaInfo--desc').innerHTML = pizzaIndex.description;
    qs('.pizzaInfo--actualPrice').innerHTML = price(pizzaIndex.price[2]);
}

function resetModal() {
    modalQt = 1;
    qs('.pizzaInfo--size.selected').classList.remove('selected');
    qs('.pizzaInfo--qt').innerHTML = modalQt;
}

function showModal() {
    qs('.pizzaWindowArea').style.opacity = 0;
    qs('.pizzaWindowArea').style.display = 'flex';
    setTimeout(() => {
        qs('.pizzaWindowArea').style.opacity = 1;
    }, 200);
}

function hideModal() {

    qs('.pizzaWindowArea').style.opacity = 0;
    setTimeout(() => {
        qs('.pizzaWindowArea').style.display = 'none';
    }, 500);
}

// Botoes para fechar o modal
qsa('.modal-close').forEach((item) => item.addEventListener('click', hideModal));

// Diminuir quantidade
qs('.pizzaInfo--qtmenos').addEventListener('click', () => {
    if (modalQt > 1) {
        modalQt--;
    }
    qs('.pizzaInfo--qt').innerHTML = modalQt;
});

// Aumentar quantidade
qs('.pizzaInfo--qtmais').addEventListener('click', () => {
    modalQt++;
    qs('.pizzaInfo--qt').innerHTML = modalQt;
});

// Deixa ativo o tamanho selecionado
qsa('.pizzaInfo--size').forEach((size, sizeIndex) => {
    size.addEventListener('click', (e) => {
        qs('.pizzaInfo--size.selected').classList.remove('selected');
        size.classList.add('selected');
        let tamanho = size.getAttribute('data-key');
        qs('.pizzaInfo--actualPrice').innerHTML = price(pizzaJson[modalIndex].price[tamanho]);
    })
})

// Adicionar pizzas ao carrinho
qs('.pizzaInfo--addButton').addEventListener('click', () => {

    id = pizzaJson[modalIndex].id;
    size = qs('.pizzaInfo--size.selected').getAttribute('data-key')

    let cod = id + '@' + size;
    let codVerify = cart.findIndex((item) => item.cod == cod);

    if (codVerify > -1) {
        cart[codVerify].qt += modalQt;
    } else {
        cart.push({
            cod,
            id,
            size,
            qt: modalQt
        })
    }

    updateCart();
    hideModal();
})

// Mobile
qs('.menu-openner').addEventListener('click', () => {
    if (cart.length > 0)
        qs('aside').style.left = 0;
});
qs('.menu-closer').addEventListener('click', () => qs('aside').style.left = '100vh');

/* Atualiza o carrinho */
function updateCart() {

    // Mobile
    qs('.menu-openner span').innerHTML = cart.length;

    if (cart.length > 0) {
        qs('aside').classList.add('show');
        qs('.cart').innerHTML = '';

        let subtotal = 0;
        let desconto = 0;
        let total = 0;

        for (let i in cart) {

            let pizzaItem = pizzaJson.find((item) => item.id == cart[i].id)

            let pizzaPrice = pizzaItem.price[cart[i].size];

            subtotal += pizzaPrice * cart[i].qt;

            // Modelo de item no carrinho
            let cartItem = qs('.models .cart--item').cloneNode(true);

            let pizzaSizeName;
            switch (cart[i].size) {
                case '0':
                    pizzaSizeName = 'P';
                    break;
                case '1':
                    pizzaSizeName = 'M';
                    break;
                case '2':
                    pizzaSizeName = 'G';
                    break;
            }

            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;

            // Adiciona as informações no modelo
            cartItem.querySelector('img').src = images + pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
            cartItem.querySelector('.cart--item-price').innerHTML = price(pizzaPrice);
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () => {
                if (cart[i].qt > 1) {
                    cart[i].qt--;
                } else {
                    cart.splice(i, 1);
                }
                updateCart();
            });
            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () => {
                cart[i].qt++;
                updateCart();
            });

            qs('.cart').append(cartItem);

        }

        desconto = subtotal * 0.1;
        total = subtotal - desconto;

        qs('.subtotal span:last-child').innerHTML = price(subtotal);
        qs('.desconto span:last-child').innerHTML = price(desconto);
        qs('.total span:last-child').innerHTML = price(total);

    } else {
        qs('aside').classList.remove('show');
        qs('aside').style.left = '100vh';
    }

}