# cfNote Theme System Documentation

This document outlines the theme system used throughout cfNote to enable consistent theming across components.

## Overview

The theme system is built on CSS variables and provides light, dark, and sepia themes. The system is designed to be:

- **Consistent**: One source of truth for theme definitions
- **Flexible**: Easy to add new themes or modify existing ones
- **Performant**: Uses CSS variables for efficient theme switching
- **Maintainable**: Clear separation of concerns between theme definition and usage

## Key Components

### 1. Theme Model (`app/models/theme.model.ts`)

This is the central location for all theme-related definitions:

- `Theme` enum: Defines available themes (`LIGHT`, `DARK`, `SEPIA`)
- `ThemeColors` interface: Defines semantic color properties
- `THEME_COLORS`: Color values for each theme
- `THEME_CSS_VARS`: Maps color properties to CSS variable names
- `THEME_COLOR_SCHEME`: Maps themes to CSS color-scheme values

### 2. Theme Variables (`styles.scss`)

CSS variables are defined for each theme at the `:root` level:

```scss
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  // ...more variables
}

:root.dark-theme {
  --bg-color: #1e293b;
  --text-color: #f3f4f6;
  // ...more variables
}
```

For each color, we also provide RGB values for use with alpha transparency:

```scss
--text-color: #333333;
--text-color-rgb: 51, 51, 51;
```

### 3. Theme Service (`app/services/theme.service.ts`)

Handles theme management:

- Stores/retrieves the selected theme
- Applies the theme to the document
- Sets CSS variables based on the selected theme
- Provides theme-related utility methods

### 4. Tailwind Integration (`tailwind.config.js`)

Tailwind is configured to use CSS variables through custom theme extensions:

```js
textColor: {
  skin: {
    base: 'var(--text-color)',
    muted: 'var(--text-muted-color)',
    // ...more colors
  },
},
```

## How to Use

### 1. Refer to Colors in Component Styles

Use CSS variables directly:

```scss
.my-component {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
```

For alpha transparency, use the RGB variants:

```scss
.overlay {
  background-color: rgba(var(--bg-color-rgb), 0.5);
}
```

### 2. Use Themed Utility Classes

For common components, use pre-defined themed classes:

```html
<div class="themed-card">...</div>
<input class="themed-input" />
<button class="themed-button">Submit</button>
```

### 3. Use Tailwind Classes

When using Tailwind, use the skin-prefixed utilities:

```html
<div class="bg-skin-base text-skin-base border-skin-base">...</div>
```

### 4. Access Theme in Components

If you need to access the current theme in a component:

```typescript
import { ThemeService } from '../services/theme.service';

// ...

constructor(private themeService: ThemeService) {
  this.themeService.currentTheme$.subscribe(theme => {
    // React to theme changes
  });
}

// Or use the inject function
private themeService = inject(ThemeService);
```

## Guidelines

1. **Don't** create new theme enums or duplicate color definitions
2. **Don't** use hardcoded colors - always reference CSS variables
3. **Don't** apply theme-specific logic in component templates
4. **Do** use semantic color variables when possible (e.g., `--text-color` instead of a hex value)
5. **Do** use the theme service for theme management
6. **Do** update the theme model when adding new colors

## Adding a New Theme

1. Add a new value to the `Theme` enum in `theme.model.ts`
2. Add color definitions to the `THEME_COLORS` object
3. Add CSS variables for the new theme in `styles.scss`
4. Update the theme cycle method in `ThemeService` if needed

## Troubleshooting

If theme changes are not reflected:

1. Check that all color references use CSS variables
2. Ensure the component is not using inline styles that override theme styles
3. Verify that the theme service is properly applying the theme 
