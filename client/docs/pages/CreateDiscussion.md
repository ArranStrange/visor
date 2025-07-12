# Create Discussion Page

## Overview

The CreateDiscussion page provides a comprehensive form for users to create new discussions in the VISOR application. It supports various discussion types, optional linking to presets or film simulations, and tag management.

## File Location

`src/pages/CreateDiscussion.tsx`

## Key Features

### Discussion Form

- **Title Field**: Required discussion title with validation
- **Discussion Type**: Dropdown with 14 different discussion categories
- **Item Linking**: Optional linking to presets or film simulations
- **Tag Management**: Add/remove tags with real-time validation

### Discussion Types

- **PRESET**: Discussions about specific presets
- **FILMSIM**: Discussions about film simulations
- **TECHNIQUE**: Photography technique discussions
- **EQUIPMENT**: Camera and equipment discussions
- **LOCATION**: Location-based discussions
- **TUTORIAL**: Tutorial and how-to discussions
- **REVIEW**: Product and service reviews
- **CHALLENGE**: Photography challenges
- **WORKFLOW**: Post-processing workflows
- **INSPIRATION**: Creative inspiration discussions
- **CRITIQUE**: Photo critique discussions
- **NEWS**: Photography industry news
- **EVENT**: Photography events and meetups
- **GENERAL**: General photography topics

## Component Structure

### State Management

```tsx
const [form, setForm] = useState<CreateDiscussionForm>({
  title: "",
  linkedToType: "PRESET",
  linkedToId: "",
  tags: [],
});
const [tagInput, setTagInput] = useState("");
const [selectedItem, setSelectedItem] = useState<any>(null);
```

### Form Interface

```tsx
interface CreateDiscussionForm {
  title: string;
  linkedToType:
    | "PRESET"
    | "FILMSIM"
    | "TECHNIQUE"
    | "EQUIPMENT"
    | "LOCATION"
    | "TUTORIAL"
    | "REVIEW"
    | "CHALLENGE"
    | "WORKFLOW"
    | "INSPIRATION"
    | "CRITIQUE"
    | "NEWS"
    | "EVENT"
    | "GENERAL";
  linkedToId: string;
  tags: string[];
}
```

## Form Sections

### Title Section

- **Required Field**: Must have a non-empty title
- **Validation**: Real-time validation feedback
- **Placeholder**: "What would you like to discuss?"
- **Character Limit**: No explicit limit but should be reasonable

### Discussion Type Selection

- **Dropdown Menu**: Material-UI Select component
- **14 Options**: All discussion types available
- **Default Value**: "PRESET" as default selection
- **Type Reset**: Resets linked item when type changes

### Item Linking Section

- **Conditional Display**: Only shows for PRESET and FILMSIM types
- **Autocomplete**: Search through available presets/film simulations
- **Optional Linking**: Not required for discussion creation
- **Performance**: Limits results to 50 matches for performance

### Tag Management

- **Tag Input**: Text field for adding new tags
- **Add Button**: Manually add tags
- **Enter Key**: Add tag on Enter key press
- **Tag Chips**: Visual display of added tags
- **Remove Tags**: Click X to remove individual tags
- **Validation**: Prevents duplicate tags

## Data Integration

### GraphQL Queries

- **GET_ALL_PRESETS**: Fetches available presets for linking
- **GET_ALL_FILMSIMS**: Fetches available film simulations for linking

### GraphQL Mutations

- **CREATE_DISCUSSION**: Creates new discussion with all form data

### Data Filtering

```tsx
const getAvailableItems = () => {
  if (form.linkedToType === "PRESET") {
    return presetsData?.listPresets || [];
  } else if (form.linkedToType === "FILMSIM") {
    return filmSimsData?.listFilmSims || [];
  }
  return [];
};
```

## UI Components

### Layout Structure

- **Container**: `maxWidth="lg"` with responsive padding
- **Breadcrumbs**: Navigation breadcrumb trail
- **Card Layout**: Elevated card with form content
- **Responsive Design**: Adapts to different screen sizes

### Breadcrumb Navigation

```tsx
<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
  <Link
    color="inherit"
    href="/discussions"
    onClick={(e) => {
      e.preventDefault();
      navigate("/discussions");
    }}
  >
    Discussions
  </Link>
  <Typography color="text.primary">Create Discussion</Typography>
</Breadcrumbs>
```

### Form Components

- **TextField**: Title input with validation
- **FormControl**: Discussion type dropdown
- **Autocomplete**: Item linking with search
- **Tag Input**: Tag management interface
- **Button Group**: Submit and cancel buttons

## Form Validation

### Title Validation

- **Required**: Must have non-empty title
- **Trim**: Removes leading/trailing whitespace
- **Real-time**: Immediate validation feedback

### Tag Validation

- **Duplicate Prevention**: Cannot add same tag twice
- **Empty Prevention**: Cannot add empty tags
- **Trim**: Removes whitespace from tags

### Item Linking Validation

- **Optional**: Not required for discussion creation
- **Type Matching**: Only shows relevant items for selected type
- **Performance**: Limits search results for better performance

## User Experience

### Form Interaction

- **Real-time Feedback**: Immediate validation responses
- **Clear Labels**: Descriptive field labels
- **Helpful Placeholders**: Guidance text in input fields
- **Loading States**: Visual feedback during submission

### Navigation

- **Breadcrumb Trail**: Clear navigation context
- **Cancel Button**: Easy way to abandon form
- **Success Navigation**: Redirects to created discussion

### Responsive Design

- **Mobile Friendly**: Touch-friendly interface
- **Desktop Optimized**: Full-featured desktop experience
- **Adaptive Layout**: Responsive to screen size

## Accessibility Features

### Form Accessibility

- **Labels**: Proper form labels for all fields
- **Required Fields**: Clear indication of required fields
- **Error Messages**: Descriptive error feedback
- **Keyboard Navigation**: Full keyboard support

### Screen Reader Support

- **Semantic HTML**: Proper form structure
- **ARIA Labels**: Descriptive labels for form elements
- **Error Announcements**: Screen reader accessible error messages
- **Navigation Context**: Clear breadcrumb navigation

### Visual Accessibility

- **High Contrast**: Adequate contrast ratios
- **Focus Indicators**: Clear focus states
- **Touch Targets**: Sufficient touch target sizes
- **Loading States**: Clear visual feedback

## Performance Optimizations

### Data Loading

- **GraphQL Queries**: Efficient data fetching
- **Caching**: Apollo Client caching for performance
- **Loading States**: Proper loading indicators

### Search Performance

- **Result Limiting**: Limits autocomplete results to 50
- **Debounced Search**: Efficient search algorithm
- **Filtered Results**: Only shows relevant items

### Form Performance

- **Efficient Validation**: Real-time validation without performance impact
- **Optimized Re-renders**: Minimal re-renders
- **Memoized Components**: Optimized component rendering

## Error Handling

### Form Errors

- **Validation Errors**: Field-specific error messages
- **Network Errors**: GraphQL error handling
- **User Feedback**: Clear error messages with retry options
- **Timeout Handling**: Automatic error clearing

### Submission Errors

- **GraphQL Errors**: Server-side validation errors
- **Network Failures**: Connection error handling
- **User Recovery**: Clear error messages and retry options

## Integration Points

### Navigation Dependencies

- `useNavigate`: React Router navigation hook
- **Route Configuration**: Integration with app routing
- **Breadcrumb Navigation**: Context-aware navigation

### Component Dependencies

- **Material-UI**: Form components and layout
- **React Router**: Navigation functionality
- **Apollo Client**: GraphQL data fetching

### Context Dependencies

- **Auth Context**: User authentication for permissions
- **Discussion Context**: May be used for discussion state

## Testing Integration

### Cypress Testing

- **Form Elements**: Test all form inputs
- **Validation**: Test form validation
- **Submission**: Test form submission
- **Navigation**: Test breadcrumb and button navigation
- **Responsive**: Test mobile/desktop layouts

### Test Scenarios

- **Valid Submission**: Complete form with valid data
- **Invalid Data**: Test validation errors
- **Network Errors**: Test error handling
- **Navigation**: Test cancel and success navigation
- **Tag Management**: Test tag addition/removal
- **Item Linking**: Test preset/film simulation linking

## Future Enhancements

### Planned Features

- **Draft Saving**: Save discussion as draft
- **Rich Text Editor**: Enhanced text editing capabilities
- **Image Upload**: Add images to discussions
- **Discussion Templates**: Pre-configured discussion types
- **Auto-save**: Automatic draft saving
- **Discussion Preview**: Preview before publishing
- **Discussion Scheduling**: Schedule discussions for later
- **Discussion Categories**: Enhanced categorization
- **Discussion Moderation**: Moderation tools
- **Discussion Analytics**: Track discussion engagement
