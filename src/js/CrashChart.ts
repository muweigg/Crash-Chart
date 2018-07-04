// ie 9
import 'core-js/fn/object/assign';

// https://csgoroll.com/en/crash
// https://www.wtfskins.com/crash

class CrashChart {
    container: HTMLElement = null;
    canvas: HTMLCanvasElement = null;
    ctx: CanvasRenderingContext2D = null;

    STEP: number = 110;
    STEP_TIME: number = 70;
    BASE: number = 0.00007;

    Y_AXIS_LINE_LENGTH: number = 5;
    Y_AXIS_TEXT_OFFSET: number = 25;
    X_AXIS_LINE_LENGTH: number = 5;
    X_AXIS_TEXT_OFFSET: number = 10;

    point: number = 0;
    maxPoint: number = 100;
    duration: number = 0;
    rendering: boolean = false;
    waiting: boolean = false;

    rAFId: number = 0;
    timerId: number = 0;

    yAxisBase: number = 100;
    yAxisMin: number = 200;
    yAxisSpacing: number = 0;
    xAxisBase: number = 0;
    xAxisMin: number = 10000;
    xAxisSpacing: number = 0;
    yScale: number = 1;
    xScale: number = 1;
    waitTime: number = 2000;
    status: string = '';

    y_axis_point: Array<any> = [];
    x_axis_point: Array<any> = [];
    line_axis_point: Array<any> = [];

    options: any = {};
    axisStyle: any = {
        lineWidth: 2,
        font: "10px Verdana",
        textAlign: "center",
        strokeStyle: "#C8C8C8",
        fillStyle: "#C8C8C8"
    };

    jackpot: number = 0.00;
    img32: HTMLImageElement = new Image();
    img48: HTMLImageElement = new Image();

    constructor(selector: string = '', options: any = {}) {
        this.container = document.querySelector(selector);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        // sync canvas size
        const { width, height } = this.container.getBoundingClientRect();

        this.options = Object.assign(this.options, {
            step: 110,
            stepTime: 70,
            maxPoint: 100,
            commonText: 'Jackpot',
            crashedText: 'Crashed',
            waitingText: 'Next Round in...',
            jackpot: 0.00,
        }, options);

        this.canvas.width = width;
        this.canvas.height = height;

        this.STEP = this.options.step;
        this.STEP_TIME = this.options.stepTime;
        this.maxPoint = this.options.maxPoint;
        this.jackpot = this.options.jackpot;
        this.img32.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAArFJREFUeNpi/P//P8NAAhZSNZxcXZgPpBqBmBuqf455aH8q3Rzwn+G/K5DiR3YT3ULg+KoCkHp7NOFjlDiAiSTf//9vAsQ8oHQDxZ+A+Aa6umMr84WB2IzqIQC0zBk9SVhHTPoHYhxdkccBpHyBOAaIPYG4CYhPUdkBDI7oDjiyPM8BamkoEPMhyZ2naggcWpYL8qEVmnAGENfg0HKBqg4ABr83kOJEExbBofyZffSUpxQ74MDibB4gFQQNYhcCZoHSwl4gXgzE68nOhvsWZYHEQHk9Foj9gZiLgBkXgXgJEC9zipv2jOJy4N///8uBVAgRencDcbFL/PTLlJQDjMh1we75mWxA6g0Q8xKh19A1cTpGQgOaoQmkOIBypOcCoO9t0Sz/C8S7gPgPNI/DwFcghvt857wMCSAVCU0rRkDsRVYU/IOkdBA4A43X5Z7JM19tn5t+Bk3faVCOAIoHQNOKC1qpeoosB/z/9/8KkNLySp11HSa2bXYaqOIxRNMnCsQvoDUiOrgN1P+WLAcANc7DkigdsNQZ2jjMA4VMJ1Vqw00zUuSBVDQQlxAw4x00uub4Zcy5TFE23Dg9WQBIhUEttsPbLAAWGSBLQYWOf+bcn1RpD/z79x8UhCoE9FwF5YjA7Hn3qdokWzslUY0Iy0FgRnDOfKpYjuIAYA7wRpMDNTTeA7ElehVMzUYpE3IZAMTfgHg+ENuE5C3QBNLCQMyAhH8A8QVqOoAFyQGgWiwwomDRZxB/xYQ4GSClhqb+LFD+N00cADR4IVr974BF/TEGKgOc5QAwTWCr/0/RzQH/6BQCjNi6Zou7o5WB1B0s6h8C8Rdo7UgIfIbWpiilZmzp0iCCIQB0lCMOQ+Up9PAUoqIA6AAnGvVF5xHnAAYGWjjgfEL58vPEhoAkvbrnAAEGAFsTCAHA+MK+AAAAAElFTkSuQmCC';
        this.img48.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+VJREFUeNrMWVtIVFEUvSNqZSUl1Ecvqq8iKIyoKNSypExNKxJn1BxrSkeoQKHotz56WNLDsIczo6ijmRqiJGVESmphTz8iw8gPA62PiMoKq9veeKg7473nvh8bFoe598yZvc45e+91zthYlmXUWFfdYe7Hh4B5gBnk81RAKKAGkMX3/fUZF1T9fiij0jj056M/At26GZ1MNQEOg02UXo8sS4CzAvECXUYBfdYl8D+GhAj0An7pRSBEo3GWAOYKvOuRMkCn/9B0wGyzViCe0oVGIKyj5uBWaDMBqYBYwAczYiBeRgDbAOtIWk0HRJHnv5XEigZZiMVtuFHg7VvOjC4lTjsAC3n6vtqQVfrThC3ELOfMYrC9BBQSx6NFhnpmVhbaTHm9A7BT4lBmEaDuf5uMoZ4bSuBeRQE6FwNI0CANY6C/MIRAe4VbLBil2gCgGoVegrNsQNdK3O5zz4EmQ2Iw0uwjoI6o08f4ICG3TB8pcdebH0kCMJPkeaVVG7VQM5ntdsCY7lrojidvEeZlwGQVYz8A+ABNgK+GijnILCkqnR+kFDcDCDBssspxu6SKybbyA3G4Qomua72aELh9ff80aOJEvveJSORZCk9gK0hsOYiKjdNsBWD7YGUN5+mLOqWFBCM6OCzzBLaAOIyZbBnnOYq4JxoSCNg+KDY7AFWAxuS88s/4sPWqK5WSlbgnsJmA3WS2YwQqcx+MO6oJgZYrLvyBJOIA5mp/Sn75EM8q0QL0KSCNOL1NYDU1Oy+HBs3+FGi2bHd7+lQIuNWAmzJlhGKzyb0Xai7bh8e+EY2yIN4j2VPdniHDDvVAOF2l0xj8lQAv4E1agVf/W4lbl3OjgoJRrmHKbSVOt2l5SyFIoKk0FytxCnE6UUIw8lk/wEOy2LAhlbjxkhMzTDZgFyBSwZioe+rJbHcxOlsAgYaLOSib76sY7zigWE/xRk+j4zVAqWExOsHoeAsnoQ6oItBrtPMBBG6c3zNJ5Hw7KHKE7GFMsBCuPABEYF3j4BvAB4gBnAt6F4wekfe80GwFoEAlBclhzCL19sKqL/igtiS7SE9JoJ4Aw66C5izmbUdh9WtuJ39JVoiIZudeIZpEgGViM4uqxwSOmCuJNLbU7AcQEHKeMBA733abToAu4Kj/f1ljBYSsqtgRLiLgdP0PTDUBmP010ERYrYBJJ8CIbp9+kQL3g4DXKs84/l0a5Bzxf9f8RFZx2t6p8Aygh71zHq1dLHkFfKfsuHXWMtYxr8wtxOLMh1nE+T/M+F2rdAIi/74YbW17j9W9l0dAPICNNA9VjU7ofTIDD/LRFnF+hFwKTLC/AgwAQYdZFxlmRfwAAAAASUVORK5CYII=';

        // get y, x axis spacing
        this.yAxisSpacing = 2 * this.getElemenHeight(this.axisStyle.font);
        this.xAxisSpacing = 2 * this.ctx.measureText("10000").width;

        this.reset();
    }

    getElemenHeight(font) {
        const sp: HTMLElement = document.createElement("span");
        const style = {
            font: font,
            display: 'block',
            position: 'absolute',
            top: '0',
            left: '-100000px'
        };
        Object.assign(sp.style, style);
        sp.textContent = "Hello world!";
        document.body.appendChild(sp);
        const elementHeight = sp.offsetHeight;
        document.body.removeChild(sp);
        return elementHeight;
    }

    init(time: number = 0) {
        this.duration = time;
        this.point = this.getPointByDuration(this.duration);
    }

    getPointByDuration(t: number) {
        return Math.pow(Math.E, t * this.BASE);
    }

    getDurationByPoint(p: number) {
        return Math.floor((Math.log(p) / Math.log(Math.E)) / this.BASE);
    }

    calcScale() {
        this.yScale = this.canvas.height / (Math.max(this.yAxisMin, this.point * 100) - this.yAxisBase);
        this.xScale = this.canvas.width / Math.max(this.duration, this.xAxisMin);
    }

    calcSpacing(s) {
        let r = 1;
        while (true) {
            if (r > s) return r;
            r *= 2;

            if (r > s) return r;
            r *= 5;
        }
    }

    calcAxis() {

        let ySpacing: number = this.calcSpacing(this.yAxisSpacing / this.yScale);
        let xSpacing: number = this.calcSpacing(this.xAxisSpacing / this.xScale);

        let point: number = this.yAxisBase + ySpacing,
            time: number = xSpacing,
            yAxisMax: number = Math.max(this.yAxisMin, this.point * 100),
            xAxisMax: number = Math.max(this.xAxisMin, this.duration);

        this.y_axis_point = [];
        for (; point < yAxisMax; point += ySpacing) {
            let y = this.yScale * (point - this.yAxisBase);
            this.y_axis_point.push({ axis: this.canvas.height - y, point: (point / 100).toFixed(1) });
        }
        this.y_axis_point.reverse();

        this.x_axis_point = [];
        for (; time < xAxisMax; time += xSpacing) {
            let x = this.xScale * time;
            this.x_axis_point.push({ axis: x, time: Math.floor(time / 1000) });
        }
        this.x_axis_point.reverse();

        this.line_axis_point = [];
        for (let t = 0; t < this.duration; t += this.STEP_TIME) {
            const x = this.xScale * t;
            const y = this.yScale * (this.getPointByDuration(t) * 100 - this.yAxisBase);
            this.line_axis_point.push([x, this.canvas.height - y]);
        }
    }

    drawAxis() {

        Object.assign(this.ctx, this.axisStyle)

        this.ctx.beginPath();

        this.y_axis_point.forEach(y => {
            this.ctx.moveTo(0, y.axis);
            this.ctx.lineTo(this.Y_AXIS_LINE_LENGTH, y.axis);
            this.ctx.fillText(`${y.point}x`, this.Y_AXIS_TEXT_OFFSET, y.axis + 3);
        });

        this.x_axis_point.forEach(x => {
            this.ctx.moveTo(x.axis, this.canvas.height);
            this.ctx.lineTo(x.axis, this.canvas.height - this.X_AXIS_LINE_LENGTH);
            this.ctx.fillText(`${x.time}s`, x.axis, this.canvas.height - this.X_AXIS_TEXT_OFFSET);
        });

        this.ctx.stroke();
    }

    drawLine() {

        Object.assign(this.ctx, this.axisStyle, { strokeStyle: '#2ac26c', fillStyle: '#2ac26c' });

        this.ctx.beginPath();

        this.ctx.moveTo(0, this.canvas.height);
        this.line_axis_point.forEach(([x, y]) => {
            this.ctx.lineTo(x, y);
        });

        this.ctx.stroke();
    }

    drawText() {
        const fontStyle: any = {
            'runing' : { font: "48px Verdana", strokeStyle: '#2ac26c', fillStyle: '#2ac26c' },
            'waiting': { font: "32px Verdana", strokeStyle: '#ffffff', fillStyle: '#ffffff' },
            'stop'   : { font: "48px Verdana", strokeStyle: '#ff3737', fillStyle: '#ff3737' },
        };
        const imageStyle: any = {
            'runing' : { offsetXAxis: 105, offsetYAxis: 44 },
            'waiting': { offsetXAxis: 70, offsetYAxis: 38 },
            'stop'   : { offsetXAxis: 105, offsetYAxis: 44 },
        };

        Object.assign(this.ctx, this.axisStyle, fontStyle[this.status]);
        const elemenHeight = this.getElemenHeight(this.ctx.font) / 2,
            xAxis = this.canvas.width / 2,
            yAxis = this.canvas.height / 2,
            text = `Jackpot:   ${this.jackpot}`,
            tw:number = this.ctx.measureText('Jackpot:').width,
            ttw = this.ctx.measureText(text).width;

        if (this.status === 'runing') {
            this.ctx.drawImage(this.img48, xAxis - (ttw - tw) / 2 + imageStyle[this.status].offsetXAxis, yAxis - elemenHeight - imageStyle[this.status].offsetYAxis);
            this.ctx.fillText(text, xAxis, yAxis - elemenHeight);
            this.ctx.fillText(`${String(this.point.toFixed(2))}x`, xAxis, yAxis + elemenHeight);
        } else if (this.status === 'waiting') {
            this.ctx.drawImage(this.img32, xAxis - (ttw - tw) / 2 + imageStyle[this.status].offsetXAxis, yAxis - elemenHeight * 2 - imageStyle[this.status].offsetYAxis);
            this.ctx.fillText(text, xAxis, yAxis - elemenHeight * 2.5);
            this.ctx.fillText(this.options.waitingText, xAxis, yAxis - elemenHeight / 2);
            this.ctx.fillText(`${String((this.waitTime / 1000).toFixed(2))}s`, xAxis, yAxis + elemenHeight * 1.5);
        } else if (this.status === 'stop') {
            this.ctx.drawImage(this.img48, xAxis - (ttw - tw) / 2 + imageStyle[this.status].offsetXAxis, yAxis - elemenHeight * 2 - imageStyle[this.status].offsetYAxis);
            this.ctx.fillText(text, xAxis, yAxis - elemenHeight * 2);
            this.ctx.fillText(this.options.crashedText, xAxis, yAxis);
            this.ctx.fillText(`${String(this.point.toFixed(2))}x`, xAxis, yAxis + elemenHeight * 2);
        }
    }

    drawChart() {
        this.point = Math.pow(Math.E, this.duration * this.BASE);
        this.calcScale();
        this.calcAxis();

        this.clear();
        this.drawLine();
        this.drawAxis();
        this.drawText();
        // this.ctx.save();
        // this.ctx.restore();
    }

    render() {
        this.rAFId = requestAnimationFrame(this.render.bind(this));
        this.drawChart();
        if (this.point >= this.maxPoint) this.stop(this.maxPoint);
    }

    start(time: number = 0) {
        if (this.rendering) return;
        if (this.waiting) this.stopTimer();
        this.init(time);
        this.rAFId = requestAnimationFrame(this.render.bind(this));
        this.status = 'runing';
        this.timerId = <any>setInterval(() => {
            this.duration += this.STEP;
        }, this.STEP_TIME);
        this.rendering = true;
    }

    stop(crashPoint: number = 0) {
        this.stopTimer();

        this.init(this.getDurationByPoint(crashPoint || this.point));
        this.status = 'stop';
        this.drawChart();

        this.rendering = false;
        this.waiting = false;
    }

    stopTimer() {
        cancelAnimationFrame(this.rAFId);
        clearInterval(this.timerId);
    }

    wait(time: number) {
        if (this.rendering || this.waiting) return;
        this.waitTime = time * 1000 || 2000;

        this.init(0);
        this.rAFId = requestAnimationFrame(this.render.bind(this));
        this.status = 'waiting';
        this.timerId = <any>setInterval(() => {
            this.waitTime -= 10;
            if (this.waitTime <= 0) {
                this.waiting = false;
                this.waitTime = 0;
                this.stopTimer();
                this.drawChart();
            }
        }, 10);
        this.waiting = true;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    reset() {
        this.stopTimer();

        this.init(0);
        this.status = '';
        this.drawChart();

        this.rendering = false;
        this.waiting = false;
        this.jackpot = 0.00;
    }

    resize() {
        const { width, height } = this.container.getBoundingClientRect();
        this.canvas.width = width;
        this.canvas.height = height;
        if (!this.rendering && !this.waiting)
            this.drawChart();
    }
}

export default window.CrashChart = CrashChart;