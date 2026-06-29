import { Game } from "./core/Game.js";
import { getSpriteCache } from "./assets/ProceduralSprites.js";
import { GameIdentity } from "./config/GameIdentity.js";

const canvas = document.querySelector("#game-canvas");
const shell = document.querySelector("#game-shell");

function showLoadError(error) {
  console.error(error);

  if (!shell) {
    return;
  }

  shell.innerHTML = `
    <div style="max-width:720px;padding:32px;text-align:center;font-family:monospace;">
      <h1 style="color:#ffe09a;margin:0 0 16px;">${GameIdentity.title} failed to load</h1>
      <p style="color:#d9e8e2;line-height:1.6;">
        This game uses ES modules and must be opened through a local web server,
        not by double-clicking <code>index.html</code>.
      </p>
      <p style="color:#9eb0aa;line-height:1.6;">
        In the game folder, run:<br />
        <code style="color:#fff4dc;">npm start</code><br />
        then open <code style="color:#fff4dc;">http://localhost:8765</code>
      </p>
      <pre style="margin-top:20px;padding:16px;background:rgba(0,0,0,0.35);color:#ff9a9a;text-align:left;overflow:auto;">${error?.stack ?? error?.message ?? error}</pre>
    </div>
  `;
}

function boot() {
  try {
    getSpriteCache();
    const game = new Game(canvas);
    game.start();
    game.initialize().catch((error) => {
      console.warn("Background asset load failed.", error);
    });
  } catch (error) {
    showLoadError(error);
  }
}

boot();
