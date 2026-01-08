export interface BaseObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Door extends BaseObject {
  type: 'door';
  width: number; 
  height: number; // Thickness (usually ~40mm)
  rotation: 0 | 90 | 180 | 270; // NEW: Rotation support
  isRequiredExit: boolean;
  swingDirection: 'LH' | 'RH'; 
}

export interface Room extends BaseObject {
  type: 'room';
  roomType: 'Office' | 'Habitable' | 'Corridor'; 
  area: number; 
  ceilingHeight: number; 
}

export interface Fixture extends BaseObject {
  type: 'fixture';
  name: string;
  isAccessible: boolean;
  clearanceWidth: number;
  clearanceDepth: number;
}

export interface Path extends BaseObject {
  type: 'path';
  pathWidth: number;
}