/* Copyright 2023 Kaneko Qt
 * This file is part of Qt Kaneko's JS Helpers.
 *
 * Qt Kaneko's JS Helpers is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Qt Kaneko's JS Helpers is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Qt Kaneko's JS Helpers. If not, see <https://www.gnu.org/licenses/>.
 */

// @ts-check
"use strict";

/** Waits for {@link condition}, checking it after call and every {@link target} change.
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

/** Waits for {@link event} from {@link source} to be fired.
 * @param {string} event
 * @param {{
 *   addEventListener(type: string, listener: () => void): void,
 *   removeEventListener(type: string, listener: () => void): void,
 * }} source
 * @returns {Promise<void>}
 */
async function waitForEvent(event, source)
{
  return new Promise((resolve) => {
    let listener = () => {
      source.removeEventListener(event, listener);
      resolve();
    };
    source.addEventListener(event, listener);
  });
}