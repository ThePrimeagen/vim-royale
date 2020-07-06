import { SuperCoolType } from "./types";

export function someName(coolVar: SuperCoolType): number {
    const otherVar = 72;
    return otherVar + coolVar.foo;
}

