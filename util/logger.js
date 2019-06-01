class Logger {
    static log(text) {
        console.log('*', text.toUpperCase());
        console.log();
    }

    static logHeader() {
        console.log('=========================================');
        this.log('round started');
    }

    static logFooter() {
        console.log();
        console.log('* ROUND FINISHED');
        console.log('=========================================')
        console.log();
        console.log();
    }

    static time() {
        return Date.now();
    }

    static logRuntime(text, startTime) {
        console.log(`${text} ${this.time() - startTime}ms`);
    }
}

module.exports = Logger;