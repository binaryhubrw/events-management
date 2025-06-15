export class VenueInterface {
  venueId!: string;
  venueName!: string;
  capacity!: number;
  location!: string;
  latitude?: number;
  longitude?: number;
  googleMapsLink?: string;
  managerId?: string;
  isAvailable?: boolean;
  isBooked?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<VenueInterface>) {
    Object.assign(this, {
      venueId: data.venueId || '',
      venueName: data.venueName || '',
      capacity: data.capacity || 0,
      location: data.location || '',
      latitude: data.latitude,
      longitude: data.longitude,
      googleMapsLink: data.googleMapsLink,
      managerId: data.managerId,
      isAvailable: data.isAvailable ?? true,
      isBooked: data.isBooked ?? false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<VenueInterface>): string[] {
    const errors: string[] = [];
    if (!data.venueName) errors.push('venueName is required');
    if (!data.capacity || data.capacity <= 0) errors.push('capacity must be greater than 0');
    if (!data.location) errors.push('location is required');
    return errors;
  }
}