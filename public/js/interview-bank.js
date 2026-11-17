// Phỏng vấn thử: câu hỏi và đáp án mẫu có sẵn, không cần AI.
// Ngoại ngữ hỏi bằng ngôn ngữ đó, kèm nghĩa tiếng Việt.

import {  } from "./core.js";
import { INTERVIEW_TRACKS_MORE } from "./interview-bank-more.js";

const Q = (q, model, extra = {}) => ({ q, model, qVi: extra.qVi || "", modelVi: extra.modelVi || "", hint: extra.hint || "" });

export const INTERVIEW_LANGS = [
  { id: "en", group: "lang", name: "Tiếng Anh", flag: "🇬🇧", color: "#0EA5E9", course: "/app/ngoai-ngu/luyen-noi/en?muc=hoi-thoai" },
  { id: "zh", group: "lang", name: "Tiếng Trung", flag: "🇨🇳", color: "#DC2626", course: "/app/ngoai-ngu/luyen-noi/zh?muc=hoi-thoai" },
  { id: "ja", group: "lang", name: "Tiếng Nhật", flag: "🇯🇵", color: "#BE185D", course: "/app/ngoai-ngu/luyen-noi/ja?muc=hoi-thoai" },
  { id: "ko", group: "lang", name: "Tiếng Hàn", flag: "🇰🇷", color: "#7C3AED", course: "/app/ngoai-ngu/luyen-noi/ko?muc=hoi-thoai" },
  { id: "fr", group: "lang", name: "Tiếng Pháp", flag: "🇫🇷", color: "#2563EB", course: "/app/ngoai-ngu/luyen-noi/fr?muc=hoi-thoai" },
  { id: "es", group: "lang", name: "Tiếng Tây Ban Nha", flag: "🇪🇸", color: "#EA580C", course: "/app/ngoai-ngu/luyen-noi/es?muc=hoi-thoai" },
];

export const INTERVIEW_TRACKS = {
  en: [
    { id: "xin-viec", title: "Phỏng vấn xin việc", desc: "Sáu câu hay gặp. Trả lời bằng tiếng Anh, rồi đối chiếu câu mẫu.", questions: [
      Q("Could you tell me a little about yourself?", "I am a student, and I am learning drawing and English. I like solving small problems and working with other people.", { qVi: "Bạn hãy giới thiệu đôi chút về bản thân.", modelVi: "Tôi là học sinh, đang học vẽ và tiếng Anh. Tôi thích giải những bài nhỏ và làm việc với người khác.", hint: "Tên, việc đang học, một điểm mạnh." }),
      Q("Why do you want this job?", "I want this job because I can learn real skills and help the team. The work matches what I am studying.", { qVi: "Vì sao bạn muốn công việc này?", modelVi: "Tôi muốn việc này vì tôi học được kỹ năng thật và giúp được nhóm. Công việc khớp với thứ tôi đang học.", hint: "Nói việc này hợp điều bạn đang học." }),
      Q("What is one strength of yours?", "I am careful. I check my work again before I send it, so I make fewer mistakes.", { qVi: "Một điểm mạnh của bạn là gì?", modelVi: "Tôi cẩn thận. Tôi kiểm tra lại bài trước khi gửi, nên ít sai hơn.", hint: "Một tính cách + một ví dụ rất ngắn." }),
      Q("What is something you want to improve?", "I sometimes speak too fast when I am nervous. I am practicing short, clear answers.", { qVi: "Điều bạn muốn cải thiện là gì?", modelVi: "Khi hồi hộp tôi đôi khi nói quá nhanh. Tôi đang luyện câu trả lời ngắn và rõ.", hint: "Một điểm thật, kèm cách bạn đang sửa." }),
      Q("Tell me about a difficult task you finished.", "Last month I had a hard exercise. I read the example, tested small cases, and asked for a hint. Then I finished it.", { qVi: "Kể một việc khó bạn đã làm xong.", modelVi: "Tháng trước tôi gặp một bài khó. Tôi đọc ví dụ, thử trường hợp nhỏ, và xin một gợi ý. Sau đó tôi làm xong.", hint: "Việc gì, bạn đã làm gì, kết quả." }),
      Q("Do you have any questions for me?", "Yes. What does a normal day look like for this role, and what should I learn in the first month?", { qVi: "Bạn có câu hỏi nào cho tôi không?", modelVi: "Có. Một ngày làm việc bình thường của vị trí này trông thế nào, và tháng đầu tôi nên học gì?", hint: "Hỏi về công việc, đừng hỏi lương ở câu đầu." }),
    ] },
  ],
  zh: [
    { id: "xin-viec", title: "Phỏng vấn xin việc", desc: "Sáu câu tiếng Trung mức sơ cấp. Trả lời bằng tiếng Trung.", questions: [
      Q("请你介绍一下你自己。", "我是学生。我在学画画和中文。我喜欢和别人一起学习。", { qVi: "Hãy giới thiệu về bạn.", modelVi: "Tôi là học sinh. Tôi đang học vẽ và tiếng Trung. Tôi thích học cùng người khác.", hint: "我是… 我在学…" }),
      Q("你为什么想做这份工作？", "因为我想学习真正的技能，也可以帮助团队。", { qVi: "Vì sao bạn muốn làm công việc này?", modelVi: "Vì tôi muốn học kỹ năng thật, và cũng có thể giúp nhóm.", hint: "因为…" }),
      Q("你有什么优点？", "我比较细心。我交作业以前会再检查一次。", { qVi: "Bạn có ưu điểm gì?", modelVi: "Tôi khá cẩn thận. Trước khi nộp bài tôi kiểm tra lại một lần.", hint: "我比较… " }),
      Q("你想改进什么？", "我一紧张就说得太快。我正在练习说短句子。", { qVi: "Bạn muốn cải thiện điều gì?", modelVi: "Khi hồi hộp tôi nói quá nhanh. Tôi đang luyện nói câu ngắn.", hint: "我正在练习…" }),
      Q("说一件你完成的难事。", "上个月我有一道很难的题。我先看例子，再问了一个提示，最后做完了。", { qVi: "Kể một việc khó bạn đã làm xong.", modelVi: "Tháng trước tôi có một bài rất khó. Tôi xem ví dụ trước, rồi hỏi một gợi ý, cuối cùng làm xong.", hint: "先… 再… 最后…" }),
      Q("你有什么问题要问我吗？", "有。这份工作平常做些什么？第一个月我应该学什么？", { qVi: "Bạn có câu hỏi nào cho tôi không?", modelVi: "Có. Công việc này bình thường làm những gì? Tháng đầu tôi nên học gì?", hint: "Hỏi về việc, chưa hỏi lương." }),
    ] },
  ],
  ja: [
    { id: "xin-viec", title: "Phỏng vấn xin việc", desc: "Sáu câu tiếng Nhật mức sơ cấp. Trả lời bằng tiếng Nhật.", questions: [
      Q("簡単に自己紹介をしてください。", "学生です。絵と日本語を勉強しています。人と一緒に学ぶのが好きです。", { qVi: "Hãy tự giới thiệu ngắn gọn.", modelVi: "Tôi là học sinh. Tôi đang học vẽ và tiếng Nhật. Tôi thích học cùng người khác.", hint: "〜です。〜を勉強しています。" }),
      Q("なぜこの仕事を希望しますか。", "本当のスキルを学びたいです。チームの役にも立ちたいです。", { qVi: "Vì sao bạn muốn công việc này?", modelVi: "Tôi muốn học kỹ năng thật. Tôi cũng muốn giúp được nhóm.", hint: "〜たいです。" }),
      Q("あなたの長所は何ですか。", "注意深いです。出す前にもう一度確認します。", { qVi: "Điểm mạnh của bạn là gì?", modelVi: "Tôi cẩn thận. Trước khi nộp tôi kiểm tra lại một lần nữa.", hint: "一つの長所と短い例。" }),
      Q("直したいところは何ですか。", "緊張すると話すのが速くなります。短い文で話す練習をしています。", { qVi: "Chỗ bạn muốn sửa là gì?", modelVi: "Khi hồi hộp tôi nói nhanh. Tôi đang luyện nói bằng câu ngắn.", hint: "練習をしています。" }),
      Q("難しかったことを一つ教えてください。", "先月、難しい問題がありました。例を見て、ヒントをもらって、最後にできました。", { qVi: "Kể một việc khó.", modelVi: "Tháng trước có một bài khó. Tôi xem ví dụ, nhận một gợi ý, và cuối cùng làm được.", hint: "〜て、〜て、最後に。" }),
      Q("何か質問はありますか。", "はい。この仕事は普通どんなことをしますか。最初の月に何を勉強すればいいですか。", { qVi: "Bạn có câu hỏi nào không?", modelVi: "Có. Công việc này bình thường làm những gì? Tháng đầu nên học gì?", hint: "仕事の内容を聞く。" }),
    ] },
  ],
  ko: [
    { id: "xin-viec", title: "Phỏng vấn xin việc", desc: "Sáu câu tiếng Hàn mức sơ cấp. Trả lời bằng tiếng Hàn.", questions: [
      Q("간단하게 자기소개를 해 주세요.", "저는 학생이에요. 그림과 한국어를 공부하고 있어요. 다른 사람과 같이 배우는 것을 좋아해요.", { qVi: "Hãy tự giới thiệu ngắn gọn.", modelVi: "Tôi là học sinh. Tôi đang học vẽ và tiếng Hàn. Tôi thích học cùng người khác.", hint: "저는 …이에요/예요." }),
      Q("이 일을 하고 싶은 이유가 뭐예요?", "진짜 기술을 배우고 싶어요. 팀에도 도움이 되고 싶어요.", { qVi: "Vì sao bạn muốn làm việc này?", modelVi: "Tôi muốn học kỹ năng thật. Tôi cũng muốn giúp được nhóm.", hint: "…고 싶어요." }),
      Q("장점이 뭐예요?", "저는 꼼꼼해요. 내기 전에 한 번 더 확인해요.", { qVi: "Điểm mạnh của bạn là gì?", modelVi: "Tôi cẩn thận. Trước khi nộp tôi kiểm tra thêm một lần.", hint: "장점 하나와 짧은 예." }),
      Q("고치고 싶은 점이 있어요?", "긴장하면 말을 너무 빨리 해요. 짧은 문장으로 말하는 연습을 하고 있어요.", { qVi: "Có điểm nào bạn muốn sửa không?", modelVi: "Khi hồi hộp tôi nói quá nhanh. Tôi đang luyện nói bằng câu ngắn.", hint: "연습을 하고 있어요." }),
      Q("어려웠지만 끝낸 일을 말해 주세요.", "지난달에 어려운 문제가 있었어요. 예문을 보고 힌트를 받은 다음에 끝냈어요.", { qVi: "Kể một việc khó nhưng bạn đã làm xong.", modelVi: "Tháng trước có một bài khó. Tôi xem ví dụ, nhận gợi ý, rồi làm xong.", hint: "…ㄴ/은 다음에." }),
      Q("질문 있어요?", "네. 이 일은 보통 무엇을 해요? 첫 달에 무엇을 공부하면 좋아요?", { qVi: "Bạn có câu hỏi không?", modelVi: "Có. Việc này bình thường làm gì? Tháng đầu nên học gì?", hint: "일 내용을 묻기." }),
    ] },
  ],
  fr: [
    { id: "xin-viec", title: "Phỏng vấn xin việc", desc: "Sáu câu tiếng Pháp mức sơ cấp. Trả lời bằng tiếng Pháp.", questions: [
      Q("Pouvez-vous vous présenter en quelques mots ?", "Je suis étudiant. J'apprends le dessin et le français. J'aime apprendre avec les autres.", { qVi: "Bạn có thể tự giới thiệu ngắn gọn không?", modelVi: "Tôi là học sinh. Tôi đang học vẽ và tiếng Pháp. Tôi thích học cùng người khác.", hint: "Je suis… J'apprends…" }),
      Q("Pourquoi voulez-vous ce travail ?", "Je veux apprendre de vraies compétences et aider l'équipe.", { qVi: "Vì sao bạn muốn công việc này?", modelVi: "Tôi muốn học kỹ năng thật và giúp nhóm.", hint: "Je veux…" }),
      Q("Quel est votre point fort ?", "Je suis attentif. Je vérifie mon travail avant de l'envoyer.", { qVi: "Điểm mạnh của bạn là gì?", modelVi: "Tôi cẩn thận. Tôi kiểm tra bài trước khi gửi.", hint: "Un trait + un exemple." }),
      Q("Qu'est-ce que vous voulez améliorer ?", "Quand je suis stressé, je parle trop vite. Je m'entraîne à faire des phrases courtes.", { qVi: "Bạn muốn cải thiện điều gì?", modelVi: "Khi căng thẳng tôi nói quá nhanh. Tôi đang luyện câu ngắn.", hint: "Je m'entraîne à…" }),
      Q("Parlez d'une tâche difficile que vous avez finie.", "Le mois dernier, j'avais un exercice difficile. J'ai lu l'exemple, j'ai demandé un indice, puis j'ai fini.", { qVi: "Kể một việc khó bạn đã làm xong.", modelVi: "Tháng trước tôi có một bài khó. Tôi đọc ví dụ, xin một gợi ý, rồi làm xong.", hint: "J'ai… puis j'ai…" }),
      Q("Avez-vous des questions ?", "Oui. À quoi ressemble une journée normale, et que dois-je apprendre le premier mois ?", { qVi: "Bạn có câu hỏi nào không?", modelVi: "Có. Một ngày bình thường trông thế nào, và tháng đầu tôi phải học gì?", hint: "Hỏi việc làm, chưa hỏi lương." }),
    ] },
  ],
  es: [
    { id: "xin-viec", title: "Phỏng vấn xin việc", desc: "Sáu câu tiếng Tây Ban Nha mức sơ cấp. Trả lời bằng tiếng Tây Ban Nha.", questions: [
      Q("¿Puede presentarse brevemente?", "Soy estudiante y estoy aprendiendo dibujo y español. Me gusta resolver problemas y trabajar en equipo.", { qVi: "Bạn có thể tự giới thiệu ngắn gọn không?", modelVi: "Tôi là sinh viên, đang học vẽ và tiếng Tây Ban Nha. Tôi thích giải quyết vấn đề và làm việc nhóm.", hint: "Soy… Estoy aprendiendo…" }),
      Q("¿Por qué quiere este trabajo?", "Quiero aprender habilidades reales y aportar valor al equipo.", { qVi: "Vì sao bạn muốn công việc này?", modelVi: "Tôi muốn học kỹ năng thật và đóng góp giá trị cho nhóm.", hint: "Quiero…" }),
      Q("¿Cuál es su principal fortaleza?", "Soy una persona cuidadosa. Siempre reviso mi trabajo antes de entregarlo.", { qVi: "Điểm mạnh chính của bạn là gì?", modelVi: "Tôi là người cẩn thận. Tôi luôn kiểm tra lại bài trước khi nộp.", hint: "Một tính cách + ví dụ ngắn." }),
      Q("¿Qué aspecto le gustaría mejorar?", "Cuando me pongo nervioso hablo demasiado rápido. Estoy practicando dar respuestas más cortas y claras.", { qVi: "Bạn muốn cải thiện điểm nào?", modelVi: "Khi hồi hộp tôi nói quá nhanh. Tôi đang luyện trả lời ngắn và rõ hơn.", hint: "Estoy practicando…" }),
      Q("Cuénteme una tarea difícil que logró terminar.", "El mes pasado tuve un ejercicio complejo. Leí el ejemplo, pedí una pista y logré terminarlo.", { qVi: "Hãy kể một việc khó bạn đã hoàn thành.", modelVi: "Tháng trước tôi có một bài phức tạp. Tôi đọc ví dụ, xin một gợi ý và hoàn thành được.", hint: "Leí… pedí… logré…" }),
      Q("¿Tiene alguna pregunta para mí?", "Sí. ¿Cómo es un día normal en este puesto y qué debería aprender en el primer mes?", { qVi: "Bạn có câu hỏi nào cho tôi không?", modelVi: "Có ạ. Một ngày bình thường ở vị trí này thế nào và tháng đầu tôi nên học gì?", hint: "Hỏi công việc, chưa hỏi lương." }),
    ] },
  ],
};

// Gộp bộ câu bổ sung (interview-bank-more.js) vào từng môn.
for (const [langId, tracks] of Object.entries(INTERVIEW_TRACKS_MORE)) {
  INTERVIEW_TRACKS[langId] = [...(INTERVIEW_TRACKS[langId] || []), ...tracks];
}

export function interviewLang(id) {
  return INTERVIEW_LANGS.find((x) => x.id === id) || null;
}
export function interviewTrack(langId, trackId) {
  const tracks = INTERVIEW_TRACKS[langId] || [];
  return tracks.find((t) => t.id === trackId) || null;
}
