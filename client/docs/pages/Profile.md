# Profile Page

## Overview

The Profile page allows users to view and edit their personal information, including bio, Instagram handle, camera equipment, and profile picture. It features a comprehensive form with image upload capabilities and real-time validation.

## File Location

`src/pages/Profile.tsx`

## Key Features

### Profile Information Management

- **Bio Section**: Multi-line text area for personal description
- **Instagram Handle**: Social media integration with icon
- **Camera Equipment**: Dynamic list of user's cameras
- **Profile Picture**: Avatar upload with Cloudinary integration

### Profile Picture Management

- **Image Upload**: Drag-and-drop or click-to-upload functionality
- **Cloudinary Integration**: Direct upload to Cloudinary CDN
- **Image Validation**: File type and size validation
- **Loading States**: Visual feedback during upload

### Edit Mode

- **Toggle Editing**: Switch between view and edit modes
- **Form Validation**: Real-time validation feedback
- **Save/Cancel**: Commit changes or revert to previous state
- **Auto-save**: Automatic saving of changes

## Component Structure

### State Management

```tsx
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
  bio: "",
  instagram: "",
  cameras: [] as string[],
});
const [newCamera, setNewCamera] = useState("");
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);
const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
const [avatarError, setAvatarError] = useState<string | null>(null);
```

### GraphQL Queries and Mutations

- **GET_USER_PROFILE**: Fetches current user profile data
- **UPDATE_USER_PROFILE**: Updates profile information
- **UPLOAD_AVATAR**: Handles avatar upload (deprecated, uses direct Cloudinary)

## Profile Picture Upload

### Cloudinary Integration

```tsx
const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ProfilePhotos");
  formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await response.json();
  return data.secure_url;
};
```

### Image Validation

```tsx
const validateProfileImage = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) return false;
  if (file.size > maxSize) return false;

  return true;
};
```

## UI Components

### Layout Structure

- **Container**: `maxWidth="md"` with responsive margins
- **Paper Component**: Elevated card with padding and border radius
- **Grid Layout**: Two-column layout for profile picture and form
- **Responsive Design**: Adapts to mobile and desktop

### Profile Picture Section

- **Avatar Component**: Large circular avatar (150x150px)
- **Upload Overlay**: Loading indicator during upload
- **Camera Icon**: Upload trigger with icon button
- **Error Display**: Avatar-specific error messages

### Form Sections

#### Bio Section

- **Multi-line Input**: TextField with 4 rows
- **Placeholder**: "Tell us about yourself..."
- **Disabled State**: Read-only when not editing

#### Instagram Section

- **Text Input**: Instagram handle field
- **Icon Prefix**: Instagram icon in input
- **Placeholder**: "@username"
- **Validation**: Optional field

#### Cameras Section

- **Dynamic List**: Add/remove camera equipment
- **Chip Display**: Visual chips for each camera
- **Add Button**: Add new camera to list
- **Delete Functionality**: Remove cameras when editing

## Form Interactions

### Camera Management

```tsx
const handleAddCamera = () => {
  if (newCamera.trim() && !formData.cameras.includes(newCamera.trim())) {
    setFormData((prev) => ({
      ...prev,
      cameras: [...prev.cameras, newCamera.trim()],
    }));
    setNewCamera("");
  }
};

const handleRemoveCamera = (camera: string) => {
  setFormData((prev) => ({
    ...prev,
    cameras: prev.cameras.filter((c) => c !== camera),
  }));
};
```

### Edit Mode Toggle

- **View Mode**: Read-only display of profile information
- **Edit Mode**: Editable form with save/cancel buttons
- **State Persistence**: Maintains form state during editing
- **Validation**: Real-time validation in edit mode

## Data Flow

### Profile Loading

1. **GraphQL Query**: Fetches user profile data
2. **State Population**: Populates form with user data
3. **Loading States**: Shows loading indicator during fetch
4. **Error Handling**: Displays error if fetch fails

### Profile Updates

1. **Form Submission**: Validates and submits form data
2. **GraphQL Mutation**: Updates profile in database
3. **Success Feedback**: Shows success message
4. **State Refresh**: Refetches data to confirm changes

### Avatar Upload Flow

1. **File Selection**: User selects image file
2. **Validation**: Checks file type and size
3. **Cloudinary Upload**: Direct upload to Cloudinary
4. **Database Update**: Updates avatar URL in database
5. **Context Update**: Updates AuthContext with new avatar

## Error Handling

### Form Errors

- **Validation Errors**: Field-specific error messages
- **Network Errors**: GraphQL error handling
- **User Feedback**: Clear error messages with retry options
- **Timeout Handling**: Automatic error clearing

### Avatar Upload Errors

- **File Validation**: Invalid file type or size
- **Upload Failures**: Network or Cloudinary errors
- **Database Errors**: Failed profile updates
- **User Feedback**: Specific error messages for each failure type

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
- **Upload Feedback**: Clear upload status announcements

### Visual Accessibility

- **High Contrast**: Adequate contrast ratios
- **Focus Indicators**: Clear focus states
- **Touch Targets**: Sufficient touch target sizes
- **Loading States**: Clear visual feedback

## Performance Optimizations

### Image Upload

- **File Validation**: Pre-upload validation to prevent unnecessary requests
- **Progress Feedback**: Visual loading states during upload
- **Error Recovery**: Graceful handling of upload failures
- **Optimized Images**: Cloudinary handles image optimization

### Form Performance

- **Debounced Updates**: Efficient form state updates
- **Memoized Components**: Optimized re-rendering
- **Efficient Validation**: Real-time validation without performance impact

## Security Considerations

### File Upload Security

- **File Type Validation**: Strict file type checking
- **Size Limits**: 5MB maximum file size
- **Cloudinary Security**: Secure upload to trusted CDN
- **No Local Storage**: Files not stored locally

### Form Security

- **Input Validation**: Client and server-side validation
- **CSRF Protection**: GraphQL mutations handle CSRF
- **Error Handling**: Secure error messages
- **Data Sanitization**: Proper data cleaning

## Integration Points

### Context Dependencies

- `AuthContext`: User authentication state management
- `updateAuth`: Updates global user state

### External Services

- **Cloudinary**: Image upload and storage
- **GraphQL**: Data fetching and mutations
- **Apollo Client**: GraphQL client

### Navigation

- **No Navigation**: Profile page is self-contained
- **Error Recovery**: Stays on page after errors
- **Success Handling**: Remains on page after successful updates

## Testing Integration

### Test Scenarios

- **Profile Loading**: Fetch and display profile data
- **Edit Mode**: Toggle between view and edit modes
- **Form Validation**: Test field validation
- **Avatar Upload**: Test image upload functionality
- **Camera Management**: Add/remove camera equipment
- **Error Handling**: Test various error scenarios
- **Success Flow**: Test successful profile updates

### Cypress Testing

- **Form Elements**: Test form interactions
- **Upload Functionality**: Test file upload
- **Validation**: Test form validation
- **Error States**: Test error handling

## Future Enhancements

### Planned Features

- **Social Media Integration**: Additional social platforms
- **Profile Privacy**: Public/private profile settings
- **Profile Verification**: Verified user badges
- **Profile Analytics**: View and engagement statistics
- **Profile Templates**: Pre-designed profile layouts
- **Profile Export**: Export profile data
- **Profile Backup**: Automatic profile backups
- **Profile Migration**: Import from other platforms
