import log, { LogLevelDesc } from "loglevel";

const DEFAULT_LOG_LEVEL = (process.env.LOG_LEVEL ?? 'warn') as LogLevelDesc;
log.setLevel( DEFAULT_LOG_LEVEL );
console.log( "General log level", log.getLevel() );


/**
 * Get a logger for a given module.
 * The log levels are set with the LOGGER_LEVELS environment variable.
 * The format is a comma separated list of module=level pairs.
 * The level is one of the loglevel levels.
 * The module is the name of the module to log.
 * The logger is cached and returned for the given module.
 * The logger is set to the level for the given module.
 */

const cache: Record<string, log.Logger> = {};

function getLogger( name: string ): log.Logger {
    let logger = cache[name];
    if (logger)
        return logger;

    logger = log.getLogger( name );
    const level = logLevelMap()[name] ?? DEFAULT_LOG_LEVEL;
    logger.setLevel( level );
    if(level !== DEFAULT_LOG_LEVEL)
        console.log(`Module ${name} log level set to ${level}`);

    cache[name] = logger;
    return logger;
}

function logLevelMap(): Record<string, log.LogLevelDesc> {
    const levels = process.env.LOGGER_LEVELS;
    if ( !levels )
        return {};
    return levels.split(',').reduce((acc, level) => {
        const [module, logLevel] = level.split('=');
        acc[module] = logLevel as log.LogLevelDesc;
        return acc;
    }, {} as Record<string, log.LogLevelDesc>);
}

export { log, getLogger };
