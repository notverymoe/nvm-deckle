

declare module "*.gif" {
    const value: string;
    export default value;
}

declare module "*.json" {
    const value: string;
    export default value;
}

declare module "*.json.gz" {
    const value: string;
    export default value;
}

declare module "*.webp" {
    const value: string;
    export default value;
}

declare module "*.svg" {
    import { SVGComponent } from "components/util";
    const value: SVGComponent;
    export default value;
}