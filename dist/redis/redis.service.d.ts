export declare class RedisService {
    private redisClient;
    get(key: string): Promise<string>;
    set(key: string, value: string | number, ttl?: number): Promise<void>;
}
