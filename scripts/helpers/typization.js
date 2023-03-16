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
  notnull(value);

  let typeCtor = type;
  let valueProto = (() => {switch (typeof value) {
    case "bigint": return BigInt.prototype;
    case "boolean": return Boolean.prototype;
    case "function": return Function.prototype;
    case "number": return Number.prototype;
    case "object": return Object.getPrototypeOf(value);
    case "string": return String.prototype;
    case "symbol": return Symbol.prototype;
  }})();

  return valueProto.constructor === typeCtor || valueProto instanceof typeCtor
         ? value
         : (() => {throw new TypeError(`Unable to cast object of type '${valueProto.constructor.name}' to type '${typeCtor.name}'`)})();
}