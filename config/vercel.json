// URL Configuration Examples for Area Analysis Tool
// Copy and modify these examples for your specific use cases

// Basic configuration object structure
const basicConfig = {
  reportTitle: "Area Analysis Tool",
  layers: [], // Empty for default layers
  basemap: "satellite",
  extent: [-98, 39.5, 4] // [longitude, latitude, zoom]
};

// Oil & Gas Industry Analysis
const oilGasConfig = {
  reportTitle: "Oil & Gas Infrastructure Analysis",
  layers: [
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Oil_and_Gas_Wells/FeatureServer/0",
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Oil_and_Gas_Pipelines/FeatureServer/0"
  ],
  basemap: "satellite",
  extent: [-101, 35, 6] // Texas/Oklahoma focus
};

// Environmental Impact Assessment
const environmentalConfig = {
  reportTitle: "Environmental Impact Assessment",
  layers: [
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Protected_Areas/FeatureServer/0",
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Wetlands/FeatureServer/0"
  ],
  basemap: "topo-vector",
  extent: [-120, 45, 5] // Pacific Northwest focus
};

// Regional Planning Analysis
const regionalPlanningConfig = {
  reportTitle: "Regional Planning Analysis",
  layers: [
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties/FeatureServer/0",
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer/0"
  ],
  basemap: "streets-navigation-vector",
  extent: [-98, 39.5, 4] // Continental US focus
};

// Infrastructure Assessment
const infrastructureConfig = {
  reportTitle: "Infrastructure Assessment",
  layers: [
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Highways/FeatureServer/0",
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Railroads/FeatureServer/0"
  ],
  basemap: "gray-vector",
  extent: [-87, 41, 7] // Chicago focus
};

// Utility function to generate URL from configuration
function generateConfigUrl(baseUrl, config) {
  const params = new URLSearchParams();
  
  // Always add iframe mode
  params.append('iframe', 'true');
  
  // Add configuration parameters
  if (config.reportTitle) {
    params.append('title', config.reportTitle);
  }
  
  if (config.layers && config.layers.length > 0) {
    params.append('layers', config.layers.join(','));
  }
  
  if (config.basemap) {
    params.append('basemap', config.basemap);
  }
  
  if (config.extent && config.extent.length === 3) {
    params.append('extent', config.extent.join(','));
  }
  
  return `${baseUrl}?${params.toString()}`;
}

// Example usage - replace YOUR_DEPLOYED_URL with your actual Vercel URL
const YOUR_DEPLOYED_URL = "https://your-app-name.vercel.app";

// Generate URLs for each configuration
const urls = {
  basic: generateConfigUrl(YOUR_DEPLOYED_URL, basicConfig),
  oilGas: generateConfigUrl(YOUR_DEPLOYED_URL, oilGasConfig),
  environmental: generateConfigUrl(YOUR_DEPLOYED_URL, environmentalConfig),
  regionalPlanning: generateConfigUrl(YOUR_DEPLOYED_URL, regionalPlanningConfig),
  infrastructure: generateConfigUrl(YOUR_DEPLOYED_URL, infrastructureConfig)
};

// Example output (copy these URLs for use in Experience Builder)
console.log("Generated Configuration URLs:");
console.log("=============================");
console.log("\n1. Basic Configuration:");
console.log(urls.basic);
console.log("\n2. Oil & Gas Analysis:");
console.log(urls.oilGas);
console.log("\n3. Environmental Assessment:");
console.log(urls.environmental);
console.log("\n4. Regional Planning:");
console.log(urls.regionalPlanning);
console.log("\n5. Infrastructure Assessment:");
console.log(urls.infrastructure);

// Custom configuration template
const customConfig = {
  reportTitle: "YOUR_CUSTOM_TITLE",
  layers: [
    "YOUR_LAYER_URL_1",
    "YOUR_LAYER_URL_2"
    // Add more layer URLs as needed
  ],
  basemap: "satellite", // or streets-navigation-vector, topo-vector, etc.
  extent: [-98, 39.5, 4] // [longitude, latitude, zoom_level]
};

// Generate your custom URL
const customUrl = generateConfigUrl(YOUR_DEPLOYED_URL, customConfig);
console.log("\n6. Your Custom Configuration:");
console.log(customUrl);

// Available basemap options
const availableBasemaps = [
  "satellite",
  "hybrid", 
  "streets-navigation-vector",
  "topo-vector",
  "gray-vector",
  "dark-gray-vector",
  "oceans",
  "osm"
];

console.log("\nAvailable Basemap Options:");
console.log(availableBasemaps.join(", "));

// Layer URL format examples
const layerUrlExamples = [
  "https://services.arcgis.com/YOUR_ORG/arcgis/rest/services/YOUR_SERVICE/FeatureServer/0",
  "https://services1.arcgis.com/YOUR_ORG/arcgis/rest/services/YOUR_SERVICE/FeatureServer/1",
  "https://your-portal.com/portal/rest/services/YOUR_SERVICE/FeatureServer/0"
];

console.log("\nLayer URL Format Examples:");
layerUrlExamples.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateConfigUrl,
    configurations: {
      basic: basicConfig,
      oilGas: oilGasConfig,
      environmental: environmentalConfig,
      regionalPlanning: regionalPlanningConfig,
      infrastructure: infrastructureConfig
    },
    availableBasemaps
  };
}