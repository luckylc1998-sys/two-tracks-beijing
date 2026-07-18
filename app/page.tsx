export const metadata = {
  title: "两条轨道 · 北京篇",
  description: "猪头与 Hedy 的像素回忆游戏",
};

export default function Home() {
  return (
    <main className="game-frame-shell">
      <iframe
        className="game-frame"
        src="/game/index.html"
        title="两条轨道 · 北京篇"
        allow="autoplay; fullscreen"
      />
    </main>
  );
}
