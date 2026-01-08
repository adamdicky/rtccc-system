'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Room, Door, Fixture, Path } from "@/lib/ai-agent/types";

interface InspectorProps {
  selectedObject: Room | Door | Fixture | Path | null;
  onUpdate: (updatedObject: any) => void;
  onDelete: (id: string, type: string) => void;
}

export function InspectorSidebar({ selectedObject, onUpdate, onDelete }: InspectorProps) {
  if (!selectedObject) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-slate-400 italic bg-slate-50 border-l w-96">
        <p>Select an element to inspect</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l w-96 shadow-xl z-20">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">{selectedObject.type} Properties</h3>
        <Button 
          variant="ghost" size="icon" className="text-red-500 hover:bg-red-50"
          onClick={() => onDelete(selectedObject.id, selectedObject.type)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* === ROOM === */}
        {selectedObject.type === 'room' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={selectedObject.roomType} onValueChange={(v) => onUpdate({ ...selectedObject, roomType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Habitable">Habitable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Area (m²)</Label>
              <Input 
                type="number" 
                value={selectedObject.area} 
                onChange={(e) => {
                  const area = Number(e.target.value);
                  const side = Math.sqrt(area) * 1000;
                  onUpdate({ ...selectedObject, area, width: side, height: side });
                }}
              />
            </div>
            {/* Dimensions visible only for Room */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">W (mm)</Label>
                <Input type="number" value={Math.round(selectedObject.width)} onChange={(e) => onUpdate({ ...selectedObject, width: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">H (mm)</Label>
                <Input type="number" value={Math.round(selectedObject.height)} onChange={(e) => onUpdate({ ...selectedObject, height: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        )}

        {/* === DOOR === */}
        {selectedObject.type === 'door' && (
          <div className="space-y-4">
             <div className="space-y-2">
              <Label>Door Width (mm)</Label>
              <Input type="number" value={selectedObject.width} onChange={(e) => onUpdate({ ...selectedObject, width: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rotation</Label>
                <Select 
                  value={String(selectedObject.rotation || 0)} 
                  onValueChange={(val) => onUpdate({ ...selectedObject, rotation: Number(val) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0°</SelectItem>
                    <SelectItem value="90">90°</SelectItem>
                    <SelectItem value="180">180°</SelectItem>
                    <SelectItem value="270">270°</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Swing</Label>
                <Select 
                  value={selectedObject.swingDirection} 
                  onValueChange={(val) => onUpdate({ ...selectedObject, swingDirection: val as 'LH' | 'RH' })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LH">LH</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* === FIXTURE === */}
        {selectedObject.type === 'fixture' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={selectedObject.name} onChange={(e) => onUpdate({ ...selectedObject, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clearance W (mm)</Label>
                <Input type="number" value={selectedObject.clearanceWidth} onChange={(e) => onUpdate({ ...selectedObject, clearanceWidth: Number(e.target.value) })} />
              </div>
               <div className="space-y-2">
                <Label>Clearance D (mm)</Label>
                <Input type="number" value={selectedObject.clearanceDepth} onChange={(e) => onUpdate({ ...selectedObject, clearanceDepth: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        )}

        {/* === PATH === */}
        {selectedObject.type === 'path' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Path Width (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.pathWidth} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdate({ ...selectedObject, pathWidth: val, height: val });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Length (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.width} 
                onChange={(e) => onUpdate({ ...selectedObject, width: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        <Separator className="my-6" />
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase">Position</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">X</Label>
              <Input type="number" value={Math.round(selectedObject.x)} onChange={(e) => onUpdate({ ...selectedObject, x: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Y</Label>
              <Input type="number" value={Math.round(selectedObject.y)} onChange={(e) => onUpdate({ ...selectedObject, y: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}