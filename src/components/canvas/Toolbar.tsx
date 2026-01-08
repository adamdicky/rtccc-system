'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Square, DoorOpen, Bath, MoveRight, 
  PlayCircle, FolderOpen, Save, 
  ZoomIn, ZoomOut, Maximize 
} from "lucide-react";

interface ToolbarProps {
  onAddRoom: () => void;
  onAddDoor: () => void;
  onAddFixture: () => void;
  onAddPath: () => void;
  onRunSimulation: () => void;
  onSave: () => void;
  onLoad: () => void;
  
  // Canvas Resizing
  canvasWidth: number;
  setCanvasWidth: (w: number) => void;
  canvasHeight: number;
  setCanvasHeight: (h: number) => void;

  // Zoom Controls
  scale: number;
  setScale: (s: number) => void;
}

export function Toolbar({ 
  onAddRoom, onAddDoor, onAddFixture, onAddPath, 
  onRunSimulation, onSave, onLoad,
  canvasWidth, setCanvasWidth, canvasHeight, setCanvasHeight,
  scale, setScale
}: ToolbarProps) {
  
  const handleZoomIn = () => setScale(Math.min(3, scale + 0.1));
  const handleZoomOut = () => setScale(Math.max(0.5, scale - 0.1));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="flex gap-2 p-2 bg-white border-b shadow-sm z-10 items-center justify-between overflow-x-auto">
      <div className="flex items-center gap-2">
        {/* 1. Creation Tools */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button variant="outline" size="sm" onClick={onAddRoom} title="Add Room">
            <Square className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Room</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onAddDoor} title="Add Door">
            <DoorOpen className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Door</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onAddFixture} title="Add Fixture">
            <Bath className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Fixture</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onAddPath} title="Add Path">
            <MoveRight className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Path</span>
          </Button>
        </div>

        {/* 2. Zoom & View Controls */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono flex items-center w-12 justify-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleResetZoom} title="Reset View">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        {/* 3. Canvas Resizer Inputs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-1 rounded border hidden xl:flex">
          <span className="font-bold px-1">Stage Size:</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px]">W:</span>
            <Input 
              type="number" 
              className="h-7 w-16 text-xs px-1" 
              value={canvasWidth} 
              onChange={(e) => setCanvasWidth(Number(e.target.value))} 
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px]">H:</span>
            <Input 
              type="number" 
              className="h-7 w-16 text-xs px-1" 
              value={canvasHeight} 
              onChange={(e) => setCanvasHeight(Number(e.target.value))} 
            />
          </div>
        </div>
      </div>

      {/* 4. File & Simulation Operations */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onRunSimulation} className="text-blue-600 bg-blue-50 hover:bg-blue-100">
          <PlayCircle className="w-4 h-4 mr-2" /> Demo
        </Button>
        <Button variant="outline" size="sm" onClick={onLoad}>
          <FolderOpen className="w-4 h-4 mr-2" /> Load
        </Button>
        <Button variant="outline" size="sm" onClick={onSave} className="border-green-600 text-green-600 hover:bg-green-50">
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
      </div>
    </div>
  );
}