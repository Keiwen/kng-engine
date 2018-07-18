import KngProcess from '../process/KngProcess'

export default class KngNameComposition {

  /**
   * @constructor
   */
	constructor(key, pattern) {
    if (typeof key !== 'string') {
      throw new Error('Name composition key should be a string')
    }

    this.key = key
    this.pattern = pattern
    this.components = {}

    this.isPatternValid()
	}

  /**
   * @param nameComponentProcess
   * @param partKey used in pattern
   */
  addNameComponent(nameComponentProcess, partKey) {
    if (typeof nameComponentProcess !== 'object' || !nameComponentProcess.prototype instanceof KngProcess) {
      throw new Error('Invalid name component')
    }
    nameComponentProcess.checkReadyForGeneration()
    this.components[partKey] = nameComponentProcess
  }

  /**
   * @param plain return full string combined, or map with split components
   * @returns {string[Object}
   */
  generateName(plain) {
	  let plainName = ''
	  let splitName = {split: {}, plain: ''}
    for (let i = 0; i < this.pattern.length; i++) {
      if (!this.components[this.pattern[i]]) continue
      let componentProcess = this.components[this.pattern[i]]
      splitName['split'][this.pattern[i]] = componentProcess.generate()
      plainName += splitName['split'][this.pattern[i]] + ' '
    }
    plainName = plainName.trim()
    if (plain) return plainName
    splitName['plain'] = plainName
    return splitName
  }


  /**
   * @returns {boolean}
   */
  isPatternValid() {
    if (typeof this.pattern !== 'object') {
      throw new Error('Name composition pattern should be array')
    }
    if (this.pattern.length === 0) {
      throw new Error('Name composition pattern is empty')
    }
    return true
  }



  /**
   * @returns {boolean}
   */
  isValid() {
    this.isPatternValid()
    for (let i = 0; i < this.pattern.length; i++) {
      if (!this.components[this.pattern[i]]) {
        throw new Error('No name component found for pattern part ' + this.pattern[i])
      }
    }
    return true
  }



}
