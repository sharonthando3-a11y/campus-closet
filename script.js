"use strict";

// STEP 1: Create our product catalogue.
const products = [
    {
        id: 1,
        name: "Men'sClassic White Tee",
        category: "Tops",
        price: 129.99,
        sizes: ["XS","S", "M", "L", "XL", "XXL", "XXXL"],
        description: "A versatile and comfortable white t-shirt made from soft cotton. Perfect for casual wear or layering.",
        image: "images/campus-tee2.jpeg"
    },
    {
        id: 2,
        name: "Women's Hoodie",
        category: "Tops",
        price: 249.99,
        sizes: ["XS","S", "M", "L", "XL", "XXL", "XXXL"],
        description: "A cozy hoodie made from a blend of cotton and polyester. Ideal for staying warm during chilly campus days.",
        image: "images/campus-hoodie.jpeg"
    },
    {
        id: 3,
        name: "Women's Jeans",
        category: "Bottoms",
        price: 269.99,
        sizes: ["28","30", "32", "34", "36", "38", "40", "42"],
        description: "Relaxed fit jeans made from high-quality denim. Perfect for a casual look.",
        image: "images/campus-jean1.jpeg"
    },
    {
        id: 4,
        name: "Everyday Sneakers",
        category: "Shoes",
        price: 299.99,
        sizes: ["2","3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        description: "Comfortable sneakers for everyday wear.",
        image: "images/campus-sneakers.jpeg"
    },
    {
        id: 5,
        name: "Campus Cap",
        sizes: ["One Size"],
        category: "Accessories",
        price: 99.99,
        description: "A classic baseball cap perfect for a casual look.",
        image: "images/campus-cap.jpeg"
    },
    {
        id: 6,
        name: "Men's Jeans",
        category: "Bottoms",
        price: 279.99,
        sizes: ["28","30", "32", "34", "36", "38", "40", "42"],
        description: "Comfortable jeans for a streetwear look.",
        image: "images/campus-jean2.jpeg"
    },
    {
        id: 7,
        name: "Campus Backpack",
        category: "Accessories",
        price: 149.99,
        description: "A durable backpack for carrying your essentials around campus.",
        sizes: ["One Size"],
        image: "images/campus-backpack.jpeg"
    },
    {
        id: 8,
        name: "Campus Crop Top",
        category: "Tops",
        price: 79.99,
        sizes: ["XS","S", "M", "L", "XL", "XXL", "XXXL"],
        description: "A trendy crop top perfect for a casual look.",
        image: "images/campus-croptop.jpeg"
    },
    {
        id: 9,
        name: "Campus Jorts",
        category: "Bottoms",
        price: 159.99,
        sizes: ["28","30", "32", "34", "36", "38", "40", "42"],
        description: "Comfortable shorts for a casual look.",
        image: "images/campus-jorts.jpeg"
    },
    {
        id: 10,
        name: "Campus Sandals",
        category: "Shoes",
        price: 119.99,
        sizes: ["2","3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        description: "Comfortable sandals for everyday wear.",
        image: "images/campus-sandals.jpeg"
    },
    {   
        id: 11,
        name: "Campus Summer Dress",
        category: "Tops",
        price: 109.99,
        sizes: ["XS","S", "M", "L", "XL", "XXL", "XXXL"],
        description: "A stylish summer dress perfect for warm weather.",
        image: "images/campus-dress.jpeg"
    },      
    {
        id: 12,
        name: "Campus Winter Jacket",
        category: "Coats",
        price: 249.99,
        sizes: ["XS","S", "M", "L", "XL", "XXL", "XXXL"],
        description: "A warm winter jacket made from high-quality materials. Perfect for staying cozy during cold campus days.",
        image: "images/campus-winterjacket.jpeg"
    },
    {
        id: 13,
        name: "Men's Hoodie",
        category: "Tops",
        price: 229.99,
        sizes: ["XS","S", "M", "L", "XL", "XXL", "XXXL"],
        description: "A comfortable hoodie made from a blend of cotton and polyester. Ideal for staying warm during chilly campus days.",
        image: "images/campus-hoodies.jpeg"
    },
    {
        id: 14,
        name: "Campus Beanie",
        category: "Accessories",
        price: 49.99,
        sizes: ["One Size"],
        description: "A warm beanie perfect for cold weather.",
        image: "images/campus-beanie.jpeg"
    }
];

localStorage.setItem(
    "campusProducts",
    JSON.stringify(products)
);

// STEP 2: Create a shopping cart that stores sizes.
const savedCart = JSON.parse(
    localStorage.getItem("campusCart") || "[]"
);

const cart = new Map();

// Load both older cart entries and the new cart format.
savedCart.forEach(function(item) {
    if (Array.isArray(item)) {
        // Migrate old entries: [productId, quantity].
        const productId = Number(item[0]);
        const product = products.find(function(p) {
            return p.id === productId;
        });

        if (product) {
            const size = product.sizes &&
                product.sizes.length === 1
                ? product.sizes[0]
                : "Size not selected";

            const key = productId + "::" + size;

            cart.set(key, {
                productId: productId,
                size: size,
                quantity: Number(item[1]) || 1
            });
        }
    } else if (
        item &&
        Number.isFinite(Number(item.productId)) &&
        typeof item.size === "string"
    ) {
        const key = item.productId + "::" + item.size;

        cart.set(key, {
            productId: Number(item.productId),
            size: item.size,
            quantity: Number(item.quantity) || 1
        });
    }
});

function saveCart() {
    localStorage.setItem(
        "campusCart",
        JSON.stringify(Array.from(cart.values()))
    );
}

// STEP 3: Connect JavaScript to HTML elements.
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");
const checkoutMessage = document.getElementById("checkout-message");

// Format prices as South African rand.
function formatPrice(amount) {
    return amount.toLocaleString("en-ZA", {
        style: "currency",
        currency: "ZAR"
    });
}

// STEP 4: Display products on the page.
function displayProducts(productList) {
    productGrid.replaceChildren();

    if (productList.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No products found. Try another search.";
        productGrid.appendChild(message);
        return;
    }

    productList.forEach(function(product) {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        image.addEventListener("error", function() {
            image.alt = product.name + " image unavailable";
            image.removeAttribute("src");
        });

        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = formatPrice(product.price);

       // Create a size selector for this product.
const sizeSelect = document.createElement("select");
sizeSelect.className = "product-size";
sizeSelect.setAttribute(
    "aria-label",
    "Choose a size for " + product.name
);

const availableSizes = Array.isArray(product.sizes)
    && product.sizes.length > 0
    ? product.sizes
    : ["Size unavailable"];

availableSizes.forEach(function(size) {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeSelect.appendChild(option);
});

// Require a deliberate size choice for clothing and shoes.
const requiresSize = !(
    availableSizes.length === 1 &&
    availableSizes[0] === "One Size"
);

if (requiresSize) {
    sizeSelect.selectedIndex = -1;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a size";
    placeholder.disabled = true;
    placeholder.selected = true;

    sizeSelect.insertBefore(
        placeholder,
        sizeSelect.firstChild
    );
}

const button = document.createElement("button");
button.className = "add-button";
button.textContent = "Add to cart";
button.type = "button";

button.addEventListener("click", function() {
    const selectedSize = sizeSelect.value;

    if (!selectedSize || selectedSize === "Size unavailable") {
        checkoutMessage.textContent =
            "Please select an available size for " +
            product.name + ".";

        sizeSelect.focus();
        return;
    }

    addToCart(product.id, selectedSize);
});

        info.append(category, name, price, sizeSelect, button);
        card.append(image, info);
        productGrid.appendChild(card);
    });
}

// STEP 5: Add a product to the cart.
function addToCart(productId, size) {
    const product = products.find(function(item) {
        return item.id === productId;
    });

    if (!product) return;

    const key = productId + "::" + size;
    const existingItem = cart.get(key);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.set(key, {
            productId: productId,
            size: size,
            quantity: 1
        });
    }

    saveCart();

    checkoutMessage.textContent = "";
    renderCart();
}

// STEP 6: Change quantity or remove a product.
function changeQuantity(key, change) {
    const item = cart.get(key);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        cart.delete(key);
    } else {
        cart.set(key, {
            ...item,
            quantity: newQuantity
        });
    }

    saveCart();
    checkoutMessage.textContent = "";
    renderCart();
}

// STEP 7: Display the cart and calculate the total.
function isPromotionActive() {
    const today = new Date();
    const day = today.getDate();

    const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    ).getDate();

    return day >= lastDayOfMonth - 2 || day === 1;
}
function calculateDiscount(subtotal, isStudentVerified) {
    if (isPromotionActive() && isStudentVerified) {
        return subtotal * 0.10;
    }

    return 0;
}
function renderCart() {
    cartItems.replaceChildren();

    let total = 0;
    let itemCount = 0;

    if (cart.size === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent =
            "Your cart is empty. Find something you love!";
        cartItems.appendChild(emptyMessage);
    }

    cart.forEach(function(item, key) {
        const cartProduct = products.find(function(product) {
            return product.id === item.productId;
        });

        if (!cartProduct) return;

        total += cartProduct.price * item.quantity;
        itemCount += item.quantity;

        const row = document.createElement("div");
        row.className = "cart-row";

        const details = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = cartProduct.name;

        const size = document.createElement("p");
        size.textContent = "Size: " + item.size;

        const price = document.createElement("p");
        price.textContent =
            formatPrice(cartProduct.price) + " each";

        details.append(name, size, price);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minusButton = document.createElement("button");
        minusButton.textContent = "−";
        minusButton.type = "button";
        minusButton.setAttribute(
            "aria-label", "Remove one " + cartProduct.name + ", size " + item.size
        );

        minusButton.addEventListener("click", function() {
            changeQuantity(key, -1);
        });

        const quantityText = document.createElement("span");
        quantityText.textContent = item.quantity;

        const plusButton = document.createElement("button");
        plusButton.textContent = "+";
        plusButton.type = "button";
        plusButton.setAttribute(
            "aria-label", "Add one " + cartProduct.name + ", size " + item.size
        );

        plusButton.addEventListener("click", function() {
            changeQuantity(key, 1);
        });

        controls.append(minusButton, quantityText, plusButton);
        row.append(details, controls);
        cartItems.appendChild(row);
    });

    cartCount.textContent = itemCount;
const subtotal = total;
const isStudentVerified = false;
const discount = calculateDiscount(subtotal, isStudentVerified);
const finalTotal = subtotal - discount;

cartTotal.textContent = formatPrice(finalTotal);
}
let promoMessage = document.getElementById("promo-message");

if (!promoMessage) {
    promoMessage = document.createElement("p");
    promoMessage.id = "promo-message";
    cartTotal.parentElement.appendChild(promoMessage);
}

if (isPromotionActive()) {
    promoMessage.textContent =
        "🎉 Month-End Special! Verified students get 10% off. " +
        "Promotion runs during the last 3 days of the month and the 1st.";
} else {
    promoMessage.textContent =
        "🎓 Student special: Get 10% off during our month-end promotion!";
}

// STEP 8: Search products and filter by category.
function filterProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = products.filter(function(product) {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);

// STEP 9: Handle the demonstration checkout.
checkoutButton.addEventListener("click", function() {
    if (cart.size === 0) {
        checkoutMessage.textContent =
            "Your cart is empty. Add a product first.";
        return;
    }

    // Save the shopping cart before opening another page.
    saveCart();

    window.location.href = "account.html";
});

// Allow the customer to continue without an account.
document.getElementById("continue-guest")
    .addEventListener("click", function() {
        document.getElementById("account-section").hidden = true;
        document.getElementById("delivery-section").hidden = false;

        document.getElementById("delivery-section")
            .scrollIntoView({ behavior: "smooth" });
    });

// Show the sign-in form.
document.getElementById("show-login")
    .addEventListener("click", function() {
        document.getElementById("login-form").hidden = false;
        document.getElementById("register-form").hidden = true;
    });

// Show the registration form.
document.getElementById("show-register")
    .addEventListener("click", function() {
        document.getElementById("register-form").hidden = false;
        document.getElementById("login-form").hidden = true;
    });

document.addEventListener("DOMContentLoaded", function() {
    const verificationForm = document.getElementById(
        "student-verification-form"
    );
    const studentEmailInput = document.getElementById("student-email");
    const verificationMessage = document.getElementById(
        "student-verification-message"
    );

    if (!verificationForm) return;

    verificationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = studentEmailInput.value.trim().toLowerCase();
        const parts = email.split("@");
        const domain = parts.length === 2 ? parts[1] : "";

        if (!domain) {
            verificationMessage.textContent =
                "Please enter a valid email address.";
            return;
        }

        const recognisedEducationDomain =
            domain.endsWith(".ac.za") ||
            domain.endsWith(".edu.za");

        if (recognisedEducationDomain) {
            verificationMessage.textContent =
                "Your email domain matches a South African education-domain pattern. " +
                "This is a preliminary check, not confirmation of student status. " +
                "Email ownership verification is still required.";
        } else {
            verificationMessage.textContent =
                "We couldn't recognise this as a South African education-domain " +
                "address. Check your institution's official student email format. " +
                "Some institutions may use other domains.";
        }
    });
});
// STEP 10: Show the initial products and cart.
displayProducts(products);
renderCart();