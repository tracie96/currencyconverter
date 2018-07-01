/* eslint-env es6:false, amd */
/* eslint-disable max-len, spaced-comment, func-names, prefer-arrow-callback, no-var */

/*******************************************************************
 ******************** Promisified IndexedDB ************************
 *******************************************************************/
/**
 * Reference :: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */

/**
 * MIT License
 * Copyright (c) 2017 Upendra Dev Singh
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * urnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (factory) {
    if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define([], function () {
            return factory();
        });
    } else {
        window.JBIndexedDB = factory();
    }
}(function () {
    /**
     * @class Storage
     * @description It's a wrapper class wraps IndexedDB and provides a promisfied IndexedDB APIs.
     * 
     * @param {string} dbName Database name
     * @param {any} version Database version
     * @param {any} options Database options
     */
    function Storage(dbName, version, options) {
        this.store = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        this.db = null;
        this.dbName = dbName;
        this.dbVersion = version;
        this.boot(options);
    }

    /**
     * @description bootstraping module
     * @param {any} options 
     * @returns 
     */
    Storage.prototype.boot = function (options) {
        var store = this.store;
        var dbName = this.dbName;
        var dbVersion = this.dbVersion;
        var that = this;

        return new Promise(function (resolve, reject) {
            var request = store.open(dbName, dbVersion);
            var onupgradeneeded = options.onupgradeneeded;

            var defaults = function (event) {
                var db = event.target.result;
                if (event.oldVersion === 0) {
                    db.createObjectStore('defaultObjStore', { keyPath: 'id' });
                }
            };

            request.onerror = function () {
                return reject('Could not open this database!');
            };

            request.onsuccess = function (event) {
                that.db = event.target.result;
                return resolve(that.db);
            };

            // This event is only implemented in recent browsers
            request.onupgradeneeded = onupgradeneeded || defaults;
        });
    };
    /**
     * @description returns an existing db instance or creates one and returns the same
     * @returns IDB instance
     */
    Storage.prototype.open = function () {
        return this.db ? Promise.resolve(this.db) : this.boot();
    };
    /**
     * @description read records from given store
     * @param {any} store IDB store
     * @returns {promise} store records
     */
    Storage.prototype.read = function (store) {
        return this.open()
            .then(function (db) {
                return new Promise(function (resolve) {
                    var transaction = db.transaction(store, 'readwrite');
                    var objectStore = transaction.objectStore(store);
                    var results = [];
                    var cursor = objectStore.openCursor();

                    cursor.onsuccess = function (event) {
                        var data = event.target.result;
                        if (data) {
                            results.push(data.value);
                            data.continue();
                        } else {
                            return resolve(results);
                        }
                    };

                    cursor.onerror = function () {
                        resolve(results);
                    };
                });
            });
    };

    /**
     * @description creates a new record in the db
     * @param {any} store IDB store
     * @param {any} data record to be inserted into IDB
     * @param {integer} maxAge time in milliseconds
     * @returns {promise} inserted record
     */
    Storage.prototype.write = function (store, data, maxAge) {
        var that = this;
        return new Promise(function (resolve) {
            var db = that.db;
            var transaction = db.transaction([store], 'readwrite');
            var objectStore = transaction.objectStore(store);
            var timestamp = Date.now() + ((maxAge || 0) * 1000);
            return resolve(objectStore.put(Object.assign(data, { ttl: timestamp })));
        });
    };
    /**
     * @description updates given record of given store
     * @param {string} store IDB store name
     * @param {any} data a record to be updated in given store
     * @param {integer} maxAge time in milliseconds
     * @returns 
     */
    Storage.prototype.update = function (store, data, maxAge) {
        var that = this;
        return new Promise(function (resolve) {
            var db = that.db;
            var transaction = db.transaction([store], 'readwrite');
            var objectStore = transaction.objectStore(store);
            var timestamp = Date.now() + ((maxAge || 0) * 1000);
            return resolve(objectStore.put(Object.assign(data, { ttl: timestamp })));
        });
    };
    /**
     * @description deletes given record from the store
     * @param {any} store IDB store
     * @param {any} key unique key of record to be deleted
     * @returns 
     */
    Storage.prototype.delete = function (store, key) {
        var that = this;
        return new Promise(function (resolve) {
            var db = that.db;
            var transaction = db.transaction([store], 'readwrite');
            var objectStore = transaction.objectStore(store);
            return resolve(objectStore.delete(key));
        });
    };

    return Storage;
}));
