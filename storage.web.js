/**
 * 网页版本地存储：接口与小程序端 storage.js 保持一致。
 */
const RECORDS_KEY = 'liuren:records';
const SETTINGS_KEY = 'liuren:settings';
const LIMIT = 60;

const DEFAULT_SETTINGS = { lateZi: true };

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // 隐私模式或空间不足时静默失败
  }
}

function listRecords() {
  const list = readJson(RECORDS_KEY, []);
  return Array.isArray(list) ? list : [];
}

function addRecord(record) {
  const list = listRecords().filter((item) => item && item.id !== record.id);
  list.unshift(record);
  writeJson(RECORDS_KEY, list.slice(0, LIMIT));
  return record;
}

function getRecord(id) {
  return listRecords().filter((item) => item && item.id === id)[0] || null;
}

function removeRecord(id) {
  writeJson(
    RECORDS_KEY,
    listRecords().filter((item) => item && item.id !== id)
  );
}

function clearRecords() {
  writeJson(RECORDS_KEY, []);
}

function getSettings() {
  return Object.assign({}, DEFAULT_SETTINGS, readJson(SETTINGS_KEY, {}));
}

function saveSettings(patch) {
  const next = Object.assign({}, getSettings(), patch || {});
  writeJson(SETTINGS_KEY, next);
  return next;
}

module.exports = {
  listRecords,
  addRecord,
  getRecord,
  removeRecord,
  clearRecords,
  getSettings,
  saveSettings,
};
