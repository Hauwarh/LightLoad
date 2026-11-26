// FreshMart app logic. This is the only script the pages actually need.
var PRODUCTS = [
  { id: "rice", name: "Long Grain Rice (5kg)", price: 9500, img: "img/rice.jpg" },
  { id: "beans", name: "Honey Beans (2kg)", price: 4200, img: "img/beans.jpg" },
  { id: "garri", name: "Ijebu Garri (2kg)", price: 2800, img: "img/garri.jpg" },
  { id: "palm-oil", name: "Palm Oil (1L)", price: 3100, img: "img/palm-oil.jpg" },
  { id: "tomatoes", name: "Fresh Tomatoes (basket)", price: 6000, img: "img/tomatoes.jpg" },
  { id: "yam", name: "Yam Tuber", price: 3500, img: "img/yam.jpg" }
];
function naira(n) { return "₦" + n.toLocaleString("en-NG"); }
function getCart() { try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch (e) { return []; } }
function setCart(c) { localStorage.setItem("cart", JSON.stringify(c)); updateCount(); }
function addToCart(id) {
  var c = getCart(); c.push(id); setCart(c);
  var n = document.getElementById("added"); if (n) { n.textContent = "Added to cart"; n.hidden = false; }
}
function updateCount() { var el = document.getElementById("cart-count"); if (el) el.textContent = getCart().length; }
function card(p) {
  return '<div class="card"><a href="product.html?id=' + p.id + '"><img src="' + p.img + '" alt="' + p.name + '"></a>' +
    '<h3>' + p.name + '</h3><div class="price">' + naira(p.price) + '</div>' +
    '<button onclick="addToCart(\'' + p.id + '\')">Add to cart</button></div>';
}
function q(name) { return new URLSearchParams(location.search).get(name) || ""; }
document.addEventListener("DOMContentLoaded", function () {
  updateCount();
  var page = document.body.getAttribute("data-page");
  if (page === "home") document.getElementById("products").innerHTML = PRODUCTS.map(card).join("");
  if (page === "search") {
    var term = q("q").toLowerCase();
    document.getElementById("q").value = q("q");
    var hits = PRODUCTS.filter(function (p) { return p.name.toLowerCase().indexOf(term) !== -1; });
    document.getElementById("results").innerHTML = hits.length ? hits.map(card).join("") : "<p>No results for " + term + "</p>";
  }
  if (page === "product") {
    var p = PRODUCTS.filter(function (x) { return x.id === q("id"); })[0] || PRODUCTS[0];
    document.getElementById("product").innerHTML = '<img src="' + p.img + '" alt="' + p.name + '" style="width:100%">' +
      '<h1>' + p.name + '</h1><p class="price">' + naira(p.price) + '</p><button onclick="addToCart(\'' + p.id + '\')">Add to cart</button>';
  }
  if (page === "cart" || page === "checkout") {
    var items = getCart().map(function (id) { return PRODUCTS.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean);
    var total = items.reduce(function (s, p) { return s + p.price; }, 0);
    document.getElementById("lines").innerHTML = items.length
      ? items.map(function (p) { return '<div class="cart-line"><span>' + p.name + '</span><span>' + naira(p.price) + '</span></div>'; }).join("") +
        '<div class="cart-line"><strong>Total</strong><strong>' + naira(total) + '</strong></div>'
      : "<p>Your cart is empty.</p>";
  }
});
