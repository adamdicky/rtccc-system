'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Arc, Arrow } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
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

  // UPDATED INTERFACE: Project (Paper) Dimensions
  projectWidth: number;
  projectHeight: number;
  scale: number;
}

export default function FloorplanCanvas({ 
  rooms, setRooms, 
  doors, setDoors, 
  fixtures, setFixtures, 
  paths, setPaths, 
  selectedId, setSelectedId,
  projectWidth, projectHeight, scale 
}: FloorplanCanvasProps) {
  
  // 1. Viewport State (Screen Size)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize Observer to fit the Stage to the parent DIV perfectly
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const [violations, setViolations] = useState<any[]>([]);

  // Scale Strategy: 1 Meter = 50 Pixels (Visual only)
  const PX_PER_MM = 0.05; 

  useEffect(() => {
    const currentData = { rooms, doors, fixtures, paths };
    const foundViolations = runRTCCC(currentData);
    setViolations(foundViolations);
  }, [rooms, doors, fixtures, paths]);

  // Drag Handlers
  const handleDrag = (id: string, type: string, e: KonvaEventObject<DragEvent>) => {
    const newX = e.target.x();
    const newY = e.target.y();

    if (type === 'room') setRooms(prev => prev.map(r => r.id === id ? { ...r, x: newX, y: newY } : r));
    if (type === 'door') setDoors(prev => prev.map(d => d.id === id ? { ...d, x: newX, y: newY } : d));
    if (type === 'fixture') setFixtures(prev => prev.map(f => f.id === id ? { ...f, x: newX, y: newY } : f));
    if (type === 'path') setPaths(prev => prev.map(p => p.id === id ? { ...p, x: newX, y: newY } : p));
  };

  if (stageSize.width === 0) {
    return <div ref={containerRef} className="w-full h-full bg-slate-200" />;
  }

  // Calculate the visual size of the "Paper"
  const paperWidth = projectWidth * PX_PER_MM;
  const paperHeight = projectHeight * PX_PER_MM;

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-300 overflow-hidden relative">
      <Stage 
        width={stageSize.width}   // Stage = Screen Size (Fast!)
        height={stageSize.height} 
        scaleX={scale}
        scaleY={scale}
        draggable // Panning moves the camera, not the pixels
      >
        <Layer>
          {/* 1. The "Paper" (Your Project Area) */}
          <Group>
             <Rect 
                width={paperWidth} 
                height={paperHeight} 
                fill="white" 
                shadowColor="black"
                shadowBlur={20}
                shadowOpacity={0.2}
             />
             {/* Paper Grid Lines (Optional visual cue) */}
             <Rect 
                width={paperWidth} 
                height={paperHeight} 
                stroke="#e2e8f0" 
                strokeWidth={1}
             />
          </Group>

          {/* 2. Dimensions / Rulers (Attached to the Paper) */}
          <Group name="dimensions">
            {/* Top Width Ruler */}
            <Arrow 
                points={[0, -20, paperWidth, -20]} 
                pointerLength={10} pointerWidth={10} 
                fill="#64748b" stroke="#64748b" strokeWidth={2} 
                pointerAtBeginning 
            />
            <Text 
                x={paperWidth / 2 - 50} y={-40} 
                text={`${projectWidth} mm`} 
                fontSize={14} fill="#475569" fontStyle="bold"
            />
            
            {/* Left Height Ruler */}
            <Arrow 
                points={[-20, 0, -20, paperHeight]} 
                pointerLength={10} pointerWidth={10} 
                fill="#64748b" stroke="#64748b" strokeWidth={2} 
                pointerAtBeginning 
            />
            <Text 
                x={-40} y={paperHeight / 2} 
                text={`${projectHeight} mm`} 
                fontSize={14} fill="#475569" fontStyle="bold" rotation={-90}
            />
          </Group>

          {/* 3. Rooms */}
          {rooms.map((room) => {
            const isViolating = violations.some(v => v.id === room.id);
            const renderW = room.width * PX_PER_MM;
            const renderH = room.height * PX_PER_MM;
            
            return (
              <Group 
                key={room.id} 
                x={room.x} y={room.y}
                draggable
                onDragEnd={(e) => handleDrag(room.id, 'room', e)} 
                onClick={() => setSelectedId(room.id)}
              >
                <Rect
                  width={renderW} height={renderH}
                  fill={isViolating ? "rgba(239, 68, 68, 0.1)" : selectedId === room.id ? "#f0f9ff" : "#f8fafc"}
                  stroke={isViolating ? "#ef4444" : selectedId === room.id ? "#0ea5e9" : "#cbd5e1"}
                  strokeWidth={2}
                />
                <Text 
                  x={5} y={5} 
                  text={`${room.roomType}\n${room.area}m²`} 
                  fontSize={11} 
                  fill={isViolating ? "#b91c1c" : "#475569"} 
                />
              </Group>
            );
          })}

          {/* 4. Paths */}
          {paths.map((path) => (
            <Group 
              key={path.id} 
              x={path.x} y={path.y}
              draggable
              onDragEnd={(e) => handleDrag(path.id, 'path', e)} 
              onClick={() => setSelectedId(path.id)}
            >
              <Rect
                width={path.width * PX_PER_MM} height={path.height * PX_PER_MM}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                dash={[5, 5]}
              />
              <Text x={5} y={5} text="Egress" fontSize={10} fill="#3b82f6" />
            </Group>
          ))}

          {/* 5. Doors */}
          {doors.map((door) => {
            const isViolating = violations.some(v => v.id === door.id);
            const doorW = door.width * PX_PER_MM; 
            
            return (
              <Group 
                key={door.id} 
                x={door.x} y={door.y}
                draggable
                onDragEnd={(e) => handleDrag(door.id, 'door', e)} 
                onClick={() => setSelectedId(door.id)}
              >
                <Rect
                  width={doorW} height={6} 
                  fill={isViolating ? "#ef4444" : "#1e293b"}
                  stroke={selectedId === door.id ? "#0ea5e9" : "none"}
                />
                <Arc
                  x={door.swingDirection === 'LH' ? 0 : doorW}
                  y={0}
                  innerRadius={doorW}
                  outerRadius={doorW}
                  angle={90}
                  rotation={door.swingDirection === 'LH' ? 0 : 90}
                  stroke={isViolating ? "#ef4444" : "#94a3b8"}
                  dash={[4, 4]}
                />
                <Text x={0} y={-20} text={`${door.width}mm`} fontSize={10} fill="#64748b"/>
              </Group>
            );
          })}

          {/* 6. Fixtures */}
          {fixtures.map((fixture) => {
            const isViolating = violations.some(v => v.id === fixture.id);
            const w = fixture.width * PX_PER_MM;
            const h = fixture.height * PX_PER_MM;
            const clW = fixture.clearanceWidth * PX_PER_MM;
            const clD = fixture.clearanceDepth * PX_PER_MM;

            return (
              <Group 
                key={fixture.id} 
                x={fixture.x} y={fixture.y}
                draggable
                onDragEnd={(e) => handleDrag(fixture.id, 'fixture', e)} 
                onClick={() => setSelectedId(fixture.id)}
              >
                <Rect
                  x={-(clW - w)/2} y={-(clD - h)/2} 
                  width={clW} height={clD}
                  fill={isViolating ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.05)"}
                  stroke={isViolating ? "#ef4444" : "#22c55e"}
                  dash={[2, 2]}
                />
                <Rect width={w} height={h} fill="#64748b" cornerRadius={2} />
                <Text x={0} y={h + 5} text={fixture.name} fontSize={10} />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}