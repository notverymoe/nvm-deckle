
import "./virtual_list.scss";

import * as Preact from "preact";
import * as PreactHooks from "preact/hooks";
import { joinClassNames } from "util/shared";
import { VirtualChildren } from "./virtual_children";
import { useElementHeight } from "./hooks";

export function VirtualList({render, lines_per_entry, length, ["class"]: className}: {
    class?: string,
    render: (idx: number) => Preact.ComponentChildren,
    lines_per_entry: number,
    length: number,
}) {
    const render_wrapped = PreactHooks.useCallback(
        (idx: number) => <VirtualListEntry line_height={lines_per_entry}>{render(idx)}</VirtualListEntry>, 
        [render]
    );

    const [offset, set_offset] = PreactHooks.useState(0);

    const outer_ref    = PreactHooks.useRef<HTMLDivElement | null>(null);
    const outer_height = useElementHeight(outer_ref);

    const tracker_ref    = PreactHooks.useRef<HTMLDivElement | null>(null);
    const tracker_height = useElementHeight(tracker_ref);

    console.debug("offset: " + (tracker_height ? Math.trunc(offset/tracker_height) : 0));
    console.debug("count: " + ((outer_height && tracker_height) ? Math.trunc(outer_height/tracker_height) : 0));
    console.debug("length: " + length);

    return <div
        class={joinClassNames("vlist-root", className)}
        ref={outer_ref}
        onScroll={e => set_offset((e.target as HTMLDivElement).scrollTop)}
    >
        <div
            class="vlist-scrollbox"
            style={{height: `${length*lines_per_entry}em`}}
        >
            <div 
                class="vlist-content"
                style={{top: `${offset}px`}}
            >
                <VirtualListEntry class="vlist-entry-track" line_height={1}>
                    <div class="vlist-entry-track-inner" ref={tracker_ref}/>
                </VirtualListEntry>
                <VirtualChildren 
                    offset={tracker_height ? Math.trunc(offset/tracker_height) : 0} 
                    count={(outer_height && tracker_height) ? Math.trunc(outer_height/tracker_height) : 0}
                    length={length} 
                    render={render_wrapped}
                />
            </div>
        </div>
    </div>;

}

function VirtualListEntry({line_height, children, ["class"]: className}: {line_height: number, children: Preact.ComponentChildren, class?: string}) {
    return <div
        class={joinClassNames("vlist-entry", className)}
        style={{height: `${line_height}em`}}
    >{children}</div>;
}