//@flow strict

/**
 * @typedef {Object} statusDefinition
 * @param {string} name - name of the status to be associated with statusManager
 * @param {string} errorCode
 * @param {string} vendorMessage
 * @param {string} method
 * @param {string} internalCode - unique assigned code with which to identify associated callbacks
 */
export type StatusDefinition = {
  name?: string,
  errorCode: string,
  vendorMessage?: string,
  method?: string,
  internalCode?: string,
};


