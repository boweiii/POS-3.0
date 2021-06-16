// ------- 變數宣告 & 函數定義 ------
const productListElement = document.getElementById('product-list')
const cartItemListElement = document.getElementById('cart-item-list')
const totalAmountElement = document.getElementById('total-amount')
const clearCartButtonElement = document.getElementById('clear-cart-button')

const menu = document.getElementById('menu')
const cart = document.getElementById('cart')
const totalAmount = document.getElementById('total-amount')
const button = document.getElementById('submit-button')

let products = []
let productMap = {};
let tempProductRemainingMap = {}

let cartItems = []

// 計算購物車價格
function getCartItemAmount(cartItem) {
  const product = productMap[cartItem.productId]
  return product.price * cartItem.quantity
}

function getTotalAmount() {
  let totalAmount = 0

  cartItems.forEach(cartItem => {
    totalAmount += getCartItemAmount(cartItem);
  })

  return totalAmount
}


// 商品列表畫面渲染
function renderProducts() {
  productListElement.innerHTML = ''

  products.forEach(product => {
    const isSoldOut = tempProductRemainingMap[product.id] === 0;
    productListElement.innerHTML += `
      <div class="col-3">
        <div class="card disabled">
            <img src=${product.imgUrl} class="card-img-top">
            <div class="card-body">
              <h5 class="card-title">${product.name} </h5>
              <p class="card-text">
                ${product.price} 元
              </p>
              <p class="card-text">
                可訂購數量 ${tempProductRemainingMap[product.id]} 份
              </p>
              <button
                id=${product.id}
                class="btn btn-primary add-to-cart-button ${isSoldOut ? 'disabled' : ''}"
              >
                ${isSoldOut ? '已售完' : '加入購物車'}
              </button>
            </div>
          </div>
        </div>
    `
  })
}

// 購物車畫面渲染
function renderCart() {
  cartItemListElement.innerHTML = ''

  cartItems.forEach(cartItem => {
    const product = productMap[cartItem.productId]
    const cartItemAmount = getCartItemAmount(cartItem)

    cartItemListElement.innerHTML += `
      <li class="list-group-item">
        ${product.name} X ${cartItem.quantity}，小計：${cartItemAmount} 元
      </li>
    `
  })

  const totalAmount = getTotalAmount()
  totalAmountElement.textContent = totalAmount
}

// 綁定加入購物車按鈕的事件
function bindAddItemToCartButtonEvent() {
  const buttonElementList = document.querySelectorAll('.add-to-cart-button');

  buttonElementList.forEach(buttonElement => {
    buttonElement.addEventListener('click', (event) => {
      // 加入購物車品項
      const productId = event.target.id;

      // 若可訂購數量為 0，代表不可加入購物車，則直接結束流程
      if (tempProductRemainingMap[productId] === 0) {
        return
      }

      tempProductRemainingMap[productId] -= 1
      const existingCartItemIndex = cartItems.findIndex(cartItem => cartItem.productId === productId)

      if (existingCartItemIndex >= 0) {
        // 購物車中已有重複商品
        cartItems[existingCartItemIndex].quantity += 1
      } else {
        // 購物車中尚未有該種商品
        cartItems.push({
          productId,
          quantity: 1
        })
      }

      // 更新畫面
      renderProducts()
      renderCart()
      bindAddItemToCartButtonEvent()
    })
  })
}

// 綁定清空購物車按鈕的事件
function bindClearCartButtonEvent() {
  clearCartButtonElement.addEventListener('click', () => {
    // 清空購物車
    cartItems = []

    // 重設暫時的可訂購數量
    products.forEach(product => {
      tempProductRemainingMap[product.id] = product.inventory
    })

    // 更新畫面
    renderProducts()
    renderCart()
    bindAddItemToCartButtonEvent()
  })
}

//送出訂單
function submit() {
  let list = ''
  cartItems.forEach(product => {
    console.log(product)
    const productId = product.productId
    list += `${productMap[productId].name} X ${product.quantity} 個\n`
    console.log(list)
  })
  console.log(list)
  alert(`您訂購的商品有 : \n${list}\n 總金額 : ${totalAmount.innerText}元`)
}

button.addEventListener('click', submit)


// ------ 主流程 -------

// 請求 API 菜單商品資料
axios.get('https://ac-pos-with-inventory.firebaseio.com/products.json')
  .then((response) => {
    // 成功取得 API 回傳的 products 陣列資料
    products = response.data

    productMap = {}
    tempProductRemainingMap = {}

    products.forEach(product => {
      productMap[product.id] = product
      tempProductRemainingMap[product.id] = product.inventory
    })
    console.log(productMap)
    console.log(tempProductRemainingMap)

    // 畫面渲染
    renderProducts()
    renderCart()

    // 事件綁定
    bindAddItemToCartButtonEvent()
    bindClearCartButtonEvent()
  })
