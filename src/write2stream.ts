import { Mutex } from "coroutine-locks";

export class Write2Stream<T> implements AsyncIterableIterator<T> {
    private readable = new Mutex();
    private writable = new Mutex();
    private v?: T;
    private stream: AsyncIterableIterator<T>;
    private open = true;

    constructor() {
        this.readable.lock();
        this.stream = this.f();
    }

    public async write(v: T): Promise<void> {
        await this.writable.lock();
        this.v = v;
        this.readable.unlock();
    }

    public async close(): Promise<void> {
        await this.writable.lock();
        this.open = false;
        this.readable.unlock();
    }

    private async* f(): AsyncGenerator<T> {
        for (; ;) {
            await this.readable.lock();
            if (this.open)
                yield this.v!;
            else
                return;
            this.writable.unlock();
        }

    }

    public async next(): Promise<IteratorResult<T>> {
        return await this.stream.next();
    }

    public [Symbol.asyncIterator](): this {
        return this;
    }
}
