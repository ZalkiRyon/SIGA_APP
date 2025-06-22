import { Routes, Route, Navigate } from 'react-router-dom';
import PassengerDashboard from '../components/Passenger/Dashboard';
import MyProcedures from '../components/Passenger/MyProcedures';
import Help from '../components/Passenger/Help';
import Documentation from '../components/Passenger/Documentation';
import NewProcedureType from '../components/Passenger/NewProcedureType';
import NewVehicleProcedure from '../components/Passenger/NewVehicleProcedure';
import NewMinorProcedure from '../components/Passenger/NewMinorProcedure';
import NewFoodPetProcedure from '../components/Passenger/NewFoodPetProcedure';
import EditVehicleProcedure from '../components/Passenger/EditVehicleProcedure';
import EditMinorProcedure from '../components/Passenger/EditMinorProcedure';
import EditFoodPetProcedure from '../components/Passenger/EditFoodPetProcedure';

// Rutas para Pasajero/Turista
export default function PassengerRoutes({ user }) {
  return (
    <Routes>
      <Route path="/passenger" element={<PassengerDashboard user={user} />} />
      <Route path="/passenger/mis-tramites" element={<MyProcedures />} />
      <Route path="/passenger/ayuda" element={<Help />} />
      <Route path="/passenger/documentacion" element={<Documentation />} />
      <Route path="/passenger/tramite/nuevo" element={<NewProcedureType />} />
      <Route path="/passenger/tramite/vehiculo" element={<NewVehicleProcedure />} />
      <Route path="/passenger/tramite/menores" element={<NewMinorProcedure />} />
      <Route path="/passenger/tramite/alimentos" element={<NewFoodPetProcedure />} />
      <Route path="/passenger/tramite/vehiculo/edit/:id" element={<EditVehicleProcedure />} />
      <Route path="/passenger/tramite/menores/edit/:id" element={<EditMinorProcedure />} />
      <Route path="/passenger/tramite/alimentos/edit/:id" element={<EditFoodPetProcedure />} />
      <Route path="*" element={<Navigate to="/passenger" replace />} />
    </Routes>
  );
}
