# twin-scenes-spot-the-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/DadayXz-code/makefun-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/DadayXz-code/makefun-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Scenes is a spot-the-difference game: two near-identical hand-drawn pictures side by side, seven hidden changes in each, a ticking clock, hints, combos and a score. Three original scenes — Night Market, Mountain Lake and Botanical Garden — each drawn entirely in code, with no image, sound or font files and no network request. Find a difference on either picture and it is circled on both; finish all three scenes to see your stars.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` from any static server. The hand-in program at `main.ts` copies `game/` and `screenshots/` to `/output` and writes `dossier.json` (run it with `MAKEFUN_OUTPUT_DIR=out node main.ts`).

## How it plays

- Click a difference on either picture — a green ring and check mark appear on both.
- Wrong clicks cost 15 points and reset your combo; chained finds build a combo bonus.
- Hints (H) ring a hidden difference for a few seconds and cost 50 points, three per scene.
- Each scene gives you 2:30 on the clock; finishing with time left earns a time bonus and stars.
- Keyboard: H hint, R restart scene, M mute, Esc menu, 1/2/3 jump to a scene, Enter to start.

## Layout

- `main.ts` — the hand-in program (Node 22, standard library only).
- `game/index.html`, `game/style.css` — the page shell.
- `game/src/config.js` — sizes, timing and scoring.
- `game/src/scenes.js` — the three scenes and their 7 differences each.
- `game/src/state.js` — screens, scoring, timer and hints.
- `game/src/input.js` — mouse, touch and keyboard.
- `game/src/render.js` — everything drawn on the canvas.
- `game/src/audio.js` — synthesised WebAudio sounds, no audio files.
- `game/src/shots.js` — deterministic `?shot=` states for the screenshots.
- `game/src/main.js` — bootstrap and game loop.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — real renders of this game's own code in a browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=c1yxpfdh&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
