import cache from "./index.js";

// these functions are created for extra benefit but didin't use for time constrain
const TYPES = {
  LIST: "list",
  STRING: "string",
  HASH: "hash",
  ZSET: "zset",
  SET: "set",
};

async function keyExists(...keys) {
  return (await cache.exists(keys)) ? true : false;
}

async function setValue(key, value, expireAt = null) {
  if (expireAt) return cache.pSetEx(key, expireAt.getTime(), `${value}`);
  else return cache.set(key, `${value}`);
}

async function getValue(key) {
  return cache.get(key);
}

async function delByKey(key) {
  return cache.del(key);
}

async function setJson(key, value, expireAt = null) {
  const json = JSON.stringify(value);
  return await setValue(key, json, expireAt);
}

async function getJson(key) {
  const type = await cache.type(key);
  if (type !== TYPES.STRING) return null;

  const json = await getValue(key);
  if (json) return JSON.parse(json);

  return null;
}

async function setList(key, list, expireAt = null) {
  const multi = cache.multi();
  const values = list.map((item) => JSON.stringify(item));
  multi.del(key);
  multi.rPush(key, values);
  if (expireAt) multi.pExpireAt(key, expireAt.getTime());
  return await multi.exec();
}

async function addToList(key, value) {
  const type = await cache.type(key);
  if (type !== TYPES.LIST) return null;

  const item = JSON.stringify(value);
  return await cache.rPushX(key, item);
}

async function getListRange(key, start = 0, end = -1) {
  const type = await cache.type(key);
  if (type !== TYPES.LIST) return null;

  const list = await cache.lRange(key, start, end);
  if (!list) return null;

  return list.map((entry) => JSON.parse(entry));
}

async function setOrderedSet(key, items, expireAt = null) {
  const multi = cache.multi();
  const formattedItems = items.map((item) => ({
    ...item,
    value: JSON.stringify(item.value),
  }));
  multi.del(key);
  multi.zAdd(key, formattedItems);
  if (expireAt) multi.pExpireAt(key, expireAt.getTime());
  return await multi.exec();
}

async function addToOrderedSet(key, items) {
  const type = await cache.type(key);
  if (type !== TYPES.ZSET) return null;

  const formattedItems = items.map((item) => ({
    ...item,
    value: JSON.stringify(item.value),
  }));
  return await cache.zAdd(key, formattedItems);
}

async function removeFromOrderedSet(key, ...items) {
  const type = await cache.type(key);
  if (type !== TYPES.ZSET) return null;

  const formattedItems = items.map((item) => JSON.stringify(item));
  return await cache.zRem(key, formattedItems);
}

async function getOrderedSetRange(key, start = 0, end = -1) {
  const type = await cache.type(key);
  if (type !== TYPES.ZSET) return null;

  const set = await cache.zRangeWithScores(key, start, end);
  return set.map((entry) => ({
    score: entry.score,
    value: JSON.parse(entry.value),
  }));
}

async function getOrderedSetMemberScore(key, member) {
  const type = await cache.type(key);
  if (type !== TYPES.ZSET) return null;

  return await cache.zScore(key, JSON.stringify(member));
}

async function watch(key) {
  return await cache.watch(key);
}

async function unwatch() {
  return await cache.unwatch();
}

async function expire(expireAt, key) {
  return await cache.pExpireAt(key, expireAt.getTime());
}

async function expireMany(expireAt, ...keys) {
  let script = "";
  for (const key of keys) {
    script += `redis.call('pExpireAt', '${key}', ${expireAt.getTime()});`;
  }
  return await cache.eval(script);
}

export default {
  TYPES,
  keyExists,
  setValue,
  getValue,
  delByKey,
  setJson,
  getJson,
  setList,
  addToList,
  getListRange,
  setOrderedSet,
  addToOrderedSet,
  removeFromOrderedSet,
  getOrderedSetRange,
  getOrderedSetMemberScore,
  watch,
  unwatch,
  expire,
  expireMany,
};
