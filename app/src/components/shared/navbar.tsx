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
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Agri AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <div
            onClick={() => {
              document
                .querySelector("#plant-prediction")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm font-medium hover:text-primary cursor-pointer"
          >
            Plant Detection
          </div>
          <div
            onClick={() => {
              document
                .querySelector("#crop-recommendation")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm font-medium hover:text-primary cursor-pointer"
          >
            Crop Recommendation
          </div>
          <div
            onClick={() => {
              document
                .querySelector("#fertilizer-recommendation")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm font-medium hover:text-primary cursor-pointer"
          >
            Fertilizer Recommendation
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
