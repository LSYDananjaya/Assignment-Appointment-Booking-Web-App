export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  slot_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  time_slot: TimeSlot;
  user: User;
}