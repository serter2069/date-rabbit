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
        <title>DateRabbit — Find Your Perfect Date</title>
        <meta name="description" content="DateRabbit connects seekers with companions for memorable date experiences. Find, book, and enjoy amazing dates." />
        {/* Open Graph */}
        <meta property="og:title" content="DateRabbit — Find Your Perfect Date" />
        <meta property="og:description" content="Connect with companions for memorable date experiences." />
        <meta property="og:image" content="https://daterabbit.smartlaunchhub.com/og-image.png" />
        <meta property="og:url" content="https://daterabbit.smartlaunchhub.com" />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DateRabbit" />
        <meta name="twitter:description" content="Connect with companions for memorable date experiences." />
        <meta name="twitter:image" content="https://daterabbit.smartlaunchhub.com/og-image.png" />
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
}

body {
  overflow: hidden;
  overscroll-behavior-y: none;
}

#root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Expo Router wraps screens in nested divs. They must fill height
   so ScrollView can calculate its scrollable area.
   We use min-height on the outermost and flex:1 on all nested divs
   so content can grow beyond viewport while ScrollView constrains it. */
#root > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* Ensure ALL nested Expo Router wrapper divs propagate flex layout */
#root > div > div,
#root > div > div > div,
#root > div > div > div > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
`;
