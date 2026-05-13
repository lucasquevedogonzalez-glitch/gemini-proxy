const express = require("express");
const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/chat", async function(req, res) {
  const team = req.query.team;
  console.log("Request for team:", team);
  console.log("API key present:", !!GEMINI_API_KEY);

  const systemPrompt = "You are a FIFA World Cup 2022 expert. Give 3 short facts about " + team + " at the 2022 World Cup. Each fact must be one sentence maximum. Format as a numbered list. No bold or other formatting, just plain text";
  try {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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

    const data = await geminiRes.json();
    console.log("Gemini status:", geminiRes.status);
    console.log("Gemini response:", JSON.stringify(data).slice(0, 200));

    if (!data.candidates) {
      return res.status(500).json({ error: "No candidates", details: data });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply: reply });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", function(req, res) {
  res.send("Proxy is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
  console.log("Server running on port " + PORT);
});
