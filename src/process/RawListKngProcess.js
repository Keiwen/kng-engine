import KngProcess from './KngProcess'

export default class RawListKngProcess extends KngProcess {

  /**
   * Raw list process aims to pick a random value among a list
   * Dictionary will contains all possible values
   * Generation will pick a random element in this list
   * Formatting options for generated term are: capitalize, minimize, uppercaseFirst
   * Formatting options could be set in parameters or by changing object attributes
   * @constructor
   * @param {string} key Process' key (mainly used for import/export)
   * @param {object} parameters Parameters to use for this process
   */
	constructor(key, parameters) {
    super(key, parameters)
	}


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
  };


  /**
   * Generates a random term according to process
   * @return {string} generated term
   */
  generate() {
    this.checkReadyForGeneration()

    const randomIndex = Math.floor(Math.random() * this.dictionarySize)
    return this.formatTerm(this.dictionary[randomIndex])
  }

}
