'use client';

import { Button } from "@/components/ui/button";
import { Square, DoorOpen, Bath, MoveRight, PlayCircle } from "lucide-react";

interface ToolbarProps {
  onAddRoom: () => void;
  onAddDoor: () => void;
  onAddFixture: () => void;
  onAddPath: () => void;
  onRunSimulation: () => void; // <-- Add this to the interface
  onSave: () => void;
}

export function Toolbar({ onAddRoom, onAddDoor, onAddFixture, onAddPath, onRunSimulation, onSave }: ToolbarProps) {
  return (
    <div className="flex gap-2 p-2 bg-white border-b shadow-sm z-10 items-center justify-between">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onAddRoom}>
          <Square className="w-4 h-4 mr-2" /> Add Room
        </Button>
        <Button variant="outline" size="sm" onClick={onAddDoor}>
          <DoorOpen className="w-4 h-4 mr-2" /> Add Door
        </Button>
        <Button variant="outline" size="sm" onClick={onAddFixture}>
          <Bath className="w-4 h-4 mr-2" /> Add Fixture
        </Button>
        <Button variant="outline" size="sm" onClick={onAddPath}>
          <MoveRight className="w-4 h-4 mr-2" /> Add Path
        </Button>
      </div>

      {/* The Demo Simulation Button */}
      <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onRunSimulation}>
        <PlayCircle className="w-4 h-4 mr-2" /> Run Demo Scenario
      </Button>
        <Button 
            variant="outline" 
            size="sm" 
            className="border-green-600 text-green-600 hover:bg-green-50" 
            onClick={onSave}
            >
            Save to Database
        </Button>
    </div>
  );
}