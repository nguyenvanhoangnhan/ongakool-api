export function GetUnixNow() {
  return Math.floor(Date.now() / 1000);
}

export function MessageResponse(message: string) {
  return { message };
}
export function SuccessMessageResp(message: string = 'Success') {
  return MessageResponse(message);
}
