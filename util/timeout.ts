export async function util_timeout(ms: number): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
