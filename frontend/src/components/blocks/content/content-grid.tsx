import { produce } from "immer";
import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { ObjectContent, ObjectInstance } from "../../../store/objectsStore";
import { v4 as uuid } from "uuid";
import TextEditor, { Extensions } from "./text/text-editor";
import { ChevronsUpDown, GripVertical, LucideSparkles } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { ReactFrameworkOutput } from "@remirror/react";
import { GetSummary } from "../../../../wailsjs/go/main/App";
import { useMessageStore } from "../../../store/chatStore";
import TextBlock from "./text/text-block";

const ResponsiveGridLayout = WidthProvider(Responsive);

const ContentGrid = ({
  freeDrag,
  generatedLayout,
  object,
  defaultFont,
  mutate,
  editorRef,
}: {
  freeDrag: boolean;
  generatedLayout: any;
  object: ObjectInstance;
  defaultFont: string;
  mutate: (newObject: ObjectInstance) => void;
  editorRef: React.MutableRefObject<ReactFrameworkOutput<Extensions> | null>;
}) => {
  const { addMessage, messages } = useMessageStore();

  return (
    <ResponsiveGridLayout
      className="layout overflow-x-clip"
      layouts={{ lg: generatedLayout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
      rowHeight={50}
      isResizable={true}
      resizeHandles={freeDrag ? ["nw", "ne", "sw", "se"] : ["s"]}
      resizeHandle={
        !freeDrag && (
          <ChevronsUpDown
            className="handle-s bottom-3 left-[50%] absolute cursor-ns-resize hover:text-muted-foreground opacity-0 group-hover:opacity-100 "
            size={16}
          />
        )
      }
      isDraggable={true}
      isDroppable={true}
      onDrop={(layout, layoutItem, e) => {
        //@ts-expect-error Wrong typing for the event by react-grid-layout
        const data = e.dataTransfer.getData("text/plain");
        const newObject = produce(object, (draft) => {
          const newContentItem: ObjectContent = {
            type: data,
            content: "",
            x: layoutItem.x,
            y: layoutItem.y,
            w: 12,
            h: 12,
            id: uuid(),
          };
          if (!draft.contents) draft.contents = {};
          draft.contents[newContentItem.id] = newContentItem;
        });
        mutate(newObject);
      }}
      width={window.innerWidth - 40} // Subtracting padding
      compactType="vertical"
      preventCollision={false}
      draggableHandle=".drag-handle"
      onLayoutChange={(layout) => {
        const newObject = produce(object, (draft) => {
          if (!draft.contents) draft.contents = {};
          Object.entries(draft.contents).forEach(([key, value]) => {
            const contentObj = value;
            const newLayoutItem = layout.find((item) => item.i === key);
            if (!newLayoutItem) return;
            contentObj.x = newLayoutItem.x;
            contentObj.y = newLayoutItem.y;
            contentObj.w = newLayoutItem.w === 0 ? 12 : newLayoutItem.w;
            contentObj.h = newLayoutItem.h === 0 ? 12 : newLayoutItem.h;
          });
        });
        if (newObject === object) return;
        mutate(newObject);
      }}
    >
      {object.contents &&
        Object.entries(object.contents).map(([key, value]) => {
          const contentObj = value;
          if (contentObj.type !== "text") return null;
          return (
            <div className={cn("content-block relative group")} key={key}>
              <TextBlock
                editorRef={editorRef}
                object={object}
                contentObject={contentObj}
                defaultFont={defaultFont}
                contentKey={key}
                mutate={mutate}
              />
            </div>
          );
        })}
    </ResponsiveGridLayout>
  );
};

const ContentGridMemo = React.memo(ContentGrid);

export default ContentGridMemo;
