import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Primary Meta Tags */}
        <title>NurQuran - Experience the Holy Quran with AI assistance</title>
        <meta name="title" content="NurQuran - Experience the Holy Quran with AI assistance" />
        <meta name="description" content="Read and explore the Holy Quran with NurAI, your personal spiritual assistant. Features prayer times, Qibla tracker, and deep AI insights into every verse." />
        <meta name="keywords" content="Quran, Al-Quran, Islam, AI Quran, Quran AI, NurAI, Holy Quran, Prayer Times, Qibla, Islamic App, Surah, Verse, Tafsir AI" />
        <meta name="author" content="NurQuran Team" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nurquran-kappa.vercel.app/" />
        <meta property="og:title" content="NurQuran - Experience the Holy Quran with AI" />
        <meta property="og:description" content="Explore the wisdom of the Quran with NurAI. Prayer times, Qibla, and AI-powered spiritual insights." />
        <meta property="og:image" content="https://nurquran-kappa.vercel.app/assets/images/nur_quran_logo_square.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://nurquran-kappa.vercel.app/" />
        <meta property="twitter:title" content="NurQuran - Experience the Holy Quran with AI" />
        <meta property="twitter:description" content="Explore the wisdom of the Quran with NurAI. Prayer times, Qibla, and AI-powered spiritual insights." />
        <meta property="twitter:image" content="https://nurquran-kappa.vercel.app/assets/images/nur_quran_logo_square.png" />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "NurQuran",
            "operatingSystem": "Web, iOS, Android",
            "applicationCategory": "EducationApplication, LifestyleApplication",
            "description": "An interactive Holy Quran application with AI-powered spiritual insights, prayer times, and Qibla tracking.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }} />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N8P837NT');`
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `
        }} />
        {/* Vercel Web Analytics */}
        <script dangerouslySetInnerHTML={{
          __html: `window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`
        }} />
        <script defer src="/_vercel/insights/script.js"></script>
      </head>
      <body>
        <noscript dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N8P837NT" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
        }} />
        {children}
      </body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
