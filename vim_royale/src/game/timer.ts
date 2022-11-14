export interface ITimer {
    id: number;
    interval(): void;
}

const FPS = 60 / 1000;
export class Timer {
    private id?: ReturnType<typeof setTimeout>;
    private boundCallback: (this: Timer) => void;
    private count: number;
    private start: number;
    private timers: Map<number, ITimer>;

    constructor() {
        this.start = Date.now();
        this.count = 0;
        this.timers = new Map();

        this.run();
        this.boundCallback = () => {
            for (const timer of this.timers.values()) {
                timer.interval();
            }
            this.run();
        };
    }

    addTimer(timer: ITimer): void {
        this.timers.set(timer.id, timer);
    }

    rmTimer(timer: ITimer): void {
        this.timers.delete(timer.id);
    }

    destroy(): void {
        if (this.id) {
            clearTimeout(this.id);
        }
    }

    private run(): void {
        const targetTime = Math.max(0,
            Math.floor(this.start + this.count * FPS) - Date.now());

        this.id = setTimeout(this.boundCallback, targetTime);
        this.count++;
    }
}

