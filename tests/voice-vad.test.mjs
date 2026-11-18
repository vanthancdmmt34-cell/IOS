import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeRms, createVadMonitor, createSrEndDetector, joinTranscript } from "../public/js/voice-vad.js";

describe("computeRms", () => {
  test("returns 0 for centered PCM silence and ~1 for full-scale wave", () => {
    assert.equal(computeRms(new Uint8Array(64).fill(128)), 0);
    assert.equal(computeRms(new Uint8Array(0)), 0);
    const loud = new Uint8Array(64).fill(0);
    assert.ok(computeRms(loud) > 0.99);
  });
});

describe("createVadMonitor", () => {
  test("calibrates adaptive noise floor during initial ~300ms and clamps quiet floor", () => {
    const reasons = [];
    const quietVad = createVadMonitor({
      noiseBaselineMs: 300,
      minSpeechMs: 220,
      silenceMs: 1300,
      noSpeechMs: 7000,
      onAutoStop: (r) => reasons.push(r),
    });

    for (let t = 0; t < 300; t += 50) quietVad.process(0.005, t);
    let st = quietVad.process(0.005, 300);
    assert.equal(st.calibrated, true);
    assert.equal(st.speechOn, 0.025);
    assert.equal(st.speechOff, 0.015);

    const noisyVad = createVadMonitor({ noiseBaselineMs: 300 });
    noisyVad.process(0.3, 0); // transient click during calibration
    for (let t = 50; t < 300; t += 50) noisyVad.process(0.03, t);
    st = noisyVad.process(0.045, 300);
    assert.equal(st.calibrated, true);
    assert.ok(Math.abs(st.floor - 0.03) < 1e-9);
    assert.ok(Math.abs(st.speechOn - 0.075) < 1e-9);
    assert.ok(Math.abs(st.speechOff - 0.048) < 1e-9);
    // 0.045 is below adapted speechOn (0.075), so it must not count as speech
    noisyVad.process(0.045, 600);
    assert.equal(noisyVad.getState().spoke, false);
    assert.deepEqual(reasons, []);
  });

  test("ignores transient spike shorter than minSpeechMs and triggers no-speech", () => {
    const reasons = [];
    const vad = createVadMonitor({
      noiseBaselineMs: 300,
      minSpeechMs: 220,
      silenceMs: 1300,
      noSpeechMs: 7000,
      onAutoStop: (r) => reasons.push(r),
    });

    for (let t = 0; t < 300; t += 50) vad.process(0.006, t);
    // 150ms transient spike (< 220ms)
    vad.process(0.12, 350);
    vad.process(0.12, 450);
    vad.process(0.12, 500);
    vad.process(0.006, 550);
    assert.equal(vad.getState().spoke, false);

    // Silence afterwards should NOT fire "silence", should fire "no-speech" at 7000ms
    vad.process(0.006, 2000);
    assert.deepEqual(reasons, []);
    vad.process(0.006, 7000);
    assert.deepEqual(reasons, ["no-speech"]);
  });

  test("auto-stops after speech (>=220ms) followed by 1.3s silence", () => {
    const reasons = [];
    const vad = createVadMonitor({
      noiseBaselineMs: 300,
      minSpeechMs: 220,
      silenceMs: 1300,
      noSpeechMs: 7000,
      onAutoStop: (r) => reasons.push(r),
    });

    for (let t = 0; t < 300; t += 50) vad.process(0.008, t);
    // Speech from 300ms to 700ms
    for (let t = 300; t <= 700; t += 50) vad.process(0.08, t);
    assert.equal(vad.getState().spoke, true);

    // Silence begins at 750ms
    vad.process(0.008, 750);
    vad.process(0.008, 1950); // 1200ms < 1300ms
    assert.deepEqual(reasons, []);

    vad.process(0.008, 2050); // 1300ms >= 1300ms
    assert.deepEqual(reasons, ["silence"]);

    // Subsequent ticks must not re-fire
    vad.process(0.008, 4000);
    assert.deepEqual(reasons, ["silence"]);
  });

  test("resets silence timer during mid-sentence pause", () => {
    const reasons = [];
    const vad = createVadMonitor({
      noiseBaselineMs: 300,
      minSpeechMs: 220,
      silenceMs: 1300,
      noSpeechMs: 7000,
      onAutoStop: (r) => reasons.push(r),
    });

    for (let t = 0; t < 300; t += 50) vad.process(0.008, t);
    for (let t = 300; t <= 600; t += 50) vad.process(0.09, t);
    assert.equal(vad.getState().spoke, true);

    // 900ms pause (< 1300ms)
    vad.process(0.008, 650);
    vad.process(0.008, 1550);
    assert.deepEqual(reasons, []);

    // Resume speaking -> resets silence timer
    vad.process(0.07, 1600);
    vad.process(0.07, 1800);
    vad.process(0.008, 1850);
    vad.process(0.008, 3050); // 1200ms after 1850 -> still waiting
    assert.deepEqual(reasons, []);

    vad.process(0.008, 3150); // 1300ms after 1850 -> stops
    assert.deepEqual(reasons, ["silence"]);
  });

  test("triggers no-speech timeout and supports reset() and destroy()", () => {
    const reasons = [];
    const vad = createVadMonitor({
      noiseBaselineMs: 300,
      minSpeechMs: 220,
      silenceMs: 1000,
      noSpeechMs: 7000,
      onAutoStop: (r) => reasons.push(r),
    });

    for (let t = 0; t <= 6950; t += 250) vad.process(0.005, t);
    assert.deepEqual(reasons, []);
    vad.process(0.005, 7000);
    assert.deepEqual(reasons, ["no-speech"]);

    // reset() clears stopped state
    vad.reset();
    for (let t = 0; t < 300; t += 50) vad.process(0.005, t);
    vad.process(0.08, 300);
    vad.process(0.08, 550);
    assert.equal(vad.getState().spoke, true);

    vad.destroy();
    vad.process(0.005, 600);
    vad.process(0.005, 3000);
    assert.deepEqual(reasons, ["no-speech"]);
  });
});

describe("createSrEndDetector", () => {
  test("auto-stops on interim -> final -> onspeechend", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const reasons = [];
    const det = createSrEndDetector({
      postSpeechMs: 1400,
      speechEndMs: 650,
      noSpeechMs: 7500,
      onAutoStop: (r) => reasons.push(r),
    });

    det.onStart();
    det.onSpeechStart();
    det.onResult({ transcript: "hello", isFinal: false, hasInterim: true });
    t.mock.timers.tick(300);
    det.onResult({ transcript: "hello world", isFinal: true, hasInterim: false });
    det.onSpeechEnd();

    t.mock.timers.tick(649);
    assert.deepEqual(reasons, []);
    t.mock.timers.tick(1);
    assert.deepEqual(reasons, ["speech-end"]);
    det.destroy();
  });

  test("uses shorter postSpeech delay when isFinal and no interim text remains", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const reasons = [];
    const det = createSrEndDetector({
      postSpeechMs: 1400,
      speechEndMs: 650,
      noSpeechMs: 7500,
      onAutoStop: (r) => reasons.push(r),
    });

    det.onStart();
    det.onResult({ transcript: "good morning", isFinal: true, hasInterim: false });

    t.mock.timers.tick(899);
    assert.deepEqual(reasons, []);
    t.mock.timers.tick(1);
    assert.deepEqual(reasons, ["post-speech"]);
    det.destroy();
  });

  test("cancels speechEnd/postSpeech timers on mid-sentence pause resume", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const reasons = [];
    const det = createSrEndDetector({
      postSpeechMs: 1400,
      speechEndMs: 650,
      noSpeechMs: 7500,
      onAutoStop: (r) => reasons.push(r),
    });

    det.onStart();
    det.onSpeechStart();
    det.onResult({ transcript: "I would like", isFinal: false, hasInterim: true });
    det.onSpeechEnd();

    // User pauses 400ms then continues speaking
    t.mock.timers.tick(400);
    det.onSpeechStart();
    t.mock.timers.tick(400); // Past original 650ms speechEnd -> must NOT have stopped
    assert.deepEqual(reasons, []);

    det.onResult({ transcript: "I would like a coffee", isFinal: true, hasInterim: false });
    det.onSpeechEnd();
    t.mock.timers.tick(650);
    assert.deepEqual(reasons, ["speech-end"]);
    det.destroy();
  });

  test("fires no-speech timeout if no speech arrives and respects destroy()", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const reasons = [];
    const det = createSrEndDetector({
      postSpeechMs: 1400,
      speechEndMs: 650,
      noSpeechMs: 7500,
      onAutoStop: (r) => reasons.push(r),
    });

    det.onStart();
    t.mock.timers.tick(7499);
    assert.deepEqual(reasons, []);
    t.mock.timers.tick(1);
    assert.deepEqual(reasons, ["no-speech"]);

    const reasons2 = [];
    const det2 = createSrEndDetector({
      noSpeechMs: 7500,
      onAutoStop: (r) => reasons2.push(r),
    });
    det2.onStart();
    t.mock.timers.tick(1000);
    det2.destroy();
    t.mock.timers.tick(10000);
    assert.deepEqual(reasons2, []);
  });

  test("keeps no-speech timeout armed after onSpeechStart -> onSpeechEnd with no transcript", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const reasons = [];
    const det = createSrEndDetector({
      postSpeechMs: 1400,
      speechEndMs: 650,
      noSpeechMs: 7500,
      onAutoStop: (r) => reasons.push(r),
    });

    det.onStart();
    t.mock.timers.tick(200);
    det.onSpeechStart();
    det.onResult({ transcript: "   ", isFinal: false, hasInterim: true });
    t.mock.timers.tick(300);
    det.onSpeechEnd();

    t.mock.timers.tick(6999);
    assert.deepEqual(reasons, []);
    t.mock.timers.tick(1);
    assert.deepEqual(reasons, ["no-speech"]);
    det.destroy();
  });
});

describe("joinTranscript", () => {
  test("avoids double space when fin ends with space and inter starts with space", () => {
    assert.equal(joinTranscript("hello ", " world"), "hello world");
    assert.equal(joinTranscript("hello   ", "   world"), "hello world");
  });

  test("inserts single space when neither boundary has whitespace", () => {
    assert.equal(joinTranscript("hello", "world"), "hello world");
    assert.equal(joinTranscript("hello ", "world"), "hello world");
    assert.equal(joinTranscript("hello", " world"), "hello world");
  });

  test("handles empty or whitespace-only inputs cleanly", () => {
    assert.equal(joinTranscript("", ""), "");
    assert.equal(joinTranscript("   ", "   "), "");
    assert.equal(joinTranscript(" hello ", ""), "hello");
    assert.equal(joinTranscript("", " world "), "world");
  });

  test("reduces multi-segment final/interim transcripts without double or missing spaces", () => {
    const reduceSegments = (segs) => segs.reduce((acc, s) => joinTranscript(acc, s), "");
    assert.equal(reduceSegments(["hello ", " world"]), "hello world");
    assert.equal(reduceSegments(["I want", "coffee"]), "I want coffee");
    assert.equal(reduceSegments(["I", "would like ", " a cup", "of tea"]), "I would like a cup of tea");
    assert.equal(joinTranscript(reduceSegments(["Good", "morning"]), reduceSegments(["everyone ", " today"])), "Good morning everyone today");
  });
});
