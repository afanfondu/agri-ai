import HeroSection from "./components/hero-section";
import PlantDetectionSection from "./components/plant-detection-section";
import CropRecommendationSection from "./components/crop-recommendation-section";
import FertilizerRecommendationSection from "./components/fertilizer-recommendation-section";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection />

      <div className="container px-4 py-8 space-y-16 max-w-6xl">
        <PlantDetectionSection />
        <CropRecommendationSection />
        <FertilizerRecommendationSection />
      </div>
    </main>
  );
}
