import { Mutex } from 'coroutine-locks';
import assert = require('assert');

export class Readnable {
    private mutex = new Mutex();
    private chunk = Buffer.allocUnsafe(0);

    constructor(private i: AsyncIterableIterator<Buffer>) { }

    async readn(n: number): Promise<Buffer> {
        assert(n);
        await this.mutex.lock();
        const buffer = Buffer.allocUnsafe(n);
        let length = 0;
        for (; ;) {
            if (length + this.chunk.length < n) {
                this.chunk.copy(buffer, length);
                length += this.chunk.length;
                const result = await this.i.next();
                if (result.done) break;
                this.chunk = result.value;
            } else {
                this.chunk.copy(buffer, length, 0, n - length);
                this.chunk = this.chunk.slice(n - length);
                length = n;
                break;
            }
        }
        this.mutex.unlock();
        return buffer.slice(0, length);
    }

    public async throw(err?: any): Promise<never> {
        if (this.i.throw) await this.i.throw(err).catch(() => { });
        throw err;
    }
}
