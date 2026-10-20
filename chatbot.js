"use strict";

(function () {
    // Get the product catalogue saved by the shop.
    let products = [];

    try {
        products = JSON.parse(
            localStorage.getItem("campusProducts") || "[]"
        );
    } catch (error) {
        console.error("Could not load the product catalogue.");
    }

    // Create the floating chat button.
    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "chat-launcher";
    launcher.textContent = "💬 Chat with our AI stylist";
    launcher.setAttribute("aria-expanded", "false");

    // Create the chat window.
    const panel = document.createElement("section");
    panel.className = "chat-panel";
    panel.hidden = true;

    panel.innerHTML = `
        <div class="chat-header">
            <div>
                <strong>Campus Closet Stylist</strong>
                <p>Your AI shopping assistant</p>
            </div>
            <button type="button" class="chat-close"
                aria-label="Close chat">×</button>
        </div>

        <div class="chat-messages" aria-live="polite">
            <div class="chat-bubble assistant">
                Hey! 👋 I'm your Campus Closet AI stylist.
                Ask me for outfit ideas or budget-friendly recommendations!
            </div>
        </div>

        <div class="chat-suggestions">
            <button type="button" data-prompt="Help me build a casual campus outfit.">
                Campus outfit
            </button>
            <button type="button" data-prompt="Recommend items under R300.">
                Under R300
            </button>
        </div>

        <form class="chat-form">
            <input class="chat-input" type="text"
                maxlength="1000" placeholder="Ask your stylist..."
                aria-label="Your message" required>
            <button type="submit">Send</button>
        </form>

        <p class="chat-disclaimer">
            AI suggestions may be imperfect. Never send payment details.
        </p>
    `;

    document.body.append(launcher, panel);

    const closeButton = panel.querySelector(".chat-close");
    const messages = panel.querySelector(".chat-messages");
    const form = panel.querySelector(".chat-form");
    const input = panel.querySelector(".chat-input");
    const sendButton = form.querySelector('button[type="submit"]');

    function toggleChat(open) {
        panel.hidden = !open;
        launcher.setAttribute("aria-expanded", String(open));

        if (open) input.focus();
    }

    launcher.addEventListener("click", function () {
        toggleChat(panel.hidden);
    });

    closeButton.addEventListener("click", function () {
        toggleChat(false);
    });

    function addBubble(text, role) {
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble " + role;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    }

    async function sendMessage(text) {
        const message = text.trim();

        if (!message || sendButton.disabled) return;

        addBubble(message, "customer");

        const typing = addBubble("Thinking...", "assistant");

        sendButton.disabled = true;
        input.disabled = true;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    products: products.map(function (product) {
                        return {
                            name: product.name,
                            category: product.category,
                            price: product.price,
                            size: product.sizes.join(", "),
                            description: product.description,
                            image: product.image,

                        };
                    })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "The AI stylist could not reply."
                );
            }

            typing.textContent = data.reply ||
                "Sorry, please try again.";

        } catch (error) {
            typing.textContent =
                error.message ||
                "I couldn't connect. Please try again.";
        } finally {
            sendButton.disabled = false;
            input.disabled = false;
            input.focus();
            messages.scrollTop = messages.scrollHeight;
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = input.value;
        input.value = "";

        sendMessage(message);
    });

    panel.querySelectorAll("[data-prompt]").forEach(function (button) {
        button.addEventListener("click", function () {
            sendMessage(button.dataset.prompt);
        });
    });
})();