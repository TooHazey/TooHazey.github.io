// ============================================================
//  EDIT EVERYTHING ABOUT YOUR SITE HERE.
//  Swap text, links, projects, photos — no other file needs touching.
// ============================================================
window.SITE = {
  handle: "ryan",                       // shown top-left in the menu bar
  name: "Ryan Dhooghe",
  tagline: "Developer — Minecraft addons, Discord bots, trading tools and game engines.",
  location: "Southfield, Michigan",
  email: "rdhooghe1999@gmail.com",
  accent: "#ff8a3d",

  lockWallpaper: "media/lock.jpg",
  desktopWallpaper: "media/desk.jpg",

  // Notifications on the lock screen (appear one by one)
  notifications: [
    { app: "GitHub", icon: "gh", title: "New commit pushed", body: "trading-bot: added paper-trading mode and risk limits.", time: "now" },
    { app: "Discord", icon: "dc", title: "Bot is online", body: "Your bot just came back up on the home server. Uptime 99.9%.", time: "12m ago" },
    { app: "Minecraft", icon: "mc", title: "Addon update live", body: "v2.3 of the Bedrock pack is out — new blocks, mobs and UI.", time: "1h ago" },
  ],

  // Safari tabs = your projects. "url" is optional.
  projects: [
    { name: "Bedrock Addons", url: "https://github.com/TooHazey", desc: "Custom Minecraft Bedrock Edition addons and resource packs — blocks, entities, scripting and UI, built with JSON + JavaScript.", tags: ["Minecraft", "JavaScript", "Bedrock API"] },
    { name: "Discord Bots", url: "https://github.com/TooHazey", desc: "Self-hosted Discord bots running on my own hardware — moderation, mini-games, server tools and slash commands.", tags: ["Python", "discord.py", "Self-hosted"] },
    { name: "Trading Bot", url: "https://github.com/TooHazey", desc: "Algorithmic trading assistant with live market data, strategy backtesting, paper trading and a FastAPI dashboard.", tags: ["Python", "FastAPI", "PostgreSQL"] },
    { name: "Game Engine", url: "https://github.com/TooHazey", desc: "An experimental game engine: entity-component system, renderer, input and an asset pipeline — learning by building.", tags: ["Engine", "ECS", "Rendering"] },
    { name: "Full-stack Apps", url: "https://github.com/TooHazey", desc: "Web apps end to end — React/TypeScript front ends, Python backends, Redis caching and auto-updating desktop builds.", tags: ["TypeScript", "React", "Redis"] },
  ],

  // Notes app = about you. Each note is a page.
  notes: [
    { title: "About me", date: "Today", body: "Hey, I'm Ryan. I'm a self-taught developer from Southfield, Michigan.\n\nI learn by building: if I want to understand something, I ship a version of it. That's how I got into Minecraft addons, then Discord bots, then trading tools and now my own game engine.\n\nWhen I'm not coding, I'm usually in Minecraft or Forza Horizon." },
    { title: "What I'm building", date: "This week", body: "• A trading bot with backtesting + a live dashboard\n• A Bedrock addon pack with custom mobs\n• A tiny game engine, from scratch\n• Auto-updater for my desktop apps" },
    { title: "Stack", date: "Pinned", body: "Languages: Python, JavaScript, TypeScript\nBackend: FastAPI, PostgreSQL, Redis\nFront end: React, HTML/CSS\nOther: Discord API, Minecraft Bedrock scripting, Windows builds" },
  ],

  // Photos app. Leave src empty to use the generated wallpapers, or add your own images to /media.
  photos: [
    { src: "media/desk.jpg", caption: "Voxel worlds" },
    { src: "media/lock.jpg", caption: "Late-night builds" },
  ],

  // Dock links on the right side
  socials: [
    { name: "GitHub", icon: "gh", url: "https://github.com/TooHazey" },
    { name: "Discord", icon: "dc", url: "https://discord.com/" },
    { name: "YouTube", icon: "yt", url: "https://youtube.com/" },
  ],
};
