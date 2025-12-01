# SFG20 Plugin System Migration Plan

## Overview

This document outlines the complete migration of the VISOR frontend to the SFG20 plugin system architecture. The migration follows a **phased approach** to minimize risk and allow incremental testing.

## Current State Analysis

### ✅ Already Using Plugin System
- **Home Route** (`routes/home/home-route.tsx`) - Uses `HomePageHero`, `HomePageTile`, `HomePageFeaturedSection` slots
- **FilmSim Detail Route** (`routes/filmsim/filmsim-detail-route.tsx`) - Uses `FilmSimDetailToolbar`, `FilmSimDetailSection` slots
- **FilmSim Card** (`components/cards/FilmSimCard.tsx`) - Uses `FilmSimCardOverlay`, `FilmSimCardFooter` slots
- **Plugins** - Already organized in plugin directories following SFG20 pattern

### ❌ Needs Conversion

#### Routes (17 routes)
1. `routes/search/search-route.tsx` - Needs `SearchFilters`, `SearchResultsHeader` slots
2. `routes/preset/preset-detail-route.tsx` - Needs `PresetDetailToolbar`, `PresetDetailSection` slots
3. `routes/profile/profile-route.tsx` - Needs `ProfileHeader`, `ProfileTabs`, `ProfileTabPanels` slots
4. `routes/profile/public-profile-route.tsx` - Needs profile slots
5. `routes/upload/upload-route.tsx` - Needs `UploadToolbar`, `UploadFormSection` slots
6. `routes/upload/upload-preset-route.tsx` - Needs upload slots
7. `routes/upload/upload-filmsim-route.tsx` - Needs upload slots
8. `routes/auth/login-route.tsx` - May need auth-specific slots
9. `routes/auth/register-route.tsx` - May need auth-specific slots
10. `routes/auth/email-verification-route.tsx` - May need auth-specific slots
11. `routes/lists/my-lists-route.tsx` - Needs list slots
12. `routes/lists/browse-lists-route.tsx` - Needs list slots
13. `routes/lists/list-detail-route.tsx` - Needs `ListDetailHeader`, `ListDetailToolbar`, `ListDetailSection` slots
14. `routes/lists/create-list-route.tsx` - Needs list slots
15. `routes/discussions/discussions-route.tsx` - Needs `DiscussionFilters`, `DiscussionListHeader` slots
16. `routes/discussions/discussion-detail-route.tsx` - Needs `DiscussionDetailToolbar`, `DiscussionDetailSection` slots
17. `routes/discussions/create-discussion-route.tsx` - Needs discussion slots
18. `routes/notifications-route.tsx` - May need notification slots
19. `routes/not-found-route.tsx` - Simple, may not need slots

#### Components (Need One-Component-Per-File Audit)
- All components in `components/` directory need verification
- Check for multiple components in single files
- Extract components to separate files following kebab-case naming

#### Pages Directory (Legacy)
- `pages/` directory contains old page components
- These should be removed or converted to route components
- Verify routes are not importing from `pages/`

## Migration Phases

### Phase 1: Foundation & Audit (Prerequisites)
**Goal:** Establish baseline and identify all work needed

#### Tasks:
1. **Component Audit**
   - [ ] Scan all files in `components/` directory
   - [ ] Identify files with multiple component exports
   - [ ] Create list of components that need extraction
   - [ ] Document component dependencies

2. **Route Audit**
   - [ ] Review all route files
   - [ ] Identify which routes need slot conversion
   - [ ] Document current component usage in each route
   - [ ] Identify missing slots in `slot-definitions.ts`

3. **Slot Definitions Review**
   - [ ] Review `lib/slots/slot-definitions.ts`
   - [ ] Add missing slots for all routes
   - [ ] Document slot usage patterns

4. **Event Definitions Review**
   - [ ] Review `lib/events/event-definitions.ts`
   - [ ] Identify events needed for component communication
   - [ ] Document event usage patterns

**Deliverable:** Complete audit document with component and route conversion lists

---

### Phase 2: Component Extraction (One-Component-Per-File)
**Goal:** Ensure all components follow SFG20 one-component-per-file convention

#### Tasks:
1. **Audit Components**
   - [ ] Scan `components/` directory for multi-component files
   - [ ] Create extraction plan for each file

2. **Extract Components**
   - [ ] For each file with multiple components:
     - Extract each component to its own file (kebab-case naming)
     - Update imports in parent components
     - Verify no breaking changes

3. **Verify Component Structure**
   - [ ] All components in separate files
   - [ ] All files use kebab-case naming
   - [ ] All imports updated correctly
   - [ ] No linting errors

**Deliverable:** All components follow one-component-per-file rule

---

### Phase 3: Preset Detail Route (Pilot)
**Goal:** Convert preset detail route as a pilot to establish patterns

#### Tasks:
1. **Create Preset Detail Plugin**
   - [ ] Create `plugins/preset-detail-defaults/` directory
   - [ ] Extract all preset detail sections to wrapper components
   - [ ] Create `preset-detail-defaults.runtime.tsx` with plugin registrations
   - [ ] Follow pattern from `filmsim-detail-defaults` plugin

2. **Update Preset Detail Route**
   - [ ] Refactor `routes/preset/preset-detail-route.tsx` to use slots
   - [ ] Replace hardcoded components with `PresetDetailToolbar.Slot` and `PresetDetailSection.Slot`
   - [ ] Pass context via slot props

3. **Create Preset Card Plugin**
   - [ ] Create `plugins/preset-card-defaults/` directory
   - [ ] Extract preset card actions to plugin
   - [ ] Update `PresetCard` component to use slots

4. **Test & Verify**
   - [ ] Test preset detail page functionality
   - [ ] Verify all sections render correctly
   - [ ] Verify plugin system works
   - [ ] Fix any issues

**Deliverable:** Preset detail route fully converted and tested

---

### Phase 4: Search & Profile Routes
**Goal:** Convert search and profile routes to plugin system

#### Tasks:
1. **Search Route**
   - [ ] Create `plugins/search-defaults/` directory
   - [ ] Extract search filters to plugin
   - [ ] Extract search results header to plugin
   - [ ] Update `routes/search/search-route.tsx` to use slots
   - [ ] Test search functionality

2. **Profile Routes**
   - [ ] Create `plugins/profile-defaults/` directory
   - [ ] Extract profile header to plugin
   - [ ] Extract profile tabs to plugin
   - [ ] Extract profile tab panels to plugin
   - [ ] Update `routes/profile/profile-route.tsx` to use slots
   - [ ] Update `routes/profile/public-profile-route.tsx` to use slots
   - [ ] Test profile pages

**Deliverable:** Search and profile routes converted and tested

---

### Phase 5: Upload Routes
**Goal:** Convert upload routes to plugin system

#### Tasks:
1. **Upload Route**
   - [ ] Create `plugins/upload-defaults/` directory
   - [ ] Extract upload toolbar to plugin
   - [ ] Extract upload form sections to plugin
   - [ ] Update `routes/upload/upload-route.tsx` to use slots

2. **Upload Preset Route**
   - [ ] Create `plugins/upload-preset-defaults/` directory
   - [ ] Extract preset upload form sections to plugin
   - [ ] Update `routes/upload/upload-preset-route.tsx` to use slots

3. **Upload FilmSim Route**
   - [ ] Create `plugins/upload-filmsim-defaults/` directory
   - [ ] Extract filmsim upload form sections to plugin
   - [ ] Update `routes/upload/upload-filmsim-route.tsx` to use slots

4. **Test & Verify**
   - [ ] Test all upload routes
   - [ ] Verify form functionality
   - [ ] Fix any issues

**Deliverable:** All upload routes converted and tested

---

### Phase 6: List Routes
**Goal:** Convert list routes to plugin system

#### Tasks:
1. **List Detail Route**
   - [ ] Create `plugins/list-detail-defaults/` directory
   - [ ] Extract list detail header to plugin
   - [ ] Extract list detail toolbar to plugin
   - [ ] Extract list detail sections to plugin
   - [ ] Update `routes/lists/list-detail-route.tsx` to use slots

2. **List Card Plugin**
   - [ ] Create `plugins/list-card-defaults/` directory
   - [ ] Extract list card actions to plugin
   - [ ] Update `ListCard` component to use slots

3. **Other List Routes**
   - [ ] Update `routes/lists/my-lists-route.tsx`
   - [ ] Update `routes/lists/browse-lists-route.tsx`
   - [ ] Update `routes/lists/create-list-route.tsx`

4. **Test & Verify**
   - [ ] Test all list routes
   - [ ] Verify list functionality
   - [ ] Fix any issues

**Deliverable:** All list routes converted and tested

---

### Phase 7: Discussion Routes
**Goal:** Convert discussion routes to plugin system

#### Tasks:
1. **Discussion List Route**
   - [ ] Create `plugins/discussion-list-defaults/` directory
   - [ ] Extract discussion filters to plugin
   - [ ] Extract discussion list header to plugin
   - [ ] Update `routes/discussions/discussions-route.tsx` to use slots

2. **Discussion Detail Route**
   - [ ] Create `plugins/discussion-detail-defaults/` directory
   - [ ] Extract discussion detail toolbar to plugin
   - [ ] Extract discussion detail sections to plugin
   - [ ] Update `routes/discussions/discussion-detail-route.tsx` to use slots

3. **Create Discussion Route**
   - [ ] Create `plugins/create-discussion-defaults/` directory
   - [ ] Extract create discussion form sections to plugin
   - [ ] Update `routes/discussions/create-discussion-route.tsx` to use slots

4. **Test & Verify**
   - [ ] Test all discussion routes
   - [ ] Verify discussion functionality
   - [ ] Fix any issues

**Deliverable:** All discussion routes converted and tested

---

### Phase 8: Auth Routes (Optional)
**Goal:** Convert auth routes if needed (may not require slots)

#### Tasks:
1. **Review Auth Routes**
   - [ ] Determine if auth routes need plugin system
   - [ ] Auth routes may be simple enough to not need slots
   - [ ] If needed, create auth plugins

2. **Convert if Needed**
   - [ ] Create auth plugin directories if required
   - [ ] Update auth routes to use slots if needed

**Deliverable:** Auth routes reviewed and converted if needed

---

### Phase 9: Cleanup & Finalization
**Goal:** Remove legacy code and finalize migration

#### Tasks:
1. **Remove Legacy Pages**
   - [ ] Verify no routes import from `pages/` directory
   - [ ] Delete `pages/` directory
   - [ ] Update any remaining imports

2. **Verify All Routes**
   - [ ] All routes use plugin system
   - [ ] All components follow one-component-per-file
   - [ ] All plugins properly organized

3. **Documentation**
   - [ ] Update README files
   - [ ] Document plugin patterns
   - [ ] Create developer guide

4. **Final Testing**
   - [ ] Full application testing
   - [ ] Verify all routes work
   - [ ] Verify plugin system works
   - [ ] Fix any remaining issues

**Deliverable:** Complete migration, all legacy code removed

---

## Plugin Organization Pattern

### Directory Structure
```
plugins/
├── preset-detail-defaults/
│   ├── preset-detail-defaults.runtime.tsx
│   ├── preset-header-wrapper.tsx
│   ├── preset-description-wrapper.tsx
│   ├── preset-before-after-wrapper.tsx
│   └── ... (one component per file)
├── preset-card-defaults/
│   ├── preset-card-defaults.runtime.tsx
│   └── add-to-list-button.tsx
└── ... (one plugin per directory)
```

### Naming Conventions
- Plugin directories: `kebab-case` (e.g., `preset-detail-defaults`)
- Runtime files: `plugin-name.runtime.tsx`
- Component files: `kebab-case.tsx` (e.g., `preset-header-wrapper.tsx`)
- Component exports: `PascalCase` (e.g., `PresetHeaderWrapper`)

### Slot Usage Pattern
```typescript
// In route file
<PresetDetailToolbar.Slot
  preset={preset}
  isOwner={isOwner}
  onMenuOpen={handleMenuOpen}
/>

<PresetDetailSection.Slot
  preset={preset}
  currentUser={currentUser}
/>
```

### Plugin Registration Pattern
```typescript
// In plugin-name.runtime.tsx
import { PresetDetailToolbar } from "lib/slots/slot-definitions";
import { PresetHeaderWrapper } from "./preset-header-wrapper";

PresetDetailToolbar.plug(
  <PresetHeaderWrapper key="preset-header" />,
  10
);
```

## Component Extraction Pattern

### Before (Multiple Components)
```typescript
// preset-detail.tsx
export function PresetHeader({ preset }) { ... }
export function PresetDescription({ preset }) { ... }
export function PresetActions({ preset }) { ... }
```

### After (One Component Per File)
```typescript
// preset-header.tsx
export function PresetHeader({ preset }) { ... }

// preset-description.tsx
export function PresetDescription({ preset }) { ... }

// preset-actions.tsx
export function PresetActions({ preset }) { ... }
```

## Verification Checklist

After each phase:
- [ ] All components follow one-component-per-file rule
- [ ] All files use kebab-case naming
- [ ] All plugins properly organized in directories
- [ ] All runtime files follow naming convention
- [ ] All routes use slots instead of hardcoded components
- [ ] All imports use path aliases
- [ ] No linting errors
- [ ] Functionality tested and working
- [ ] No breaking changes

## Risk Mitigation

1. **Incremental Migration**: Phased approach allows testing at each step
2. **Pilot Phase**: Preset detail route serves as pilot to establish patterns
3. **Backup Strategy**: Git commits after each phase for easy rollback
4. **Testing**: Test each route after conversion before moving to next phase
5. **Documentation**: Document patterns as we go

## Estimated Timeline

- **Phase 1**: 1-2 days (Audit)
- **Phase 2**: 2-3 days (Component Extraction)
- **Phase 3**: 2-3 days (Preset Detail Pilot)
- **Phase 4**: 2-3 days (Search & Profile)
- **Phase 5**: 2-3 days (Upload Routes)
- **Phase 6**: 2-3 days (List Routes)
- **Phase 7**: 2-3 days (Discussion Routes)
- **Phase 8**: 1 day (Auth Routes - Optional)
- **Phase 9**: 1-2 days (Cleanup)

**Total**: ~15-25 days (depending on complexity and testing)

## Notes

- Start with Phase 1 (Audit) to get complete picture
- Use Phase 3 (Preset Detail) as template for other routes
- Test thoroughly after each phase
- Document any deviations from patterns
- Keep this document updated as migration progresses

