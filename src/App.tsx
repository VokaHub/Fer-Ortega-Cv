import { motion } from "motion/react";
import { Mail, MapPin, ChevronRight, Download, Loader2, Instagram } from "lucide-react";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function App() {
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const downloadPDF = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);

    try {
      // Select all major sections to be treated as "slides"
      const sections = contentRef.current.querySelectorAll("section");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1920, 1080] // 16:9 Full HD style
      });

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        // Skip hidden sections or very small ones
        if (section.offsetHeight < 50) continue;

        // Capture each section as a canvas
        const canvas = await html2canvas(section, {
          backgroundColor: "#000000",
          scale: 3, // Even higher quality for text clarity
          logging: false,
          useCORS: true,
          width: 1920,
          height: 1080,
          windowWidth: 1920,
          windowHeight: 1080,
          ignoreElements: (element) => {
            return element.classList.contains('bg-blob') || element.tagName === 'BUTTON';
          },
          onclone: (clonedDoc) => {
            try {
              const styleSheets = Array.from(clonedDoc.styleSheets);
              styleSheets.forEach(sheet => {
                try {
                  const cleanRules = (rules: CSSRuleList, parent: CSSStyleSheet | CSSGroupingRule) => {
                    for (let idx = rules.length - 1; idx >= 0; idx--) {
                      const rule = rules[idx];
                      if (rule instanceof CSSStyleRule) {
                        const cssText = rule.cssText;
                        if (cssText.includes('oklab') || cssText.includes('oklch') || cssText.includes('color-mix')) {
                          parent.deleteRule(idx);
                        }
                      } else if (rule instanceof CSSGroupingRule) {
                        cleanRules(rule.cssRules, rule);
                      }
                    }
                  };
                  cleanRules(sheet.cssRules, sheet);
                } catch (e) {}
              });
            } catch (e) {}

            // Find matching section in clone
            const allClonedSections = Array.from(clonedDoc.querySelectorAll('section'));
            const clonedSection = allClonedSections[i] as HTMLElement;

            if (clonedSection) {
              clonedDoc.body.style.width = "1920px";
              clonedDoc.body.style.height = "1080px";
              clonedDoc.body.style.margin = "0";
              clonedDoc.body.style.padding = "0";
              clonedDoc.body.style.backgroundColor = "#000000";

              // Hide everything EXCEPT the targeted section
              clonedDoc.body.innerHTML = '';
              clonedDoc.body.appendChild(clonedSection);

              const allElements = clonedSection.querySelectorAll('*');
              allElements.forEach(el => {
                const element = el as HTMLElement;
                
                // Reset motion & Hidden states
                element.style.opacity = "1";
                element.style.visibility = "visible";
                element.style.transform = "none";
                element.style.transition = "none";
                element.style.animation = "none";

                // Boost Font weight and size for PDF clarity
                const computedStyle = window.getComputedStyle(element);
                const currentFontSize = parseFloat(computedStyle.fontSize);
                if (currentFontSize > 0) {
                  element.style.fontSize = (currentFontSize * 1.6) + "px";
                }

                // Fix for capsules/pills being cut off or uncentered
                if (element.classList.contains('pill') || element.dataset.pill === 'true') {
                  element.style.whiteSpace = "nowrap";
                  element.style.display = "inline-flex";
                  element.style.alignItems = "center";
                  element.style.justifyContent = "center";
                }

                // Color fixes
                if (computedStyle.color.includes('oklab') || computedStyle.color.includes('oklch')) {
                  element.style.color = '#ffffff';
                }
                if (computedStyle.backgroundColor.includes('oklab') || computedStyle.backgroundColor.includes('oklch')) {
                  element.style.backgroundColor = 'transparent';
                }
                if (computedStyle.borderColor.includes('oklab') || computedStyle.borderColor.includes('oklch')) {
                  element.style.borderColor = 'rgba(255,255,255,0.1)';
                }
              });

              clonedSection.style.display = "flex";
              clonedSection.style.width = "1920px";
              clonedSection.style.minHeight = "1080px";
              clonedSection.style.padding = "100px 200px";
              clonedSection.style.boxSizing = "border-box";
              clonedSection.style.flexDirection = "column";
              clonedSection.style.justifyContent = "center";
              clonedSection.style.background = "#000000";
              clonedSection.style.color = "#ffffff";
              clonedSection.style.position = "absolute";
              clonedSection.style.top = "0";
              clonedSection.style.left = "0";
              clonedSection.style.overflow = "hidden";
              
              // Simplify glass cards for capture
              const glassCards = clonedSection.querySelectorAll('.glass-card');
              glassCards.forEach(card => {
                (card as HTMLElement).style.backdropFilter = "none";
                (card as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              });
            }
          }
        });

        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        
        if (i > 0) pdf.addPage([1920, 1080], "landscape");
        
        pdf.addImage(imgData, "JPEG", 0, 0, 1920, 1080);
      }

      pdf.save("Fer_Ortega_CV_Presentation.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-black">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] blur-[150px] rounded-full animate-float bg-blob" 
          style={{ backgroundColor: 'rgba(192, 132, 252, 0.1)' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full bg-blob" 
          style={{ backgroundColor: 'rgba(88, 28, 135, 0.1)' }}
        />
      </div>

      {/* Floating Download Button */}
      <button
        onClick={downloadPDF}
        disabled={isDownloading}
        className="fixed bottom-8 right-8 z-50 glass-card px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-accent hover:text-black transition-all duration-500 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Download size={20} className="group-hover:scale-110 transition-transform" />
        )}
        <span className="font-medium tracking-wide uppercase text-xs">
          {isDownloading ? "Generando diapositivas..." : "Descargar CV (PDF HD)"}
        </span>
      </button>

      <main ref={contentRef} className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-40">
        {/* Hero Section - BOLD */}
        <section className="mb-48 min-h-[60vh] flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="glow-dot" />
              <span className="text-accent font-semibold tracking-[0.2em] uppercase text-[10px]">
                Artista y Estratega Digital
              </span>
            </div>
            
            <h1 className="text-display text-[18vw] md:text-[12vw] leading-[0.8] mb-12">
              Fer<br />Ortega
            </h1>
            
            <div className="grid md:grid-cols-2 gap-12 items-end">
              <p className="text-2xl md:text-3xl text-text-muted font-light leading-snug">
                Enfocada en <span className="text-white font-normal">dirección, ejecución y gestión</span> de contenido digital de alto impacto.
              </p>
              
              <div className="flex flex-col gap-4 text-sm text-text-muted md:items-end">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-accent" />
                  <span className="hover:text-white transition-colors cursor-pointer">info@vokahub.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Instagram size={16} className="text-accent" />
                  <span className="hover:text-white transition-colors cursor-pointer">oneday.hub</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-accent" />
                  <span className="text-right">Distrito Miraflores, zona 11, oficinas OneDay</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Profile Section - Premium Layout */}
        <section className="mb-48 min-h-[40vh] flex flex-col justify-center">
          <div className="grid md:grid-cols-12 gap-12">
            <motion.div {...fadeIn} className="md:col-span-4">
              <h2 className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-6">Perfil Profesional</h2>
              <div className="section-divider" />
            </motion.div>
            <motion.div {...fadeIn} className="md:col-span-8">
              <p className="text-3xl md:text-4xl leading-[1.2] text-white font-light tracking-tight">
                Estratega digital y artista creativa. Me especializo en convertir ideas en <span className="text-accent italic">sistemas claros</span> de contenido.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="mb-48 min-h-[80vh] flex flex-col justify-center">
          <motion.div {...fadeIn} className="mb-20">
            <h2 className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-6">Trayectoria</h2>
            <div className="section-divider" />
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="space-y-32">
            <ExperienceItem 
              company="OneDay"
              period="2021 — Presente"
              role="CEO & Project Manager"
              description={[
                "Planificación estratégica de contenido y branding.",
                "Organización de equipos y recursos para ejecución.",
                "Supervisión de contenido, diseño y comunicación digital."
              ]}
            />
            <ExperienceItem 
              company="Hyundai Power Ecor"
              period="2024 — 2025"
              role="Social Media Strategist & Community Manager"
              description={[
                "Gestión y publicación de contenido.",
                "Ejecución de calendarios y revisión de copies.",
                "Guionización de videos.",
                "Dirección creativa.",
                "Supervisión de producción."
              ]}
            />
            <ExperienceItem 
              company="Resiliencia"
              period="2020 — 2022"
              role="Booking Manager & Digital Strategy"
              description={[
                "Coordinación de agenda y profesionales.",
                "Organización interna y comunicación.",
                "Apoyo en posicionamiento digital."
              ]}
            />
            
            <div className="pt-16 border-t border-white/5">
              <ExperienceItem 
                company="WE STUDIO"
                period="2025 — 2026"
                role="Community Manager Operativa"
                description={[
                  "Creación de calendarios de contenido.",
                  "Reportes semanales y mensuales de métricas.",
                  "Programación de contenido.",
                  "Actualización de plataforma para el equipo.",
                  "Creación de copies."
                ]}
              />

              <div className="mt-12 grid md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                <div className="md:col-span-1">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mb-4">Marcas Manejadas</h3>
                  <p className="text-text-muted text-sm italic leading-relaxed">Gestión integral y estratégica para marcas de alto perfil.</p>
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  {["Don Mario´s", "Top Dot", "Masa Madre", "Net", "Educare", "Antiguas Gym", "El Plaza"].map((brand) => (
                    <span key={brand} data-pill="true" className="inline-flex items-center justify-center px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[13px] font-light leading-none hover:border-accent/40 transition-colors">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Artistic Experience & Brands */}
        <section className="mb-48 min-h-[60vh] flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-24">
            <motion.div {...fadeIn}>
              <h2 className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-12">Experiencia Artística</h2>
              <div className="glass-card p-12 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-colors" />
                <h3 className="text-2xl mb-10 font-light">Proyectos Creativos Independientes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {["Edición de Video", "Edición de Imagen", "Diseño Gráfico", "Ilustración Digital", "Animación 2D/3D"].map((item) => (
                    <div key={item} className="flex items-center gap-4 group/item">
                      <div className="w-2 h-[1px] bg-accent group-hover/item:w-4 transition-all" />
                      <span className="text-text-muted group-hover/item:text-white transition-colors font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn} className="flex flex-col">
              <h2 className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-12">Marcas & Clientes</h2>
              <div className="flex flex-wrap gap-4">
                {["Hyundai", "Novex", "Cemaco", "Clínica de Servicio", "Orbe Café", "Marea Café", "Petrópolis Veterinaria", "Perruqueria", "Resiliencia", "Don Mario´s", "Top Dot", "Masa Madre", "Net", "Educare", "Antiguas Gym", "El Plaza"].map((brand) => (
                  <span key={brand} data-pill="true" className="inline-flex items-center justify-center px-6 py-3.5 bg-white/5 border border-white/10 rounded-full text-[15px] font-light leading-none hover:border-accent/40 transition-colors">
                    {brand}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Skills & Tools - CAPSULES */}
        <section className="mb-48 min-h-[60vh] flex flex-col justify-center">
          <div className="grid lg:grid-cols-3 gap-20">
            <motion.div {...fadeIn} className="lg:col-span-2">
              <h2 className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-12">Habilidades Especializadas</h2>
              <div className="grid md:grid-cols-2 gap-16">
                <SkillGroup 
                  title="Estrategia & CM"
                  skills={["Community Management", "Social Media Strategy", "Planificación", "Revisión de copies", "Creative Direction"]}
                />
                <SkillGroup 
                  title="Gestión & Ejecución"
                  skills={["Project Management", "Calendarios", "Equipos", "Campañas"]}
                />
              </div>
            </motion.div>

            <motion.div {...fadeIn}>
              <h2 className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-12">Software & Tech</h2>
              <div className="flex flex-wrap gap-2">
                {["Meta Business", "Notion", "Google Suite", "Canva", "Adobe", "Gemini/GPT", "CapCut/AE", "Vibe coding", "Web Design"].map(tool => (
                  <span key={tool} className="pill">{tool}</span>
                ))}
              </div>
              
              <div className="mt-16">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6">Idiomas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="font-light text-lg">Español</span>
                    <span className="text-accent text-[10px] uppercase tracking-widest">Nativo</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="font-light text-lg">Inglés</span>
                    <span className="text-accent text-[10px] uppercase tracking-widest">Avanzado</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Education Section */}
        <section className="mb-48 min-h-[40vh] flex flex-col justify-center">
          <motion.div {...fadeIn} className="mb-16">
            <h2 className="text-accent uppercase tracking-[0.3em] text-[10px] font-bold mb-6">Formación</h2>
            <div className="section-divider" />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EducationItem 
              title="Lic. Animación 3D"
              period="2024 — Presente"
              status="En curso"
            />
            <EducationItem 
              title="Diplomado Locución"
              status="En curso"
            />
            <EducationItem 
              title="Pre-engineering"
              period="Graduada 2020"
            />
            <EducationItem 
              title="Cultural Ambassador"
              period="2018"
              location="Michigan, USA"
            />
          </div>
        </section>

        {/* Footer - Minimal & Premium */}
        <footer className="pt-24 border-t border-white/10 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-display text-4xl">Fer Ortega</h2>
            <p className="text-text-muted text-xs uppercase tracking-widest">Luisa Fernanda Ortiz Ortega</p>
          </div>
          
          <div className="flex flex-col gap-1 text-right md:items-end">
            <span className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Contacto Directo</span>
            <span className="text-xl font-light">info@vokahub.com</span>
            <span className="text-accent text-sm font-light mt-2">@oneday.hub</span>
            <span className="text-text-muted text-sm font-light mt-4">© 2026 • Guatemala</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function ExperienceItem({ company, period, role, description }: { company: string, period: string, role: string, description: string[] }) {
  return (
    <motion.div 
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }}
      className="grid md:grid-cols-12 gap-8 group"
    >
      <div className="md:col-span-4">
        <span className="text-accent text-[10px] uppercase tracking-[0.2em] mb-4 block">{period}</span>
        <h3 className="text-4xl md:text-5xl text-display group-hover:text-accent transition-colors duration-500">{company}</h3>
      </div>
      <div className="md:col-span-8 pt-2">
        <h4 className="text-xl font-medium mb-6 text-white/90">{role}</h4>
        <div className="space-y-4">
          {description.map((item, i) => (
            <div key={i} className="flex gap-4 group/desc">
              <div className="w-1 h-1 bg-accent/30 rounded-full mt-2.5 group-hover/desc:bg-accent transition-colors" />
              <p className="text-text-muted font-light leading-relaxed group-hover/desc:text-white/80 transition-colors">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SkillGroup({ title, skills }: { title: string, skills: string[] }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold mb-8 text-white/30 uppercase tracking-[0.3em]">{title}</h3>
      <div className="space-y-6">
        {skills.map(skill => (
          <div key={skill} className="flex items-center justify-between group cursor-default border-b border-white/5 pb-4">
            <span className="text-xl font-light group-hover:text-accent transition-all duration-500">{skill}</span>
            <ChevronRight size={16} className="text-accent opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationItem({ title, period, status, location }: { title: string, period?: string, status?: string, location?: string }) {
  return (
    <div className="p-8 rounded-3xl border border-white/5 hover:border-accent/40 transition-all duration-500 bg-white/[0.01] hover:bg-white/[0.03] group">
      <h3 className="text-lg font-normal mb-4 group-hover:text-accent transition-colors">{title}</h3>
      <div className="flex flex-col gap-1 text-xs text-text-muted font-light uppercase tracking-wider">
        {period && <span>{period}</span>}
        {status && <span className="text-accent font-bold">{status}</span>}
        {location && <span>{location}</span>}
      </div>
    </div>
  );
}
