export function red(text: string): string {

    return `\x1b[91m${text}\x1b[0m`;

}

export function grey(text: string): string {

    return `\x1b[90m${text}\x1b[0m`;

}

export function yellow(text: string): string {

    return `\x1b[33m${text}\x1b[0m`;

}

export function green(text: string): string {

    return `\x1b[32m${text}\x1b[0m`;

}

export function bold(text: string): string {

    return `\x1b[1m${text}\x1b[0m`;

}
