import KngProcess from './KngProcess'

export default class SequenceKngProcess extends KngProcess {

  /**
   * Sequence process aims to build a random value following a list of characters group
   * Dictionary will contains groups of characters
   * Generation will pick a random value in each char group and concatenate all values
   * @constructor
   * @param {string} key Process' key (mainly used for import/export)
   * @param {object} parameters Parameters to use for this process.
   */
	constructor(key, parameters) {
    super(key, parameters)
	}


  /**
   * Adds a single char group to the dictionary
   * @param {Array|string} term group of chars - string will be converted to array (sep with ,;/ or split by char)
   */
  addToDictionary(term) {
    if (typeof term === 'string') {
      term = KngProcess.splitTerm(term)
    }
    if (typeof term !== 'object' || term.length === 0) {
      this.throwError(this.ERROR_INVALID_FORMAT, 'term should contain a non-empty array of chars')
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

    let term = ''
    for (let i = 0; i < this.dictionary.length; i++) {
      // pick a random element in char group
      let randomIndex = Math.floor(Math.random() * this.dictionary[i].length)
      term += this.dictionary[i][randomIndex]
    }

    return this.formatTerm(term)
  }


  /**
   * Count number of possibilities for term generation
   * @return {number|null} count, or null if cannot be determined
   */
  countPossibilities() {
    let count = 0
    for (let i = 0; i < this.dictionary.length; i++) {
      if (count === 0) {
        count = this.dictionary[i].length
      } else {
        count = count * this.dictionary[i].length
      }
    }
    return count
  }

}
