import { Rect } from "react-konva";
import { Cordinate } from "src/interfaces";

interface UnitProps {
  unit: Cordinate;
}

export const Unit = ({ unit }: UnitProps) => (
  <Rect x={unit[0]} y={unit[1]} width={10} height={10} fill={"green"} stroke={"black"} strokeWidth={1} />
);
