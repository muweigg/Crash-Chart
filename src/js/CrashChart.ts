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
    tokenImage: HTMLImageElement = new Image();
    trophyImage: HTMLImageElement = new Image();
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
            commonText: 'Jackpot:',
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
        this.tokenImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhdJREFUeNpi/P//PwMhcHJ1YR2QqgJidiA+ZR7ab85AJGAhRhHQEe5Qw0HgOAMJgImQguMr83mAFpiDfArFx7GpIdsH//4z2AMpZmTzQMTRFflCQCoMiKOB+BwQ55NlAdDFjkjcF0BscWR53mQg7QnErFDx+RT44L8LElcYiFdiUXaWZAsOLMkxBFIpQKyPJMyKpuwOEC8F4mtEWbBvUbYCkIoC4hgg1sSh5zUQrwLiJU5xU08QnUz3LMzUxOcSUGgBcQgQb3GJn/6b5Hzw799/HywG/gBiLij/jFvijPUwyV3zM/iBVBAQiwDFu4mxwBvKPA/yPiga0CLv+I656WzQ1ANKmr5AzAHE1QR9sG12Gog+BMSZXqmzrkPF4tDUakOTqSCa+AmCFgAN/QOk6tCSZxCaWhc0/kNo+j9OdFm0aUayNDQVRaMlTxj4BcSgeJgDSnR+GXP/ERXJG6YlcQKprUDsAMSMWNR9gPpwaUDWvHekFHYs0Ah2AlKOeNS1BuXMn8xABmBBS0GgymEfEINKR+Qy/xgDmQBiwf9/OkCqCRppoMh7haTmN7S0ZKDEBw4RhYvBEbaiP9YAlHmQ1JwHyv2gyAKY4dDkiR4XxxkoABilKdA3zmhCl5f0RAsQMOdrTMlSrOUTI3Klv7g7CmThe2gkUwLuxpYuU8HwAbB6NKWC4SAwF2sQAX3jTAXD/wLxAhgHIMAA08y4KCJuPcAAAAAASUVORK5CYII=';
        this.trophyImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmxJREFUeNqslU1IVFEUgMeXLYyMWoT9LEYh6AeixKCFi6gpCydHCbJF4YyOM44TWa3aFbVo46IfpnnOjCNNLYIk0swwUnBtGxdJIQRq0A9EP0SBRby+A2/i+nwzvN50ho9z77vn3nPPPffcKTMMwyMykYtPo3Z5Spd5XzBZne9o+QZ+TkAd3BWfLhiEPdCoeiuTCJ7d7l6rfJMoJgvs7htUFhg7BaP5zqGQ/uVvBPj4rDBps7t74GXSGvRmyNnYZNV1lhwRUfyEJqgBv0SlMA4nG9r1hacDMZ32O9oh9IjF7gLUQissWnPwAmoOd/TNod9aQk9CgMVT6BjotJvRt6zJZb5clNUwY42ABBmnx7JdKy27Ej7BSwiYfdnhvPldtfvOfA0dh4dWB0mohARolokHjoRTs3I08Fo0/Wn0QYvdIlwGr6y35BaJPMlE96LG4A3sVEL/AQ3wqzGSnsKuXtowrtwo6U9BrRwndhPLHIiMpiMbUGegBXYoTn7DsJmr7XAMVijjC7JHuOaPZmaX1YFVHqcjUhfPYYuDypVLUX80mpmzG7R1IDKS6vSihmB3sWcB/E1d/TOFDAo6EHnU11luVuglqFaGJE9ybROBWP/XYuEVdZCXYT18BRWGTeaRZJu7sxedvHyOHIgMJTvOSRLhfEt84LrTp7XcqaHh8u127sBw50JzYvQg0b6K9SvMV7NC+v81ArP0g2b3KmyFUMlJHrwZ7DGrdhtUKUMf4JUU//GeXG8pEbRBnc33KpP10Osqgvs32tahPjrI08bWs3fe/3OS8bsPNAd/9j5Xt4gX3md4HP32F3PwR4ABAO8B45ucgnl+AAAAAElFTkSuQmCC';

        // get y, x axis spacing
        this.yAxisSpacing = 2 * this.getElemenHeight(this.axisStyle.font);
        this.xAxisSpacing = 2 * this.ctx.measureText("10000").width;

        this.tokenImage.onload = this.reset.bind(this);
        this.trophyImage.onload = this.reset.bind(this);
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

    drawJackpot() {

        Object.assign(this.ctx, this.axisStyle, { font: "24px Verdana", strokeStyle: '#ffffff', fillStyle: '#ffffff' });
        
        const elemenHeight: number = this.getElemenHeight(this.ctx.font),
            xAxis: number = this.canvas.width / 2,
            text: string = `    ${this.options.commonText}    ${this.jackpot}`,
            spacingWidth: number = this.ctx.measureText(`    `).width,
            tw: number = this.ctx.measureText(`${this.options.commonText}`).width,
            totalWidth: number = this.ctx.measureText(text).width;

        this.ctx.drawImage(this.trophyImage, xAxis - totalWidth / 2, 9);
        this.ctx.drawImage(this.tokenImage, xAxis + Math.abs(totalWidth / 2 - (tw + spacingWidth)) + spacingWidth / 2 - this.tokenImage.width / 2, 8);
        this.ctx.fillText(text, xAxis, elemenHeight);
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
            this.ctx.fillText(`${String(this.point.toFixed(2))}x`, xAxis, yAxis + elemenHeight / 2);
        } else if (this.status === 'waiting') {
            this.ctx.fillText(this.options.waitingText, xAxis, yAxis + elemenHeight / 2 - elemenHeight);
            this.ctx.fillText(`${String((this.waitTime / 1000).toFixed(2))}s`, xAxis, yAxis + elemenHeight / 2 + elemenHeight);
        } else if (this.status === 'stop') {
            this.ctx.fillText(this.options.crashedText, xAxis, yAxis + elemenHeight / 2 - elemenHeight);
            this.ctx.fillText(`${String(this.point.toFixed(2))}x`, xAxis, yAxis + elemenHeight / 2 + elemenHeight);
        }
    }

    drawChart() {
        this.point = Math.pow(Math.E, this.duration * this.BASE);
        this.calcScale();
        this.calcAxis();

        this.clear();
        this.drawLine();
        this.drawAxis();
        this.drawJackpot();
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

        this.rendering = false;
        this.waiting = false;
        this.jackpot = 0.00;
        this.drawChart();
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