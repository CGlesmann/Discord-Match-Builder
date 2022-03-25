const NodeCache = require("node-cache");

class ApplicationCacheManager
{
    static APPLICATION_CACHE;
    static DEFAULT_CACHE_SETTINGS = {
        stdTTL: 0,
        useClones: false
    };

    static createApplicationCache(cacheSettings)
    {
        this.APPLICATION_CACHE = new NodeCache(cacheSettings);
    }

    static addDataToCache(cacheKey, cacheData, timeout)
    {
        if (!this.APPLICATION_CACHE)
        {
            this.createApplicationCache(this.DEFAULT_CACHE_SETTINGS);
        }

        this.APPLICATION_CACHE.set(cacheKey, cacheData, (!!timeout) ? timeout : 0);
    }

    static retrieveCacheData(cacheKey)
    {
        if (!this.APPLICATION_CACHE || !this.APPLICATION_CACHE.has(cacheKey))
        {
            return null;
        }

        return this.APPLICATION_CACHE.get(cacheKey);
    }

    static retrieveAndDeleteCacheData(cacheKey)
    {
        if (!this.APPLICATION_CACHE || !this.APPLICATION_CACHE.has(cacheKey))
        {
            return null;
        }

        return this.APPLICATION_CACHE.take(cacheKey);
    }

    static deleteCacheData(cacheKey)
    {
        if (!this.APPLICATION_CACHE || !this.APPLICATION_CACHE.has(cacheKey))
        {
            return false;
        }

        return (this.APPLICATION_CACHE.delete(cacheKey) >= 1) ? true : false;
    }
}

module.exports = { ApplicationCacheManager };