/* Copyright 2023 Kaneko Qt
 * This file is part of YouTube Music Fresh.
 *
 * YouTube Music Fresh is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * YouTube Music Fresh is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with YouTube Music Fresh. If not, see <https://www.gnu.org/licenses/>.
 */

// @ts-check
"use strict";

class YouTubeMusicFresh
{
  static #storagePrefix = `$youtube-music-fresh`;
  static #debugPrefix = `[YouTube Music Fresh]`;

  /** @type {string[]} */
  static get #history() {return JSON.parse(window.localStorage.getItem(this.#storagePrefix + `/history`) ?? `[]`)}
  static set #history(value) {window.localStorage.setItem(this.#storagePrefix + `/history`, JSON.stringify(value))}

  /** @type {HTMLVideoElement} */
  static #player;

  static {this.#init()}
  static async #init()
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

    let lastSong = notnull(document.querySelector(`ytmusic-player-queue-item[selected]`));
    let lastSongId = this.#getSongId(lastSong);

    console.debug(this.#debugPrefix, `Song ended:`, lastSongId);

    // Due to #history returns a copy of the property we need to reassign it
    if (!this.#history.includes(lastSongId)) this.#history = this.#history.concat(lastSongId);

    // Skip listened songs
    let nextSong = notnull(lastSong.nextElementSibling);
    let nextSongId = this.#getSongId(nextSong);
    while (this.#history.includes(nextSongId))
    {
      console.debug(this.#debugPrefix, `Skipping song:`, nextSongId);

      // If we have reached the end of loaded songs
      if (nextSong.nextElementSibling === null)
      {
        let songsList = notnull(lastSong.parentElement);
        let songsCount = songsList.childElementCount;

        // Click on the latest song to start loading new songs
        cast(HTMLElement, nextSong.querySelector(`ytmusic-play-button-renderer`)).click();

        // Wait for new songs to load
        await waitFor(() => songsList.childElementCount > songsCount);
      }
      
      nextSong = notnull(nextSong.nextElementSibling);
      nextSongId = this.#getSongId(nextSong);
    }

    // Wait for YouTube Music to switch to the next song
    await waitForEvent(`loadstart`, this.#player);

    // Click on the next non-listened song
    cast(HTMLElement, nextSong.querySelector(`ytmusic-play-button-renderer`)).click();

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