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

/**
 * @template T
 * @param {T} value
 * @returns {NonNullable<T>}
 */
function notnull(value)
{
  return value !== undefined && value !== null ? value : (() => {throw new Error(`Object reference not set to an instance of an object.`)})();
}

/** 
 * @template {Function} T
 * @param {T} type
 * @param {any} value
 * @returns {T["prototype"]}
 */
function cast(type, value)
{
  let valueCtor = Object.getPrototypeOf(notnull(value)).constructor;
  let typeCtor = type;
  return valueCtor === typeCtor ? value : (() => {throw new TypeError(`Unable to cast object of type '${valueCtor.name}' to type '${typeCtor.name}'`)})();
}