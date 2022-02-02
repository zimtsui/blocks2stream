export async function* blocks2stream(
    blocks: AsyncIterableIterator<Buffer>,
): AsyncGenerator<Buffer> {
    try {
        for await (const block of blocks) {
            const lengthBigInt = BigInt(block.length);
            const lengthBuffer = Buffer.allocUnsafe(8);
            lengthBuffer.writeBigInt64BE(lengthBigInt);
            yield lengthBuffer;
            yield block;
        }
    } catch (err) {
        if (blocks.throw) await blocks.throw(err).catch(() => { });
        throw err;
    }
}
