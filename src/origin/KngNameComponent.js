import KngProcess from '../process/KngProcess'

export default class KngNameComponent {

  /**
   * @constructor
   */
	constructor(key, process) {
    if (typeof key !== 'string') {
      throw new Error('Name component key should be a string')
    }

    this.key = key
    this.process = process

    this.isProcessValid()
	}


	generateName() {
	  return this.process.generate()
  }

  /**
   * @returns {boolean}
   */
  isProcessValid() {
    if (typeof this.process !== 'object' || !this.process.prototype instanceof KngProcess) {
      throw new Error('Name component defined without process')
    }
    return true
  }


  /**
   * @returns {boolean}
   */
  isValid() {
    this.isProcessValid()
    this.process.checkReadyForGeneration()
    return true
  }

}
