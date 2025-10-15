// generate_tmdb_ids.js
// Node 18+, TMDB_API_KEY ortam değişkeni gerekli
// Usage: TMDB_API_KEY=xxx node generate_tmdb_ids.js --count=10000 --from=1960 --to=2025

const fs = require("fs");

const args = Object.fromEntries(
    process.argv.slice(2).map(a => {
        const [k,v] = a.split("=");
        return [k.replace(/^--/, ""), v || true];
    })
);

const API_KEY = process.env.TMDB_API_KEY;
if (!API_KEY) throw new Error("TMDB_API_KEY ortam değişkenini ayarla!");

const TARGET = parseInt(args.count || "5000",10);
const YEAR_FROM = parseInt(args.from || "1970",10);
const YEAR_TO = parseInt(args.to || (new Date().getFullYear()),10);
const LANG = args.lang || "en-US";
const DELAY = parseInt(args.delay || "250",10);

const OUT = "tmdb_ids.json";

const sleep = ms => new Promise(r => setTimeout(r,ms));

async function fetchJson(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error(res.status);
    return res.json();
}

async function collect(endpoint, pages, ids){
    for(let p=1;p<=pages;p++){
        if(ids.size>=TARGET) return;
        const url = `${endpoint}?api_key=${API_KEY}&language=${LANG}&page=${p}`;
        try{
            const data = await fetchJson(url);
            for(const m of data.results||[]) ids.add(m.id);
            process.stdout.write(`\r${endpoint} p=${p} -> ${ids.size}/${TARGET}`);
        }catch(e){ console.warn("warn",e.message); }
        await sleep(DELAY);
    }
}

async function collectDiscover(ids){
    for(let y=YEAR_FROM;y<=YEAR_TO;y++){
        for(let p=1;p<=40;p++){ // her yıl 40 sayfa yeterli
            if(ids.size>=TARGET) return;
            const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=${LANG}&include_adult=false&primary_release_year=${y}&page=${p}`;
            try{
                const data = await fetchJson(url);
                if(!data.results?.length) break;
                for(const m of data.results) ids.add(m.id);
                process.stdout.write(`\rdiscover ${y} p=${p} -> ${ids.size}/${TARGET}`);
            }catch(e){ console.warn("discover err",e.message); }
            await sleep(DELAY);
        }
    }
}

(async()=>{
    const ids = new Set();
    await collect("https://api.themoviedb.org/3/movie/popular",100,ids);
    await collect("https://api.themoviedb.org/3/movie/top_rated",100,ids);
    await collect("https://api.themoviedb.org/3/trending/movie/week",20,ids);
    await collectDiscover(ids);

    fs.writeFileSync(OUT, JSON.stringify(Array.from(ids),null,2));
    console.log(`\n✅ ${ids.size} benzersiz film id ${OUT} dosyasına yazıldı.`);
})();
