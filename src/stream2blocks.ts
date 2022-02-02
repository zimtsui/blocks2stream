import { Readnable } from "./readn";
import assert = require("assert");

export async function* stream2blocks(
    stream: AsyncIterableIterator<Buffer>,
): AsyncGenerator<Buffer> {
    const readnable = new Readnable(stream);
    try {
        for (; ;) {
            const lengthBuffer = await readnable.readn(8);
            if (!lengthBuffer.length) return;
            assert(lengthBuffer.length === 8);

            const lengthBigInt = lengthBuffer.readBigInt64BE();
            assert(lengthBigInt <= Number.MAX_SAFE_INTEGER);
            const length = Number(lengthBigInt);

            const buffer = await readnable.readn(length);
            assert(buffer.length === length);
            yield buffer;
        }
    } catch (err) {
        await readnable.throw(err).catch(() => { });
        throw err;
    }
}
