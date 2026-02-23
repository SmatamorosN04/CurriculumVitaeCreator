import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Download,
  CheckCircle2,
  Lightbulb,
  Save,
  Share2
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface Skill {
  id: string;
  name: string;
  level: string;
  category: "Técnica" | "Blanda";
}

interface Language {
  id: string;
  name: string;
  level: string;
  certificate?: string;
}

interface Training {
  id: string;
  title: string;
  center: string;
  date: string;
}

interface Reference {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  company?: string;
}

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    idNumber: string;
    maritalStatus: string;
    birthDate: string;
    photo?: string;
    linkedin?: string;
    website?: string;
  };
  professionalProfile: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  additionalTraining: Training[];
  otherInterests: {
    availability: string;
    mobility: boolean;
    license: string;
    other: string;
  };
  references: Reference[];
  design: {
    fontPairing: "arial-times" | "calibri-cambria" | "lato-roboto";
  };
}

// Constants
const JOB_TITLES_BY_SECTOR = {
  Administración: [
    "Asistente Administrativo",
    "Contador Público",
    "Auxiliar Contable",
    "Recepcionista",
    "Gerente de Operaciones",
  ],
  Ventas: [
    "Asesor de Ventas",
    "Ejecutivo de Cuentas",
    "Cajero/a",
    "Supervisor de Ventas",
    "Gerente de Tienda",
  ],
  Tecnología: [
    "Desarrollador de Software",
    "Soporte Técnico IT",
    "Administrador de Redes",
    "Analista de Datos",
  ],
  "Construcción e Ingeniería": [
    "Ingeniero Civil",
    "Arquitecto",
    "Maestro de Obra",
    "Ingeniero Industrial",
  ],
  Servicios: [
    "Agente de Servicio al Cliente",
    "Mesero/a",
    "Cocinero/a",
    "Conductor Profesional",
  ],
};

const SKILL_SUGGESTIONS = {
  Técnicas: [
    "Microsoft Excel (Avanzado)",
    "Manejo de SAP",
    "Contabilidad General",
    "Gestión de Inventarios",
    "Marketing Digital",
  ],
  Blandas: [
    "Trabajo en Equipo",
    "Liderazgo de Personal",
    "Comunicación Asertiva",
    "Resolución de Conflictos",
    "Adaptabilidad al Cambio",
  ],
  Idiomas: [
    "Español (Nativo)",
    "Inglés (B2 - Intermedio)",
    "Inglés (C1 - Avanzado)",
  ],
};

const STEPS = [
  { id: "personal", title: "Datos Personales", icon: User },
  { id: "profile", title: "Perfil", icon: FileText },
  { id: "experience", title: "Experiencia", icon: Briefcase },
  { id: "education", title: "Educación", icon: GraduationCap },
  { id: "skills", title: "Habilidades", icon: Wrench },
  { id: "additional", title: "Otros Datos", icon: Plus },
  { id: "references", title: "Referencias", icon: Users },
  { id: "preview", title: "Vista Previa", icon: CheckCircle2 },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [cvId, setCvId] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, reset } = useForm<CVData>({
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        idNumber: "",
        maritalStatus: "Soltero/a",
        birthDate: "",
        photo: "",
        linkedin: "",
        website: "",
      },
      professionalProfile: "",
      experience: [],
      education: [],
      skills: [],
      languages: [],
      additionalTraining: [],
      otherInterests: {
        availability: "",
        mobility: false,
        license: "",
        other: "",
      },
      references: [],
      design: {
        fontPairing: "arial-times",
      }
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: "skills" });
  const { fields: trainingFields, append: appendTraining, remove: removeTraining } = useFieldArray({ control, name: "additionalTraining" });
  const { fields: refFields, append: appendRef, remove: removeRef } = useFieldArray({ control, name: "references" });

  const cvData = watch();

  // Load CV from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setCvId(id);
      fetch(`/api/cvs/${id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            reset(data);
          }
        })
        .catch(err => console.error("Error loading CV:", err));
    } else {
      // Generate a new ID if none exists
      const newId = crypto.randomUUID();
      setCvId(newId);
      window.history.replaceState({}, "", `?id=${newId}`);
    }
  }, [reset]);

  const handleSave = async () => {
    if (!cvId) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cvId, data: cvData }),
      });
      if (response.ok) {
        alert("¡Currículum guardado exitosamente!");
      }
    } catch (error) {
      console.error("Error saving CV:", error);
      alert("Error al guardar el currículum.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("personalInfo.photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "personal":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500">
                  {cvData.personalInfo.photo ? (
                    <img src={cvData.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-zinc-300" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <p className="text-[10px] text-zinc-400 mt-2 text-center uppercase font-bold tracking-wider">Subir Foto Profesional</p>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Nombre Completo</label>
                  <input 
                    {...register("personalInfo.fullName")}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Cédula de Identidad</label>
                  <input 
                    {...register("personalInfo.idNumber")}
                    placeholder="001-010101-0001A"
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Correo Electrónico</label>
                <input 
                  {...register("personalInfo.email")}
                  type="email"
                  placeholder="juan.perez@ejemplo.com"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Teléfono</label>
                <input 
                  {...register("personalInfo.phone")}
                  placeholder="+505 8888-8888"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">LinkedIn (URL)</label>
                <input 
                  {...register("personalInfo.linkedin")}
                  placeholder="linkedin.com/in/usuario"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Sitio Web / Portfolio (URL)</label>
                <input 
                  {...register("personalInfo.website")}
                  placeholder="mipagina.com"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-zinc-700">Dirección Domiciliar</label>
                <input 
                  {...register("personalInfo.address")}
                  placeholder="Managua, Nicaragua"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Estado Civil</label>
                <select 
                  {...register("personalInfo.maritalStatus")}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                >
                  <option>Soltero/a</option>
                  <option>Casado/a</option>
                  <option>Unión Libre</option>
                  <option>Divorciado/a</option>
                  <option>Viudo/a</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Fecha de Nacimiento</label>
                <input 
                  {...register("personalInfo.birthDate")}
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Perfil Profesional</label>
              <p className="text-xs text-zinc-500 mb-2 italic">Describe brevemente tus fortalezas, años de experiencia y objetivos.</p>
              <textarea 
                {...register("professionalProfile")}
                rows={6}
                placeholder="Profesional con más de 5 años de experiencia en..."
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        );
      case "experience":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-800">Historial Laboral</h3>
              <button 
                type="button"
                onClick={() => appendExp({ id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", current: false, description: "" })}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus size={16} /> Agregar Experiencia
              </button>
            </div>
            
            {expFields.map((field, index) => (
              <div key={field.id} className="p-6 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-4 relative">
                <button 
                  type="button"
                  onClick={() => removeExp(index)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Empresa</label>
                    <input 
                      {...register(`experience.${index}.company`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cargo</label>
                    <input 
                      {...register(`experience.${index}.position`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha Inicio</label>
                    <input 
                      {...register(`experience.${index}.startDate`)}
                      type="month"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha Fin</label>
                    <input 
                      {...register(`experience.${index}.endDate`)}
                      type="month"
                      disabled={watch(`experience.${index}.current`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <input 
                      type="checkbox"
                      {...register(`experience.${index}.current`)}
                      className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                    />
                    <label className="text-sm text-zinc-600">Trabajo actual</label>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descripción de Funciones</label>
                    <textarea 
                      {...register(`experience.${index}.description`)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case "education":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-800">Formación Académica</h3>
              <button 
                type="button"
                onClick={() => appendEdu({ id: crypto.randomUUID(), school: "", degree: "", startDate: "", endDate: "", current: false })}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus size={16} /> Agregar Educación
              </button>
            </div>
            
            {eduFields.map((field, index) => (
              <div key={field.id} className="p-6 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-4 relative">
                <button 
                  type="button"
                  onClick={() => removeEdu(index)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Institución</label>
                    <input 
                      {...register(`education.${index}.school`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Título / Grado</label>
                    <input 
                      {...register(`education.${index}.degree`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha Inicio</label>
                    <input 
                      {...register(`education.${index}.startDate`)}
                      type="month"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha Fin</label>
                    <input 
                      {...register(`education.${index}.endDate`)}
                      type="month"
                      disabled={watch(`education.${index}.current`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <input 
                      type="checkbox"
                      {...register(`education.${index}.current`)}
                      className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                    />
                    <label className="text-sm text-zinc-600">En curso</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case "skills":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900">Asistente de Habilidades</h4>
                  <p className="text-sm text-emerald-700 mt-1">Sugerencias basadas en el mercado laboral de Nicaragua.</p>
                  
                  <div className="mt-4 space-y-4">
                    {Object.entries(SKILL_SUGGESTIONS).map(([category, skills]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{category}</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(skill => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => appendSkill({ id: crypto.randomUUID(), name: skill, level: "Intermedio", category: category === "Blandas" ? "Blanda" : "Técnica" })}
                              className="px-3 py-1 bg-white border border-emerald-200 rounded-full text-xs text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-800">Tus Habilidades</h3>
                <button 
                  type="button"
                  onClick={() => appendSkill({ id: crypto.randomUUID(), name: "", level: "Intermedio", category: "Técnica" })}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                  <Plus size={16} /> Agregar Manualmente
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl bg-white group">
                    <div className="flex-1 space-y-1">
                      <input 
                        {...register(`skills.${index}.name`)}
                        placeholder="Nombre de habilidad"
                        className="w-full text-sm font-medium outline-none"
                      />
                      <div className="flex gap-2">
                        <select 
                          {...register(`skills.${index}.level`)}
                          className="text-xs text-zinc-500 bg-transparent outline-none"
                        >
                          <option>Básico</option>
                          <option>Intermedio</option>
                          <option>Avanzado</option>
                          <option>Experto</option>
                        </select>
                        <select 
                          {...register(`skills.${index}.category`)}
                          className="text-xs text-zinc-500 bg-transparent outline-none"
                        >
                          <option value="Técnica">Habilidad Dura</option>
                          <option value="Blanda">Habilidad Blanda</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "references":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-800">Referencias</h3>
              <button 
                type="button"
                onClick={() => appendRef({ id: crypto.randomUUID(), name: "", relationship: "", phone: "", company: "" })}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus size={16} /> Agregar Referencia
              </button>
            </div>
            
            {refFields.map((field, index) => (
              <div key={field.id} className="p-6 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-4 relative">
                <button 
                  type="button"
                  onClick={() => removeRef(index)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nombre Completo</label>
                    <input 
                      {...register(`references.${index}.name`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Parentesco / Relación</label>
                    <input 
                      {...register(`references.${index}.relationship`)}
                      placeholder="Ej. Ex-Jefe, Colega"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Teléfono</label>
                    <input 
                      {...register(`references.${index}.phone`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Empresa (Opcional)</label>
                    <input 
                      {...register(`references.${index}.company`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case "additional":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-800">Formación Adicional</h3>
                <button 
                  type="button"
                  onClick={() => appendTraining({ id: crypto.randomUUID(), title: "", center: "", date: "" })}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                  <Plus size={16} /> Agregar Curso
                </button>
              </div>
              {trainingFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-zinc-200 rounded-xl bg-white relative">
                  <input {...register(`additionalTraining.${index}.title`)} placeholder="Título del curso" className="p-2 border rounded" />
                  <input {...register(`additionalTraining.${index}.center`)} placeholder="Centro de estudios" className="p-2 border rounded" />
                  <input {...register(`additionalTraining.${index}.date`)} type="month" className="p-2 border rounded" />
                  <button type="button" onClick={() => removeTraining(index)} className="absolute -top-2 -right-2 bg-white text-red-500 border rounded-full p-1 shadow-sm"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t pt-8">
              <h3 className="text-lg font-semibold text-zinc-800">Otros Datos de Interés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Disponibilidad</label>
                  <input {...register("otherInterests.availability")} placeholder="Ej. Inmediata" className="w-full p-2 border rounded" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Carnet de Conducir</label>
                  <input {...register("otherInterests.license")} placeholder="Ej. Tipo B" className="w-full p-2 border rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register("otherInterests.mobility")} className="w-4 h-4 text-emerald-600 rounded" />
                  <label className="text-sm text-zinc-600">Movilidad geográfica</label>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-700">Otros</label>
                  <textarea {...register("otherInterests.other")} rows={2} className="w-full p-2 border rounded resize-none" />
                </div>
              </div>
            </div>
          </div>
        );
      case "preview":
        const fontStyles = {
          "arial-times": { body: "font-sans", header: "font-serif" },
          "calibri-cambria": { body: "font-sans", header: "font-serif" },
          "lato-roboto": { body: "font-sans", header: "font-sans" },
        }[cvData.design.fontPairing];

        return (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center gap-4 mb-4 no-print">
              <select 
                {...register("design.fontPairing")}
                className="p-2 border rounded-lg text-sm"
              >
                <option value="arial-times">Arial + Times New Roman</option>
                <option value="calibri-cambria">Calibri + Cambria</option>
                <option value="lato-roboto">Lato + Roboto</option>
              </select>
            </div>

            <div className={cn(
              "bg-white border border-zinc-200 shadow-2xl rounded-none w-full max-w-[210mm] mx-auto p-[15mm] text-zinc-900 min-h-[297mm]",
              fontStyles.body
            )}>
              <div className="flex gap-8 items-start border-b-2 border-zinc-900 pb-6 mb-8">
                {cvData.personalInfo.photo && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0">
                    <img src={cvData.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className={cn("text-3xl font-bold uppercase tracking-tighter mb-2", fontStyles.header)}>
                    {cvData.personalInfo.fullName || "TU NOMBRE COMPLETO"}
                  </h1>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-600">
                    {cvData.personalInfo.idNumber && <span>Cédula: {cvData.personalInfo.idNumber}</span>}
                    {cvData.personalInfo.phone && <span>Tel: {cvData.personalInfo.phone}</span>}
                    {cvData.personalInfo.email && <span>Email: {cvData.personalInfo.email}</span>}
                    {cvData.personalInfo.address && <span>Dir: {cvData.personalInfo.address}</span>}
                    {cvData.personalInfo.linkedin && <span className="col-span-2">LinkedIn: {cvData.personalInfo.linkedin}</span>}
                    {cvData.personalInfo.website && <span className="col-span-2">Web: {cvData.personalInfo.website}</span>}
                  </div>
                </div>
              </div>

              {cvData.professionalProfile && (
                <section className="mb-6">
                  <h2 className={cn("text-base font-bold border-b border-zinc-300 mb-2 uppercase tracking-widest", fontStyles.header)}>Perfil Profesional</h2>
                  <p className="text-xs leading-relaxed text-justify">{cvData.professionalProfile}</p>
                </section>
              )}

              {cvData.experience.length > 0 && (
                <section className="mb-6">
                  <h2 className={cn("text-base font-bold border-b border-zinc-300 mb-3 uppercase tracking-widest", fontStyles.header)}>Experiencia Laboral</h2>
                  <div className="space-y-4">
                    {cvData.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="font-bold text-sm">{exp.position}</h3>
                          <span className="text-[10px] font-medium text-zinc-500">{exp.startDate} — {exp.current ? "Presente" : exp.endDate}</span>
                        </div>
                        <p className="text-xs italic text-zinc-700 mb-1">{exp.company}</p>
                        <p className="text-xs text-zinc-600 whitespace-pre-line leading-snug">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cvData.education.length > 0 && (
                <section className="mb-6">
                  <h2 className={cn("text-base font-bold border-b border-zinc-300 mb-3 uppercase tracking-widest", fontStyles.header)}>Educación</h2>
                  <div className="space-y-3">
                    {cvData.education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <div>
                          <h3 className="font-bold text-xs">{edu.degree}</h3>
                          <p className="text-xs text-zinc-600">{edu.school}</p>
                        </div>
                        <span className="text-[10px] font-medium text-zinc-500">{edu.startDate} — {edu.current ? "En curso" : edu.endDate}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div>
                  {cvData.skills.filter(s => s.category === "Técnica").length > 0 && (
                    <section className="mb-6">
                      <h2 className={cn("text-base font-bold border-b border-zinc-300 mb-3 uppercase tracking-widest", fontStyles.header)}>Habilidades Técnicas</h2>
                      <div className="space-y-1">
                        {cvData.skills.filter(s => s.category === "Técnica").map((skill) => (
                          <div key={skill.id} className="flex justify-between text-[10px]">
                            <span>{skill.name}</span>
                            <span className="text-zinc-400 italic">{skill.level}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {cvData.skills.filter(s => s.category === "Blanda").length > 0 && (
                    <section className="mb-6">
                      <h2 className={cn("text-base font-bold border-b border-zinc-300 mb-3 uppercase tracking-widest", fontStyles.header)}>Habilidades Blandas</h2>
                      <div className="space-y-1">
                        {cvData.skills.filter(s => s.category === "Blanda").map((skill) => (
                          <div key={skill.id} className="flex justify-between text-[10px]">
                            <span>{skill.name}</span>
                            <span className="text-zinc-400 italic">{skill.level}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div>
                  {cvData.additionalTraining.length > 0 && (
                    <section className="mb-6">
                      <h2 className={cn("text-base font-bold border-b border-zinc-300 mb-3 uppercase tracking-widest", fontStyles.header)}>Formación Adicional</h2>
                      <div className="space-y-2">
                        {cvData.additionalTraining.map((training) => (
                          <div key={training.id} className="text-[10px]">
                            <p className="font-bold">{training.title}</p>
                            <p className="text-zinc-600">{training.center} | {training.date}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="mb-6">
                    <h2 className={cn("text-base font-bold border-b border-zinc-300 mb-3 uppercase tracking-widest", fontStyles.header)}>Otros Datos</h2>
                    <div className="space-y-1 text-[10px]">
                      {cvData.otherInterests.availability && <p><b>Disponibilidad:</b> {cvData.otherInterests.availability}</p>}
                      {cvData.otherInterests.license && <p><b>Licencia:</b> {cvData.otherInterests.license}</p>}
                      {cvData.otherInterests.mobility && <p><b>Movilidad geográfica:</b> Sí</p>}
                      {cvData.otherInterests.other && <p>{cvData.otherInterests.other}</p>}
                    </div>
                  </section>
                </div>
              </div>

              {cvData.references.length > 0 && (
                <section>
                  <h2 className={cn("text-base font-bold border-b border-zinc-300 mb-3 uppercase tracking-widest", fontStyles.header)}>Referencias</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {cvData.references.map((ref) => (
                      <div key={ref.id} className="text-[10px]">
                        <p className="font-bold">{ref.name}</p>
                        <p className="text-zinc-600">{ref.relationship} {ref.company && `en ${ref.company}`}</p>
                        <p className="text-zinc-500">Tel: {ref.phone}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="flex justify-center no-print">
              <button 
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all shadow-lg"
              >
                <Download size={20} /> Descargar PDF / Imprimir
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-white border-r border-zinc-200 z-50 hidden md:flex flex-col">
        <div className="p-8 border-b border-zinc-100">
          <h1 className="text-2xl font-black tracking-tighter text-emerald-600">NicaCV</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mt-1">Constructor Pro</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                  isActive ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-zinc-500 hover:bg-zinc-50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400"
                )}>
                  <Icon size={18} />
                </div>
                <span className="font-medium text-sm hidden md:block">{step.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">{STEPS[currentStep].title}</h2>
              <p className="text-zinc-500 mt-2">Completa la información para generar tu currículum profesional.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition-all shadow-sm disabled:opacity-50"
              >
                <Save size={18} className={cn(isSaving && "animate-pulse")} />
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("¡Enlace copiado al portapapeles!");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition-all shadow-sm"
              >
                <Share2 size={18} />
                Compartir
              </button>
            </div>
          </header>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-10 shadow-sm min-h-[500px]">
            {renderStep()}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 text-zinc-600 font-medium hover:text-zinc-900 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} /> Anterior
            </button>
            
            {currentStep < STEPS.length - 1 && (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-all shadow-lg"
              >
                Siguiente <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .max-w-\\[210mm\\], .max-w-\\[210mm\\] * { visibility: visible; }
          .max-w-\\[210mm\\] { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 99%; 
            margin: 0; 
            padding: 15px;
            border: none;
            box-shadow: none;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
