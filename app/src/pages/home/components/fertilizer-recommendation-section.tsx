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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskRoundIcon as Flask } from "lucide-react";
import { FertilizerFormValues, fertilizerFormSchema } from "./schema";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

const soilTypes = ["Sandy", "Loamy", "Black", "Red", "Clayey"];
const cropTypes = [
  "Sugarcane",
  "Cotton",
  "Millets",
  "Paddy",
  "Pulses",
  "Wheat",
  "Tobacco",
  "Barley",
  "Oil seeds",
  "Ground Nuts",
  "Maize",
];

const defaultValues: FertilizerFormValues = {
  temperature: 0,
  humidity: 0,
  moisture: 0,
  nitrogen: 0,
  potassium: 0,
  phosphorous: 0,
  soilType: "",
  cropType: "",
};

export default function FertilizerRecommendationSection() {
  const [result, setResult] = useState<{
    fertilizer: string;
    message: string;
  } | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FertilizerFormValues) => {
      const res = await api.post("/fertilizer-recommendation", {
        ...data,
        crop_type: data.cropType,
        soil_type: data.soilType,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResult({
        fertilizer: data.recommendation.fertilizer,
        message: data.recommendation.description,
      });
    },
    onError: () => {
      toast.error("Something went wrong! Please try again later.");
    },
  });

  const form = useForm<FertilizerFormValues>({
    resolver: yupResolver(fertilizerFormSchema),
  });

  const onSubmit = (data: FertilizerFormValues) => {
    setResult(null);
    mutate(data);
  };

  const resetForm = () => {
    form.reset(defaultValues);
    setResult(null);
  };

  return (
    <section id="fertilizer-recommendation" className="py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">Fertilizer Recommendation</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter soil, crop, and environmental data to get personalized
          fertilizer recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Soil, Crop & Environmental Data</CardTitle>
            <CardDescription>
              Enter the values to get a fertilizer recommendation
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
                    name="moisture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moisture (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0-100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    name="potassium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potassium (K) mg/kg</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0-205" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phosphorous"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phosphorous (P) mg/kg</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0-145" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soil Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {soilTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of soil in your field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cropType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select crop type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cropTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of crop you're growing
                        </FormDescription>
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
              Based on your soil, crop, and environmental data
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
              <div className="flex flex-col items-center justify-center text-center h-full min-h-64">
                <p className="text-muted-foreground">
                  Fill in the form and submit to get fertilizer recommendations
                </p>
              </div>
            )}

            {result && (
              <div className="flex flex-col items-center justify-center h-full text-center min-h-64">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-full mb-4">
                  <Flask className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{result.fertilizer}</h3>
                <p className="text-muted-foreground">{result.message}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground justify-self-end">
            Note: Recommendations are based on soil composition, crop
            requirements, and environmental conditions.
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
