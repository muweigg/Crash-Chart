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

        Object.assign(this.ctx, this.axisStyle, fontStyle[this.status]);
        const elemenHeight = this.getElemenHeight(this.ctx.font) / 2,
            xAxis = this.canvas.width / 2,
            yAxis = this.canvas.height / 2;

        if (this.status === 'runing') {
            this.ctx.fillText(`Jackpot: ${this.jackpot}`, xAxis, yAxis - elemenHeight);
            this.ctx.fillText(`${String(this.point.toFixed(2))}x`, xAxis, yAxis + elemenHeight);
        } else if (this.status === 'waiting') {
            this.ctx.fillText(`Jackpot: ${this.jackpot}`, xAxis, yAxis - elemenHeight * 2.5);
            this.ctx.fillText(this.options.waitingText, xAxis, yAxis - elemenHeight / 2);
            this.ctx.fillText(`${String((this.waitTime / 1000).toFixed(2))}s`, xAxis, yAxis + elemenHeight * 1.5);
        } else if (this.status === 'stop') {
            this.ctx.fillText(`Jackpot: ${this.jackpot}`, xAxis, yAxis - elemenHeight * 2);
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
        if (this.waiting) this.reset();
        this.init(time);
        this.rAFId = requestAnimationFrame(this.render.bind(this));
        this.status = 'runing';
        this.timerId = <any>setInterval(() => {
            this.duration += this.STEP;
        }, this.STEP_TIME);
        this.rendering = true;
    }

    stop(crashPoint: number = 0) {
        cancelAnimationFrame(this.rAFId);
        clearInterval(this.timerId);

        this.init(this.getDurationByPoint(crashPoint || this.point));
        this.status = 'stop';
        this.drawChart();

        this.rendering = false;
        this.waiting = false;
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
                cancelAnimationFrame(this.rAFId);
                clearInterval(this.timerId);
                this.drawChart();
            }
        }, 10);
        this.waiting = true;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    reset() {
        cancelAnimationFrame(this.rAFId);
        clearInterval(this.timerId);

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