// Kiểm thử Trung tâm TOEIC: ngân hàng câu hỏi, quy đổi điểm ước tính, và API yêu cầu đăng nhập.
// Chạy: npm test
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from './helpers/test-server.mjs';
import { PARTS, LESSONS, QUESTIONS, PASSAGES, MOCK_TESTS, estimateScore, questionsOfPart } from '../modules/toeic-bank.js';

describe('TOEIC: ngân hàng nội dung', () => {
  it('có đủ 7 Part, mỗi Part có bài học và số câu đúng như khai báo', () => {
    assert.equal(PARTS.length, 7);
    for (const p of PARTS) {
      assert.equal(questionsOfPart(p.n).length, p.count, `Part ${p.n} phải có ${p.count} câu`);
      assert.ok(LESSONS.find((l) => l.part === p.n), `Part ${p.n} phải có bài học`);
    }
  });

  it('đề thi thử dùng đúng 100 câu: 51 câu nghe và 49 câu đọc', () => {
    const listening = QUESTIONS.filter((q) => q.part <= 4).length;
    const reading = QUESTIONS.filter((q) => q.part >= 5).length;
    assert.equal(QUESTIONS.length, 100);
    assert.equal(listening, 51);
    assert.equal(reading, 49);
    assert.equal(MOCK_TESTS[0].minutes, 75);
  });

  it('mỗi câu có 3–4 phương án, đáp án đúng nằm trong phạm vi và có giải thích', () => {
    for (const q of QUESTIONS) {
      assert.ok(q.options.length >= 3 && q.options.length <= 4, `${q.id}: số phương án`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${q.id}: đáp án`);
      assert.ok(q.explain && q.explain.length > 10, `${q.id}: thiếu giải thích`);
    }
  });

  it('mã câu không trùng và đoạn văn/hội thoại được tham chiếu đều tồn tại', () => {
    const ids = QUESTIONS.map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const q of QUESTIONS) if (q.passage) assert.ok(PASSAGES[q.passage], `${q.id}: thiếu đoạn ${q.passage}`);
  });

  it('câu Part 6 có chỗ trống [n] đúng trong đoạn văn', () => {
    for (const q of QUESTIONS.filter((x) => x.part === 6)) {
      assert.ok(PASSAGES[q.passage].text.includes(`[${q.blank}]`), `${q.id}: thiếu [${q.blank}]`);
    }
  });

  it('đáp án đã được xáo đều, không tập trung vào một chữ cái', () => {
    const counts = {};
    for (const q of QUESTIONS) counts[q.answer] = (counts[q.answer] || 0) + 1;
    for (const k of Object.keys(counts)) assert.ok(counts[k] / QUESTIONS.length < 0.4, `đáp án ${k} chiếm quá nhiều`);
  });
});

describe('TOEIC: quy đổi điểm ước tính', () => {
  it('điểm tối đa là 990 và điểm 0 là 0', () => {
    assert.deepEqual(estimateScore(51, 49), { listening: 495, reading: 495, total: 990 });
    assert.equal(estimateScore(0, 0).total, 0);
  });

  it('điểm tăng khi số câu đúng tăng', () => {
    assert.ok(estimateScore(30, 20).total < estimateScore(40, 20).total);
    assert.ok(estimateScore(30, 20).total < estimateScore(30, 30).total);
  });
});

describe('TOEIC: API', () => {
  let srv;
  before(async () => { srv = await getTestServer(); });
  after(async () => { if (srv && srv.close) await srv.close(); });

  it('yêu cầu đăng nhập cho mọi API', async () => {
    const res = await srv.fetch('/api/toeic/overview');
    assert.equal(res.status, 401);
  });

  it('bài học và luyện tập không lộ đáp án khi chưa nộp bài', async () => {
    const res = await srv.fetch('/api/toeic/drill/1');
    assert.equal(res.status, 401);
  });
});
