# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

# cg-game (подготовка к экзамену)

Веб-приложение-игра для подготовки к экзамену по компьютерной графике: уровни → теория → практика (демо) → квиз → режим экзамена.

## Запуск

Из папки проекта:

- `npm install`
- `npm run dev`

Открой `http://localhost:5173/`.

## Генерация контента из твоих файлов

Вопросы/ответы берутся из файлов рядом с проектом:

- `../vopros.docx`
- `../otvet1.pdf`
- `../otvet2.pdf`

Команда:

- `npm run gen:content`

Она перезапишет `src/content/questions.ts`.

## Нейро-чат (опционально, бесплатно)

Чат работает через OpenRouter API:

1) Зарегистрируйся на OpenRouter и создай API‑ключ
2) Открой страницу «Нейро‑чат» внутри приложения
3) Вставь ключ и выбери модель

Важно:
- Ключ хранится только в твоём браузере (localStorage).
- «Бесплатность» зависит от модели/политики OpenRouter — приложение умеет фильтровать модели с нулевой ценой, если список моделей доступен.

## Челленджи

В каждом уровне во вкладке «Практика» есть короткий автопроверяемый челлендж. Прогресс (пройден/не пройден) сохраняется в localStorage вместе с XP.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
