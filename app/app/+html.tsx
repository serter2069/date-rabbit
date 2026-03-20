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
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#root {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

body {
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}

/* Ensure Expo Router screen containers fill height for ScrollView */
#root > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  overflow: hidden;
}
`;
