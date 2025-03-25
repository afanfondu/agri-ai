import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Leaf } from "lucide-react";
import { CropFormValues, cropFormSchema } from "./schema";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

const defaultValues: CropFormValues = {
  nitrogen: 0,
  phosphorus: 0,
  potassium: 0,
  temperature: 0,
  humidity: 0,
  ph: 0,
  rainfall: 0,
};

export default function CropRecommendationSection() {
  const [result, setResult] = useState<{
    crop: string;
    message: string;
  } | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CropFormValues) => {
      const res = await api.post("/crop-recommendation", data);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("crop >>", data);
      setResult({
        crop: data.recommendation.crop,
        message: data.message,
      });
    },
  });

  const form = useForm<CropFormValues>({
    resolver: yupResolver(cropFormSchema),
  });

  const onSubmit = (data: CropFormValues) => {
    setResult(null);
    mutate(data);
  };

  const resetForm = () => {
    form.reset(defaultValues);
    setResult(null);
  };

  return (
    <section id="crop-recommendation" className="py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">Crop Recommendation</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter soil and environmental data to get personalized crop
          recommendations for optimal yield.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Soil & Environmental Data</CardTitle>
            <CardDescription>
              Enter the values to get a crop recommendation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nitrogen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nitrogen (N) mg/kg</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0-140" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phosphorus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phosphorus (P) mg/kg</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5-145" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="potassium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potassium (K) mg/kg</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5-205" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°C)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="8-44"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="humidity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Humidity (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="14-100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ph"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>pH</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="3.5-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rainfall"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rainfall (mm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="20-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Processing..." : "Get Recommendation"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendation Results</CardTitle>
            <CardDescription>
              Based on your soil and environmental data
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            {isPending && (
              <div className="flex flex-col items-center justify-center h-full min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Analyzing data...</p>
              </div>
            )}

            {!isPending && !result && (
              <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
                <p className="text-muted-foreground">
                  Fill in the form and submit to get crop recommendations
                </p>
              </div>
            )}

            {result && (
              <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
                <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full mb-4">
                  <Leaf className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{result.crop}</h3>
                <p className="text-muted-foreground">{result.message}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Note: Recommendations are based on historical data and optimal
            growing conditions.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
