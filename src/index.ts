/** 
 * Consolidation file. Exposes all classes and interfaces of the lib.
 * 
 * To use this lib from **source code**, simply add 
 * ```javascript
 * import Zepr = require('./zepr/index')
 * ```
 * to use the library.
 */

export { BackgroundType, Core } from './lib/core'
export { Engine } from './lib/engine'
export { MouseEventType, Clickable, ClickListener, DragListener, ZoomListener } from './lib/mouse'
export { ResourcesLoader, LoaderStats, LoaderScreen, DefaultLoaderScreen, ProgressBar } from './lib/loader'
export { GameScreen } from './lib/screen'
export { Direction, Sprite, RawSprite, ImageSprite, TiledSprite, TextSprite } from './lib/sprite'
export { Point, Vector, Shape, Rectangle, Circle } from './lib/geometry'
export { TextAlign, Font, Text } from './lib/text'
export { Sound } from './lib/sound'
export { Net } from './lib/network'
export { Fullscreen } from './lib/fullscreen'
