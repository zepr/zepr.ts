# zepr.ts v0.1.0

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
