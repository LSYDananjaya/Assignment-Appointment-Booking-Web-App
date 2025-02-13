import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase-types';

type TimeSlot = Database['public']['Tables']['time_slots']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

interface AppointmentState {
  slots: TimeSlot[];
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchSlots: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  bookAppointment: (slotId: string, notes?: string) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  slots: [],
  appointments: [],
  loading: false,
  error: null,

  fetchSlots: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      set({ slots: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          time_slots (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ appointments: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  bookAppointment: async (slotId: string, notes?: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          slot_id: slotId,
          notes,
          status: 'confirmed'
        });

      if (error) throw error;
      await get().fetchAppointments();
      await get().fetchSlots();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  cancelAppointment: async (appointmentId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;
      await get().fetchAppointments();
      await get().fetchSlots();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));