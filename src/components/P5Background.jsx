import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { TRIGRAMS } from '../data';

const P5Background = ({ upper, lower }) => {
    const canvasRef = useRef(null);
    const p5Instance = useRef(null);

    useEffect(() => {
        const sketch = (p) => {
            let particles = [];
            const numParticles = 80;

            p.setup = () => {
                const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                canvas.parent(canvasRef.current);
                canvas.style('position', 'absolute');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '-1');

                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle(p));
                }
            };

            p.draw = () => {
                const c1 = p.color(...(TRIGRAMS[upper]?.color || [200, 200, 200]));
                const c2 = p.color(...(TRIGRAMS[lower]?.color || [200, 200, 200]));

                p.noStroke();
                const bgColor = p.lerpColor(c1, c2, 0.5);
                p.fill(p.red(bgColor), p.green(bgColor), p.blue(bgColor), 20);
                p.rect(0, 0, p.width, p.height);

                particles.forEach(pt => {
                    pt.update(upper, lower);
                    pt.display(upper);
                });
            };

            p.windowResized = () => {
                p.resizeCanvas(window.innerWidth, window.innerHeight);
            };

            class Particle {
                constructor(p) {
                    this.p = p;
                    this.pos = p.createVector(p.random(p.width), p.random(p.height));
                    this.vel = p.createVector(0, 0);
                    this.size = p.random(2, 6);
                }

                update(u, l) {
                    let noiseVal = this.p.noise(this.pos.x * 0.003, this.pos.y * 0.003, this.p.frameCount * 0.002);
                    let angle = noiseVal * this.p.TWO_PI * 2;
                    let force = p5.Vector.fromAngle(angle);
                    force.mult(0.5);

                    if (u === '3' || l === '3') force.y -= 0.1;
                    if (u === '6' || l === '6') force.y += 0.1;
                    if (u === '7' || l === '7') force.mult(0.1);

                    this.vel.add(force);
                    this.vel.limit(1.5);
                    this.pos.add(this.vel);

                    if (this.pos.x > this.p.width) this.pos.x = 0;
                    if (this.pos.x < 0) this.pos.x = this.p.width;
                    if (this.pos.y > this.p.height) this.pos.y = 0;
                    if (this.pos.y < 0) this.pos.y = this.p.height;
                }

                display(u) {
                    let c = this.p.color(...(TRIGRAMS[u]?.color || [100, 100, 100]));
                    c.setAlpha(100);
                    this.p.fill(c);
                    this.p.circle(this.pos.x, this.pos.y, this.size);
                }
            }
        };

        p5Instance.current = new p5(sketch);
        return () => p5Instance.current.remove();
    }, [upper, lower]);

    return <div ref={canvasRef} className="fixed inset-0 transition-opacity duration-1000 ease-in-out" />;
};

export default P5Background;
