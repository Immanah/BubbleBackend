import { 
  users, type User, type InsertUser,
  affirmations, type Affirmation, type InsertAffirmation,
  reminders, type Reminder, type InsertReminder
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Affirmation methods
  getAffirmations(userId: number): Promise<Affirmation[]>;
  createAffirmation(affirmation: InsertAffirmation): Promise<Affirmation>;
  updateAffirmation(id: number, data: Partial<InsertAffirmation>): Promise<Affirmation>;
  deleteAffirmation(id: number): Promise<void>;
  
  // Reminder methods
  getReminders(userId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, data: Partial<InsertReminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private affirmations: Map<number, Affirmation>;
  private reminders: Map<number, Reminder>;
  private userId: number;
  private affirmationId: number;
  private reminderId: number;

  constructor() {
    this.users = new Map();
    this.affirmations = new Map();
    this.reminders = new Map();
    this.userId = 1;
    this.affirmationId = 1;
    this.reminderId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      email: insertUser.email || null,
      authProvider: insertUser.authProvider || null,
      avatarUrl: insertUser.avatarUrl || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Affirmation methods
  async getAffirmations(userId: number): Promise<Affirmation[]> {
    return Array.from(this.affirmations.values()).filter(
      (affirmation) => affirmation.userId === userId
    );
  }
  
  async createAffirmation(affirmation: InsertAffirmation): Promise<Affirmation> {
    const id = this.affirmationId++;
    const createdAt = new Date();
    const newAffirmation: Affirmation = { 
      ...affirmation, 
      id, 
      createdAt,
      reminderTime: affirmation.reminderTime || null,
      isActive: affirmation.isActive !== undefined ? affirmation.isActive : true
    };
    this.affirmations.set(id, newAffirmation);
    return newAffirmation;
  }
  
  async updateAffirmation(id: number, data: Partial<InsertAffirmation>): Promise<Affirmation> {
    const affirmation = this.affirmations.get(id);
    
    if (!affirmation) {
      throw new Error(`Affirmation with ID ${id} not found`);
    }
    
    const updatedAffirmation: Affirmation = { ...affirmation, ...data };
    this.affirmations.set(id, updatedAffirmation);
    
    return updatedAffirmation;
  }
  
  async deleteAffirmation(id: number): Promise<void> {
    if (!this.affirmations.has(id)) {
      throw new Error(`Affirmation with ID ${id} not found`);
    }
    
    this.affirmations.delete(id);
  }
  
  // Reminder methods
  async getReminders(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.userId === userId
    );
  }
  
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderId++;
    const createdAt = new Date();
    const newReminder: Reminder = { 
      ...reminder, 
      id, 
      createdAt,
      description: reminder.description || null,
      isComplete: reminder.isComplete !== undefined ? reminder.isComplete : false
    };
    this.reminders.set(id, newReminder);
    return newReminder;
  }
  
  async updateReminder(id: number, data: Partial<InsertReminder>): Promise<Reminder> {
    const reminder = this.reminders.get(id);
    
    if (!reminder) {
      throw new Error(`Reminder with ID ${id} not found`);
    }
    
    const updatedReminder: Reminder = { ...reminder, ...data };
    this.reminders.set(id, updatedReminder);
    
    return updatedReminder;
  }
  
  async deleteReminder(id: number): Promise<void> {
    if (!this.reminders.has(id)) {
      throw new Error(`Reminder with ID ${id} not found`);
    }
    
    this.reminders.delete(id);
  }
}

export const storage = new MemStorage();
