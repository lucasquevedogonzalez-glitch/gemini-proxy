const express = require("express");
const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Changed to GET so code.org can call it using getJSON
app.get("/chat", async function(req, res) {
  const team = req.query.team;
  const systemPrompt = "You are a FIFA World Cup 2022 expert. Give 5 interesting facts about " + team + ". Format them as a numbered list.";

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
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
        })
      }
    );
    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply: reply });
  } catch (error) {
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
