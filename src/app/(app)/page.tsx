'use client';

import React, { useState, useEffect } from 'react';
import FloorplanCanvas from '@/components/canvas/FloorplanCanvas';
import { InspectorSidebar } from '@/components/canvas/InspectorSidebar';
import { Toolbar } from '@/components/canvas/Toolbar';
import { ComplianceReport } from '@/components/canvas/ComplianceReport'; // Make sure this is created
import { Room, Door, Fixture, Path } from '@/lib/ai-agent/types';
import { runRTCCC } from '@/lib/ai-agent/inference-engine'; // The "Brain"

export default function RTCCCApp() {
  // 1. Environmental State
  const [rooms, setRooms] = useState<Room[]>([
    { 
      id: 'room-1', type: 'room', roomType: 'Office', 
      x: 100, y: 100, width: 20, height: 20, 
      area: 4, ceilingHeight: 2200 
    }
  ]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  
  // 2. Agent Reasoning State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [allViolations, setAllViolations] = useState<any[]>([]); // <--- Here it is!

  // 3. The Agent Loop: Sensing -> Reasoning
  useEffect(() => {
    const currentData = { rooms, doors, fixtures, paths };
    const results = runRTCCC(currentData);
    setAllViolations(results);
  }, [rooms, doors, fixtures, paths]);

  // --- Actions/Actuators ---

  const addRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      type: 'room',
      roomType: 'Habitable',
      x: 50, y: 50, width: 30, height: 30, 
      area: 9, 
      ceilingHeight: 2500,
    };
    setRooms([...rooms, newRoom]);
  };

  const addDoor = () => {
    const newDoor: Door = {
      id: `door-${Date.now()}`,
      type: 'door',
      x: 150, y: 150, width: 915, height: 10,
      isRequiredExit: true,
      swingDirection: 'LH',
    };
    setDoors([...doors, newDoor]);
  };

  const addFixture = () => {
    const newFixture: Fixture = {
      id: `fix-${Date.now()}`,
      type: 'fixture',
      name: 'Sink',
      x: 200, y: 200, width: 10, height: 10,
      isAccessible: true,
      clearanceWidth: 800,
      clearanceDepth: 1200,
    };
    setFixtures([...fixtures, newFixture]);
  };

  const addPath = () => {
    const newPath: Path = {
      id: `path-${Date.now()}`,
      type: 'path',
      x: 0, y: 300, width: 800, height: 120,
      pathWidth: 1200,
    };
    setPaths([...paths, newPath]);
  };

  const handleUpdate = (updatedObj: any) => {
    if (updatedObj.type === 'room') setRooms(rooms.map(r => r.id === updatedObj.id ? updatedObj : r));
    if (updatedObj.type === 'door') setDoors(doors.map(d => d.id === updatedObj.id ? updatedObj : d));
    if (updatedObj.type === 'fixture') setFixtures(fixtures.map(f => f.id === updatedObj.id ? updatedObj : f));
    if (updatedObj.type === 'path') setPaths(paths.map(p => p.id === updatedObj.id ? updatedObj : p));
  };

  const loadDemoScenario = () => {
    setRooms([{ id: 'demo-room-1', type: 'room', roomType: 'Office', x: 100, y: 100, width: 20, height: 20, area: 4, ceilingHeight: 2200 }]);
    setDoors([{ id: 'demo-door-1', type: 'door', x: 320, y: 150, width: 800, height: 10, isRequiredExit: true, swingDirection: 'LH' }]);
    setFixtures([{ id: 'demo-fix-1', type: 'fixture', name: 'Accessible Sink', x: 120, y: 120, width: 10, height: 10, isAccessible: true, clearanceWidth: 800, clearanceDepth: 1200 }]);
    setPaths([]);
  };

  const selectedObject = rooms.find(r => r.id === selectedId) || doors.find(d => d.id === selectedId) || fixtures.find(f => f.id === selectedId) || paths.find(p => p.id === selectedId) || null;

  const saveToPayload = async () => {
    const projectData = { rooms, doors, fixtures, paths };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Design ${new Date().toLocaleTimeString()}`,
          floorplanData: projectData,
          status: allViolations.length > 0 ? 'non-compliant' : 'compliant',
        }),
      });

      if (response.ok) {
        alert("Agent Memory Updated: Project saved to PayloadCMS!");
      }
    } catch (error) {
      console.error("Failed to save to memory:", error);
    }
  };

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

        <Toolbar onAddRoom={addRoom} onAddDoor={addDoor} onAddFixture={addFixture} onAddPath={addPath} onRunSimulation={loadDemoScenario} onSave={saveToPayload}/>
        
        <div className="flex-1 relative flex flex-col overflow-hidden">
          <div className="flex-1 bg-slate-200 relative overflow-auto">
            <FloorplanCanvas rooms={rooms} setRooms={setRooms} doors={doors} setDoors={setDoors} fixtures={fixtures} setFixtures={setFixtures} paths={paths} setPaths={setPaths} setSelectedId={setSelectedId} selectedId={selectedId} />
          </div>
          
          {/* The reasoning log visible at the bottom */}
          <ComplianceReport violations={allViolations} />
        </div>
      </div>

      <InspectorSidebar selectedObject={selectedObject} onUpdate={handleUpdate} />
    </main>
  );
}