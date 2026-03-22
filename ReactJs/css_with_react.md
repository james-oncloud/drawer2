# Working with CSS in React

This guide explains how styling fits into React’s component model, common patterns in modern toolchains (especially Vite), and how to choose between approaches.

---

## 1. Mental model: JSX is not CSS

React components render a **tree of DOM nodes** (or native views on React Native). **CSS still targets those nodes** via selectors (`class`, `id`, attributes) or inline styles. React does not replace CSS; it changes *how you attach* class names and *where you keep* stylesheets.

- In JSX, use **`className`** (not `class`) for HTML’s `class` attribute.
- The **`style` prop** accepts a **JavaScript object** of camelCased CSS properties, not a CSS string.

```jsx
<div className="card" style={{ marginTop: 8, padding: '1rem' }}>
  …
</div>
```

Inline `style` is useful for **one-off dynamic values** (e.g. a width from props). It is usually a poor default for whole layouts, because you lose reuse, pseudo-classes (`:hover`), and media queries unless you add more logic.

---

## 2. Importing global CSS

The most direct approach: a normal stylesheet imported from your entry (e.g. `main.jsx`) or from any module your bundler processes.

```jsx
import './index.css'
```

**Characteristics**

- Rules apply **document-wide** according to normal CSS cascade and specificity.
- Simple and familiar; good for **resets**, **typography**, **CSS variables** (design tokens), and **base layout**.
- Risk: **class name collisions** if two components use the same class (e.g. `.title`) unless you namespace or use a convention (BEM, etc.).

**Vite / webpack** treat these imports as side-effect modules: the CSS is extracted or injected during dev, depending on configuration.

---

## 3. Component-scoped styles without a library

React does not scope CSS by itself. Common strategies:

### 3.1 Naming conventions (BEM, etc.)

Use predictable, unique class strings built from block/element/modifier names so globals rarely clash.

```jsx
<button type="button" className="toolbar__chip toolbar__chip--active">
```

### 3.2 CSS Modules

The bundler renames classes to **unique hashes** at build time and exposes a map from **logical names** to **generated names**.

Typical usage (file names vary by setup, e.g. `Button.module.css`):

```jsx
import styles from './Button.module.css'

export function Button() {
  return <button type="button" className={styles.primary}>OK</button>
}
```

**Benefits**

- **Local scope by default**; same class name in another module does not collide.
- Still **plain CSS** (including `@media`, `:hover`, etc.).

**Notes**

- You need build support (Vite enables CSS Modules for files matching `*.module.css` by default).
- For **modifiers**, combine classes: `className={`${styles.btn} ${active ? styles.active : ''}`}` or use a small helper (see below).

### 3.3 “CSS Modules–like” with other extensions

Some projects use `[name].module.scss` with a Sass preprocessor; the scoping idea is the same.

---

## 4. Conditional and composed `className`

You often merge static and dynamic classes. Options:

- **Template literals**

  ```jsx
  className={`chip ${isActive ? 'chip--active' : ''}`}
  ```

- **`clsx` or `classnames` npm packages** — skip falsy values and keep code readable.

  ```jsx
  import clsx from 'clsx'
  className={clsx('chip', isActive && 'chip--active')}
  ```

Prefer **one clear pattern** per project so files stay consistent.

---

## 5. CSS custom properties (variables) and theming

**Design tokens** as variables work extremely well with React because you can switch them **without re-rendering every rule**:

```css
:root {
  --color-bg: #fff;
  --color-text: #111;
}
[data-theme='dark'] {
  --color-bg: #111;
  --color-text: #eee;
}
body {
  background: var(--color-bg);
  color: var(--color-text);
}
```

React is responsible only for toggling an attribute or class on a root node (e.g. `document.documentElement.dataset.theme = 'dark'` in a `useEffect` or `useLayoutEffect`). Components keep using the same variable names; the **browser** updates computed styles.

This pattern is used in the **Shelf Life** sample app under `projects/shelf-life-js` / `shelf-life-ts` (`[data-theme='light' | 'dark']` in `index.css`).

---

## 6. Preprocessors: Sass, Less, PostCSS

- **Sass/Less**: still compile to CSS; Vite supports them via optional plugins. They do not change React’s model; they change **authoring** (nesting, variables, mixins).
- **PostCSS**: runs **after** or **instead of** other steps — autoprefixer, nesting, future syntax, etc. Often configured in `postcss.config.js`.

React code stays the same: import the processed file or use CSS Modules with `.module.scss` if configured.

---

## 7. Utility-first CSS (e.g. Tailwind CSS)

**Tailwind** (and similar tools) generate many small utility classes. In JSX you write:

```jsx
<div className="flex gap-2 rounded-lg border border-gray-200 p-4">
```

**Characteristics**

- Very fast iteration; **consistent spacing and colors** from a design scale.
- **No separate CSS file** per component unless you use `@apply` or a plugin.
- Build step **purges** unused classes for production.

Integration is project-level (PostCSS + Tailwind config), not React-core. See the [Tailwind + Vite documentation](https://tailwindcss.com/docs/guides/vite) for setup.

---

## 8. CSS-in-JS (runtime and zero-runtime)

These libraries tie styles to components using JavaScript:

- **Runtime** (e.g. styled-components, Emotion): styles injected when components mount; can read **props/theme** easily.
- **Zero-runtime** (e.g. some patterns with compiled solutions): CSS extracted at build time.

**Trade-offs**

- **Pros**: colocation, dynamic styling from props, theming APIs.
- **Cons**: bundle size and runtime cost for runtime libraries; learning curve; SSR and streaming setups need care.

React 19 and the wider ecosystem still support these; choose based on team preference and performance budgets.

---

## 9. Where to put CSS files (project structure)

Common conventions:

| Approach | Typical location |
|----------|------------------|
| Global / tokens | `src/index.css`, `src/styles/` |
| CSS Module per component | Next to component: `Button.jsx` + `Button.module.css` |
| Feature folder | `features/cart/Cart.jsx` + `Cart.module.css` |

There is no single “React way”; **consistency** matters more than the exact folder name.

---

## 10. Vite + React specifics

- **`import './file.css'`** in JS/JSX is supported out of the box.
- **CSS Modules**: `*.module.css` (and often `*.module.scss` with a plugin).
- **Dev**: styles update with **HMR** when you save.
- **Production build**: CSS is typically **bundled and code-split** with the JS graph; lazy-loaded routes can bring their own CSS chunks if imported from those modules.

Official reference: [Vite — Features: CSS](https://vite.dev/guide/features.html#css).

---

## 11. Pitfalls specific to React

1. **Forgot `className`** — Using `class` in JSX is invalid in React DOM and will not apply as in HTML.
2. **Global pollution** — Many small apps use only global CSS; growth makes collisions more likely → move hot spots to **CSS Modules** or a **design system**.
3. **Inline styles for everything** — Harder to maintain; misses pseudo-selectors and media queries without JS.
4. **Third-party components** — You may need to **override** styles via wrapper classes, `:global()` in CSS Modules, or the library’s theming API; specificity fights are common—prefer the library’s documented extension points.
5. **SSR and flash of unstyled content** — Ensure critical CSS or correct link tags in SSR frameworks; client-only injected styles can delay appearance.

---

## 12. Accessibility and CSS

CSS affects **perceived** structure but not the **accessibility tree** the same way as semantic HTML. Still:

- Do not **remove focus outlines** without replacing them (`:focus-visible`).
- **Color contrast** for text and interactive states remains your responsibility.
- **Motion**: respect `prefers-reduced-motion` for animations.

These concerns are independent of React but apply to every styled UI you build.

---

## 13. Quick decision guide

- **Prototype / small app** — Global CSS + variables; optional BEM-style names.
- **Growing app, many developers** — CSS Modules (or Tailwind if the team agrees).
- **Heavy theme / brand variants** — CSS variables on `:root` or `[data-theme]`, toggled from React.
- **Max colocation and prop-driven styling** — Consider CSS-in-JS or Tailwind, with eyes on bundle size and SSR.

---

## Further reading

- React docs — [Adding styles](https://react.dev/learn#adding-styles) (overview in Learn section).
- [MDN — Using CSS](https://developer.mozilla.org/en-US/docs/Learn/CSS) for fundamentals independent of React.
- [Vite CSS guide](https://vite.dev/guide/features.html#css) for bundler behavior.
