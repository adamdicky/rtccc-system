// src/lib/ai-agent/inference-engine.ts
import { Room, Door, Fixture, Path } from './types';

/** * KR 1: Fire Safety – Minimum Egress Door Width
 * Logic: ∀x (IsRequiredExit(x) ∧ Width(x, w) → w ≥ 915) [cite: 49]
 */
export function checkDoorWidth(door: Door, minWidth: number = 915) {
  if (door.isRequiredExit) {
    const isCompliant = door.width >= minWidth;
    return {
      compliant: isCompliant,
      message: isCompliant 
        ? "Exit door width compliant." 
        : `Violation: Exit door too narrow (${door.width}mm).`
    };
  }
  return { compliant: true };
}

/** * KR 2: Space Planning – Minimum Room Area
 * Logic: ∀r (Room(r) ∧ RoomType(r, Office) → Area(r) ≥ 9) [cite: 52]
 */
export function checkRoomArea(room: Room, minArea: number = 9) {
  if (room.roomType === 'Office') {
    const isCompliant = room.area >= minArea;
    return {
      compliant: isCompliant,
      message: isCompliant 
        ? "Office area compliant." 
        : `Violation: Office area too small (${room.area}m²).`
    };
  }
  return { compliant: true };
}

/** * KR 3: Accessibility – Clear Space Around Fixtures
 * Logic: ∀f, o (IsAccessible(f) ∧ IsObstruction(o) ∧ OverlapsClearance(o, f) → ¬Compliant(f)) [cite: 56]
 */
export function checkFixtureClearance(fixture: Fixture, allObjects: any[]) {
  if (!fixture.isAccessible) return { compliant: true };

  // Calculate the 'Clearance Sensor' area
  const sensor = {
    left: fixture.x,
    top: fixture.y,
    right: fixture.x + fixture.clearanceWidth / 10, // Scaling to match canvas
    bottom: fixture.y + fixture.clearanceDepth / 10
  };

  // The Agent scans the environment for any object 'o' that isn't itself
  const obstruction = allObjects.find(o => {
    if (o.id === fixture.id) return false;

    // AABB Collision Math
    const objectBounds = {
      left: o.x,
      top: o.y,
      right: o.x + (o.width * (o.type === 'room' ? 5 : 1)), // Match canvas scaling
      bottom: o.y + (o.height * (o.type === 'room' ? 5 : 1))
    };

    return (
      sensor.left < objectBounds.right &&
      sensor.right > objectBounds.left &&
      sensor.top < objectBounds.bottom &&
      sensor.bottom > objectBounds.top
    );
  });

  if (obstruction) {
    return {
      id: fixture.id,
      compliant: false,
      message: `KR 3 Violation: ${fixture.name} accessibility clearance is blocked by a ${obstruction.type}.`
    };
  }
  return { compliant: true };
}

/** * KR 4: Indoor Comfort – Minimum Ceiling Height Standard
 * Logic: ∀r (Room(r) ∧ Habitable(r) → CeilingHeight(r) ≥ 2400) [cite: 59]
 */
export function checkCeilingHeight(room: Room, minHeight: number = 2400) {
  if (room.roomType === 'Habitable') {
    const isCompliant = room.ceilingHeight >= minHeight;
    return {
      compliant: isCompliant,
      message: isCompliant 
        ? "Ceiling height meets standards." 
        : `Violation: Ceiling height is ${room.ceilingHeight}mm (Min: ${minHeight}mm).`
    };
  }
  return { compliant: true };
}

/** * KR 5: Fire Safety – Clear Egress Path Obstruction
 * Logic: ∀d, p (Door(d) ∧ EgressPath(p) → ¬Obstructs(d, p)) [cite: 62]
 */
export function checkEgressObstruction(door: Door, path: Path) {
  // Logic: Is any part of the door rectangle inside the path rectangle?
  const doorBounds = {
    left: door.x,
    right: door.x + door.width / 10,
    top: door.y,
    bottom: door.y + 10
  };

  const pathBounds = {
    left: path.x,
    right: path.x + path.width,
    top: path.y,
    bottom: path.y + path.height
  };

  const isObstructed = (
    doorBounds.left < pathBounds.right &&
    doorBounds.right > pathBounds.left &&
    doorBounds.top < pathBounds.bottom &&
    doorBounds.bottom > pathBounds.top
  );

  return {
    id: door.id,
    compliant: !isObstructed,
    message: isObstructed 
      ? `KR 5 Violation: Door placement blocks the designated Egress Path.` 
      : "Path clear."
  };
}

/**
 * THE MANAGER: runRTCCC
 * This acts as the Goal-Based Agent's internal reasoning loop[cite: 43, 46].
 */
export function runRTCCC(floorplanData: { rooms: Room[], doors: Door[], fixtures: Fixture[], paths: Path[] }) {
  const violations: any[] = [];
  
  // Create a flat list of all environment objects for the "Obstruction Sensor"
  const allObjects = [
    ...floorplanData.rooms, 
    ...floorplanData.doors, 
    ...floorplanData.fixtures
  ];

  // KR 1 & KR 5: Doors
  floorplanData.doors.forEach(door => {
    const widthCheck = checkDoorWidth(door);
    if (!widthCheck.compliant) violations.push(widthCheck);
    
    floorplanData.paths.forEach(path => {
      const pathCheck = checkEgressObstruction(door, path);
      if (!pathCheck.compliant) violations.push(pathCheck);
    });
  });

  // KR 2 & KR 4: Rooms
  floorplanData.rooms.forEach(room => {
    const areaCheck = checkRoomArea(room);
    const heightCheck = checkCeilingHeight(room);
    if (!areaCheck.compliant) violations.push({ ...areaCheck, id: room.id });
    if (!heightCheck.compliant) violations.push({ ...heightCheck, id: room.id });
  });

  // KR 3: Fixtures
  floorplanData.fixtures.forEach(fixture => {
    const clearanceCheck = checkFixtureClearance(fixture, allObjects);
    if (!clearanceCheck.compliant) violations.push(clearanceCheck);
  });

  return violations;
}