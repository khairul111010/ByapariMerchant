import { fitWithin } from '../src/media/fit';

describe('fitWithin', () => {
  it('scales a landscape photo so the long edge is 1600', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
  });
  it('scales a portrait photo', () => {
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });
  it('never upscales', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(1600, 1000)).toEqual({ width: 1600, height: 1000 });
  });
  it('keeps at least 1px on extreme ratios', () => {
    expect(fitWithin(16000, 1)).toEqual({ width: 1600, height: 1 });
  });
  it('passes through bad sizes unchanged', () => {
    expect(fitWithin(0, 0)).toEqual({ width: 0, height: 0 });
  });
});
