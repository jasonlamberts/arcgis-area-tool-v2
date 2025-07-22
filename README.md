\# 🗺️ Iframe Area Analysis Tool



A standalone React application that provides area analysis capabilities for ArcGIS feature layers, designed specifically for iframe embedding in Experience Builder applications.



\## 🚀 Quick Start



\### Local Development

```bash

cd IFRAME2

npm install

npm run dev

```



\### Test Iframe Mode

```bash

\# Start development server

npm run dev



\# Test iframe with parameters

http://localhost:8080?iframe=true\&title=My%20Analysis\&basemap=satellite

```



\### Deploy to Vercel

```bash

\# Build the project

npm run build



\# Or deploy directly

\# 1. Push to GitHub

\# 2. Connect to Vercel

\# 3. Deploy automatically

```



\## 🔧 Usage



\### Iframe Embedding

```html

<iframe 

&nbsp; src="https://your-app.vercel.app?iframe=true\&title=Area%20Analysis\&basemap=satellite" 

&nbsp; width="100%" 

&nbsp; height="600px" 

&nbsp; frameborder="0">

</iframe>

```



\### URL Parameters

\- `iframe=true` - Enable iframe mode

\- `title=My%20Analysis` - Custom report title

\- `basemap=satellite` - Map basemap

\- `extent=-98,39.5,4` - Map center and zoom

\- `layers=url1,url2` - Comma-separated layer URLs



\## 📋 Features



✅ \*\*Iframe-Ready Design\*\* - Optimized for embedding

✅ \*\*URL Configuration\*\* - Customizable via parameters  

✅ \*\*Rectangle Sketching\*\* - Draw analysis areas

✅ \*\*Multi-Layer Analysis\*\* - Query multiple feature layers

✅ \*\*Download Results\*\* - CSV, JSON, and text formats

✅ \*\*Responsive Layout\*\* - Works on all screen sizes

✅ \*\*Error Handling\*\* - User-friendly error messages



\## 🛠️ Technical Stack



\- \*\*React 18\*\* with TypeScript

\- \*\*Vite\*\* for fast development and building

\- \*\*ArcGIS API for JavaScript\*\* for mapping

\- \*\*Tailwind CSS\*\* for styling

\- \*\*Radix UI\*\* for accessible components



\## 📁 Project Structure



```

IFRAME2/

├── src/

│   ├── components/

│   │   ├── StandaloneAreaAnalysisTool.tsx  # Main analysis component

│   │   └── ui/                             # UI components

│   ├── utils/

│   │   └── urlConfig.ts                    # URL parameter handling

│   ├── pages/

│   ├── App.tsx                             # App with iframe mode detection

│   └── main.tsx

├── public/

├── vercel.json                             # Vercel deployment config

└── package.json

```



\## 🌐 Deployment



This project is configured for easy deployment to Vercel with iframe support enabled via CORS headers.



\### Deployment Steps:

1\. Push code to GitHub

2\. Connect repository to Vercel

3\. Deploy automatically

4\. Use the Vercel URL for iframe embedding



\## 🔗 Related Documentation



\- \[Complete Deployment Guide](../IFRAME\_DEPLOYMENT\_GUIDE.md)

\- \[Iframe Examples](../iframe-examples.html)

\- \[URL Configuration Examples](../IFRAME/config/url-config-examples.js)



---



Ready to deploy your iframe-enabled area analysis tool! 🚀

