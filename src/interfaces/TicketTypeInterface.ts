import { TicketCategory } from './Enums/TicketCategoryEnum';

export class TicketTypeInterface {
  ticketTypeId!: string;
  ticketName!: string;
  price!: number;
  ticketCategory!: TicketCategory;
  description?: string;
  promoName?: string;
  promoDescription?: string;
  capacity?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  isActive?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  requiresVerification?: boolean;
  perks?: string[];
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<TicketTypeInterface>) {
    Object.assign(this, {
      ticketTypeId: data.ticketTypeId || '',
      ticketName: data.ticketName || '',
      price: data.price || 0,
      ticketCategory: data.ticketCategory || TicketCategory.REGULAR,
      description: data.description,
      promoName: data.promoName,
      promoDescription: data.promoDescription,
      capacity: data.capacity,
      availableFrom: data.availableFrom,
      availableUntil: data.availableUntil,
      isActive: data.isActive ?? true,
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      requiresVerification: data.requiresVerification ?? false,
      perks: data.perks,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<TicketTypeInterface>): string[] {
    const errors: string[] = [];
    if (!data.ticketName) errors.push('ticketName is required');
    if (!data.price || data.price < 0) errors.push('price must be non-negative');
    if (!Object.values(TicketCategory).includes(data.ticketCategory!)) {
      errors.push(`ticketCategory must be one of ${Object.values(TicketCategory).join(', ')}`);
    }
    return errors;
  }

  static toRequest(data: TicketTypeInterface): TicketTypeRequestInterface {
    return new TicketTypeRequestInterface({
      ticketTypeId: data.ticketTypeId,
      ticketName: data.ticketName,
      price: data.price,
      ticketCategory: data.ticketCategory,
      description: data.description,
      promoName: data.promoName,
      promoDescription: data.promoDescription,
      capacity: data.capacity,
      availableFrom: data.availableFrom,
      availableUntil: data.availableUntil,
      isActive: data.isActive,
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      requiresVerification: data.requiresVerification,
      perks: data.perks,
    });
  }

  static toResponse(data: TicketTypeInterface): TicketTypeResponseInterface {
    return new TicketTypeResponseInterface({
      ticketTypeId: data.ticketTypeId,
      ticketName: data.ticketName,
      price: data.price,
      ticketCategory: data.ticketCategory,
      description: data.description,
      promoName: data.promoName,
      promoDescription: data.promoDescription,
      capacity: data.capacity,
      availableFrom: data.availableFrom?.toISOString(),
      availableUntil: data.availableUntil?.toISOString(),
      isActive: data.isActive,
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      requiresVerification: data.requiresVerification,
      perks: data.perks,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      deletedAt: data.deletedAt?.toISOString(),
    });
  }
}

export class TicketTypeRequestInterface {
  ticketTypeId?: string;
  ticketName!: string;
  price!: number;
  ticketCategory!: TicketCategory;
  description?: string;
  promoName?: string;
  promoDescription?: string;
  capacity?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  isActive?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  requiresVerification?: boolean;
  perks?: string[];

  constructor(data: Partial<TicketTypeRequestInterface>) {
    Object.assign(this, {
      ticketTypeId: data.ticketTypeId,
      ticketName: data.ticketName || '',
      price: data.price || 0,
      ticketCategory: data.ticketCategory || TicketCategory.REGULAR,
      description: data.description,
      promoName: data.promoName,
      promoDescription: data.promoDescription,
      capacity: data.capacity,
      availableFrom: data.availableFrom,
      availableUntil: data.availableUntil,
      isActive: data.isActive,
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      requiresVerification: data.requiresVerification,
      perks: data.perks,
    });
  }

  static toEntity(data: TicketTypeRequestInterface): TicketTypeInterface {
    return new TicketTypeInterface({
      ticketTypeId: data.ticketTypeId,
      ticketName: data.ticketName,
      price: data.price,
      ticketCategory: data.ticketCategory,
      description: data.description,
      promoName: data.promoName,
      promoDescription: data.promoDescription,
      capacity: data.capacity,
      availableFrom: data.availableFrom,
      availableUntil: data.availableUntil,
      isActive: data.isActive ?? true,
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      requiresVerification: data.requiresVerification ?? false,
      perks: data.perks,
    });
  }
}

export class TicketTypeResponseInterface {
  ticketTypeId!: string;
  ticketName!: string;
  price!: number;
  ticketCategory!: TicketCategory;
  description?: string;
  promoName?: string;
  promoDescription?: string;
  capacity?: number;
  availableFrom?: string;
  availableUntil?: string;
  isActive?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  requiresVerification?: boolean;
  perks?: string[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;

  constructor(data: Partial<TicketTypeResponseInterface>) {
    Object.assign(this, {
      ticketTypeId: data.ticketTypeId || '',
      ticketName: data.ticketName || '',
      price: data.price || 0,
      ticketCategory: data.ticketCategory || TicketCategory.REGULAR,
      description: data.description,
      promoName: data.promoName,
      promoDescription: data.promoDescription,
      capacity: data.capacity,
      availableFrom: data.availableFrom,
      availableUntil: data.availableUntil,
      isActive: data.isActive,
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      requiresVerification: data.requiresVerification,
      perks: data.perks,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    });
  }

  static fromEntity(data: TicketTypeInterface): TicketTypeResponseInterface {
    return new TicketTypeResponseInterface({
      ticketTypeId: data.ticketTypeId,
      ticketName: data.ticketName,
      price: data.price,
      ticketCategory: data.ticketCategory,
      description: data.description,
      promoName: data.promoName,
      promoDescription: data.promoDescription,
      capacity: data.capacity,
      availableFrom: data.availableFrom?.toISOString(),
      availableUntil: data.availableUntil?.toISOString(),
      isActive: data.isActive,
      minQuantity: data.minQuantity,
      maxQuantity: data.maxQuantity,
      requiresVerification: data.requiresVerification,
      perks: data.perks,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      deletedAt: data.deletedAt?.toISOString(),
    });
  }
}