export async function util_timeout(ms: string): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, parseInt(ms)));
}
