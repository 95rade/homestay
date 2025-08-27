import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertContactSchema, insertContentSectionSchema, insertPropertyImageSchema, paymentSchema } from "@shared/schema";
import { sendBookingConfirmation } from "./email";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      
      // Send confirmation email for confirmed bookings
      if (booking.status === "confirmed") {
        try {
          const emailSent = await sendBookingConfirmation(booking);
          if (!emailSent) {
            console.warn(`Failed to send confirmation email for booking ${booking.id}`);
          }
        } catch (error) {
          console.error(`Error sending confirmation email for booking ${booking.id}:`, error);
        }
      }
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create booking" });
      }
    }
  });

  // Get a specific booking
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ message: "Status is required" });
        return;
      }
      
      const booking = await storage.updateBooking(req.params.id, { status });
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Process payment
  app.post("/api/process-payment", async (req, res) => {
    try {
      const validatedPayment = paymentSchema.parse(req.body.paymentData);
      const validatedBooking = insertBookingSchema.parse(req.body.bookingData);
      
      // Mock payment processing - in real implementation, you would:
      // 1. Validate with payment processor (Stripe, PayPal, etc.)
      // 2. Create payment record
      // 3. Update booking status
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create the booking with confirmed status
      const booking = await storage.createBooking({
        ...validatedBooking,
        status: "confirmed"
      });
      
      // Send confirmation email
      try {
        const emailSent = await sendBookingConfirmation(booking);
        if (!emailSent) {
          console.warn(`Failed to send confirmation email for booking ${booking.id}`);
        }
      } catch (error) {
        console.error(`Error sending confirmation email for booking ${booking.id}:`, error);
      }
      
      res.status(200).json({
        success: true,
        booking,
        paymentId: `pay_${Date.now()}`, // Mock payment ID
        message: "Payment processed successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Payment processing failed",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  // Get all contacts
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Create a new contact
  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  // Content Management API Routes

  // Get all content sections
  app.get("/api/content", async (req, res) => {
    try {
      const content = await storage.getContentSections();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Get specific content section
  app.get("/api/content/:sectionKey", async (req, res) => {
    try {
      const content = await storage.getContentSection(req.params.sectionKey);
      if (!content) {
        res.status(404).json({ message: "Content section not found" });
        return;
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content section" });
    }
  });

  // Create content section
  app.post("/api/content", async (req, res) => {
    try {
      const validatedData = insertContentSectionSchema.parse(req.body);
      const content = await storage.createContentSection(validatedData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create content section" });
      }
    }
  });

  // Update content section
  app.put("/api/content/:sectionKey", async (req, res) => {
    try {
      const { title, content, metadata } = req.body;
      const updatedContent = await storage.updateContentSection(req.params.sectionKey, {
        title,
        content,
        metadata
      });
      if (!updatedContent) {
        res.status(404).json({ message: "Content section not found" });
        return;
      }
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update content section" });
    }
  });

  // Property Images API Routes

  // Get property images by category
  app.get("/api/images", async (req, res) => {
    try {
      const { category } = req.query;
      const images = await storage.getPropertyImages(category as string);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  // Get specific property image
  app.get("/api/images/:id", async (req, res) => {
    try {
      const image = await storage.getPropertyImage(req.params.id);
      if (!image) {
        res.status(404).json({ message: "Image not found" });
        return;
      }
      res.json(image);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });

  // Create property image
  app.post("/api/images", async (req, res) => {
    try {
      const validatedData = insertPropertyImageSchema.parse(req.body);
      const image = await storage.createPropertyImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create image" });
      }
    }
  });

  // Update property image
  app.put("/api/images/:id", async (req, res) => {
    try {
      const { title, description, url, sortOrder, isActive } = req.body;
      const image = await storage.updatePropertyImage(req.params.id, {
        title,
        description,
        url,
        sortOrder,
        isActive
      });
      if (!image) {
        res.status(404).json({ message: "Image not found" });
        return;
      }
      res.json(image);
    } catch (error) {
      res.status(500).json({ message: "Failed to update image" });
    }
  });

  // Delete property image
  app.delete("/api/images/:id", async (req, res) => {
    try {
      const success = await storage.deletePropertyImage(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Image not found" });
        return;
      }
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
