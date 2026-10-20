# Nova OS — a custom home screen "OS" for LG TVs

Nova OS is a full-screen shell that runs **on top of** your LG TV's webOS. It replaces the
look and feel of the home screen with its own launcher, built-in apps and remote controls,
and it still launches your real streaming apps and HDMI inputs.

> **Why not replace webOS itself?** LG TVs only boot firmware signed by LG. Flashing
> anything else either gets rejected or bricks the TV. Nova runs as a sideloaded webOS
> app instead: it's safe, reversible, and needs no root.

## Features

- **Home screen** with a big clock, a greeting and an animated wallpaper
- **Watch** row: your installed apps, read live from the TV when webOS allows it (falls back
  to Netflix, YouTube, Prime Video, Disney+, Spotify, Apple TV and the Browser)
- **Inputs** row: Live TV and HDMI 1–4
- **Nova apps**
  - **Ambient**: a burn-in-friendly clock that drifts around the screen (good for OLEDs) and
    starts on its own after a set idle time
  - **Snake**: play with the arrow keys and keep a high score
  - **Settings**: accent colour, wallpaper, 12/24-hour clock, ambient timeout, boot animation
  - **System**: TV model, firmware and webOS version
- Full **remote control** support: arrows, OK, BACK, and the coloured buttons
  (🔴 Ambient · 🟢 Snake · 🟡 Settings · 🔵 System). The **Magic Remote** pointer also works.
- Boot animation, toasts, and an "exit?" prompt on BACK

## Try it in a browser first

Open `index.html` in Chrome. Use the arrow keys, Enter, and Esc (for BACK). Press
`R` `G` `Y` `B` for the coloured buttons. App launches show a preview toast instead.

## Install on your LG TV

1. **Turn on Developer Mode on the TV.** Make an account at <https://webostv.developer.lge.com>,
   install the **Developer Mode** app from the LG Content Store, sign in, and turn
   *Dev Mode Status* and *Key Server* on. Note the IP address and passphrase it shows.
2. **Install the webOS CLI** on your computer:
   ```sh
   npm install -g @webos-tools/cli
   ```
3. **Register the TV.** Run `ares-setup-device` and add a device (for example `mytv`) with
   the TV's IP address and port `9922`. Then fetch the key:
   ```sh
   ares-novacom --device mytv --getkey   # enter the passphrase shown on the TV
   ```
4. **Build, install and launch:**
   ```sh
   ./tools/package.sh mytv
   ```
   Nova OS now shows up in your TV's app list. Pin it to the front of the launcher bar.

> Developer Mode sessions expire after 50 hours. Open the Developer Mode app and press
> *Extend* to keep sideloaded apps. (Rooted TVs can use Homebrew Channel instead, which
> doesn't expire.)

## Project layout

```
appinfo.json        webOS app manifest
index.html          all screens / layers
css/style.css       styling for a fixed 1920×1080 canvas (scaled to fit any screen)
js/luna.js          webOS service bridge (launch apps, list apps, system info)
js/nav.js           spatial focus navigation for the remote
js/store.js         settings stored in localStorage
js/snake.js         the Snake game
js/main.js          the shell: home screen, layers, keys, ambient mode, boot
tools/make_icons.py regenerates assets/icon.png and assets/largeIcon.png
tools/package.sh    builds the .ipk, and installs it if you give a device name
```

The code is plain ES5 with no build step, so it also runs on older TVs (webOS 3+).
