from app.utils.response import APIResponse
from app.services.appointment_service import AppointmentService

class AppointmentController:
    
    @staticmethod
    def get_appointments(current_user, params):
        """Get appointments with filters"""
        try:
            result, status_code = AppointmentService.get_appointments(params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def create_appointment(current_user, data):
        """Create a new appointment"""
        try:
            # Get customer_id from user
            customer_id = current_user.id
            result, status_code = AppointmentService.create_appointment(data, customer_id)
            
            if status_code == 201:
                return APIResponse.success(result, 'Appointment created successfully', 201)
            else:
                return APIResponse.error(result['error'], 'CREATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointment(current_user, appointment_id):
        """Get appointment details"""
        try:
            result, status_code = AppointmentService.get_appointment(appointment_id)
            
            if status_code == 200:
                return APIResponse.success(result, 'Appointment details retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'NOT_FOUND', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_appointment(current_user, appointment_id, data):
        """Update appointment"""
        try:
            result, status_code = AppointmentService.update_appointment(appointment_id, data, current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Appointment updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def delete_appointment(current_user, appointment_id):
        """Delete appointment"""
        try:
            # Only admin can delete appointments
            result, status_code = AppointmentService.delete_appointment(appointment_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'DELETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointments_by_date(current_user, params):
        """Get appointments by date"""
        try:
            result, status_code = AppointmentService.get_appointments_by_date(params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointments_by_branch(current_user, branch_id, params):
        """Get appointments by branch"""
        try:
            result, status_code = AppointmentService.get_appointments_by_branch(branch_id, params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointments_by_customer(current_user, customer_id, params):
        """Get appointments by customer"""
        try:
            result, status_code = AppointmentService.get_appointments_by_customer(customer_id, params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointments_by_stylist(current_user, stylist_id, params):
        """Get appointments by stylist"""
        try:
            result, status_code = AppointmentService.get_appointments_by_stylist(stylist_id, params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointments_by_status(current_user, status, params):
        """Get appointments by status"""
        try:
            result, status_code = AppointmentService.get_appointments_by_status(status, params)
            return APIResponse.success(result, 'Appointments retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def update_appointment_status(current_user, appointment_id, data):
        """Update appointment status"""
        try:
            result, status_code = AppointmentService.update_appointment_status(appointment_id, data, current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Appointment status updated successfully')
            else:
                return APIResponse.error(result['error'], 'UPDATE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def cancel_appointment(current_user, appointment_id, data):
        """Cancel appointment"""
        try:
            reason = data.get('reason') if data else None
            result, status_code = AppointmentService.cancel_appointment(appointment_id, current_user, reason)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'CANCEL_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def reschedule_appointment(current_user, appointment_id, data):
        """Reschedule appointment"""
        try:
            result, status_code = AppointmentService.reschedule_appointment(appointment_id, data, current_user)
            
            if status_code == 200:
                return APIResponse.success(result, 'Appointment rescheduled successfully')
            else:
                return APIResponse.error(result['error'], 'RESCHEDULE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def check_in(current_user, appointment_id):
        """Check in customer for appointment"""
        try:
            result, status_code = AppointmentService.check_in(appointment_id, current_user)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'CHECK_IN_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def complete_appointment(current_user, appointment_id):
        """Mark appointment as completed"""
        try:
            result, status_code = AppointmentService.complete_appointment(appointment_id, current_user)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'COMPLETE_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_available_slots(current_user, params):
        """Get available time slots for booking"""
        try:
            result, status_code = AppointmentService.get_available_slots(params)
            
            if status_code == 200:
                return APIResponse.success(result, 'Available slots retrieved successfully')
            else:
                return APIResponse.error(result['error'], 'SLOTS_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def send_reminder(current_user, appointment_id):
        """Send appointment reminder"""
        try:
            result, status_code = AppointmentService.send_reminder(appointment_id)
            
            if status_code == 200:
                return APIResponse.success(None, result['message'])
            else:
                return APIResponse.error(result['error'], 'REMINDER_ERROR', status_code)
                
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_customer_appointment_history(current_user, customer_id, params):
        """Get customer appointment history"""
        try:
            result, status_code = AppointmentService.get_customer_appointment_history(customer_id, params)
            return APIResponse.success(result, 'Appointment history retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def get_appointment_analytics(current_user, params):
        """Get appointment analytics"""
        try:
            result, status_code = AppointmentService.get_appointment_analytics(params)
            return APIResponse.success(result, 'Appointment analytics retrieved successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))
    
    @staticmethod
    def export_appointments(current_user, data):
        """Export appointments to file"""
        try:
            result, status_code = AppointmentService.export_appointments(data)
            return APIResponse.success(result, 'Appointments exported successfully', status_code)
        except Exception as e:
            return APIResponse.server_error(str(e))