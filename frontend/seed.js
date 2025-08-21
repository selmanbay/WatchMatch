// seed.js
// Node 18+ (global fetch) gerekir. Backend: http://localhost:8080
const BASE = "http://localhost:8080";

// ---- Ayarlar ----
const CONFIG = {
    NUM_USERS: parseInt(process.argv[2] || "15", 10),
    SAME_COUNTRY_RATIO: 0.7,
    LIST_NAMES_POOL: ["Wishlist", "Watchlist", "Favorilerim", "Beğendiklerim"],
    MOVIES_PER_LIST_MIN: 2,
    MOVIES_PER_LIST_MAX: 4,
    CONCURRENCY: 4
};

// TMDb ID havuzu (60+ film)
// Popüler / klasik TMDb ID’lerinden büyük havuz
const TMDB_IDS = [
    // Klasikler
    603, 550, 680, 13, 155, 278, 238, 240, 424, 1891, 862, 807,
    // Nolan
    27205, 157336, 49026, 119, 24428, 315162, 58, 272, 603692,
    // Marvel / DC
    299534, 299536, 315635, 634649, 497698, 566525, 497, 102899,
    // Fantastik / Sci-fi
    121, 122, 140607, 181812, 181808, 348, 120, 12155, 19995, 10138,
    109445, 58, 1893, 1895, 1894, 120, 121, 122, 181812, 181808,
    // Animasyon
    129, 8587, 862, 10681, 330457, 920, 111, 260513, 150540,
    // Yeni popüler
    667538, 980489, 603692, 872585, 753342, 346698, 414906, 335984,
    // Korku / gerilim
    694, 807, 539, 310131, 603, 109428, 424694, 423108,
    // Aksiyon / Macera
    603, 604, 605, 606, 607, 608, 609, 610, 611, 612,
    9552, 1771, 278927, 324857, 181812, 299536, 335983, 453395,
    // Türk / yabancı örnekler
    599, 600, 601, 602, 274, 275, 276, 277, 278, 279,
    157350, 64635, 155, 337339, 438631, 287947, 453201,
    // Daha fazla çeşitlilik
    238636, 466272, 425909, 495764, 399566, 597, 198663, 120467,
    460465, 122906, 155, 311, 272, 335, 24428, 99861, 284052,    // Daha fazla klasik / Oscar
    496243, 60308, 500, 11216, 769, 947, 652, 598, 2749, 424694,
    550988, 155, 10193, 335, 37165, 335984, 1572, 819, 68721, 672,

    // Animasyon / aile
    150540, 10195, 920, 585, 863, 109445, 808, 812, 338952, 568124,
    354912, 337404, 277834, 269149, 13, 181808, 324857, 414, 337339, 12230,

    // Marvel / DC ekleri
    566525, 497698, 315635, 299537, 299538, 634649, 505642, 497, 283995, 36647,
    10138, 1724, 99861, 118340, 76338, 284052, 315162, 337404, 497698, 4970,

    // Aksiyon / macera
    120467, 122917, 345911, 47964, 209112, 122, 395991, 348, 396371, 19995,
    27205, 49026, 181812, 284053, 38757, 603, 157336, 1895, 105, 680,

    // Bilim kurgu / fantastik
    447365, 315635, 68726, 181808, 24428, 155, 398818, 140607, 107, 335983,
    674, 673, 675, 324857, 278927, 122906, 807, 150540, 775996, 753342,

    // Yeni popülerler
    787699, 872585, 346698, 667538, 980489, 603692, 951491, 823464, 926393, 872585,
    653346, 930094, 1041613, 1071215, 1022789, 1053544, 1062215, 1079091, 940721, 940721,

    // Türk / Dünya sineması
    490132, 126889, 286217, 306819, 2034, 157350, 4935, 403, 600354, 16869,
    19913, 597208, 12514, 56292, 24806, 379149, 351286, 311324, 502356, 265177,

    // Korku / gerilim
    694, 539, 423108, 425909, 713704, 760161, 460465, 811631, 943134, 868759,
    616820, 758323, 934433, 603692, 109428, 338762, 207703, 126889, 531219, 646385
];
// İsim havuzları
const TR_FIRST = ["Ali","Ayşe","Mehmet","Zeynep","Ahmet","Elif","Hasan","Merve","Emre","Fatma","Hakan","Seda","Gökhan","Derya","Selim","Naz"];
const TR_LAST  = ["Yılmaz","Demir","Şahin","Çelik","Kaya","Yıldız","Yıldırım","Aydın","Arslan","Doğan","Koç","Kurt","Polat","Öztürk","Aksoy","Kılıç"];
const INT_FIRST = ["Carl","Mia","Liam","Noah","Emma","Ava","Lucas","Olivia","Ethan","Sophia","Mason","Isabella","Logan","Amelia"];
const INT_LAST  = ["Meyer","Smith","Johnson","Brown","Davis","Miller","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White"];

// ---- Yardımcılar ----
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function http(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${method} ${path} -> ${res.status} ${text}`);
    }
    try { return await res.json(); } catch { return {}; }
}

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9ğüşöçıİ]/gi, "").replace(/\s+/g, ""); }

async function getCountries() {
    try {
        const list = await http("GET", "/api/countries");
        const tr = list?.find(c => /türkiye|turkey/i.test(c.countryName || c.name || ""));
        return {
            all: list?.map(c => ({ id: c.id, name: c.countryName || c.name })) ?? [{ id: 1, name: "TR" }],
            trId: tr?.id ?? list?.[0]?.id ?? 1
        };
    } catch {
        return { all: [{ id: 1, name: "TR" }, { id: 2, name: "US" }, { id: 3, name: "DE" }], trId: 1 };
    }
}

async function registerUser({ firstName, lastName, username, email, password, countryId, sex, language }) {
    const saved = await http("POST", "/api/users/register", {
        firstName, lastName, username, email, password
    });
    try { await http("PUT", `/api/users/${saved.id}/country/${countryId}`); } catch {}
    try { await http("POST", `/api/users/${saved.id}/preference`, { sex, language }); } catch {}
    return saved;
}
async function createList(userId, listName) {
    const descriptions = {
        "Wishlist": "İzlemek istediğim filmler",
        "Watchlist": "Takip ettiğim filmler",
        "Favorilerim": "Favori filmlerim",
        "Beğendiklerim": "Beğendiğim filmler"
    };
    const body = {
        listName,
        listDescription: descriptions[listName] || `${listName} listesi`,
        listType: "OTHER",
        listImage: "https://placehold.co/300x450?text=" + encodeURIComponent(listName),
        listRating: 0,
        user: { id: userId }
    };
    const res = await http("POST", "/api/movie-lists", body);
    return res.id ?? res.listId ?? res?.data?.id;
}


async function addTmdbToList(listId, tmdbId) {
    await http("POST", `/api/movie-lists/${listId}/tmdb/${tmdbId}`);
}

function makeRandomUser(i, sameCountryId, otherCountryIds) {
    const useTR = Math.random() < 0.6;
    const first = useTR ? randItem(TR_FIRST) : randItem(INT_FIRST);
    const last  = useTR ? randItem(TR_LAST)  : randItem(INT_LAST);
    const unameBase = slugify(`${first}${last}`).slice(0, 14);
    const username = `${unameBase}${i}`;
    const email = `${username}${Date.now()%100000}@example.com`;
    const sex = /e$|a$|ahmet|mehmet|ali|hasan|hakan|gökhan|selim|carl|liam|noah|ethan|mason|logan/i.test(first) ? "male" : "female";
    const language = useTR ? "tr" : "en";
    const sameGroup = Math.random() < CONFIG.SAME_COUNTRY_RATIO;
    const countryId = sameGroup || otherCountryIds.length === 0
        ? sameCountryId
        : randItem(otherCountryIds);

    return {
        firstName: first, lastName: last, username, email,
        password: "123456", countryId, sex, language
    };
}

async function withConcurrency(items, limit, fn) {
    const results = [];
    let idx = 0;
    const workers = Array.from({ length: limit }).map(async () => {
        while (idx < items.length) {
            const current = idx++;
            try {
                results[current] = await fn(items[current], current);
            } catch (e) {
                results[current] = { error: e.message };
            }
            await sleep(50);
        }
    });
    await Promise.all(workers);
    return results;
}

async function seed() {
    const { all: countries, trId } = await getCountries();
    const otherCountryIds = countries.map(c => c.id).filter(id => id !== trId);

    console.log(`Ülke havuzu: ${countries.map(c => c.name || c.id).join(", ")} | TR_ID=${trId}`);
    console.log(`Hedef kullanıcı sayısı: ${CONFIG.NUM_USERS}\n`);

    const usersToMake = Array.from({ length: CONFIG.NUM_USERS }, (_, i) =>
        makeRandomUser(i + 1, trId, otherCountryIds)
    );

    const created = await withConcurrency(usersToMake, CONFIG.CONCURRENCY, async (u) => {
        const user = await registerUser(u);
        const listCount = randInt(1, 2);
        const chosenLists = Array.from({ length: listCount }, () => randItem(CONFIG.LIST_NAMES_POOL));
        const listIds = [];
        for (const ln of chosenLists) {
            const lid = await createList(user.id, ln);
            listIds.push({ name: ln, id: lid });
            const movieCount = randInt(CONFIG.MOVIES_PER_LIST_MIN, CONFIG.MOVIES_PER_LIST_MAX);
            const picked = [];
            while (picked.length < movieCount) {
                const id = randItem(TMDB_IDS);
                if (!picked.includes(id)) picked.push(id);
            }
            for (const tmdbId of picked) {
                try { await addTmdbToList(lid, tmdbId); } catch (e) {
                    console.warn(`(U:${user.id} L:${lid}) TMDb ${tmdbId} eklenemedi -> ${e.message}`);
                }
            }
        }
        return { id: user.id, username: u.username, email: u.email, countryId: u.countryId, lists: listIds };
    });

    console.table(created.map(r => ({
        user: r?.username || "ERR",
        id: r?.id || "-",
        country: r?.countryId || "-",
        lists: Array.isArray(r?.lists) ? r.lists.map(x => x.name).join(", ") : "—"
    })));

    const sameCountryUsers = created.filter(u => u?.countryId === trId).length;
    console.log(`\n✅ Bitti. ${created.length} kullanıcı oluşturuldu. ${sameCountryUsers} tanesi TR (${Math.round((sameCountryUsers/created.length)*100)}%).`);
}

seed().catch(e => {
    console.error("Seed hata:", e);
    process.exit(1);
});
