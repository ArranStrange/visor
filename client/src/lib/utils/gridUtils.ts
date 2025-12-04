export const calculateColumnCount = (containerWidth: number): number => {
  if (containerWidth < 700) {
    return 2;
  } else if (containerWidth < 900) {
    return 3;
  } else {
    return 4;
  }
};

export const distributeItemsAcrossColumns = (
  itemIndices: number[],
  columnCount: number
): number[][] => {
  const columns: number[][] = Array.from({ length: columnCount }, () => []);

  itemIndices.forEach((itemIndex, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(itemIndex);
  });

  return columns;
};
