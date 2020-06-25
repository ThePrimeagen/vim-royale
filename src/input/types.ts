export enum CommandType {
    Count = 0,
    Motion,
    Input,
};

export type Command = {
    type: CommandType;
    char: string;
}


