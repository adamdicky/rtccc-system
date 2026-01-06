'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"; // Import Button
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react"; // Import Trash icon
import { Room, Door, Fixture, Path } from "@/lib/ai-agent/types";

interface InspectorProps {
  selectedObject: Room | Door | Fixture | Path | null;
  onUpdate: (updatedObject: any) => void;
  onDelete: (id: string, type: string) => void; // Add onDelete prop
}

export function InspectorSidebar({ selectedObject, onUpdate, onDelete }: InspectorProps) {
  if (!selectedObject) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-slate-400 italic bg-slate-50 border-l">
        <p>Select an element to inspect</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l w-80 shadow-xl z-20">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">{selectedObject.type} Properties</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
          onClick={() => onDelete(selectedObject.id, selectedObject.type)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* === ROOM PROPERTIES === */}
        {selectedObject.type === 'room' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select 
                value={selectedObject.roomType} 
                onValueChange={(val) => onUpdate({ ...selectedObject, roomType: val })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Habitable">Habitable</SelectItem>
                  <SelectItem value="Utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Area (m²)</Label>
              <Input 
                type="number" 
                value={selectedObject.area} 
                onChange={(e) => onUpdate({ ...selectedObject, area: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ceiling Height (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.ceilingHeight} 
                onChange={(e) => onUpdate({ ...selectedObject, ceilingHeight: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        {/* === DOOR PROPERTIES === */}
        {selectedObject.type === 'door' && (
          <div className="space-y-4">
             <div className="space-y-2">
              <Label>Door Width (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.width} 
                onChange={(e) => onUpdate({ ...selectedObject, width: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Swing Direction</Label>
              <Select 
                value={selectedObject.swingDirection} 
                onValueChange={(val) => onUpdate({ ...selectedObject, swingDirection: val as 'LH' | 'RH' })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LH">Left Hand (LH)</SelectItem>
                  <SelectItem value="RH">Right Hand (RH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="flex items-center gap-2 mt-4">
               <input 
                 type="checkbox" 
                 checked={selectedObject.isRequiredExit}
                 onChange={(e) => onUpdate({...selectedObject, isRequiredExit: e.target.checked})}
                 className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
               />
               <Label className="mb-0">Is Required Exit?</Label>
             </div>
          </div>
        )}

        {/* === FIXTURE PROPERTIES === */}
        {selectedObject.type === 'fixture' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fixture Name</Label>
              <Input 
                value={selectedObject.name} 
                onChange={(e) => onUpdate({ ...selectedObject, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Clearance Width (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.clearanceWidth} 
                onChange={(e) => onUpdate({ ...selectedObject, clearanceWidth: Number(e.target.value) })}
              />
            </div>
             <div className="space-y-2">
              <Label>Clearance Depth (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.clearanceDepth} 
                onChange={(e) => onUpdate({ ...selectedObject, clearanceDepth: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        {/* === PATH PROPERTIES === */}
        {selectedObject.type === 'path' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Path Width (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.pathWidth} 
                onChange={(e) => onUpdate({ ...selectedObject, pathWidth: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        {/* COMMON PROPERTIES (X/Y) */}
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Pos X</Label>
              <Input 
                type="number" 
                value={Math.round(selectedObject.x)} 
                onChange={(e) => onUpdate({ ...selectedObject, x: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Pos Y</Label>
              <Input 
                type="number" 
                value={Math.round(selectedObject.y)} 
                onChange={(e) => onUpdate({ ...selectedObject, y: Number(e.target.value) })}
              />
            </div>
        </div>
      </div>
    </div>
  );
}