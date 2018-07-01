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


/**
 * @description storage base class
 * @class Storage
 */
export default class Storage {
    constructor(dbName, version, options) { 
        this.storage = root.indexedDB || root.mozIndexedDB || root.webkitIndexedDB || root.msIndexedDB;
        this.db = null;
        this.dbName = dbName;
        this.dbVersion = version;
        this.start(options);
    }

    isStorageAvailable() {
        return this.storage !== 'undefined';
    }

    start(options) {
        return new Promise((resolve, reject) => {
            const request = this.storage.open(this.dbName, this.dbVersion);
            const { onupgradeneeded } = options; 

            request.onerror = function (event) {
                return reject(`Could not open this database!`)
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                return resolve(this.db);
            };
            
            const defaults = (event) => {
                const db = event.target.result; 
                if (event.oldVersion === 0) {
                    db.createObjectStore('defaultObjStore', { keyPath: 'id' });    
                }
            }

            // This event is only implemented in recent browsers
            request.onupgradeneeded = onupgradeneeded || defaults;
        });
    }

    open() {
        return this.db ? Promise.resolve(this.db) : this.start();
    }

    read(store) {
        return this.open()
            .then(db => {
                return new Promise((resolve, reject) => {
                    const transaction = db.transaction(store, 'readwrite');
                    const objectStore = transaction.objectStore(store);
                    let results = [];
                    let cursor = objectStore.openCursor();

                    cursor.onsuccess = function (event) {
                        const data = event.target.result;
                        if (data) {
                            results.push(data.value);
                            data.continue();
                        } else {
                            return resolve(results);
                        }
                    };

                    cursor.onerror = function (event) {
                        resolve(results);
                    }
                });
            });
    }

    get(item, store) {
        return this.open()
            .then(db => {
                return new Promise((resolve, reject) => {
                    const transaction = db.transaction([store], "readwrite");
                    const objectStore = transaction.objectStore(store);
                    const index = objectStore.index(item);
                    const request = index.get(email);

                    request.onsuccess = function (event) {
                        console.log(event.target.result);
                        return resolve(event.target.result);
                    };

                    request.onerror = function (event) {
                        resolve(event.target.result);
                    }
                });
            });
    }
    write(store, data) {
        return new Promise((resolve, reject) => {
            const db = this.db;
            const transaction = db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const timestamp = Date.now() + ((maxAge || 0) * 1000);
            return resolve(objectStore.put(Object.assign(data, { ttl: timestamp })));
        });
    }
    update(store, data) {
        return new Promise((resolve, reject) => {
            const db = this.db;
            const transaction = db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const timestamp = Date.now() + ((maxAge || 0) * 1000);
            return resolve(objectStore.put(Object.assign(data, { ttl: timestamp })));
        });
    }
    delete (store, key) {
        return new Promise(function (resolve, reject) {
            var { db } = this;
            var transaction = db.transaction([store], 'readwrite');
            var objectStore = transaction.objectStore(store);
            return resolve(objectStore.delete(key));
        });
    }
}
