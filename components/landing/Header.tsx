import Image from "next/image";

export function Header() {
  return (
    <header className="border-b border-black/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Image
          src="/brand.png"
          alt="SoWhat?"
          width={1024}
          height={555}
          priority
          className="h-9 w-auto md:h-10"
        />
      </div>
    </header>
  );
}
