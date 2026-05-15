const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.BSD_API_KEY || "b51ccc3678ba8ecf80a696ebdd9ba1ea7d782c31";
const BSD = "https://sports.bzzoiro.com/api/v2";

app.use(cors({ origin: "*" }));
app.options("*", cors());
app.use(express.json());

async function bsd(path) {
  const res = await fetch(BSD + path, {
    headers: {
      "Authorization": "Token " + API_KEY,
      "Accept": "application/json"
    }
  });
  if (!res.ok) throw new Error("BSD error " + res.status);
  return res.json();
}

app.get("/", function(req, res) {
  res.json({ status: "ok", message: "Gol Score Backend rodando", version: "4.0" });
});

app.get("/api/test", async function(req, res) {
  try {
    var data = await bsd("/events/live/");
    var events = data.events || data.results || [];
    res.json({ status: "ok", bsd_connected: true, live_events: events.length });
  } catch(e) {
    res.json({ status: "error", bsd_connected: false, error: e.message });
  }
});

app.get("/api/dashboard", async function(req, res) {
  try {
    var liveData = await bsd("/events/live/");
    var events = liveData.events || liveData.results || [];
    if (events.length === 0) {
      return res.json({ events: [], stats: {} });
    }
    var slice = events.slice(0, 12);
    var statsResults = await Promise.allSettled(
      slice.map(function(e) { return bsd("/events/" + e.id + "/stats/"); })
    );
    var stats = {};
    slice.forEach(function(e, i) {
      stats[e.id] = statsResults[i].status === "fulfilled" ? statsResults[i].value : null;
    });
    res.json({ events: slice, stats: stats });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, function() {
  console.log("Gol Score Backend rodando na porta " + PORT);
});
