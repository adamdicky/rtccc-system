'use client';

import React, { useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Arc } from 'react-konva';
import { runRTCCC } from '@/lib/ai-agent/inference-engine';
import { Room, Door, Fixture, Path } from '@/lib/ai-agent/types';

interface FloorplanCanvasProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  doors: Door[];
  setDoors: React.Dispatch<React.SetStateAction<Door[]>>;
  fixtures: Fixture[];
  setFixtures: React.Dispatch<React.SetStateAction<Fixture[]>>;
  paths: Path[];
  setPaths: React.Dispatch<React.SetStateAction<Path[]>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function FloorplanCanvas({ 
  rooms, setRooms, doors, setDoors, fixtures, setFixtures, paths, setPaths, selectedId, setSelectedId 
}: FloorplanCanvasProps) {
  
  const [violations, setViolations] = React.useState<any[]>([]);

  // Agent reasoning loop: Re-evaluates every time the environment state changes
  useEffect(() => {
    const currentData = { rooms, doors, fixtures, paths };
    const foundViolations = runRTCCC(currentData);
    setViolations(foundViolations);
  }, [rooms, doors, fixtures, paths]);

  // --- Helper Functions to fix the "Cannot find name" errors ---

  const handleDrag = (id: string, type: string, e: any) => {
    const newX = e.target.x();
    const newY = e.target.y();

    if (type === 'room') setRooms(prev => prev.map(r => r.id === id ? { ...r, x: newX, y: newY } : r));
    if (type === 'door') setDoors(prev => prev.map(d => d.id === id ? { ...d, x: newX, y: newY } : d));
    if (type === 'fixture') setFixtures(prev => prev.map(f => f.id === id ? { ...f, x: newX, y: newY } : f));
    if (type === 'path') setPaths(prev => prev.map(p => p.id === id ? { ...p, x: newX, y: newY } : p));
  };

  return (
    <div className="w-full h-full bg-slate-200 flex items-center justify-center p-8">
      <div className="bg-white shadow-2xl rounded-lg border border-slate-300">
        <Stage width={800} height={600}>
          <Layer>
            {/* KR 2 & 4: Render Rooms (Space & Comfort) */}
            {rooms.map((room) => {
              const isViolating = violations.some(v => v.id === room.id);
              return (
                <Group key={room.id} draggable onDragEnd={(e) => handleDrag(room.id, 'room', e)} onClick={() => setSelectedId(room.id)}>
                  <Rect
                    x={room.x} y={room.y}
                    width={room.width * 5} height={room.height * 5}
                    fill={isViolating ? "rgba(239, 68, 68, 0.1)" : selectedId === room.id ? "#f0f9ff" : "#f8fafc"}
                    stroke={isViolating ? "#ef4444" : selectedId === room.id ? "#0ea5e9" : "#cbd5e1"}
                    strokeWidth={2}
                  />
                  <Text x={room.x + 5} y={room.y + 5} text={`${room.roomType}\n${room.area}m²\n${room.ceilingHeight}mm`} fontSize={11} fill={isViolating ? "#b91c1c" : "#475569"} />
                </Group>
              );
            })}

            {/* KR 5: Render Egress Paths */}
            {paths.map((path) => (
              <Group key={path.id} draggable onDragEnd={(e) => handleDrag(path.id, 'path', e)} onClick={() => setSelectedId(path.id)}>
                <Rect
                  x={path.x} y={path.y}
                  width={path.width} height={path.height}
                  fill="rgba(59, 130, 246, 0.05)"
                  stroke="#3b82f6"
                  dash={[5, 5]}
                />
                <Text x={path.x + 5} y={path.y + 5} text="Egress Path Zone" fontSize={10} fill="#3b82f6" />
              </Group>
            ))}

            {/* KR 1 & 5: Render Doors (Fire Safety & Obstruction) */}
            {doors.map((door) => {
                const isViolating = violations.some(v => v.id === door.id);
                const SCALE = 10; 

                return (
                    <Group 
                    key={door.id} 
                    x={door.x} // Positioning the group at the door's coordinates
                    y={door.y}
                    draggable 
                    onDragEnd={(e) => handleDrag(door.id, 'door', e)} 
                    onClick={() => setSelectedId(door.id)}
                    >
                    {/* The Door Leaf (The actual door panel) */}
                    <Rect
                        x={0}
                        y={0}
                        width={door.width / SCALE} 
                        height={4} 
                        fill={isViolating ? "#ef4444" : "#1e293b"}
                        stroke={selectedId === door.id ? "#0ea5e9" : "none"}
                        strokeWidth={2}
                    />

                    {/* KR 5: The Swing Arc (The Agent's "Danger Zone" sensor) */}
                    <Arc
                        x={door.swingDirection === 'LH' ? 0 : door.width / SCALE}
                        y={0}
                        innerRadius={door.width / SCALE}
                        outerRadius={door.width / SCALE}
                        angle={90}
                        rotation={door.swingDirection === 'LH' ? 0 : 90}
                        stroke={isViolating ? "#ef4444" : "#94a3b8"}
                        dash={[2, 2]}
                    />

                    <Text 
                        x={0} 
                        y={-20} 
                        text={`Door: ${door.width}mm`} 
                        fontSize={10} 
                        fill={isViolating ? "#ef4444" : "#1e293b"} 
                    />
                    </Group>
                );
                })
            }

            {/* KR 3: Render Fixtures (Accessibility) */}
            {fixtures.map((fixture) => {
              const isViolating = violations.some(v => v.id === fixture.id);
              return (
                <Group key={fixture.id} draggable onDragEnd={(e) => handleDrag(fixture.id, 'fixture', e)} onClick={() => setSelectedId(fixture.id)}>
                  <Rect
                    x={fixture.x} y={fixture.y}
                    width={fixture.clearanceWidth / 10} height={fixture.clearanceDepth / 10}
                    fill={isViolating ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.05)"}
                    stroke={isViolating ? "#ef4444" : "#22c55e"}
                    dash={[2, 2]}
                  />
                  <Rect x={fixture.x} y={fixture.y} width={20} height={20} fill="#64748b" cornerRadius={2} />
                  <Text x={fixture.x} y={fixture.y + 25} text={fixture.name} fontSize={10} />
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}