function inicializarFirebase() {
    if (window.APP.db) return window.APP.db;
    try {
        firebase.initializeApp(FIREBASE_CONFIG);
        window.APP.db = firebase.firestore();
        window.db = window.APP.db;
        return window.APP.db;
    } catch (e) {
        console.error('❌ Error inicializando Firebase:', e);
        return null;
    }
}

async function guardarFirebase(col, id, data) {
    const db = window.APP.db;
    if (!db || !navigator.onLine) return false;
    try {
        await db.collection(col).doc(id).set(data, { merge: true });
        delete window.APP.fbCache[col];
        return true;
    } catch (e) {
        console.error(`❌ Error guardando ${col}/${id}:`, e);
        return false;
    }
}

async function eliminarFirebase(col, id) {
    const db = window.APP.db;
    if (!db) return false;
    try {
        await db.collection(col).doc(id).delete();
        delete window.APP.fbCache[col];
        return true;
    } catch (e) {
        console.error(`❌ Error eliminando ${col}/${id}:`, e);
        return false;
    }
}

async function cargarFirebase(col, forceRefresh = false) {
    const db = window.APP.db;
    if (!db || !navigator.onLine) return {};

    const CACHE_TTL = 10000;
    const cached = window.APP.fbCache[col];
    if (!forceRefresh && cached && (Date.now() - cached.ts) < CACHE_TTL) {
        return cached.data;
    }
    try {
        const snap = await db.collection(col).get();
        const result = {};
        snap.forEach(doc => { result[doc.id] = doc.data(); });
        window.APP.fbCache[col] = { data: result, ts: Date.now() };
        return result;
    } catch (e) {
        console.error(`❌ Error cargando ${col}:`, e);
        return cached?.data || {};
    }
}
