import React, { useEffect, useState, useCallback } from 'react';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, MapPin, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [selectedRegion, setSelectedRegion] = useState<string>('alberta');
  const { toast } = useToast();

  // Predefined analysis regions (updated for Alberta focus)
  const regions = {
    alberta: { name: 'Alberta, Canada', extent: { xmin: -120.0, ymin: 49.0, xmax: -110.0, ymax: 60.0 } },
    calgary: { name: 'Calgary Region', extent: { xmin: -114.5, ymin: 50.8, xmax: -113.8, ymax: 51.3 } },
    edmonton: { name: 'Edmonton Region', extent: { xmin: -114.0, ymin: 53.3, xmax: -113.2, ymax: 53.8 } },
    fortmcmurray: { name: 'Fort McMurray Region', extent: { xmin: -111.8, ymin: 56.4, xmax: -110.8, ymax: 57.0 } },
    usa: { name: 'United States', extent: { xmin: -125, ymin: 25, xmax: -65, ymax: 50 } }
  };

  // Initialize the tool
  useEffect(() => {
    toast({
      title: "Analysis Tool Ready",
      description: "Select a region and click analyze to get started"
    });
  }, [toast]);

  const analyzeRegion = useCallback(async () => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Get the selected region extent
      const region = regions[selectedRegion as keyof typeof regions];
      const analysisExtent = {
        type: 'extent' as const,
        xmin: region.extent.xmin,
        ymin: region.extent.ymin,
        xmax: region.extent.xmax,
        ymax: region.extent.ymax,
        spatialReference: { wkid: 4326 }
      };

      // Alberta Seismic Web Map Feature Layers
      const layersToAnalyze = layers.length > 0 ? layers : [
        // Oil and Gas Infrastructure
        "https://www.arcgis.com/home/item.html?id=a0ee1bee1871454f8cfb3a7a2f363232", // Oil and Gas Well - Surface Location
        "https://www.arcgis.com/home/item.html?id=a05635f4a8d549ae8312225695f89b3b", // Oil and Gas Pipeline
        
        // Trails and Access
        "https://geospatial.alberta.ca/titan/rest/services/boundary/trails/FeatureServer/1", // Winter Trails
        "https://geospatial.alberta.ca/titan/rest/services/boundary/trails/FeatureServer/2", // Summer Trails
        
        // Water Features
        "https://www.arcgis.com/home/item.html?id=121da69db16b4b7893539d9c9afd1651", // Spring Locations
        
        // Protected Areas and Boundaries
        "https://geospatial.alberta.ca/titan/rest/services/boundary/parks_protected_areas_alberta/FeatureServer/0", // Protected Area Designations
        "https://geospatial.alberta.ca/titan/rest/services/boundaries/federal_indian_reserve/FeatureServer/0", // First Nations Reserve
        "https://geospatial.alberta.ca/titan/rest/services/boundaries/municipal_metis_settlement_public/FeatureServer/0", // Métis Settlement
        
        // Wildlife and Conservation
        "https://geospatial.alberta.ca/titan/rest/services/boundaries/fishwild_wmu_biologist_contact_public/FeatureServer/0", // Wildlife Management Units
        "https://geospatial.alberta.ca/titan/rest/services/boundaries/registered_fur_managment/FeatureServer/0", // Trapper Area
        
        // Administrative Boundaries
        "https://geospatial.alberta.ca/titan/rest/services/boundaries/land_division_boundaries_public/FeatureServer/0", // Lands Division Working Zones
        "https://geospatial.alberta.ca/titan/rest/services/boundaries/land_division_boundaries_public/FeatureServer/1", // Lands Division Districts
        "https://geospatial.alberta.ca/titan/rest/services/boundaries/land_division_boundaries_public/FeatureServer/2"  // Lands Division Regions
      ];

      const results: AnalysisResult[] = [];

      for (const layerUrl of layersToAnalyze) {
        try {
          const layer = new FeatureLayer({ url: layerUrl });
          await layer.load();

          const query = layer.createQuery();
          query.geometry = analysisExtent;
          query.spatialRelationship = 'intersects';
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
        description: `Found ${totalFeatures} features in ${regions[selectedRegion as keyof typeof regions].name}`
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
  }, [selectedRegion, layers, toast]);

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
            <p>1. Select a geographic region to analyze</p>
            <p>2. Click "Analyze Region" to run analysis</p>
            <p>3. Download results when complete</p>
          </CardContent>
        </Card>

        {/* Region Selection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Analysis Region</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose region" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(regions).map(([key, region]) => (
                  <SelectItem key={key} value={key}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Analysis Button */}
        <Button 
          onClick={analyzeRegion}
          disabled={isAnalyzing}
          className="w-full flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          {isAnalyzing ? 'Analyzing...' : `Analyze ${regions[selectedRegion as keyof typeof regions].name}`}
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