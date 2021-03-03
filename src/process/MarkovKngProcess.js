import KngProcess from './KngProcess'

export default class MarkovKngProcess extends KngProcess {

  /**
   * Markov Sequence process aims to build a random value similar to given values
   * Dictionary will contains initial values
   * MarkovTree will contains a tree representing markov chain, each state representing a char group
   * Markov states is linked to other states (neighbors) that represent next char possibilities.
   * Neighbors weight is based on how often this combination is found in given values
   * Order parameter will determine of many characters are considered when picking the next one (must be defined at initialization)
   * Generation will pick a random initial char, then randomly process markov tree and concatenate char found
   * Parameters include minLength, maxLength (-1 to ignore), maxAttempts (error when term not generated after X fails)
   * Parameters include allowDuplicates (exact match from dictionary), setAllowSubDuplicates (substring match from dictionary)
   * @constructor
   * @param {string} key Process' key (mainly used for import/export)
   * @param {object} parameters Parameters to use for this process. If number provided, considered as markov order
   */
	constructor(key, parameters) {
    if (typeof parameters === 'number') parameters = {order: parameters}
    super(key, parameters)

    this.markovTree = {}
    // Initialize markov tree with empty string as start state
    this.startState = MarkovKngProcess.generateMarkovState('')
    this.duplicates = MarkovKngProcess.generateDuplicateNode()

    this.order = 1
    if (typeof this.rawParameters.order === 'number' && this.rawParameters.order > 0) this.order = this.rawParameters.order
    this.minLength = 1
    this.maxLength = -1
    this.setTermLength(this.rawParameters.minLength, this.rawParameters.maxLength)
    this.maxAttempts = 25
    this.setMaxAttempts(this.rawParameters.maxAttempts)
    this.allowDuplicates = true
    this.setAllowDuplicates(this.rawParameters.allowDuplicates)
    this.allowSubDuplicates = true
    this.setAllowSubDuplicates(this.rawParameters.allowSubDuplicates)
    this.ignoreWeight = false
    this.setIgnoreWeight(this.rawParameters.ignoreWeight)
	}


  /**
   * Generate node object when building duplicatetree
   * @private
   * @return {Object} initialized duplicate node
   */
  static generateDuplicateNode() {
    return {children: []}
  }


  /**
   * Generate markov state object when building markov tree
   * @private
   * @param {string} value markov state value
   * @param {array} neighbors list of adjacent markov states
   * @return {Object} initialized markov state
   */
  static generateMarkovState(value, neighbors) {
    if (typeof(neighbors)==='undefined') neighbors = []
    return {
      value: value,
      neighbors: neighbors
    }
  }


  /**
   * Set length wanted for generated term
   * @param {number} min
   * @param {number} max
   * @return {boolean} changed
   */
  setTermLength(min, max) {
    if (typeof min === 'undefined') min = this.minLength
    if (typeof max === 'undefined') max = this.maxLength
    if (typeof min !== 'number' || min <= 0) return false
    if (typeof max !== 'number') return false
    if (max !== -1 && min > max) return false
    this.minLength = min
    this.maxLength = max
    return true
  }

  /**
   * Set max attempts when trying to generate term
   * @param {number} maxAttempts should be greater than 0
   * @return {boolean} changed
   */
  setMaxAttempts(maxAttempts) {
    if (typeof maxAttempts !== 'number' || maxAttempts <= 0) {
      return false
    }
    this.maxAttempts = maxAttempts
    return true
  }


  /**
   * Allow generated terms to be equal to a dictionary entry
   * @param {boolean} allowDuplicates
   * @return {boolean} changed
   */
  setAllowDuplicates(allowDuplicates) {
    if (allowDuplicates) {
      this.allowDuplicates = true
    } else {
      this.allowDuplicates = false
    }
    return true
  }


  /**
   * Allow generated terms to be a substring to a dictionary entry
   * @param {boolean} allowSubDuplicates
   * @return {boolean} changed
   */
  setAllowSubDuplicates(allowSubDuplicates) {
    if (allowSubDuplicates) {
      this.allowSubDuplicates = true
    } else {
      this.allowSubDuplicates = false
    }
    return true
  }


  /**
   * When picking next characters, choose with equi probability
   * @param {boolean} ignoreWeight
   * @return {boolean} changed
   */
  setIgnoreWeight(ignoreWeight) {
    if (ignoreWeight) {
      this.ignoreWeight = true
    } else {
      this.ignoreWeight = false
    }
    return true
  }


  /**
   *
   * @param order
   * @returns {module.MarkovKngProcess}
   */
  convertToOrder(order) {
    if (typeof this.order !== 'number' || this.order <= 0) this.throwError(this.ERROR_INVALID_FORMAT, 'order should be greater than 0')
    const parameters = {
      order: order,
      minLength: this.minLength,
      maxLength: this.maxLength,
      maxAttempts: this.maxAttempts,
      allowDuplicates: this.allowDuplicates,
      allowSubDuplicates: this.allowSubDuplicates,
      ignoreWeight: this.ignoreWeight
    }
    let newMarkov = new MarkovKngProcess(this.key, parameters)
    newMarkov.addListToDictionary(this.dictionary)
    return newMarkov
  }


  /**
   * Adds a term to duplicates
   * @private
   * @param {string} term term to add in duplicates (recursively add substrings)
   */
  addToDuplicates(term) {
    if (term.length > 1) {
      this.addToDuplicates(term.substr(1))
    }

    let currentNode = this.duplicates
    for (let i = 0; i < term.length; i++) {
      let childNode = currentNode.children[term[i]]
      if (!childNode) {
        childNode = MarkovKngProcess.generateDuplicateNode()
        currentNode.children[term[i]] = childNode
      }
      currentNode = childNode
    }
  };


  /**
   * Check if a term is duplicate to one of entries
   * @param {string} term term to check
   * @param {boolean} allowSubString if false, also check substring duplicates.
   */
  isDuplicate(term, allowSubString) {
    if (!allowSubString) return this.isSubDuplicate(term)
    term = term.toLowerCase()
    for (let i = 0; i < this.dictionary.length; i++) {
      if (term === this.dictionary[i].toLowerCase()) {
        return true
      }
    }
    return false
  };


  /**
   * Check if a term is duplicate to one of entries or its substring
   * @private
   * @param {string} term term to check
   */
  isSubDuplicate(term) {
    term = term.toLowerCase()
    let currentNode = this.duplicates
    for (let i = 0; i < term.length; i++) {
      let childNode = currentNode.children[term[i]]
      if (!childNode) return false
      currentNode = childNode
    }
    return true
  };


  /**
   * Adds a single term to the dictionary
   * @param {string} term
   */
  addToDictionary(term) {
    if (typeof term !== 'string') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'term to add should be a string')
    }
    this.dictionary.push(term)
    this.dictionarySize++

    // add sub-duplicate
    this.addToDuplicates(term)

    let previousState = this.startState
    let key = ''
    for (let i = 0; i < term.length; i++) {
      let ch = term[i]
      key += ch
      if (key.length > this.order) {
        key = key.substr(1)
      }
      let currentState = this.markovTree[key]
      if (!currentState) {
        currentState = MarkovKngProcess.generateMarkovState(ch)
        this.markovTree[key] = currentState
      }

      previousState.neighbors.push(currentState)
      previousState = currentState
    }
    //add a dead end
    previousState.neighbors.push(null)

  };


  /**
   * Generates a random term according to process
   * @return {string} generated term
   */
  generate() {
    this.checkReadyForGeneration()

    let term
    let attempts = 0
    do
    {
      attempts++
      let nextStateIndex = Math.floor(Math.random() * this.startState.neighbors.length)
      let nextState = this.startState.neighbors[nextStateIndex]
      term = ''

      while (nextState && (this.maxLength < 0 || term.length <= this.maxLength)) {
        term += nextState.value
        // move to next state
        nextStateIndex = Math.floor(Math.random() * nextState.neighbors.length)
        nextState = nextState.neighbors[nextStateIndex]
      }
    }
    while (!this.isTermValid(term) && attempts < this.maxAttempts)

    if (!this.isTermValid(term)) {
      this.throwError(this.ERROR_GENERATION, 'unable to generate term after ' + attempts + ' attempts')
    }

    return this.formatTerm(term)
  }

  /**
   * @return {boolean}
   */
  isDictionaryEmpty() {
    return this.startState.neighbors.length === 0
  }


  /**
   * Check if generated term is valid according to parameters
   * @param {string} term
   * @return {boolean} validity
   */
  isTermValid(term) {
    if (this.minLength > term.length) return false
    if (this.maxLength !== -1 && this.maxLength < term.length) return false
    if (!this.allowSubDuplicates && this.isDuplicate(term, false)) return false
    if (!this.allowDuplicates && this.isDuplicate(term, true)) return false

    return true
  }


  /**
   * Count number of possibilities for term generation
   * @return {number|null} count, or null if cannot be determined
   */
  countPossibilities() {
    return null
  }

}
