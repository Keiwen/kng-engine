# kng-engine
[![npm](https://img.shields.io/npm/v/kng-engine.svg)](https://www.npmjs.com/package/kng-engine)
[![npm](https://img.shields.io/npm/dt/kng-engine.svg)](https://www.npmjs.com/package/kng-engine)

## Global use
- npm install
```
npm install --save kng-engine
```
- import classes you need
```
import { RawListKngProcess } from 'kng-engine'
```
- Doc to be completed. Sample here of usa people with small percentage having french first name:
```
// english first name
let enFirstNameProcess = new RawListKngProcess('efn')
enFirstNameProcess.addListToDictionary(['Michael', 'Andrew', 'Ryan'])
// french first name
let frFirstNameProcess = new RawListKngProcess('ffn')
frFirstNameProcess.addListToDictionary(['Pierre', 'Nicolas', 'Jean'])
// english last name
let enLastNameProcess = new RawListKngProcess('eln')
enLastNameProcess.addListToDictionary(['Smith', 'Jones', 'Williams'])
// _______________________________
// name components
let enFirstNameComponent = new KngNameComponent('efn', enFirstNameProcess)
let frFirstNameComponent = new KngNameComponent('ffn', frFirstNameProcess)
let enLastNameComponent = new KngNameComponent('eln', enLastNameProcess)
// _______________________________
// full english composition
let enComposition = new KngNameComposition('en', ['first', 'last'])
enComposition.addNameComponent(enFirstNameComponent, 'first')
enComposition.addNameComponent(enLastNameComponent, 'last')
// french & english composition
let frEnComposition = new KngNameComposition('frEn', ['first', 'last'])
frEnComposition.addNameComponent(frFirstNameComponent, 'first')
frEnComposition.addNameComponent(enLastNameComponent, 'last')
// _______________________________
// origin
let usaOrigin = new KngOrigin('usa')
usaOrigin.addNameComposition(enComposition, 'en', 9)
usaOrigin.addNameComposition(frEnComposition, 'fr', 1)
// _______________________________
// engine creation
let engine = new KngEngine()
engine.addOrigin(usaOrigin)
return engine.generateName()
```

## Contribution
- Fork the repository
- Do your stuff
- When you're done, commit your work for a pull request.

