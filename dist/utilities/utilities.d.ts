export declare namespace Utilities {
    function guid(): string;
    /**
         * At any arbitrary layer of nesting within the configuration objects, any single value that
         * is not specified by the configuration is given the default counterpart. If, within an object,
         * one peer is given by configuration and two are not, the one is preserved while the two are given
         * the default value.
         * @returns the composition of all of the assigned objects, much like Object.assign(), but with more
         * granularity in the overwriting of nested objects
         */
    function preciseAssign(target: any, ...sources: any[]): any;
    function preciseAssignHelper(target: any, source: any): void;
}
