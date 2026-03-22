Here’s a solid **VS Code setup for React development** that gives you a clean workflow for writing, formatting, linting, running, and debugging React apps.

## 1. Install the base tools

You need these first:

* **VS Code**
* **Node.js**
* **npm** (comes with Node.js)

React app tooling normally runs on Node.js, and the official Node.js download page currently offers **v24.14.0 LTS** as the LTS release. ([Node.js][1])

After installing Node.js, verify it in a terminal:

```bash
node -v
npm -v
```

## 2. Create a React project

React’s current docs point people to modern build tools when creating apps, and Vite is one of the main recommended options. Vite’s official quick start uses `npm create vite@latest`. ([React][2])

Create a new app like this:

```bash
npm create vite@latest my-react-app
cd my-react-app
npm install
npm run dev
```

Choose one of these templates when prompted:

* **React**
* **React + TypeScript**

For new projects, **React + TypeScript** is usually the better default because VS Code has very strong built-in TypeScript support. ([Visual Studio Code][3])

Then open the folder in VS Code:

```bash
code .
```

## 3. Understand what VS Code already gives you

VS Code already has built-in support for:

* JavaScript and TypeScript
* IntelliSense / autocomplete
* code navigation
* refactoring
* debugging

VS Code’s React guidance says it supports **React IntelliSense and code navigation out of the box**, and its JavaScript/TypeScript tooling includes debugging and refactoring support. ([Visual Studio Code][4])

That means even with no extra extensions, you already get:

* auto-import suggestions
* jump to definition
* rename symbol
* find references
* hover info
* bracket matching
* error squiggles for TS/JS issues

## 4. Install the essential extensions

Open the Extensions view in VS Code and install these.

### Must-have

**ESLint**
This integrates ESLint into VS Code and uses the ESLint library from your workspace when available, which is the recommended setup. ([Visual Studio Marketplace][5])

**Prettier - Code formatter**
This is the standard formatter extension for JS, TS, JSX, JSON, CSS, Markdown, and more. The official extension identifier is `esbenp.prettier-vscode`. ([Visual Studio Marketplace][6])

### Good optional extras

* **Stylelint** if you want stronger CSS/SCSS linting support ([Visual Studio Marketplace][7])
* **Error Lens** for more visible inline diagnostics
* **GitLens** for better Git history/blame
* **Path Intellisense** for import path completion
* **DotENV** if your project uses `.env` files

## 5. Add project linting and formatting

Install linting/formatting packages into your React project.

For a Vite React project:

```bash
npm install -D eslint prettier
```

For TypeScript React projects, also commonly add:

```bash
npm install -D typescript
```

VS Code includes TypeScript language support, but the TypeScript compiler itself is installed separately in your project or globally when needed. ([Visual Studio Code][8])

### Recommended VS Code settings

Create `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.eol": "\n",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.rulers": [100],
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

What this does:

* **formatOnSave** runs formatting every time you save
* **source.fixAll.eslint** applies auto-fixable lint rules on save
* **eslint.validate** tells ESLint to check JS, JSX, TS, and TSX files
* **defaultFormatter** makes Prettier the formatter

### Recommended Prettier config

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

### Recommended ignore file

Create `.prettierignore`:

```text
dist
node_modules
coverage
```

## 6. Organize VS Code for React work

A React-friendly layout usually looks like this:

```text
my-react-app/
  src/
    components/
    pages/
    hooks/
    services/
    utils/
    styles/
    App.tsx
    main.tsx
  public/
  .vscode/
    settings.json
  package.json
  vite.config.ts
```

In VS Code, these features help a lot:

* **Explorer** for project navigation
* **Search** for component/function lookup
* **Problems panel** for lint/type issues
* **Terminal** for running dev/build/test commands
* **Run and Debug** for browser debugging
* **Source Control** for Git workflow

## 7. Enable debugging in VS Code

VS Code has built-in debugging for JavaScript/TypeScript and built-in browser debugging for **Chrome and Edge**. ([Visual Studio Code][9])

First run your app:

```bash
npm run dev
```

Then create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch React App in Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

For many Vite apps, port **5173** is the default dev server port. Then you can:

* set breakpoints in `.jsx`, `.tsx`, `.ts`, `.js`
* inspect variables
* step through code
* view the call stack
* use the debug console

## 8. Use a good terminal workflow

Inside VS Code’s integrated terminal, these are your main commands:

```bash
npm run dev
npm run build
npm run preview
```

Vite’s official docs say production builds are created with `vite build`, usually via `npm run build`, and the output is suitable for static hosting. ([vitejs][10])

A practical daily flow is:

1. open project in VS Code
2. run `npm run dev`
3. edit components in `src`
4. save and let Prettier/ESLint clean things up
5. use the Problems panel to fix issues
6. debug from VS Code when needed
7. run `npm run build` before committing or deploying

## 9. Recommended VS Code settings for React specifically

These settings make React work smoother.

Add to `.vscode/settings.json`:

```json
{
  "editor.quickSuggestions": {
    "strings": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "files.associations": {
    "*.css": "css"
  }
}
```

Why:

* **quickSuggestions in strings** helps with class names and props
* **typescript.tsdk** makes VS Code use the project’s TypeScript version
* **emmet.includeLanguages** improves JSX/TSX HTML-like expansions

## 10. Useful editor habits for React

These built-in VS Code features matter a lot for React work:

* **Rename Symbol** for props, hooks, variables, components
* **Extract Function / Refactor** for cleaning JSX logic
* **Auto Imports** when adding hooks/components
* **Go to Definition** to jump into components/utilities
* **Find All References** to track prop or hook usage

VS Code documents built-in refactorings such as **Extract Method** and **Extract Variable**, which are very useful in React components. ([Visual Studio Code][11])

## 11. TypeScript setup advice

For React in 2026, TypeScript is usually the best default unless you want the lightest possible setup.

Reasons:

* safer props and state
* better autocomplete
* easier refactoring
* better team maintainability

VS Code has first-class TypeScript support built in. ([Visual Studio Code][3])

If you choose **React + TypeScript** with Vite, most of the setup is already done for you.

## 12. Recommended extensions I would actually use

A practical extension set:

* **ESLint**
* **Prettier - Code formatter**
* **GitLens**
* **Error Lens**
* **Stylelint** if your app has a lot of CSS/SCSS
* **Thunder Client** or **REST Client** if your React app calls APIs often

That keeps the editor useful without turning it into extension bloat.

## 13. Common mistakes to avoid

* Installing too many overlapping formatter/linter extensions
* Using global ESLint instead of project-local ESLint
* Mixing multiple formatting tools without a clear default
* Not committing `.vscode/settings.json` for team consistency
* Ignoring build errors because dev mode still runs
* Using plain JavaScript on a large codebase when TypeScript would help

## 14. Best “team-ready” setup

For a real project, I’d recommend:

* **Vite + React + TypeScript**
* **VS Code**
* **ESLint**
* **Prettier**
* **format on save**
* **workspace settings in `.vscode/settings.json`**
* **debug config in `.vscode/launch.json`**
* **Git + GitLens**
* optional **Stylelint**

That gives you:

* fast startup
* strong editor support
* consistent formatting
* early error detection
* easy debugging

## 15. Minimal setup checklist

Use this as your final checklist:

* Install **Node.js LTS** ([Node.js][1])
* Install **VS Code**
* Create app with **Vite** ([vitejs][12])
* Open folder in VS Code
* Install **ESLint** and **Prettier** extensions ([Visual Studio Marketplace][5])
* Add `.vscode/settings.json`
* Add `.prettierrc`
* Run `npm run dev`
* Add `.vscode/launch.json` for browser debugging ([Visual Studio Code][9])
* Start coding

I can also give you a **complete ready-to-copy VS Code setup for a React + TypeScript project**, including `settings.json`, `launch.json`, `.prettierrc`, and ESLint config.

[1]: https://nodejs.org/en/download?utm_source=chatgpt.com "Download Node.js"
[2]: https://react.dev/learn/creating-a-react-app?utm_source=chatgpt.com "Creating a React App"
[3]: https://code.visualstudio.com/docs/languages/typescript?utm_source=chatgpt.com "TypeScript in Visual Studio Code"
[4]: https://code.visualstudio.com/docs/nodejs/reactjs-tutorial?utm_source=chatgpt.com "Using React in Visual Studio Code"
[5]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint&utm_source=chatgpt.com "VS Code ESLint extension"
[6]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode&utm_source=chatgpt.com "Prettier - Code formatter"
[7]: https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint&utm_source=chatgpt.com "vscode-stylelint"
[8]: https://code.visualstudio.com/docs/typescript/typescript-transpiling?utm_source=chatgpt.com "Transpiling TypeScript"
[9]: https://code.visualstudio.com/docs/nodejs/browser-debugging?utm_source=chatgpt.com "Browser debugging in VS Code"
[10]: https://vite.dev/guide/build?utm_source=chatgpt.com "Building for Production"
[11]: https://code.visualstudio.com/docs/typescript/typescript-refactoring?utm_source=chatgpt.com "Refactoring TypeScript"
[12]: https://vite.dev/guide/?utm_source=chatgpt.com "Getting Started"
