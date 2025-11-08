// TextEncoder polyfill for MSW in Jest environment
class TextEncoder {
  encode(input: string): Uint8Array {
    const utf8 = [];
    for (let i = 0; i < input.length; i++) {
      let charcode = input.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6));
        utf8.push(0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12));
        utf8.push(0x80 | ((charcode >> 6) & 0x3f));
        utf8.push(0x80 | (charcode & 0x3f));
      } else {
        i++;
        charcode =
          0x10000 +
          (((charcode & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
        utf8.push(0xf0 | (charcode >> 18));
        utf8.push(0x80 | ((charcode >> 12) & 0x3f));
        utf8.push(0x80 | ((charcode >> 6) & 0x3f));
        utf8.push(0x80 | (charcode & 0x3f));
      }
    }
    return new Uint8Array(utf8);
  }
}

class TextDecoder {
  decode(input: Uint8Array): string {
    let output = '';
    let i = 0;
    while (i < input.length) {
      let byte1 = input[i++];
      if (byte1 < 0x80) {
        output += String.fromCharCode(byte1);
      } else if (byte1 >= 0xc0 && byte1 < 0xe0) {
        const byte2 = input[i++];
        output += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
      } else if (byte1 >= 0xe0 && byte1 < 0xf0) {
        const byte2 = input[i++];
        const byte3 = input[i++];
        output += String.fromCharCode(
          ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
        );
      } else {
        const byte2 = input[i++];
        const byte3 = input[i++];
        const byte4 = input[i++];
        const codePoint =
          ((byte1 & 0x07) << 18) |
          ((byte2 & 0x3f) << 12) |
          ((byte3 & 0x3f) << 6) |
          (byte4 & 0x3f);
        output += String.fromCodePoint(codePoint);
      }
    }
    return output;
  }
}

export { TextEncoder, TextDecoder };
