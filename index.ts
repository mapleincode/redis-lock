/*
 * @Author: maple
 * @Date: 2019-12-11 15:59:07
 * @LastEditors: maple
 * @LastEditTime: 2019-12-12 16:52:27
 */
import { Redis } from 'ioredis';

export default class RedisLock {
    private redis: Redis;
    private _key: string;
    private _timeout: number;
    private expireTimes: number;

    constructor(redis: Redis, key: string, timeout: number) {
        this.redis = redis;
        this._key = key;
        this._timeout = timeout;

        this.expireTimes = 0;
    }

    async lock(): Promise<boolean> {
        const times = await this.redis.incr(this._key);

        if(times === 1) {
            this.expireTimes = 0;
            await this.redis.expire(this._key, this._timeout);
            this.expireTimes = 20;
            return true;
        } else if(this.expireTimes-- <= 0) {
            // expireTimes 如果小于 0 ，说明次数已使用完，可以再次检查 sll。
            const ttl = await this.redis.ttl(this._key);
            if(ttl === -2) {
                // do nothing
                // key 不存在
            } else if(ttl === -1) {
                await this.redis.expire(this._key, this._timeout);
            }

            this.expireTimes = 20; // 设置 20 次等待
            return false;
        }

        return false;
    }

    async holdover() {
        await this.redis.expire(this._key, this._timeout);
        this.expireTimes ++; // 延续次数
    }

    async cleanLock() {
        this.expireTimes = 0; // 防止因为 key 删除成功但是报错，而使 expireTimes 一直为 true
        await this.redis.del(this._key);
    }
}
