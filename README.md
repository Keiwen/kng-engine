# kng-engine
[![npm](https://img.shields.io/npm/v/kng-engine.svg)](https://www.npmjs.com/package/kng-engine)
[![npm](https://img.shields.io/npm/dt/kng-engine.svg)](https://www.npmjs.com/package/kng-engine)

## How to try?
Check out configurator side-project https://github.com/Keiwen/kng-config

## What is about?
The Keiwen Name Generator Engine aims to generate random names. It contains 4 specific parts:

- Origin: represents the origin of the name (country, race, ...). It contains one or more compositions.
- Composition: represents the name composition (first then last name, only a nickname, ...). It contains one or more components.
- Component: represents a part of a full name (first name, last name, ...). It uses a process.
- Process: defines rules to generate a random name, based on entries given (the 'dictionary'). There are several types of processes, learn more in process documentation.

## Process types
A process will generate a random name based on given entries (the 'dictionary'). Processes are using following boolean parameters to format output (default value is false):

| Parameter | Description | Sample
| :--- | :--- | :--- |
| `uppercaseFirst` | format first character to upper case | Name |
| `capitalize` | format name to upper case | NAME |
| `minimize` | format name to lower case | name |

### Raw list process
Raw list process aims to pick a random value among a list.

Dictionary sample:
- Batman
- Superman

Possible results:
- Batman *(50 %)*
- Superman *(50 %)*

### Weighted list process
Weighted list process aims to pick a random value among a list, according to each element's weight (chance to be picked).

**Each entry should be defined with an associated weight (or default weight is used).**

**Weighted list allow _defaultWeight_ attribute to set default weight on entries (1 by default)**

Dictionary sample:
- Batman *(weight 3)*
- Superman *(weight 1)*

Possible results:
- Batman *(75 % = 3/4)*
- Superman *(25 % = 1/4)*

### Sequence process
Sequence process aims to build a random value following a list of characters group. It randomly picks a value among each entry.

Dictionary sample:
- Super / Bat
- man / girl

Possible results:
- Superman *(25 %)*
- Supergirl *(25 %)*
- Batman *(25 %)*
- Batgirl *(25 %)*

### Char group pattern process
Char group pattern process aims to build a random value following a given pattern. Each entry contains a group of characters, identified by a key. On generation, it will follow the pattern to pick a random value from matching entry. If no match found, generated name will keep this value.

**Each entry must be defined with an associated key.**

**Parameter 'pattern' is required. If multiple values provided, a random one will be picked before generation.**

Dictionary sample:
- a *(key a)*
- p / m *(key b)*

Possible results *(with pattern 'ab' an 'a-b')*:
- ap *(25 %)*
- am *(25 %)*
- a-p *(25 %)*
- a-m *(25 %)*

### Markov process
Markov process aims to build a random name similar to given entries, based on a Markov chain *([see markov chain on wikipedia](https://en.wikipedia.org/wiki/Markov_chain))*. A Markov state represents a characters group. Its linked to other states (neighbors) representing next character groups possibilities. Neighbors weight is based on how often this combination is found in given entries. Generation will pick a random initial char, then randomly process markov chain and concatenate all characters found.

**Parameter 'order' is required. It will determine how many characters are considered in a group.**

Dictionary sample:
- Manwë
- Yavanna

Possible results *(with order 2)*:
- Manwë *(25 %)*
- Yavanna *(25 %)*
- Manna *(25 %)*
- Yavanwë *(25 %)*

**This process can also use specific parameters, as described below.**

| Parameter | Description | default
| :--- | :--- | :--- |
| `minLength` | Minimum length of generated name | 1 |
| `maxLength` | Maximum length of generated name (-1 to ignore limit) | -1 |
| `maxAttempts` | How many attempts are allowed to generate a name matching requirements | 25 |
| `allowDuplicates` | Allow generated name to exactly match one of the entry | `true` |
| `allowSubDuplicates` | Allow generated name to match a sub-part of one of the entry | `true` |


## Global use
- npm install
```
npm install --save kng-engine
```
- import classes you need
```
import { RawListKngProcess } from 'kng-engine'
```
- Sample here of usa people with small percentage having french first name:
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

