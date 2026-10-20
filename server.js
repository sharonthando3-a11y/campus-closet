require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));

// Keep your API key on the server only.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Serve Campus Closet website files.
app.use(express.static(__dirname));

// Confirm the server is running.
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// AI shopping assistant.
app.post("/api/chat", async (req, res) => {
    console.log("✅ /api/chat route reached");

    console.log("Request body:", req.body);
    try {
        const message = req.body?.message;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        const products = Array.isArray(req.body.products)
    ? req.body.products
    : [];

const result = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input:
        "You are the Campus Closet AI Stylist. Help university " +
        "students choose clothing and outfits within their budget. " +
        "Use only the supplied product catalogue. Prices are in " +
        "South African rand (R). Do not recommend items above the " +
        "user's stated budget.\n\n" +
        "Product catalogue:\n" +
        JSON.stringify(products) +
        "\n\nStudent's message:\n" +
        message.trim()
});

const reply = result.output_text;

        if (!reply) {
            return res.status(502).json({
                error: "Gemini returned an empty response."
            });
        }

        return res.json({ reply });

    } catch (error) {
        // Log the error for debugging, never the API key.
        console.error("Gemini request failed:", {
            message: error.message,
            status: error.status || error.statusCode || "unknown"
        });

        return res.status(500).json({
            error: "The AI assistant could not respond. Please try again."
        });
    }
});

// Return JSON for unknown API endpoints.
app.use("/api", (req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
});

// Handle invalid JSON and other request errors.
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    console.error("Request error:", err.message);

    res.status(err.status || 500).json({
        error: "The request could not be processed."
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campus Closet running at http://localhost:${PORT}`);
});