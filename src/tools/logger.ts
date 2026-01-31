import morgan from 'morgan';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';

/**
 * Setup custom Morgan logging middleware with colorful output
 */
export const setupMorganLogger = () => {
    // Custom Morgan Tokens
    morgan.token('status-colored', (req, res) => {
        const status = res.statusCode;
        const color = status >= 500 ? 'red'
            : status >= 400 ? 'yellow'
            : status >= 300 ? 'cyan'
            : status >= 200 ? 'green'
            : 'white';
        return (chalk as any)[color].bold(status);
    });

    morgan.token('method-colored', (req) => {
        const method = req.method || 'GET';
        const colors: Record<string, string> = {
            'GET': 'blue',
            'POST': 'green',
            'PUT': 'yellow',
            'DELETE': 'red',
            'PATCH': 'magenta'
        };
        const colorName = colors[method] || 'white';
        return (chalk as any)[colorName].bold(method);
    });

    morgan.token('url-colored', (req) => {
        return chalk.cyan(req.url || '/');
    });

    morgan.token('time-colored', (req, res) => {
        return chalk.dim(new Date().toLocaleTimeString('id-ID'));
    });

    // Return Morgan middleware with custom format
    return morgan((tokens, req, res) => {
        const responseTime = parseFloat(tokens['response-time'](req, res) || '0');
        const timeColor = responseTime > 1000 ? 'red' : responseTime > 500 ? 'yellow' : 'green';
        
        return [
            chalk.gray('│'),
            tokens['method-colored'](req, res),
            tokens['url-colored'](req, res),
            tokens['status-colored'](req, res),
            chalk.gray('•'),
            (chalk as any)[timeColor](`${responseTime.toFixed(2)} ms`),
            chalk.gray('•'),
            tokens['time-colored'](req, res)
        ].join(' ');
    });
};

/**
 * Display startup banner with server information
 */
export const displayStartupBanner = (port: number | string, env: string) => {
    console.log('\n');
    
    // Banner ASCII Art
    console.log(
        chalk.cyan(
            figlet.textSync('Ivendor API', {
                font: 'roman',
                horizontalLayout: 'default'
            })
        )
    );

    // Server Info Box
    const serverInfo = [
        `${chalk.bold.white('🚀 Server Status:')} ${chalk.green.bold('RUNNING')}`,
        `${chalk.bold.white('🌐 URL:')}          ${chalk.blue.underline(`http://localhost:${port}/api`)}`,
        `${chalk.bold.white('⚙️  Environment:')}  ${chalk.yellow(env.toUpperCase())}`,
        `${chalk.bold.white('🕐 Started at:')}   ${chalk.magenta(new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }))}`,
        `${chalk.bold.white('🌍 Timezone:')}     ${chalk.cyan('Asia/Jakarta')}`
    ].join('\n');

    console.log(
        boxen(serverInfo, {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
            backgroundColor: '#000000'
        })
    );

    console.log(chalk.gray('═'.repeat(60)));
    console.log(chalk.green.bold('✨ Server is ready to accept requests!'));
    console.log(chalk.gray('═'.repeat(60)) + '\n');
};
