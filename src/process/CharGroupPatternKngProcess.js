import KngProcess from './KngProcess'

export default class CharGroupPatternKngProcess extends KngProcess {

  /**
   * Char Group Pattern process aims to build a random value following a given pattern
   * Dictionary will contains groups of characters with a identifying key
   * Pattern will describe a sequence of char group to pick among (could be defined in initial parameters or with setter)
   * Patterns could contains a list of pattern. A random one will be choosen on generation.
   * Generation will pick a random value in a char group for each pattern step and concatenate all values
   * @constructor
   * @param {string} key Process' key (mainly used for import/export)
   * @param {object} parameters Parameters to use for this process. If string provided, considered as pattern. Pattern string can contains separator (,;/) to get multiple pattern
   */
	constructor(key, parameters) {
    if (typeof parameters === 'string') parameters = {pattern: parameters}
    super(key, parameters)

    // dictionary will be a object using a key for each group of chars
    this.dictionary = {}

    this.patternList = []
    if (this.rawParameters.pattern) {
      if (KngProcess.detectSeparator(this.rawParameters.pattern) === '') {
        this.addPattern(this.rawParameters.pattern)
      } else {
        const patternList = KngProcess.splitTerm(this.rawParameters.pattern)
        for (let i = 0; i < patternList.length; i++) {
          this.addPattern(patternList[i])
        }
      }
    }
	}


  /**
   * Add a sequence pattern using char group's keys.
   * Initial pattern could be initialized in parameters.
   * @param {Array|string} pattern list of group key (string will be converted to array of chars)
   */
	addPattern(pattern) {
    if (typeof pattern === 'string') {
      pattern = pattern.split('')
    }
    if (typeof pattern !== 'object') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'pattern should be a list of group keys')
    }
    if (pattern.length <= 0) {
      this.throwError(this.ERROR_INVALID_FORMAT, 'pattern should not be empty')
    }
    this.patternList.push(pattern)
  }


  /**
   * Adds a single char group to the dictionary
   * @param {Array|string} term group of chars - string will be converted to array (sep with ,;/ or split by char)
   * @param {string} key to representing the group, to be used in pattern
   */
  addToDictionary(term, key) {
    // do not allow anonymous key
    if (typeof key === 'undefined') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'key cannot be empty')
    }
    if (typeof term === 'string') {
      term = KngProcess.splitTerm(term);
    }
    if (typeof term !== 'object' || term.length === 0) {
      this.throwError(this.ERROR_INVALID_FORMAT, 'term should contain a non-empty array of chars')
    }
    if (typeof key !== 'string') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'term key should be a string')
    }

    // check if key already defined to track dictionary size ...
    if (typeof this.dictionary[key] === 'undefined') {
      this.dictionarySize++
    }
    // ... but do not block, allow override
    this.dictionary[key] = term
  };


  /**
   * Adds multiple terms to the dictionary
   * @param {Array.<Array>} terms
   */
  addListToDictionary(terms) {
    if (typeof terms !== 'object') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'terms list to add should be an array')
    }
    for (let i = 0; i < terms.length; i++) {
      if (typeof terms[i] !== 'object' && terms[i].length !== 2) {
        this.throwError(this.ERROR_INVALID_FORMAT, 'element ' + i + ' in list should be array of term and key')
      }
      this.addToDictionary(terms[i][0], terms[i][1])
    }
  };


  /**
   * @return {boolean}
   */
  isPatternEmpty() {
    return this.patternList.length === 0
  }


  /**
   * Check if process is valid / ready to generate
   * @return {boolean}
   */
  checkReadyForGeneration() {
    super.checkReadyForGeneration();
    if (this.isPatternEmpty()) {
      this.throwError(this.ERROR_GENERATION, 'no pattern defined')
    }
    return true;
  }


  /**
   * Generates a random term according to process
   * @return {string} generated term
   */
  generate() {
    this.checkReadyForGeneration()

    // pick a random pattern
    let randomIndex = Math.floor(Math.random() * this.patternList.length)
    const randomPattern = this.patternList[randomIndex]

    let term = ''
    for (let i = 0; i < randomPattern.length; i++) {
      let key = randomPattern[i]
      let nextInTerm = key
      // if key not found, add raw key to term
      if (typeof this.dictionary[key] !== 'undefined') {
        // else pick a random element in char group
        randomIndex = Math.floor(Math.random() * this.dictionary[key].length)
        nextInTerm = this.dictionary[key][randomIndex]
      }
      term += nextInTerm
    }

    return this.formatTerm(term)
  }


  /**
   * Count number of possibilities for term generation
   * @return {number|null} count, or null if cannot be determined
   */
  countPossibilities() {
    let count = 0
    if (this.paternList.length < 1) return 0
    // way too complex to compute including intersections on several patterns
    if (this.paternList.length > 1) return null
    const pattern = this.patternList[0]

    for (let i = 0; i < pattern.length; i++) {
      let key = pattern[i]
      // ignore non-randomized element of pattern
      if (typeof this.dictionary[key] !== 'undefined') {
        if (count === 0) {
          count = this.dictionary[key].length
        } else {
          count = count * this.dictionary[key].length
        }
      }
    }
    return count
  }

}
