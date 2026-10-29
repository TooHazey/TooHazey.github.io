# RyanOS — personal site

Live: https://toohazey.github.io/

## Editing
- **Online editor (owner only):** https://toohazey.github.io/admin.html — sign in with a fine-grained GitHub token
  scoped to this repo with *Contents: Read and write*. Saves commit straight to `content.json`.
- **Or by hand:** edit `content.json` on github.com. Images go in `media/`.

## Apps
Calendar, Photos, Safari (projects), Notes, Messages (a short FAQ chat), Markets (live crypto via CoinGecko), Snake, Terminal,
Guestbook, Mail, Settings (wallpaper, accent, motion). Plus Spotlight (Ctrl K), Launchpad (F4), Control Center, right-click menu, and a Now strip (weather, now playing, Fear & Greed).
Swipeable pages (Home, Projects, About) on desktop and phone — manage them in the editor under Pages.

A first visit plays a skippable RyanOS boot sequence (remembered in this browser). Achievements, wallpaper motion, and Terminal surprises (`matrix`, `cowsay`, `hire`, the Konami code) stay on this device.

The Now strip stays paused until a tap. It plays `nowPlaying.audio` (Hall of Fame by The Script, hosted at `media/hall-of-fame.mp3`) from the page's own audio element. An optional Mix link opens the YouTube video and is not what the page plays.

Live widgets: GitHub app + contribution graph (public API), Discord presence (Lanyard, set your user ID in the editor), crypto Fear & Greed gauge (alternative.me).
