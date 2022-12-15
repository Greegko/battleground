export type Vector = { x: number; y: number };

export const createVectorFromAngle = (angle: number) => ({ x: Math.cos(angle), y: Math.sin(angle) });

export const isZeroVector = (a: Vector) => a.x === 0 && a.y === 0;

export const getVectorAngle = (a: Vector, b?: Vector) => (b ? Math.atan2(b.y - a.y, b.x - a.x) : Math.atan2(a.y, a.x));

export const getVectorDistance = (a: Vector, b: Vector) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

const magSq = (a: Vector) => a.x ** 2 + a.y ** 2;
const mag = (a: Vector) => Math.sqrt(magSq(a));
export const rotateTo = (a: Vector, angle: number) => {
  const m = mag(a);

  return { x: Math.cos(angle) * m, y: Math.sin(angle) * m };
};

export const normVector = (a: Vector) => {
  const m = magSq(a);

  return m > 0 ? divVector(a, Math.sqrt(m)) : a;
};

export const radToDegree = (rad: number) => rad * (180 / Math.PI);
export const degreeToRad = (deg: number) => deg * (Math.PI / 180);

export const rotateBy = (a: Vector, angle: number) => rotateTo(a, getVectorAngle(a) + angle);

export const addVector = (a: Vector, b: Vector) => ({ x: a.x + b.x, y: a.y + b.y });
export const subVector = (a: Vector, b: Vector) => ({ x: a.x - b.x, y: a.y - b.y });
export const multVector = (a: Vector, val: number) => ({ x: a.x * val, y: a.y * val });
export const divVector = (a: Vector, val: number) => ({ x: a.x / val, y: a.y / val });

export const invVector = (a: Vector) => ({ x: -a.x, y: -a.y });
export const invXVector = (a: Vector) => ({ x: -a.x, y: a.y });
export const invYVector = (a: Vector) => ({ x: a.x, y: -a.y });
