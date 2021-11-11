export * from '@pixi/constants';
export * from '@pixi/math';
export * from '@pixi/runner';
export * from '@pixi/settings';
export * from '@pixi/ticker';
import * as utils from '@pixi/utils';
export { utils };
export * from '@pixi/display';
export * from '@pixi/core';
export * from '@pixi/sprite';
export * from '@pixi/app';
export * from '@pixi/graphics';
export * from '@pixi/text';

// Renderer plugins
import { Renderer } from '@pixi/core';
import { BatchRenderer } from '@pixi/core';
Renderer.registerPlugin('batch', BatchRenderer);

// Application plugins
import { Application } from '@pixi/app';
import { TickerPlugin } from '@pixi/ticker';
Application.registerPlugin(TickerPlugin);
