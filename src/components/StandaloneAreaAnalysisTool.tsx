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
    if (!mapDiv.current) return;

    const initializeMap = async () => {
      try {
        // Create graphics l
