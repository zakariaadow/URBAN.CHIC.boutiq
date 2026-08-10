from datetime import datetime, timedelta
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from app.extensions import db
from app.models.finance import Finance
from app.models.payment import Payment
from app.models.expense import Expense
from app.models.payroll import Payroll
from app.models.commission import Commission
from app.models.appointment import Appointment
from app.models.branch import Branch
from app.models.user import User
from app.models.receipt import Receipt
from app.models.service import Service
from app.models.appointment_service import AppointmentService as AppointmentServiceModel
from app.services.receipt_service import ReceiptService
import logging
import os

logger = logging.getLogger(__name__)
TAX_RATE = float(os.environ.get('TAX_RATE', 0.16))

class FinanceService:
    
    # ==================== HELPERS ====================
    @staticmethod
    def _get_finance(user_id):
        finance = Finance.query.filter_by(user_id=user_id).first()
        if not finance:
            finance = Finance(user_id=user_id, balance=0.0)
            db.session.add(finance)
            db.session.commit()
        return finance

    @staticmethod
    def _validate_amount(amount):
        try:
            amount = float(amount)
            if amount <= 0:
                return None, {'error': 'Amount must be greater than 0'}, 400
            return amount, None, None
        except (ValueError, TypeError):
            return None, {'error': 'Invalid amount format'}, 400

    @staticmethod
    def _calculate_sales_summary(start_date, end_date):
        payments = Payment.query.filter(
            Payment.payment_status == 'paid',
            Payment.payment_date >= start_date,
            Payment.payment_date < end_date
        ).all()
        total_sales = sum(p.amount for p in payments)
        count = len(payments)
        return {
            'total_sales': total_sales,
            'transaction_count': count,
            'average_transaction': total_sales / count if count > 0 else 0
        }

    # ==================== DASHBOARD ====================
    @staticmethod
    def get_dashboard(current_user):
        """Get finance dashboard data"""
        try:
            finance = FinanceService._get_finance(current_user.id)
            
            today = datetime.utcnow().date()
            month_start = datetime(today.year, today.month, 1).date()
            tomorrow = today + timedelta(days=1)
            
            # Today's revenue
            today_revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                Payment.payment_date >= today,
                Payment.payment_date < tomorrow
            ).scalar() or 0
            
            # Month revenue
            month_revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                Payment.payment_date >= month_start
            ).scalar() or 0
            
            # Month expenses
            month_expenses = db.session.query(db.func.sum(Expense.amount)).filter(
                Expense.expense_date >= month_start,
                Expense.is_approved == True
            ).scalar() or 0
            
            pending_payments = Payment.query.filter_by(payment_status='pending').count()
            pending_payroll = Payroll.query.filter_by(payment_status='pending').count()
            
            return {
                'today_revenue': today_revenue,
                'month_revenue': month_revenue,
                'month_expenses': month_expenses,
                'month_profit': month_revenue - month_expenses,
                'pending_payments': pending_payments,
                'pending_payroll': pending_payroll
            }, 200
            
        except Exception as e:
            logger.exception("Error in get_dashboard")
            return {'error': str(e)}, 500

    @staticmethod
    def get_financial_summary(current_user):
        """Get global financial summary"""
        try:
            today = datetime.utcnow().date()
            month_start = datetime(today.year, today.month, 1).date()
            
            total_revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid'
            ).scalar() or 0
            
            month_revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                Payment.payment_date >= month_start
            ).scalar() or 0
            
            total_expenses = db.session.query(db.func.sum(Expense.amount)).filter(
                Expense.is_approved == True
            ).scalar() or 0
            
            pending_payments = Payment.query.filter_by(payment_status='pending').count()
            
            return {
                'total_revenue': total_revenue,
                'month_revenue': month_revenue,
                'total_expenses': total_expenses,
                'pending_payments': pending_payments,
                'net_profit': total_revenue - total_expenses
            }, 200
        except Exception as e:
            logger.exception("Error in get_financial_summary")
            return {'error': str(e)}, 500

    @staticmethod
    def record_income(current_user, data):
        """Record income"""
        try:
            FinanceService._get_finance(current_user.id)
            return {'message': 'Income recorded through payment system'}, 200
        except Exception as e:
            logger.exception("Error in record_income")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_income(current_user, params):
        """Get income records"""
        try:
            query = Payment.query.filter_by(payment_status='paid')
            
            if params.get('start_date'):
                query = query.filter(Payment.payment_date >= params['start_date'])
            if params.get('end_date'):
                query = query.filter(Payment.payment_date <= params['end_date'])
            
            branch_id = params.get('branch_id')
            if branch_id:
                try:
                    branch_id = int(branch_id)
                    query = query.join(Appointment).filter(Appointment.branch_id == branch_id)
                except (ValueError, TypeError):
                    pass
            
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            
            paginated = query.order_by(Payment.payment_date.desc()).paginate(page=page, per_page=limit, error_out=False)
            
            return {
                'items': [p.to_dict() for p in paginated.items],
                'total': paginated.total,
                'page': page,
                'limit': limit,
                'pages': paginated.pages
            }, 200
            
        except Exception as e:
            logger.exception("Error in get_income")
            return {'error': str(e)}, 500

    @staticmethod
    def get_payment(current_user, payment_id):
        """Get payment details"""
        try:
            payment = db.session.get(Payment, payment_id)
            if not payment:
                return {'error': 'Payment not found'}, 404
            return payment.to_dict(), 200
        except Exception as e:
            logger.exception("Error in get_payment")
            return {'error': str(e)}, 500

    @staticmethod
    def get_payment_history(current_user, params):
        return FinanceService.get_income(current_user, params)
    
    @staticmethod
    def record_expense(current_user, data):
        """Record expense"""
        try:
            finance = FinanceService._get_finance(current_user.id)
            
            amount, error, status = FinanceService._validate_amount(data.get('amount'))
            if error:
                return error, status
            
            expense = Expense(
                finance_id=finance.id,
                branch_id=data.get('branch_id'),
                category=data['category'],
                description=data['description'],
                amount=amount,
                expense_date=data.get('expense_date', datetime.utcnow().date()),
                payment_method=data.get('payment_method'),
                receipt_number=data.get('receipt_number'),
                notes=data.get('notes')
            )
            db.session.add(expense)
            db.session.commit()
            return expense.to_dict(), 201
            
        except Exception as e:
            db.session.rollback()
            logger.exception("Error in record_expense")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_expenses(current_user, params):
        """Get expenses"""
        try:
            query = Expense.query
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            
            if params.get('category'):
                query = query.filter(Expense.category == params['category'])
            
            branch_id = params.get('branch_id')
            if branch_id:
                try:
                    branch_id = int(branch_id)
                    query = query.filter(Expense.branch_id == branch_id)
                except (ValueError, TypeError):
                    pass
            
            if params.get('start_date'):
                query = query.filter(Expense.expense_date >= params['start_date'])
            if params.get('end_date'):
                query = query.filter(Expense.expense_date <= params['end_date'])
            
            approved = params.get('is_approved')
            if approved is not None:
                query = query.filter(Expense.is_approved == (str(approved).lower() == 'true'))
            
            paginated = query.order_by(Expense.expense_date.desc()).paginate(page=page, per_page=limit, error_out=False)
            total = db.session.query(db.func.sum(Expense.amount)).filter(Expense.is_approved == True).scalar() or 0
            
            return {
                'items': [e.to_dict() for e in paginated.items],
                'total': paginated.total,
                'page': page,
                'limit': limit,
                'pages': paginated.pages,
                'summary': {'total_expenses': total}
            }, 200
            
        except Exception as e:
            logger.exception("Error in get_expenses")
            return {'error': str(e)}, 500

    @staticmethod
    def update_expense(current_user, expense_id, data):
        """Update expense"""
        try:
            expense = db.session.get(Expense, expense_id)
            if not expense:
                return {'error': 'Expense not found'}, 404
            if expense.is_approved:
                return {'error': 'Cannot update approved expense'}, 400
            
            allowed_fields = {'description', 'amount', 'category', 'notes', 'payment_method'}
            for key, value in data.items():
                if key in allowed_fields:
                    if key == 'amount':
                        value, error, status = FinanceService._validate_amount(value)
                        if error:
                            return error, status
                    setattr(expense, key, value)
            
            db.session.commit()
            return expense.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            logger.exception("Error in update_expense")
            return {'error': str(e)}, 500

    @staticmethod
    def process_payroll(current_user, data):
        """Process payroll"""
        try:
            finance = FinanceService._get_finance(current_user.id)
            employee_ids = data.get('employee_ids', [])
            pay_period_start = data.get('pay_period_start')
            pay_period_end = data.get('pay_period_end')
            
            if not employee_ids:
                return {'error': 'No employees selected'}, 400
            
            payrolls = []
            for employee_id in employee_ids:
                employee = db.session.get(User, employee_id)
                if not employee:
                    continue
                
                role_name = employee.role.name if employee.role else 'staff'
                payroll = Payroll(
                    finance_id=finance.id,
                    employee_id=employee.id,
                    employee_type=role_name,
                    pay_period_start=pay_period_start,
                    pay_period_end=pay_period_end,
                    base_salary=data.get(f'base_salary_{employee_id}', 0),
                    overtime_hours=data.get(f'overtime_hours_{employee_id}', 0),
                    overtime_pay=data.get(f'overtime_pay_{employee_id}', 0),
                    bonus=data.get(f'bonus_{employee_id}', 0),
                    commission=data.get(f'commission_{employee_id}', 0),
                    allowance=data.get(f'allowance_{employee_id}', 0),
                    deductions=data.get(f'deductions_{employee_id}', 0),
                    tax=data.get(f'tax_{employee_id}', 0),
                    insurance=data.get(f'insurance_{employee_id}', 0),
                    pension=data.get(f'pension_{employee_id}', 0),
                    net_pay=data.get(f'net_pay_{employee_id}', 0),
                    payment_status='pending'
                )
                db.session.add(payroll)
                payrolls.append(payroll)
            
            db.session.commit()
            return {
                'message': f'Payroll processed for {len(payrolls)} employees',
                'payrolls': [p.to_dict() for p in payrolls]
            }, 201
            
        except Exception as e:
            db.session.rollback()
            logger.exception("Error in process_payroll")
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_payroll(current_user, params):
        """Get payroll records"""
        try:
            query = Payroll.query
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            
            if params.get('employee_id'):
                query = query.filter(Payroll.employee_id == params['employee_id'])
            if params.get('payment_status'):
                query = query.filter(Payroll.payment_status == params['payment_status'])
            if params.get('start_date'):
                query = query.filter(Payroll.pay_period_start >= params['start_date'])
            if params.get('end_date'):
                query = query.filter(Payroll.pay_period_end <= params['end_date'])
            
            paginated = query.order_by(Payroll.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
            total_payroll = db.session.query(db.func.sum(Payroll.net_pay)).filter(Payroll.payment_status == 'processed').scalar() or 0
            
            return {
                'items': [p.to_dict() for p in paginated.items],
                'total': paginated.total,
                'page': page,
                'limit': limit,
                'pages': paginated.pages,
                'summary': {'total_payroll': total_payroll}
            }, 200
            
        except Exception as e:
            logger.exception("Error in get_payroll")
            return {'error': str(e)}, 500

    @staticmethod
    def get_staff_payroll(current_user, params):
        return FinanceService.get_payroll(current_user, params)

    @staticmethod
    def get_commissions(current_user, params):
        """Get staff commissions"""
        try:
            query = Commission.query
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            
            if params.get('stylist_id'):
                query = query.filter(Commission.stylist_id == params['stylist_id'])
            
            paid = params.get('is_paid')
            if paid is not None:
                query = query.filter(Commission.is_paid == (str(paid).lower() == 'true'))
            
            if params.get('start_date'):
                query = query.filter(Commission.period_start >= params['start_date'])
            if params.get('end_date'):
                query = query.filter(Commission.period_end <= params['end_date'])
            
            paginated = query.order_by(Commission.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
            total_commission = db.session.query(db.func.sum(Commission.commission_amount)).filter(Commission.is_paid == True).scalar() or 0
            
            return {
                'items': [c.to_dict() for c in paginated.items],
                'total': paginated.total,
                'page': page,
                'limit': limit,
                'pages': paginated.pages,
                'summary': {'total_commission': total_commission}
            }, 200
            
        except Exception as e:
            logger.exception("Error in get_commissions")
            return {'error': str(e)}, 500

    @staticmethod
    def process_commissions(current_user, data):
        """Process staff commissions"""
        try:
            FinanceService._get_finance(current_user.id)
            commission_ids = data.get('commission_ids', [])
            if not commission_ids:
                return {'error': 'No commissions selected'}, 400
            
            commissions = Commission.query.filter(Commission.id.in_(commission_ids), Commission.is_paid == False).all()
            for commission in commissions:
                commission.is_paid = True
                commission.paid_at = datetime.utcnow()
            
            db.session.commit()
            return {
                'message': f'Processed {len(commissions)} commissions',
                'total_amount': sum(c.commission_amount for c in commissions)
            }, 200
            
        except Exception as e:
            db.session.rollback()
            logger.exception("Error in process_commissions")
            return {'error': str(e)}, 500

    # ==================== PAYMENT VERIFICATION ====================
    @staticmethod
    def verify_payment(current_user, payment_id, data=None):
        """Verify a payment"""
        try:
            payment = db.session.get(Payment, payment_id)
            if not payment:
                return {'error': 'Payment not found'}, 404
            
            if payment.payment_status == 'paid':
                return {'error': 'Payment already verified'}, 400
            
            payment.payment_status = 'paid'
            payment.verified_at = datetime.utcnow()
            payment.verified_by = current_user.id
            ReceiptService.create_receipt(payment_id)
            db.session.commit()
            return payment.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            logger.exception("Error in verify_payment")
            return {'error': str(e)}, 500

    @staticmethod
    def get_pending_payments(current_user):
        """Get pending payments for verification"""
        try:
            payments = Payment.query.filter_by(payment_status='pending').order_by(Payment.payment_date.asc()).all()
            return [p.to_dict() for p in payments], 200
        except Exception as e:
            logger.exception("Error in get_pending_payments")
            return {'error': str(e)}, 500

    # ==================== MAIN PAYMENTS LIST ====================
    @staticmethod
    def get_payments(current_user, params):
        """Get all payments with pagination and filters"""
        try:
            query = Payment.query.options(
                joinedload(Payment.appointment),
                joinedload(Payment.customer)
            )
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            
            if params.get('payment_status') and params['payment_status'] not in ['', 'all']:
                query = query.filter(Payment.payment_status == params['payment_status'])
            if params.get('payment_method') and params['payment_method'] not in ['', 'all']:
                query = query.filter(Payment.payment_method == params['payment_method'])
            if params.get('customer_id'):
                query = query.filter(Payment.customer_id == params['customer_id'])
            if params.get('start_date'):
                query = query.filter(Payment.payment_date >= params['start_date'])
            if params.get('end_date'):
                query = query.filter(Payment.payment_date <= params['end_date'])
            
            if params.get('search'):
                search_term = f"%{params['search']}%"
                query = query.filter(
                    or_(
                        Payment.reference_number.ilike(search_term),
                        Payment.receipt_number.ilike(search_term)
                    )
                )
            
            paginated = query.order_by(Payment.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
            
            payments = []
            for payment in paginated.items:
                appointment = payment.appointment
                customer = payment.customer
                customer_name = "Guest"
                customer_email = None
                customer_phone = None
                if customer:
                    customer_name = f"{getattr(customer, 'first_name', '')} {getattr(customer, 'last_name', '')}".strip() or getattr(customer, 'username', 'Guest')
                    customer_email = getattr(customer, 'email', None)
                    customer_phone = getattr(customer, 'phone', None) or getattr(customer, 'phone_number', None)
                
                branch_name = None
                if appointment and appointment.branch:
                    branch_name = appointment.branch.name
                
                payments.append({
                    'id': payment.id,
                    'appointment_id': payment.appointment_id,
                    'customer_id': payment.customer_id,
                    'customer_name': customer_name,
                    'customer_email': customer_email,
                    'customer_phone': customer_phone,
                    'amount': float(payment.amount),
                    'payment_method': payment.payment_method or 'cash',
                    'payment_status': payment.payment_status or 'pending',
                    'payment_date': payment.payment_date.isoformat() if payment.payment_date else None,
                    'reference_number': payment.reference_number,
                    'receipt_number': payment.receipt_number,
                    'branch_name': branch_name,
                    'verified_by': payment.verified_by,
                    'verified_at': payment.verified_at.isoformat() if payment.verified_at else None,
                    'notes': payment.notes,
                    'created_at': payment.created_at.isoformat() if payment.created_at else None,
                    'updated_at': payment.updated_at.isoformat() if payment.updated_at else None
                })
            
            total_amount = db.session.query(db.func.sum(Payment.amount)).filter(Payment.payment_status == 'paid').scalar() or 0
            pending_count = Payment.query.filter_by(payment_status='pending').count()
            
            return {
                'items': payments,
                'total': paginated.total,
                'page': page,
                'limit': limit,
                'pages': paginated.pages,
                'summary': {
                    'total_revenue': float(total_amount),
                    'pending_count': pending_count,
                    'total_count': paginated.total
                }
            }, 200
            
        except Exception as e:
            logger.exception("Error in get_payments")
            return {'error': str(e)}, 500

    # ==================== SALES ====================
    @staticmethod
    def get_sales(current_user, params):
        """Generic sales endpoint acting as a router"""
        try:
            period = params.get('period', 'today')
            if period == 'today':
                return FinanceService.get_daily_sales(current_user, params)
            elif period == 'week':
                return FinanceService.get_weekly_sales(current_user, params)
            elif period == 'month':
                return FinanceService.get_monthly_sales(current_user, params)
            elif period == 'year':
                return FinanceService.get_yearly_sales(current_user, params)
            else:
                return FinanceService.get_daily_sales(current_user, params)
        except Exception as e:
            logger.exception("Error in get_sales")
            return {'error': str(e)}, 500

    @staticmethod
    def get_daily_sales(current_user, params):
        """Get daily sales"""
        try:
            date_str = params.get('date', datetime.utcnow().date().isoformat())
            start_date = datetime.strptime(date_str, '%Y-%m-%d')
            end_date = start_date + timedelta(days=1)
            summary = FinanceService._calculate_sales_summary(start_date, end_date)
            summary['date'] = date_str
            return summary, 200
        except Exception as e:
            logger.exception("Error in get_daily_sales")
            return {'error': str(e)}, 500

    @staticmethod
    def get_monthly_sales(current_user, params):
        """Get monthly sales"""
        try:
            year = int(params.get('year', datetime.utcnow().year))
            month = int(params.get('month', datetime.utcnow().month))
            start_date = datetime(year, month, 1)
            end_date = datetime(year + (month // 12), (month % 12) + 1, 1)
            summary = FinanceService._calculate_sales_summary(start_date, end_date)
            summary.update({'year': year, 'month': month})
            return summary, 200
        except Exception as e:
            logger.exception("Error in get_monthly_sales")
            return {'error': str(e)}, 500

    @staticmethod
    def get_yearly_sales(current_user, params):
        """Get yearly sales"""
        try:
            year = int(params.get('year', datetime.utcnow().year))
            start_date = datetime(year, 1, 1)
            end_date = datetime(year + 1, 1, 1)
            summary = FinanceService._calculate_sales_summary(start_date, end_date)
            summary['year'] = year
            return summary, 200
        except Exception as e:
            logger.exception("Error in get_yearly_sales")
            return {'error': str(e)}, 500

    @staticmethod
    def get_sales_by_service(current_user, params):
        try:
            from app.models.service import Service
            start_date = params.get('start_date', datetime.utcnow().date().isoformat())
            end_date = params.get('end_date', datetime.utcnow().date().isoformat())
            
            results = db.session.query(
                Service.name,
                db.func.count(Appointment.id).label('count'),
                db.func.sum(Appointment.final_amount).label('revenue')
            ).join(Appointment, Appointment.service_id == Service.id)\
             .join(Payment, Payment.appointment_id == Appointment.id)\
             .filter(Payment.payment_status == 'paid', Payment.payment_date >= start_date, Payment.payment_date <= end_date)\
             .group_by(Service.id).all()
            
            return {
                'start_date': start_date,
                'end_date': end_date,
                'items': [{'service_name': r[0], 'count': r[1], 'revenue': r[2] or 0} for r in results]
            }, 200
        except Exception as e:
            logger.exception("Error in get_sales_by_service")
            return {'error': str(e)}, 500

    @staticmethod
    def get_sales_by_branch(current_user, params):
        try:
            start_date = params.get('start_date', datetime.utcnow().date().isoformat())
            end_date = params.get('end_date', datetime.utcnow().date().isoformat())
            
            results = db.session.query(
                Branch.name,
                db.func.count(Appointment.id).label('count'),
                db.func.sum(Appointment.final_amount).label('revenue')
            ).join(Appointment, Appointment.branch_id == Branch.id)\
             .join(Payment, Payment.appointment_id == Appointment.id)\
             .filter(Payment.payment_status == 'paid', Payment.payment_date >= start_date, Payment.payment_date <= end_date)\
             .group_by(Branch.id).all()
            
            return {
                'start_date': start_date,
                'end_date': end_date,
                'items': [{'branch_name': r[0], 'count': r[1], 'revenue': r[2] or 0} for r in results]
            }, 200
        except Exception as e:
            logger.exception("Error in get_sales_by_branch")
            return {'error': str(e)}, 500

    @staticmethod
    def get_weekly_sales(current_user, params):
        try:
            today = datetime.utcnow().date()
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=7)
            payments = Payment.query.filter(
                Payment.payment_status == 'paid',
                Payment.payment_date >= week_start,
                Payment.payment_date < week_end
            ).all()
            return {
                'week_start': week_start.isoformat(),
                'week_end': week_end.isoformat(),
                'total_sales': sum(p.amount for p in payments),
                'transaction_count': len(payments)
            }, 200
        except Exception as e:
            logger.exception("Error in get_weekly_sales")
            return {'error': str(e)}, 500

    @staticmethod
    def get_sales_data(current_user, params):
        try:
            period = params.get('period', 'today')
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 10))
            now = datetime.utcnow().date()
            query = Payment.query.filter_by(payment_status='paid')
            
            branch_id = params.get('branch_id')
            if branch_id:
                try:
                    branch_id = int(branch_id)
                    query = query.join(Appointment).filter(Appointment.branch_id == branch_id)
                except (ValueError, TypeError):
                    pass
            
            if period == 'today':
                start_date = now
                end_date = now + timedelta(days=1)
            elif period == 'week':
                start_date = now - timedelta(days=now.weekday())
                end_date = start_date + timedelta(days=7)
            elif period == 'month':
                start_date = now.replace(day=1)
                end_date = datetime(now.year + (now.month // 12), (now.month % 12) + 1, 1).date()
            elif period == 'year':
                start_date = now.replace(month=1, day=1)
                end_date = now.replace(year=now.year+1, month=1, day=1)
            else:
                start_date = now
                end_date = now + timedelta(days=1)
            
            query = query.filter(Payment.payment_date >= start_date, Payment.payment_date < end_date)
            paginated = query.order_by(Payment.payment_date.desc()).paginate(page=page, per_page=limit, error_out=False)
            total_sales = db.session.query(db.func.sum(Payment.amount)).filter(Payment.payment_status == 'paid').scalar() or 0
            
            return {
                'items': [p.to_dict() for p in paginated.items],
                'total': paginated.total,
                'page': page,
                'limit': limit,
                'pages': paginated.pages,
                'summary': {'total_sales': float(total_sales)}
            }, 200
        except Exception as e:
            logger.exception("Error in get_sales_data")
            return {'error': str(e)}, 500

    # ==================== PROFIT & LOSS ====================
    @staticmethod
    def get_profit_loss(current_user, params):
        try:
            start_date = params.get('start_date', datetime.utcnow().date().isoformat())
            end_date = params.get('end_date', datetime.utcnow().date().isoformat())
            
            revenue = db.session.query(db.func.sum(Payment.amount)).filter(
                Payment.payment_status == 'paid',
                Payment.payment_date >= start_date,
                Payment.payment_date <= end_date
            ).scalar() or 0
            
            expenses = db.session.query(db.func.sum(Expense.amount)).filter(
                Expense.is_approved == True,
                Expense.expense_date >= start_date,
                Expense.expense_date <= end_date
            ).scalar() or 0
            
            payroll = db.session.query(db.func.sum(Payroll.net_pay)).filter(
                Payroll.payment_status == 'processed',
                Payroll.created_at >= start_date,
                Payroll.created_at <= end_date
            ).scalar() or 0
            
            return {
                'start_date': start_date,
                'end_date': end_date,
                'revenue': revenue,
                'expenses': expenses,
                'payroll': payroll,
                'profit': revenue - expenses - payroll,
                'profit_margin': ((revenue - expenses - payroll) / revenue * 100) if revenue > 0 else 0
            }, 200
        except Exception as e:
            logger.exception("Error in get_profit_loss")
            return {'error': str(e)}, 500

    # ==================== TAX ====================
    @staticmethod
    def get_tax(current_user, params):
        """Get tax data"""
        try:
            period = params.get('period', 'month')
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 10))
            now = datetime.utcnow().date()
            query = Payment.query.filter_by(payment_status='paid')
            
            if period == 'month':
                start_date = now.replace(day=1)
                end_date = datetime(now.year + (now.month // 12), (now.month % 12) + 1, 1).date()
            elif period == 'quarter':
                quarter = (now.month - 1) // 3
                start_date = now.replace(month=quarter*3+1, day=1)
                end_date = datetime(now.year + (quarter // 4), ((quarter % 4) + 1) * 3 + 1, 1).date()
            elif period == 'year':
                start_date = now.replace(month=1, day=1)
                end_date = now.replace(year=now.year+1, month=1, day=1)
            else:
                start_date = now.replace(day=1)
                end_date = datetime(now.year + (now.month // 12), (now.month % 12) + 1, 1).date()
            
            paginated = query.filter(Payment.payment_date >= start_date, Payment.payment_date < end_date).order_by(Payment.payment_date.desc()).paginate(page=page, per_page=limit, error_out=False)
            total_revenue = db.session.query(db.func.sum(Payment.amount)).filter(Payment.payment_status == 'paid').scalar() or 0
            
            return {
                'items': [p.to_dict() for p in paginated.items],
                'total': paginated.total,
                'page': page,
                'limit': limit,
                'pages': paginated.pages,
                'summary': {
                    'total_revenue': float(total_revenue),
                    'tax_rate': TAX_RATE,
                    'total_tax': float(total_revenue * TAX_RATE)
                }
            }, 200
        except Exception as e:
            logger.exception("Error in get_tax")
            return {'error': str(e)}, 500

    @staticmethod
    def get_tax_reports(current_user, params):
        """Get tax reports"""
        try:
            return FinanceService.get_tax(current_user, params)
        except Exception as e:
            logger.exception("Error in get_tax_reports")
            return {'error': str(e)}, 500

    @staticmethod
    def calculate_tax(current_user, data):
        try:
            amount, error, status = FinanceService._validate_amount(data.get('amount'))
            if error:
                return error, status
            tax = amount * TAX_RATE
            return {'amount': amount, 'tax_rate': TAX_RATE, 'tax': tax, 'total': amount + tax}, 200
        except Exception as e:
            logger.exception("Error in calculate_tax")
            return {'error': str(e)}, 500

    # ==================== BUDGET ====================
    @staticmethod
    def get_budget(current_user, params):
        try:
            period = params.get('period', 'month')
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 10))
            now = datetime.utcnow().date()
            
            revenue_query = Payment.query.filter_by(payment_status='paid')
            expense_query = Expense.query.filter_by(is_approved=True)
            
            if period == 'month':
                start_date = now.replace(day=1)
                end_date = datetime(now.year + (now.month // 12), (now.month % 12) + 1, 1).date()
            elif period == 'year':
                start_date = now.replace(month=1, day=1)
                end_date = now.replace(year=now.year+1, month=1, day=1)
            else:
                start_date = now.replace(day=1)
                end_date = datetime(now.year + (now.month // 12), (now.month % 12) + 1, 1).date()
                
            revenue_query = revenue_query.filter(Payment.payment_date >= start_date, Payment.payment_date < end_date)
            expense_query = expense_query.filter(Expense.expense_date >= start_date, Expense.expense_date < end_date)
            
            payments = revenue_query.all()
            expenses = expense_query.all()
            
            total_revenue = sum(p.amount for p in payments)
            total_expenses = sum(e.amount for e in expenses)
            
            return {
                'summary': {
                    'total_revenue': float(total_revenue),
                    'total_expenses': float(total_expenses),
                    'net_profit': float(total_revenue - total_expenses)
                },
                'items': [p.to_dict() for p in payments[:limit]],
                'total': len(payments),
                'page': page,
                'limit': limit,
                'pages': (len(payments) + limit - 1) // limit
            }, 200
        except Exception as e:
            logger.exception("Error in get_budget")
            return {'error': str(e)}, 500

    # ==================== RECEIPTS WITH LOGO ====================
    @staticmethod
    def generate_receipt(current_user, payment_id):
        """Generate receipt for a payment"""
        try:
            result, status = ReceiptService.create_receipt(payment_id)
            if status == 201:
                return result, 201
            return {'error': 'Failed to generate receipt'}, status
        except Exception as e:
            logger.exception("Error in generate_receipt")
            return {'error': str(e)}, 500

    @staticmethod
    def generate_receipt_with_logo(current_user, payment_id):
        """Generate receipt with logo for a payment"""
        try:
            # First create the receipt
            result, status = ReceiptService.create_receipt(payment_id)
            if status != 201:
                return result, status
            
            # Get the receipt
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            # Generate PDF with logo
            pdf_data = ReceiptService.generate_receipt_pdf(receipt.id)
            if pdf_data:
                return {
                    'receipt': receipt.to_dict(),
                    'message': 'Receipt with logo generated successfully'
                }, 200
            
            return {'error': 'Failed to generate receipt with logo'}, 500
        except Exception as e:
            logger.exception("Error in generate_receipt_with_logo")
            return {'error': str(e)}, 500

    @staticmethod
    def get_receipt(current_user, receipt_id):
        """Get receipt by ID"""
        try:
            receipt = db.session.get(Receipt, receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            return receipt.to_dict(), 200
        except Exception as e:
            logger.exception("Error in get_receipt")
            return {'error': str(e)}, 500

    @staticmethod
    def get_receipt_by_payment(current_user, payment_id):
        """Get receipt by payment ID"""
        try:
            receipt = Receipt.query.filter_by(payment_id=payment_id).first()
            if not receipt:
                return {'error': 'Receipt not found for this payment'}, 404
            return receipt.to_dict(), 200
        except Exception as e:
            logger.exception("Error in get_receipt_by_payment")
            return {'error': str(e)}, 500

    @staticmethod
    def download_receipt(current_user, receipt_id):
        """Download receipt PDF with logo"""
        try:
            receipt = db.session.get(Receipt, receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            # Check if receipt has multiple services
            appointment = Appointment.query.get(receipt.appointment_id)
            if appointment:
                # Get all services for this appointment
                appointment_services = AppointmentServiceModel.query.filter_by(
                    appointment_id=appointment.id
                ).all()
                
                if appointment_services:
                    # Update receipt items with all services
                    items = []
                    total = 0
                    for appt_service in appointment_services:
                        service = Service.query.get(appt_service.service_id)
                        if service:
                            items.append({
                                'name': service.name,
                                'price': float(appt_service.price or service.price),
                                'quantity': 1
                            })
                            total += float(appt_service.price or service.price)
                    
                    if items:
                        receipt.items = items
                        receipt.total = total
                        receipt.subtotal = total
                        db.session.commit()
            
            # Generate PDF with logo
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if pdf_data:
                return pdf_data, 200
            return {'error': 'Failed to generate PDF'}, 500
        except Exception as e:
            logger.exception("Error in download_receipt")
            return {'error': str(e)}, 500

    @staticmethod
    def preview_receipt(current_user, receipt_id):
        """Preview receipt PDF with logo (inline display)"""
        try:
            receipt = db.session.get(Receipt, receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            # Generate PDF with logo
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if pdf_data:
                return pdf_data, 200
            return {'error': 'Failed to generate PDF'}, 500
        except Exception as e:
            logger.exception("Error in preview_receipt")
            return {'error': str(e)}, 500

    @staticmethod
    def send_receipt(current_user, receipt_id, data):
        """Send receipt via email or SMS with logo"""
        try:
            receipt = db.session.get(Receipt, receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            # Check if receipt has multiple services
            appointment = Appointment.query.get(receipt.appointment_id)
            if appointment:
                # Get all services for this appointment
                appointment_services = AppointmentServiceModel.query.filter_by(
                    appointment_id=appointment.id
                ).all()
                
                if appointment_services:
                    # Update receipt items with all services
                    items = []
                    total = 0
                    for appt_service in appointment_services:
                        service = Service.query.get(appt_service.service_id)
                        if service:
                            items.append({
                                'name': service.name,
                                'price': float(appt_service.price or service.price),
                                'quantity': 1
                            })
                            total += float(appt_service.price or service.price)
                    
                    if items:
                        receipt.items = items
                        receipt.total = total
                        receipt.subtotal = total
                        db.session.commit()
            
            method = data.get('method', 'email')
            
            # Generate PDF with logo before sending
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if pdf_data:
                # Send receipt
                result, status = ReceiptService.send_receipt(receipt_id, method)
                return result, status
            
            return {'error': 'Failed to generate receipt PDF'}, 500
        except Exception as e:
            logger.exception("Error in send_receipt")
            return {'error': str(e)}, 500

    @staticmethod
    def send_receipt_email(current_user, receipt_id, email):
        """Send receipt via email with logo as PDF attachment"""
        try:
            receipt = db.session.get(Receipt, receipt_id)
            if not receipt:
                return {'error': 'Receipt not found'}, 404
            
            # Generate PDF with logo
            pdf_data = ReceiptService.generate_receipt_pdf(receipt_id)
            if not pdf_data:
                return {'error': 'Failed to generate PDF'}, 500
            
            # Here you would implement actual email sending with PDF attachment
            # For now, just mark as sent
            receipt.is_emailed = True
            receipt.sent_at = datetime.utcnow()
            receipt.sent_via = 'email'
            db.session.commit()
            
            return {'message': f'Receipt with logo sent to {email}'}, 200
        except Exception as e:
            logger.exception("Error in send_receipt_email")
            return {'error': str(e)}, 500

    # ==================== BRANCHES ====================
    @staticmethod
    def get_branches(current_user, params):
        try:
            branches = Branch.query.filter_by(is_active=True).all()
            return [b.to_dict() for b in branches], 200
        except Exception as e:
            logger.exception("Error in get_branches")
            return {'error': str(e)}, 500

    # ==================== NOTIFICATIONS ====================
    @staticmethod
    def get_notifications(current_user, params):
        try:
            from app.models.notification import Notification
            page = int(params.get('page', 1))
            limit = int(params.get('limit', 20))
            
            query = Notification.query.filter_by(user_id=current_user.id)
            
            read_status = params.get('is_read')
            if read_status is not None:
                query = query.filter(Notification.is_read == (str(read_status).lower() == 'true'))
            if params.get('type'):
                query = query.filter(Notification.type == params['type'])
            
            paginated = query.order_by(Notification.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
            
            return {
                'items': [n.to_dict() for n in paginated.items],
                'total': paginated.total,
                'page': page,
                'limit': limit,
                'pages': paginated.pages
            }, 200
        except Exception as e:
            logger.exception("Error in get_notifications")
            return {'error': str(e)}, 500

    # ==================== PROFILE ====================
    @staticmethod
    def get_profile(current_user):
        try:
            finance = FinanceService._get_finance(current_user.id)
            return finance.to_dict(), 200
        except Exception as e:
            logger.exception("Error in get_profile")
            return {'error': str(e)}, 500

    # ==================== PLACEHOLDERS ====================
    @staticmethod
    def get_balance_sheet(current_user, params):
        return {'message': 'Balance sheet coming soon'}, 200

    @staticmethod
    def get_cash_flow(current_user, params):
        return {'message': 'Cash flow statement coming soon'}, 200

    @staticmethod
    def export_report(current_user, data):
        return {'message': 'Report export coming soon'}, 200

    @staticmethod
    def set_budget(current_user, data):
        return {'message': 'Budget set'}, 200

    @staticmethod
    def update_budget(current_user, budget_id, data):
        return {'message': 'Budget updated'}, 200