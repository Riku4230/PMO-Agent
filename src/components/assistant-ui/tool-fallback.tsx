"use client";

import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThreadPrimitive } from "@assistant-ui/react";

export const ToolFallback: ToolCallMessagePartComponent = ({
  toolName,
  argsText,
  result,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isRunning = result === undefined;
  
  return (
    <div className="aui-tool-fallback-root mb-4 flex w-full flex-col gap-3 rounded-lg border py-3">
      <div className="aui-tool-fallback-header flex items-center gap-2 px-4">
        <div className={cn(
          "flex h-4 w-4 items-center justify-center",
          isRunning ? "text-blue-600" : "text-green-600"
        )}>
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckIcon className="h-4 w-4" />
          )}
        </div>
        <p className="aui-tool-fallback-title flex-grow">
          {isRunning ? (
            <span className="flex items-center gap-2">
              <span className="animate-pulse">実行中:</span>
              <b>{toolName}</b>
            </span>
          ) : (
            <>
              Used tool: <b>{toolName}</b>
            </>
          )}
        </p>
        {!isRunning && (
          <Button onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        )}
      </div>
      
      {/* ツール実行中の点滅表示 */}
      {isRunning && (
        <div className="px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span>ツールを実行しています...</span>
          </div>
        </div>
      )}      
      {!isCollapsed && !isRunning && (
        <div className="aui-tool-fallback-content flex flex-col gap-2 border-t pt-2">
          <div className="aui-tool-fallback-args-root px-4">
            <pre className="aui-tool-fallback-args-value whitespace-pre-wrap">
              {argsText}
            </pre>
          </div>
          {result !== undefined && (
            <div className="aui-tool-fallback-result-root border-t border-dashed px-4 pt-2">
              <p className="aui-tool-fallback-result-header font-semibold">
                Result:
              </p>
              <pre className="aui-tool-fallback-result-content whitespace-pre-wrap">
                {typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
