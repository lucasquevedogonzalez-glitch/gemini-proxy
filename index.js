const express = require("express");
const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.post("/chat", async function(req, res) {
  const message = req.body.message;
  const systemPrompt = req.body.systemPrompt;
  const fullPrompt = systemPrompt + "\n\nUser says: " + message;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply: reply });

  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/", function(req, res) {
  res.send("Proxy is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
  console.log("Server running on port " + PORT);
});