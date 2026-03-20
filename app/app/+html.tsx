import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// temporary web page during development.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1"
        />
        {/* Reset default browser scroll styles so ScrollView works properly */}
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: webStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const webStyles = `
html, body, #root {
  height: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

body {
  margin: 0;
  padding: 0;
  overscroll-behavior-y: none;
}

/* Ensure Expo Router screen containers allow scrolling */
#root > div {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
`;
