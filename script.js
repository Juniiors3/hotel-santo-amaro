/**
 * Hotel Santo Amaro - Cansanção, Bahia
 * Script de Interatividade, Filtros, Modal e Integração WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuração do WhatsApp da Recepção
  // Substitua pelo número oficial com DDD (ex: 5575999999999)
  const HOTEL_WHATSAPP_NUMBER = '5575999193095';

  // 1. Atualizar Ano no Rodapé
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Inicializar Datas padrão nos inputs (Check-in = Hoje, Check-out = Amanhã)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const checkinInput = document.getElementById('checkinDate');
  const checkoutInput = document.getElementById('checkoutDate');
  const modalCheckin = document.getElementById('modalCheckin');
  const modalCheckout = document.getElementById('modalCheckout');

  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  if (checkinInput && checkoutInput) {
    checkinInput.min = todayStr;
    checkinInput.value = todayStr;
    checkoutInput.min = tomorrowStr;
    checkoutInput.value = tomorrowStr;

    checkinInput.addEventListener('change', () => {
      const selected = new Date(checkinInput.value);
      selected.setDate(selected.getDate() + 1);
      const minOut = formatDate(selected);
      checkoutInput.min = minOut;
      if (checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = minOut;
      }
    });
  }

  if (modalCheckin && modalCheckout) {
    modalCheckin.min = todayStr;
    modalCheckin.value = todayStr;
    modalCheckout.min = tomorrowStr;
    modalCheckout.value = tomorrowStr;

    modalCheckin.addEventListener('change', () => {
      const selected = new Date(modalCheckin.value);
      selected.setDate(selected.getDate() + 1);
      const minOut = formatDate(selected);
      modalCheckout.min = minOut;
      if (modalCheckout.value <= modalCheckin.value) {
        modalCheckout.value = minOut;
      }
    });
  }

  // 3. Header Sticky com Efeito de Sombra ao Rolar
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 4. Menu Mobile
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Fechar menu mobile ao clicar em um link
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 5. Filtro de Quartos
  const filterBtns = document.querySelectorAll('.filter-btn');
  const roomCards = document.querySelectorAll('.room-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      roomCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // 6. FAQ Accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');

      // Fecha todos os outros itens
      document.querySelectorAll('.faq-item').forEach((i) => {
        if (i !== item) i.classList.remove('active');
      });

      // Alterna o atual
      item.classList.toggle('active', !isActive);
    });
  });

  // 7. Modal de Reserva
  const reserveModal = document.getElementById('reserveModal');
  const closeModalBtn = document.getElementById('closeModal');
  const openModalBtns = document.querySelectorAll('.open-reserve-modal');
  const modalRoomTypeSelect = document.getElementById('modalRoomType');

  const openModal = (roomName = null) => {
    if (roomName && modalRoomTypeSelect) {
      for (let i = 0; i < modalRoomTypeSelect.options.length; i++) {
        if (modalRoomTypeSelect.options[i].value === roomName) {
          modalRoomTypeSelect.selectedIndex = i;
          break;
        }
      }
    }
    reserveModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    reserveModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  openModalBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Botões de reserva específicos em cada card de quarto
  document.querySelectorAll('.btn-room-reserve').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const room = btn.getAttribute('data-room');
      openModal(room);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (reserveModal) {
    reserveModal.addEventListener('click', (e) => {
      if (e.target === reserveModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && reserveModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // 8. Envio do Formulário Rápido do Hero (Quick Booking Bar)
  const quickBookingForm = document.getElementById('quickBookingForm');
  if (quickBookingForm) {
    quickBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inDate = formatDisplayDate(checkinInput.value);
      const outDate = formatDisplayDate(checkoutInput.value);
      const guests = document.getElementById('guestCount').value;

      const message = `Olá! Gostaria de consultar tarifas e disponibilidade no *Hotel Santo Amaro* (Cansanção - BA):%0A%0A` +
        `📅 *Check-in:* ${inDate}%0A` +
        `📅 *Check-out:* ${outDate}%0A` +
        `👥 *Hóspedes:* ${guests}%0A%0A` +
        `Poderiam me informar valores e quartos disponíveis? Obrigado!`;

      const whatsappUrl = `https://wa.me/${HOTEL_WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // 9. Envio do Formulário Completo do Modal
  const modalReserveForm = document.getElementById('modalReserveForm');
  if (modalReserveForm) {
    modalReserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const roomType = document.getElementById('modalRoomType').value;
      const inDate = formatDisplayDate(modalCheckin.value);
      const outDate = formatDisplayDate(modalCheckout.value);
      const guests = document.getElementById('modalGuests').value;
      const name = document.getElementById('modalName').value.trim();
      const obs = document.getElementById('modalObs').value.trim();

      let message = `Olá! Gostaria de solicitar uma reserva no *Hotel Santo Amaro* (Cansanção - BA):%0A%0A` +
        `👤 *Nome:* ${name}%0A` +
        `🛏️ *Acomodação:* ${roomType}%0A` +
        `📅 *Entrada:* ${inDate}%0A` +
        `📅 *Saída:* ${outDate}%0A` +
        `👥 *Hóspedes:* ${guests}`;

      if (obs) {
        message += `%0A📝 *Observações:* ${encodeURIComponent(obs)}`;
      }

      message += `%0A%0AAguardo a confirmação e instruções de pagamento.`;

      const whatsappUrl = `https://wa.me/${HOTEL_WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      closeModal();
    });
  }

  // 10. Scroll Suave com offset para links internos
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 70;
        const targetPos = targetElem.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth',
        });
      }
    });
  });
});
