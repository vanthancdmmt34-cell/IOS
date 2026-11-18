/* Pure VAD & SpeechRecognition end-of-utterance helpers (zero DOM dependency). */

export function joinTranscript(fin, inter) {
  const left = String(fin || "").trimEnd();
  const right = String(inter || "").trimStart();
  return (left && right ? `${left} ${right}` : (left || right)).trim();
}

export function computeRms(bytes) {
  if (!bytes || !bytes.length) return 0;
  let sum = 0;
  for (let i = 0; i < bytes.length; i++) {
    const x = (bytes[i] - 128) / 128;
    sum += x * x;
  }
  return Math.sqrt(sum / bytes.length);
}

export function createVadMonitor({
  noiseBaselineMs = 300,
  minSpeechMs = 220,
  silenceMs = 1300,
  noSpeechMs = 7000,
  onAutoStop,
} = {}) {
  let startTs = null;
  let calSamples = [];
  let calibrated = noiseBaselineMs <= 0;
  let floor = 0;
  let speechOn = 0.025;
  let speechOff = 0.015;
  let spoke = false;
  let stopped = false;
  let destroyed = false;
  let speechSince = null;
  let silenceSince = null;

  function updateThresholds(samples) {
    if (!samples.length) {
      floor = 0;
      speechOn = 0.025;
      speechOff = 0.015;
      return;
    }
    const sorted = samples.slice().sort((a, b) => a - b);
    floor = sorted[Math.floor((sorted.length - 1) / 2)];
    speechOn = Math.max(0.025, floor * 2.5);
    speechOff = Math.max(0.015, floor * 1.6);
  }

  function state() {
    return { floor, speechOn, speechOff, spoke, stopped, destroyed, calibrated };
  }

  function process(rms, ts = Date.now()) {
    if (destroyed || stopped) return state();
    const level = Number.isFinite(rms) && rms > 0 ? rms : 0;
    if (startTs === null) startTs = ts;
    const elapsed = Math.max(0, ts - startTs);

    if (!calibrated) {
      if (elapsed < noiseBaselineMs) {
        calSamples.push(level);
        updateThresholds(calSamples);
        if (noSpeechMs > 0 && elapsed >= noSpeechMs) {
          stopped = true;
          if (onAutoStop) onAutoStop("no-speech");
        }
        return state();
      }
      updateThresholds(calSamples);
      calibrated = true;
    }

    if (!spoke) {
      if (level >= speechOn) {
        if (speechSince === null) speechSince = ts;
        if (ts - speechSince >= minSpeechMs) {
          spoke = true;
          silenceSince = null;
        }
      } else {
        speechSince = null;
      }
      if (!spoke && noSpeechMs > 0 && elapsed >= noSpeechMs) {
        stopped = true;
        if (onAutoStop) onAutoStop("no-speech");
        return state();
      }
    } else if (level < speechOff) {
      if (silenceSince === null) silenceSince = ts;
      if (silenceMs > 0 && ts - silenceSince >= silenceMs) {
        stopped = true;
        if (onAutoStop) onAutoStop("silence");
        return state();
      }
    } else {
      silenceSince = null;
    }

    return state();
  }

  function reset() {
    if (destroyed) return;
    startTs = null;
    calSamples = [];
    calibrated = noiseBaselineMs <= 0;
    floor = 0;
    speechOn = 0.025;
    speechOff = 0.015;
    spoke = false;
    stopped = false;
    speechSince = null;
    silenceSince = null;
  }

  function destroy() {
    destroyed = true;
    calSamples = [];
  }

  return { process, tick: process, reset, destroy, getState: state };
}

export function createSrEndDetector({
  postSpeechMs = 1400,
  finalPostSpeechMs,
  speechEndMs = 650,
  noSpeechMs = 7500,
  onAutoStop,
} = {}) {
  const finalMs = Number.isFinite(finalPostSpeechMs)
    ? finalPostSpeechMs
    : (postSpeechMs >= 1200 ? 900 : Math.round(postSpeechMs * 0.65));

  let noSpeechTimer = null;
  let postSpeechTimer = null;
  let speechEndTimer = null;
  let hasSpeech = false;
  let hasTranscript = false;
  let triggered = false;
  let destroyed = false;

  function clearAll() {
    if (noSpeechTimer) { clearTimeout(noSpeechTimer); noSpeechTimer = null; }
    if (postSpeechTimer) { clearTimeout(postSpeechTimer); postSpeechTimer = null; }
    if (speechEndTimer) { clearTimeout(speechEndTimer); speechEndTimer = null; }
  }

  function clearStopTimers() {
    if (postSpeechTimer) { clearTimeout(postSpeechTimer); postSpeechTimer = null; }
    if (speechEndTimer) { clearTimeout(speechEndTimer); speechEndTimer = null; }
  }

  function trigger(reason) {
    if (destroyed || triggered) return;
    triggered = true;
    clearAll();
    if (onAutoStop) onAutoStop(reason);
  }

  function onStart() {
    if (destroyed || triggered || hasTranscript || noSpeechTimer) return;
    if (noSpeechMs > 0) {
      noSpeechTimer = setTimeout(() => trigger("no-speech"), noSpeechMs);
    }
  }

  function onSpeechStart() {
    if (destroyed || triggered) return;
    hasSpeech = true;
    clearStopTimers();
  }

  function onResult(input, isFinalArg = false) {
    if (destroyed || triggered) return;
    const opts = typeof input === "string"
      ? { transcript: input, isFinal: isFinalArg, hasInterim: !isFinalArg }
      : (input || {});
    const text = String(opts.transcript || "").trim();
    if (!text) return;

    hasSpeech = true;
    hasTranscript = true;
    if (noSpeechTimer) { clearTimeout(noSpeechTimer); noSpeechTimer = null; }
    clearStopTimers();

    const delay = opts.isFinal && !opts.hasInterim ? finalMs : postSpeechMs;
    if (delay > 0) {
      postSpeechTimer = setTimeout(() => trigger("post-speech"), delay);
    }
  }

  function onSpeechEnd() {
    if (destroyed || triggered || !hasTranscript) return;
    if (speechEndTimer) { clearTimeout(speechEndTimer); speechEndTimer = null; }
    if (speechEndMs > 0) {
      speechEndTimer = setTimeout(() => trigger("speech-end"), speechEndMs);
    }
  }

  function destroy() {
    destroyed = true;
    clearAll();
  }

  return { onStart, onSpeechStart, onResult, onSpeechEnd, destroy };
}
