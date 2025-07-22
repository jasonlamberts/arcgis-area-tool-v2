// URL parameter configuration utilities for iframe embedding

export interface WidgetConfig {
  reportTitle?: string;
  layers?: string[];
  basemap?: string;
  extent?: number[];
}

/**
 * Parse URL parameters to extract widget configuration
 */
export function parseUrlConfig(): WidgetConfig {
  const urlParams = new URLSearchParams(window.location.search);
  
  const config: WidgetConfig = {};
  
  // Report title
  const title = urlParams.get('title');
  if (title) {
    config.reportTitle = decodeURIComponent(title);
  }
  
  // Layers (comma-separated URLs)
  const layersParam = urlParams.get('layers');
  if (layersParam) {
    config.layers = layersParam.split(',').map(url => decodeURIComponent(url.trim()));
  }
  
  // Basemap
  const basemap = urlParams.get('basemap');
  if (basemap) {
    config.basemap = basemap;
  }
  
  // Extent (format: lon,lat,zoom)
  const extentParam = urlParams.get('extent');
  if (extentParam) {
    const parts = extentParam.split(',').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      config.extent = parts;
    }
  }
  
  return config;
}

/**
 * Generate URL with widget configuration for iframe embedding
 */
export function generateConfigUrl(baseUrl: string, config: WidgetConfig): string {
  const url = new URL(baseUrl);
  
  if (config.reportTitle) {
    url.searchParams.set('title', encodeURIComponent(config.reportTitle));
  }
  
  if (config.layers && config.layers.length > 0) {
    const layersParam = config.layers.map(layer => encodeURIComponent(layer)).join(',');
    url.searchParams.set('layers', layersParam);
  }
  
  if (config.basemap) {
    url.searchParams.set('basemap', config.basemap);
  }
  
  if (config.extent && config.extent.length === 3) {
    url.searchParams.set('extent', config.extent.join(','));
  }
  
  return url.toString();
}

/**
 * Example usage and common configurations
 */
export const exampleConfigs = {
  // Basic oil and gas analysis
  oilAndGas: {
    reportTitle: "Oil & Gas Infrastructure Analysis",
    layers: [
      "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Oil_and_Gas_Wells/FeatureServer/0",
      "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Oil_and_Gas_Pipelines/FeatureServer/0"
    ],
    basemap: "satellite",
    extent: [-98, 39.5, 4]
  },
  
  // Environmental analysis
  environmental: {
    reportTitle: "Environmental Impact Assessment",
    layers: [
      "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Protected_Areas/FeatureServer/0"
    ],
    basemap: "hybrid",
    extent: [-95, 37, 5]
  },
  
  // Custom analysis (template)
  custom: {
    reportTitle: "Custom Analysis",
    layers: [], // Add your layer URLs
    basemap: "streets-navigation-vector",
    extent: [-98, 39.5, 4] // [longitude, latitude, zoom]
  }
};

/**
 * Validate layer URLs
 */
export function validateLayerUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && 
           (url.includes('/FeatureServer/') || url.includes('/MapServer/'));
  } catch {
    return false;
  }
}

/**
 * Get iframe embed code
 */
export function getIframeEmbedCode(configUrl: string, width = '100%', height = '600px'): string {
  return `<iframe 
  src="${configUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
</iframe>`;
}