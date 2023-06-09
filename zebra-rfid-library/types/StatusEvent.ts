export type StatusEvent = Partial<{
  method: string,
  errorCode: string,
  vendorMessage: string,
}>;
