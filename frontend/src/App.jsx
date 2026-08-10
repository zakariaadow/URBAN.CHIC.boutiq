import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';
import StylistLayout from './layouts/StylistLayout';
import ReceptionistLayout from './layouts/ReceptionistLayout';
import FinanceLayout from './layouts/FinanceLayout';
import InventoryLayout from './layouts/InventoryLayout';

// Public Pages
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Services from './pages/Public/Services';
import Gallery from './pages/Public/Gallery';
import Pricing from './pages/Public/Pricing';
import Team from './pages/Public/Team';
import Contact from './pages/Public/Contact';
import Register from './pages/Public/Register';
import Login from './pages/Public/Login';
import ForgotPassword from './pages/Public/ForgotPassword';

// Customer Pages
import CustomerDashboard from './pages/Customer/Dashboard';
import CustomerBookAppointment from './pages/Customer/BookAppointment';
import MyAppointments from './pages/Customer/MyAppointments';
import AppointmentHistory from './pages/Customer/AppointmentHistory';
import Payments from './pages/Customer/Payments';
import Receipts from './pages/Customer/Receipts';
import LoyaltyPoints from './pages/Customer/LoyaltyPoints';
import Reviews from './pages/Customer/Reviews';
import Notifications from './pages/Customer/Notifications';
import Promotions from './pages/Customer/Promotions';
import Profile from './pages/Customer/Profile';
import Settings from './pages/Customer/Settings';
import CustomerFavorites from './pages/Customer/Favorites';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import PendingApprovals from './pages/Admin/PendingApprovals';
import Managers from './pages/Admin/Managers';
import Receptionists from './pages/Admin/Receptionists';
import Stylists from './pages/Admin/Stylists';
import Finance from './pages/Admin/Finance';
import Inventory from './pages/Admin/Inventory';
import Customers from './pages/Admin/Customers';
import Branches from './pages/Admin/Branches';
import ServicesAdmin from './pages/Admin/Services';
import Categories from './pages/Admin/Categories';
import Products from './pages/Admin/Products';
import Prices from './pages/Admin/Prices';
import AdminAppointments from './pages/Admin/Appointments';
import Sales from './pages/Admin/Sales';
import Reports from './pages/Admin/Reports';
import RolesPermissions from './pages/Admin/RolesPermissions';
import BackupRestore from './pages/Admin/BackupRestore';
import SettingsAdmin from './pages/Admin/Settings';
import AdminProfile from './pages/Admin/Profile';
import ExportModal from './pages/Admin/ExportModal';

// Finance Pages
import FinanceDashboard from './pages/Finance/Dashboard';
import FinanceIncome from './pages/Finance/Income';
import FinanceExpenses from './pages/Finance/Expenses';
import FinancePayroll from './pages/Finance/Payroll';
import FinanceCommissions from './pages/Finance/Commissions';
import FinancePayments from './pages/Finance/Payments';
import FinancePaymentHistory from './pages/Finance/PaymentHistory';
import FinanceSales from './pages/Finance/Sales';
import FinanceTax from './pages/Finance/Tax';
import FinanceBudget from './pages/Finance/Budget';
import FinanceReports from './pages/Finance/Reports';
import FinanceProfile from './pages/Finance/Profile';
import FinanceProfitLoss from './pages/Finance/ProfitLoss';
import FinanceDailySales from './pages/Finance/DailySales';
import FinanceExportPDF from './pages/Finance/ExportPDF';
import FinanceExportExcel from './pages/Finance/ExportExcel';
import FinanceNotifications from './pages/Finance/Notifications';

// Receptionist Pages
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import ReceptionistAppointments from './pages/Receptionist/Appointments';
import ReceptionistCheckIn from './pages/Receptionist/CheckIn';
import ReceptionistCustomers from './pages/Receptionist/Customers';
import ReceptionistPayments from './pages/Receptionist/Payments';
import ReceptionistReceipts from './pages/Receptionist/Receipts';
import ReceptionistReminders from './pages/Receptionist/Reminders';
import ReceptionistProfile from './pages/Receptionist/Profile';
import ReceptionistStylists from './pages/Receptionist/Stylists';
import ReceptionistBranches from './pages/Receptionist/Branches';
import ReceptionistNotifications from './pages/Receptionist/Notifications';
import ReceptionistReports from './pages/Receptionist/Reports';

// Inventory Pages
import InventoryDashboard from './pages/Inventory/Dashboard';
import InventoryProducts from './pages/Inventory/Products';
import InventorySuppliers from './pages/Inventory/Suppliers';
import InventoryPurchases from './pages/Inventory/Purchases';
import InventoryStockIn from './pages/Inventory/StockIn';
import InventoryStockOut from './pages/Inventory/StockOut';
import InventoryLowStock from './pages/Inventory/LowStock';
import InventoryExpiredProducts from './pages/Inventory/ExpiredProducts';
import InventoryReports from './pages/Inventory/Reports';
import InventoryProfile from './pages/Inventory/Profile';
import InventoryNotifications from './pages/Inventory/Notifications';

// ============================================================
// ✅ MANAGER PAGES
// ============================================================
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerAppointments from './pages/Manager/Appointments';
import ManagerStaff from './pages/Manager/Staff';
import ManagerSchedules from './pages/Manager/Schedules';
import ManagerAttendance from './pages/Manager/Attendance';
import ManagerPerformance from './pages/Manager/Performance';
import ManagerCustomers from './pages/Manager/Customers';
import ManagerInventoryRequests from './pages/Manager/InventoryRequests';
import ManagerReports from './pages/Manager/Reports';
import ManagerNotifications from './pages/Manager/Notifications';
import ManagerBranches from './pages/Manager/Branches';
import ManagerProfile from './pages/Manager/Profile';

// ============================================================
// ✅ STYLIST PAGES (FULLY IMPLEMENTED)
// ============================================================
import StylistDashboard from './pages/Stylist/Dashboard';
import StylistMyAppointments from './pages/Stylist/MyAppointments';
import StylistSchedule from './pages/Stylist/Schedule';
import StylistEarnings from './pages/Stylist/Earnings';
import StylistCommissions from './pages/Stylist/Commissions';
import StylistPerformance from './pages/Stylist/Performance';
import StylistLeaveRequests from './pages/Stylist/LeaveRequests';
import StylistNotifications from './pages/Stylist/Notifications';
import StylistProfile from './pages/Stylist/Profile';

// Import ProtectedRoute
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="team" element={<Team />} />
          <Route path="contact" element={<Contact />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="book-appointment" element={<CustomerBookAppointment />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="appointments/history" element={<AppointmentHistory />} />
          <Route path="payments" element={<Payments />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="loyalty" element={<LoyaltyPoints />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="favorites" element={<CustomerFavorites />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pending-approvals" element={<PendingApprovals />} />
          <Route path="managers" element={<Managers />} />
          <Route path="receptionists" element={<Receptionists />} />
          <Route path="stylists" element={<Stylists />} />
          <Route path="finance" element={<Finance />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="branches" element={<Branches />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="prices" element={<Prices />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="sales" element={<Sales />} />
          <Route path="reports" element={<Reports />} />
          <Route path="roles-permissions" element={<RolesPermissions />} />
          <Route path="backup-restore" element={<BackupRestore />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="export-modal" element={<ExportModal />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="appointments" element={<ManagerAppointments />} />
          <Route path="staff" element={<ManagerStaff />} />
          <Route path="schedules" element={<ManagerSchedules />} />
          <Route path="attendance" element={<ManagerAttendance />} />
          <Route path="performance" element={<ManagerPerformance />} />
          <Route path="customers" element={<ManagerCustomers />} />
          <Route path="inventory" element={<ManagerInventoryRequests />} />
          <Route path="reports" element={<ManagerReports />} />
          <Route path="notifications" element={<ManagerNotifications />} />
          <Route path="branches" element={<ManagerBranches />} />
          <Route path="profile" element={<ManagerProfile />} />
        </Route>

        {/* ============================================================ */}
        {/* ✅ STYLIST ROUTES (FULLY IMPLEMENTED - NO "COMING SOON") */}
        {/* ============================================================ */}
        <Route path="/stylist" element={
          <ProtectedRoute allowedRoles={['stylist']}>
            <StylistLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/stylist/dashboard" replace />} />
          <Route path="dashboard" element={<StylistDashboard />} />
          <Route path="appointments" element={<StylistMyAppointments />} />
          <Route path="schedule" element={<StylistSchedule />} />
          <Route path="earnings" element={<StylistEarnings />} />
          <Route path="commissions" element={<StylistCommissions />} />
          <Route path="performance" element={<StylistPerformance />} />
          <Route path="leave-requests" element={<StylistLeaveRequests />} />
          <Route path="notifications" element={<StylistNotifications />} />
          <Route path="profile" element={<StylistProfile />} />
        </Route>

        {/* Receptionist Routes */}
        <Route path="/receptionist" element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <ReceptionistLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/receptionist/dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="appointments" element={<ReceptionistAppointments />} />
          <Route path="checkin" element={<ReceptionistCheckIn />} />
          <Route path="customers" element={<ReceptionistCustomers />} />
          <Route path="payments" element={<ReceptionistPayments />} />
          <Route path="receipts" element={<ReceptionistReceipts />} />
          <Route path="reminders" element={<ReceptionistReminders />} />
          <Route path="profile" element={<ReceptionistProfile />} />
          <Route path="stylists" element={<ReceptionistStylists />} />
          <Route path="branches" element={<ReceptionistBranches />} />
          <Route path="notifications" element={<ReceptionistNotifications />} />
          <Route path="reports" element={<ReceptionistReports />} />
        </Route>

        {/* Finance Routes */}
        <Route path="/finance" element={
          <ProtectedRoute allowedRoles={['finance']}>
            <FinanceLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/finance/dashboard" replace />} />
          <Route path="dashboard" element={<FinanceDashboard />} />
          <Route path="income" element={<FinanceIncome />} />
          <Route path="expenses" element={<FinanceExpenses />} />
          <Route path="payroll" element={<FinancePayroll />} />
          <Route path="commissions" element={<FinanceCommissions />} />
          <Route path="payments" element={<FinancePayments />} />
          <Route path="payment-history" element={<FinancePaymentHistory />} />
          <Route path="sales" element={<FinanceSales />} />
          <Route path="tax" element={<FinanceTax />} />
          <Route path="budget" element={<FinanceBudget />} />
          <Route path="reports" element={<FinanceReports />} />
          <Route path="profile" element={<FinanceProfile />} />
          <Route path="profit-loss" element={<FinanceProfitLoss />} />
          <Route path="daily-sales" element={<FinanceDailySales />} />
          <Route path="export-pdf" element={<FinanceExportPDF />} />
          <Route path="export-excel" element={<FinanceExportExcel />} />
          <Route path="notifications" element={<FinanceNotifications />} />
        </Route>

        {/* Inventory Routes */}
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['inventory']}>
            <InventoryLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/inventory/dashboard" replace />} />
          <Route path="dashboard" element={<InventoryDashboard />} />
          <Route path="products" element={<InventoryProducts />} />
          <Route path="suppliers" element={<InventorySuppliers />} />
          <Route path="purchases" element={<InventoryPurchases />} />
          <Route path="stock" element={<InventoryStockIn />} />
          <Route path="stock-out" element={<InventoryStockOut />} />
          <Route path="alerts" element={<InventoryLowStock />} />
          <Route path="expired" element={<InventoryExpiredProducts />} />
          <Route path="reports" element={<InventoryReports />} />
          <Route path="profile" element={<InventoryProfile />} />
          <Route path="notifications" element={<InventoryNotifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;