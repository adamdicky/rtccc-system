import { Room, Door, Fixture, Path } from './types';

// Helper: Get bounding box (handling rotation)
function getBounds(obj: any) {
  const rotation = obj.rotation || 0;
  const isRotated = rotation === 90 || rotation === 270;
  
  // For paths/rooms/fixtures, width is X-axis size, height is Y-axis size (unless rotated)
  return {
    left: obj.x,
    top: obj.y,
    right: obj.x + (isRotated ? obj.height : obj.width),
    bottom: obj.y + (isRotated ? obj.width : obj.height),
  };
}

// Helper: Check intersection
function checkIntersection(box1: any, box2: any) {
  return (
    box1.left < box2.right &&
    box1.right > box2.left &&
    box1.top < box2.bottom &&
    box1.bottom > box2.top
  );
}

// Helper: Calculate Door Swing Zone
function getDoorSwingZone(door: Door) {
  const swingRadius = door.width;
  const rot = door.rotation || 0;
  
  // Simplified Swing Zone (Square box extending from hinge)
  if (rot === 0) {
    return { left: door.x, top: door.y, right: door.x + swingRadius, bottom: door.y + swingRadius };
  } else if (rot === 90) {
    return { left: door.x - swingRadius, top: door.y, right: door.x, bottom: door.y + swingRadius };
  } else if (rot === 180) {
    return { left: door.x - swingRadius, top: door.y - swingRadius, right: door.x, bottom: door.y };
  } else if (rot === 270) {
    return { left: door.x, top: door.y - swingRadius, right: door.x + swingRadius, bottom: door.y };
  }
  return { left: door.x, top: door.y, right: door.x + swingRadius, bottom: door.y + swingRadius };
}

/** KR 1: Fire Safety - Minimum Egress Door Width */
// Actuator: IncreaseWidth()
export function checkDoorWidth(door: Door, minWidth: number = 915) {
  if (door.isRequiredExit) {
    const isCompliant = door.width >= minWidth;
    return {
      compliant: isCompliant,
      message: isCompliant 
        ? "Compliant" 
        : `KR 1 Violation: Exit door too narrow (${door.width}mm). Suggestion: Increase width to ≥ ${minWidth}mm.`
    };
  }
  return { compliant: true };
}

/** KR 2: Space Planning - Minimum Room Area */
// Actuator: ExtendLength() or ExtendWidth()
export function checkRoomArea(room: Room, minArea: number = 9) {
  if (['Office', 'Habitable', 'Bedroom', 'Living'].includes(room.roomType)) {
    const isCompliant = room.area >= minArea;
    return {
      compliant: isCompliant,
      message: isCompliant 
        ? "Compliant" 
        : `KR 2 Violation: Room area ${room.area}m² < ${minArea}m². Suggestion: Extend room dimensions (Length/Width).`
    };
  }
  return { compliant: true };
}

/** KR 4: Indoor Comfort - Ceiling Height */
// Actuator: RaiseRoof()
export function checkCeilingHeight(room: Room, minHeight: number = 2400) {
  if (['Office', 'Habitable', 'Bedroom', 'Living'].includes(room.roomType)) {
    const isCompliant = room.ceilingHeight >= minHeight;
    return {
      compliant: isCompliant,
      message: isCompliant 
        ? "Compliant" 
        : `KR 4 Violation: Ceiling ${room.ceilingHeight}mm < ${minHeight}mm. Suggestion: Raise ceiling height.`
    };
  }
  return { compliant: true };
}

/** KR 3: Accessibility - Fixture Clearance */
// Actuators: Move(), Rotate(), Remove()
export function checkFixtureClearance(fixture: Fixture, context: { doors: Door[], paths: Path[], fixtures: Fixture[] }) {
  if (!fixture.isAccessible) return { compliant: true };

  // 1. Define Clearance Zone
  const clearanceZone = {
    left: fixture.x - (fixture.clearanceWidth - fixture.width) / 2,
    top: fixture.y - (fixture.clearanceDepth - fixture.height) / 2,
    right: fixture.x + fixture.width + (fixture.clearanceWidth - fixture.width) / 2,
    bottom: fixture.y + fixture.height + (fixture.clearanceDepth - fixture.height) / 2
  };

  // 2. Check overlap with PATHS (Egress)
  for (const path of context.paths) {
    if (checkIntersection(clearanceZone, getBounds(path))) {
      return { 
        id: fixture.id, 
        compliant: false, 
        message: `KR 3 Violation: Fixture clearance overlaps Egress Path. Suggestion: Move or rotate fixture away from path.` 
      };
    }
  }

  // 3. Check overlap with DOOR SWING ZONES
  for (const door of context.doors) {
    const swingZone = getDoorSwingZone(door);
    if (checkIntersection(clearanceZone, swingZone)) {
      return { 
        id: fixture.id, 
        compliant: false, 
        message: `KR 3 Violation: Fixture clearance hit by Door Swing. Suggestion: Move fixture or change door swing direction.` 
      };
    }
  }

  // 4. Check overlap with OTHER FIXTURES
  for (const other of context.fixtures) {
    if (other.id !== fixture.id) {
      if (checkIntersection(clearanceZone, getBounds(other))) {
        return { 
          id: fixture.id, 
          compliant: false, 
          message: `KR 3 Violation: Fixture clearance overlaps ${other.name}. Suggestion: Reposition fixture to ensure clear space.` 
        };
      }
    }
  }

  return { compliant: true };
}

/** KR 5: Fire Safety - Egress Obstruction */
// Actuators: Move(), Remove(), ChangeSwing()
export function checkEgressObstruction(door: Door, path: Path) {
  const swingZone = getDoorSwingZone(door);
  const pathBounds = getBounds(path);

  if (checkIntersection(swingZone, pathBounds)) {
    return {
      id: door.id,
      compliant: false,
      message: `KR 5 Violation: Door swing blocks Egress Path. Suggestion: Move door or change swing direction.`
    };
  }
  return { compliant: true };
}

/** MANAGER */
export function runRTCCC(data: { rooms: Room[], doors: Door[], fixtures: Fixture[], paths: Path[] }) {
  const violations: any[] = [];

  // KR 1 & KR 5: Doors
  data.doors.forEach(door => {
    const w = checkDoorWidth(door);
    if (!w.compliant) violations.push({ ...w, id: door.id });
    
    data.paths.forEach(path => {
      const p = checkEgressObstruction(door, path);
      if (!p.compliant) violations.push(p);
    });
  });

  // KR 2 & KR 4: Rooms
  data.rooms.forEach(room => {
    const areaCheck = checkRoomArea(room);
    const heightCheck = checkCeilingHeight(room);
    if (!areaCheck.compliant) violations.push({ ...areaCheck, id: room.id });
    if (!heightCheck.compliant) violations.push({ ...heightCheck, id: room.id });
  });

  // KR 3: Fixtures
  data.fixtures.forEach(fix => {
    const c = checkFixtureClearance(fix, { 
      doors: data.doors, 
      paths: data.paths, 
      fixtures: data.fixtures 
    });
    if (!c.compliant) violations.push(c);
  });

  return violations;
}