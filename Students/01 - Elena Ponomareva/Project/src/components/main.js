const catalogImage = 'https://placehold.it/200x150';
const basketImage = 'https://placehold.it/100x80';
const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

class List {
    constructor(url, container) {
        this.url = url;
        this.container = container;
        this.items = [];
        this._init();
    }

    _init() {
        this.get(this.url)
            .then(data => {
                this.items = (this.constructor.name === 'Basket') ? [] : data;
                this.render();
                this._handleEvents();
            })
    }

    get(url) {
        url = API + url;
        return fetch(url).then(dataJson => dataJson.json());
    }

    render() {
        let htmlStr = '';
        this.items.forEach(item => {
            let newItem = new classes[this.constructor.name](item)
            htmlStr += newItem.render()
        });
        document.querySelector(this.container).innerHTML = htmlStr;
    }
}
class ListItem {
    constructor(item, img = catalogImage) {
        this.item = item;
        this.img = img;
    }
    render() {
        return `
        <div class="product-item">
             <img src="https://placehold.it/300x200" alt="${this.item.product_name}">
             <!--img src="${this.img}" width="300" height="200" alt="${this.item.product_name}"-->
             <div class="desc">
                 <h1>${this.item.product_name}</h1>
                 <p>${this.item.price}</p>
                 <button 
                 class="buy-btn" 
                 name="buy-btn"
                 data-name="${this.item.product_name}"
                 data-price="${this.item.price}"
                 data-id="${this.item.id_product}"
                 >Купить</button>
             </div>
         </div>
        ` 
    }
}

class Catalog extends List {
    constructor(basket, url = '/catalogData.json', container = '.products') {
        super(url, container);
        this.basket = basket;
    }

    _handleEvents() {
        document.querySelectorAll('.product-item').forEach (el => {el.addEventListener ('click', (evt) => {
            if (evt.target.name === 'buy-btn') {
                this.basket.add(evt.target);
            }
        })
    })
    }
}
class Basket extends List {
    constructor(url = '/getBasket.json', container = '.cart-items') {
        super(url, container);
    }

    _handleEvents () {
        document.querySelectorAll('.cart-item').forEach (el => {el.addEventListener ('click', (evt) => {
            if (evt.target.name === 'del-btn') {
                this.remove (evt.target);
            }
        })});

    }
    handleEventsButton () {
        document.querySelector('.btn-cart').addEventListener ('click', (evt) => {
            document.querySelector('.cart-block').classList.toggle('invisible'); 
        })
    }

    add(item) {
        let id = item.dataset['id'];
        let find = this.items.find(el => el.id_product == id);
        if (find) {
            find.quantity++;
            this.render();
            this._handleEvents();
            } else {
                this.get(this.url)
                    .then(data => {
                        this.items.push(data.contents.find(el => el.id_product == id));
                        this.render();
                        this._handleEvents();
                    })
            }
        }

    remove(item) {
        let find = this.items.find(el => el.id_product == item.dataset.id)
        if (find.quantity > 1) {
            find.quantity--;
            } else {
                this.items.splice (this.items.indexOf(find), 1)
                }
            this.render ();
            this._handleEvents();
    }
}

class CatalogItem extends ListItem {}

class BasketItem extends ListItem {
    constructor(item, img = basketImage) {
        super(item, img)
    }

    render() {
        return `
        <div class="cart-item" data-id="${this.item.id_product}">
            <img src="https://placehold.it/100x80" alt="">
            <div class="product-desc">
                <p class="product-title">${this.item.product_name}</p>
                <p class="product-quantity">${this.item.quantity}</p>
                <p class="product-single-price">${this.item.price}</p>
            </div>
            <div class="right-block">
                <button name="del-btn" class="del-btn" data-id="${this.item.id_product}">&times;</button>
            </div>
        </div>
        `
    }
}


let classes = {
    Catalog: CatalogItem,
    Basket: BasketItem
}

let basket = new Basket();
let catalog = new Catalog(basket);



export default function() {
    catalog._init(basket);
    basket._init();
    basket.handleEventsButton();
}