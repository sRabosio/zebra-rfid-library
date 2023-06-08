//@flow strict

export type StatusEvent = Partial<{
  method: string,
  errorCode: number,
  vendorMessage: string,
}>;
