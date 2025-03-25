# Theme System Overhaul Plan

## Issues Identified
- Multiple Theme enum declarations scattered across codebase
- Inconsistent use of CSS variables for theming
- Direct color values used instead of theme variables
- Duplicated theme logic in components
- Inefficient theme application method
- Inconsistent styling conventions

## Implementation Plan

### 1. Consolidate Theme Definitions
- [x] Create a single `theme.model.ts` file in the models directory ✅
- [x] Move Theme enum definition to this file ✅
- [x] Include theme color palette definitions ✅
- [x] Export all theme-related types and constants from this file ✅

### 2. Enhance CSS Variables System
- [x] Update `styles.scss` with comprehensive CSS variables for all theme colors ✅
- [x] Add semantic CSS variables (e.g., `--primary-text`, `--secondary-bg`, etc.) ✅
- [x] Ensure variables are properly defined for all themes (light, dark, sepia) ✅
- [x] Document CSS variable naming conventions ✅

### 3. Refactor Theme Service
- [x] Update ThemeService to use the centralized Theme enum ✅
- [x] Enhance the service to set all CSS variables based on the selected theme ✅
- [x] Remove direct DOM class manipulation where possible ✅
- [x] Add methods to easily access theme properties ✅

### 4. Update Components
- [x] Remove individual Theme enum imports ✅
- [x] Eliminate direct theme checks in component templates ✅
- [x] Replace hardcoded color values with CSS variable references ✅
- [x] Standardize component theming approach ✅
- [x] Remove duplicated theme subscription logic ✅

### 5. Standardize Tailwind Usage
- [x] Update tailwind.config.js to better integrate with CSS variables ✅
- [x] Create theme-specific utility classes where needed ✅
- [x] Ensure consistency between Tailwind theme colors and CSS variables ✅
- [x] Document the preferred approach for using Tailwind with themes ✅

### 6. Implement Theme Transitions
- [x] Add proper transition effects when switching themes ✅
- [x] Ensure all themed elements transition smoothly ✅
- [x] Test transitions across all components ✅

### 7. Testing & Validation
- [x] Test theme switching across all components ✅
- [x] Validate accessibility for all themes ✅
- [x] Verify theme persistence works correctly ✅
- [x] Check dark mode media query support ✅

### 8. Documentation
- [x] Document the new theming system ✅
- [x] Create theme usage guidelines for future development ✅
- [x] Add comments to clarify theme implementation in key files ✅

### 9. Update Remaining Components
- [x] Update NotesListContainerComponent to use the new theme system ✅
- [x] Test component to ensure it properly responds to theme changes ✅
- [x] Validate accessibility of updated components ✅

## Completed Tasks
- Created centralized theme model in `models/theme.model.ts`
- Enhanced CSS variables system in `styles.scss`
- Refactored theme service to use centralized theme model
- Updated components to use CSS variables
- Standardized Tailwind configuration with CSS variable integration
- Added RGB variants of CSS variables for alpha transparency
- Created comprehensive documentation in `docs/theme-system.md`
- Updated NotesListContainerComponent to use CSS variables and follow accessibility best practices
- Added focus-visible styles for keyboard navigation
- Removed direct theme checks from component templates
- Added theme transitions for smooth theme switching

## Next Steps
- Consider creating a ThemeContext or theme directive to simplify component theme access
- Add unit tests for theme service and component theming
