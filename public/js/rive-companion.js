/* Thỏ Rive (Interactive Bunny của raivu, CC BY 4.0): nạp runtime @rive-app/canvas từ jsDelivr.
   File thỏ nằm ở public/rive/bunny.riv. Thỏ có animation Idle, Wave và input Click (trigger), Pose (số).
   Không có miệng nói nên chỉ dùng cho trạng thái chào và vẫy tay. Nếu runtime hoặc file lỗi thì giữ bản SVG.
   Runtime MIT. Phiên bản 2.49.0 phát hành 29/10/2026 (đã chọn bản đủ 2 tuần tuổi, không dùng bản mới nhất). */

const RIVE_VERSION = "2.49.0";
const RUNTIME_URL = `https://cdn.jsdelivr.net/npm/@rive-app/canvas@${RIVE_VERSION}/+esm`;
const RIVE_SRC = "/rive/bunny.riv";
const STATE_MACHINE = "State Machine 1";

let runtimePromise = null;
function loadRuntime() {
  if (!runtimePromise) runtimePromise = import(/* @vite-ignore */ RUNTIME_URL);
  return runtimePromise;
}

/* Gắn thỏ Rive vào một <canvas>. Lỗi thì thay bằng fallbackHtml (bản SVG). Trả về instance Rive hoặc null. */
export async function mountRiveBunny(canvas, fallbackHtml = "") {
  if (!canvas) return null;
  try {
    const mod = await loadRuntime();
    // Bản +esm của jsDelivr đặt lớp Rive trong default; bản khác thì ở named export
    const Rive = mod.Rive || (mod.default && mod.default.Rive);
    if (!Rive) throw new Error("Không tìm thấy lớp Rive trong runtime");
    const rive = new Rive({
      src: RIVE_SRC,
      canvas,
      autoplay: true,
      stateMachine: STATE_MACHINE,
      onLoadError: () => { if (fallbackHtml) canvas.outerHTML = fallbackHtml; },
    });
    // Bấm thỏ: kích hoạt input Click (đổi tư thế / vẫy tay)
    canvas.addEventListener("click", () => {
      const inputs = (rive.stateMachineInputs && rive.stateMachineInputs(STATE_MACHINE)) || [];
      const click = inputs.find((i) => i.name === "Click");
      if (click) click.fire();
    });
    return rive;
  } catch (e) {
    if (fallbackHtml) canvas.outerHTML = fallbackHtml;
    return null;
  }
}
