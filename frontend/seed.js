// seed.js
// Node 18+ (global fetch) gerekir. Backend: http://localhost:8080
const BASE = "http://localhost:8080";

// ---- Ayarlar ----
const CONFIG = {
    NUM_USERS: parseInt(process.argv[2] || "15", 10),
    SAME_COUNTRY_RATIO: 0.7,
    LIST_NAMES_POOL: ["Wishlist", "Watchlist", "Favorilerim", "Beğendiklerim"],
    // ↑ istersen buraya "İzlediklerim" ekleyebilirsin ve aşağıdaki map'e WATCHED bağlarız.
    MOVIES_PER_LIST_MIN: 6,        // ↑ arttırıldı
    MOVIES_PER_LIST_MAX: 12,       // ↑ arttırıldı
    LISTS_PER_USER_MIN: 2,         // ↑ eklendi (kullanıcı başına liste sayısı)
    LISTS_PER_USER_MAX: 3,         // ↑ eklendi
    CONCURRENCY: 4
};

const TMDB_IDS = [
    /* 603, 550, 680, 13, 155, 278, 238, 240, 424, 1891, 862, 807,
     27205, 157336, 49026, 119, 24428, 315162, 58, 272, 603692,
     299534, 299536, 315635, 634649, 497698, 566525, 497, 102899,
     121, 122, 140607, 181812, 181808, 348, 120, 12155, 19995, 10138,
     109445, 58, 1893, 1895, 1894, 120, 121, 122, 181812, 181808,
     129, 8587, 862, 10681, 330457, 920, 111, 260513, 150540,
     667538, 980489, 603692, 872585, 753342, 346698, 414906, 335984,
     694, 807, 539, 310131, 603, 109428, 424694, 423108,
     603, 604, 605, 606, 607, 608, 609, 610, 611, 612,
     9552, 1771, 278927, 324857, 181812, 299536, 335983, 453395,
     599, 600, 601, 602, 274, 275, 276, 277, 278, 279,
     157350, 64635, 155, 337339, 438631, 287947, 453201,
     238636, 466272, 425909, 495764, 399566, 597, 198663, 120467,
     460465, 122906, 155, 311, 272, 335, 24428, 99861, 284052,
     496243, 60308, 500, 11216, 769, 947, 652, 598, 2749, 424694,
     550988, 155, 10193, 335, 37165, 335984, 1572, 819, 68721, 672,
     150540, 10195, 920, 585, 863, 109445, 808, 812, 338952, 568124,
     354912, 337404, 277834, 269149, 13, 181808, 324857, 414, 337339, 12230,
     566525, 497698, 315635, 299537, 299538, 634649, 505642, 497, 283995, 36647,
     10138, 1724, 99861, 118340, 76338, 284052, 315162, 337404, 497698, 4970,
     120467, 122917, 345911, 47964, 209112, 122, 395991, 348, 396371, 19995,
     27205, 49026, 181812, 284053, 38757, 603, 157336, 1895, 105, 680,
     447365, 315635, 68726, 181808, 24428, 155, 398818, 140607, 107, 335983,
     674, 673, 675, 324857, 278927, 122906, 807, 150540, 775996, 753342,
     787699, 872585, 346698, 667538, 980489, 603692, 951491, 823464, 926393, 872585,
     653346, 930094, 1041613, 1071215, 1022789, 1053544, 1062215, 1079091, 940721, 940721,
     490132, 126889, 286217, 306819, 2034, 157350, 4935, 403, 600354, 16869,
     19913, 597208, 12514, 56292, 24806, 379149, 351286, 311324, 502356, 265177,
     694, 539, 423108, 425909, 713704, 760161, 460465, 811631, 943134, 868759,
     616820, 758323, 934433, 603692, 109428, 338762, 207703, 126889, 531219, 646385,
     329, 956, 967941, 1408208, 176, 989730, 972533, 592831, 1425045, 263115, 4232, 330, 42229, 550776, 1955, 555604, 800, 334543, 640344, 472454,
     26022, 582, 310569, 400608, 638507, 9277, 538362, 821, 823754, 610461, 43949, 147, 55960, 347688, 307, 204, 938, 785534, 8422, 20530,
     641, 521, 838240, 28178, 962232, 400928, 359724, 110416, 51822, 14, 526702, 3175, 568160, 515001, 264644, 20453, 414419, 14696, 15, 524,
     906126, 205596, 11658, 449176, 140420, 1366, 621, 9325, 762, 10112, 433, 9659, 583, 1367, 11886, 391, 840, 164, 571, 805,
     7340, 703, 829, 11778, 9078, 646, 252, 658, 871, 30497, 37247, 15121, 3034, 657, 968, 11906, 10734, 36685, 595, 5925,
     985, 11319, 984, 10331, 696, 660, 12102, 667, 642, 967, 11474, 794, 681, 923, 203, 5336, 682, 802, 253, 691,
     698, 9040, 624, 579, 668, 5924, 1051, 11009, 9461, 11072, 839, 1725, 891, 269, 592, 966, 10774, 152, 11327, 593,
     10669, 475, 8469, 20126, 16307, 838, 3116, 903, 4176, 4808, 8290, 1685, 9394, 11113, 2362, 12101, 1052, 9385, 1643, 576,
     1654, 3133, 11901, 33701, 11963, 11697, 916, 11850, 10747, 907, 9462, 11482, 506, 5511, 10633, 2000, 7857, 1687, 11202, 10518,
     343, 17814, 336, 10648, 931, 936, 10242, 250480, 651, 16642, 15371, 13377, 10322, 11481, 1688, 16306, 1892, 218, 165, 162,
     85, 745, 771, 115, 562, 18, 196, 8844, 854, 89, 197, 10020, 772, 10674, 627, 9479, 87, 564, 9487, 620,
     744, 63, 114, 106, 4951, 137, 2108, 95, 268, 10144, 4011, 2105, 949, 11970, 2668, 37135, 2649, 364, 380, 9737,
     927, 184, 782, 1368, 242, 1637, 509, 8467, 1813, 788, 88, 2300, 755, 235, 628, 861, 1573, 3049, 1624, 856,
     9340, 117, 10530, 10386, 251, 75, 568, 754, 297, 879, 9444, 6114, 5548, 377, 2109, 8078, 2118, 415, 10545, 563,
     454, 9377, 2667, 544, 431, 9802, 1700, 792, 2493, 2907, 1878, 941, 813, 686, 9426, 33, 9366, 2978, 10830, 1374,
     9603, 14160, 12, 24, 2062, 640, 6479, 558, 118, 752, 559, 393, 10528, 1271, 425, 4922, 141, 809, 19908, 6977,
     350, 2048, 9502, 11036, 161, 194, 8358, 36657, 1858, 8681, 1359, 953, 36557, 13223, 310, 1949, 1417, 12405, 2080, 787,
     453, 1593, 36658, 9799, 1402, 13475, 950, 36668, 70, 8960, 17654, 5915, 591, 2501, 9741, 13183, 18239, 810, 10625, 180,
     747, 8373, 74, 217, 8355, 435, 187, 35, 594, 254, 10764, 2503, 1372, 4638, 8871, 1954, 2502, 584, 153, 8363,
     561, 65, 163, 13804, 773, 587, 1824, 9693, 7191, 14574, 7326, 1734, 8909, 4247, 142, 9339, 9615, 616, 10527, 18240,
     1487, 10201, 18360, 13448, 284054, 70160, 100402, 210577, 259316, 281957, 383498, 329865, 419430, 101299, 381288, 374720, 240832, 131631, 339403, 333339,
     75656, 72190, 321612, 49047, 127585, 37724, 20352, 44214, 447332, 152601, 273248, 297802, 1865, 137113, 353486, 62177, 363088, 274870, 264660, 324552,
 */
    1061474, 575265, 911430, 1175942, 1022787, 1078605, 1254624, 1300116, 1234821, 1312946, 7451, 1311031, 1087192, 1007734, 936108, 986056, 1136867, 648878, 1151031, 1205656,
    436969, 1011477, 617126, 541671, 629542, 537921, 980477, 803796, 1035259, 1429739, 1100988, 1038392, 575264, 552524, 1242011, 1106289, 671, 574475, 1125257, 297761,
    896536, 1071585, 842924, 1267905, 1233413, 615457, 713364, 755898, 1125899, 1422052, 954, 1109086, 49521, 1280089, 693134, 1322218, 1153399, 1155281, 10191, 135397,
    1484453, 1233575, 679, 1139695, 1263256, 402431, 955, 578, 1083433, 1087891, 870028, 507086, 1241470, 138843, 615453, 1241436, 1225572, 83533, 11, 1419406,
    353081, 1153714, 1726, 8839, 9614, 696506, 313369, 315011, 1054867, 1285965, 934456, 10330, 76600, 767, 361743, 346364, 635302, 749170, 98, 655,
    950387, 945961, 1197306, 170, 22, 558449, 128, 78, 177677, 76341, 12445, 1284120, 1924, 447273, 948, 1245993, 426063, 57158, 1195506, 458156,
    1531940, 37136, 28, 974576, 1264349, 1137350, 1307078, 70981, 912649, 1362514, 12444, 1184918, 1339166, 245891, 8077, 207, 49051, 250546, 1083968, 557,
    14161, 211672, 1205515, 285, 1317288, 1212855, 385687, 331, 1013601, 1280444, 536554, 9738, 1241982, 1242434, 297762, 102382, 345, 1064213, 271110, 259693,
    8619, 503, 82702, 1158996, 77, 216015, 1979, 969681, 1149504, 330459, 1356670, 1382406, 1319895, 1185528, 986206, 1195631, 1443260, 1227003, 1393382, 1285247,
    86767, 812455, 1280461, 1119878, 1365103, 1188423, 715287, 13499, 1124619, 1403735, 611251, 259872, 715253, 1529510, 993234, 1466120, 1315986, 846817, 1414059, 1181540,
    1278950, 1470086, 1452176, 1010581, 1374534, 390635, 1471345, 846422, 1058537, 460229, 1135829, 1353328, 1236471, 939243, 822119, 1529488, 950396, 519182, 533535, 1477114,
    1476292, 226674, 829557, 1376434, 947478, 1317938, 1287536, 1040229, 1156593, 605722, 626332, 1232827, 1513598, 1018852, 762509, 636514, 1140142, 1380651, 82023, 1354253,
    1189735, 1357459, 1152798, 1294203, 1252309, 912044, 933260, 1294949, 1234720, 1246369, 1011985, 666154, 1311844, 1084199, 41264, 994682, 80295, 1442776, 910838, 1429834,
    539972, 1268870, 1491902, 1471014, 411, 429617, 1243341, 845781, 1269208, 1140535, 773543, 1100998, 928334, 1241634, 324544, 843527, 1232546, 707610, 1391047, 1426776,
    569094, 14836, 19173, 106646, 1056108, 1358013, 1429744, 1245934, 913290, 243352, 202804, 10659, 18785, 1239193, 537915, 293660, 1501238, 694943, 1930, 1187436,
    8966, 370663, 1264854, 173705, 592695, 757725, 1017163, 573435, 337167, 387824, 1154215, 22705, 1126166, 1233069, 177572, 1329336, 458220, 1078023, 9806, 1357633,
    1095757, 1422227, 3933, 1124620, 287649, 1181039, 166428, 1414272, 389, 19404, 372058, 429, 346, 12477, 637, 667257, 14537, 40096, 510, 696374,
    255709, 378064, 770156, 423, 724089, 244786, 761053, 1058694, 12493, 567, 620249, 73, 820067, 372754, 15804, 652837, 3782, 10494, 1356039, 101,
    914, 644479, 42269, 632632, 533514, 92321, 3082, 1139087, 77338, 1585, 18491, 901, 975, 637920, 29259, 670, 572154, 10376, 630566, 504253,
    447362, 568332, 508965, 654299, 527641, 25237, 24188, 110420, 618344, 857, 37257, 283566, 441130, 16672, 92060, 1160164, 829402, 995133, 50014, 522924,
    1124, 290098, 11324, 620683, 284, 324786, 313106, 476292, 185, 68718, 490, 5156, 26451, 851644, 629, 537061, 18148, 823219, 1422, 426,
    489, 20941, 81481, 289, 10098, 592350, 399106, 517814, 797, 872, 666, 606856, 812225, 20914, 103, 475557, 422, 610892, 9702, 280,
    1026227, 935, 810693, 575813, 20334, 3780, 795607, 531428, 406997, 791373, 38288, 1398, 100, 996, 614, 508442, 133919, 843, 146233, 24382,
    19, 663558, 103663, 20532, 664767, 55823, 11878, 239, 470044, 46738, 755812, 38, 411088, 11659, 2457, 149871, 406, 387, 831827, 705,
    7345, 762975, 832, 1091, 8392, 439, 518068, 31439, 397567, 62, 359940, 21634, 532067, 4348, 11423, 1064486, 437068, 7347, 992, 548,
    522518, 1244492, 698687, 11645, 381284,

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

// Liste adına göre listType eşlemesi (vektör ağırlıkları için önemli)
const LIST_TYPE_MAP = {
    "Wishlist": "WISHLIST",
    "Watchlist": "WISHLIST",
    "Favorilerim": "LIKE",
    "Beğendiklerim": "LIKE",
    "İzlediklerim": "WATCHED"
};

async function createList(userId, listName) {
    const descriptions = {
        "Wishlist": "İzlemek istediğim filmler",
        "Watchlist": "Takip ettiğim filmler",
        "Favorilerim": "Favori filmlerim",
        "Beğendiklerim": "Beğendiğim filmler",
        "İzlediklerim": "İzlediklerim"
    };
    const listType = LIST_TYPE_MAP[listName] || "OTHER";
    const body = {
        listName,
        listDescription: descriptions[listName] || `${listName} listesi`,
        listType,
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

// -> YENİ: Kullanıcının vektörünü tazele
async function refreshVector(userId) {
    await http("POST", `/api/match/refresh/${userId}`);
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

        // Kullanıcı başına liste sayısı artırıldı
        const listCount = randInt(CONFIG.LISTS_PER_USER_MIN, CONFIG.LISTS_PER_USER_MAX);
        const chosenLists = Array.from({ length: listCount }, () => randItem(CONFIG.LIST_NAMES_POOL));

        const listIds = [];
        // Kullanıcı içinde tekrarları azaltmak için seçilen TMDb id'lerini takip edelim
        const usedTmdbIds = new Set();

        for (const ln of chosenLists) {
            const lid = await createList(user.id, ln);
            listIds.push({ name: ln, id: lid });

            const movieCount = randInt(CONFIG.MOVIES_PER_LIST_MIN, CONFIG.MOVIES_PER_LIST_MAX);
            const picked = [];
            while (picked.length < movieCount) {
                const id = randItem(TMDB_IDS);
                if (!usedTmdbIds.has(id)) {
                    usedTmdbIds.add(id);
                    picked.push(id);
                }
            }
            for (const tmdbId of picked) {
                try {
                    await addTmdbToList(lid, tmdbId);
                } catch (e) {
                    console.warn(`(U:${user.id} L:${lid}) TMDb ${tmdbId} eklenemedi -> ${e.message}`);
                }
            }
        }

        // -> YENİ: Filmler eklendikten sonra vektörü üret
        try {
            await refreshVector(user.id);
        } catch (e) {
            console.warn(`(U:${user.id}) vektör refresh başarısız: ${e.message}`);
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
