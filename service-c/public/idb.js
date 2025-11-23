const DB_NAME = 'pwaPlotCSVDB';
const STORE_NAME = 'files';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function getFileFromDB(filename) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(filename);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveFileToDB(filename, blob) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(blob, filename);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function listFiles() {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const keys = [];
        store.openKeyCursor().onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                keys.push(cursor.key);
                cursor.continue();
            } else {
                resolve(keys);
            }
        };
    });
}
