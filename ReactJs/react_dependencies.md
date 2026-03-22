Typical React apps use a **small core set** plus a **pick-and-choose ecosystem** around routing, data fetching, forms, styling, testing, and build tooling. React’s own docs now point people to using a build tool such as **Vite**, **Parcel**, or **Rsbuild**, rather than treating React alone as the full app toolchain. ([React][1])

## 1. Core runtime

These are the most common baseline dependencies:

* `react`
* `react-dom`

These are the foundation of almost every React web app. ([React][2])

## 2. Build / dev tooling

Very commonly used around React apps:

* `vite`
* `@vitejs/plugin-react`
* `typescript`
* `eslint`
* `prettier`

React’s docs explicitly recommend using a build tool like **Vite** for packaging, dev server support, and production builds. ([React][1])

## 3. Routing

Common choices:

* `react-router-dom`
* `@tanstack/react-router`

`react-router` remains the standard mainstream routing choice, while TanStack Router is a newer type-safe alternative. ([TanStack][3])

## 4. Server state / API data fetching

Very common in modern apps:

* `@tanstack/react-query`
* `swr`
* `axios`
* native `fetch`

React apps frequently use a dedicated server-state library rather than manual fetch logic everywhere; TanStack Query and SWR are common choices. ([TanStack][4])

## 5. Client state management

Used depending on app size and complexity:

* `redux`
* `@reduxjs/toolkit`
* `react-redux`
* `zustand`
* `jotai`
* `recoil`
* context + hooks only

Redux Toolkit remains a common structured choice for larger apps. ([TanStack][4])

## 6. Forms and validation

Very commonly used:

* `react-hook-form`
* `formik`
* `zod`
* `yup`

React Hook Form is widely used for performant forms, and Zod is now especially common for schema validation in TypeScript-heavy React apps. ([React Hook Form][5])

## 7. UI component libraries / design systems

Common options:

* `@mui/material`
* `@chakra-ui/react`
* `antd`
* `radix-ui`
* `shadcn/ui`

Chakra UI, Radix UI, and shadcn/ui are all current mainstream options depending on whether you want prebuilt components or lower-level primitives. ([chakra-ui.com][6])

## 8. Styling

Common styling choices:

* `tailwindcss`
* `sass`
* `styled-components`
* `emotion`
* CSS Modules
* plain CSS

Many teams now pair React with either **Tailwind CSS** or a component-library-driven styling approach. ([chakra-ui.com][6])

## 9. Testing

Very typical dev dependencies:

* `vitest`
* `jest`
* `@testing-library/react`
* `@testing-library/jest-dom`
* `playwright`
* `cypress`

Testing Library is still central for component testing, while Playwright and Cypress are common for end-to-end tests. ([TanStack][7])

## 10. Storybook / component development

Often used in medium-to-large apps:

* `@storybook/react`

This is common when teams build reusable component libraries or design systems. ([TanStack][7])

## 11. Utility libraries

Frequently seen:

* `clsx`
* `lodash`
* `date-fns`
* `dayjs`
* `uuid`

These are not React-specific, but they are very common in React codebases. ([TanStack][7])

## 12. Animation / interaction

Common choices:

* `framer-motion`
* `react-spring`

Used when the app needs polished motion and UI transitions.

## 13. Tables, charts, and advanced UI

Common in dashboard-style apps:

* `@tanstack/react-table`
* `ag-grid-react`
* `recharts`
* `chart.js`
* `react-chartjs-2`

## 14. Frameworks built around React

Some “React apps” are actually built with React-based frameworks:

* `next`
* `remix`

These bring routing, SSR, data loading, and full-stack capabilities on top of React. ([TanStack][4])

## Typical minimal set

A very common modern starter stack is:

* `react`
* `react-dom`
* `vite`
* `@vitejs/plugin-react`
* `typescript`
* `react-router-dom`
* `@tanstack/react-query`
* `react-hook-form`
* `zod`
* `tailwindcss`
* `vitest`
* `@testing-library/react`

## Important note

There is no single “all React dependencies” list because React is intentionally small; most of the stack is chosen based on the app’s needs. ([React][2])

I can also give you this as a **categorized `package.json` template for a typical production React app**.

[1]: https://react.dev/learn/build-a-react-app-from-scratch?utm_source=chatgpt.com "Build a React app from Scratch"
[2]: https://react.dev/?utm_source=chatgpt.com "React"
[3]: https://tanstack.com/router?utm_source=chatgpt.com "TanStack Router"
[4]: https://tanstack.com/stats/npm?utm_source=chatgpt.com "NPM Download Stats & Trends | Compare Packages"
[5]: https://react-hook-form.com/?utm_source=chatgpt.com "React Hook Form - performant, flexible and extensible form ..."
[6]: https://chakra-ui.com/?utm_source=chatgpt.com "Chakra UI"
[7]: https://tanstack.com/stats/npm?alignStartDates=false&binType=weekly&binningOption=weekly&height=400&packageGroups=%5B%7B%22packages%22%3A%5B%7B%22name%22%3A%22jest%22%7D%5D%2C%22color%22%3A%22%23C21325%22%7D%2C%7B%22packages%22%3A%5B%7B%22name%22%3A%22vitest%22%7D%5D%2C%22color%22%3A%22%23646CFF%22%7D%2C%7B%22packages%22%3A%5B%7B%22name%22%3A%22%40testing-library%2Freact%22%7D%5D%2C%22color%22%3A%22%23E33332%22%7D%2C%7B%22packages%22%3A%5B%7B%22name%22%3A%22cypress%22%7D%5D%2C%22color%22%3A%22%234A5568%22%7D%2C%7B%22packages%22%3A%5B%7B%22name%22%3A%22playwright%22%7D%5D%2C%22color%22%3A%22%232EAD33%22%7D%2C%7B%22packages%22%3A%5B%7B%22name%22%3A%22%40storybook%2Freact%22%7D%5D%2C%22color%22%3A%22%23FF4785%22%7D%5D&packages=%5B%7B%22packages%22%3A%5B%22date-fns%22%5D%2C%22color%22%3A%22%23E91E63%22%7D%2C%7B%22packages%22%3A%5B%22dayjs%22%5D%2C%22color%22%3A%22%23FF6B6B%22%7D%2C%7B%22packages%22%3A%5B%22luxon%22%5D%2C%22color%22%3A%22%233498DB%22%7D%2C%7B%22packages%22%3A%5B%22moment%22%5D%2C%22color%22%3A%22%234A5568%22%7D%2C%7B%22packages%22%3A%5B%22%40date-io%2Fdate-fns%22%5D%2C%22color%22%3A%22%23FFD700%22%7D%2C%7B%22packages%22%3A%5B%22temporal-polyfill%22%5D%2C%22color%22%3A%22%23a855f7%22%7D%5D&range=365-days&showDataMode=all&transform=none&viewMode=absolute&utm_source=chatgpt.com "jest vs vitest vs @testing-library/react vs cypress vs playwright ..."
