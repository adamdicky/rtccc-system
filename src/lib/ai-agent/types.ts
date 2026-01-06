// Definitions for architectural objects to support FOL logic [cite: 40, 42]
export interface BaseObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number; // or depth
}

export interface Door extends BaseObject {
  type: 'door';
  width: number; // Linked to KR: Fire Safety [cite: 47, 49]
  isRequiredExit: boolean;
  swingDirection: 'LH' | 'RH'; // Linked to KR: Path Obstruction 
}

export interface Room extends BaseObject {
  type: 'room';
  roomType: 'Office' | 'Habitable' | 'Corridor'; // Used for KR 2 and KR 4 [cite: 50, 57]
  area: number; // Calculated property for KR 2 [cite: 52]
  ceilingHeight: number; // Data attribute for KR 4 
}

// KR 3: Accessibility - Clear Space Around Fixtures [cite: 53]
export interface Fixture extends BaseObject {
  type: 'fixture';
  name: string;
  isAccessible: boolean;
  // This represents the required 'Clearance' in your FOL [cite: 55, 56]
  clearanceWidth: number;
  clearanceDepth: number;
}

// KR 5: Fire Safety - Clear Egress Path [cite: 60]
export interface Path extends BaseObject {
  type: 'path';
  pathWidth: number;
}