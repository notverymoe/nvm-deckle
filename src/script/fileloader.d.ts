declare module "*.gif" {
    const value: string;
    export default value;
}

declare module "*.json" {
    const value: string;
    export default value;
}

declare module "*.svg" {
    import * as Preact from "preact";
    const value: Preact.ComponentType<Preact.JSX.SVGAttributes>;
    export default value;
}