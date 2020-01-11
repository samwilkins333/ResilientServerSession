import { Schema } from "jsonschema";
import { Color } from "colors";
export declare const configurationSchema: Schema;
declare type ColorLabel = "yellow" | "red" | "cyan" | "green" | "blue" | "magenta" | "grey" | "gray" | "white" | "black";
export declare const colorMapping: Map<ColorLabel, Color>;
interface Identifier {
    text: string;
    color: ColorLabel;
}
export interface Identifiers {
    master: Identifier;
    worker: Identifier;
    exec: Identifier;
}
export interface Configuration {
    showServerOutput: boolean;
    identifiers: Identifiers;
    ports: {
        [description: string]: number;
    };
    polling: {
        route: string;
        intervalSeconds: number;
        failureTolerance: number;
    };
}
export declare const defaultConfig: Configuration;
export {};
