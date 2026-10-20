"use strict";

// Find the elements on the checkout page.
const orderItems = document.getElementById("order-items");
const subtotalElement = document.getElementById("subtotal");
const deliveryFeeElement = document.getElementById("delivery-fee");
const totalElement = document.getElementById("order-total");
const deliveryOption = document.getElementById("delivery-option");
const checkoutForm = document.getElementById("checkout-form");
const checkoutMessage = document.getElementById("checkout-message");
const thankYouSection = document.getElementById("thank-you-section");
const orderReference = document.getElementById("order-reference");

const money = amount =>
    new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR"
    }).format(amount);

// Read the cart saved by script.js.
let savedCart = [];

try {
    savedCart = JSON.parse(localStorage.getItem("campusCart") || "[]");
} catch (error) {
    savedCart = [];
}

// Delivery prices in rand.
const deliveryPrices = {
    standard: 50,
    express: 100,
    collection: 0
};

// Convert the saved cart into product rows.
function getCartItems() {
    if (!Array.isArray(savedCart)) {
        return [];
    }

    return savedCart.flatMap(entry => {
        if (
            Array.isArray(entry) &&
            entry.length === 2 &&
            Number.isFinite(Number(entry[1])) &&
            Number(entry[1]) > 0
        ) {
            const legacyKey = String(entry[0]);
            const [id, ...sizeParts] = legacyKey.split("::");

            return [{
                id: Number(id),
                size: sizeParts.length > 0
                    ? sizeParts.join("::")
                    : "Size not selected",
                quantity: Number(entry[1])
            }];
        }

        if (
            entry &&
            Number.isFinite(Number(entry.productId)) &&
            typeof entry.size === "string" &&
            Number.isFinite(Number(entry.quantity)) &&
            Number(entry.quantity) > 0
        ) {
            return [{
                id: Number(entry.productId),
                size: entry.size,
                quantity: Number(entry.quantity)
            }];
        }

        return [];
    });
}

// Find product information in the main shop's saved catalogue.
// The catalogue is stored here when script.js saves the cart.
function getProducts() {
    try {
        return JSON.parse(localStorage.getItem("campusProducts") || "[]");
    } catch (error) {
        return [];
    }
}

function renderOrder() {
    const cartItems = getCartItems();
    const products = getProducts();

    orderItems.replaceChildren();

    let subtotal = 0;
    let foundItems = 0;

    cartItems.forEach(item => {
        const product = products.find(
            product => Number(product.id) === item.id
        );

        if (!product) {
            return;
        }

        const price = Number(product.price);

        if (!Number.isFinite(price) || price < 0) {
            return;
        }

        foundItems++;

        const lineTotal = price * item.quantity;
        subtotal += lineTotal;

        const row = document.createElement("p");
        const size = item.size === "Size not selected" &&
            Array.isArray(product.sizes) &&
            product.sizes.length === 1
            ? product.sizes[0]
            : item.size;

        row.textContent =
            `${product.name} (Size: ${size}) × ${item.quantity} — ${money(lineTotal)}`;

        orderItems.appendChild(row);
    });

    if (foundItems === 0) {
        const message = document.createElement("p");
        message.textContent =
            "Your cart is empty or the product details have not been saved yet.";
        orderItems.appendChild(message);
    }

    subtotalElement.textContent = money(subtotal);

    updateTotals(subtotal);

    return { subtotal, foundItems };
}

function updateTotals(subtotal) {
    const fee = deliveryPrices[deliveryOption.value] ?? 50;

    deliveryFeeElement.textContent = money(fee);
    totalElement.textContent = money(subtotal + fee);
}

// Update delivery fee when the customer chooses an option.
deliveryOption.addEventListener("change", () => {
    const { subtotal } = renderOrder();
    updateTotals(subtotal);
});

// Submit a demo order.
checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    const { subtotal, foundItems } = renderOrder();

    if (foundItems === 0 || subtotal <= 0) {
        checkoutMessage.textContent =
            "Your order cannot be placed because your cart is empty or unavailable.";
        return;
    }

    if (!checkoutForm.reportValidity()) {
        return;
    }

    const reference =
        "CC-" + Date.now().toString().slice(-8);

    orderReference.textContent = reference;

    checkoutForm.hidden = true;
    document.querySelector(".checkout-heading").hidden = true;

    document.querySelectorAll(".checkout-section").forEach(section => {
        section.hidden = true;
    });

    thankYouSection.hidden = false;

    // Clear the demo cart after checkout.
    localStorage.removeItem("campusCart");

    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Display the order when the page opens.
renderOrder();