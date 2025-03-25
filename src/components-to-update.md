# Components That Need Theme System Updates

## 1. notes-list-container.component.ts

**Current Theme Implementation:**
- Imports Theme from theme-selector.component instead of models directory
- Uses direct theme checks in the template (`currentTheme === Theme.LIGHT`)
- Applies different CSS classes based on theme conditions
- Contains hardcoded theme-specific colors in styles
- Uses ngClass directives for conditional styling

**Required Changes:**
- Update import to use centralized Theme enum from models directory
- Remove direct theme checks in templates
- Replace conditional styling with CSS variables
- Create themed utility classes for buttons and containers
- Remove hardcoded color values from styles

## Implementation Plan:

1. Update the import statements to use the centralized Theme model
2. Refactor the template to remove direct theme checks
3. Update styles to use CSS variables instead of hardcoded colors
4. Remove the Theme enum from component to reduce duplication
5. Implement proper accessibility features 
