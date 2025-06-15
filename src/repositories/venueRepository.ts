import { AppDataSource } from "../config/Database";
import { VenueInterface } from "../interfaces/VenueInterface"; // Assuming this interface exists and matches your Venue entity
import { User } from "../models/User";
import { Venue } from "../models/Venue";
import { Between, LessThanOrEqual, MoreThanOrEqual, IsNull, Not } from "typeorm"; // Import for more advanced queries
import { VenueBooking } from "../models/VenueBooking";

export class VenueRepository {
    // --- Existing CRUD Functions ---

    // Create venue
    static create(data: Partial<VenueInterface>): { success: boolean; data?: Venue; message?: string } {
        if (!data.capacity || !data.location || !data.venueName) {
            return { success: false, message: "All fields are required" };
        }

        const venue = new Venue();
        venue.venueName = data.venueName ?? "";
        venue.isBooked = data.isBooked ?? false;
        venue.capacity = data.capacity ?? 0;
        venue.isAvailable = data.isAvailable ?? true;
        venue.location = data.location ?? "";
        // Only assign managerId if provided, otherwise leave it undefined or null (as per nullable: true in entity)
        venue.managerId = data.managerId;
        // Assign latitude, longitude, googleMapsLink if they exist in data
        venue.latitude = data.latitude;
        venue.longitude = data.longitude;
        venue.googleMapsLink = data.googleMapsLink;


        return { success: true, data: venue };
    }

    // Save venue
    static async save(venue: Venue): Promise<{ success: boolean; data?: Venue; message?: string }> {
        if (!venue.capacity || !venue.venueName || !venue.location) {
            return { success: false, message: "All required fields (capacity, venueName, location) must be provided." };
        }

        try {
            // Check if venue already exists by name AND location to prevent duplicates
            const existingVenue = await AppDataSource.getRepository(Venue).findOne({
                where: { venueName: venue.venueName, location: venue.location },
            });

            if (existingVenue && existingVenue.venueId !== venue.venueId) { // Allow updating existing venue
                return { success: false, message: "A venue with this name and location already exists.", data: existingVenue };
            }

            const savedVenue = await AppDataSource.getRepository(Venue).save(venue);
            return { success: true, data: savedVenue, message: "Venue saved successfully" };
        } catch (error:any) {
            console.error("Error saving venue:", error);
            return { success: false, message: `Failed to save venue: ${error.message || "Unknown error"}` };
        }
    }

    // Get venue by ID
    static async getById(id: string): Promise<{ success: boolean; data?: Venue; message?: string }> {
        if (!id) {
            return { success: false, message: "Venue ID is required" };
        }

        try {
            const venue = await AppDataSource.getRepository(Venue).findOne({
                where: { venueId: id },
                relations: ["manager", "manager.role"], // Eager load manager and their role
            });

            if (!venue) {
                return { success: false, message: "Venue not found" };
            }

            return { success: true, data: venue };
        } catch (error:any) {
            console.error("Error fetching venue by ID:", error);
            return { success: false, message: `Failed to fetch venue by ID: ${error.message || "Unknown error"}` };
        }
    }

    // Get all venues
    static async getAll(): Promise<{ success: boolean; data?: Venue[]; message?: string }> {
        try {
            const venues = await AppDataSource.getRepository(Venue).find({
                relations: ["manager", "manager.role"], // Eager load manager and their role for all venues
            });
            return { success: true, data: venues };
        } catch (error:any) {
            console.error("Error fetching all venues:", error);
            return { success: false, message: `Failed to fetch all venues: ${error.message || "Unknown error"}` };
        }
    }

    // Get venue by manager ID
    static async getByManagerId(managerId: string): Promise<{ success: boolean; data?: Venue[]; message?: string }> {
        if (!managerId) {
            return { success: false, message: "Manager ID is required" };
        }

        try {
            const venues = await AppDataSource.getRepository(Venue).find({
                where: { manager: { userId: managerId } },
                relations: ["manager", "manager.role"],
            });

            if (venues.length === 0) {
                return { success: false, message: "No venues found for this manager" };
            }

            return { success: true, data: venues };
        } catch (error:any) {
            console.error("Error fetching venues by manager ID:", error);
            return { success: false, message: `Failed to fetch venues by manager ID: ${error.message || "Unknown error"}` };
        }
    }

    // Update venue
    static async update(
        id: string,
        data: Partial<VenueInterface>
    ): Promise<{ success: boolean; data?: Venue; message?: string }> {
        if (!id) {
            return { success: false, message: "Venue ID is required" };
        }

        try {
            const repo = AppDataSource.getRepository(Venue);
            const venue = await repo.findOne({ where: { venueId: id } });

            if (!venue) {
                return { success: false, message: "Venue not found" };
            }

            // Check for duplicate name/location if they are being updated
            if ((data.venueName && data.venueName !== venue.venueName) || (data.location && data.location !== venue.location)) {
                const existingVenue = await repo.findOne({
                    where: { venueName: data.venueName, location: data.location },
                });
                if (existingVenue && existingVenue.venueId !== id) {
                    return { success: false, message: "Another venue with the same name and location already exists." };
                }
            }


            repo.merge(venue, data); // Merging directly with data handles all partial updates more cleanly

            const updatedVenue = await repo.save(venue);
            return { success: true, data: updatedVenue, message: "Venue updated successfully" };
        } catch (error:any) {
            console.error("Error updating venue:", error);
            return { success: false, message: `Failed to update venue: ${error.message || "Unknown error"}` };
        }
    }

    // Update venue manager
    static async updateVenueManager(
        venueId: string,
        managerId: string
    ): Promise<{ success: boolean; data?: Venue; message?: string }> {
        if (!venueId || !managerId) {
            return { success: false, message: "Both venueId and managerId are required" };
        }

        try {
            const venueRepo = AppDataSource.getRepository(Venue);
            const userRepo = AppDataSource.getRepository(User);

            const venue = await venueRepo.findOne({ where: { venueId }, relations: ["manager"] });

            if (!venue) {
                return { success: false, message: "Venue not found" };
            }

            const manager = await userRepo.findOne({ where: { userId: managerId }, relations: ["role"] });

            if (!manager) {
                return { success: false, message: "Manager user not found" };
            }

            // It's good practice to normalize role names (e.g., to lowercase) for comparison
            if (manager.role?.roleName?.toLowerCase() !== "venue_manager") { // Use optional chaining for roleName
                return { success: false, message: "User is not a venue manager" };
            }

            // Assign new manager by linking the entity and setting the ID
            venue.manager = manager;
            venue.managerId = manager.userId; // Ensure managerId is explicitly set for persistence

            const updatedVenue = await venueRepo.save(venue);
            return { success: true, data: updatedVenue, message: "Venue manager updated successfully" };
        } catch (error:any) {
            console.error("Error updating venue manager:", error);
            return { success: false, message: `Failed to update venue manager: ${error.message || "Unknown error"}` };
        }
    }

    // Delete venue (soft delete)
    static async delete(id: string): Promise<{ success: boolean; message?: string }> {
        if (!id) {
            return { success: false, message: "Venue ID is required" };
        }

        try {
            const venueRepo = AppDataSource.getRepository(Venue);
            const venue = await venueRepo.findOne({ where: { venueId: id } });

            if (!venue) {
                return { success: false, message: "Venue not found" };
            }

            await venueRepo.softRemove(venue); // Use softRemove for DeleteDateColumn
            return { success: true, message: "Venue soft-deleted successfully" };
        } catch (error:any) {
            console.error("Error soft-deleting venue:", error);
            return { success: false, message: `Failed to soft-delete venue: ${error.message || "Unknown error"}` };
        }
    }

  
    static async checkVenueAvailability(
        venueId: string,
        startDate: Date,
        endDate: Date
    ): Promise<{ success: boolean; available?: boolean; message?: string }> {
        if (!venueId || !startDate || !endDate) {
            return { success: false, message: "Venue ID, start date, and end date are required." };
        }

        try {
            const venue = await AppDataSource.getRepository(Venue).findOne({ where: { venueId: venueId } });
            if (!venue) {
                return { success: false, message: "Venue not found." };
            }
            if (!venue.isAvailable) {
                return { success: true, available: false, message: "Venue is generally not available." };
            }

            // Check for overlapping bookings
            const conflictingBookings = await AppDataSource.getRepository(VenueBooking).find({
                where: {
                    venue: { venueId: venueId },
                    // Logic to check for overlaps:
                    // (booking_start <= end_date AND booking_end >= start_date)
                    startDate: LessThanOrEqual(endDate),
                    endDate: MoreThanOrEqual(startDate),
                },
            });

            if (conflictingBookings.length > 0) {
                return { success: true, available: false, message: "Venue is booked for the requested period." };
            }

            return { success: true, available: true, message: "Venue is available for the requested period." };
        } catch (errora:any) {
            console.error("Error checking venue availability:", errora);
            return { success: false, message: `Failed to check venue availability: ${errora.message || "Unknown error"}` };
        }
    }
  
    static async setVenueGeneralAvailability(
        venueId: string,
        status: boolean
    ): Promise<{ success: boolean; data?: Venue; message?: string }> {
        if (!venueId) {
            return { success: false, message: "Venue ID is required." };
        }

        try {
            const repo = AppDataSource.getRepository(Venue);
            const venue = await repo.findOne({ where: { venueId } });

            if (!venue) {
                return { success: false, message: "Venue not found." };
            }

            venue.isAvailable = status;
            await repo.save(venue);
            return { success: true, data: venue, message: `Venue general availability set to ${status}.` };
        } catch (error:any) {
            console.error("Error setting venue general availability:", error);
            return { success: false, message: `Failed to set venue general availability: ${error.message || "Unknown error"}` };
        }
    }

    static async searchVenues(
        criteria: {
            name?: string;
            location?: string;
            minCapacity?: number;
            maxCapacity?: number;
            isAvailable?: boolean;
            hasManager?: boolean; // New criterion to find venues with/without a manager
        }
    ): Promise<{ success: boolean; data?: Venue[]; message?: string }> {
        try {
            const queryBuilder = AppDataSource.getRepository(Venue).createQueryBuilder("venue");
            queryBuilder.leftJoinAndSelect("venue.manager", "manager"); // Eager load manager
            queryBuilder.leftJoinAndSelect("manager.role", "role"); // Eager load manager's role

            if (criteria.name) {
                queryBuilder.andWhere("LOWER(venue.venueName) LIKE LOWER(:name)", { name: `%${criteria.name}%` });
            }
            if (criteria.location) {
                queryBuilder.andWhere("LOWER(venue.location) LIKE LOWER(:location)", { location: `%${criteria.location}%` });
            }
            if (criteria.minCapacity) {
                queryBuilder.andWhere("venue.capacity >= :minCapacity", { minCapacity: criteria.minCapacity });
            }
            if (criteria.maxCapacity) {
                queryBuilder.andWhere("venue.capacity <= :maxCapacity", { maxCapacity: criteria.maxCapacity });
            }
            if (typeof criteria.isAvailable === 'boolean') {
                queryBuilder.andWhere("venue.isAvailable = :isAvailable", { isAvailable: criteria.isAvailable });
            }
            if (typeof criteria.hasManager === 'boolean') {
                if (criteria.hasManager) {
                    queryBuilder.andWhere("venue.managerId IS NOT NULL");
                } else {
                    queryBuilder.andWhere("venue.managerId IS NULL");
                }
            }
            // Add soft delete filter by default
            queryBuilder.andWhere("venue.deletedAt IS NULL");


            const venues = await queryBuilder.getMany();
            return { success: true, data: venues };
        } catch (errora:any) {
            console.error("Error searching venues:", errora);
            return { success: false, message: `Failed to search venues: ${errora.message || "Unknown error"}` };
        }
    }
 
    static async getVenueCount(): Promise<{ success: boolean; count?: number; message?: string }> {
        try {
            const count = await AppDataSource.getRepository(Venue).count({
                where: { deletedAt: IsNull() } // Count only non-soft-deleted venues
            });
            return { success: true, count: count };
        } catch (error:any) {
            console.error("Error getting venue count:", error);
            return { success: false, message: `Failed to get venue count: ${error.message || "Unknown error"}` };
        }
    }
 
    static async removeVenueManager(
        venueId: string
    ): Promise<{ success: boolean; data?: Venue; message?: string }> {
        if (!venueId) {
            return { success: false, message: "Venue ID is required." };
        }

        try {
            const repo = AppDataSource.getRepository(Venue);
            const venue = await repo.findOne({ where: { venueId } });

            if (!venue) {
                return { success: false, message: "Venue not found." };
            }

            venue.manager = undefined; // Set the relation to undefined
            venue.managerId = undefined; // Also explicitly set the foreign key to null

            const updatedVenue = await repo.save(venue);
            return { success: true, data: updatedVenue, message: "Venue manager removed successfully." };
        } catch (error:any) {
            console.error("Error removing venue manager:", error);
            return { success: false, message: `Failed to remove venue manager: ${error.message || "Unknown error"}` };
        }
    }
}

