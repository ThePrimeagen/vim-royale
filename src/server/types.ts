export type ServerConfig = {
    debug?: boolean,
    port: number,
    width: number,
    height: number,
    tick: number,
    entityIdRange: number,
    optionalStartingPositions?: [number, number][],
};


