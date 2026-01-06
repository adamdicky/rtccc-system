'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room, Door, Fixture, Path } from "@/lib/ai-agent/types";

interface InspectorProps {
  selectedObject: Room | Door | Fixture | Path | null; // Updated to include Fixture and Path
  onUpdate: (updatedObject: any) => void;
}

export function InspectorSidebar({ selectedObject, onUpdate }: InspectorProps) {
  if (!selectedObject) {
    return <div className="p-4 text-slate-500 italic">Select an element to inspect.</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 w-80 border-l bg-white h-full overflow-y-auto">
      <div>
        <h3 className="text-lg font-bold capitalize">{selectedObject.type} Properties</h3>
      </div>
      <Separator />

      <div className="space-y-4">
        {/* Existing Room and Door logic ... */}

        {/* New Actuator logic for Fixtures (KR 3) [cite: 53] */}
        {selectedObject.type === 'fixture' && (
          <>
            <div className="grid w-full items-center gap-1.5">
              <Label>Clearance Width (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.clearanceWidth} 
                onChange={(e) => onUpdate({ ...selectedObject, clearanceWidth: Number(e.target.value) })}
              />
            </div>
          </>
        )}

        {/* New Actuator logic for Paths (KR 5) [cite: 60] */}
        {selectedObject.type === 'path' && (
          <>
            <div className="grid w-full items-center gap-1.5">
              <Label>Path Width (mm)</Label>
              <Input 
                type="number" 
                value={selectedObject.pathWidth} 
                onChange={(e) => onUpdate({ ...selectedObject, pathWidth: Number(e.target.value) })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}