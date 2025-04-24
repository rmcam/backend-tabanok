export function calculateLevel(points: number): number {
  if (points < 50) {
    return 1;
  } else if (points < 100) {
    return 2;
  } else if (points < 150) {
    return 3;
  } else if (points < 200) {
    return 4;
  } else if (points < 250) {
    return 5;
  } else if (points < 300) {
    return 6;
  } else if (points < 400) {
    return 7;
  } else if (points < 500) {
    return 8;
  } else if (points < 600) {
    return 9;
  } else if (points < 700) {
    return 10;
  } else if (points < 800) {
    return 11;
  } else if (points < 900) {
    return 12;
  } else if (points < 1000) {
    return 13;
  } else if (points < 1100) {
    return 14;
  } else if (points < 1200) {
    return 15;
  } else {
    return 16;
  }
}
