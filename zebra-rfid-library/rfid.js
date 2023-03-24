/*
 *		---NOTES---
 *
 * tagEvent is used for multiple operations and thus should be reassigned before doing any operation
 *
 */

/**
 * @callback onEnumerateEvent
 * @param {object[]} readers - readers found
 */

/**
 * @callback onInventoryEvent
 * @param {object[]} data - data received from inventory operation
 */

/**
 * @callback onTagLocateEvent
 * @param {number} data - data returned by library, use TagLocate property to get the distance
 */

/**
 * @callback onScanSingleRfidEvent
 * @param {object} tag - tag found
 */

/**
 * @typedef {Object} statusDefinition
 * @param {string} name - name of the status to be associated with statusManager
 * @param {string} errorCode
 * @param {string} vendorMessage
 * @param {string} method
 * @param {string} internalCode - unique assigned code with which to identify associated callbacks
 */

/**
 * error definitions to properly identify errors
 * @type {statusDefinition[]}
 * @ignore
 */
const statusDefinitions = [
  {
    name: 'CONNECTION_EVENT',
    errorCode: '1000',
    vendorMessage: 'CONNECTION_EVENT',
    internalCode: 'CONNECTION_EVENT',
  },
  {
    name: 'DISCONNECTION_EVENT',
    errorCode: '1000',
    vendorMessage: 'DISCONNECTION_EVENT',
    internalCode: 'DISCONNECTION_EVENT',
  },
  {
    name: 'READER_NOT_CONNECTED',
    errorCode: '2003',
    vendorMessage: 'Reader Not Connected',
    internalCode: 'READER_NOT_CONNECTED',
  },
  {
    name: 'INVENTORY_OPERATION_FAILURE',
    errorCode: '2005',
    method: 'performInventory',
    vendorMessage: 'RFID_CHARGING_COMMAND_NOT_ALLOWED-Charging',
  },
  { name: 'LOCATE_NO_TAG', errorCode: '2004', method: 'locateTag' },
  { errorCode: '2004', method: 'connect', internalCode: 'RECONNECT' },
  { errorCode: '2000', method: 'connect', internalCode: 'READER_LIST_EMPTY' },
];

//keeps track if the library is used to avoid conflicts
let _inUse = false;

const statusManager = {
  //connects to reader
  CONNECTION_EVENT: (status) => {
    defaultProperties();
    _isConnected = true;
    console.log('initialized with status', status);
    if (_onConnectionCallback) _onConnectionCallback();
  },
  READER_NOT_CONNECTED: (status) => {
    console.log(status.vendorMessage, status);
    getReader();
  },
  RECONNECT: () => {
    disconnect();
    getReader();
  },
  //disconnects from reader
  DISCONNECTION_EVENT: (status) => {
    _isConnected = false;
    console.log('disconnected with status', status);
    if (_onDisconnectionCallback) _onDisconnectionCallback();
  },
  READER_LIST_EMPTY: (status) => {
    console.log(status.vendorMessage);
    getReader();
  },
};

let _isConnected = false;

//gets error name to be used as key in statusManager
const getError = (status) =>
  statusDefinitions
    .filter(
      (e) =>
        e.errorCode === status.errorCode &&
        (e.vendorMessage
          ? status.vendorMessage.includes(e.vendorMessage)
          : true) &&
        (e.method ? status.method === e.method : true)
    )
    .sort((a, b) => {
      if (a.vendorMessage.length > b.vendorMessage.length) return -1;
      if (a.vendorMessage.length < b.vendorMessage.length) return 1;
      return 0;
    })[0]?.internalCode;

window.statusHandler = (status) => {
  console.log('before status callback', {
    status,
    getError: getError(status),
    _onConnectionCallback,
  });
  const callback = statusManager[getError(status)];
  if (callback) callback(status);
  else if (status.errorCode != 1000)
    console.warn(
      status.vendorMessage + status.errorCode + status.vendorMessage
    );
  else console.log('non error status', status);
};

//definitions
let onTagEvent = () => {};
let onSingleScanEvent = () => {};
window.enumRfid = () => {};

const singleScanOpt = {
  stopTriggerType: "tagObservation",
  stopObservationCount: 1,
  reportUniqueTags: 1,
};

const performInventoryOpt = {
  stopTriggerType: "duration",
  stopObservationCount: 999999,
  reportUniqueTags: 1,
  reportTrigger: 1,
};

/**
 * @function
 *
 * @param {object} props - rfid object properties
 *
 * @returns {boolean} operation success/failure
 *
 *@link for the list of parameters see official zebra documentation:  https://techdocs.zebra.com/enterprise-browser/3-3/api/re2x/rfid/
 */
export const setProperties = (props) => {
  const rfid = window.rfid;
  if (rfid) {
    window.rfid = Object.assign(rfid, props);
    console.log("setProps", { props, rfid });
    return true;
  }
  console.log("setProps failed");
  return false;
};

window.scanSingleRfidHandler = (dataArray) => {
  onSingleScanEvent(dataArray.TagData.at(0));
  stop();
};

window.inventoryHandler = (dataArray) => {
  onTagEvent([...dataArray.TagData]);
};

window.tagLocateHandler = (data) => {
  if (_tagLocateCallback) _tagLocateCallback(data);
};

window.enumRfid = (data) => {
  if (_enumerateCallback) _enumerateCallback(data);
};

let hasInit = false;
let _rfidDefaults;

function init() {
  console.log("init");
  _rfidDefaults = { ...window.rfid };
  rfid.statusEvent = "statusHandler(%json)";
  getReader();
}

let _onConnectionCallback;
let _onDisconnectionCallback;
let _onConnectionFailed;
let _tagLocateCallback;
let _enumerateCallback;

/**
 * attaches the library to the current component
 * call detach when unmounting/onDestroy
 * NOTE: params are to be passed as an object
 * @param {function} success - gets called on connection event
 * @param {function} failure - gets called on connection event
 */
export const attach = ({ success, failure }) => {
  console.log("attaching", new Date().getTime());
  _onConnectionFailed = failure;
  if (_inUse) {
    console.log("in use true");
    if (_onConnectionFailed) _onConnectionFailed();
    return;
  }
  _onConnectionCallback = success;
  console.log("lib free", new Date().getTime());
  _inUse = true;
  let interCount = 0;
  //leave at the bottom
  console.log("starting attach", new Date().getTime());
  const interInit = setInterval(() => {
    const rfid = window.rfid;
    if (rfid) {
      if (hasInit) return;
      init();
      clearInterval(interInit);
    }
    interCount++;
    if (interCount > 20) {
      console.log("failed init");
      _isConnected = false;
      _onConnectionFailed();
      clearInterval(interInit);
    }
  }, 300);
};

export const isConnected = () => _isConnected;

/**
 * detaches library from component resetting callbacks & properties
 * @param {function} onDisconnection - called on disconnection event
 */
export const detach = (callback) => {
  //TODO: reset props of rfid
  _onDisconnectionCallback = callback;
  if (!hasInit) return;
  onEnumerate(null);
  onInventory(null);
  onScanSingleRfid(null);
  onSingleScanEvent(null);
  onTagEvent(null);
  onTagLocate(null);
  setProperties({ ..._rfidDefaults });
  defaultProperties();
  disconnect();
  console.log("detached");
  hasInit = false;
  _inUse = false;
};

function getReader() {
  console.log("searching for reader");
  onEnumerate((readers) => {
    rfid.readerID = readers[0][0];
  });
  rfid.enumerate();
  rfid.connect();
}

function defaultProperties() {
  console.log("before default");
  setProperties({
    beepOnRead: 1,
    transport: "serial",
    useSoftTrigger: 1,
  });
}

/**
 * Calls "onEnumerate" callback function and returns the number of rfid scanners
 * @returns {number} number of rfid scanners found
 * @function
 */
export const enumerate = () => rfid.enumerate();

/**
 * @function
 * disconnects current rfid reader
 *
 * WARNING: when no rfid reader is connected the program
 * may crash when starting an rfid operation
 */
export const disconnect = () => {
  rfid.disconnect();
};

/**
 * @function
 * @param {onEnumerateEvent} callback - function that gets called during "enumerate()" execution
 */
export const onEnumerate = (callback) => {
  _enumerateCallback = callback;
  rfid.enumRFIDEvent = "enumRfid(%s);";
};

/**
 * @param {onTagLocateEvent} callback - function called when locating a tag
 * @function
 */
export const onTagLocate = (callback) => {
  _tagLocateCallback = callback;
};

/**
 * @function
 * locates a tag with the given rfid
 */
export const locateTag = (tagId) => {
  if (!tagId) return;
  if (!_isConnected) throw new Error("connection not initialized");
  rfid.tagEvent = "tagLocateHandler(%json);";
  rfid.antennaSelected = 1;
  rfid.tagID = tagId;
  rfid.locateTag();
};

/**
 * performs inventory and triggers tagEvent
 */
export function startInventory() {
  if (!_isConnected) throw new Error("connection not initialized");
  setProperties({ ...performInventoryOpt });
  rfid.tagEvent = "inventoryHandler(%json);";
  rfid.performInventory();
}

/***
 * @function
 * stops current operation
 */
export const stop = () => rfid.stop();

/**
 * @function
 * @param {onInventoryEvent} callback - function that gets called during "startInventory()" execution
 */
export const onInventory = (callback) => {
  onTagEvent = callback;
};

/**
 * Scans a single rfid tag
 */
export const scanSingleRfid = () => {
  if (!_isConnected) throw new Error("connection not initialized");
  //setting options
  setProperties({ ...singleScanOpt });
  rfid.tagEvent = "scanSingleRfidHandler(%json);";
  rfid.performInventory();
};

/**
 * @param {onScanSingleRfidEvent} callback - function that gets called during "scanSingleRfid" operation
 * @function
 */
export const onScanSingleRfid = (callback) => {
  onSingleScanEvent = callback;
};
