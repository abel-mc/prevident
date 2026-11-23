/**
 * Prevident — Clínica Dental | JavaScript principal (rediseño)
 * Funcionalidades: Header scroll, menú móvil, selector de sedes,
 * scroll reveal, smooth scroll, formulario de reserva → WhatsApp,
 * tracking de clicks WhatsApp.
 */

(() => {
  'use strict';

  /* ============================================================
     Utilidades
     ============================================================ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const throttle = (fn, wait = 100) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn(...args); }
    };
  };

  const onReady = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  };

  /* ============================================================
     Header: efecto al hacer scroll
     ============================================================ */
  const header = $('#header');
  const handleHeaderScroll = throttle(() => {
    if (!header) return;
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }, 50);

  /* ============================================================
     Menú móvil
     ============================================================ */
  const navToggle = $('.nav__toggle');
  const navOverlay = $('#nav-menu');
  const navClose = $('.nav__close');
  const navMobileLinks = $$('.nav__mobile-link');
  const body = document.body;

  const openMenu = () => {
    navOverlay?.classList.add('open');
    navToggle?.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
    navClose?.focus();
  };

  const closeMenu = () => {
    navOverlay?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  };

  navToggle?.addEventListener('click', openMenu);
  navClose?.addEventListener('click', closeMenu);

  navMobileLinks.forEach(link => {
    link.addEventListener('click', () => setTimeout(closeMenu, 150));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOverlay?.classList.contains('open')) closeMenu();
  });

  navOverlay?.addEventListener('click', (e) => {
    if (e.target === navOverlay) closeMenu();
  });

  /* ============================================================
     Selector de sedes (pestañas interactivas)
     ============================================================ */
  const initSedeTabs = () => {
    const tabs = $$('.sede-tabs__tab');
    const panels = $$('.sede-panel');

    const showPanel = (targetId) => {
      // Pestaña "Todas las sedes": mostrar todos los paneles
      if (targetId === 'tab-todas') {
        tabs.forEach(tab => {
          const active = tab.id === 'tab-todas';
          tab.classList.toggle('sede-tabs__tab--active', active);
          tab.setAttribute('aria-selected', String(active));
        });
        panels.forEach(panel => {
          panel.removeAttribute('hidden');
          panel.classList.add('sede-panel--active');
        });
        return;
      }

      // Pestaña individual: mostrar solo el panel correspondiente
      tabs.forEach(tab => {
        const active = tab.id === targetId;
        tab.classList.toggle('sede-tabs__tab--active', active);
        tab.setAttribute('aria-selected', String(active));
      });

      panels.forEach(panel => {
        const active = panel.id === targetId.replace('tab-', 'panel-');
        panel.classList.toggle('sede-panel--active', active);
        if (active) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      });
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        showPanel(tab.id);
      });
      // Activación con teclado
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showPanel(tab.id);
        }
      });
    });
  };

  /* ============================================================
     Formulario de reserva → WhatsApp
     ============================================================ */
  const initReservaForm = () => {
    const form = $('#form-reserva');
    const note = $('#form-mensaje');
    if (!form) return;

    const turnoLabels = {
      manana: 'Mañana (10:00 am – 1:00 pm)',
      tarde: 'Tarde (3:00 pm – 9:30 pm)',
    };

    const sedeLabels = {
      pascana: 'Sede La Pascana — Av. Túpac Amaru 3792 (Comas)',
      mega80: 'Sede Mega 80 — Lima Norte',
      sanfelipe: 'Sede Av. San Felipe — Comas',
      covida: 'Sede Covida — Los Olivos',
      maranon: 'Sede Av. Marañón — Los Olivos',
      principal: 'Sede Principal — Av. Túpac Amaru 603',
    };

    const showNote = (msg, isError = false) => {
      note.textContent = msg;
      note.style.color = isError ? varColor('--color-error', '#DC2626') : '';
      note.style.display = 'block';
    };

    const hideNote = () => { note.style.display = 'none'; };

    // Validación en tiempo real: limpiar mensaje de error al escribir
    form.elements.nombre?.addEventListener('input', hideNote);
    form.elements.sede?.addEventListener('change', hideNote);
    form.elements.tratamiento?.addEventListener('change', hideNote);
    form.elements.turno?.addEventListener('change', hideNote);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = form.elements.nombre.value.trim();
      const sedeSelect = form.elements.sede;
      const tratamientoSelect = form.elements.tratamiento;
      const turnoSelect = form.elements.turno;

      if (!nombre || !sedeSelect.value || !tratamientoSelect.value || !turnoSelect.value) {
        showNote('Por favor completa todos los campos.', true);
        setTimeout(hideNote, 4000);
        return;
      }

      const sedeText = sedeSelect.options[sedeSelect.selectedIndex].text || sedeLabels[sedeSelect.value] || '';
      const tratamientoText = tratamientoSelect.options[tratamientoSelect.selectedIndex].text || '';
      const turnoText = turnoSelect.options[turnoSelect.selectedIndex].text || turnoLabels[turnoSelect.value] || '';

      const lines = [
        'Hola Prevident, quiero agendar una cita dental.',
        '',
        `Nombre: ${nombre}`,
        `Sede: ${sedeText}`,
        `Tratamiento: ${tratamientoText}`,
        `Turno: ${turnoText}`,
      ];

      const message = lines.map(encodeURIComponent).join('%0A');
      const url = `https://wa.me/51993733388?text=${message}`;

      // Abrir WhatsApp con manejo de bloqueadores de popup
      const whatsappWin = window.open(url, '_blank', 'noopener');
      if (!whatsappWin || whatsappWin.closed || typeof whatsappWin.closed === 'undefined') {
        showNote('Tu navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio o haz clic directo en el botón de WhatsApp.', true);
        setTimeout(hideNote, 6000);
        return;
      }

      // Confirmación visual
      showNote('¡Listo! Se abrió WhatsApp con tu reserva lista para enviar.', false);
      form.reset();

      setTimeout(hideNote, 6000);
    });
  };

  // Helper para variable de color (fallback si no está definida)
  function varColor(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return v ? v.trim() : fallback;
  }

  /* ============================================================
     Scroll Reveal (IntersectionObserver)
     ============================================================ */
  const initScrollReveal = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      $$('[data-aos]').forEach(el => el.classList.add('aos-animate'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

    $$('[data-aos]').forEach(el => observer.observe(el));
  };

  /* ============================================================
     Smooth scroll para anclas internas
     ============================================================ */
  const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || !href) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerH = header?.offsetHeight || 0;
          const targetPos = target.getBoundingClientRect().top + window.scrollY - headerH - 14;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
          history.pushState(null, '', href);
          closeMenu();
        }
      });
    });
  };

  /* ============================================================
     Tracking de clicks WhatsApp (opcional dataLayer / gtag)
     ============================================================ */
  const initWhatsAppTracking = () => {
    $$('a[href*="wa.me"]').forEach(link => {
      link.addEventListener('click', () => {
        const event = new CustomEvent('prevident:whatsapp_click', {
          detail: { href: link.href, text: link.textContent.trim() }
        });
        window.dispatchEvent(event);

        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'whatsapp_click',
            whatsapp_destination: link.href,
            whatsapp_context: link.closest('section')?.id || 'unknown'
          });
        }
        if (typeof gtag === 'function') {
          gtag('event', 'whatsapp_click', {
            destination: link.href,
            context: link.closest('section')?.id || 'unknown'
          });
        }
      });
    });
  };

  /* ============================================================
     Año dinámico en footer
     ============================================================ */
  const setCurrentYear = () => {
    const yearEl = $('#footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  };

  /* ============================================================
     Inicialización
     ============================================================ */
  const init = () => {
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    initSedeTabs();
    $$('.sede-panel').forEach(panel => panel.removeAttribute('hidden'));
    $$('.sede-panel').forEach(panel => panel.classList.add('sede-panel--active'));
    initReservaForm();
    initScrollReveal();
    initSmoothScroll();
    initWhatsAppTracking();
    setCurrentYear();

    window.Prevident = {
      openMenu,
      closeMenu,
      trackWhatsApp: (href) => window.dispatchEvent(new CustomEvent('prevident:whatsapp_click', { detail: { href } }))
    };
  };

  onReady(init);
})();
