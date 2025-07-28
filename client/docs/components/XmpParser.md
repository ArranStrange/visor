# XmpParser Component

## Overview

The `XmpParser` component is a sophisticated XMP (Extensible Metadata Platform) file parser that extracts and processes Lightroom preset settings from .xmp files. It provides comprehensive parsing capabilities, settings validation, and user-friendly error handling for the preset upload system in VISOR. This component is critical for processing user-uploaded Lightroom presets.

## File Location

```
src/components/XmpParser.tsx
```

## Props Interface

```typescript
interface XmpParserProps {
  file: File; // XMP file to parse
  onParseComplete: (data: ParsedXmpData) => void; // Callback with parsed data
  onParseError: (error: string) => void; // Error callback
  onProgress?: (progress: number) => void; // Optional progress callback
}
```

## Key Features

### 📄 XMP File Processing

- **File Validation**: Checks file type and format
- **XML Parsing**: Parses XMP XML structure
- **Settings Extraction**: Extracts all Lightroom settings
- **Data Validation**: Validates extracted settings

### ⚙️ Settings Processing

- **Camera Raw Settings**: Processes Adobe Camera Raw settings
- **Lightroom Settings**: Extracts Lightroom-specific settings
- **Metadata Handling**: Processes file metadata
- **Settings Normalization**: Normalizes setting values

### 🔍 Error Handling

- **File Format Errors**: Handles invalid XMP files
- **Parsing Errors**: Graceful XML parsing error handling
- **Validation Errors**: Settings validation error reporting
- **Progress Feedback**: Real-time parsing progress

### 📊 Data Output

- **Structured Data**: Returns organized settings object
- **Type Safety**: TypeScript interfaces for parsed data
- **Compatibility**: Ensures compatibility with VISOR system
- **Export Format**: Ready for database storage

## Usage Examples

### Basic Usage

```tsx
<XmpParser
  file={xmpFile}
  onParseComplete={(data) => {
    console.log("Parsed settings:", data);
    // Handle parsed data
  }}
  onParseError={(error) => {
    console.error("Parse error:", error);
    // Handle error
  }}
/>
```

### With Progress Tracking

```tsx
<XmpParser
  file={xmpFile}
  onParseComplete={handleParseComplete}
  onParseError={handleParseError}
  onProgress={(progress) => {
    setParseProgress(progress);
  }}
/>
```

### Error Handling

```tsx
<XmpParser
  file={xmpFile}
  onParseComplete={handleParseComplete}
  onParseError={(error) => {
    setError(error);
    showNotification("error", `Failed to parse XMP file: ${error}`);
  }}
/>
```

## Component Structure

### State Management

```typescript
const [isParsing, setIsParsing] = useState(false);
const [progress, setProgress] = useState(0);
const [error, setError] = useState<string | null>(null);
```

### Key Functions

- **`parseXmpFile`**: Main parsing function
- **`validateFile`**: File format validation
- **`extractSettings`**: Settings extraction logic
- **`normalizeSettings`**: Settings normalization
- **`handleError`**: Error handling and reporting

### Parsing Logic

```typescript
// XMP parsing workflow
const parseXmpFile = async (file: File) => {
  try {
    // 1. Validate file
    validateFile(file);

    // 2. Read file content
    const content = await readFileContent(file);

    // 3. Parse XML
    const xmlDoc = parseXML(content);

    // 4. Extract settings
    const settings = extractSettings(xmlDoc);

    // 5. Normalize data
    const normalizedData = normalizeSettings(settings);

    // 6. Return parsed data
    return normalizedData;
  } catch (error) {
    handleError(error);
  }
};
```

## Styling & Theming

### Component Styling

- **Progress Indicators**: Visual feedback during parsing
- **Error Display**: Clear error message presentation
- **Loading States**: Loading indicators for parsing
- **Success Feedback**: Success state indicators

### Material-UI Integration

- **CircularProgress**: Progress indicator component
- **Alert**: Error message display
- **Typography**: Text display for status
- **Box**: Layout container

### Custom Styling

```typescript
sx={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: 2,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
}}
```

## Performance Considerations

### Optimization Strategies

- **Async Processing**: Non-blocking file parsing
- **Progress Tracking**: Real-time progress updates
- **Memory Management**: Efficient file handling
- **Error Recovery**: Graceful error handling

### Memory Management

- **File Cleanup**: Proper file object cleanup
- **XML Parsing**: Efficient XML document handling
- **State Cleanup**: Reset state after completion
- **Event Listeners**: Proper event listener cleanup

### Parsing Performance

- **Streaming**: Stream large files efficiently
- **Chunked Processing**: Process files in chunks
- **Background Processing**: Parse in background thread
- **Caching**: Cache parsed results when possible

## Error Handling

### File Validation Errors

- **File Type**: Validate .xmp file extension
- **File Size**: Check file size limits
- **File Format**: Validate XMP XML structure
- **File Corruption**: Handle corrupted files

### Parsing Errors

- **XML Errors**: Handle malformed XML
- **Missing Settings**: Handle missing required settings
- **Invalid Values**: Handle invalid setting values
- **Encoding Issues**: Handle character encoding problems

### Processing Errors

- **Memory Errors**: Handle memory limitations
- **Timeout Errors**: Handle parsing timeouts
- **Network Errors**: Handle file upload issues
- **Validation Errors**: Handle data validation failures

## Accessibility Features

### ARIA Support

- **Progress Role**: Proper progress indicator ARIA
- **Status Role**: Status announcements for screen readers
- **Error Role**: Error message ARIA attributes
- **Loading Role**: Loading state announcements

### Screen Reader Support

- **Status Updates**: Announce parsing progress
- **Error Messages**: Clear error descriptions
- **Success Messages**: Completion announcements
- **Progress Feedback**: Real-time progress updates

### Keyboard Navigation

- **Focus Management**: Proper focus handling
- **Keyboard Shortcuts**: Keyboard-accessible controls
- **Tab Order**: Logical tab order
- **Escape Handling**: Escape key functionality

### Visual Accessibility

- **Color Contrast**: Maintains color contrast
- **Visual Indicators**: Clear visual feedback
- **Progress Visualization**: Clear progress display
- **Error Visualization**: Clear error display

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for parser functionality
data-cy="xmp-parser"           // Main parser container
data-cy="file-input"           // File input element
data-cy="parse-button"         // Parse button
data-cy="progress-indicator"   // Progress indicator
data-cy="error-message"        // Error message display
data-cy="success-message"      // Success message display
```

### Test Scenarios

1. **File Validation**: Test file type and format validation
2. **Parsing Success**: Test successful XMP parsing
3. **Error Handling**: Test various error scenarios
4. **Progress Tracking**: Test progress indicator functionality
5. **Data Output**: Test parsed data structure
6. **Performance**: Test parsing performance with large files

### Performance Testing

- **Large Files**: Test with large XMP files
- **Memory Usage**: Monitor memory consumption
- **Parsing Speed**: Test parsing performance
- **Error Recovery**: Test error recovery mechanisms

## Dependencies

### Internal Dependencies

- **File Processing**: Custom file reading utilities
- **XML Parsing**: XML document parsing logic
- **Settings Validation**: Custom validation functions
- **Error Handling**: Custom error handling utilities

### External Dependencies

- **Material-UI**: CircularProgress, Alert, Typography, Box
- **File API**: Browser File API for file handling
- **XML Parser**: XML parsing library (if needed)
- **React Hooks**: useState, useEffect, useCallback

### Browser Support

- **File API**: Modern browser File API support
- **XML Parsing**: Native XML parsing capabilities
- **Async/Await**: Modern JavaScript async support
- **Blob API**: Blob handling for file processing

## Future Enhancements

### Planned Features

1. **Batch Processing**: Parse multiple files at once
2. **Advanced Validation**: Enhanced settings validation
3. **Preview Generation**: Generate preset previews
4. **Settings Comparison**: Compare multiple presets
5. **Export Formats**: Export to different formats

### Performance Improvements

1. **Web Workers**: Background processing with web workers
2. **Streaming Parsing**: Stream large files
3. **Caching**: Cache parsed results
4. **Compression**: Handle compressed XMP files

### UX Enhancements

1. **Drag & Drop**: Drag and drop file support
2. **Progress Visualization**: Enhanced progress display
3. **Error Recovery**: Better error recovery options
4. **Settings Preview**: Preview parsed settings
5. **Batch Operations**: Multiple file processing

---

_This component is essential for the preset upload system in VISOR, providing robust XMP file parsing capabilities for Lightroom presets._
