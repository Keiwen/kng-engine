import WeightedListKngProcess from '../process/WeightedListKngProcess'
import KngNameComposition from './KngNameComposition'

export default class KngOrigin {

  /**
   * @constructor
   */
	constructor(key) {
    if (typeof key !== 'string') {
      throw new Error('Name origin key should be a string')
    }

    this.key = key
    this.compositions = {}
    this.compositionsWeigtedList = new WeightedListKngProcess('')
	}


  addNameComposition(nameComposition, partKey, weight) {
    if (typeof nameComposition !== 'object' || !nameComposition.prototype instanceof KngNameComposition) {
      throw new Error('Invalid name composition')
    }
    if (typeof partKey !== 'string') {
      partKey = ''
    }
    if (typeof weight !== 'number') {
      weight = 1
    }
    nameComposition.isValid()
    this.compositions[partKey] = nameComposition
    this.compositionsWeigtedList.addToDictionary(partKey, weight)
  }



  /**
   * @param plain return full string combined, or map with details
   * @returns {string[Object}
   */
  generateName(plain) {
    let plainName = ''
    let splitName = {}
    const randomCompositionKey = this.compositionsWeigtedList.generate()
    const randomComposition = this.compositions[randomCompositionKey]
    let name = randomComposition.generateName(plain)
    if (plain) return name
    name['composition'] = randomCompositionKey
    return name
  }


  /**
   * @returns {boolean}
   */
  isCompositionsValid() {
    return this.compositionsWeigtedList.checkReadyForGeneration()
  }

  /**
   * @returns {boolean}
   */
  isValid() {
    this.isCompositionsValid()
    return true
  }

}
