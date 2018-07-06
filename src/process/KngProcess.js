export default class KngProcess {

  /**
   * This parent process aims to define basic methods to use
   * Dictionary will contains input values
   * Generation will generate a random term based on inputs
   * Formatting options for generated term are: capitalize, minimize, uppercaseFirst
   * Formatting options could be set in parameters or by changing object attributes
   * @constructor
   * @param {string} key Process' key (mainly used for import/export)
   * @param {object} parameters Parameters to use for the process
   */
	constructor(key, parameters) {
    this.ERROR_INVALID_FORMAT = 'Invalid format'
    this.ERROR_GENERATION = 'Cannot generate'
    this.ERROR_BUILD = 'Dictionary build failed'
    this.ERROR_DEFINITION = 'Undefined'

    if (typeof key !== 'string') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'process key should be string')
    }
    if (typeof parameters === 'undefined') {
      parameters = {}
    }
    if (typeof parameters !== 'object') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'process parameters should be object')
    }

    this.key = key
    this.rawParameters = parameters
    this.dictionary = []
    this.dictionarySize = 0

    this.capitalize = false
    if (this.rawParameters.capitalize) this.capitalize = true
    this.minimize = false
    if (this.rawParameters.minimize) this.minimize = true
    this.uppercaseFirst = false
    if (this.rawParameters.uppercaseFirst) this.uppercaseFirst = true
	}

  /**
   * Throwing formatted error
   * @private
   * @param {string} category see constants (this.ERROR_*)
   * @param {string} msg specific message
   */
	throwError(category, msg) {
	  let fullMsg = category
	  if (msg) fullMsg += ': ' + msg
    throw new Error(fullMsg)
  }

  /**
   * Adds a single term to the dictionary
   * Child class must override this
   * @param {string} term
   */
  addToDictionary(term) {
    this.throwError(this.ERROR_DEFINITION, 'addToDictionary method must be overriden')
  };


  /**
   * Adds multiple terms to the dictionary
   * @param {Array.<string>} terms
   */
  addListToDictionary(terms) {
    if (typeof terms !== 'object') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'terms list to add should be an array')
    }
    for (let i = 0; i < terms.length; i++) {
      this.addToDictionary(terms[i])
    }
  };


  /**
   * Generates a random term according to process
   * Child class must override this
   * @return {string} generated term
   */
  generate() {
    this.throwError(this.ERROR_DEFINITION, 'generate method must be overriden')
  }


  /**
   * Format term before returning
   * @private
   * @return {string} formated term
   */
  formatTerm(term) {
    if (this.capitalize) {
      return term.toUpperCase()
    }
    if (this.minimize) {
      term = term.toLowerCase()
    }
    if (this.uppercaseFirst) {
      return term.charAt(0).toUpperCase() + term.slice(1)
    }
    return term;
  }


  /**
   * Count number of possibilities for term generation
   * Child class should override this
   * @return {number|null} count, or null if cannot be determined
   */
  countPossibilities() {
    return this.dictionarySize
  }


  /**
   * @return {boolean}
   */
  isDictionaryEmpty() {
    return this.dictionarySize === 0
  }


  /**
   * Check if process is valid / ready to generate
   * @return {boolean}
   */
  checkReadyForGeneration() {
    if (this.isDictionaryEmpty()) {
      this.throwError(this.ERROR_GENERATION, 'empty dictionary')
    }
    return true
  }

  /**
   * Get predefined group of chars
   * - vowel
   * - consonant
   * @param {string} key identifying a predefined group, list in description
   * @return {string|Array} group of chars
   */
  static getPredefinedCharGroup(key) {
    switch (key) {
      case 'vowel':
        return 'aeiouy'
        break
      case 'consonant':
        return 'bcdfghjklmnpqrstvwxz'
        break
      default: return []
    }
  }

  static splitTerm(multipleTerms) {
    if (typeof multipleTerms !== 'string') this.throwError(this.ERROR_INVALID_FORMAT, 'tried to split term on non-string input')
    let separator = ''
    switch (true) {
      case (multipleTerms.indexOf(', ') !== -1):
        separator = ', '
        break
      case (multipleTerms.indexOf(',') !== -1):
        separator = ','
        break
      case (multipleTerms.indexOf('; ') !== -1):
        separator = '; '
        break
      case (multipleTerms.indexOf(';') !== -1):
        separator = ';'
        break
      case (multipleTerms.indexOf(' / ') !== -1):
        separator = ' / '
        break
      case (multipleTerms.indexOf('/') !== -1):
        separator = '/'
        break
    }
    //turn string to array (if no separator, will split each char)
    return multipleTerms.split(separator);
  }

}

