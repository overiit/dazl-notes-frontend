import { stringToIntHash } from "./string";

// 25 soft colors that are easy on the eyes
export const colors = [
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAE1FF",
  "#D0BAFF",
  "#FFBAF2",
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAE1FF",
  "#D0BAFF",
  "#FFBAF2",
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAE1FF",
  "#D0BAFF",
  "#FFBAF2",
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9"
]



export function getColor(id: string) {
  const int = stringToIntHash(id);
  const color = colors[int % colors.length];
  return color;
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function getLuminance(hex: string) {
  const rgb = hexToRgb(hex);
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

export function getHexDarkerColor(color1: string, color2: string) {
  const color1Luminance = getLuminance(color1);
  const color2Luminance = getLuminance(color2);
  if (color1Luminance < color2Luminance) {
    return color1;
  }
  return color2;
}