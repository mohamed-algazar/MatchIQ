import { useState, useRef, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #070a0d;
    --surface: #0d1117;
    --surface2: #111820;
    --border: rgba(255,255,255,0.07);
    --green: #00e87a;
    --green-dim: rgba(0,232,122,0.1);
    --green-glow: rgba(0,232,122,0.2);
    --red: #ff4d6d;
    --red-dim: rgba(255,77,109,0.1);
    --white: #eef2f7;
    --muted: #4e5a68;
    --muted2: #8a9ab0;
  }

  body { background: var(--bg); color: var(--white); font-family: 'DM Sans', sans-serif; font-weight: 300; overflow-x: hidden; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 60px;
    background: rgba(7,10,13,0.85); backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 3px; color: var(--green); cursor: pointer; text-shadow: 0 0 20px var(--green-glow); }
  .nav-logo span { color: var(--white); }
  .nav-links { display: flex; gap: 4px; }
  .nav-link {
    padding: 6px 16px; border-radius: 4px; font-size: 13px; letter-spacing: 0.5px;
    cursor: pointer; color: var(--muted2); transition: all 0.2s; border: none; background: none; font-family: 'DM Sans', sans-serif;
  }
  .nav-link:hover { color: var(--white); }
  .nav-link.active { color: var(--green); background: var(--green-dim); }
  .nav-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    background: var(--green-dim); color: var(--green); padding: 3px 8px; border-radius: 2px; letter-spacing: 1px;
  }

  /* PAGE WRAPPER */
  .page { flex: 1; padding-top: 60px; }

  /* ========== HOME ========== */
  .home { min-height: 100vh; }

  .hero {
    min-height: calc(100vh - 60px);
    display: flex; flex-direction: column; justify-content: center;
    padding: 80px 48px; position: relative; overflow: hidden;
  }
  .hero-glow {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 55% 60% at 75% 50%, rgba(0,232,122,0.05) 0%, transparent 70%),
                radial-gradient(ellipse 30% 40% at 5% 85%, rgba(0,232,122,0.03) 0%, transparent 60%);
  }
  .pitch-bg {
    position: absolute; right: 48px; top: 50%; transform: translateY(-50%);
    width: 500px; height: 340px; opacity: 0.035;
    border: 1.5px solid var(--green); border-radius: 6px;
  }
  .pitch-bg::before { content:''; position:absolute; left:50%; top:0; bottom:0; width:1px; background:var(--green); }
  .pitch-bg::after { content:''; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:90px; height:90px; border:1.5px solid var(--green); border-radius:50%; }

  .hero-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 3px;
    color: var(--green); text-transform: uppercase; margin-bottom: 20px;
    display: flex; align-items: center; gap: 10px;
    animation: fadeUp 0.7s ease both;
  }
  .hero-eyebrow::before { content:''; width:28px; height:1px; background:var(--green); }

  .hero-h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(64px, 9vw, 128px); line-height: 0.88;
    letter-spacing: 1px; margin-bottom: 28px;
    animation: fadeUp 0.7s 0.08s ease both;
  }
  .hero-h1 em { color: var(--green); font-style: normal; text-shadow: 0 0 50px var(--green-glow); display: block; }

  .hero-p {
    max-width: 420px; color: var(--muted2); font-size: 15px; line-height: 1.75;
    margin-bottom: 40px; animation: fadeUp 0.7s 0.16s ease both;
  }

  .hero-btns { display: flex; gap: 12px; animation: fadeUp 0.7s 0.24s ease both; }
  .btn-primary {
    background: var(--green); color: #000; padding: 12px 28px; border-radius: 4px;
    font-weight: 500; font-size: 13px; letter-spacing: 0.5px; cursor: pointer;
    border: none; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    box-shadow: 0 0 24px var(--green-glow);
  }
  .btn-primary:hover { box-shadow: 0 0 40px var(--green-glow); transform: translateY(-1px); }
  .btn-ghost {
    background: none; color: var(--muted2); padding: 12px 20px; border-radius: 4px;
    font-size: 13px; cursor: pointer; border: 1px solid var(--border);
    font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }
  .btn-ghost:hover { color: var(--white); border-color: rgba(255,255,255,0.15); }

  .hero-stats {
    display: flex; gap: 0; margin-top: 72px;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    animation: fadeUp 0.7s 0.32s ease both;
  }
  .hstat { flex:1; padding: 20px 28px; border-right: 1px solid var(--border); }
  .hstat:last-child { border-right: none; }
  .hstat-num { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: var(--green); line-height:1; }
  .hstat-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }

  .features-section { padding: 100px 48px; }
  .sec-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 3px;
    color: var(--green); text-transform: uppercase; margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .sec-eyebrow::before { content:''; width:20px; height:1px; background:var(--green); }
  .sec-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px,5vw,64px); line-height:1; margin-bottom: 56px; }

  .feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
  .feat-card {
    background: var(--surface); padding: 36px 32px; position: relative; overflow: hidden;
    cursor: default; transition: background 0.3s;
  }
  .feat-card::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--green); transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
  .feat-card:hover { background: var(--surface2); }
  .feat-card:hover::after { transform:scaleX(1); }
  .feat-num { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--green); letter-spacing:2px; margin-bottom:10px; }
  .feat-name { font-size:15px; font-weight:500; margin-bottom:8px; }
  .feat-desc { font-size:13px; color:var(--muted2); line-height:1.7; }

  /* ========== UPLOAD ========== */
  .upload-page { padding: 60px 48px; max-width: 860px; margin: 0 auto; }
  .upload-header { margin-bottom: 48px; }
  .upload-header h1 { font-family:'Bebas Neue',sans-serif; font-size: 56px; line-height:1; margin-bottom:10px; }
  .upload-header p { color: var(--muted2); font-size:14px; }

  .drop-zone {
    border: 1.5px dashed rgba(0,232,122,0.25); border-radius: 8px;
    padding: 80px 40px; text-align: center; cursor: pointer;
    transition: all 0.3s; position: relative; background: var(--surface);
    margin-bottom: 32px;
  }
  .drop-zone:hover, .drop-zone.dragging {
    border-color: var(--green); background: var(--green-dim);
    box-shadow: 0 0 40px rgba(0,232,122,0.08);
  }
  .drop-icon { font-size: 48px; margin-bottom: 20px; display: block; }
  .drop-title { font-family:'Bebas Neue',sans-serif; font-size:32px; margin-bottom:8px; }
  .drop-sub { font-size:13px; color:var(--muted2); margin-bottom:24px; }
  .drop-formats { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); letter-spacing:1px; }

  .file-preview {
    background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    padding: 24px 28px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px;
  }
  .file-icon { font-size:32px; }
  .file-info { flex:1; }
  .file-name { font-size:14px; font-weight:500; margin-bottom:4px; }
  .file-size { font-size:12px; color:var(--muted2); }
  .file-remove { background:none; border:none; color:var(--muted); cursor:pointer; font-size:18px; padding:4px; transition:color 0.2s; }
  .file-remove:hover { color:var(--red); }

  .upload-options { display: grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:32px; }
  .option-card {
    background: var(--surface); border: 1px solid var(--border); border-radius:6px; padding:20px;
    cursor:pointer; transition:all 0.2s;
  }
  .option-card:hover { border-color: rgba(0,232,122,0.3); }
  .option-card.selected { border-color: var(--green); background: var(--green-dim); }
  .option-title { font-size:13px; font-weight:500; margin-bottom:4px; }
  .option-desc { font-size:12px; color:var(--muted2); }

  .progress-bar-wrap { background: var(--surface); border-radius:4px; height:4px; margin-bottom:8px; overflow:hidden; }
  .progress-bar { height:100%; background: var(--green); border-radius:4px; transition: width 0.3s; box-shadow: 0 0 8px var(--green-glow); }
  .progress-label { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted2); display:flex; justify-content:space-between; }

  .analyze-btn {
    width:100%; padding:16px; background:var(--green); color:#000; border:none;
    border-radius:6px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500;
    cursor:pointer; transition:all 0.2s; letter-spacing:0.5px;
    box-shadow: 0 0 30px var(--green-glow);
  }
  .analyze-btn:hover { box-shadow: 0 0 50px var(--green-glow); transform:translateY(-1px); }
  .analyze-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none; }

  /* ========== TEAM ANALYTICS ========== */
  .analytics-page { padding: 48px; }
  .page-header { margin-bottom: 48px; display:flex; align-items:flex-end; justify-content:space-between; }
  .page-header h1 { font-family:'Bebas Neue',sans-serif; font-size:52px; line-height:1; }
  .page-header p { color:var(--muted2); font-size:13px; margin-top:6px; }
  .match-badge {
    font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--green);
    background:var(--green-dim); border:1px solid rgba(0,232,122,0.2);
    padding:6px 14px; border-radius:4px; letter-spacing:1px;
  }

  .team-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
  .stat-card {
    background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:28px;
    position:relative; overflow:hidden;
  }
  .stat-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:var(--green); }
  .stat-card-label { font-size:11px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; font-family:'JetBrains Mono',monospace; }
  .stat-card-val { font-family:'Bebas Neue',sans-serif; font-size:52px; color:var(--green); line-height:1; }
  .stat-card-sub { font-size:12px; color:var(--muted2); margin-top:6px; }

  .possession-card {
    background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:28px; margin-bottom:20px;
  }
  .poss-label { font-size:11px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:20px; font-family:'JetBrains Mono',monospace; }
  .poss-bar-wrap { height:8px; background:var(--surface2); border-radius:4px; overflow:hidden; margin-bottom:14px; display:flex; }
  .poss-bar-1 { background:var(--green); border-radius:4px 0 0 4px; transition:width 0.5s; }
  .poss-bar-2 { background:var(--red); border-radius:0 4px 4px 0; transition:width 0.5s; flex:1; }
  .poss-teams { display:flex; justify-content:space-between; }
  .poss-team { display:flex; align-items:center; gap:8px; }
  .poss-dot { width:8px; height:8px; border-radius:50%; }
  .poss-team-name { font-size:13px; font-weight:500; }
  .poss-pct { font-family:'Bebas Neue',sans-serif; font-size:28px; line-height:1; margin-left:auto; }

  .pitch-visual {
    background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:24px; margin-bottom:20px;
  }
  .pitch-label { font-size:11px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:16px; font-family:'JetBrains Mono',monospace; }
  .pitch-field {
    width:100%; aspect-ratio:16/9; background:rgba(0,232,122,0.02);
    border:1px solid rgba(255,255,255,0.06); border-radius:4px; position:relative; overflow:hidden;
  }
  .pitch-field::before { content:''; position:absolute; left:50%; top:0; bottom:0; width:1px; background:rgba(255,255,255,0.05); }
  .pitch-field::after { content:''; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:80px; height:80px; border:1px solid rgba(255,255,255,0.05); border-radius:50%; }
  .pdot { position:absolute; border-radius:50%; transform:translate(-50%,-50%); }
  .pdot-1 { width:10px; height:10px; background:var(--green); box-shadow:0 0 8px var(--green-glow); }
  .pdot-2 { width:10px; height:10px; background:var(--red); box-shadow:0 0 8px rgba(255,77,109,0.4); }
  .pdot-ball { width:7px; height:7px; background:#fff; box-shadow:0 0 6px rgba(255,255,255,0.7); }
  .avg-dot { opacity:0.5; }

  .pitch-legend { display:flex; gap:24px; margin-top:14px; }
  .legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted2); }
  .legend-dot { width:8px; height:8px; border-radius:50%; }

  .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
  .mini-card { background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:20px; }
  .mini-card-val { font-family:'Bebas Neue',sans-serif; font-size:36px; color:var(--green); line-height:1; margin-bottom:4px; }
  .mini-card-label { font-size:11px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; }

  /* ========== PLAYER ANALYTICS ========== */
  .player-page { padding:48px; }
  .player-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:0; }
  .player-card {
    background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:24px;
    cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .player-card::before { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--green); transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
  .player-card:hover { border-color:rgba(0,232,122,0.25); }
  .player-card:hover::before { transform:scaleX(1); }
  .player-card.selected { border-color:var(--green); background:var(--green-dim); }
  .player-card-header { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .player-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:600; font-family:'Bebas Neue',sans-serif; }
  .avatar-1 { background:var(--green-dim); border:1px solid rgba(0,232,122,0.3); color:var(--green); }
  .avatar-2 { background:var(--red-dim); border:1px solid rgba(255,77,109,0.3); color:var(--red); }
  .player-id { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); }
  .player-team-tag { font-size:10px; letter-spacing:1px; padding:2px 8px; border-radius:2px; font-family:'JetBrains Mono',monospace; }
  .tag-1 { background:var(--green-dim); color:var(--green); }
  .tag-2 { background:var(--red-dim); color:var(--red); }

  .player-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .player-stat { }
  .player-stat-val { font-family:'Bebas Neue',sans-serif; font-size:22px; line-height:1; }
  .player-stat-label { font-size:10px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; }

  .detail-panel {
    background:var(--surface); border:1px solid var(--border); border-radius:6px;
    padding:32px; margin-top:24px;
  }
  .detail-header { display:flex; align-items:center; gap:16px; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid var(--border); }
  .detail-avatar { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:22px; }
  .detail-name { font-family:'Bebas Neue',sans-serif; font-size:32px; line-height:1; }
  .detail-meta { font-size:12px; color:var(--muted2); margin-top:4px; }

  .detail-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .detail-stat { background:var(--bg); border:1px solid var(--border); border-radius:4px; padding:16px; }
  .detail-stat-val { font-family:'Bebas Neue',sans-serif; font-size:32px; color:var(--green); line-height:1; margin-bottom:4px; }
  .detail-stat-label { font-size:10px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; }

  .heatmap-wrap { border-radius:6px; overflow:hidden; position:relative; }
  .heatmap-label { font-size:11px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; font-family:'JetBrains Mono',monospace; }
  .mini-heatmap {
    width:100%; aspect-ratio:16/9; background:rgba(0,232,122,0.02);
    border:1px solid rgba(255,255,255,0.06); border-radius:4px; position:relative; overflow:hidden;
  }
  .heat-blob {
    position:absolute; border-radius:50%; transform:translate(-50%,-50%);
    background: radial-gradient(circle, rgba(0,232,122,0.4) 0%, rgba(0,232,122,0.1) 40%, transparent 70%);
  }

  /* ANIMATIONS */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .live { width:6px; height:6px; border-radius:50%; background:var(--green); display:inline-block; animation:pulse 2s infinite; margin-right:6px; }

  .tabs { display:flex; gap:4px; margin-bottom:28px; }
  .tab { padding:8px 20px; border-radius:4px; font-size:13px; cursor:pointer; border:1px solid var(--border); background:none; color:var(--muted2); font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .tab:hover { color:var(--white); }
  .tab.active { background:var(--green-dim); border-color:rgba(0,232,122,0.3); color:var(--green); }

  .empty-state { text-align:center; padding:80px; color:var(--muted); }
  .empty-state-icon { font-size:48px; margin-bottom:16px; display:block; opacity:0.4; }
  .empty-state-title { font-family:'Bebas Neue',sans-serif; font-size:28px; margin-bottom:8px; color:var(--muted2); }
  .empty-state-sub { font-size:13px; }

  .filter-bar { display:flex; gap:8px; margin-bottom:24px; align-items:center; }
  .filter-btn { padding:6px 14px; border-radius:3px; font-size:12px; cursor:pointer; border:1px solid var(--border); background:none; color:var(--muted2); font-family:'JetBrains Mono',monospace; letter-spacing:1px; transition:all 0.2s; }
  .filter-btn:hover { color:var(--white); }
  .filter-btn.active { background:var(--green-dim); border-color:rgba(0,232,122,0.3); color:var(--green); }
  .filter-label { font-size:11px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; margin-right:4px; }
`;

// ---- MOCK DATA ----
const MOCK_MATCH = {
  match_id: "match_0001",
  team_names: ["Al Ahly", "Zamalek"],
  team_possession: { team_1: 62, team_2: 38 },
  players: [
    { player_id: "P1", team: 1, avg_speed: 12.4, distance_covered: 8.2, touches: 34, ball_loss: 3, avg_position: { x: 22, y: 50 }, has_ball: false },
    { player_id: "P2", team: 1, avg_speed: 10.1, distance_covered: 6.7, touches: 21, ball_loss: 2, avg_position: { x: 28, y: 28 }, has_ball: false },
    { player_id: "P3", team: 1, avg_speed: 11.8, distance_covered: 7.9, touches: 28, ball_loss: 4, avg_position: { x: 28, y: 72 }, has_ball: false },
    { player_id: "P4", team: 1, avg_speed: 13.2, distance_covered: 9.4, touches: 42, ball_loss: 5, avg_position: { x: 40, y: 40 }, has_ball: true },
    { player_id: "P5", team: 1, avg_speed: 9.8,  distance_covered: 6.1, touches: 18, ball_loss: 1, avg_position: { x: 40, y: 60 }, has_ball: false },
    { player_id: "P6", team: 1, avg_speed: 14.1, distance_covered: 10.2, touches: 38, ball_loss: 6, avg_position: { x: 47, y: 50 }, has_ball: false },
    { player_id: "P7", team: 2, avg_speed: 11.5, distance_covered: 7.6, touches: 22, ball_loss: 3, avg_position: { x: 78, y: 50 }, has_ball: false },
    { player_id: "P8", team: 2, avg_speed: 10.7, distance_covered: 7.1, touches: 19, ball_loss: 2, avg_position: { x: 72, y: 30 }, has_ball: false },
    { player_id: "P9", team: 2, avg_speed: 12.0, distance_covered: 8.0, touches: 25, ball_loss: 4, avg_position: { x: 72, y: 70 }, has_ball: false },
    { player_id: "P10", team: 2, avg_speed: 9.2, distance_covered: 5.8, touches: 14, ball_loss: 1, avg_position: { x: 62, y: 42 }, has_ball: false },
    { player_id: "P11", team: 2, avg_speed: 13.6, distance_covered: 9.8, touches: 31, ball_loss: 5, avg_position: { x: 62, y: 58 }, has_ball: false },
    { player_id: "P12", team: 2, avg_speed: 11.1, distance_covered: 7.3, touches: 20, ball_loss: 2, avg_position: { x: 55, y: 50 }, has_ball: false },
  ]
};

// ---- COMPONENTS ----

function Nav({ page, setPage, hasData }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage('home')}>Match<span>IQ</span></div>
      <div className="nav-links">
        <button className={`nav-link ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>Home</button>
        <button className={`nav-link ${page === 'upload' ? 'active' : ''}`} onClick={() => setPage('upload')}>Upload</button>
        <button className={`nav-link ${page === 'team' ? 'active' : ''}`} onClick={() => setPage('team')} disabled={!hasData} style={{ opacity: hasData ? 1 : 0.4 }}>Team Analytics</button>
        <button className={`nav-link ${page === 'players' ? 'active' : ''}`} onClick={() => setPage('players')} disabled={!hasData} style={{ opacity: hasData ? 1 : 0.4 }}>Player Analytics</button>
      </div>
      {hasData && <span className="nav-badge"><span className="live" />MATCH_0001</span>}
    </nav>
  );
}

// ---- HOME PAGE ----
function HomePage({ setPage }) {
  const features = [
    { n:"01", name:"Multi-Object Tracking", desc:"YOLO-based detection of all players, referees, and the ball across every frame." },
    { n:"02", name:"Team Assignment", desc:"Automatic jersey-color clustering to assign every player to their team." },
    { n:"03", name:"Ball Interpolation", desc:"Smooth ball trajectory reconstruction during occlusion frames." },
    { n:"04", name:"Camera Movement", desc:"Motion compensation to isolate true player movement from camera pan/zoom." },
    { n:"05", name:"Speed & Distance", desc:"Real-world metrics using perspective transformation to world coordinates." },
    { n:"06", name:"Touch Detection", desc:"Proximity-based ball touch counting and ball loss detection per player." },
    { n:"07", name:"Heatmaps", desc:"Visual density maps showing each player's positional presence across the match." },
    { n:"08", name:"Average Position", desc:"Team formation shape from mean player positions — the real vs. planned formation." },
    { n:"09", name:"JSON Export", desc:"Structured match data export ready for dashboards, reports, and further analysis." },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow" />
        <div className="pitch-bg" />
        <div className="hero-eyebrow"><span className="live" />Football Video Intelligence</div>
        <h1 className="hero-h1">SEE THE GAME<em>DIFFERENTLY</em></h1>
        <p className="hero-p">MatchIQ turns raw match footage into tactical intelligence — tracking every player and the ball to generate professional-grade statistics for amateur teams.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => setPage('upload')}>Analyze a Match</button>
          <button className="btn-ghost" onClick={() => setPage('team')}>View Demo</button>
        </div>
        <div className="hero-stats">
          <div className="hstat"><div className="hstat-num">9+</div><div className="hstat-label">Tracking Features</div></div>
          <div className="hstat"><div className="hstat-num">60fps</div><div className="hstat-label">Frame Rate</div></div>
          <div className="hstat"><div className="hstat-num">YOLO</div><div className="hstat-label">Detection Model</div></div>
          <div className="hstat"><div className="hstat-num">JSON</div><div className="hstat-label">Export Format</div></div>
        </div>
      </section>

      <section className="features-section">
        <div className="sec-eyebrow">Capabilities</div>
        <h2 className="sec-title">WHAT MATCHIQ TRACKS</h2>
        <div className="feat-grid">
          {features.map(f => (
            <div className="feat-card" key={f.n}>
              <div className="feat-num">{f.n}</div>
              <div className="feat-name">{f.name}</div>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---- UPLOAD PAGE ----
function UploadPage({ setPage, setHasData }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [model, setModel] = useState('standard');
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleAnalyze = () => {
    setProcessing(true);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) { p = 100; clearInterval(iv); setDone(true); setHasData(true); }
      setProgress(Math.min(p, 100));
    }, 200);
  };

  if (done) return (
    <div className="upload-page">
      <div style={{ textAlign:'center', padding:'80px 0' }}>
        <div style={{ fontSize:64, marginBottom:24 }}>✅</div>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, marginBottom:12 }}>ANALYSIS COMPLETE</h1>
        <p style={{ color:'var(--muted2)', marginBottom:40 }}>match_0001 processed — {MOCK_MATCH.players.length} players detected</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button className="btn-primary" onClick={() => setPage('team')}>View Team Analytics</button>
          <button className="btn-ghost" onClick={() => setPage('players')}>View Player Analytics</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1>UPLOAD MATCH</h1>
        <p>Upload your match footage and MatchIQ will track players, detect events, and generate tactical statistics.</p>
      </div>

      {!file ? (
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <input ref={inputRef} type="file" accept="video/*" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
          <span className="drop-icon">🎥</span>
          <div className="drop-title">DROP YOUR VIDEO HERE</div>
          <p className="drop-sub">or click to browse files</p>
          <div className="drop-formats">MP4 · AVI · MOV · MKV</div>
        </div>
      ) : (
        <div className="file-preview">
          <span className="file-icon">🎬</span>
          <div className="file-info">
            <div className="file-name">{file.name}</div>
            <div className="file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
          </div>
          <button className="file-remove" onClick={() => { setFile(null); setProgress(0); setProcessing(false); }}>✕</button>
        </div>
      )}

      <div className="upload-options">
        <div className={`option-card ${model === 'standard' ? 'selected' : ''}`} onClick={() => setModel('standard')}>
          <div className="option-title">⚡ Standard Analysis</div>
          <div className="option-desc">Full tracking + possession + heatmaps. Recommended for most matches.</div>
        </div>
        <div className={`option-card ${model === 'deep' ? 'selected' : ''}`} onClick={() => setModel('deep')}>
          <div className="option-title">🔬 Deep Analysis</div>
          <div className="option-desc">Includes passing networks, advanced possession, and formation shift detection.</div>
        </div>
      </div>

      {processing && (
        <div style={{ marginBottom:24 }}>
          <div className="progress-bar-wrap"><div className="progress-bar" style={{ width:`${progress}%` }} /></div>
          <div className="progress-label"><span>Processing video frames...</span><span>{Math.round(progress)}%</span></div>
        </div>
      )}

      <button className="analyze-btn" onClick={handleAnalyze} disabled={!file || processing}>
        {processing ? `Analyzing... ${Math.round(progress)}%` : 'Analyze Match'}
      </button>
    </div>
  );
}

// ---- TEAM ANALYTICS ----
function TeamPage({ hasData }) {
  const d = MOCK_MATCH;

  if (!hasData) return (
    <div className="analytics-page">
      <div className="empty-state">
        <span className="empty-state-icon">📊</span>
        <div className="empty-state-title">NO MATCH DATA</div>
        <p className="empty-state-sub">Upload a match video first to see team analytics.</p>
      </div>
    </div>
  );

  const t1players = d.players.filter(p => p.team === 1);
  const t2players = d.players.filter(p => p.team === 2);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, lineHeight:1 }}>TEAM ANALYTICS</h1>
          <p style={{ color:'var(--muted2)', fontSize:13, marginTop:6 }}>{d.team_names[0]} vs {d.team_names[1]}</p>
        </div>
        <span className="match-badge"><span className="live" />{d.match_id.toUpperCase()}</span>
      </div>

      {/* Possession */}
      <div className="possession-card">
        <div className="poss-label">Ball Possession</div>
        <div className="poss-bar-wrap">
          <div className="poss-bar-1" style={{ width:`${d.team_possession.team_1}%` }} />
          <div className="poss-bar-2" />
        </div>
        <div className="poss-teams">
          <div className="poss-team">
            <div className="poss-dot" style={{ background:'var(--green)' }} />
            <span className="poss-team-name">{d.team_names[0]}</span>
            <span className="poss-pct" style={{ color:'var(--green)', marginLeft:12 }}>{d.team_possession.team_1}%</span>
          </div>
          <div className="poss-team">
            <div className="poss-dot" style={{ background:'var(--red)' }} />
            <span className="poss-team-name">{d.team_names[1]}</span>
            <span className="poss-pct" style={{ color:'var(--red)', marginLeft:12 }}>{d.team_possession.team_2}%</span>
          </div>
        </div>
      </div>

      {/* Pitch */}
      <div className="pitch-visual">
        <div className="pitch-label">Average Formation — Full Match</div>
        <div className="pitch-field">
          {t1players.map(p => (
            <div key={p.player_id} className="pdot pdot-1 avg-dot" style={{ left:`${p.avg_position.x}%`, top:`${p.avg_position.y}%` }} title={p.player_id} />
          ))}
          {t2players.map(p => (
            <div key={p.player_id} className="pdot pdot-2 avg-dot" style={{ left:`${p.avg_position.x}%`, top:`${p.avg_position.y}%` }} title={p.player_id} />
          ))}
          <div className="pdot pdot-ball" style={{ left:'50%', top:'48%' }} />
        </div>
        <div className="pitch-legend">
          <div className="legend-item"><div className="legend-dot" style={{ background:'var(--green)' }} />{d.team_names[0]}</div>
          <div className="legend-item"><div className="legend-dot" style={{ background:'var(--red)' }} />{d.team_names[1]}</div>
          <div className="legend-item"><div className="legend-dot" style={{ background:'#fff' }} />Ball</div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="team-grid-2">
        {[0,1].map(ti => {
          const players = ti === 0 ? t1players : t2players;
          const color = ti === 0 ? 'var(--green)' : 'var(--red)';
          const totalTouches = players.reduce((a,p) => a + p.touches, 0);
          const avgSpeed = (players.reduce((a,p) => a + p.avg_speed, 0) / players.length).toFixed(1);
          const totalDist = players.reduce((a,p) => a + p.distance_covered, 0).toFixed(1);
          const totalLosses = players.reduce((a,p) => a + p.ball_loss, 0);
          return (
            <div className="stat-card" key={ti} style={{ '--accent': color }}>
              <div style={{ '--c': color }} >
                <div style={{ borderLeft:`3px solid ${color}`, paddingLeft:16, marginBottom:20 }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, lineHeight:1 }}>{d.team_names[ti]}</div>
                  <div style={{ fontSize:12, color:'var(--muted2)', marginTop:4 }}>{players.length} Players Tracked</div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { val: totalTouches, label: 'Total Touches' },
                    { val: `${avgSpeed} km/h`, label: 'Avg Speed' },
                    { val: `${totalDist} km`, label: 'Total Distance' },
                    { val: totalLosses, label: 'Ball Losses' },
                  ].map(s => (
                    <div key={s.label} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:4, padding:'14px 16px' }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color, lineHeight:1 }}>{s.val}</div>
                      <div style={{ fontSize:10, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- PLAYER ANALYTICS ----
function PlayersPage({ hasData }) {
  const [selected, setSelected] = useState(null);
  const [teamFilter, setTeamFilter] = useState('all');
  const d = MOCK_MATCH;

  if (!hasData) return (
    <div className="player-page">
      <div className="empty-state">
        <span className="empty-state-icon">👤</span>
        <div className="empty-state-title">NO PLAYER DATA</div>
        <p className="empty-state-sub">Upload a match video first to see player analytics.</p>
      </div>
    </div>
  );

  const filtered = teamFilter === 'all' ? d.players : d.players.filter(p => p.team === parseInt(teamFilter));
  const sel = selected ? d.players.find(p => p.player_id === selected) : null;

  return (
    <div className="player-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, lineHeight:1 }}>PLAYER ANALYTICS</h1>
          <p style={{ color:'var(--muted2)', fontSize:13, marginTop:6 }}>{d.players.length} players tracked · {d.team_names[0]} vs {d.team_names[1]}</p>
        </div>
        <span className="match-badge"><span className="live" />{d.match_id.toUpperCase()}</span>
      </div>

      <div className="filter-bar">
        <span className="filter-label">Team:</span>
        {[['all','All'], ['1', d.team_names[0]], ['2', d.team_names[1]]].map(([val, label]) => (
          <button key={val} className={`filter-btn ${teamFilter === val ? 'active' : ''}`} onClick={() => setTeamFilter(val)}>{label}</button>
        ))}
      </div>

      <div className="player-grid">
        {filtered.map(p => {
          const isT1 = p.team === 1;
          const color = isT1 ? 'var(--green)' : 'var(--red)';
          return (
            <div key={p.player_id} className={`player-card ${selected === p.player_id ? 'selected' : ''}`} onClick={() => setSelected(selected === p.player_id ? null : p.player_id)}>
              <div className="player-card-header">
                <div className={`player-avatar ${isT1 ? 'avatar-1' : 'avatar-2'}`}>{p.player_id}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>Player {p.player_id}</div>
                  <div className="player-id">Track ID: {p.player_id}</div>
                </div>
                <span className={`player-team-tag ${isT1 ? 'tag-1' : 'tag-2'}`}>{isT1 ? d.team_names[0] : d.team_names[1]}</span>
              </div>
              <div className="player-stats-grid">
                <div className="player-stat">
                  <div className="player-stat-val" style={{ color }}>{p.touches}</div>
                  <div className="player-stat-label">Touches</div>
                </div>
                <div className="player-stat">
                  <div className="player-stat-val" style={{ color }}>{p.avg_speed}</div>
                  <div className="player-stat-label">Avg Speed</div>
                </div>
                <div className="player-stat">
                  <div className="player-stat-val" style={{ color }}>{p.distance_covered}km</div>
                  <div className="player-stat-label">Distance</div>
                </div>
                <div className="player-stat">
                  <div className="player-stat-val" style={{ color }}>{p.ball_loss}</div>
                  <div className="player-stat-label">Ball Losses</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sel && (() => {
        const isT1 = sel.team === 1;
        const color = isT1 ? 'var(--green)' : 'var(--red)';
        return (
          <div className="detail-panel">
            <div className="detail-header">
              <div className={`detail-avatar ${isT1 ? 'avatar-1' : 'avatar-2'}`} style={{ width:56, height:56, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:20, background: isT1 ? 'var(--green-dim)' : 'var(--red-dim)', border: `1px solid ${color}30`, color }}>{sel.player_id}</div>
              <div>
                <div className="detail-name">PLAYER {sel.player_id}</div>
                <div className="detail-meta">{isT1 ? d.team_names[0] : d.team_names[1]} · Track ID: {sel.player_id}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ marginLeft:'auto', background:'none', border:'1px solid var(--border)', color:'var(--muted)', padding:'6px 12px', borderRadius:4, cursor:'pointer', fontFamily:'DM Sans', fontSize:12 }}>Close ✕</button>
            </div>

            <div className="detail-stats">
              {[
                { val: sel.touches, label: 'Touches' },
                { val: `${sel.avg_speed} km/h`, label: 'Avg Speed' },
                { val: `${sel.distance_covered} km`, label: 'Distance' },
                { val: sel.ball_loss, label: 'Ball Losses' },
              ].map(s => (
                <div className="detail-stat" key={s.label}>
                  <div className="detail-stat-val" style={{ color }}>{s.val}</div>
                  <div className="detail-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="heatmap-label">Position Heatmap</div>
            <div className="mini-heatmap">
              <div style={{ position:'absolute', inset:0, background: isT1
                ? `radial-gradient(ellipse 25% 20% at ${sel.avg_position.x}% ${sel.avg_position.y}%, rgba(0,232,122,0.35) 0%, transparent 70%)`
                : `radial-gradient(ellipse 25% 20% at ${sel.avg_position.x}% ${sel.avg_position.y}%, rgba(255,77,109,0.35) 0%, transparent 70%)`
              }} />
              <div style={{ position:'absolute', inset:0, borderLeft:'1px solid rgba(255,255,255,0.04)', left:'50%', right:'unset', width:1 }} />
              <div className="pdot pdot-1" style={{ left:`${sel.avg_position.x}%`, top:`${sel.avg_position.y}%`, background: color, boxShadow:`0 0 10px ${color}` }} />
              <div style={{ position:'absolute', bottom:8, right:10, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'var(--muted)', letterSpacing:1 }}>
                AVG ({sel.avg_position.x}%, {sel.avg_position.y}%)
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ---- ROOT APP ----
export default function App() {
  const [page, setPage] = useState('home');
  const [hasData, setHasData] = useState(false);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Nav page={page} setPage={setPage} hasData={hasData} />
        <div className="page">
          {page === 'home' && <HomePage setPage={setPage} />}
          {page === 'upload' && <UploadPage setPage={setPage} setHasData={setHasData} />}
          {page === 'team' && <TeamPage hasData={hasData} />}
          {page === 'players' && <PlayersPage hasData={hasData} />}
        </div>
      </div>
    </>
  );
}