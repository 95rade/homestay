import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema, type InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Users, DollarSign } from "lucide-react";

export default function BookingForm() {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      checkinDate: "",
      checkoutDate: "",
      guests: 1,
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      totalAmount: "0",
      status: "pending",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", booking);
      return response.json();
    },
    onSuccess: (data) => {
      setBookingDetails(data);
      setShowBookingDialog(true);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Confirmed!",
        description: "Your reservation has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = (checkin: string, checkout: string, guests: number) => {
    if (!checkin || !checkout) return 0;
    
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return 0;
    
    const basePrice = 850;
    const subtotal = basePrice * nights;
    const serviceFee = Math.round(subtotal * 0.06);
    const taxes = Math.round(subtotal * 0.08);
    
    return subtotal + serviceFee + taxes;
  };

  const watchedValues = form.watch();
  const total = calculateTotal(watchedValues.checkinDate, watchedValues.checkoutDate, watchedValues.guests);

  const onSubmit = (data: InsertBooking) => {
    const submissionData = {
      ...data,
      totalAmount: total.toString(),
    };
    createBookingMutation.mutate(submissionData);
  };

  return (
    <>
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sticky top-24">
        <CardContent className="p-0">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-secondary">
              <span data-testid="text-price">$850</span>
              <span className="text-lg font-normal text-muted">/ night</span>
            </div>
            <div className="text-sm text-muted mt-1">★ 4.9 (127 reviews)</div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="checkin" className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in
                </Label>
                <Input
                  id="checkin"
                  type="date"
                  {...form.register("checkinDate")}
                  className="w-full"
                  data-testid="input-checkin"
                  min={new Date().toISOString().split('T')[0]}
                />
                {form.formState.errors.checkinDate && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.checkinDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="checkout" className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out
                </Label>
                <Input
                  id="checkout"
                  type="date"
                  {...form.register("checkoutDate")}
                  className="w-full"
                  data-testid="input-checkout"
                  min={watchedValues.checkinDate || new Date().toISOString().split('T')[0]}
                />
                {form.formState.errors.checkoutDate && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.checkoutDate.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </Label>
              <Select
                value={watchedValues.guests?.toString()}
                onValueChange={(value) => form.setValue("guests", parseInt(value))}
              >
                <SelectTrigger data-testid="select-guests">
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} Guest{i > 0 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.guests && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.guests.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </Label>
                <Input
                  id="guestName"
                  {...form.register("guestName")}
                  placeholder="Enter your full name"
                  data-testid="input-guest-name"
                />
                {form.formState.errors.guestName && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.guestName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </Label>
                <Input
                  id="guestEmail"
                  type="email"
                  {...form.register("guestEmail")}
                  placeholder="Enter your email"
                  data-testid="input-guest-email"
                />
                {form.formState.errors.guestEmail && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.guestEmail.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="guestPhone"
                  {...form.register("guestPhone")}
                  placeholder="Enter your phone number"
                  data-testid="input-guest-phone"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              disabled={createBookingMutation.isPending}
              data-testid="button-reserve"
            >
              {createBookingMutation.isPending ? "Processing..." : "Reserve Now"}
            </Button>
          </form>

          {total > 0 && (
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span data-testid="text-calculation">
                  $850 x {Math.ceil((new Date(watchedValues.checkoutDate).getTime() - new Date(watchedValues.checkinDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                </span>
                <span data-testid="text-subtotal">${(total * 0.86).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span data-testid="text-service-fee">${Math.round(total * 0.06)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span data-testid="text-taxes">${Math.round(total * 0.08)}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span data-testid="text-total">${total}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your reservation has been successfully created.
            </DialogDescription>
          </DialogHeader>
          
          {bookingDetails && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Booking ID:</span>
                  <span className="font-mono text-sm">{bookingDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Check-in:</span>
                  <span>{new Date(bookingDetails.checkinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Check-out:</span>
                  <span>{new Date(bookingDetails.checkoutDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Guests:</span>
                  <span>{bookingDetails.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">${bookingDetails.totalAmount}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to {bookingDetails.guestEmail}. 
                Our team will contact you shortly to confirm your reservation details.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
