// ==UserScript==
// @name         YouTube Music Fresh
// @namespace    https://github.com/qt-kaneko/youtube-music-fresh
// @description  Auto skips listened tracks on YouTube Music.
// @icon         https://raw.github.com/qt-kaneko/youtube-music-fresh/main/icon.png
// @author       Kaneko Qt
// @homepageURL  https://github.com/qt-kaneko/youtube-music-fresh
// @version      1.0.0
// @copyright    2023, Kaneko Qt
// @license      GPL-3.0-or-later; https://www.gnu.org/licenses/gpl-3.0.txt
//
// @match        *://music.youtube.com/watch?*
//
// @run-at       document-end
//
// @grant        none
// ==/UserScript==

// @ts-check

/** Waits for {condition}, checking it after call and every {target} change.
 * @param {() => boolean} condition
 * @returns {Promise<void>}
 */
async function waitFor(condition,
                       target = document,
                       subtree = true, childList = true, attributes = true, characterData = true)
{
  return new Promise((resolve) => {
    if (condition()) resolve();
    else
    {
      let observer = new MutationObserver(() => {
        if (condition())
        {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(target, {
        subtree: subtree,
        childList: childList,
        attributes: attributes,
        characterData: characterData
      });
    }
  });
}

class YouTubeMusicFresh
{
  static #storagePrefix = `$youtube-music-fresh`;
  static #debugPrefix = `[YouTube Music Fresh]`;

  /** @type {string[]} */
  static get #history() {return JSON.parse(window.localStorage.getItem(this.#storagePrefix + `/history`) ?? `[]`)}
  static set #history(value) {window.localStorage.setItem(this.#storagePrefix + `/history`, JSON.stringify(value))}

  /** @type {HTMLVideoElement} */
  static #player;

  static {this.#ctor()}
  static async #ctor()
  {
    console.debug(this.#debugPrefix, `Starting...`);

    // @ts-ignore
    await waitFor(() => (this.#player = document.querySelector(`video`)) !== null);
    console.debug(this.#debugPrefix, `Found player:`, this.#player);

    this.#player.addEventListener(`ended`, async () => await this.#onSongEnded());
  }

  static async #onSongEnded()
  {
    let wasMuted = this.#player.muted;
    this.#player.muted = true; // To prevent songs beginning sounds

    /** @type {Element} */
    // @ts-ignore
    let lastSong = document.querySelector(`ytmusic-player-queue-item[selected]`);
    let lastSongId = this.#getSongId(lastSong);

    console.debug(this.#debugPrefix, `Song ended:`, lastSongId);

    // Due to #history returns a copy of the property we need to reassign it
    if (!this.#history.includes(lastSongId)) this.#history = this.#history.concat(lastSongId);

    // Skip listened songs
    /** @type {Element} */
    // @ts-ignore
    let nextSong = lastSong.nextSibling;
    let nextSongId = this.#getSongId(nextSong);
    while (this.#history.includes(nextSongId))
    {
      console.debug(this.#debugPrefix, `Skipping song:`, nextSongId);

      // If we have reached the end of loaded songs
      if (nextSong.nextSibling === null)
      {
        /** @type {Element} */
        // @ts-ignore
        let songsList = lastSong.parentElement;
        let songsCount = songsList.childElementCount;

        // Click on the latest song to start loading new songs
        // @ts-ignore
        nextSong.querySelector(`ytmusic-play-button-renderer`).click();

        // Wait for new songs to load
        await waitFor(() => songsList.childElementCount > songsCount);
      }
      
      // @ts-ignore
      nextSong = nextSong.nextSibling;
      nextSongId = this.#getSongId(nextSong);
    }

    // Wait for YouTube Music to switch to the next song
    /** @type {(this: HTMLVideoElement, ev: Event) => any} */
    // @ts-ignore
    let loadstartResolve = null;
    await new Promise((resolve) => {
      this.#player.addEventListener(`loadstart`, resolve);
      loadstartResolve = resolve;
    });
    this.#player.removeEventListener(`loadstart`, loadstartResolve);

    // Click on the next non-listened song
    // @ts-ignore
    nextSong.querySelector(`ytmusic-play-button-renderer`).click();

    console.debug(this.#debugPrefix, `Current song should be:`, nextSongId);

    this.#player.muted = wasMuted; // To prevent songs beginning sounds
  }

  /** @param {Element} song */
  static #getSongId(song)
  {
    let strings = song.querySelectorAll(`yt-formatted-string`);

    let songId = Array(...strings).map(string => `"${string.textContent}"`).join(`, `);

    return songId;
  }
}