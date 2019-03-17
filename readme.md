# zepr.ts v0.2.2

A simple HTML5 rendering engine

## Installation

Run the following command inside your project directory to install

```
npm install zepr.ts
```

## Usage

In your source code, simply add

```
import Zepr = require('zepr.ts');
```

## API Documentation 

### Online

API documentation is available [here](https://zepr.fr/zts/api)

### Do it yourself (from source code)

Install TypeDoc 

```
npm install --global typedoc
```

In the project, run

```
typedoc --out ./dist/docs/ --mode file --name "zepr.ts | An HTML5 rendering engine"
```

## Changelog

### 0.2.2 - 2019.03.17

- BugFix Ignore unparsable json answer in `Zepr.Net`

### 0.2.1 - 2019.02.08

Refactoring of `ImageSprite`
- View centered on image rather than on underlying shape (In order to use other shapes than `Rectangle`)
- Added `Circle` as a possible underlying shape
- removed useless `getRect()` method (same usage as inherited `getShape()` method)

### 0.2.0 - 2019.02.07

Major refactoring. The goal is to simplify integration of the [p2.js](https://github.com/schteppe/p2.js) 2D physics engine
- New geometric functions (Mostly on `Vector` and `Rectangle`)
- `Shape` implementations can now rotate, with updated collision detection between shapes
- `Rectangle` is centered. The static method `Rectangle.asRect()` was added to create a `Rectangle` with its upper-left vertice coords (as in Zepr 0.1.x)
- All implementations of `Sprite` were updated accordingly. Collisions with rotated `ImageSprite` are now properly managed 
- BugFix Coordinates were mistakenly rounded (Misuse of bit shift operations)

### 0.1.5 - 2018.11.25

- BugFix Forgotten loader

### 0.1.4 - 2018.11.25

Refactoring of sprite
- `Sprite` is now an interface
- moved implementation to `RawSprite` abstract class
- `Sprite` now use `Shape` rather than `Rectangle` 

### 0.1.3 - 2018.11.04

- Refactoring of geometry, new functions for `Vector`
- Added centered background

### 0.1.2 - 2018.10.28

- Added rotation to `Vector`

### 0.1.1 - 2018.10.27

- Added `Shape` interface and `Circle` implementation
- Added rotation to `ImageSprite`

### 0.1.0 - 2018.10.20

New elements for a new project
- Added overflow mode (scene is full screen and scrollable)
- Added simple `Sprite` wrapper for `Text`
- Added accessors to unified cache (No more screen cache)
- BugFix NaN on direction for `TiledSprite`

### 0.0.9 - 2018.09.09

- Resource loader with default (basic) loader screen

### 0.0.8 - 2018.09.05

- Improvements for Sound class, ready for Chrome 70 autoplay policy
- New method `setZoom()`

### 0.0.7 - 2018.08.16

- BugFix [again] Touch zoom (completely removed 'passive' Chrome warning)
- Prevents concurrent drag + zoom

### 0.0.6 - 2018.08.15

- BugFix Touch zoom (no more zoom reset + removed browser warning)

### 0.0.5 - 2018.07.01

- BugFix AudioContext problem with Safari

### 0.0.4 - 2018.06.18

- Added support for typeDoc
- Minor API corrections
- New method `scale()` on Rectangle

### 0.0.3 - 2018.06.11

- BugFix TouchEvent problem with Firefox

### 0.0.2 - 2018.06.09

- Added zoom control
- Added screen cache
- Removed name for Screen and Sprite classes

### 0.0.1 - 2018.06.03

- First published release
