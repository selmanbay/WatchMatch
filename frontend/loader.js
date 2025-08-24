// pull_tmdb_ids.js
// Node 18+ (global fetch). TMDB_API_KEY env değişkeni zorunlu.
// Kullanım:  export TMDB_API_KEY=XXX && node pull_tmdb_ids.js > tmdb_ids_extra.js


API_KEY = "36264a0cf1b793ad8700a234e0a7166b";

// ---- BURAYA ELİNDEKİ MEVCUT ID LİSTENİ YAPIŞTIR ----
// (Aşağıdaki örnek 10 ID sadece placeholder. Sen mesajındaki büyük listeyi buraya koy.)
const EXISTING_IDS = [  // Klasikler

    603, 550, 680, 13, 155, 278, 238, 240, 424, 1891, 862, 807,
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
];

// Kaç yeni ID istiyorsun (mevcutların dışında)
const TARGET_NEW = 500;      // 400–500 arası hedefliyorsan 500 bırak, 400 yapabilirsin
const MAX_REQUESTS = 120;    // emniyet sınırı
const SLEEP_MS = 200;        // TMDb rate limitine saygı için küçük uyku

const BASE = "https://api.themoviedb.org/3";

// ufak sleep
const sleep = ms => new Promise(r => setTimeout(r, ms));

// v3 api_key query param ile istek
async function getJson(path, params = {}) {
    const url = new URL(BASE + path);
    url.searchParams.set("api_key", API_KEY);
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText}: ${t}`);
    }
    return res.json();
}

// Kaynak planı: trending/popular/top_rated + çeşitli discover varyantları
function buildSources() {
    const sources = [];

    // 1) trending
    sources.push({ kind: "trending", path: "/trending/movie/week", pages: 12 });

    // 2) popular & top_rated
    sources.push({ kind: "popular", path: "/movie/popular", pages: 15, params: { language: "en-US" } });
    sources.push({ kind: "top_rated", path: "/movie/top_rated", pages: 15, params: { language: "en-US" } });

    // 3) discover: vote_count & popularity
    const sorts = ["vote_count.desc", "popularity.desc", "revenue.desc"];
    const yearBuckets = [
        { gte: "1960-01-01", lte: "1979-12-31" },
        { gte: "1980-01-01", lte: "1999-12-31" },
        { gte: "2000-01-01", lte: "2009-12-31" },
        { gte: "2010-01-01", lte: "2019-12-31" },
        { gte: "2020-01-01", lte: "2026-12-31" },
    ];
    const genres = [
        28,   // Action
        12,   // Adventure
        16,   // Animation
        35,   // Comedy
        80,   // Crime
        18,   // Drama
        14,   // Fantasy
        27,   // Horror
        9648, // Mystery
        10749,// Romance
        878,  // Science Fiction
        53,   // Thriller
        10752,// War
        37,   // Western
        10751,// Family
        10402,// Music
        36    // History
    ];

    // Birkaç dil/region denemesi (çeşitlilik için)
    const langs = ["en-US", "tr-TR", "ja-JP", "fr-FR", "es-ES"];

    for (const sort_by of sorts) {
        for (const y of yearBuckets) {
            sources.push({
                kind: "discover",
                path: "/discover/movie",
                pages: 8,
                params: {
                    "sort_by": sort_by,
                    "primary_release_date.gte": y.gte,
                    "primary_release_date.lte": y.lte,
                    "vote_count.gte": 50
                }
            });
        }
    }
    // Tür kombinasyonları (daha az sayfa ile geniş dağılım)
    for (const g of genres) {
        sources.push({
            kind: "discover-genre",
            path: "/discover/movie",
            pages: 5,
            params: {
                "with_genres": g,
                "sort_by": "popularity.desc",
                "vote_count.gte": 50
            }
        });
    }
    // Dil varyasyonları
    for (const l of langs) {
        sources.push({
            kind: "discover-lang",
            path: "/discover/movie",
            pages: 5,
            params: {
                "sort_by": "popularity.desc",
                "with_original_language": l.slice(0,2), // en, tr, ja, fr, es
                "vote_count.gte": 25
            }
        });
    }

    return sources;
}

async function fetchManyIds(targetNew = TARGET_NEW) {
    const exclude = new Set(EXISTING_IDS);
    const out = new Set(); // yeni ID'ler
    const sources = buildSources();

    let requests = 0;

    for (const src of sources) {
        for (let page = 1; page <= src.pages; page++) {
            if (out.size >= targetNew || requests >= MAX_REQUESTS) break;

            const params = { page, ...(src.params || {}) };
            let data;
            try {
                data = await getJson(src.path, params);
            } catch (e) {
                // hata geç; devam
                continue;
            }
            requests++;

            const results = data?.results || [];
            for (const m of results) {
                const id = m?.id;
                if (!id || typeof id !== "number") continue;
                if (exclude.has(id)) continue; // zaten sende var
                out.add(id);
            }

            // küçük bekleme (rate limit)
            await sleep(SLEEP_MS);
        }
        if (out.size >= targetNew || requests >= MAX_REQUESTS) break;
    }

    return Array.from(out);
}

(async () => {
    try {
        const ids = await fetchManyIds(TARGET_NEW);

        // Güzel formatlı JS çıktısı:
        const lines = [];
        lines.push("/* Otomatik üretildi: TMDB_IDS_EXTRA (mevcut listen dışında) */");
        lines.push("export const TMDB_IDS_EXTRA = [");
        // satır başına ~20 id
        for (let i = 0; i < ids.length; i += 20) {
            const chunk = ids.slice(i, i + 20).join(", ");
            lines.push("  " + chunk + ",");
        }
        lines.push("];");
        lines.push("");
        lines.push("// Toplam yeni ID: " + ids.length);

        console.log(lines.join("\n"));
    } catch (err) {
        console.error("Hata:", err.message);
        process.exit(1);
    }
})();
