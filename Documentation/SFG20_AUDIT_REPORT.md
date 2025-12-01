# SFG20 Plugin System Migration - Audit Report

**Date:** Generated during Phase 1  
**Status:** Foundation Audit Complete

## Executive Summary

This audit identifies all components, routes, and infrastructure that need conversion to the SFG20 plugin system architecture. The migration will follow a phased approach with 9 phases.

## 1. Component Audit

### Total Components
- **84 component files** in `client/src/components/` directory
- All components appear to follow one-component-per-file pattern (initial scan shows no multi-component files)

### Component Structure Analysis

#### Components Already Using Slots
- ✅ `components/cards/FilmSimCard.tsx` - Uses `FilmSimCardOverlay`, `FilmSimCardFooter`

#### Components That May Need Slot Integration
- `components/cards/PresetCard.tsx` - Should use `PresetCardOverlay`, `PresetCardFooter`
- `components/cards/ListCard.tsx` - Should use `ListCardOverlay`, `ListCardFooter`
- `components/layout/Navbar.tsx` - Should use `NavbarLeft`, `NavbarRight`, `NavbarCenter`

#### Component Categories
1. **Cards** (6 files) - Need slot integration
2. **Dialogs** (3 files) - May not need slots (modal components)
3. **Discussions** (14 files) - May need slot integration for extensibility
4. **Filmsims** (7 files) - Already partially using slots
5. **Forms** (9 files) - May need slot integration for form sections
6. **Layout** (3 files) - Navbar needs slot integration
7. **Lists** (1 file) - May need slot integration
8. **Media** (5 files) - Utility components, may not need slots
9. **Presets** (11 files) - Need slot integration for preset detail
10. **Settings** (9 files) - May need slot integration
11. **UI** (15 files) - Mix of utility and slot-eligible components

### Action Items for Component Extraction
- ✅ Most components already follow one-component-per-file
- ⚠️ Need to verify no internal helper components that should be extracted
- ⚠️ Need to check for components that could benefit from slot system

## 2. Route Audit

### Total Routes
- **21 route files** in `client/src/routes/` directory

### Routes Already Using Plugin System
- ✅ `routes/home/home-route.tsx` - Uses `HomePageHero`, `HomePageTile`, `HomePageFeaturedSection`
- ✅ `routes/filmsim/filmsim-detail-route.tsx` - Uses `FilmSimDetailToolbar`, `FilmSimDetailSection`

### Routes Needing Conversion (19 routes)

#### High Priority (Detail/Complex Routes)
1. **`routes/preset/preset-detail-route.tsx`** ⭐ PILOT
   - Needs: `PresetDetailToolbar`, `PresetDetailSection`
   - Status: Complex route with many sections
   - Priority: Phase 3 (Pilot)

2. **`routes/lists/list-detail-route.tsx`**
   - Needs: `ListDetailHeader`, `ListDetailToolbar`, `ListDetailSection`
   - Status: Complex route with content sections
   - Priority: Phase 6

3. **`routes/discussions/discussion-detail-route.tsx`**
   - Needs: `DiscussionDetailToolbar`, `DiscussionDetailSection`
   - Status: Complex route with thread sections
   - Priority: Phase 7

#### Medium Priority (List/Collection Routes)
4. **`routes/search/search-route.tsx`**
   - Needs: `SearchFilters`, `SearchResultsHeader`
   - Status: Has filters and results header
   - Priority: Phase 4

5. **`routes/discussions/discussions-route.tsx`**
   - Needs: `DiscussionFilters`, `DiscussionListHeader`
   - Status: Has filters and list header
   - Priority: Phase 7

6. **`routes/lists/my-lists-route.tsx`**
   - Needs: List-specific slots (may be simple)
   - Status: User's lists view
   - Priority: Phase 6

7. **`routes/lists/browse-lists-route.tsx`**
   - Needs: List-specific slots (may be simple)
   - Status: Browse all lists
   - Priority: Phase 6

#### Profile Routes
8. **`routes/profile/profile-route.tsx`**
   - Needs: `ProfileHeader`, `ProfileTabs`, `ProfileTabPanels`
   - Status: Complex profile page with tabs
   - Priority: Phase 4

9. **`routes/profile/public-profile-route.tsx`**
   - Needs: `ProfileHeader`, `ProfileTabs`, `ProfileTabPanels`
   - Status: Public profile view
   - Priority: Phase 4

#### Upload Routes
10. **`routes/upload/upload-route.tsx`**
    - Needs: `UploadToolbar`, `UploadFormSection`
    - Status: Main upload page
    - Priority: Phase 5

11. **`routes/upload/upload-preset-route.tsx`**
    - Needs: `UploadFormSection` (preset-specific)
    - Status: Preset upload form
    - Priority: Phase 5

12. **`routes/upload/upload-filmsim-route.tsx`**
    - Needs: `UploadFormSection` (filmsim-specific)
    - Status: FilmSim upload form
    - Priority: Phase 5

#### Create Routes
13. **`routes/lists/create-list-route.tsx`**
    - Needs: List creation form slots
    - Status: Create list form
    - Priority: Phase 6

14. **`routes/discussions/create-discussion-route.tsx`**
    - Needs: Discussion creation form slots
    - Status: Create discussion form
    - Priority: Phase 7

#### Auth Routes (Low Priority - May Not Need Slots)
15. **`routes/auth/login-route.tsx`**
    - Status: Simple login form
    - Priority: Phase 8 (Review if needed)

16. **`routes/auth/register-route.tsx`**
    - Status: Simple registration form
    - Priority: Phase 8 (Review if needed)

17. **`routes/auth/email-verification-route.tsx`**
    - Status: Simple verification page
    - Priority: Phase 8 (Review if needed)

#### Simple Routes (May Not Need Slots)
18. **`routes/notifications-route.tsx`**
    - Status: Simple notifications list
    - Priority: Phase 8 (Review if needed)

19. **`routes/not-found-route.tsx`**
    - Status: Simple 404 page
    - Priority: Phase 8 (Review if needed)

## 3. Slot Definitions Review

### Existing Slots (✅ Already Defined)
- Home Page: `HomePageHero`, `HomePageTile`, `HomePageFeaturedSection`
- Cards: `FilmSimCardOverlay`, `FilmSimCardFooter`, `PresetCardOverlay`, `PresetCardFooter`, `ListCardOverlay`, `ListCardFooter`
- Detail Pages: `FilmSimDetailToolbar`, `FilmSimDetailSection`, `PresetDetailToolbar`, `PresetDetailSection`, `DiscussionDetailToolbar`, `DiscussionDetailSection`
- Navigation: `NavbarLeft`, `NavbarRight`, `NavbarCenter`
- Search: `SearchFilters`, `SearchResultsHeader`
- Profile: `ProfileHeader`, `ProfileTabs`, `ProfileTabPanels`
- Upload: `UploadToolbar`, `UploadFormSection`
- Lists: `ListDetailHeader`, `ListDetailToolbar`, `ListDetailSection`
- Discussions: `DiscussionFilters`, `DiscussionListHeader`, `DiscussionThreadActions`
- Settings: `SettingsTabs`, `SettingsTabPanels`

### Missing Slots (⚠️ Need to Add)
1. **Auth Slots** (if needed)
   - `AuthFormSection` - For login/register forms
   - `AuthHeader` - For auth page headers

2. **List Routes Slots** (if needed)
   - `ListListHeader` - For list browsing pages
   - `ListListFilters` - For list filtering

3. **Upload Route-Specific Slots** (if needed)
   - `UploadPresetFormSection` - Preset-specific upload sections
   - `UploadFilmSimFormSection` - FilmSim-specific upload sections

4. **Notification Slots** (if needed)
   - `NotificationHeader` - Notification page header
   - `NotificationFilters` - Notification filtering

### Recommendation
- Most slots are already defined
- Add slots only as needed during route conversion
- Keep slots minimal - only add when extensibility is needed

## 4. Event Definitions Review

### Existing Events (✅ Already Defined)
- Content: `FilmSimChanged`, `PresetChanged`, `ListChanged`, `ContentRefresh`
- User: `UserLoggedIn`, `UserLoggedOut`, `UserProfileUpdated`
- Navigation: `Navigate`, `SearchPerformed`
- UI: `DialogOpen`, `DialogClose`, `ShowNotification`
- Lists: `ItemAddedToList`, `ItemRemovedFromList`
- Discussions: `DiscussionChanged`, `PostChanged`, `CommentChanged`
- Upload: `UploadStarted`, `UploadCompleted`, `UploadFailed`
- Notifications: `NotificationsUpdated`, `NotificationRead`

### Missing Events (⚠️ May Need to Add)
1. **Route-Specific Events**
   - `RouteChanged` - When route navigation occurs
   - `RouteLoaded` - When route component mounts

2. **Form Events**
   - `FormSubmitted` - Generic form submission
   - `FormValidationFailed` - Form validation errors

3. **Search Events** (Already have `SearchPerformed`)
   - May need more granular search events

### Recommendation
- Current event definitions are comprehensive
- Add events only as needed during implementation
- Events should be used for cross-component communication, not for simple prop passing

## 5. Legacy Code Audit

### Pages Directory
- **21 files** in `client/src/pages/` directory
- These appear to be legacy page components
- Need to verify routes are not importing from `pages/`
- Should be removed in Phase 9

### Files to Check
- Verify no routes import from `pages/`
- Verify all routes use route components
- Document any dependencies on `pages/` directory

## 6. Plugin Organization Audit

### Current Plugin Structure ✅
```
plugins/
├── toggle-button/
│   └── toggle-button.runtime.tsx
├── filmsim-detail-defaults/
│   ├── filmsim-detail-defaults.runtime.tsx
│   └── [10 wrapper components]
└── filmsim-card-defaults/
    ├── filmsim-card-defaults.runtime.tsx
    └── add-to-list-button.tsx
```

### Plugins Needed (Based on Route Conversion)
1. `preset-detail-defaults/` - Phase 3
2. `preset-card-defaults/` - Phase 3
3. `search-defaults/` - Phase 4
4. `profile-defaults/` - Phase 4
5. `upload-defaults/` - Phase 5
6. `upload-preset-defaults/` - Phase 5
7. `upload-filmsim-defaults/` - Phase 5
8. `list-detail-defaults/` - Phase 6
9. `list-card-defaults/` - Phase 6
10. `discussion-list-defaults/` - Phase 7
11. `discussion-detail-defaults/` - Phase 7
12. `create-discussion-defaults/` - Phase 7

## 7. Import Path Audit

### Current State
- Path aliases configured in `vite.config.ts` and `tsconfig.json`
- Routes use path aliases (e.g., `routes/home/home-route`)
- Components use path aliases (e.g., `components/ui/...`)

### Action Items
- ✅ Path aliases already configured
- ⚠️ Verify all imports use path aliases (not relative paths)
- ⚠️ Update any remaining relative imports

## 8. Testing Strategy

### Per-Phase Testing
- Test each route after conversion
- Verify plugin system works
- Verify no breaking changes
- Test slot injection
- Test event communication

### Final Testing
- Full application testing
- All routes functional
- All plugins working
- No console errors
- Performance acceptable

## 9. Risk Assessment

### Low Risk
- Component extraction (most already follow pattern)
- Slot definitions (most already defined)
- Event definitions (comprehensive already)

### Medium Risk
- Route conversion (many routes to convert)
- Plugin organization (need to create many plugins)
- Testing (need thorough testing at each phase)

### High Risk
- Breaking changes during conversion
- Missing functionality after conversion
- Performance issues with plugin system

### Mitigation
- Phased approach allows incremental testing
- Pilot phase (Preset Detail) establishes patterns
- Git commits after each phase for rollback
- Comprehensive testing after each conversion

## 10. Recommendations

### Immediate Actions
1. ✅ Complete Phase 1 audit (this document)
2. Start Phase 2: Component extraction (if needed)
3. Begin Phase 3: Preset Detail pilot conversion

### Best Practices
1. Follow established patterns from `filmsim-detail-defaults` plugin
2. One component per file always
3. Kebab-case naming throughout
4. Use path aliases, not relative paths
5. Test thoroughly after each phase

### Documentation
1. Update README files as we go
2. Document plugin patterns
3. Create developer guide
4. Update this audit as migration progresses

## Summary Statistics

- **Total Components:** 84 files
- **Total Routes:** 21 files
- **Routes Using Slots:** 2 (Home, FilmSim Detail)
- **Routes Needing Conversion:** 19
- **Plugins Existing:** 3
- **Plugins Needed:** ~12
- **Slots Defined:** 25
- **Slots May Need:** ~5
- **Events Defined:** 17
- **Events May Need:** ~3

## Next Steps

1. ✅ Phase 1 Complete - Foundation Audit
2. → Phase 2: Component Extraction (if needed)
3. → Phase 3: Preset Detail Route (Pilot)
4. → Continue with remaining phases

---

**Audit Complete** - Ready to proceed with Phase 2

