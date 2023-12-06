import React from "react";
import { commandsCtx, editorViewCtx } from "@milkdown/core";
import { Ctx, MilkdownPlugin } from "@milkdown/ctx";
import { slashFactory } from "@milkdown/plugin-slash";
import {
  createCodeBlockCommand,
  insertHrCommand,
  wrapInHeadingCommand,
} from "@milkdown/preset-commonmark";
import { ReactNode } from "react";

type ConfigItem = {
  renderer: ReactNode;
  onSelect: (ctx: Ctx) => void;
};

const removeSlash = (ctx: Ctx) => {
  // remove slash
  const view = ctx.get(editorViewCtx);
  view.dispatch(
    view.state.tr.delete(
      view.state.selection.from - 1,
      view.state.selection.from
    )
  );
};

export const slash = slashFactory("slashMenu") satisfies MilkdownPlugin[];

export const config: Array<ConfigItem> = [
  {
    onSelect: (ctx: Ctx) =>
      ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 1),
    renderer: <>Heading 1</>
  },
  {
    onSelect: (ctx: Ctx) =>
      ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 2),
    renderer: <>Heading 2</>
  },
  {
    onSelect: (ctx: Ctx) =>
      ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 3),
    renderer: <>Heading 3</>
  },
  {
    onSelect: (ctx: Ctx) =>
      ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 4),
    renderer: <>Heading 4</>
  },
  {
    onSelect: (ctx: Ctx) =>
      ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 5),
    renderer: <>Heading 5</>
  },
  {
    onSelect: (ctx: Ctx) =>
      ctx.get(commandsCtx).call(wrapInHeadingCommand.key, 6),
    renderer: <>Heading 6</>
  },
  {
    onSelect: (ctx: Ctx) =>
      ctx.get(commandsCtx).call(createCodeBlockCommand.key),
    renderer: <>Code block</>
  },
  {
    onSelect: (ctx: Ctx) => ctx.get(commandsCtx).call(insertHrCommand.key),
    renderer: <>Horizontal divider</>
  },
].map((item) => ({
  ...item,
  onSelect: (ctx: Ctx) => {
    removeSlash(ctx);
    item.onSelect(ctx);
  },
}));
