const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");

const app     = express();
const PORT    = process.env.PORT || 3001;
const API_KEY = process.env.BSD_API_KEY || "b51ccc3678ba8ecf80a696ebdd9ba1ea7d782c31";
const BSD     = "https://sports.bzzoiro.com/api/v2";

app.use(cors({ origin: "*", methods: ["GET","POST","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.options("*", cors());
app.use(express.json());

async function bsd(path) {
  const res = await fetch(${BSD}${path}, {
    headers: { "Authorization": Token ${API_KEY}, "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(BSD ${res.status}: ${await res.text()});
  return res.json();
}

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Gol Score Backend rodando ✅", version: "3.0" });
});

app.get("/api/test", async (req, res) => {
  try {
    const data  = await bsd("/events/live/");
    const events = data.events ?? data.results ?? [];
    res.json({ status: "ok", bsd_connected: true, live_events: events.length, sample: events.slice(0,2).map(e=>({id:e.id,home:e.home_team,away:e.away_team,minute:e.current_minute})) });
  } catch (e) {
    res.json({ status: "error", bsd_connected: false, error: e.message });
  }
});

app.get("/api/live", async (req, res) => {
  try { res.json(await bsd("/events/live/")); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/stats/:id", async (req, res) => {
  try { res.json(await bsd(/events/${req.params.id}/stats/)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const liveData = await bsd("/events/live/");
    const events   = liveData.events ?? liveData.results ?? [];
    if (events.length === 0) return res.json({ events: [], stats: {} });
    const slice = events.slice(0, 12);
    const statsResults = await Promise.allSettled(slice.map(e => bsd(/events/${e.id}/stats/)));
    const stats = {};
    slice.forEach((e, i) => { stats[e.id] = statsResults[i].status === "fulfilled" ? statsResults[i].value : null; });
    res.json({ events: slice, stats });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(✅ Gol Score Backend rodando na porta ${PORT}));
