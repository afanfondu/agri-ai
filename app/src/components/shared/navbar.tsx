import { Leaf } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <a className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Agri AI</span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a className="text-sm font-medium hover:text-primary">
            Plant Detection
          </a>
          <a className="text-sm font-medium hover:text-primary">
            Crop Recommendation
          </a>
          <a className="text-sm font-medium hover:text-primary">
            Fertilizer Recommendation
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
