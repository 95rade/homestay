import { type User, type InsertUser, type Booking, type InsertBooking, type Contact, type InsertContact, type ContentSection, type InsertContentSection, type PropertyImage, type InsertPropertyImage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | undefined>;
  
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  
  getContentSections(): Promise<ContentSection[]>;
  getContentSection(sectionKey: string): Promise<ContentSection | undefined>;
  createContentSection(content: InsertContentSection): Promise<ContentSection>;
  updateContentSection(sectionKey: string, content: Partial<ContentSection>): Promise<ContentSection | undefined>;
  
  getPropertyImages(category?: string): Promise<PropertyImage[]>;
  getPropertyImage(id: string): Promise<PropertyImage | undefined>;
  createPropertyImage(image: InsertPropertyImage): Promise<PropertyImage>;
  updatePropertyImage(id: string, image: Partial<PropertyImage>): Promise<PropertyImage | undefined>;
  deletePropertyImage(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<string, Booking>;
  private contacts: Map<string, Contact>;
  private contentSections: Map<string, ContentSection>;
  private propertyImages: Map<string, PropertyImage>;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.contacts = new Map();
    this.contentSections = new Map();
    this.propertyImages = new Map();
    
    // Initialize with default content
    this.initializeDefaultContent();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      guestPhone: insertBooking.guestPhone || null,
      id,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updateData: Partial<Booking>): Promise<Booking | undefined> {
    const existing = this.bookings.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.bookings.set(id, updated);
    return updated;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContentSections(): Promise<ContentSection[]> {
    return Array.from(this.contentSections.values()).sort((a, b) => 
      new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    );
  }

  async getContentSection(sectionKey: string): Promise<ContentSection | undefined> {
    return Array.from(this.contentSections.values()).find(
      (section) => section.sectionKey === sectionKey
    );
  }

  async createContentSection(insertContent: InsertContentSection): Promise<ContentSection> {
    const id = randomUUID();
    const content: ContentSection = {
      ...insertContent,
      metadata: insertContent.metadata || null,
      id,
      updatedAt: new Date(),
    };
    this.contentSections.set(content.sectionKey, content);
    return content;
  }

  async updateContentSection(sectionKey: string, updateData: Partial<ContentSection>): Promise<ContentSection | undefined> {
    const existing = await this.getContentSection(sectionKey);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData, updatedAt: new Date() };
    this.contentSections.set(sectionKey, updated);
    return updated;
  }

  async getPropertyImages(category?: string): Promise<PropertyImage[]> {
    const images = Array.from(this.propertyImages.values())
      .filter(img => img.isActive === "true")
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    if (category) {
      return images.filter(img => img.category === category);
    }
    return images;
  }

  async getPropertyImage(id: string): Promise<PropertyImage | undefined> {
    return this.propertyImages.get(id);
  }

  async createPropertyImage(insertImage: InsertPropertyImage): Promise<PropertyImage> {
    const id = randomUUID();
    const image: PropertyImage = {
      ...insertImage,
      title: insertImage.title || null,
      description: insertImage.description || null,
      sortOrder: insertImage.sortOrder || 0,
      isActive: insertImage.isActive || "true",
      id,
    };
    this.propertyImages.set(id, image);
    return image;
  }

  async updatePropertyImage(id: string, updateData: Partial<PropertyImage>): Promise<PropertyImage | undefined> {
    const existing = this.propertyImages.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.propertyImages.set(id, updated);
    return updated;
  }

  async deletePropertyImage(id: string): Promise<boolean> {
    return this.propertyImages.delete(id);
  }

  private async initializeDefaultContent() {
    // Initialize default content sections
    await this.createContentSection({
      sectionKey: "hero-title",
      title: "Hero Title",
      content: "Luxury Villa Retreat",
      metadata: JSON.stringify({ editable: true, type: "text" })
    });

    await this.createContentSection({
      sectionKey: "hero-subtitle",
      title: "Hero Subtitle",
      content: "Experience unparalleled comfort in our stunning contemporary villa",
      metadata: JSON.stringify({ editable: true, type: "text" })
    });

    await this.createContentSection({
      sectionKey: "property-title",
      title: "Property Title",
      content: "Modern Luxury Villa",
      metadata: JSON.stringify({ editable: true, type: "text" })
    });

    await this.createContentSection({
      sectionKey: "property-bedrooms",
      title: "Number of Bedrooms",
      content: "3",
      metadata: JSON.stringify({ editable: true, type: "text" })
    });

    await this.createContentSection({
      sectionKey: "property-bathrooms",
      title: "Number of Bathrooms",
      content: "2½",
      metadata: JSON.stringify({ editable: true, type: "text" })
    });

    await this.createContentSection({
      sectionKey: "property-guests",
      title: "Maximum Guests",
      content: "6",
      metadata: JSON.stringify({ editable: true, type: "text" })
    });

    await this.createContentSection({
      sectionKey: "property-description",
      title: "Property Description",
      content: "Discover the perfect blend of modern luxury and natural beauty in our stunning contemporary villa. Perched on a hillside with breathtaking panoramic views, this architectural masterpiece offers an unparalleled vacation experience.\n\nThe villa features expansive living spaces with floor-to-ceiling windows that blur the line between indoor and outdoor living. Each of the five beautifully appointed bedrooms offers stunning views and en-suite bathrooms, ensuring privacy and comfort for all guests.\n\nWhether you're seeking a romantic getaway, family vacation, or corporate retreat, our villa provides the perfect sanctuary with world-class amenities and personalized service.",
      metadata: JSON.stringify({ editable: true, type: "textarea" })
    });

    // Initialize default property images
    const exteriorImages = [
      "https://demo-source.imgix.net/house.jpg",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
    ];

    exteriorImages.forEach(async (url, index) => {
      await this.createPropertyImage({
        category: "exterior",
        url,
        title: `Exterior View ${index + 1}`,
        description: "Beautiful exterior view of the luxury villa",
        sortOrder: index,
        isActive: "true"
      });
    });

    const interiorImages = [
      { url: "https://demo-source.imgix.net/plant.jpg", title: "Living Room", description: "Open-concept design with panoramic views" },
      { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", title: "Master Suite", description: "King bed with stunning ocean views" },
      { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", title: "Gourmet Kitchen", description: "Professional-grade appliances" },
      { url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", title: "Spa Bathroom", description: "Marble finishes and soaking tub" }
    ];

    interiorImages.forEach(async (img, index) => {
      await this.createPropertyImage({
        category: "interior",
        url: img.url,
        title: img.title,
        description: img.description,
        sortOrder: index,
        isActive: "true"
      });
    });

    const amenityImages = [
      { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", title: "Infinity Pool & Spa", description: "Relax in our stunning infinity pool with panoramic ocean views" },
      { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", title: "Private Fitness Center", description: "Stay active in our fully equipped private gym" }
    ];

    amenityImages.forEach(async (img, index) => {
      await this.createPropertyImage({
        category: "amenity",
        url: img.url,
        title: img.title,
        description: img.description,
        sortOrder: index,
        isActive: "true"
      });
    });
  }
}

export const storage = new MemStorage();
