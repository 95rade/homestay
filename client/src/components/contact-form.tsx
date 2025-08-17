import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (contact: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", contact);
      return response.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    createContactMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
          Full Name
        </Label>
        <Input
          id="name"
          {...form.register("name")}
          className="w-full bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="Your name"
          data-testid="input-contact-name"
        />
        {form.formState.errors.name && (
          <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          className="w-full bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="your@email.com"
          data-testid="input-contact-email"
        />
        {form.formState.errors.email && (
          <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="message" className="block text-sm font-medium mb-2 text-white">
          Message
        </Label>
        <Textarea
          id="message"
          rows={4}
          {...form.register("message")}
          className="w-full bg-white bg-opacity-10 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="How can we help you?"
          data-testid="textarea-contact-message"
        />
        {form.formState.errors.message && (
          <p className="text-red-400 text-xs mt-1">{form.formState.errors.message.message}</p>
        )}
      </div>
      
      <Button
        type="submit"
        className="w-full bg-accent hover:bg-yellow-600 text-secondary py-3 rounded-lg font-semibold transition-colors"
        disabled={createContactMutation.isPending}
        data-testid="button-send-message"
      >
        {createContactMutation.isPending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
