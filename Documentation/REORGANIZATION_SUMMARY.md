# Directory Reorganization Summary

## Completed Changes

### 1. Created Route-Based Structure

Following SFG20 pattern, all pages have been moved to route-specific directories:

- `routes/home/` - Home page
- `routes/search/` - Search page
- `routes/preset/` - Preset detail
- `routes/filmsim/` - FilmSim detail
- `routes/profile/` - Profile pages
- `routes/upload/` - Upload pages
- `routes/auth/` - Authentication pages
- `routes/discussions/` - Discussion pages
- `routes/lists/` - List pages

### 2. Created Plugin Directory

- `plugins/` - Global plugins directory
  - `plugins/cards/` - Card plugins
  - `plugins/home/` - Home page plugins

### 3. Updated Configuration Files

**vite.config.ts:**
- Added path aliases matching SFG20 pattern
- Configured resolve.alias for clean imports

**tsconfig.json:**
- Added path mappings for TypeScript
- Configured baseUrl and paths

**lib/plugins/scanner.ts:**
- Updated to match SFG20 file naming patterns
- Supports `*.runtime.tsx`, `startup-main.tsx`, `*.app.tsx`, `*.lazy.tsx`

### 4. Updated App.tsx

- Changed all imports to use new route structure
- Updated route components to use new paths

## File Naming Conventions (SFG20 Pattern)

- **`*-route.tsx`** - Route components
- **`*.runtime.tsx`** - Runtime plugins (loaded when routes become active)
- **`startup-main.tsx`** - Startup plugins (loaded at app startup)
- **`*.app.tsx`** - App-level configuration
- **`*.lazy.tsx`** - Lazy-loaded plugins

## Path Aliases

All configured in `vite.config.ts` and `tsconfig.json`:

```typescript
lib/* → src/lib/*
routes/* → src/routes/*
plugins/* → src/plugins/*
components/* → src/components/*
hooks/* → src/hooks/*
graphql/* → src/graphql/*
context/* → src/context/*
utils/* → src/utils/*
types/* → src/types/*
config/* → src/config/*
```

## Next Steps

1. **Fix remaining imports** - Update all route files to use path aliases
2. **Move route-specific components** - Move components to their route directories where appropriate
3. **Update all imports** - Ensure all files use the new path aliases
4. **Test** - Verify all routes work correctly
5. **Clean up** - Remove old `pages/` directory once everything is migrated

## Migration Status

✅ Route structure created  
✅ Plugin directory created  
✅ Configuration files updated  
✅ App.tsx updated  
⚠️ Route file imports need updating (in progress)  
⚠️ Component imports need updating (in progress)  

## Notes

- Old `pages/` directory still exists for reference
- Some route files may still have relative imports that need updating
- Path aliases are configured but may need IDE restart to take effect

