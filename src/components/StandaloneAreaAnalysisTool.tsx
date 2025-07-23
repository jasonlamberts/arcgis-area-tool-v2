import React, { useEffect, useRef, useState, useCallback } from 'react';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
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
  extent = [-98, 39.5, 4]
}) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Initialize the tool
  useEffect(() => {
    setIsInitialized(true);
    toast({
      title: "Analysis Tool Ready",
      description: "Use the buttons below to analyze the current map view"
    });
  }, [toast]);

  const analyzeCurrentView = useCallback(async () => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Try to access the parent window's map (Experience Builder integration)
      let esriMap = null;
      let analysisExtent = null;

      // Look for Esri map in parent window
      if (window.parent && window.parent !== window) {
        try {
          // Try to access Experience Builder's map
          const parentView = (window.parent as any).app?.views?.[0];
          if (parentView) {
            esriMap = parentView;
            analysisExtent = parentView.extent;
          }
        } catch (e) {
          console.log('Cannot access parent map, using layer queries directly');
        }
      }

      if (!analysisExtent && layers.length === 0) {
        throw new Error('No map view available and no layers configured for analysis');
      }

      const results: AnalysisResult[] = [];
      
      // Use configured layers or try to find layers in parent map
      const layersToAnalyze = layers.length > 0 ? layers : [
        "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Oil_and_Gas_Wells/FeatureServer/0",
        "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Oil_and_Gas_Pipelines/FeatureServer/0"
      ];

      for (const layerUrl of layersToAnalyze) {
        try {
          const layer = new FeatureLayer({ url: layerUrl });
          await layer.load();

          const query = layer.createQuery();
          
          // If we have parent map extent, use it; otherwise query all features
          if (analysisExtent) {
            query.geometry = analysisExtent;
            query.spatialRelationship = 'intersects';
          }
          
          query.outFields = ['*'];
          query.returnGeometry = false;

          const featureSet = await layer.queryFeatures(query);
          
          results.push({
            layerTitle: layer.title || 'Unnamed Layer',
            layerUrl: layerUrl,
            featureCount: featureSet.features.length,
            features: featureSet.features.map(f => f.attributes)
          });

        } catch (layerError) {
          console.warn(`Error querying layer ${layerUrl}:`, layerError);
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
  }, [layers, toast]);

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
        const csvRows = ['Layer,Feature Count,Layer URL'];
        analysisResults.forEach(result => {
          csvRows.push(`"${result.layerTitle}",${result.featureCount},"${result.layerUrl}"`);
        });
        
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
    <div className="w-full max-w-sm bg-background border rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-3 border-b bg-card">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {reportTitle}
        </h2>
      </div>

      {/* Controls */}
      <div className="p-3 space-y-3">
        {/* Instructions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p>1. Navigate to your area of interest in the map</p>
            <p>2. Click "Analyze Current View" to analyze visible area</p>
            <p>3. Download results when complete</p>
          </CardContent>
        </Card>

        {/* Analysis Button */}
        <Button 
          onClick={analyzeCurrentView}
          disabled={!isInitialized || isAnalyzing}
          className="w-full flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Current View'}
        </Button>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-3">
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
  );
};

export default StandaloneAreaAnalysisTool;