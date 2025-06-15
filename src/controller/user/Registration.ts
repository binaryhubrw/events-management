import { Request, Response } from "express";
import { UserRepository } from "../../repositories/UserRepository";
import { AppDataSource } from "../../config/Database";
import { User } from "../../models/User";
import PasswordService from "../../services/emails/EmailService";
import { Organization } from "../../models/Organization";
import { Role } from "../../models/Role";
import bcrypt from "bcryptjs";

export class UserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, firstName, lastName, email, phoneNumber,password,confirmPassword } = req.body;
      console.log("Registering user with data in controller:", req.body);

      // === Validation Checks ===
      if (!username || username.length < 3 || username.length > 50) {
        res
          .status(400)
          .json({
            success: false,
            message: "Username must be between 3 and 50 characters",
          });
        return;
      }

      if (!firstName || firstName.length < 1 || firstName.length > 50) {
        res
          .status(400)
          .json({
            success: false,
            message: "First name must be between 1 and 50 characters",
          });
        return;
      }

      if (!lastName || lastName.length < 1 || lastName.length > 50) {
        res
          .status(400)
          .json({
            success: false,
            message: "Last name must be between 1 and 50 characters",
          });
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res
          .status(400)
          .json({
            success: false,
            message: "Email must be a valid email address",
          });
        return;
      }

      if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
        res
          .status(400)
          .json({
            success: false,
            message: "Phone number must be a valid phone number",
          });
        return;
      }
      // === Password Validation but be optional ===
      if (password && password.length < 6) {
        res
          .status(400)
          .json({
            success: false,
            message: "Password must be at least 6 characters long",
          });
        return;
      }
      if (password && password !== confirmPassword) {
        res
          .status(400)
          .json({
            success: false,
            message: "Passwords do not match",
          });
        return;
      }
      //password should be hashed before saving to the database,and regex validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
      if (password && !passwordRegex.test(password)) {
        res
          .status(400)
          .json({
            success: false,
            message:
              "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
          });
        return;
      }
      //hashing password it with salt by bcryptjs
       const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;



      // === Check for Existing User ===
   
      const existingUser = await UserRepository.findExistingUser(
        email,
        username
      );
      if (existingUser) {
        res
          .status(400)
          .json({ success: false, message: "User already exists" });
        return;
      }

      // === Assign Default Role ===
      const roleRepository = AppDataSource.getRepository(Role);
      const guestRole = await roleRepository.findOne({
        where: { roleName: "GUEST" },
      });

      if (!guestRole) {
        res
          .status(500)
          .json({
            success: false,
            message: "Default GUEST role not found. Please initialize roles.",
          });
        return;
      }

      const user = UserRepository.createUser({
        username: username,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        //password is optional, if not provided
        password: hashedPassword, // Use the hashed password
        // Set a default password or generate one dynamically
       role: {
  roleId: guestRole.roleId,
  roleName: guestRole.roleName,
  permissions: guestRole.permissions || [],
  createdAt: guestRole.createdAt ? new Date(guestRole.createdAt) : new Date(),
  updatedAt: guestRole.updatedAt ? new Date(guestRole.updatedAt) : new Date(),
}, // Map Role to RoleInterface
      });

      const result = await UserRepository.saveUser(user);

      if (!result.user) {
        res
          .status(400)
          .json({
            success: false,
            message: result.message || "Failed to save user",
          });
        return;
      }

      const savedUser = result.user;

      // === Send Default Password Email ===
      try {
        const emailSent = await PasswordService.sendDefaultPassword(
          email,
          savedUser.lastName,
          savedUser.firstName,
          savedUser.username,
          req
        );

        if (!emailSent) {
          console.warn(
            `Failed to send email to ${email}, but user was created successfully`
          );
          // Continue with registration despite email failure
        }
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Continue with registration despite email failure
      }

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. If email is configured correctly, a default password was sent.",
        user: {
          id: savedUser.userId,
          username: savedUser.username,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          phoneNumber: savedUser.phoneNumber,

          Role: {
            RoleID: guestRole.roleId,
            RoleName: guestRole.roleName,
            Permissions: guestRole.permissions || [],
          }, // Map Role to RoleInterface
        },
      });
    } catch (error) {
      console.error("Error in register:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: "User profile retrieved" });
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  }

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserRepository.getAllUsers();

      if (!users || users.length === 0) {
        res.status(404).json({ success: false, message: "No users found" });
        return;
      }

      const formattedUsers = users.map((user) => ({
        userId: user?.userId,
        username: user?.username,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        Role: user?.role
          ? {
              RoleID: user.role.roleId,
              RoleName: user.role.roleName,
              Permissions: user.role.permissions || [],
            }
          : null,
        organizations:
          user?.organizations?.map((organization: Organization) => ({
            OrganizationID: organization.organizationId,
            OrganizationName: organization.organizationName,
            Description: organization.description || "",
            ContactEmail: organization.contactEmail,
            ContactPhone: organization.contactPhone || "",
            Address: organization.address || "",
            OrganizationType: organization.organizationType || "",
          })) || [],
      }));

      res.status(200).json({ success: true, users: formattedUsers });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserRepository.getUserById(req.params.id);

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const formattedUser = {
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        Role: user.role
          ? {
              RoleID: user.role.roleId,
              RoleName: user.role.roleName,
              Permissions: user.role.permissions || [],
            }
          : null,
        organizations:
          user?.organizations?.map((organization: Organization) => ({
            OrganizationID: organization.organizationId,
            OrganizationName: organization.organizationName,
            Description: organization.description || "",
            ContactEmail: organization.contactEmail,
            ContactPhone: organization.contactPhone || "",
            Address: organization.address || "",
            OrganizationType: organization.organizationType || "",
          })) || [],
          //get registration data from user which looks like this
          /*
          */
          registrations: user.registrations?.map((registration) => ({
            registrationIds:{
              registrationId: registration.registrationId,
              registrationDate: registration.registrationDate,
              paymentStatus: registration.paymentStatus,
              attended: registration.attended,
            },
     
            eventId:{
              eventId: registration.event.eventId,
              eventTitle: registration.event.eventTitle,
              description: registration.event.description,
              eventCategory: registration.event.eventCategory,
              eventType: registration.event.eventType,
            },
            
            // Handle both array and single object cases for ticketType
            ticketType: Array.isArray(registration.ticketType)
              ? (registration.ticketType as any[]).map((ticket) => ({
                  ticketTypeId: ticket.ticketTypeId,
                  ticketTypeName: ticket.ticketName,
                  price: ticket.price,
                  description: ticket.description,
                }))
              : registration.ticketType && typeof registration.ticketType === 'object'
                ? [{
                    ticketTypeId: (registration.ticketType as any).ticketTypeId,
                    ticketTypeName: (registration.ticketType as any).ticketName,
                    price: (registration.ticketType as any).price,
                    description: (registration.ticketType as any).description,
                  }]
                : [],

          
            eventName: {
              eventId: registration.event.eventId,
              eventTitle: registration.event.eventTitle,
              description: registration.event.description,
              eventCategory: registration.event.eventCategory,
              eventType: registration.event.eventType,
            },
            
            venueName: {
              venueId: registration.venue.venueId,
              venueName: registration.venue.venueName,
              capacity: registration.venue.capacity,
              location: registration.venue.location,
              managerId: registration.venue.managerId,
              isAvailable: registration.venue.isAvailable,
              isBooked: registration.venue.isBooked,
            },
            noOfTickets: registration.noOfTickets,
            qrcode: registration.qrCode,
            registrationDate: registration.registrationDate,
            paymentStatus: registration.paymentStatus,
            attended: registration.attended,
          
          })) || [],
          
      };
      res.status(200).json({ success: true, user: formattedUser });
    } catch (error) {
      console.error("Error in getUserById:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const userRepository = AppDataSource.getRepository(User);
  
      const user = await userRepository.findOne({
        where: { userId },
        relations: ["role", "organizations"], // Include related entities
      });
  
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
  
      const { username, firstName, lastName, email, phoneNumber } = req.body;
  
      // Update user fields if they exist in the request
      if (username) user.username = username;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;
  
      const updatedUser = await userRepository.save(user);
  
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: {
          userId: updatedUser.userId,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          Role: updatedUser.role
            ? {
                RoleID: updatedUser.role.roleId,
                RoleName: updatedUser.role.roleName,
                Permissions: updatedUser.role.permissions || [],
              }
            : null,
          organizations: updatedUser.organizations?.map((organization: Organization) => ({
            OrganizationID: organization.organizationId,
            OrganizationName: organization.organizationName,
            Description: organization.description || "",
            ContactEmail: organization.contactEmail,
            ContactPhone: organization.contactPhone || "",
            Address: organization.address || "",
            OrganizationType: organization.organizationType || "",
          })) || [],
        },
      });
    } catch (error) {
      console.error("Error in updateUser:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
  

  static async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    try {
      const result = await UserRepository.deleteUser(id);

      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        res.status(404).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error in deleteUser:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async updateDefaultUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.body;

      // Validate input
      if (!userId || !roleId) {
        res.status(400).json({ message: "User ID and Role ID are required" });
        return;
      }

      // Call the repository function to assign the new role
      const result = await UserRepository.assignUserRole(userId, roleId);

      // Handle the response from the repository
      if (result.message === "User role updated successfully") {
        res.status(200).json({ message: result.message,data: result });
      } else if (
        result.message === "User not found" ||
        result.message === "Role not found" ||
        result.message === "User is not currently assigned the GUEST role"
      ) {
        res.status(400).json({ message: result.message });
      } else {
        res.status(500).json({ message: "Failed to assign user role" });
      }
    } catch (error) {
      console.error("Error in updateUserRole:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateAssignedUserRole(req: Request, res: Response): Promise<void> {
    try {
      // Get userId from URL parameters
      const { userId } = req.params;
  
      // Get roleId from request body
      const { roleId } = req.body;
  
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'userId is required in the URL parameters',
        });
        return;
      }
  
      if (!roleId) {
        res.status(400).json({
          success: false,
          message: 'roleId is required in the request body',
        });
        return;
      }
  
      // Call the repository method
      const result = await UserRepository.updateUserRole(userId, roleId);
  
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          user: {
            userId: result.user?.userId,
            username: result.user?.username,
            email: result.user?.email,
            role: {
              roleId: result.newRole?.roleId,
              roleName: result.newRole?.roleName
            }
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Error in updateUserRole controller:', error);
  
      res.status(500).json({
        success: false,
        message: 'Internal server error occurred while updating user role',
      });
    }
  }

}
