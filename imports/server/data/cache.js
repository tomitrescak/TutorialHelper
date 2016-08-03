class Cache {
    getFromCache(cacheName, func, cacheTimeSec = 60) {
        let rec = Cache.cache[cacheName];
        if (rec) {
            let cdate = new Date();
            let diff = (cdate.getTime() - rec.time) / 1000;
            if (diff < cacheTimeSec) {
                // console.log("From Cache");
                return rec.data;
            }
        }
        Cache.cache[cacheName] = {
            time: new Date(),
            data: func()
        };
        return Cache.cache[cacheName].data;
    }
}
Cache.cache = {};
const cache = new Cache();
export default cache;
