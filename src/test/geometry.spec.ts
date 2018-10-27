import { Rectangle, Circle } from '../lib/geometry'
import { expect } from 'chai';
import 'mocha';

describe('Check Shapes collisions', () => {

    let r1: Rectangle = new Rectangle(50, 350, 200, 200);
    let r2: Rectangle = new Rectangle(150, 450, 200, 200);
    let r3: Rectangle = new Rectangle(300, 200, 200, 200);

    let c1: Circle = new Circle(250, 150, 100);
    let c2: Circle = new Circle(200, 250, 50);
    let c3: Circle = new Circle(300, 600, 25);

    it('Overlapping r1 and r2 should collide', () => {
        expect(r1.collides(r2)).true;
    });
    it('Overlapping c1 and c2 should collide', () => {
        expect(c1.collides(c2)).true;
    });
    it('Overlapping c1 and r3 should collide', () => {
        expect(c1.collides(r3)).true;
    });
    it('Overlapping c3 and r2 should collide', () => {
        expect(c3.collides(r2)).true;
    });
    it('Distinct r1 and r3 should not collide', () => {
        expect(r1.collides(r3)).false;
    });
    it('Distinct c2 and c3 should not collide', () => {
        expect(c2.collides(c3)).false;
    });
    it('Distinct c2 and r3 should not collide', () => {
        expect(c2.collides(r3)).false;
    });
    it('Distinct r1 and c3 should not collide', () => {
        expect(r1.collides(c3)).false;
    });
});
