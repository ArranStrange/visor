/**
 * Search Page Default Plugins
 * 
 * This runtime file registers the default Search page sections.
 * Plugins can override or extend these by using different priorities.
 */

import React from "react";
import {
  SearchFilters,
  SearchResultsHeader,
} from "lib/slots/slot-definitions";
import { SearchFiltersWrapper } from "./search-filters-wrapper";
import { SearchResultsHeaderWrapper } from "./search-results-header-wrapper";

// Register default search filters
SearchFilters.plug(
  <SearchFiltersWrapper key="search-filters" />,
  10
);

// Register default search results header
SearchResultsHeader.plug(
  <SearchResultsHeaderWrapper key="search-results-header" />,
  10
);

