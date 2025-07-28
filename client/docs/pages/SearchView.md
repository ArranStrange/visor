# Search View Page

## Overview

The SearchView page provides comprehensive search functionality for the VISOR application, allowing users to search through presets and film simulations using keywords and tags. It features advanced filtering, real-time search, and a responsive design.

## File Location

`src/pages/SearchView.tsx`

## Key Features

### Search Functionality

- **Keyword Search**: Real-time search across all content fields
- **Tag Filtering**: Filter by specific tags with visual indicators
- **Content Type Toggle**: Switch between all content, presets, or film simulations
- **Advanced Filtering**: Multi-word search with partial matching

### Search Interface

- **Search Input**: Full-width search bar with placeholder text
- **Tag Navigation**: Horizontal scrollable tag list
- **Clear Filters**: "all" link to reset search and tag filters
- **Content Grid**: Dynamic content display based on search results

## Search Logic

### Keyword Search Algorithm

```tsx
// Multi-word search with partial matching
const searchWords = searchTerm.split(/\s+/).filter((word) => word.length > 0);
const allWordsFound = searchWords.every((word) => {
  return (
    searchableText.includes(word) ||
    searchableText
      .split(/\s+/)
      .some(
        (textWord) =>
          textWord.toLowerCase().startsWith(word.toLowerCase()) ||
          textWord.toLowerCase().includes(word.toLowerCase())
      )
  );
});
```

### Searchable Fields

- **Presets**: title, description, notes, creator username, tags
- **Film Simulations**: name, description, notes, creator username, tags
- **Combined Search**: All fields concatenated for comprehensive search

### Tag Filtering

- **Active Tag**: Visual indication of selected tag
- **Tag Selection**: Click to filter by specific tag
- **Tag Deselection**: Click again to remove filter
- **URL Integration**: Tag selection updates URL parameters

## Component Structure

### State Management

```tsx
const [keyword, setKeyword] = useState("");
const [activeTagId, setActiveTagId] = useState<string | null>(null);
const { contentType } = useContentType();
```

### Data Queries

- **Tags Query**: `GET_ALL_TAGS` for available tags
- **Presets Query**: `GET_ALL_PRESETS` for preset data
- **Film Sims Query**: `GET_ALL_FILMSIMS` for film simulation data

## UI Components

### Search Input

- **Full Width**: Spans entire container width
- **Placeholder**: "Search presets, film sims, tags…"
- **Styling**: Custom background with rounded corners
- **Data Attribute**: `data-cy="search-input"` for testing

### Tag Navigation

- **Horizontal Scroll**: Overflow handling for many tags
- **Active States**: Bold and underlined for selected tags
- **Responsive**: Adapts to screen size
- **Clear Link**: "all" link to reset filters

### Content Display

- **ContentTypeToggle**: Filter by content type
- **ContentGridLoader**: Dynamic content grid
- **Custom Data**: Filtered results passed to grid

## Search Features

### Real-time Search

- **Instant Results**: Search updates as user types
- **Performance Optimized**: Efficient filtering algorithm
- **Debounced Input**: Smooth user experience

### Multi-word Search

- **Word Splitting**: Splits search terms by whitespace
- **Partial Matching**: Matches partial words
- **Case Insensitive**: Case-insensitive search
- **All Words Required**: All search words must be found

### Tag Integration

- **URL Parameters**: Tag selection updates URL
- **Persistent State**: Tag selection persists on page refresh
- **Visual Feedback**: Clear indication of active tags

## Data Filtering

### Content Type Filtering

- **All Content**: Shows both presets and film simulations
- **Presets Only**: Filters to show only presets
- **Film Sims Only**: Filters to show only film simulations

### Search Result Structure

```tsx
const results: { type: "preset" | "film" | "buymeacoffee"; data: any }[] = [];
```

### Buy Me a Coffee Card

- **Fixed Position**: Always appears at the beginning
- **Special Type**: "buymeacoffee" type for special handling
- **Static Content**: Non-filterable promotional content

## URL Integration

### Search Parameters

- **Tag Parameter**: `?tag=tagName` for tag filtering
- **URL Updates**: Search state reflected in URL
- **Browser Navigation**: Back/forward button support

### Parameter Handling

```tsx
useEffect(() => {
  const tagParam = searchParams.get("tag");
  if (tagParam) {
    const tag = allTags.find(
      (t: any) => t.displayName.toLowerCase() === tagParam.toLowerCase()
    );
    if (tag) {
      setActiveTagId(tag.id);
    }
  }
}, [searchParams, allTags]);
```

## Performance Optimizations

### Data Loading

- **GraphQL Queries**: Efficient data fetching
- **Caching**: Apollo Client caching for performance
- **Loading States**: Proper loading indicators

### Search Performance

- **Local Filtering**: Client-side filtering for speed
- **Result Limiting**: Limits results to prevent performance issues
- **Efficient Algorithms**: Optimized search algorithms

### Rendering Optimization

- **Memoized Results**: `useMemo` for filtered data
- **Efficient Re-renders**: Minimal re-renders
- **Virtual Scrolling**: For large result sets

## User Experience

### Search Interaction

- **Immediate Feedback**: Real-time search results
- **Clear Visual States**: Obvious active/inactive states
- **Intuitive Navigation**: Easy tag selection and clearing

### Content Discovery

- **Comprehensive Search**: Searches across all relevant fields
- **Flexible Matching**: Partial word matching
- **Tag Discovery**: Easy tag-based content discovery

### Responsive Design

- **Mobile Friendly**: Touch-friendly interface
- **Desktop Optimized**: Full-featured desktop experience
- **Adaptive Layout**: Responsive to screen size

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence
- **Enter Key**: Activates search and tag selection
- **Escape Key**: Clears search or tag selection

### Screen Reader Support

- **Search Announcements**: Clear search result announcements
- **Tag Descriptions**: Descriptive tag labels
- **Navigation Context**: Clear navigation instructions

### Visual Accessibility

- **High Contrast**: Adequate contrast ratios
- **Focus Indicators**: Clear focus states
- **Touch Targets**: Sufficient touch target sizes

## Testing Integration

### Cypress Testing

- **Search Input**: `data-cy="search-input"`
- **Tag Selection**: Tag click testing
- **Content Display**: Result verification
- **URL Updates**: Parameter testing

### Test Scenarios

- **Empty Search**: No keyword search
- **Keyword Search**: Single and multi-word searches
- **Tag Filtering**: Tag selection and deselection
- **Combined Filters**: Keyword + tag filtering
- **Content Type Switching**: Different content type filters
- **URL Persistence**: URL parameter handling

## Error Handling

### Data Loading Errors

- **GraphQL Errors**: Graceful error handling
- **Network Errors**: User-friendly error messages
- **Fallback States**: Default content when data unavailable

### Search Errors

- **Invalid Input**: Handles malformed search terms
- **Empty Results**: Clear messaging for no results
- **Performance Issues**: Handles large result sets

## Integration Points

### Context Dependencies

- `ContentTypeFilter`: Content type management
- `useSearchParams`: URL parameter handling
- `useNavigate`: Navigation functionality

### Component Dependencies

- `ContentTypeToggle`: Content type filtering
- `ContentGridLoader`: Content display
- GraphQL queries for data fetching

### Data Dependencies

- **Tags Data**: Available tags for filtering
- **Presets Data**: Preset content for search
- **Film Sims Data**: Film simulation content for search

## Future Enhancements

### Planned Features

- **Advanced Filters**: Date, creator, rating filters
- **Search History**: Recent search terms
- **Search Suggestions**: Autocomplete suggestions
- **Saved Searches**: Save and reuse search queries
- **Search Analytics**: Track popular searches
- **Voice Search**: Voice input for search
- **Image Search**: Search by visual similarity
- **Search Export**: Export search results
