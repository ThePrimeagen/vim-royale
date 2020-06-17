import Board from "../../board";
import PositionComponent from "../../objects/components/position";

export type Renderer = (
    board: Board,
    renderSpace: string[][],
    positions: PositionComponent[][],
    playerPosition: PositionComponent,
    display: {width: number, height: number}) => [string[][], number, number];



