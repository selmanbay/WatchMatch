// seed.js — düzenli, enum uyumlu, tekrar önleyen, izlenenden like/dislike türeten
// Node 18+ (global fetch) gerekir. Backend: http://localhost:8080
const BASE = "http://localhost:8080";
const fs = require("fs");

/* -------------------- AYARLAR -------------------- */
const CONFIG = {
    NUM_USERS: parseInt(process.argv[2] || "15", 10),
    SAME_COUNTRY_RATIO: 0.7,
    CONCURRENCY: 4,
    TARGET_COUNTS: {
        WATCHED:    { min: 24, max: 36 },
        WISHLIST_1: { min:  8, max: 14 }, // Watchlist
        WISHLIST_2: { min:  8, max: 14 }, // Wishlist
        LIKE_RATIO:     0.40,
        DISLIKE_RATIO:  0.20
    }
};

/* -------------------- TMDB HAVUZLARI (FALLBACK) -------------------- */
const POOL_CLASSICS = [
    603, 680, 13, 155, 278, 238, 240, 424, 1891, 862, 807,
    27205, 157336, 49026, 119, 24428, 497, 101, 914, 550,
    539, 424694, 423108, 603692, 315162, 315635, 346698,
    497698, 566525, 1893, 1895, 1894, 10138, 1724, 99861,
    76338, 284052, 299536, 299534, 299537, 299538
];

const POOL_POPULAR = [
    634649, 572802, 787699, 497582, 667538, 872585, 603692,
    926393, 823464, 980489, 438631, 653346, 820067, 76600,
    238, 240, 278927, 324857, 414906, 335983, 337404, 315635,
    414, 337339, 420818, 335984, 345887, 414419, 460465
];

const POOL_ANIMATION = [
    539, 9806, 150540, 862, 672, 673, 674, 675, 10193, 129,
    211672, 109445, 920, 508439, 508442, 508943, 912649,
    9502, 10674, 863, 568124, 14161
];

const POOL_TURKISH = [
    539972, 60308, 10494, 213916, 281957, 1008042, 324786,
    1151031, 379149, 244786, 589, 379686, 597208, 496243, 620249
];

const POOL_NEW_RELEASES = [
    980489, 669, 1053544, 1079091, 930094, 1041613, 1071215,
    951491, 940721, 70981, 612, 785534, 868759, 943134, 934433,
    758323, 713704, 109428, 618344, 654299, 768
];

const POOL_ARTHOUSE = [
    490, 539, 637, 807, 914, 862, 641, 524, 37165, 103, 3782,
    101, 819, 915, 603, 24021, 501, 205, 204, 694, 500, 829,
    146233, 443791
];

// Fallback havuz: küçük ama garantili set (kült/popüler/festivallik)
const FALLBACK_TMDB_IDS = [
    ...POOL_CLASSICS,
    ...POOL_POPULAR,
    ...POOL_ANIMATION,
    ...POOL_TURKISH,
    ...POOL_NEW_RELEASES,
    ...POOL_ARTHOUSE
];

// tmdb_ids.json varsa oku; yoksa fallback’i kullan. (Birleşim yapıyoruz ki kültler garanti kalsın)
let TMDB_IDS = FALLBACK_TMDB_IDS;
try {
    if (fs.existsSync("tmdb_ids.json")) {
        const arr = JSON.parse(fs.readFileSync("tmdb_ids.json", "utf-8"));
        const merged = new Set(
            [...arr, ...FALLBACK_TMDB_IDS].filter(n => Number.isFinite(n))
        );
        TMDB_IDS = Array.from(merged).sort(() => Math.random() - 0.5);
        console.log(`TMDB ID havuzu (dosya + fallback birleşik): ${TMDB_IDS.length} adet`);
    } else {
        console.log(`TMDB ID havuzu (fallback): ${TMDB_IDS.length} adet`);
    }
} catch (e) {
    console.warn("tmdb_ids.json okunurken hata; fallback kullanılacak →", e.message);
    TMDB_IDS = FALLBACK_TMDB_IDS;
}

/* -------------------- İSİM HAVUZLARI -------------------- */
const TR_FIRST = ["Ali","Ayşe","Mehmet","Zeynep","Ahmet","Elif","Hasan","Merve","Emre","Fatma","Hakan","Seda","Gökhan","Derya","Selim","Naz"];
const TR_LAST  = ["Yılmaz","Demir","Şahin","Çelik","Kaya","Yıldız","Yıldırım","Aydın","Arslan","Doğan","Koç","Kurt","Polat","Öztürk","Aksoy","Kılıç"];
const INT_FIRST = ["Carl","Mia","Liam","Noah","Emma","Ava","Lucas","Olivia","Ethan","Sophia","Mason","Isabella","Logan","Amelia"];
const INT_LAST  = ["Meyer","Smith","Johnson","Brown","Davis","Miller","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White"];

/* -------------------- YARDIMCILAR -------------------- */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randItem = (arr) => arr[Math.floor(Math.random()*arr.length)];
const randInt  = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const slugify  = (s) => s.toLowerCase().replace(/[^a-z0-9ğüşöçıİ\s]/gi,"").replace(/\s+/g,"");

async function http(method, path, body){
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { "Content-Type":"application/json" },
        body: body ? JSON.stringify(body) : undefined
    });
    if(!res.ok){
        const t = await res.text().catch(()=> "");
        throw new Error(`${method} ${path} -> ${res.status} ${t}`);
    }
    try { return await res.json(); } catch { return {}; }
}

async function getCountries(){
    try{
        const list = await http("GET","/api/countries");
        const tr = list?.find(c => /türkiye|turkey/i.test(c.countryName || c.name || ""));
        return {
            all: list?.map(c => ({id:c.id, name:c.countryName || c.name})) ?? [{id:1, name:"TR"}],
            trId: tr?.id ?? list?.[0]?.id ?? 1
        };
    }catch{
        return { all:[{id:1,name:"TR"},{id:2,name:"US"},{id:3,name:"DE"}], trId:1 };
    }
}

async function registerUser({ firstName,lastName,username,email,password,countryId,sex,language }){
    const saved = await http("POST","/api/users/register", { firstName,lastName,username,email,password });
    try { await http("PUT", `/api/users/${saved.id}/country/${countryId}`); } catch {}
    try { await http("POST", `/api/users/${saved.id}/preference`, { sex, language }); } catch {}
    return saved;
}

function makeRandomUser(i, sameCountryId, otherCountryIds){
    const useTR = Math.random() < 0.6;
    const first = useTR ? randItem(TR_FIRST) : randItem(INT_FIRST);
    const last  = useTR ? randItem(TR_LAST)  : randItem(INT_LAST);
    const unameBase = slugify(`${first}${last}`).slice(0,14);
    const username = `${unameBase}${i}`;
    const email = `${username}${Date.now()%100000}@example.com`;
    const sex = /e$|a$|ahmet|mehmet|ali|hasan|hakan|gökhan|selim|carl|liam|noah|ethan|mason|logan/i.test(first) ? "male" : "female";
    const language = useTR ? "tr" : "en";
    const sameGroup = Math.random() < CONFIG.SAME_COUNTRY_RATIO;
    const countryId = (sameGroup || otherCountryIds.length===0) ? sameCountryId : randItem(otherCountryIds);
    return { firstName:first,lastName:last,username,email,password:"123456",countryId,sex,language };
}

/* -------------------- LİSTE YARDIMCILARI -------------------- */
const LIST_DEFS = [
    { name: "İzlediklerim",    type: "WATCHED",  desc: "İzlediğim filmler" },
    { name: "Watchlist",       type: "WISHLIST", desc: "Takip ettiğim filmler" },
    { name: "Wishlist",        type: "WISHLIST", desc: "İzlemek istediğim filmler" },
    { name: "Beğendiklerim",   type: "LIKE",     desc: "Beğendiğim filmler" },
    { name: "Beğenmediklerim", type: "DISLIKE",  desc: "Beğenmediğim filmler" }
];

async function createList(userId, {name, type, desc}){
    const body = {
        listName: name,
        listDescription: desc,
        listType: type,
        listImage: "https://placehold.co/300x450?text=" + encodeURIComponent(name),
        listRating: "0",
        user: { id: userId }
    };
    const res = await http("POST","/api/movie-lists", body);
    return res.id ?? res.listId ?? res?.data?.id;
}

async function addTmdbToList(listId, tmdbId){
    await http("POST", `/api/movie-lists/${listId}/tmdb/${tmdbId}`);
}

async function refreshVector(userId){
    try { await http("POST", `/api/match/refresh/${userId}`); }
    catch(e){ console.warn(`(U:${userId}) vektör refresh başarısız: ${e.message}`); }
}

function pickUnique(count, pool, usedSet){
    const picked = [];
    while(picked.length < count){
        const id = randItem(pool);
        if(!usedSet.has(id)){
            usedSet.add(id);
            picked.push(id);
        }
    }
    return picked;
}

function splitLikesDislikes(watchedIds, likeRatio, dislikeRatio){
    const shuffled = [...watchedIds].sort(() => Math.random() - 0.5);
    const likeCount = Math.max(0, Math.floor(watchedIds.length * likeRatio));
    const dislikeCount = Math.max(0, Math.floor(watchedIds.length * dislikeRatio));
    const likes = shuffled.slice(0, likeCount);
    const dislikes = shuffled.slice(likeCount, likeCount + dislikeCount);
    return { likes, dislikes };
}

async function withConcurrency(items, limit, fn){
    const results = [];
    let idx = 0;
    const workers = Array.from({length:limit}).map(async () => {
        while(idx < items.length){
            const current = idx++;
            try { results[current] = await fn(items[current], current); }
            catch(e){ results[current] = { error: e.message }; }
            await sleep(50);
        }
    });
    await Promise.all(workers);
    return results;
}

/* -------------------- ANA SEED -------------------- */
async function seed(){
    const { all: countries, trId: homeTrId } = await getCountries();
    const otherCountryIds = countries.map(c => c.id).filter(id => id !== homeTrId);

    console.log(`Ülke havuzu: ${countries.map(c => c.name || c.id).join(", ")} | TR_ID=${homeTrId}`);
    console.log(`Hedef kullanıcı sayısı: ${CONFIG.NUM_USERS}\n`);

    const usersToMake = Array.from({length:CONFIG.NUM_USERS}, (_,i) => makeRandomUser(i+1, homeTrId, otherCountryIds));

    const created = await withConcurrency(usersToMake, CONFIG.CONCURRENCY, async (u) => {
        const user = await registerUser(u);

        // Tüm listeleri oluştur
        const listIds = {};
        for(const def of LIST_DEFS){
            const lid = await createList(user.id, def);
            (listIds[def.type] ||= []).push({ name: def.name, id: lid });
        }

        const used = new Set();

        // 1) WATCHED
        const watchedTarget = randInt(CONFIG.TARGET_COUNTS.WATCHED.min, CONFIG.TARGET_COUNTS.WATCHED.max);
        const watchedIds = pickUnique(watchedTarget, TMDB_IDS, used);
        for(const tmdbId of watchedIds){
            for(const entry of (listIds["WATCHED"] || [])){
                try { await addTmdbToList(entry.id, tmdbId); }
                catch(e){ console.warn(`(U:${user.id} L:${entry.id}) WATCHED ${tmdbId} eklenemedi`); }
            }
        }

        // 2) LIKE/DISLIKE — WATCHED alt kümesi
        const { likes, dislikes } = splitLikesDislikes(watchedIds, CONFIG.TARGET_COUNTS.LIKE_RATIO, CONFIG.TARGET_COUNTS.DISLIKE_RATIO);
        for(const tmdbId of likes){
            for(const entry of (listIds["LIKE"] || [])){
                try { await addTmdbToList(entry.id, tmdbId); }
                catch(e){ console.warn(`(U:${user.id} L:${entry.id}) LIKE ${tmdbId} eklenemedi`); }
            }
        }
        for(const tmdbId of dislikes){
            for(const entry of (listIds["DISLIKE"] || [])){
                try { await addTmdbToList(entry.id, tmdbId); }
                catch(e){ console.warn(`(U:${user.id} L:${entry.id}) DISLIKE ${tmdbId} eklenemedi`); }
            }
        }

        // 3) WISHLIST — WATCHED ile çakışmasın
        const wish1Count = randInt(CONFIG.TARGET_COUNTS.WISHLIST_1.min, CONFIG.TARGET_COUNTS.WISHLIST_1.max);
        const wish2Count = randInt(CONFIG.TARGET_COUNTS.WISHLIST_2.min, CONFIG.TARGET_COUNTS.WISHLIST_2.max);
        const wish1Ids = pickUnique(wish1Count, TMDB_IDS, used);
        const wish2Ids = pickUnique(wish2Count, TMDB_IDS, used);

        const wis1 = (listIds["WISHLIST"] || [])[0];
        if(wis1){
            for(const tmdbId of wish1Ids){
                try { await addTmdbToList(wis1.id, tmdbId); }
                catch(e){ console.warn(`(U:${user.id} L:${wis1.id}) WISHLIST1 ${tmdbId} eklenemedi`); }
            }
        }
        const wis2 = (listIds["WISHLIST"] || [])[1];
        if(wis2){
            for(const tmdbId of wish2Ids){
                try { await addTmdbToList(wis2.id, tmdbId); }
                catch(e){ console.warn(`(U:${user.id} L:${wis2.id}) WISHLIST2 ${tmdbId} eklenemedi`); }
            }
        }

        await refreshVector(user.id);

        return {
            id: user.id, username: u.username, email: u.email, countryId: u.countryId,
            lists: Object.values(listIds).flat().map(x => x.name)
        };
    });

    console.table(created.map(r => ({
        user: r?.username || "ERR",
        id: r?.id || "-",
        country: r?.countryId || "-",
        lists: Array.isArray(r?.lists) ? r.lists.join(", ") : "—"
    })));

    const sameCountryUsers = created.filter(u => u?.countryId === homeTrId).length;
    console.log(`\n✅ Bitti. ${created.length} kullanıcı oluşturuldu. ${sameCountryUsers} tanesi TR.`);
}

seed().catch(e => {
    console.error("Seed hata:", e);
    process.exit(1);
});
