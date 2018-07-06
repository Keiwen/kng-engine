import WeightedListKngProcess from './process/WeightedListKngProcess'
import KngOrigin from './origin/KngOrigin'

export default class KngEngine {

  /**
   * @constructor
   */
	constructor() {
    this.origins = {}
    this.originsWeigtedList = new WeightedListKngProcess('')
	}


  addOrigin(origin, weight) {
    if (typeof origin !== 'object' || !origin.prototype instanceof KngOrigin) {
      throw new Error('Invalid origin')
    }
    if (typeof weight !== 'number') {
      weight = 1
    }
    origin.isValid()
    this.origins[origin.key] = origin
    this.originsWeigtedList.addToDictionary(origin.key, weight)
  }


  /**
   * @param plain return full string combined, or map with details
   * @returns {string[Object}
   */
  generateName(plain) {
    const randomOriginKey = this.originsWeigtedList.generate()
    return this.generateNameFromOrigin(randomOriginKey, plain)
  }


  /**
   * @param originKey force to use given origin if found
   * @param plain return full string combined, or map with details
   * @returns {string[Object}
   */
  generateNameFromOrigin(originKey, plain) {
    if (typeof originKey !== 'string' || typeof this.origins[originKey] === 'undefined') {
      // origin not found, generate without forcing key
      return this.generateName(plain)
    }

    const origin = this.origins[originKey]
    let name = origin.generateName(plain)
    if (plain) return name
    name['origin'] = originKey
    return name
  }


  /**
   * @returns {boolean}
   */
  isOriginsValid() {
    return this.originsWeigtedList.checkReadyForGeneration()
  }

  /**
   * @returns {boolean}
   */
  isValid() {
    this.isOriginsValid()
    return true;
  }

}
