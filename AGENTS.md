# KoncoKemo AI Studio Agent Project Rules

## 🎨 Color Palette & Theming Constraints
- **Primary Color Variables:** You MUST use the defined `--color-primary-*` (from `primary-50` to `primary-900`) CSS custom properties available in `src/index.css` via Tailwind for ALL primary actions, brand elements, and interaction states.
- **Unified Identity:** Adhere strictly to the *landing page's established purple-based palette*. ALL visual components across the application (including administrative panel pages, buttons, and interaction surfaces) must inherit this exact visual identity.
- **Avoid Default Colors:** DO NOT use generic Tailwind `.bg-blue-*`, `.text-indigo-*`, or `.bg-black` fallback color spaces for primary elements or hover states. Ensure consistency by binding all generic components (e.g., `<Button>`, `<Input>`) directly to the brand's primary scaling.

## 📐 Layout & Space Integrity
- Use Tailwind utility classes for formatting. Do not introduce inline-styles or arbitrary hex values.
- Retain the clean, accessible contrast standards currently implemented.

## 📝 Design Philosophy
Whenever creating a new UI subset or modifying an existing template, evaluate whether the aesthetic perfectly aligns with the landing page. Keep styling simple, purposeful, and brand-aligned without creating disjointed UI patterns in back-office pages.
