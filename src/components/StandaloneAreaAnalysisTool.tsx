import React, { useEffect, useRef, useState, useCallback } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import Graphic from '@arcgis/core/Graphic';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Square, FileText, MapPin } from 'lucide-react';

interface AnalysisResult {
  layerTitle: string;
  layerUrl: string;
  featureCount: number;
  features: any[];
}

interface StandaloneAreaAnalysisToolProps {
  reportTitle?: string;
  layers?: string[];
  basemap?: string;
  extent?: number[];
}

const StandaloneAreaAnalysisTool: React.FC<StandaloneAreaAnalysisToolProps> = ({
  reportTitle = "Area Analysis Tool",
  layers = [],
  basemap = "satellite",
  extent = [-98, 39.5, 4] // [longitude, latitude, zoom]
}) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView | null>(null);
  const [sketchViewModel, setSketchViewModel] = useState<SketchViewModel | null>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [sketchedGeometry, setSketchedGeometry] = useState<any>(null);
  const { toast } = useToast();

  // Initialize map and sketch tools
  useEffect(() => {
    if (!mapDiv.current || view) return; // Prevent re-initialization

    const initializeMap = async () => {
      try {
        // Create graphics layer for sketching
        const gLayer = new GraphicsLayer({
          title: 'Sketch Layer'
        });

        // Create feature layers from provided URLs
        const featureLayers = layers.map((layerUrl, index) => {
          return new FeatureLayer({
            url: layerUrl,
            title: `Layer ${index + 1}`,
            visible: true
          });
        });

        // Default layers if none provided
        const defaultLayers = layers.length === 0 ? [
          new FeatureLayer({
            url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Oil_and_Gas_Wells/FeatureServer/0",
            title: "Oil and Gas Wells",
            visible: true
          }),
          new FeatureLayer({
            url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Oil_and_Gas_Pipelines/FeatureServer/0",
            title: "Pipelines", 
            visible: true
          })
        ] : [];

        // Create the map
        const map = new Map({
          basemap: basemap as any,
          layers: [...defaultLayers, ...featureLayers, gLayer]
        });

        // Create the view with minimal UI
        const mapView = new MapView({
          container: mapDiv.current!,
          map: map,
          center: [extent[0], extent[1]],
          zoom: extent[2],
          ui: {
            components: [] // Remove all UI components including attribution to prevent blinking
          }
        });

        // Create sketch view model
        const sketch = new SketchViewModel({
          layer: gLayer,
          view: mapView,
          defaultCreateOptions: {
            hasZ: false
          }
        });

        // Handle sketch create events
        sketch.on('create', (event) => {
          if (event.state === 'complete') {
            setSketchedGeometry(event.graphic.geometry);
            toast({
              title: "Area Sketched",
              description: "Rectangle created successfully. Ready to analyze!"
            });
          }
        });

        await mapView.when();
        
        // Set state only after everything is ready
        setView(mapView);
        setSketchViewModel(sketch);
        setGraphicsLayer(gLayer);

        // Show ready message once
        toast({
          title: "Map Ready",
          description: "You can now sketch an area and run analysis"
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        toast({
          title: "Map Error",
          description: "Failed to initialize the map",
          variant: "destructive"
        });
      }
    };

    initializeMap();

    return () => {
      if (view) {
        view.destroy();
        setView(null);
        setSketchViewModel(null);
        setGraphicsLayer(null);
      }
    };
  }, []); // Remove dependencies to prevent re-initialization

  const startSketch = useCallback(() => {
    if (!sketchViewModel) return;

    // Clear existing graphics
    if (graphicsLayer) {
      graphicsLayer.removeAll();
    }
    
    setSketchedGeometry(null);
    setAnalysisResults([]);
    setError('');

    // Start rectangle sketch
    sketchViewModel.create('rectangle');
    
    toast({
      title: "Sketch Mode Active",
      description: "Draw a rectangle on the map to define your analysis area"
    });
  }, [sketchViewModel, graphicsLayer, toast]);

  const analyzeArea = useCallback(async () => {
    if (!view) {
      toast({
        title: "Map Not Ready",
        description: "Please wait for the map to load",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setError('');
    
    try {
      // Use sketched geometry or current view extent
      const analysisGeometry = sketchedGeometry || view.extent;
      
      if (!analysisGeometry) {
        throw new Error('No analysis area defined');
      }

      const results: AnalysisResult[] = [];
      
      // Query all feature layers in the map
      const featureLayers = view.map.layers.toArray().filter((layer) => 
        layer.type === 'feature' && (layer as FeatureLayer).visible
      ) as FeatureLayer[];

      if (featureLayers.length === 0) {
        throw new Error('No visible feature layers found for analysis');
      }

      for (const layer of featureLayers) {
        try {
          const query = layer.createQuery();
          query.geometry = analysisGeometry;
          query.spatialRelationship = 'intersects';
          query.outFields = ['*'];
          query.returnGeometry = false;
          
          // Ensure geometry is in the right format for querying
          if (sketchedGeometry) {
            query.geometry = sketchedGeometry;
          } else {
            // Use view extent for analysis
            query.geometry = view.extent;
          }

          const featureSet = await layer.queryFeatures(query);
          
          results.push({
            layerTitle: layer.title || 'Unnamed Layer',
            layerUrl: layer.url || '',
            featureCount: featureSet.features.length,
            features: featureSet.features.map(f => f.attributes)
          });

        } catch (layerError) {
          console.warn(`Error querying layer ${layer.title}:`, layerError);
        }
      }

      setAnalysisResults(results);
      
      const totalFeatures = results.reduce((sum, result) => sum + result.featureCount, 0);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${totalFeatures} features across ${results.length} layers`
      });

    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      toast({
        title: "Analysis Failed", 
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [view, sketchedGeometry, toast]);

  const downloadResults = useCallback((format: 'csv' | 'json' | 'pdf') => {
    if (!analysisResults.length) {
      toast({
        title: "No Data",
        description: "No analysis results to download",
        variant: "destructive"
      });
      return;
    }

    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'csv') {
        // Generate CSV
        const csvRows = ['Layer,Feature Count,Layer URL'];
        analysisResults.forEach(result => {
          csvRows.push(`"${result.layerTitle}",${result.featureCount},"${result.layerUrl}"`);
        });
        
        // Add feature details
        analysisResults.forEach(result => {
          if (result.features.length > 0) {
            csvRows.push('', `Features from ${result.layerTitle}:`);
            const headers = Object.keys(result.features[0]);
            csvRows.push(headers.map(h => `"${h}"`).join(','));
            
            result.features.forEach(feature => {
              const row = headers.map(header => `"${feature[header] || ''}"`);
              csvRows.push(row.join(','));
            });
          }
        });
        
        content = csvRows.join('\n');
        filename = `${reportTitle.replace(/\s+/g, '_')}_analysis.csv`;
        mimeType = 'text/csv';
        
      } else if (format === 'json') {
        // Generate JSON
        const jsonData = {
          reportTitle,
          analysisDate: new Date().toISOString(),
          summary: {
            totalLayers: analysisResults.length,
            totalFeatures: analysisResults.reduce((sum, r) => sum + r.featureCount, 0)
          },
          results: analysisResults
        };
        
        content = JSON.stringify(jsonData, null, 2);
        filename = `${reportTitle.replace(/\s+/g, '_')}_analysis.json`;
        mimeType = 'application/json';
        
      } else if (format === 'pdf') {
        // Simple text-based PDF content (would need PDF library for true PDF)
        const lines = [
          reportTitle,
          '='.repeat(reportTitle.length),
          '',
          `Analysis Date: ${new Date().toLocaleDateString()}`,
          `Total Layers Analyzed: ${analysisResults.length}`,
          `Total Features Found: ${analysisResults.reduce((sum, r) => sum + r.featureCount, 0)}`,
          '',
          'Results by Layer:',
          ''
        ];
        
        analysisResults.forEach(result => {
          lines.push(`${result.layerTitle}: ${result.featureCount} features`);
          if (result.layerUrl) {
            lines.push(`  URL: ${result.layerUrl}`);
          }
          lines.push('');
        });
        
        content = lines.join('\n');
        filename = `${reportTitle.replace(/\s+/g, '_')}_analysis.txt`;
        mimeType = 'text/plain';
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${filename} download initiated`
      });

    } catch (err) {
      console.error('Download error:', err);
      toast({
        title: "Download Failed",
        description: "Failed to generate download file",
        variant: "destructive"
      });
    }
  }, [analysisResults, reportTitle, toast]);

  const totalFeatures = analysisResults.reduce((sum, result) => sum + result.featureCount, 0);

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          {reportTitle}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapDiv} className="w-full h-full" />
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Button 
              onClick={startSketch}
              disabled={!sketchViewModel}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Sketch Area
            </Button>
            
            <Button 
              onClick={analyzeArea}
              disabled={!view || isAnalyzing}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Area'}
            </Button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="w-80 border-l bg-card overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Instructions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p>1. Click "Sketch Area" to draw a rectangle</p>
                <p>2. Draw your analysis area on the map</p>
                <p>3. Click "Analyze Area" to run analysis</p>
                <p>4. Download results when complete</p>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {analysisResults.length > 0 && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Analysis Summary
                      <Badge variant="secondary">{totalFeatures} features</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysisResults.map((result, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="truncate flex-1" title={result.layerTitle}>
                          {result.layerTitle}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {result.featureCount}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Download Options */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Download Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => downloadResults('csv')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      CSV Report
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => downloadResults('json')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      JSON Data
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => downloadResults('pdf')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Text Report
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneAreaAnalysisTool;