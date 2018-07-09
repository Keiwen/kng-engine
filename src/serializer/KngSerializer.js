import KngProcess from '../process/KngProcess'
import RawListKngProcess from '../process/RawListKngProcess'
import WeightedListKngProcess from '../process/WeightedListKngProcess'
import SequenceKngProcess from '../process/SequenceKngProcess'
import CharGroupPatternKngProcess from '../process/CharGroupPatternKngProcess'
import MarkovKngProcess from '../process/MarkovKngProcess'
import KngNameComponent from '../origin/KngNameComponent'
import KngNameComposition from '../origin/KngNameComposition'
import KngOrigin from '../origin/KngOrigin'
import KngEngine from '../KngEngine'

export default class KngSerializer {

  static getProcessType(kngProcess) {
    if (typeof kngProcess !== 'object' || !kngProcess.prototype instanceof KngProcess) {
      throw new Error('Invalid process to type')
    }
    switch (true) {
      case (kngProcess instanceof RawListKngProcess):
        return 'RawList'
      case (kngProcess instanceof WeightedListKngProcess):
        return 'WeightedList'
      case (kngProcess instanceof SequenceKngProcess):
        return 'Sequence'
      case (kngProcess instanceof CharGroupPatternKngProcess):
        return 'CharGroup'
      case (kngProcess instanceof MarkovKngProcess):
        return 'Markov'
      default:
        throw new Error('Unknown process to type')
    }
  }


  static jsonEncode(serialObject) {
    return JSON.stringify(serialObject)
  }

  static jsonDecode(jsonString) {
    return JSON.parse(jsonString)
  }


  static serializeProcess(kngProcess) {
    if (typeof kngProcess !== 'object' || !kngProcess.prototype instanceof KngProcess) {
      throw new Error('Invalid process to serialize')
    }
    let serialProcess = {
      'type': this.getProcessType(kngProcess),
      'parameters': kngProcess.rawParameters
    }
    switch (serialProcess.type) {
      case 'RawList':
      case 'Sequence':
      case 'Markov':
        serialProcess['dictionary'] = kngProcess.dictionary
        break
      case 'WeightedList':
        let weightRebuild = 0
        serialProcess['dictionary'] = []
        for (let cumulWeight in kngProcess.weightedList) {
          serialProcess['dictionary'].push([
            kngProcess.weightedList[cumulWeight],
            cumulWeight - weightRebuild
          ])
          weightRebuild = cumulWeight
        }
        break
      case 'CharGroup':
        serialProcess['dictionary'] = []
        for (let key in kngProcess.dictionary) {
          serialProcess['dictionary'].push([
            kngProcess.dictionary[key],
            key
          ])
        }
        break
    }
    return serialProcess
  }


  static serializeComponent(kngComponent) {
    if (typeof kngComponent !== 'object' || !kngComponent.prototype instanceof KngNameComponent) {
      throw new Error('Invalid component to serialize')
    }
    return {
      'process': kngComponent.process.key
    }
  }


  static serializeComposition(kngComposition) {
    if (typeof kngComposition !== 'object' || !kngComposition.prototype instanceof KngNameComposition) {
      throw new Error('Invalid composition to serialize')
    }
    let serialComposition = {
      'pattern': kngComposition.pattern,
      'components': {}
    }
    for (let partKey in kngComposition.components) {
      serialComposition['components'][partKey] = kngComposition.components[partKey]['key']
    }
    return serialComposition
  }


  static serializeOrigin(kngOrigin) {
    if (typeof kngOrigin !== 'object' || !kngOrigin.prototype instanceof KngOrigin) {
      throw new Error('Invalid origin to serialize')
    }
    let serialOrigin = {
      'weight': 1,
      'compositions': {}
    }
    let weightRebuild = 0
    for (let cumulWeight in kngOrigin.compositionsWeigtedList.weightedList) {
      let partKey = kngOrigin.compositionsWeigtedList.weightedList[cumulWeight]
      serialOrigin['compositions'][partKey] = {
        'composition': kngOrigin.compositions[partKey].key,
        'weight': cumulWeight - weightRebuild
      }
      weightRebuild = cumulWeight
    }
    return serialOrigin
  }


  static serializeEngine(kngEngine) {
    if (typeof kngEngine !== 'object' || !kngEngine.prototype instanceof KngEngine) {
      throw new Error('Invalid engine to serialize')
    }
    let serialEngine = {
      'processes': {},
      'components': {},
      'compositions': {},
      'origins': {}
    }
    let weightRebuild = 0
    let compositions = {}
    let components = {}
    let processes = {}
    for (let cumulWeight in kngEngine.originsWeigtedList.weightedList) {
      let originKey = kngEngine.originsWeigtedList.weightedList[cumulWeight]
      let origin = kngEngine.origins[originKey]
      serialEngine['origins'][originKey] = this.serializeOrigin(origin)
      serialEngine['origins'][originKey]['weight'] = cumulWeight - weightRebuild
      weightRebuild = cumulWeight
      //store all different composition
      for (let compositionPartKey in origin.compositions) {
        let composition = origin.compositions[compositionPartKey]
        compositions[composition.key] = composition
      }
    }
    for (let compositionKey in compositions) {
      let composition = compositions[compositionKey]
      serialEngine['compositions'][compositionKey] = this.serializeComposition(composition)
      //store all different component
      for (let componentPartKey in composition.components) {
        let component = composition.components[componentPartKey]
        components[component.key] = component
      }
    }
    for (let componentKey in components) {
      let component = components[componentKey]
      serialEngine['components'][componentKey] = this.serializeComponent(component)
      //store all different process
      processes[component.key] = component.process
    }
    for (let processKey in processes) {
      let process = processes[processKey]
      serialEngine['processes'][processKey] = this.serializeProcess(process)
    }
    return serialEngine
  }


  static parseProcess(serialProcess, key) {
    if (typeof serialProcess !== 'object') {
      throw new Error('Invalid process to parse')
    }
    if (typeof serialProcess.type !== 'string' || typeof serialProcess.dictionary !== 'object') {
      throw new Error('Invalid process to parse')
    }
    if (typeof serialProcess.parameters !== 'object') {
      serialProcess.parameters = {}
    }
    if (typeof key === 'undefined') {
      key = ''
    }
    let kngProcess = null
    // copy parameters if we need to manipulate it
    // be sure to get numbers and not strings for parameters for example
    let parametersCopy = JSON.parse(JSON.stringify(serialProcess.parameters))
    switch(serialProcess.type) {
      case 'RawList':
        kngProcess = new RawListKngProcess(key, parametersCopy)
        break
      case 'WeightedList':
        if (typeof parametersCopy.defaultWeight !== 'undefined') parametersCopy.defaultWeight = Number(parametersCopy.defaultWeight)
        kngProcess = new WeightedListKngProcess(key, parametersCopy)
        break
      case 'Sequence':
        kngProcess = new SequenceKngProcess(key, parametersCopy)
        break
      case 'CharGroup':
        kngProcess = new CharGroupPatternKngProcess(key, parametersCopy)
        break
      case 'Markov':
        if (typeof parametersCopy.order !== 'undefined') parametersCopy.order = Number(parametersCopy.order)
        if (typeof parametersCopy.minLength !== 'undefined') parametersCopy.minLength = Number(parametersCopy.minLength)
        if (typeof parametersCopy.maxLength !== 'undefined') parametersCopy.maxLength = Number(parametersCopy.maxLength)
        if (typeof parametersCopy.maxAttempts !== 'undefined') parametersCopy.maxAttempts = Number(parametersCopy.maxAttempts)
        kngProcess = new MarkovKngProcess(key, parametersCopy)
        break
      default:
        throw new Error('Unknown process to parse')
    }
    kngProcess.addListToDictionary(serialProcess.dictionary)

    return kngProcess
  }


  static parseComponent(serialComponent, key, processes) {
    let processKey = serialComponent['process']
    if (typeof processes[processKey] === 'undefined') {
      throw new Error('Process ' + processKey + ' not found (used in component ' + key + ')')
    }
    return new KngNameComponent(key, processes[processKey])
  }


  static parseComposition(serialComposition, key, components) {
    let composition = new KngNameComposition(key, serialComposition.pattern)
    for (let componentPartKey in serialComposition.components) {
      let componentKey = serialComposition.components[componentPartKey]
      if (typeof components[componentKey] === 'undefined') {
        throw new Error('Component ' + componentKey + ' not found (used in composition ' + key + ')')
      }
      composition.addNameComponent(components[componentKey], componentPartKey)
    }
    return composition
  }


  static parseOrigin(serialOrigin, key, compositions) {
    let origin = new KngOrigin(key)
    for (let compositionPartKey in serialOrigin.compositions) {
      let composition = serialOrigin.compositions[compositionPartKey]
      if (typeof compositions[composition.composition] === 'undefined') {
        throw new Error('Composition ' + composition.composition + ' not found (used in origin ' + key + ')')
      }
      origin.addNameComposition(compositions[composition.composition], compositionPartKey, Number(composition.weight))
    }
    return origin
  }


  static parseEngine(serialEngine) {
    if (typeof serialEngine !== 'object') {
      throw new Error('Invalid engine to parse')
    }
    if (
      typeof serialEngine.processes !== 'object'
      || typeof serialEngine.components !== 'object'
      || typeof serialEngine.compositions !== 'object'
      || typeof serialEngine.origins !== 'object'
    ) {
      throw new Error('Invalid engine to parse')
    }
    let engine = new KngEngine()
    let processes = {}
    let components = {}
    let compositions = {}
    for (let processKey in serialEngine.processes) {
      let process = serialEngine.processes[processKey]
      processes[processKey] = this.parseProcess(process, processKey)
    }
    for (let componentKey in serialEngine.components) {
      let component = serialEngine.components[componentKey]
      components[componentKey] = this.parseComponent(component, componentKey, processes)
    }
    for (let compositionKey in serialEngine.compositions) {
      let composition = serialEngine.compositions[compositionKey]
      compositions[compositionKey] = this.parseComposition(composition, compositionKey, components)
    }
    for (let originKey in serialEngine.origins) {
      let origin = serialEngine.origins[originKey]
      engine.addOrigin(this.parseOrigin(origin, originKey, compositions), Number(origin.weight))
    }

    return engine
  }


}
