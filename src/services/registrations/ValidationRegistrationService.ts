// src/services/registrations/RegistrationService.ts

import { Event } from "../../models/Event";
import { User } from "../../models/User";
import { TicketType } from "../../models/TicketType";
import { Venue } from "../../models/Venue";
import { Registration } from "../../models/Registration";
import { AppDataSource } from "../../config/Database";
import { In, Repository } from "typeorm";
import {
  RegistrationRequestInterface,
  RegistrationResponseInterface,
  EventInterface,
  UserInterface,
  TicketTypeInterface,
  VenueInterface,
  PaymentInterface,
  InvoiceInterface,
  PaymentStatus,
} from "../../interfaces/Index";

export class RegistrationService {
  private static registrationRepository: Repository<Registration>;
  private static eventRepository: Repository<Event>;
  private static userRepository: Repository<User>;
  private static ticketTypeRepository: Repository<TicketType>;
  private static venueRepository: Repository<Venue>;

  /**
   * Helper to ensure repositories are initialized.
   */
  private static ensureRepositoriesInitialized(): void {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database connection not initialized.");
    }
    if (!RegistrationService.registrationRepository) {
      RegistrationService.registrationRepository =
        AppDataSource.getRepository(Registration);
      RegistrationService.eventRepository = AppDataSource.getRepository(Event);
      RegistrationService.userRepository = AppDataSource.getRepository(User);
      RegistrationService.ticketTypeRepository =
        AppDataSource.getRepository(TicketType);
      RegistrationService.venueRepository = AppDataSource.getRepository(Venue);
    }
  }

  /**
   * Creates a new registration record in the database.
   */
  static async createRegistration(
    data: RegistrationRequestInterface
  ): Promise<RegistrationResponseInterface> {
    this.ensureRepositoriesInitialized();

    try {
      // Fetch related entities
      const [event, user, buyer, ticketType, venue] = await Promise.all([
        this.eventRepository.findOne({ where: { eventId: data.eventId } }),
        this.userRepository.findOne({ where: { userId: data.userId } }),
        this.userRepository.findOne({
          where: { userId: data.buyerId as string },
        }),
        this.ticketTypeRepository.findOne({
          where: { ticketTypeId: data.ticketTypeId },
        }),
        this.venueRepository.findOne({ where: { venueId: data.venueId } }),
      ]);

      if (!event || !user || !buyer || !ticketType || !venue) {
        throw new Error(
          "One or more required related entities (Event, User, Buyer, TicketType, Venue) not found during registration creation."
        );
      }

      // Calculate totalCost based on fetched ticketType price
      const totalCost = (data.noOfTickets || 0) * (ticketType.price || 0);

      // Create a new instance of the Registration entity
      const newRegistration = this.registrationRepository.create({
        noOfTickets: data.noOfTickets,
        registrationDate: data.registrationDate
          ? new Date(data.registrationDate)
          : new Date(),
        paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
        qrCode: data.qrCode,
        checkDate: data.checkDate ? new Date(data.checkDate) : undefined,
        attended: data.attended ?? false,
        boughtForIds:
          data.boughtForIds && data.boughtForIds.length > 0
            ? data.boughtForIds
            : [],
        totalCost: totalCost,
        registrationStatus: data.registrationStatus || "active",

        event: event,
        user: user,
        buyer: buyer,
        ticketType: ticketType,
        venue: venue,

        paymentId: data.paymentId,
        invoiceId: data.invoiceId,
      });

      // Save the new registration to the database
      const savedRegistration = await this.registrationRepository.save(
        newRegistration
      );

      // Re-fetch with relations
      const fullyPopulatedRegistration =
        await this.registrationRepository.findOne({
          where: { registrationId: savedRegistration.registrationId },
          relations: [
            "event",
            "user",
            "buyer",
            "ticketType",
            "venue",
            "payment",
            "invoice",
          ],
        });

      if (!fullyPopulatedRegistration) {
        throw new Error(
          "Failed to retrieve fully populated registration after save."
        );
      }

      // Transform to response interface
      const response: RegistrationResponseInterface = {
        registrationId: fullyPopulatedRegistration.registrationId,
        event: {
          eventId: fullyPopulatedRegistration.event.eventId,
          eventTitle: fullyPopulatedRegistration.event.eventTitle,
          description: fullyPopulatedRegistration.event.description,
          eventCategory: fullyPopulatedRegistration.event.eventCategory,
          eventType: fullyPopulatedRegistration.event.eventType,
          organizerId: fullyPopulatedRegistration.event.organizerId,
          venueId: fullyPopulatedRegistration.event.venueId,
          maxAttendees: fullyPopulatedRegistration.event.maxAttendees,
          status: fullyPopulatedRegistration.event.status,
          isFeatured: fullyPopulatedRegistration.event.isFeatured,
          qrCode: fullyPopulatedRegistration.event.qrCode,
        } as EventInterface,
        user: {
          userId: fullyPopulatedRegistration.user.userId,
          username: fullyPopulatedRegistration.user.username,
          firstName: fullyPopulatedRegistration.user.firstName,
          lastName: fullyPopulatedRegistration.user.lastName,
          email: fullyPopulatedRegistration.user.email,
          phoneNumber: fullyPopulatedRegistration.user.phoneNumber,
          createdAt: fullyPopulatedRegistration.user.createdAt?.toISOString(),
          updatedAt: fullyPopulatedRegistration.user.updatedAt?.toISOString(),
          deletedAt:
            fullyPopulatedRegistration.user.deletedAt?.toISOString() ||
            undefined,
        } as UserInterface,
        buyer: {
          userId: fullyPopulatedRegistration.buyer.userId,
          username: fullyPopulatedRegistration.buyer.username,
          firstName: fullyPopulatedRegistration.buyer.firstName,
          lastName: fullyPopulatedRegistration.buyer.lastName,
          email: fullyPopulatedRegistration.buyer.email,
          phoneNumber: fullyPopulatedRegistration.buyer.phoneNumber,
          createdAt: fullyPopulatedRegistration.buyer.createdAt?.toISOString(),
          updatedAt: fullyPopulatedRegistration.buyer.updatedAt?.toISOString(),
          deletedAt:
            fullyPopulatedRegistration.buyer.deletedAt?.toISOString() ||
            undefined,
        } as UserInterface,
        boughtForIds: fullyPopulatedRegistration.boughtForIds || [],
        ticketType: {
          ticketTypeId: fullyPopulatedRegistration.ticketType.ticketTypeId,
          ticketName: fullyPopulatedRegistration.ticketType.ticketName,
          price: fullyPopulatedRegistration.ticketType.price,
          ticketCategory: fullyPopulatedRegistration.ticketType.ticketCategory,
          description: fullyPopulatedRegistration.ticketType.description,
          promoName: fullyPopulatedRegistration.ticketType.promoName,
          promoDescription:
            fullyPopulatedRegistration.ticketType.promoDescription,
          capacity: fullyPopulatedRegistration.ticketType.capacity,
          availableFrom: fullyPopulatedRegistration.ticketType.availableFrom,
          availableUntil: fullyPopulatedRegistration.ticketType.availableUntil,
          isActive: fullyPopulatedRegistration.ticketType.isActive,
          minQuantity: fullyPopulatedRegistration.ticketType.minQuantity,
          maxQuantity: fullyPopulatedRegistration.ticketType.maxQuantity,
          requiresVerification:
            fullyPopulatedRegistration.ticketType.requiresVerification,
          perks: fullyPopulatedRegistration.ticketType.perks,
          createdAt: fullyPopulatedRegistration.ticketType.createdAt,
          updatedAt: fullyPopulatedRegistration.ticketType.updatedAt,
          deletedAt: fullyPopulatedRegistration.ticketType.deletedAt,
        } as TicketTypeInterface,
        venue: {
          venueId: fullyPopulatedRegistration.venue.venueId,
          venueName: fullyPopulatedRegistration.venue.venueName,
          capacity: fullyPopulatedRegistration.venue.capacity,
          location: fullyPopulatedRegistration.venue.location,
          managerId: fullyPopulatedRegistration.venue.managerId,
          isAvailable: fullyPopulatedRegistration.venue.isAvailable,
          isBooked: fullyPopulatedRegistration.venue.isBooked,
          createdAt: fullyPopulatedRegistration.venue.createdAt?.toISOString(),
          updatedAt: fullyPopulatedRegistration.venue.updatedAt?.toISOString(),
          deletedAt:
            fullyPopulatedRegistration.venue.deletedAt?.toISOString() ||
            undefined,
        } as unknown as VenueInterface,
        noOfTickets: fullyPopulatedRegistration.noOfTickets,
        registrationDate:
          fullyPopulatedRegistration.registrationDate.toISOString(),
        paymentStatus:
          fullyPopulatedRegistration.paymentStatus as PaymentStatus,
        qrCode: fullyPopulatedRegistration.qrCode || undefined,
        checkDate: fullyPopulatedRegistration.checkDate
          ? fullyPopulatedRegistration.checkDate.toISOString()
          : undefined,
        attended: fullyPopulatedRegistration.attended,
        totalCost: fullyPopulatedRegistration.totalCost,
        registrationStatus: fullyPopulatedRegistration.registrationStatus,
        payment: fullyPopulatedRegistration.payment
          ? ({
              paymentId: fullyPopulatedRegistration.payment.paymentId,
              invoiceId: fullyPopulatedRegistration.payment.invoiceId,
              paymentDate:
                (fullyPopulatedRegistration.payment ?? {}) instanceof Date
                  ? fullyPopulatedRegistration.payment.paymentDate.toString()
                  : fullyPopulatedRegistration.payment.paymentDate,
              paidAmount: fullyPopulatedRegistration.payment.paidAmount,
              paymentMethod: fullyPopulatedRegistration.payment.paymentMethod,
              paymentStatus: fullyPopulatedRegistration.payment.paymentStatus,
              description: fullyPopulatedRegistration.payment.description,
              createdAt:
                fullyPopulatedRegistration.payment.createdAt?.toISOString(),
              updatedAt:
                fullyPopulatedRegistration.payment.updatedAt?.toISOString(),
              deletedAt:
                fullyPopulatedRegistration.payment.deletedAt?.toISOString() ||
                undefined,
              invoice: undefined,
            } as unknown as PaymentInterface)
          : undefined,

        invoice: fullyPopulatedRegistration.invoice
          ? ({
              invoiceId: fullyPopulatedRegistration.invoice.invoiceId,
              eventId: fullyPopulatedRegistration.invoice.eventId,
              userId: fullyPopulatedRegistration.invoice.userId,
              invoiceDate:
                fullyPopulatedRegistration.invoice.invoiceDate?.toISOString(),
              dueDate:
                fullyPopulatedRegistration.invoice.dueDate?.toISOString(),
              totalAmount: fullyPopulatedRegistration.invoice.totalAmount,
              status: fullyPopulatedRegistration.invoice.status,
              createdAt:
                fullyPopulatedRegistration.invoice.createdAt?.toISOString(),
              updatedAt:
                fullyPopulatedRegistration.invoice.updatedAt?.toISOString(),
              deletedAt: fullyPopulatedRegistration.invoice.deletedAt
                ? fullyPopulatedRegistration.invoice.deletedAt.toISOString()
                : undefined,
            } as unknown as InvoiceInterface)
          : undefined,
        paymentId: fullyPopulatedRegistration.paymentId || undefined,
        invoiceId: fullyPopulatedRegistration.invoiceId || undefined,
        createdAt: fullyPopulatedRegistration.createdAt.toISOString(),
        updatedAt: fullyPopulatedRegistration.updatedAt.toISOString(),
        deletedAt: fullyPopulatedRegistration.deletedAt
          ? fullyPopulatedRegistration.deletedAt.toISOString()
          : undefined,
      };

      return response;
    } catch (error: any) {
      console.error("Error saving registration to database:", error);
      throw new Error(
        `Failed to create registration: ${
          error.message || "An unexpected database error occurred."
        }`
      );
    }
  }

  /**
   * Validates that all referenced IDs in the registration data exist in the database.
   */
  static async validateRegistrationIds(
    registrationData: Partial<RegistrationRequestInterface>
  ): Promise<{
    valid: boolean;
    message?: string;
    errors?: string[];
  }> {
    this.ensureRepositoriesInitialized();

    const errors: string[] = [];
    const { eventId, ticketTypeId, venueId, noOfTickets } = registrationData;
    const userId = registrationData.userId;
    let buyerId = registrationData.buyerId;
    const boughtForIds = registrationData.boughtForIds || [];

    // Basic validation
    if (!eventId) errors.push("Event ID is required.");
    if (!ticketTypeId) errors.push("Ticket Type ID is required.");
    if (!venueId) errors.push("Venue ID is required.");
    if (
      noOfTickets === undefined ||
      typeof noOfTickets !== "number" ||
      noOfTickets <= 0
    ) {
      errors.push("Number of tickets must be a positive number.");
    }
    if (!userId) errors.push("User ID (account owner) is required.");

    // Set default buyerId if not provided
    if (buyerId === null || buyerId === undefined) {
      buyerId = userId;
      registrationData.buyerId = userId;
    }

    if (errors.length > 0) {
      return {
        valid: false,
        message: `Validation failed: ${errors.join(" ")}`,
        errors: errors,
      };
    }

    // Validate existence of IDs in DB
    const [event, user, actualBuyerUser, ticketType, venue] = await Promise.all(
      [
        this.eventRepository.findOne({ where: { eventId } }),
        this.userRepository.findOne({ where: { userId } }),
        this.userRepository.findOne({ where: { userId: buyerId } }),
        this.ticketTypeRepository.findOne({ where: { ticketTypeId } }),
        this.venueRepository.findOne({ where: { venueId } }),
      ]
    );

    if (!event) errors.push(`Event with ID '${eventId}' does not exist.`);
    if (!user)
      errors.push(`User (account owner) with ID '${userId}' does not exist.`);
    if (!actualBuyerUser)
      errors.push(`Buyer with ID '${buyerId}' does not exist.`);
    if (!ticketType)
      errors.push(`Ticket Type with ID '${ticketTypeId}' does not exist.`);
    if (!venue) errors.push(`Venue with ID '${venueId}' does not exist.`);

    if (errors.length > 0) {
      return {
        valid: false,
        message: `Validation failed: ${errors.join(" ")}`,
        errors: errors,
      };
    }

    // Validate ticket logic
    const uniqueBoughtForIds = [...new Set(boughtForIds)];

    // Check for invalid inclusions in boughtForIds
    if (userId && boughtForIds.includes(userId)) {
      errors.push(
        "The account owner (userId) should not be explicitly listed in 'boughtForIds'."
      );
    }
    if (buyerId && boughtForIds.includes(buyerId)) {
      errors.push(
        "The buyer (buyerId) should not be explicitly listed in 'boughtForIds'."
      );
    }

    if (noOfTickets === 1) {
      if (uniqueBoughtForIds.length > 0) {
        errors.push("For a single ticket, 'boughtForIds' array must be empty.");
      }
    } else if (noOfTickets && noOfTickets > 1) {
      if (uniqueBoughtForIds.length !== noOfTickets - 1) {
        errors.push(
          `For ${noOfTickets} tickets, 'boughtForIds' must contain ${
            noOfTickets - 1
          } unique attendee IDs (excluding the buyer). Found: ${
            uniqueBoughtForIds.length
          }.`
        );
      }

      if (uniqueBoughtForIds.length > 0) {
        const existingAttendees = await this.userRepository.find({
          where: { userId: In(uniqueBoughtForIds) },
        });

        if (existingAttendees.length !== uniqueBoughtForIds.length) {
          const foundIds = existingAttendees.map((u) => u.userId);
          const notFound = uniqueBoughtForIds.filter(
            (id) => !foundIds.includes(id)
          );
          errors.push(
            `Attendee User(s) with ID(s) '${notFound.join(
              ", "
            )}' specified in 'boughtForIds' do not exist.`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      message:
        errors.length > 0
          ? `Validation failed: ${errors.join(" ")}`
          : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Checks if a user with the given `userId` exists in the database.
   */
  static async checkUserExists(userId: string): Promise<boolean> {
    this.ensureRepositoriesInitialized();
    try {
      const user = await this.userRepository.findOne({
        where: { userId: userId },
      });
      return !!user;
    } catch (error) {
      console.error(`Error checking if user ${userId} exists:`, error);
      return false;
    }
  }

  /**
   * Validates if there's enough capacity at the venue for the requested number of tickets for an event.
   */
  static async validateEventCapacity(
    eventId: string,
    venueId: string,
    requestedTickets: number
  ): Promise<{ valid: boolean; message?: string }> {
    this.ensureRepositoriesInitialized();
    try {
      const venue = await this.venueRepository.findOne({ where: { venueId } });
      if (!venue) {
        return {
          valid: false,
          message: `Venue with ID '${venueId}' does not exist.`,
        };
      }

      const event = await this.eventRepository.findOne({ where: { eventId } });
      if (!event) {
        return {
          valid: false,
          message: `Event with ID '${eventId}' does not exist.`,
        };
      }

      // Get total tickets sold for this event with 'COMPLETED' payment status
      const totalTicketsSoldResult = await this.registrationRepository
        .createQueryBuilder("registration")
        .select("SUM(registration.noOfTickets)", "sum")
        .where("registration.eventId = :eventId", { eventId })
        .andWhere("registration.paymentStatus = :status", {
          status: PaymentStatus.COMPLETED,
        })
        .getRawOne();

      const ticketsSold = parseInt(totalTicketsSoldResult?.sum || "0", 10);
      const remainingCapacity = venue.capacity - ticketsSold;

      if (requestedTickets > remainingCapacity) {
        return {
          valid: false,
          message: `Not enough capacity. Only ${remainingCapacity} tickets left for event '${event.eventTitle}'.`,
        };
      }

      return { valid: true };
    } catch (error) {
      console.error("Error validating event capacity:", error);
      return {
        valid: false,
        message: "An error occurred while checking event capacity.",
      };
    }
  }

  /**
   * FIXED: Validates if there are duplicate registrations for the given event and attendees.
   * This method now correctly identifies actual attendees based on the business rules.
   */
  static async validateDuplicateRegistration(
    eventId: string,
    primaryUserId: string,
    buyerId: string,
    boughtForIds?: string[]
  ): Promise<{ valid: boolean; message?: string }> {
    this.ensureRepositoriesInitialized();
    try {
      // Determine who will actually be attending this event based on business rules
      const actualAttendees = new Set<string>();

      // Rule: buyerId is always an attendee (they get a ticket)
      actualAttendees.add(buyerId);

      // Rule: boughtForIds are additional attendees (if any)
      if (boughtForIds && boughtForIds.length > 0) {
        boughtForIds.forEach((id) => actualAttendees.add(id));
      }

      // Convert to array for database query
      const attendeeIdsToCheck = Array.from(actualAttendees);

      console.log(`Checking for duplicate registrations for event ${eventId}`);
      console.log(
        `Actual attendees to check: ${attendeeIdsToCheck.join(", ")}`
      );
      console.log(
        `Primary user ID (account owner): ${primaryUserId} - NOT checked for duplicates unless they are an attendee`
      );

      // Query for existing registrations where any of our actual attendees are already registered
      const existingRegistrations = await this.registrationRepository
        .createQueryBuilder("registration")
        .leftJoinAndSelect("registration.user", "user")
        .leftJoinAndSelect("registration.buyer", "buyer")
        .where("registration.eventId = :eventId", { eventId })
        .andWhere(
          // Check if any of our attendees are already registered as:
          // 1. A buyer in another registration
          // 2. Someone in a boughtForIds array in another registration
          "(buyer.userId IN (:...attendeeIds) OR registration.boughtForIds && ARRAY[:...attendeeIds]::uuid[])",
          { attendeeIds: attendeeIdsToCheck }
        )
        // Optionally filter by active registrations only
        .andWhere("registration.registrationStatus IN (:...activeStatuses)", {
          activeStatuses: ["active", "completed"],
        })
        .getMany();

      if (existingRegistrations.length > 0) {
        const duplicatedUserIds: string[] = [];

        existingRegistrations.forEach((reg) => {
          // Check if any of our attendees is the buyer in an existing registration
          if (reg.buyer && attendeeIdsToCheck.includes(reg.buyer.userId)) {
            duplicatedUserIds.push(reg.buyer.userId);
          }

          // Check if any of our attendees is in the boughtForIds of an existing registration
          if (reg.boughtForIds && reg.boughtForIds.length > 0) {
            reg.boughtForIds.forEach((boughtForId) => {
              if (attendeeIdsToCheck.includes(boughtForId)) {
                duplicatedUserIds.push(boughtForId);
              }
            });
          }
        });

        const uniqueDuplicatedUserIds = [...new Set(duplicatedUserIds)];
        if (uniqueDuplicatedUserIds.length > 0) {
          return {
            valid: false,
            message: `The following user(s) are already registered for event ID '${eventId}': ${uniqueDuplicatedUserIds.join(
              ", "
            )}.`,
          };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error("Error validating duplicate registration:", error);
      return {
        valid: false,
        message:
          "An error occurred while checking for duplicate registrations.",
      };
    }
  }

  /**
   * Validates the ticket type and quantity, then calculates the total cost.
   */
  static async validateAndCalculateTicketCost(
    ticketTypeId: string,
    quantity: number
  ): Promise<{
    valid: boolean;
    totalCost?: number;
    ticketType?: TicketType;
    message?: string;
  }> {
    this.ensureRepositoriesInitialized();
    try {
      const ticketType = await this.ticketTypeRepository.findOne({
        where: { ticketTypeId },
      });

      if (!ticketType) {
        return {
          valid: false,
          message: `Ticket Type with ID '${ticketTypeId}' does not exist.`,
        };
      }

      if (quantity <= 0) {
        return { valid: false, message: "Quantity must be a positive number." };
      }

      const totalCost = ticketType.price * quantity;

      return { valid: true, totalCost, ticketType };
    } catch (error) {
      console.error("Error validating ticket cost:", error);
      return {
        valid: false,
        message: "An error occurred while calculating ticket cost.",
      };
    }
  }
}
