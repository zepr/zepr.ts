import { Engine } from './engine';
import { Point, Vector } from './geometry';
import { Sprite } from './sprite';

export interface GameScreen {
    init(engine: Engine): void;
    run(engine: Engine): void;
}

export interface ClickListener {
    onClick(engine: Engine, point: Point, sprites: Array<Sprite>): void;
}

export interface DragListener {
    onDrag(engine: Engine, move: Vector): void;
    onDrop(engine: Engine): void;
}

export interface ZoomListener {
    onZoom(engine: Engine, ratio: number): void;
}
