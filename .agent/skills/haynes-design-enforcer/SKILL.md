---
name: haynes-design-enforcer
description: Enforces the architectural and visual design system of the Haynes Consult platform.
---

# Haynes UI Consistency & Design System Enforcer

**Description**: This skill enforces the exact visual standards, typography guidelines, CSS variable usage, and component structures specific to the Haynes Consult website theme. 

## Key Requirements & Rules

- **Use Predefined CSS Variables**: Never hardcode colors like `#0D2B7E` or `#ffffff` for standard UI text. Always use predefined CSS variables:
  - `var(--navy)` for dark text and deep backgrounds.
  - `var(--royal)` and `var(--sky)` for accents and secondary text.
  - `var(--white)`, `var(--ice)`, or `var(--body-bg)` for lighter sections.
- **Maintain Contrast:** The standard background is a light ice-blue color. Text on light backgrounds MUST be `var(--navy)` or `var(--royal)` to ensure proper contrast. Avoid using `color: #ffffff;` unless the text is placed on a dark background or dark gradient (like `var(--navy)`).
- **Glassmorphism Aesthetic**: Use established classes like `.glass-card` for transparent, card-like components. Do not invent new card styling rules if a glass card is appropriate. 
- **Uniform Navigation**: Ensure any newly created or modified `.html` pages include the exact, uniform `<nav class="nav" id="nav">` block containing the dropdown menu structure found in `index.html`. 

## Best Practices / Workflow

1. **Check the Environment**: Before adding new styles to a page or component, refer to `src/style.css` to verify if a relevant variable or utility class already exists.
2. **Review Target Contrast**: Identify the background of the target element. If the background evaluates to a light color, format text colors using dark variables like `var(--navy)`. 
3. **Verify Typography Consistency**: Ensure headers utilize `var(--font-head)` (Montserrat) and body text utilizes `var(--font-body)` (Inter).
4. **Copy Standard Layouts**: When scaffolding new service pages (e.g., `services/new-service.html`), copy the exact `head` block, `nav` block, and `footer` from an existing perfectly-styled page (such as `web-development.html` or `digital-services.html`) to ensure 1:1 parity with the global design.

## Examples

### Incorrect Pattern:

```css
.my-new-section {
    background-color: #f5f9ff;
}
.my-new-section h2 {
    font-family: 'Helvetica', sans-serif;
    color: #0d2b7e; /* Hardcoded hex! */
    margin-bottom: 20px;
}
```

### Correct Pattern:

```css
.my-new-section {
    background: var(--body-bg); /* Use token */
}
.my-new-section h2 {
    font-family: var(--font-head); /* Use token */
    color: var(--navy); /* Use token */
    margin-bottom: 20px;
}
```

## Triggers
- "Create a new page for Haynes Consult"
- "Fix the styling on..."
- "Add a new section to..."
- "The color looks wrong on the text..."
- "Make the navigation consistent"
