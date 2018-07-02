// import { CrashChart } from './CrashChart';

const ms: HTMLInputElement = document.querySelector('input:nth-of-type(1)');
const crash: HTMLInputElement = document.querySelector('input:nth-of-type(2)');
const s: HTMLInputElement = document.querySelector('input:nth-of-type(3)');
const start: HTMLElement = document.querySelector('button:nth-of-type(1)');
const stoped: HTMLElement = document.querySelector('button:nth-of-type(2)');
const wait: HTMLElement = document.querySelector('button:nth-of-type(3)');
const reset: HTMLElement = document.querySelector('button:nth-of-type(4)');
const clear: HTMLElement = document.querySelector('button:nth-of-type(5)');

setTimeout(() => {
    const crashChart = new window.CrashChart('.crash-chart');

    start.addEventListener('click', () => {
        const val:number = parseInt(ms.value) || 0;
        crashChart.start(val);
    });

    stoped.addEventListener('click', () => {
        const val:number = parseFloat(crash.value) || 0;
        crashChart.stop(val);
        // crashChart.stop(4.43);
    });

    wait.addEventListener('click', () => {
        const val:number = parseInt(s.value) || 0;
        crashChart.wait(val);
    });

    reset.addEventListener('click', () => {
        crashChart.reset();
    });

    clear.addEventListener('click', () => {
        crashChart.clear();
    });

}, 0);