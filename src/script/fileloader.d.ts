declare module "*.gif" {
    const value: string;
    export default value;
}

declare module "*.json" {
    const value: string;
    export default value;
}

declare module "*.svg" {
    import * as React from "react";
    const value: SVGComponent;
    export default value;
}