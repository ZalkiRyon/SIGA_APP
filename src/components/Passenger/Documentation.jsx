import React, { useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../../styles/global.css';

const panels = [
	{
		title: 'Documentos para menores de edad',
		content: (
			<div className="panel-content">
				<b>Requisitos</b>
				<ul>
					<li>Cédula o pasaporte vigente del menor</li>
					<li>Autorización notarial</li>
				</ul>
				<b>Prohibido</b>
				<ul>
					<li>Fotocopias no certificadas</li>
					<li>Viajar sin acompañante</li>
				</ul>
				<a href="#" className="doc-link">
					Descargar formato de autorización
				</a>
				<br />
				<a href="#" className="doc-link">
					Ver preguntas frecuentes
				</a>
			</div>
		),
	},
	{
		title: 'Salida de vehículos',
		content: (
			<div className="panel-content">
				<b>Requisitos</b>
				<ul>
					<li>Formulario de salida</li>
					<li>Foto de la patente</li>
					<li>Cédula de identidad</li>
					<li>Licencia de conducir</li>
					<li>Comprobante revisión técnica</li>
					<li>Certificado de inscripción de Vehículos Motorizados</li>
					<li>Seguro obligatorio de accidentes personales</li>
				</ul>
				<div className="doc-note">Plazo máximo de 180 días</div>
				<a href="#" className="doc-link">
					Descarga formulario (PDF/Excel)
				</a>
				<br />
				<a href="#" className="doc-link">
					Ver tutorial de llenado
				</a>
			</div>
		),
	},
	{
		title: 'Declaración de productos de origen animal o vegetal',
		content: (
			<div className="panel-content">
				<b>Permitido</b>
				<ul>
					<li>Alimentos sellados comercialmente (lista limitada)</li>
				</ul>
				<b>Prohibido</b>
				<ul>
					<li>
						Frutas frescas, carne sin certificar y productos de origen animal o
						vegetal que no hayan sido procesados
					</li>
				</ul>
				<a href="#" className="doc-link">
					Descarga declaración jurada
				</a>
				<br />
				<a href="#" className="doc-link">
					Consultar lista completa de productos
				</a>
			</div>
		),
	},
	{
		title: 'Declaración de mascotas',
		content: (
			<div className="panel-content">
				<b>Requisito</b>
				<ul>
					<li>Registro nacional de mascotas</li>
					<li>Certificado desparasitación</li>
					<li>Certificado vacunas</li>
					<li>Certificado zoo sanitario de exportación</li>
				</ul>
				<a href="#" className="doc-link">
					Ver preguntas frecuentes
				</a>
			</div>
		),
	},
];

const updates = [
	'Nuevo requisitos para mascotas: Examen de rabia obligatorio',
];

export default function Documentation() {
	const [openPanel, setOpenPanel] = useState(0);
	const { user, logout } = useAuth();

	return (
		<div className="doc-page">
			<Sidebar role="passenger" onLogout={logout} />
			<div className="doc-main" style={{ paddingInlineStart: 32 }}>
				<header className="doc-header">
					<span className="doc-title">Documentación</span>
					<div className="doc-userbar">
						<span className="doc-bell" title="Notificaciones">
							🔔
						</span>
						<span className="doc-username">{user?.nombre || 'Usuario'}</span>
					</div>
				</header>
				<div className="doc-content">
					<div className="doc-accordion">
						{panels.map((panel, idx) => (
							<div key={panel.title}>
								<div
									className={`doc-panel-title${
										openPanel === idx ? ' active' : ''
									}`}
									onClick={() => setOpenPanel(idx)}
									tabIndex={0}
									role="button"
									aria-expanded={openPanel === idx}
									style={{ cursor: 'pointer' }}
								>
									{panel.title}
								</div>
								{openPanel === idx && (
									<div className="doc-panel-body">{panel.content}</div>
								)}
							</div>
						))}
					</div>
					<div className="doc-updates">
						<div className="doc-updates-title">Últimas actualizaciones</div>
						<ul>
							{updates.map((u, i) => (
								<li key={i}>{u}</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

/*
CSS sugerido (agregar en global.css o un archivo dedicado):

.doc-page { display: flex; min-height: 100vh; }
.doc-main { flex: 1; padding: 0 2rem; }
.doc-header { display: flex; justify-content: space-between; align-items: center; margin: 2rem 0 1rem; }
.doc-title { font-size: 2rem; font-weight: 500; border-bottom: 2px solid #222; padding-bottom: 0.2em; }
.doc-userbar { display: flex; align-items: center; gap: 1rem; }
.doc-bell { font-size: 1.3rem; }
.doc-username { font-weight: 400; }
.doc-content { display: flex; gap: 2rem; }
.doc-accordion { flex: 2; min-width: 350px; }
.doc-panel-title { background: #f4f7fa; border: 1px solid #b5c6d6; padding: 0.7em 1em; font-weight: 500; }
.doc-panel-title.active { background: #dbeafe; }
.doc-panel-body { border: 1px solid #b5c6d6; border-top: none; padding: 1em 1.5em; background: #fff; }
.doc-link { color: #1a4fa3; text-decoration: underline; cursor: pointer; }
.doc-note { font-size: 0.95em; color: #555; margin-bottom: 0.5em; }
.doc-updates { flex: 1; min-width: 220px; }
.doc-updates-title { font-weight: 500; margin-bottom: 0.5em; }
.doc-updates ul { background: #f8fafc; border: 1px solid #b5c6d6; padding: 0.7em 1em; list-style: none; margin: 0; }
.doc-updates li { font-size: 0.98em; }
*/
