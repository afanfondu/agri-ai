import type React from "react";

import { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PlantDetectionSection() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    name: string;
    description: string;
    uses: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        detectPlant(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas
        .getContext("2d")
        ?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setImage(imageDataUrl);
      detectPlant(imageDataUrl);

      // Stop camera stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setIsCameraOpen(false);
    }
  };

  const detectPlant = async (imageData: string) => {
    setIsLoading(true);
    setResult(null);
    console.log(imageData);

    // Simulate API call with a timeout
    setTimeout(() => {
      // Mock result - in a real app, this would come from your ML model
      setResult({
        name: "TEST - Tulsi (Holy Basil)",
        description:
          "TEST - Tulsi is a sacred plant in Hindu belief. It's an aromatic perennial plant in the family Lamiaceae.",
        uses: [
          "Treatment of respiratory conditions",
          "Reduces stress and anxiety",
          "Helps with fever and common cold",
          "Has anti-inflammatory properties",
        ],
      });
      setIsLoading(false);
    }, 2000);
  };

  const resetDetection = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <section id="plant-detection" className="py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">
          Ayurvedic Medicinal Plant Detection
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload or capture an image of a plant to identify its ayurvedic
          medicinal properties and uses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Plant Image</CardTitle>
            <CardDescription>
              Upload or capture an image of the plant
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {!image && !isCameraOpen && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-muted-foreground">
                    Upload an image or use your camera to take a photo
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <Button onClick={openCamera}>
                      <Camera className="mr-2 h-4 w-4" />
                      Use Camera
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {isCameraOpen && (
              <div className="w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="flex justify-center mt-4">
                  <Button onClick={captureImage}>Capture</Button>
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                      if (videoRef.current) {
                        const stream = videoRef.current
                          .srcObject as MediaStream;
                        stream?.getTracks().forEach((track) => track.stop());
                      }
                      setIsCameraOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {image && !isCameraOpen && (
              <div className="w-full">
                <div className="relative aspect-square w-full max-w-md mx-auto">
                  <img
                    src={image || "/placeholder.svg"}
                    alt="Uploaded plant"
                    // fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={resetDetection}>
                    Upload Different Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
            <CardDescription>
              Identified plant and its ayurvedic properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">
                  Analyzing plant image...
                </p>
              </div>
            )}

            {!isLoading && !result && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">
                  Upload or capture an image to see the detection results
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{result.name}</h3>
                  <p className="text-muted-foreground mt-2">
                    {result.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ayurvedic Uses:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.uses.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Note: For accurate results, ensure the plant is clearly visible in
            the image.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
