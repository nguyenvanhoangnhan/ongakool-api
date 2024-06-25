import * as ffmpeg from 'fluent-ffmpeg';

export function GetUnixNow() {
  return Math.floor(Date.now() / 1000);
}

export function MessageResponse(message: string) {
  return { message };
}
export function SuccessMessageResp(message: string = 'Success') {
  return MessageResponse(message);
}

export function getDurationFromURL(url: string) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(url, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration);
    });
  });
}
