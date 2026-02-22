import fs from 'fs';

const testFile = 'AppLayout.mobile.test.tsx';
let content = fs.readFileSync(testFile, 'utf8');

// Replace BrowserRouter with createMemoryRouter approach
content = content.replace(
  /import.*BrowserRouter.*from.*react-router-dom['"]/,
  `import { createMemoryRouter, RouterProvider } from 'react-router-dom'`
);

content = content.replace(
  /const renderWithRouter = .*?\{[\s\S]*?\n.*?\n.*?\};/,
`const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/']) => {
    const router = createMemoryRouter(
      [
        {
          path: '*',
          element: ui,
        },
      ],
      {
        initialEntries,
      }
    );
    return render(<RouterProvider router={router} />);
  };`
);

fs.writeFileSync(testFile, content);
console.log('Fixed mobile navigation tests');
