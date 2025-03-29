import type React from "react";

import { useState, useRef } from "react";
import { Camera, Upload, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type PredictionResult = {
  class_name: string;
  confidence: number;
  class_index: number;
  ayurvedic_info: {
    description: string;
    uses: string[];
  };
};

export default function PlantPredictionSection() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [topPredictions, setTopPredictions] = useState<PredictionResult[]>([]);
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (imageData: string) => {
      // Convert base64 image to blob for sending as multipart/form-data
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append("file", blob, "plant-image.jpg");

      // Send with multipart/form-data content type
      const res = await api.post("/medicinal-plant-prediction", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResult(data.prediction);
      setTopPredictions(data.top_predictions || []);
    },
    onError: (error) => {
      const errMsg =
        error instanceof AxiosError
          ? error.response?.data?.message || error.response?.data
          : error instanceof Error
            ? error.message
            : "Something went wrong!";
      console.error("Error detecting plant:", errMsg);
    },
  });

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
    setResult(null);
    setTopPredictions([]);
    setShowAllPredictions(false);
    mutate(imageData);
  };

  const resetDetection = () => {
    setImage(null);
    setResult(null);
    setTopPredictions([]);
    setShowAllPredictions(false);
  };

  const toggleShowAllPredictions = () => {
    setShowAllPredictions(!showAllPredictions);
  };

  return (
    <section id="plant-prediction" className="py-10">
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
                  <div className="flex flex-col sm:flex-row gap-4">
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
                    className="object-contain rounded-lg w-full h-full"
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
          <CardContent className="overflow-y-auto max-h-[500px]">
            {isPending && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">
                  Analyzing plant image...
                </p>
              </div>
            )}

            {!isPending && !result && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">
                  Upload or capture an image to see the detection results
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {result.class_name}
                    <span className="text-sm font-normal text-muted-foreground">
                      {(result.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {result.ayurvedic_info.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ayurvedic Uses:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.ayurvedic_info.uses.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                </div>

                {topPredictions.length > 1 && (
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleShowAllPredictions}
                      className="mb-3"
                    >
                      <Info className="h-4 w-4 mr-1" />
                      {showAllPredictions ? "Hide" : "Show"} Alternative
                      Predictions
                    </Button>

                    {showAllPredictions && (
                      <div className="space-y-4">
                        {topPredictions.slice(1).map((pred, idx) => (
                          <div key={idx} className="p-3 border rounded-md">
                            <h5 className="font-medium flex items-center gap-2">
                              {pred.class_name}
                              <span className="text-sm font-normal text-muted-foreground">
                                {(pred.confidence * 100).toFixed(1)}% confidence
                              </span>
                            </h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {pred.ayurvedic_info.description}
                            </p>
                            <h6 className="text-sm font-medium mt-2 mb-1">
                              Uses:
                            </h6>
                            <ul className="text-sm list-disc pl-5">
                              {pred.ayurvedic_info.uses
                                .slice(0, 2)
                                .map((use, i) => (
                                  <li key={i}>{use}</li>
                                ))}
                              {pred.ayurvedic_info.uses.length > 2 && (
                                <li>
                                  ...and {pred.ayurvedic_info.uses.length - 2}{" "}
                                  more
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
