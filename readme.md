# zepr.ts v0.0.4

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

API documentation is available [here](https://zepr.fr/zepr.ts/api)

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
