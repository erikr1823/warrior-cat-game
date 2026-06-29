export function removeDeadInPlace(list, onRemove = null) {
  let writeIndex = 0;

  for (let readIndex = 0; readIndex < list.length; readIndex += 1) {
    const entity = list[readIndex];

    if (entity.isDead) {
      onRemove?.(entity);
      continue;
    }

    if (writeIndex !== readIndex) {
      list[writeIndex] = entity;
    }

    writeIndex += 1;
  }

  list.length = writeIndex;
}
