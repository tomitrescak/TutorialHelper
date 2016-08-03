class Cache {
  static cache = {};

  public getFromCache(cacheName: string, func: any, cacheTimeSec = 60): any {
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

const cache = new Cache();
export default cache;
