# Upload Preset Page

## Overview

The UploadPreset page provides a comprehensive form for users to upload new presets to the VISOR application. It features advanced settings configuration, image upload capabilities, XMP file parsing, and detailed preset customization options.

## File Location

`src/pages/UploadPreset.tsx`

## Key Features

### Preset Information

- **Title Field**: Required preset title with validation
- **Description**: Optional detailed description
- **Notes**: Additional technical notes
- **Tags**: Dynamic tag management system

### Image Upload

- **Before/After Images**: Upload comparison images
- **Sample Images**: Multiple sample images for preset
- **Cloudinary Integration**: Direct upload to Cloudinary CDN
- **Image Validation**: File type and size validation

### XMP File Processing

- **XMP Parser**: Automatic parsing of XMP files
- **Settings Extraction**: Extract settings from XMP data
- **Tone Curve Support**: Advanced tone curve configuration
- **Settings Display**: Visual representation of extracted settings

### Advanced Settings

- **Film Simulation Settings**: Comprehensive film simulation options
- **White Balance**: Advanced white balance configuration
- **Dynamic Range**: DR100, DR200, DR400 options
- **Color Grading**: Advanced color adjustment tools

## Component Structure

### State Management

```tsx
const [form, setForm] = useState({
  title: "",
  description: "",
  notes: "",
  tags: [] as string[],
  beforeImage: null as ImageInput | null,
  afterImage: null as ImageInput | null,
  sampleImages: [] as ImageInput[],
});
const [tagInput, setTagInput] = useState("");
const [parsedSettings, setParsedSettings] = useState<ParsedSettings | null>(
  null
);
```

### Settings Configuration

```tsx
interface FilmSimSettings {
  dynamicRange: string;
  filmSimulation: string;
  whiteBalance: string;
  wbShift: WhiteBalanceShift;
  color: number;
  sharpness: number;
  highlight: number;
  shadow: number;
  noiseReduction: number;
  grainEffect: number;
  clarity: number;
}
```

## Form Sections

### Basic Information

- **Title**: Required field with validation
- **Description**: Multi-line text area
- **Notes**: Technical notes and instructions
- **Tags**: Dynamic tag input with chips

### Image Upload Section

- **Before Image**: Upload original image
- **After Image**: Upload processed image
- **Sample Images**: Multiple sample images
- **Upload Progress**: Visual feedback during upload

### Settings Configuration

- **Dynamic Range**: Auto, DR100, DR200, DR400
- **Film Simulation**: 11 different film simulation options
- **White Balance**: 9 white balance options with custom shifts
- **Advanced Settings**: Color, sharpness, highlights, shadows, etc.

### XMP Integration

- **XMP Parser**: Automatic settings extraction
- **Settings Display**: Visual settings representation
- **Tone Curve**: Advanced curve configuration
- **Settings Validation**: Ensure extracted settings are valid

## Settings Options

### Dynamic Range Options

```tsx
const DYNAMIC_RANGE_OPTIONS = [
  { value: "AUTO", label: "Auto" },
  { value: "DR100", label: "DR100 (Normal)" },
  { value: "DR200", label: "DR200 (Expanded, min ISO 400)" },
  { value: "DR400", label: "DR400 (Max, min ISO 800)" },
];
```

### Film Simulation Options

```tsx
const FILM_SIMULATION_OPTIONS = [
  { value: "PROVIA", label: "Provia (Standard)" },
  { value: "VELVIA", label: "Velvia (Vivid)" },
  { value: "ASTIA", label: "Astia (Soft)" },
  { value: "CLASSIC_CHROME", label: "Classic Chrome" },
  { value: "CLASSIC_NEG", label: "Classic Neg" },
  { value: "ETERNA", label: "Eterna" },
  { value: "ETERNA_BLEACH", label: "Eterna Bleach Bypass" },
  { value: "ACROS", label: "Acros" },
  { value: "MONOCHROME", label: "Monochrome" },
  { value: "SEPIA", label: "Sepia" },
  { value: "NOSTALGIC_NEG", label: "Nostalgic Neg" },
];
```

### White Balance Options

```tsx
const WHITE_BALANCE_OPTIONS = [
  { value: "AUTO", label: "Auto" },
  { value: "DAYLIGHT", label: "Daylight" },
  { value: "SHADE", label: "Shade" },
  { value: "FLUORESCENT_1", label: "Fluorescent 1" },
  { value: "FLUORESCENT_2", label: "Fluorescent 2" },
  { value: "FLUORESCENT_3", label: "Fluorescent 3" },
  { value: "INCANDESCENT", label: "Incandescent" },
  { value: "UNDERWATER", label: "Underwater" },
  { value: "CUSTOM", label: "Custom" },
];
```

## Image Upload Process

### Cloudinary Integration

```tsx
const uploadToCloudinary = async (file: File): Promise<ImageInput> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "PresetImages");
  formData.append("folder", "presets");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await response.json();
  return {
    publicId: data.public_id,
    url: data.secure_url,
  };
};
```

### File Validation

```tsx
const validateFile = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) return false;
  if (file.size > maxSize) return false;

  return true;
};
```

## XMP Processing

### Settings Parsing

- **Automatic Detection**: Detects XMP files automatically
- **Settings Extraction**: Extracts all relevant settings
- **Tone Curve**: Processes advanced tone curve data
- **Validation**: Ensures extracted settings are valid

### Settings Display

- **Visual Representation**: Shows extracted settings
- **Editable Fields**: Allows manual adjustment
- **Real-time Updates**: Updates as settings change
- **Validation Feedback**: Clear validation messages

## Advanced Components

### White Balance Grid

- **Visual Interface**: Grid-based white balance adjustment
- **Color Temperature**: Adjust color temperature
- **Tint Control**: Fine-tune tint adjustments
- **Real-time Preview**: Live preview of adjustments

### Tone Curve

- **Advanced Curves**: RGB and individual channel curves
- **Visual Editor**: Drag-and-drop curve editing
- **Preset Curves**: Common curve presets
- **Export/Import**: Curve data import/export

### Color Grading Wheels

- **Hue/Saturation**: Individual color adjustments
- **Luminance**: Brightness adjustments per color
- **Visual Interface**: Intuitive color wheel interface
- **Real-time Preview**: Live preview of adjustments

## Form Validation

### Required Fields

- **Title**: Must be non-empty
- **Settings**: Must have valid settings configuration
- **Images**: At least one sample image required

### Image Validation

- **File Type**: JPEG, PNG, WebP only
- **File Size**: Maximum 10MB per file
- **Image Quality**: Minimum resolution requirements
- **Aspect Ratio**: Recommended aspect ratios

### Settings Validation

- **Required Settings**: Essential settings must be present
- **Value Ranges**: Settings within valid ranges
- **Compatibility**: Settings compatibility checks
- **Tone Curve**: Valid curve data structure

## User Experience

### Form Interaction

- **Real-time Feedback**: Immediate validation responses
- **Clear Labels**: Descriptive field labels
- **Helpful Placeholders**: Guidance text in input fields
- **Loading States**: Visual feedback during operations

### Image Management

- **Drag and Drop**: Intuitive image upload
- **Preview**: Image preview before upload
- **Progress Indicators**: Upload progress display
- **Error Handling**: Clear error messages for failed uploads

### Settings Configuration

- **Visual Interface**: Intuitive settings controls
- **Preset Options**: Common setting combinations
- **Advanced Mode**: Detailed settings for power users
- **Reset Options**: Easy settings reset

## Performance Optimizations

### Image Upload

- **File Validation**: Pre-upload validation
- **Compression**: Automatic image optimization
- **Progress Tracking**: Real-time upload progress
- **Error Recovery**: Graceful upload failure handling

### Settings Processing

- **Efficient Parsing**: Optimized XMP parsing
- **Caching**: Settings cache for performance
- **Lazy Loading**: Load heavy components on demand
- **Debounced Updates**: Efficient settings updates

## Error Handling

### Upload Errors

- **File Validation**: Clear error messages for invalid files
- **Network Errors**: Upload failure handling
- **Size Limits**: File size error messages
- **Format Errors**: Unsupported format messages

### Settings Errors

- **Parsing Errors**: XMP parsing error handling
- **Validation Errors**: Settings validation messages
- **Compatibility Issues**: Settings compatibility warnings
- **Missing Data**: Required data error messages

## Integration Points

### External Services

- **Cloudinary**: Image upload and storage
- **XMP Parser**: Settings extraction from XMP files
- **GraphQL**: Data submission and validation

### Component Dependencies

- **XmpParser**: XMP file processing
- **ToneCurve**: Advanced curve editing
- **WhiteBalanceGrid**: White balance adjustment
- **ColorGradingWheels**: Color grading interface

## Testing Integration

### Test Scenarios

- **Form Validation**: Test all form validations
- **Image Upload**: Test image upload functionality
- **XMP Processing**: Test XMP file parsing
- **Settings Configuration**: Test settings adjustment
- **Form Submission**: Test complete form submission
- **Error Handling**: Test various error scenarios

### Cypress Testing

- **Form Elements**: Test all form inputs
- **File Upload**: Test image upload functionality
- **Settings Interface**: Test settings configuration
- **Validation**: Test form validation
- **Submission**: Test form submission process

## Future Enhancements

### Planned Features

- **Batch Upload**: Upload multiple presets at once
- **Preset Templates**: Pre-configured preset templates
- **Advanced Analytics**: Upload analytics and insights
- **Collaborative Editing**: Multi-user preset editing
- **Version Control**: Preset version management
- **Preset Marketplace**: Preset selling and sharing
- **AI Enhancement**: AI-powered preset optimization
- **Mobile Upload**: Mobile-optimized upload interface
