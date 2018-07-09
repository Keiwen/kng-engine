import KngProcess from './KngProcess'

export default class WeightedListKngProcess extends KngProcess {

  /**
   * Weighted list process aims to pick a random value among a list, according to each element's weight (chance to be picked)
   * Dictionary will contains all possible values
   * A weighted list will cumulate values' weights and set a map of minimum weight => value
   * Generation will pick a random number from 1 to cumulative weight and select values in that range from weighted list
   * @constructor
   * @param {string} key Process' key (mainly used for import/export)
   * @param {object} parameters Parameters to use for this process. If number provided, considered as default weight
   */
	constructor(key, parameters) {
    if (typeof parameters === 'number') parameters = {defaultWeight: parameters}
	  super(key, parameters)

    this.defaultWeight = 1
    if (typeof this.rawParameters.defaultWeight === 'number' && this.rawParameters.defaultWeight > 0) this.defaultWeight = this.rawParameters.defaultWeight

    this.cumulativeWeight = 0
    this.weightedList = {}
  }


  /**
   * Adds a single term to the dictionary
   * @param {string} term
   * @param {number} weight chance to be picked
   */
  addToDictionary(term, weight) {
    if (typeof weight === 'undefined') {
      weight = this.defaultWeight;
    }
    if (typeof term !== 'string') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'term to add should be a string')
    }
    if (typeof weight !== 'number') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'term\'s weight should be a number')
    }
    if (weight <= 0) {
      this.throwError(this.ERROR_INVALID_FORMAT, 'term\'s weight must be greater than 0')
    }

    // keep a simple dictionary with possible values
    this.dictionary.push(term)
    this.dictionarySize++

    // build a list with cumulatives weights to generate term faster
    // element would be: 'maximumWeight: term'
    this.cumulativeWeight += weight
    this.weightedList[this.cumulativeWeight] = term
  };


  /**
   * Adds multiple terms to the dictionary
   * @param {Array.<Array>} terms list of term/weight
   */
  addListToDictionary(terms) {
    if (typeof terms !== 'object') {
      this.throwError(this.ERROR_INVALID_FORMAT, 'terms list to add should be an array')
    }
    for (let i = 0; i < terms.length; i++) {
      if (typeof terms[i] === 'object') {
        if (terms[i].length > 2) {
          this.throwError(this.ERROR_INVALID_FORMAT, 'element ' + i + ' in list should be array of term and weight')
        }
        if (terms[i].length === 2) {
          this.addToDictionary(terms[i][0], terms[i][1])
        } else {
          this.addToDictionary(terms[i][0])
        }
      } else {
        this.addToDictionary(terms[i])
      }
    }
  };


  /**
   * Generates a random term according to process
   * @return {string} generated term
   */
  generate() {
    this.checkReadyForGeneration()

    const randomWeight = Math.ceil(Math.random() * (this.cumulativeWeight))
    let previousMaxWeight = 0
    let maxWeight = 0
    // loop on weighted list.
    // If maximum weight greater than random one, pick current element
    for (maxWeight in this.weightedList) {
      if (maxWeight >= randomWeight) break
      previousMaxWeight = maxWeight
    }

    return this.formatTerm(this.weightedList[maxWeight])
  }

}
