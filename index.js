"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var RedisLock = /** @class */ (function () {
    function RedisLock(redis, key, timeout) {
        this.redis = redis;
        this._key = key;
        this._timeout = timeout;
        this.expireTimes = 0;
    }
    RedisLock.prototype.lock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var times, ttl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.incr(this._key)];
                    case 1:
                        times = _a.sent();
                        if (!(times === 1)) return [3 /*break*/, 3];
                        this.expireTimes = 0;
                        return [4 /*yield*/, this.redis.expire(this._key, this._timeout)];
                    case 2:
                        _a.sent();
                        this.expireTimes = 20;
                        return [2 /*return*/, true];
                    case 3:
                        if (!(this.expireTimes-- <= 0)) return [3 /*break*/, 8];
                        console.log('检查 ttl');
                        return [4 /*yield*/, this.redis.ttl(this._key)];
                    case 4:
                        ttl = _a.sent();
                        if (!(ttl === -2)) return [3 /*break*/, 5];
                        return [3 /*break*/, 7];
                    case 5:
                        if (!(ttl === -1)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.redis.expire(this._key, this._timeout)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        this.expireTimes = 20; // 设置 20 次等待
                        return [2 /*return*/, false];
                    case 8: return [2 /*return*/, false];
                }
            });
        });
    };
    RedisLock.prototype.holdover = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.expire(this._key, this._timeout)];
                    case 1:
                        _a.sent();
                        this.expireTimes++; // 延续次数
                        return [2 /*return*/];
                }
            });
        });
    };
    RedisLock.prototype.cleanLock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.expireTimes = 0; // 防止因为 key 删除成功但是报错，而使 expireTimes 一直为 true
                        return [4 /*yield*/, this.redis.del(this._key)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedisLock;
}());
exports["default"] = RedisLock;
