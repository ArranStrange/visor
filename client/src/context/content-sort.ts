import type { ContentSort } from "@/types/graphql";

/**
 * What the grid shows when the user has not chosen an order.
 *
 * In its own module rather than in ContentTypeFilter.tsx so that file exports
 * only components and hooks — the same split as CameraContext/camera-storage.
 */
export const DEFAULT_CONTENT_SORT: ContentSort = "NEWEST";
