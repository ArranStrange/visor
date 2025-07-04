# Comprehensive XMP Settings Migration

This migration adds support for all comprehensive Adobe Lightroom XMP settings to the preset system.

## What's New

The backend now supports all the comprehensive XMP settings that the frontend parser extracts:

### Camera & Profile Metadata

- `cameraProfileDigest` - Camera profile digest
- `profileName` - Profile name
- `lookTableName` - Look table name

### Enhanced Basic Settings

- `texture` - Texture adjustment
- Enhanced `grain` settings (frequency, roughness)
- Enhanced `vignette` settings (midpoint, feather, roundness, style)
- Complete `colorAdjustments` for all 8 color channels (red, orange, yellow, green, aqua, blue, purple, magenta)
- Enhanced `noiseReduction` (colorDetail, colorSmoothness)
- New detail settings (sharpenRadius, sharpenDetail, sharpenEdgeMasking, luminanceSmoothing, luminanceDetail, luminanceContrast)

### Color Grading (New Format)

- `colorGrading` - Complete color grading settings with shadow, midtone, highlight, and global adjustments
- Perceptual color grading option

### Lens Corrections

- `lensCorrections` - Lens profile corrections, manual distortion, perspective upright, auto lateral CA

### Optics

- `optics` - Chromatic aberration removal, vignette amount and midpoint

### Transform (Geometry)

- `transform` - All perspective and geometry adjustments

### Effects (Post-crop)

- `effects` - Post-crop vignette and grain settings

### Calibration

- `calibration` - Camera calibration parameters

### Crop & Orientation

- `crop` - Crop dimensions and angle
- `orientation` - Image orientation

### Metadata

- `metadata` - Rating, label, title, creator, date created

### Other

- `hasSettings` - Whether the preset has settings
- `rawFileName` - Original raw file name
- `snapshot` - Snapshot name

## Running the Migration

### Prerequisites

- MongoDB database running
- Node.js installed
- All dependencies installed (`npm install`)

### Steps

1. **Backup your database** (recommended)

   ```bash
   mongodump --db your_database_name --out ./backup
   ```

2. **Run the migration script**

   ```bash
   node migrate-preset-schema.js
   ```

3. **Verify the migration**
   - Check the console output for any errors
   - Verify that presets have the new fields by querying the database

### What the Migration Does

The migration script:

1. Connects to your MongoDB database
2. Finds all existing presets
3. Adds missing fields with default values
4. Updates existing settings objects with new fields
5. Reports the number of presets updated

### Default Values

All new fields are initialized with sensible defaults:

- Numeric fields: `0`
- Boolean fields: `false`
- String fields: `null` or appropriate defaults
- Object fields: Empty objects with default values

## GraphQL Schema Updates

The GraphQL schema has been updated to include:

- New types for all comprehensive settings
- Input types for mutations
- Updated Preset type with all new fields
- Updated mutations to accept all new parameters

## Frontend Integration

The frontend XMP parser now extracts all these settings, and the backend is ready to receive and store them. The `uploadPreset` mutation accepts all the new comprehensive settings parameters.

## Testing

After running the migration:

1. **Test preset creation** with comprehensive settings
2. **Test preset retrieval** to ensure all fields are returned
3. **Test preset updates** with new fields
4. **Verify GraphQL queries** work with new schema

## Rollback

If you need to rollback:

1. Restore from your database backup
2. Revert the code changes
3. Restart your application

## Notes

- The migration is safe to run multiple times (idempotent)
- Existing presets will continue to work normally
- New presets can use all the comprehensive settings
- The migration preserves all existing data
