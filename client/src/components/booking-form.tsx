import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema, paymentSchema, type InsertBooking, type Payment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Users, DollarSign, CreditCard, ArrowLeft, Shield } from "lucide-react";

export default function BookingForm() {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [bookingData, setBookingData] = useState<InsertBooking | null>(null);
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

  const paymentForm = useForm<Payment>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolder: "",
      billingAddress: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
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
    setBookingData(submissionData);
    setShowPaymentForm(true);
  };

  const onPaymentSubmit = (paymentData: Payment) => {
    if (!bookingData) return;
    
    // Mock payment processing
    setTimeout(() => {
      createBookingMutation.mutate({
        ...bookingData,
        status: "confirmed",
      });
      setShowPaymentForm(false);
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
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

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Secure Payment
            </DialogTitle>
            <DialogDescription>
              Complete your booking by entering your payment information
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
            {/* Credit Card Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Payment Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    {...paymentForm.register("cardNumber")}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      paymentForm.setValue("cardNumber", formatted);
                    }}
                    maxLength={19}
                    data-testid="input-card-number"
                  />
                  {paymentForm.formState.errors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      {...paymentForm.register("expiryDate")}
                      onChange={(e) => {
                        const formatted = formatExpiry(e.target.value);
                        paymentForm.setValue("expiryDate", formatted);
                      }}
                      maxLength={5}
                      data-testid="input-expiry"
                    />
                    {paymentForm.formState.errors.expiryDate && (
                      <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.expiryDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      {...paymentForm.register("cvv")}
                      maxLength={4}
                      data-testid="input-cvv"
                    />
                    {paymentForm.formState.errors.cvv && (
                      <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardHolder">Cardholder Name</Label>
                  <Input
                    id="cardHolder"
                    placeholder="John Doe"
                    {...paymentForm.register("cardHolder")}
                    data-testid="input-cardholder"
                  />
                  {paymentForm.formState.errors.cardHolder && (
                    <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.cardHolder.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Billing Address</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    {...paymentForm.register("billingAddress.address")}
                    data-testid="input-address"
                  />
                  {paymentForm.formState.errors.billingAddress?.address && (
                    <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.billingAddress.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="San Francisco"
                      {...paymentForm.register("billingAddress.city")}
                      data-testid="input-city"
                    />
                    {paymentForm.formState.errors.billingAddress?.city && (
                      <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.billingAddress.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      {...paymentForm.register("billingAddress.state")}
                      data-testid="input-state"
                    />
                    {paymentForm.formState.errors.billingAddress?.state && (
                      <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.billingAddress.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="94103"
                      {...paymentForm.register("billingAddress.zipCode")}
                      data-testid="input-zipcode"
                    />
                    {paymentForm.formState.errors.billingAddress?.zipCode && (
                      <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.billingAddress.zipCode.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={paymentForm.watch("billingAddress.country")}
                      onValueChange={(value) => paymentForm.setValue("billingAddress.country", value)}
                    >
                      <SelectTrigger data-testid="select-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                    {paymentForm.formState.errors.billingAddress?.country && (
                      <p className="text-red-500 text-xs mt-1">{paymentForm.formState.errors.billingAddress.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            {bookingData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Payment Summary</h3>
                <div className="flex justify-between">
                  <span>Booking Total:</span>
                  <span className="font-bold">${bookingData.totalAmount}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Check-in: {new Date(bookingData.checkinDate).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(bookingData.checkoutDate).toLocaleDateString()}</p>
                  <p>Guests: {bookingData.guests}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-blue-700"
                disabled={createBookingMutation.isPending}
                data-testid="button-pay"
              >
                {createBookingMutation.isPending ? "Processing..." : `Pay $${bookingData?.totalAmount || "0"}`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
