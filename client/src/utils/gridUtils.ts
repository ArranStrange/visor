/**
 * Calculates the optimal number of columns based on container width
 */
export const calculateColumnCount = (containerWidth: number): number => {
  if (containerWidth < 700) {
    return 2;
  } else if (containerWidth < 900) {
    return 3;
  } else {
    return 4;
  }
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Shuffles array in chunks to preserve some order
 */
export const shuffleArrayInChunks = <T>(
  array: T[],
  chunkSize: number = 10
): T[] => {
  const shuffled: T[] = [];

  for (let chunkStart = 0; chunkStart < array.length; chunkStart += chunkSize) {
    const chunkEnd = Math.min(chunkStart + chunkSize, array.length);
    const chunk = array.slice(chunkStart, chunkEnd);
    const shuffledChunk = shuffleArray(chunk);
    shuffled.push(...shuffledChunk);
  }

  return shuffled;
};

/**
 * Distributes items across columns in a round-robin fashion
 */
export const distributeItemsAcrossColumns = <T>(
  items: T[],
  columnCount: number
): T[][] => {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);

  items.forEach((item, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(item);
  });

  return columns;
};
