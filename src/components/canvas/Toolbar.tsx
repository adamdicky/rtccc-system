'use client';

import { Button } from "@/components/ui/button";
import { Square, DoorOpen, Bath, MoveRight, PlayCircle, FolderOpen, Save } from "lucide-react"; // Added Icons

interface ToolbarProps {
  onAddRoom: () => void;
  onAddDoor: () => void;
  onAddFixture: () => void;
  onAddPath: () => void;
  onRunSimulation: () => void;
  onSave: () => void;
  onLoad: () => void; // <--- Add this
}

export function Toolbar({ 
  onAddRoom, onAddDoor, onAddFixture, onAddPath, onRunSimulation, onSave, onLoad 
}: ToolbarProps) {
  return (
    <div className="flex gap-2 p-2 bg-white border-b shadow-sm z-10 items-center justify-between">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onAddRoom}>
          <Square className="w-4 h-4 mr-2" /> Room
        </Button>
        <Button variant="outline" size="sm" onClick={onAddDoor}>
          <DoorOpen className="w-4 h-4 mr-2" /> Door
        </Button>
        <Button variant="outline" size="sm" onClick={onAddFixture}>
          <Bath className="w-4 h-4 mr-2" /> Fixture
        </Button>
        <Button variant="outline" size="sm" onClick={onAddPath}>
          <MoveRight className="w-4 h-4 mr-2" /> Path
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onRunSimulation} className="text-blue-600 bg-blue-50 hover:bg-blue-100">
          <PlayCircle className="w-4 h-4 mr-2" /> Demo
        </Button>
        
        {/* Load Button */}
        <Button variant="outline" size="sm" onClick={onLoad}>
          <FolderOpen className="w-4 h-4 mr-2" /> Load
        </Button>

        {/* Save Button */}
        <Button variant="outline" size="sm" onClick={onSave} className="border-green-600 text-green-600 hover:bg-green-50">
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
      </div>
    </div>
  );
}