import { Room, Door, Fixture, Path } from './types';

// Helper: Get bounding box for any object
// Handles rotation (swaps width/height if rotated 90/270)
function getBounds(obj: any) {
  const rotation = obj.rotation || 0;
  const isRotated = rotation === 90 || rotation === 270;
  return {
    left: obj.x,
    top: obj.y,
    right: obj.x + (isRotated ? obj.height : obj.width),
    bottom: obj.y + (isRotated ? obj.width : obj.height),
  };
}

// Helper: AABB Intersection Check
function checkIntersection(box1: any, box2: any) {
  return (
    box1.left < box2.right &&
    box1.right > box2.left &&
    box1.top < box2.bottom &&
    box1.bottom > box2.top
  );
}

/** KR 1: Door Width */
export function checkDoorWidth(door: Door, minWidth: number = 915) {
  if (door.isRequiredExit) {
    const isCompliant = door.width >= minWidth;
    return {
      compliant: isCompliant,
      message: isCompliant 
        ? "Compliant" 
        : `Violation: Exit door too narrow (${door.width}mm).`
    };
  }
  return { compliant: true };
}

/** KR 2: Room Area */
export function checkRoomArea(room: Room, minArea: number = 9) {
  if (room.roomType === 'Office') {
    const isCompliant = room.area >= minArea;
    return {
      compliant: isCompliant,
      message: isCompliant 
        ? "Compliant" 
        : `Violation: Office too small (${room.area}m²).`
    };
  }
  return { compliant: true };
}

/** KR 3: Fixture Clearance */
export function checkFixtureClearance(fixture: Fixture, allObjects: any[]) {
  if (!fixture.isAccessible) return { compliant: true };

  // Sensor Area: Clearance zone centered on fixture (simplified)
  // or extending in front. Here we assume a box around the fixture.
  const clearanceZone = {
    left: fixture.x - (fixture.clearanceWidth - fixture.width) / 2,
    top: fixture.y - (fixture.clearanceDepth - fixture.height) / 2,
    right: fixture.x + fixture.width + (fixture.clearanceWidth - fixture.width) / 2,
    bottom: fixture.y + fixture.height + (fixture.clearanceDepth - fixture.height) / 2
  };

  const obstruction = allObjects.find(o => {
    if (o.id === fixture.id) return false;
    const oBounds = getBounds(o);
    return checkIntersection(clearanceZone, oBounds);
  });

  if (obstruction) {
    return {
      id: fixture.id,
      compliant: false,
      message: `KR 3 Violation: Clearance blocked by ${obstruction.type}.`
    };
  }
  return { compliant: true };
}

/** KR 4: Ceiling Height */
export function checkCeilingHeight(room: Room, minHeight: number = 2400) {
  if (room.roomType === 'Habitable') {
    const isCompliant = room.ceilingHeight >= minHeight;
    return {
      compliant: isCompliant,
      message: isCompliant ? "Compliant" : `Violation: Low ceiling (${room.ceilingHeight}mm).`
    };
  }
  return { compliant: true };
}

/** KR 5: Egress Obstruction (Door Swing vs Path) */
export function checkEgressObstruction(door: Door, path: Path) {
  // 1. Calculate the "Swing Zone" based on Rotation
  // We assume the Door Width is the radius of the swing.
  const swingRadius = door.width;
  let swingZone = { left: 0, top: 0, right: 0, bottom: 0 };

  // Based on rotation, we project the danger zone
  const rot = door.rotation || 0;
  
  if (rot === 0) {
    // Horizontal, Hinge Left, usually swings DOWN or UP. 
    // We cover both for safety or check swingDirection.
    swingZone = { left: door.x, top: door.y, right: door.x + swingRadius, bottom: door.y + swingRadius };
  } else if (rot === 90) {
    // Vertical, Hinge Top
    swingZone = { left: door.x - swingRadius, top: door.y, right: door.x, bottom: door.y + swingRadius };
  } else if (rot === 180) {
    // Horizontal, Hinge Right
    swingZone = { left: door.x - swingRadius, top: door.y - swingRadius, right: door.x, bottom: door.y };
  } else if (rot === 270) {
    // Vertical, Hinge Bottom
    swingZone = { left: door.x, top: door.y - swingRadius, right: door.x + swingRadius, bottom: door.y };
  }

  const pathBounds = getBounds(path);

  if (checkIntersection(swingZone, pathBounds)) {
    return {
      id: door.id,
      compliant: false,
      message: `KR 5 Violation: Door swing blocks Egress Path.`
    };
  }
  return { compliant: true };
}

/** MANAGER */
export function runRTCCC(data: { rooms: Room[], doors: Door[], fixtures: Fixture[], paths: Path[] }) {
  const violations: any[] = [];
  const allObjects = [...data.rooms, ...data.doors, ...data.fixtures];

  data.doors.forEach(door => {
    const w = checkDoorWidth(door);
    if (!w.compliant) violations.push({ ...w, id: door.id });
    
    data.paths.forEach(path => {
      const p = checkEgressObstruction(door, path);
      if (!p.compliant) violations.push(p);
    });
  });

  data.rooms.forEach(room => {
    const a = checkRoomArea(room);
    const h = checkCeilingHeight(room);
    if (!a.compliant) violations.push({ ...a, id: room.id });
    if (!h.compliant) violations.push({ ...h, id: room.id });
  });

  data.fixtures.forEach(fix => {
    const c = checkFixtureClearance(fix, allObjects);
    if (!c.compliant) violations.push(c);
  });

  return violations;
}