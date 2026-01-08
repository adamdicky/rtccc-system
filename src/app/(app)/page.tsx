'use client';

import React, { useState, useEffect } from 'react';
import FloorplanCanvas from '@/components/canvas/FloorplanCanvas';
import { InspectorSidebar } from '@/components/canvas/InspectorSidebar';
import { Toolbar } from '@/components/canvas/Toolbar';
import { ComplianceReport } from '@/components/canvas/ComplianceReport';
import { Room, Door, Fixture, Path } from '@/lib/ai-agent/types';
import { runRTCCC } from '@/lib/ai-agent/inference-engine';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RTCCCApp() {
  // 1. Environmental State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  
  // 2. Agent Reasoning State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [allViolations, setAllViolations] = useState<any[]>([]);
  
  // 3. Load/Save System State
  const [isLoadSheetOpen, setIsLoadSheetOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  // 4. Canvas View State
  // Default Project Size: 10,000mm x 8,000mm (10m x 8m)
  const [canvasWidth, setCanvasWidth] = useState<number>(10000); 
  const [canvasHeight, setCanvasHeight] = useState<number>(8000);
  const [scale, setScale] = useState<number>(1);

  // The Agent Loop
  useEffect(() => {
    const currentData = { rooms, doors, fixtures, paths };
    const results = runRTCCC(currentData);
    setAllViolations(results);
  }, [rooms, doors, fixtures, paths]);

  // --- Actions (Using Millimeters) ---

  const addRoom = () => {
    // 9m² room = 3000mm x 3000mm
    const newRoom: Room = { 
      id: `room-${Date.now()}`, type: 'room', roomType: 'Habitable', 
      x: 100, y: 100, 
      width: 3000, height: 3000, 
      area: 9, ceilingHeight: 2500 
    };
    setRooms([...rooms, newRoom]);
  };

  const addDoor = () => {
    // Standard Door = 915mm
    const newDoor: Door = { 
      id: `door-${Date.now()}`, type: 'door', 
      x: 400, y: 400, 
      width: 915, height: 40, 
      isRequiredExit: true, swingDirection: 'LH' 
    };
    setDoors([...doors, newDoor]);
  };

  const addFixture = () => {
    // Sink = 500mm x 500mm box
    const newFixture: Fixture = { 
      id: `fix-${Date.now()}`, type: 'fixture', name: 'Sink', 
      x: 600, y: 600, 
      width: 500, height: 500, 
      isAccessible: true, clearanceWidth: 800, clearanceDepth: 1200 
    };
    setFixtures([...fixtures, newFixture]);
  };

  const addPath = () => {
    // 3m Long path, 1.2m Wide
    const newPath: Path = { 
      id: `path-${Date.now()}`, type: 'path', 
      x: 50, y: 800, 
      width: 3000, height: 1200, // Width=Length, Height=Thickness
      pathWidth: 1200 
    };
    setPaths([...paths, newPath]);
  };

  const deleteObject = (id: string, type: string) => {
    if (type === 'room') setRooms(rooms.filter(r => r.id !== id));
    if (type === 'door') setDoors(doors.filter(d => d.id !== id));
    if (type === 'fixture') setFixtures(fixtures.filter(f => f.id !== id));
    if (type === 'path') setPaths(paths.filter(p => p.id !== id));
    setSelectedId(null);
  };

  const handleUpdate = (updatedObj: any) => {
    if (updatedObj.type === 'room') setRooms(rooms.map(r => r.id === updatedObj.id ? updatedObj : r));
    if (updatedObj.type === 'door') setDoors(doors.map(d => d.id === updatedObj.id ? updatedObj : d));
    if (updatedObj.type === 'fixture') setFixtures(fixtures.map(f => f.id === updatedObj.id ? updatedObj : f));
    if (updatedObj.type === 'path') setPaths(paths.map(p => p.id === updatedObj.id ? updatedObj : p));
  };

  const loadDemoScenario = () => {
    // Demo 4m² office = 2000mm x 2000mm
    setRooms([{ id: 'demo-room-1', type: 'room', roomType: 'Office', x: 200, y: 200, width: 2000, height: 2000, area: 4, ceilingHeight: 2200 }]);
    setDoors([{ id: 'demo-door-1', type: 'door', x: 450, y: 200, width: 850, height: 40, isRequiredExit: true, swingDirection: 'LH' }]);
    setFixtures([{ id: 'demo-fix-1', type: 'fixture', name: 'Accessible Sink', x: 120, y: 120, width: 500, height: 500, isAccessible: true, clearanceWidth: 800, clearanceDepth: 1200 }]);
    setPaths([]);
  };

  // --- API Handlers ---
  const saveToPayload = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Design ${new Date().toLocaleString()}`,
          floorplanData: { rooms, doors, fixtures, paths },
          status: allViolations.length > 0 ? 'non-compliant' : 'compliant',
        }),
      });
      if (response.ok) alert("Saved to PayloadCMS!");
      else alert("Failed to save. Check console.");
    } catch (e) { console.error(e); }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.docs) {
        setSavedProjects(data.docs);
        setIsLoadSheetOpen(true);
      }
    } catch (e) { console.error("Load Error:", e); }
  };

  const loadProject = (project: any) => {
    const data = project.floorplanData;
    if (data) {
      setRooms(data.rooms || []);
      setDoors(data.doors || []);
      setFixtures(data.fixtures || []);
      setPaths(data.paths || []);
      setIsLoadSheetOpen(false); 
    }
  };

  const selectedObject = rooms.find(r => r.id === selectedId) || doors.find(d => d.id === selectedId) || fixtures.find(f => f.id === selectedId) || paths.find(p => p.id === selectedId) || null;

  return (
    <main className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col relative">
        <header className="p-4 border-b bg-white flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">RTCCC System</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Real-Time Construction Compliance Checker</p>
          </div>
          <div className="flex gap-2">
            <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${
              allViolations.length > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"
            }`}>
              {allViolations.length > 0 ? `${allViolations.length} Violations` : "Compliant"}
            </div>
            <div className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-widest border border-slate-200">
              Agent: Goal-Based
            </div>
          </div>
        </header>

        <Toolbar 
          onAddRoom={addRoom} 
          onAddDoor={addDoor} 
          onAddFixture={addFixture} 
          onAddPath={addPath} 
          onRunSimulation={loadDemoScenario} 
          onSave={saveToPayload}
          onLoad={fetchProjects} 
          // Canvas Props passed down
          canvasWidth={canvasWidth}
          setCanvasWidth={setCanvasWidth}
          canvasHeight={canvasHeight}
          setCanvasHeight={setCanvasHeight}
          // Scale Props
          scale={scale}
          setScale={setScale}
        />
        
        <div className="flex-1 relative flex flex-col overflow-hidden">
          <div className="flex-1 bg-slate-200 relative overflow-hidden">
            <FloorplanCanvas 
              rooms={rooms} setRooms={setRooms} 
              doors={doors} setDoors={setDoors} 
              fixtures={fixtures} setFixtures={setFixtures} 
              paths={paths} setPaths={setPaths} 
              setSelectedId={setSelectedId} selectedId={selectedId}
              
              // NEW: Pass "Project" Dimensions (Paper Size)
              projectWidth={canvasWidth} 
              projectHeight={canvasHeight}
              
              scale={scale}
            />
          </div>
          <ComplianceReport violations={allViolations} />
        </div>
      </div>

      <InspectorSidebar selectedObject={selectedObject} onUpdate={handleUpdate} onDelete={deleteObject} />

      <Sheet open={isLoadSheetOpen} onOpenChange={setIsLoadSheetOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Saved Designs</SheetTitle>
            <SheetDescription>Select a past project.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[80vh]">
            {savedProjects.map((proj: any) => (
              <Card key={proj.id} className="p-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => loadProject(proj)}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm truncate">{proj.title}</span>
                  <Badge variant={proj.status === 'compliant' ? 'default' : 'destructive'} className="text-[10px]">
                    {proj.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(proj.createdAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
            {savedProjects.length === 0 && <p className="text-sm text-slate-500 text-center">No saved projects found.</p>}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}