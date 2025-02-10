// utils.js
export function isNotEmptyArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

export function clearLocalStorage() {
  localStorage.clear();
}
