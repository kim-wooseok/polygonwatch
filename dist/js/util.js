export default function removeFromArray(array, obj) {
  const idx = array.indexOf(obj);
  if (idx > -1) {
    array.splice(idx, 1);
  }
}

export { removeFromArray };
