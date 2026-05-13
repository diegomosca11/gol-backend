const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");

const app     = express();
const PORT    = process.env.PORT || 3001;
const API_KEY = process.env.BSD_API_KEY || "b51ccc3678ba8ecf80a696ebdd9ba1ea7d782c31";
const BSD     = "https://sports.bzzoiro.com/api/v2";

// Allow requests from anywhere (Claude.ai artifact, local, etc.)
app.use(cors());
app.use(express.json());

// Helper: fetch from BSD with auth
async function bsd(path) {
  const url = `${BSD}${path}`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Token ${API_KEY}`,
      "Accept": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BSD ${res.status}: ${text}`);
  }
  return res.json();
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Gol Score Backend running ✅" });
});

// Live events
app.get("/api/live", async (req, res) => {
  try {
    const data = await bsd("/events/live/");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Event stats by ID
app.get("/api/stats/:id", async (req, res) => {
  try {
    const data = await bsd(`/events/${req.params.id}/stats/`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Event details by ID
app.get("/api/event/:id", async (req, res) => {
  try {
    const data = await bsd(`/events/${req.params.id}/`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Bulk: live + stats for all matches in one call (saves round trips)
app.get("/api/dashboard", async (req, res) => {
  try {
    const liveData = await bsd("/events/live/");
    const events   = liveData.events ?? liveData.results ?? [];

    if (events.length === 0) {
      return res.json({ events: [], stats: {} });
    }

    // Fetch stats for up to 12 games in parallel
    const slice = events.slice(0, 12);
    const statsResults = await Promise.allSettled(
      slice.map(e => bsd(`/events/${e.id}/stats/`))
    );

    const stats = {};
    slice.forEach((e, i) => {
      stats[e.id] = statsResults[i].status === "fulfilled"
        ? statsResults[i].value
        : null;
    });

    res.json({ events: slice, stats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Gol Score Backend rodando na porta ${PORT}`);
});
