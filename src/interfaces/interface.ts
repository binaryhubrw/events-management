// import { ApprovalStatus } from "../models/VenueBooking"; // Assuming ApprovalStatus is an enum/type
// import { Organization } from "../models/Organization";
// import { User } from "../models/User";
// import { Venue } from "../models/Venue";
// import { Event } from "../models/Event"; // Make sure to import Event

// // --- PaymentStatus Enum ---
// export enum PaymentStatus {
//   PENDING = 'pending',
//   COMPLETED = 'completed',
//   FAILED = 'failed',
//   CANCELLED = 'cancelled',
//   REFUNDED = 'refunded',
// }
// // --- Core Entities Interfaces ---

// export interface UserInterface {
//   userId: string;
//   username: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   password?: string; // Optional for security (e.g., when fetching user data)
//   phoneNumber?: string;
//   role?: RoleInterface; // Link to Role
//   organizations?: OrganizationInterface[]; // Link to Organization (One-to-Many or Many-to-Many depending on your model)
// }

// export interface RoleInterface {
//   roleId: string; // Corrected to camelCase
//   roleName: string; // Corrected to camelCase
//   permissions: string[];
//   description?: string;
//   users?: UserInterface[]; // One-to-Many relationship (a role can have many users)
// }

// export interface OrganizationInterface {
//   organizationId: string; // Corrected to camelCase
//   organizationName: string; // Corrected to camelCase
//   description: string;
//   contactEmail: string;
//   contactPhone?: string;
//   isExternal: boolean;
//   address: string;
//   organizationType: string;
//   user?: UserInterface; // Many-to-One relationship (an organization belongs to one user - manager/creator)
// }

// export interface VenueInterface {
//   venueId: string;
//   venueName: string;
//   capacity: number;
//   location: string;
//   latitude?: number;  // New field for latitude
//   longitude?: number; // New field for longitude
//   googleMapsLink?: string; // Optional: direct link to Google Maps
//   managerId?: string;
//   isAvailable?: boolean;
//   isBooked?: boolean;
// }


// export enum EventType {
//   PUBLIC = 'public',
//   PRIVATE = 'private',
// }
// export enum EventStatus {
//   DRAFT = 'draft',
//   PUBLISHED = 'published',
//   CANCELLED = 'cancelled',
//   COMPLETED = 'completed',
//   ARCHIVED = 'archived',
// }

// export interface EventInterface {
//     eventId: string;
//     eventTitle: string;
//     description?: string; // Optional
//     eventCategory?: string; // Optional
//     eventType: EventType; // Using the enum
   
//     maxAttendees?: number; // Optional
//     status: EventStatus; // Using the enum
//     isFeatured: boolean;
//     qrCode?: string; // Optional
//     imageURL?: string; // Optional

//     // Foreign Keys
//     organizerId: string;
//     venueId: string;

//     // Relationships (optional for interface if not always loaded)
//     organizer?: UserInterface;
//     venue?: VenueInterface;
//     bookings?: VenueBookingInterface[];
//     registrations?: RegistrationInterface[];
//     payments?: PaymentInterface[]; // If events have direct payments

//     // Timestamps
//     createdAt: Date;
//     updatedAt: Date;
//     deletedAt?: Date; // Optional for soft delete
// }





// // Interface for the actual entity (for type safety, if used for TypeORM entity structure)
// export interface VenueBookingEntity {
//   bookingId: string;
//   event: Event; // Actual Event entity
//   venue: Venue; // Actual Venue entity
//   user: User; // User who made the booking/organizer
//   organization: Organization; // Organization related to the booking
//   startDate: Date;
//   endDate: Date;
//   startTime: string;
//   endTime: string;
//   approvalStatus: ApprovalStatus; // Using imported ApprovalStatus
// }

// export interface EventResourceInterface {
//   eventResourceId: string; // Corrected to camelCase
//   eventId: string; // Foreign key for Event
//   resourceId: string; // Foreign key for Resource
//   quantity: number;
//   amountSpent: number;
// }

// export interface ResourceInterface {
//   resourceId: string; // Corrected to camelCase
//   resourceName: string; // Corrected to camelCase
//   description: string;
//   costPerUnit: number;
// }

// // Interface for TicketTypes (now singular to match ManyToOne in Registration)
// export interface TicketTypeInterface {
//   ticketTypeId: string;
//   ticketName: string;
//   price: number;
//   ticketCategory: TicketCategory; // Using the enhanced TicketCategory enum
//   description?: string; // Made optional
//   promoName?: string; // Optional promotional name
//   promoDescription?: string; // Optional promotional description
//   capacity?: number; // Maximum tickets available
//   availableFrom?: Date; // When ticket sales start
//   availableUntil?: Date; // When ticket sales end
//   isActive?: boolean; // Whether ticket is currently sellable
//   minQuantity?: number; // Minimum purchase quantity (for GROUP tickets)
//   maxQuantity?: number; // Maximum purchase quantity per customer
//   requiresVerification?: boolean; // For STUDENT, SENIOR, PRESS tickets
//   perks?: string[]; // List of included perks/benefits
//   createdAt?: Date; // Timestamp for creation
//   updatedAt?: Date; // Timestamp for last update
//   deletedAt?: Date; // Added soft delete field
// }
// export enum TicketCategory {
//   REGULAR = 'Regular',
//   MEDIUM = 'Medium',
//   VIP = 'VIP',
//   VVIP = 'VVIP',
//   PROMOTIONAL = 'Promotional',
//   STUDENT = 'Student',
//   SENIOR = 'Senior',
//   GROUP = 'Group',
//   CORPORATE = 'Corporate',
//   PRESS = 'Press',
//   SPONSOR = 'Sponsor',
//   SEASON_PASS = 'Season Pass',
//   BACKSTAGE = 'Backstage',
//   GENERAL_ADMISSION = 'General Admission',
//   RESERVED_SEATING = 'Reserved Seating',
// }
// // --- TicketType Interfaces (ENHANCED) ---
// export interface TicketTypeRequest {
//     ticketTypeId?: string;
//     ticketName: string;
//     price: number;
//     description?: string;
//     ticketCategory: TicketCategory;
//     promoName?: string;
//     promoDescription?: string;
//     // Additional fields for enhanced functionality
//     capacity?: number;              // Maximum tickets available
//     availableFrom?: Date;           // When ticket sales start
//     availableUntil?: Date;          // When ticket sales end
//     isActive?: boolean;             // Whether ticket is currently sellable
//     minQuantity?: number;           // Minimum purchase quantity (for GROUP tickets)
//     maxQuantity?: number;           // Maximum purchase quantity per customer
//     requiresVerification?: boolean; // For STUDENT, SENIOR, PRESS tickets
//     perks?: string[];              // List of included perks/benefits
// }

// export interface TicketTypeResponse {
//     ticketTypeId: string;
//     ticketName: string;
//     price: number;
//     description?: string;
//     ticketCategory: TicketCategory;
//     promoName?: string;
//     promoDescription?: string;
//     deletedAt?: string;
//     // Enhanced response fields
//     capacity?: number;
//     availableFrom?: string;         // ISO string format
//     availableUntil?: string;        // ISO string format
//     isActive?: boolean;
//     minQuantity?: number;
//     maxQuantity?: number;
//     requiresVerification?: boolean;
//     perks?: string[];
//     createdAt?: string;             // ISO string format
//     updatedAt?: string;             // ISO string format
// }
// // --- Junction/Booking/Request Interfaces ---

// export interface VenueBookingInterface {
//   bookingId: string;
//   eventId: string; // Foreign key for Event
//   venueId: string; // Foreign key for Venue
//   organizerId: string; // Foreign key for User (organizer)
//   organizationId: string; // Foreign key for Organization
//   startDate: Date;
//   endDate: Date;
//   startTime: string;
//   endTime: string;
//   approvalStatus: 'pending' | 'approved' | 'rejected'; // Using string literals directly or importing ApprovalStatus
// }

// // Interface for the complete Registration entity (with populated relationships)
// export interface RegistrationInterface {
//     registrationId: string;
//     event: EventInterface;
//     user: UserInterface;
//     buyer: UserInterface;
//     boughtForIds?: string[];
//     ticketType: TicketTypeInterface;
//     venue: VenueInterface;
//     noOfTickets: number;
//     registrationDate: string;
//     paymentStatus: string;
//     qrCode?: string;
//     checkDate?: string;
//     attended: boolean;
//     // --- New Fields ---
//     totalCost: number; // Added for the calculated total cost of tickets in this registration
//     registrationStatus: string; // Added to track the overall status (e.g., 'active', 'cancelled', 'partially_cancelled')
//     // --- Relationships to Payment and Invoice (if eager loaded or directly attached) ---
//     payment?: PaymentInterface; // Optional, as it might be null if payment is pending or not yet created
//     invoice?: InvoiceInterface; // Optional, as it might be null or not created yet
//     // --- Explicit foreign key IDs (if you choose to expose them directly in the interface) ---
//     paymentId?: string; // If you expose the FK directly
//     invoiceId?: string; // If you expose the FK directly
// }

// export interface RegistrationRequestInterface {
//     registrationId?: string;
//     eventId: string;
//     userId: string;
//     buyerId?: string | null;
//     boughtForIds?: string[];
//     ticketTypeId: string;
//     venueId: string;
//     noOfTickets: number;
//     paymentStatus?: PaymentStatus;
//     registrationDate?: string;
//     qrCode?: string;
//     checkDate?: string;
//     attended?: boolean;
//     totalCost?: number;
//     registrationStatus?: string;
//     paymentId?: string;
//     invoiceId?: string;
// }

// export interface RegistrationResponseInterface {
//     registrationId: string;
//     event: EventInterface;
//     user: UserInterface;
//     buyer: UserInterface;
//     boughtForIds?: string[];
//     ticketType: TicketTypeInterface;
//     venue: VenueInterface;
//     noOfTickets: number;
//     registrationDate: string;
//     paymentStatus: PaymentStatus;
//     qrCode?: string;
//     checkDate?: string;
//     attended: boolean;
//     totalCost: number;
//     registrationStatus: string;
//     payment?: PaymentInterface;
//     invoice?: InvoiceInterface;
//     paymentId?: string;
//     invoiceId?: string;
//     createdAt: string;
//     updatedAt: string;
//     deletedAt?: string;
// }


// // Interface for the complete Invoice entity (with populated relationships)
// export interface InvoiceInterface {
//     invoiceId: string;
//     eventId: string; // Assuming these are just IDs in the Invoice table, not full objects
//     userId: string;  // Assuming these are just IDs in the Invoice table, not full objects
//     invoiceDate: string;
//     dueDate: string;
//     totalAmount: number;
//     status: string;

//     // Relationships
//     payments?: PaymentInterface[]; // One-to-Many relationship with Payment
//     registration?: RegistrationInterface; // One-to-One relationship with Registration
// }


// export interface InvoiceRequestInterface {
//     invoiceId?: string; // Optional for creation, required for updates
//     eventId: string;
//     userId: string;
//     invoiceDate: string;
//     dueDate: string;
//     totalAmount: number;
//     status: string;
   
//     registrationId?: string; // If you link a registration when creating an invoice
// }


// export interface FeedbackInterface {
//   feedbackId: string; // Corrected to camelCase
//   eventId: string; // Foreign key for Event
//   userId: string; // Foreign key for User
//   rating: number;
//   comments: string;
// }

// /**
//  * Represents the full Payment entity data structure, including relationships.
//  */
// export interface PaymentInterface {
//   paymentId: string;
//   invoiceId: string;
//   invoice: InvoiceInterface;
//   registrationId?: string;
//   registration?: RegistrationInterface;
//   paymentDate: Date;
//   paidAmount: number;
//   paymentMethod: string;
//   paymentStatus: string;
//   description?: string;
//   // Flutterwave Fields
//   txRef?: string;
//   flwRef?: string;
//   isSuccessful: boolean;
//   paymentResponse?: any;
//   // Installment metadata
//   isInstallment: boolean;
//   installmentNumber?: number;
//   installmentPlanId?: string; // Foreign key for InstallmentPlan
//   installmentPlan?: InstallmentPlanInterface; // The actual InstallmentPlan object
//   paidBy?: string; // New field from your entity
//   // Audit fields
//   createdAt: Date;
//   updatedAt: Date;
//   deletedAt?: Date;
// }

// /**
//  * Represents the data structure for creating or updating a Payment.
//  * Typically used for DTOs (Data Transfer Objects) where you might send string dates
//  * or omit auto-generated fields like IDs for creation.
//  */
// export interface PaymentRequestInterface {
//   paymentId?: string; // Optional for creation, required for updates
//   invoiceId: string;
//   registrationId?: string;
//   paymentDate: string; // Often string for request, converted to Date in service
//   paidAmount: number;
//   paymentMethod: string;
//   paymentStatus: string;
//   description?: string;
//   // Flutterwave Fields
//   txRef?: string;
//   flwRef?: string;
//   isSuccessful?: boolean; // Can be optional in request if default is handled
//   paymentResponse?: any;
//   // Installment metadata
//   isInstallment?: boolean; // Optional if default is handled
//   installmentNumber?: number;
//   installmentPlanId?: string; // Only send the ID in the request
//   paidBy?: string;
// }

// /**
//  * Represents the full Installment Plan entity data structure.
//  */
// export interface InstallmentPlanInterface {
//   id: string;
//   invoiceId: string;
//   totalAmount: number;
//   numberOfInstallments: number;
//   completedInstallments: number;
//   isCompleted: boolean;
//   // Note: Payments array might be very large, consider if you always need it in the interface
//   // payments: PaymentInterface[];
//   createdAt: Date;
//   updatedAt: Date;
//   deletedAt?: Date;
// }


// /**
//  * Represents the data structure for creating or updating an Installment Plan.
//  */
// export interface InstallmentPlanRequestInterface {
//   id?: string; // Optional for creation, required for updates
//   invoiceId: string;
//   totalAmount: number;
//   numberOfInstallments: number;
//   completedInstallments?: number; // Optional as it might default
//   isCompleted?: boolean; // Optional as it might default
// }





// export interface NotificationInterface {
//   notificationId: string; // Corrected to camelCase
//   userId: string; // Foreign key for User
//   eventId?: string; // Foreign key for Event (optional, notifications might not always be event-specific)
//   message: string;
//   sentAt: Date;
//   isDisabled?: boolean;
//   isRead?: boolean;
// }

// export interface BudgetInterface {
//   budgetId: string; // Corrected to camelCase
//   eventId: string; // Foreign key for Event
//   expectedAmount: number;
//   income: number;
//   expenditure: number;
//   notes: string;
// }


