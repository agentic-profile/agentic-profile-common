export function prettyJSON( obj: any ) {
    return JSON.stringify( obj, null, 4 );
}
 
export function createTimer( name: string ) {
    let start = Date.now();
    let recent = start;

    return {
        elapsed: function( label:string, ...props:any[] ) {
            const now = Date.now();
            console.log(`Timer(${name}:${label}) ${now-recent}ms, ${now-start}ms total`, ...props);
            recent = now;
        }
    };
}

export function ensure( truth: any, ...props:any[] ) {
    if( !truth )
        throw new Error( props.map(e=>typeof e === 'object' ? JSON.stringify(e) : ''+e).join(' ') );
}

export function isObject( variable: any ) {
    return typeof variable === 'object' && variable !== null;
}