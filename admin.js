/**
 * Hotel Santo Amaro - Cansanção, Bahia
 * Painel Administrativo de Consultas
 */

document.addEventListener('DOMContentLoaded', () => {
  const SUPABASE_URL = 'https://qjdnaycpxuzhswaepgcb.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_e9mrFjE-RRNbQfoha8U_yA_DBvSQYdX';
  const RPC_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc/get_reservation_requests`;
  const DIRECT_ENDPOINT = `${SUPABASE_URL}/rest/v1/reservation_requests?select=*&order=created_at.desc`;

  const authOverlay = document.getElementById('authOverlay');
  const authForm = document.getElementById('authForm');
  const adminPasswordInput = document.getElementById('adminPassword');
  const authError = document.getElementById('authError');
  const btnAuthSubmit = document.getElementById('btnAuthSubmit');
  const btnLogout = document.getElementById('btnLogout');

  const tableBody = document.getElementById('tableBody');
  const searchInput = document.getElementById('searchInput');
  const filterRoom = document.getElementById('filterRoom');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnExportCsv = document.getElementById('btnExportCsv');

  const statTotal = document.getElementById('statTotal');
  const statToday = document.getElementById('statToday');
  const statUpcoming = document.getElementById('statUpcoming');
  const statTopRoom = document.getElementById('statTopRoom');

  let allRequests = [];
  let currentPassword = sessionStorage.getItem('hotel_admin_pin') || '';

  // 1. Inicialização e Verificação de Sessão
  if (currentPassword) {
    authOverlay.style.display = 'none';
    fetchRequests(currentPassword);
  } else {
    authOverlay.style.display = 'flex';
  }

  // 2. Formulário de Senha
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredPassword = adminPasswordInput.value.trim();
    if (!enteredPassword) return;

    btnAuthSubmit.disabled = true;
    btnAuthSubmit.textContent = 'Verificando...';
    authError.style.display = 'none';

    const success = await fetchRequests(enteredPassword);
    if (success) {
      currentPassword = enteredPassword;
      sessionStorage.setItem('hotel_admin_pin', enteredPassword);
      authOverlay.style.display = 'none';
      adminPasswordInput.value = '';
    } else {
      authError.style.display = 'block';
    }

    btnAuthSubmit.disabled = false;
    btnAuthSubmit.textContent = 'Acessar Painel';
  });

  // 3. Logout / Bloqueio
  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('hotel_admin_pin');
    currentPassword = '';
    allRequests = [];
    renderTable([]);
    authOverlay.style.display = 'flex';
    adminPasswordInput.focus();
  });

  // 4. Buscar Solicitações no Supabase
  async function fetchRequests(password) {
    showLoading();
    try {
      // Tentativa 1: via RPC protegida por senha
      let response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ p_password: password }),
      });

      // Tentativa 2: Fallback direto caso a RLS permita SELECT anon
      if (!response.ok && response.status === 404) {
        response = await fetch(DIRECT_ENDPOINT, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
      }

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      allRequests = Array.isArray(data) ? data : [];
      updateStats(allRequests);
      applyFilters();
      return true;
    } catch (err) {
      console.error('Erro ao consultar solicitações:', err);
      showError('Não foi possível carregar os dados. Verifique a conexão com o Supabase.');
      return false;
    }
  }

  // 5. Atualizar Indicadores e Estatísticas
  function updateStats(items) {
    statTotal.textContent = items.length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = items.filter(r => (r.created_at || '').slice(0, 10) === todayStr).length;
    statToday.textContent = todayCount;

    // Próximos check-ins (próximos 7 dias)
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const upcomingCount = items.filter(r => {
      if (!r.checkin) return false;
      const d = new Date(r.checkin + 'T00:00:00');
      return d >= now && d <= in7Days;
    }).length;
    statUpcoming.textContent = upcomingCount;

    // Quarto mais procurado
    const roomCounts = {};
    items.forEach(r => {
      const room = r.room_type || 'Não informado';
      roomCounts[room] = (roomCounts[room] || 0) + 1;
    });

    let topRoom = '—';
    let maxCount = 0;
    for (const [room, count] of Object.entries(roomCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topRoom = room.replace('Quarto ', '');
      }
    }
    statTopRoom.textContent = topRoom;
  }

  // 6. Filtros e Busca em Tempo Real
  function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedRoom = filterRoom.value;

    const filtered = allRequests.filter(item => {
      const matchRoom = !selectedRoom || (item.room_type || '') === selectedRoom;
      const matchQuery = !query ||
        (item.name || '').toLowerCase().includes(query) ||
        (item.phone || '').toLowerCase().includes(query) ||
        (item.room_type || '').toLowerCase().includes(query);

      return matchRoom && matchQuery;
    });

    renderTable(filtered);
  }

  searchInput.addEventListener('input', applyFilters);
  filterRoom.addEventListener('change', applyFilters);
  btnRefresh.addEventListener('click', () => {
    if (currentPassword) fetchRequests(currentPassword);
  });

  // 7. Renderizar Linhas na Tabela
  function renderTable(items) {
    if (!items || items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="table-empty">
              <svg style="width:48px;height:48px;margin-bottom:0.75rem;stroke:var(--color-text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <h4 style="font-size:1.1rem;color:var(--color-text);margin-bottom:0.3rem;">Nenhuma solicitação encontrada</h4>
              <p style="font-size:0.85rem;">Assim que os visitantes enviarem pedidos pelo site, eles aparecerão aqui automaticamente.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = items.map(req => {
      const createdDate = formatDate(req.created_at, true);
      const checkinDate = formatDate(req.checkin, false);
      const checkoutDate = formatDate(req.checkout, false);
      const nights = calculateNights(req.checkin, req.checkout);
      const cleanPhone = (req.phone || '').replace(/\D/g, '');
      const waNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      const waMessage = encodeURIComponent(`Olá, ${req.name || ''}! Recebemos sua solicitação de reserva no Hotel Santo Amaro.`);

      return `
        <tr>
          <td class="cell-date">${createdDate}</td>
          <td class="cell-client">${escapeHtml(req.name || '—')}</td>
          <td>
            <div class="cell-phone">
              <span>${escapeHtml(req.phone || '—')}</span>
              ${cleanPhone ? `
                <a href="https://wa.me/${waNumber}?text=${waMessage}" target="_blank" rel="noopener noreferrer" class="btn-wa-direct" title="Abrir conversa no WhatsApp">
                  <span>WhatsApp</span>
                </a>
              ` : ''}
            </div>
          </td>
          <td>
            <div class="stay-dates">
              <strong>${checkinDate}</strong> até <strong>${checkoutDate}</strong>
              ${nights > 0 ? `<span class="stay-nights">(${nights} ${nights === 1 ? 'diária' : 'diárias'})</span>` : ''}
            </div>
          </td>
          <td>
            <span class="room-badge-table">${escapeHtml(req.room_type || 'Não especificado')}</span>
          </td>
          <td>${escapeHtml(req.guests || '—')}</td>
        </tr>
      `;
    }).join('');
  }

  function showLoading() {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="table-loading">
            <div class="table-loading-spinner"></div>
            <p>Carregando solicitações...</p>
          </div>
        </td>
      </tr>
    `;
  }

  function showError(msg) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="table-empty" style="color:#DC2626;">
            <p><strong>Erro:</strong> ${escapeHtml(msg)}</p>
          </div>
        </td>
      </tr>
    `;
  }

  // 8. Exportar para CSV (Compatível com Excel e Google Sheets)
  btnExportCsv.addEventListener('click', () => {
    if (!allRequests || allRequests.length === 0) {
      alert('Nenhuma solicitação para exportar.');
      return;
    }

    const headers = ['Data do Pedido', 'Nome do Cliente', 'Telefone / WhatsApp', 'Check-in', 'Check-out', 'Diárias', 'Acomodação', 'Hóspedes'];
    const rows = allRequests.map(r => [
      formatDate(r.created_at, true),
      r.name || '',
      r.phone || '',
      formatDate(r.checkin, false),
      formatDate(r.checkout, false),
      calculateNights(r.checkin, r.checkout),
      r.room_type || '',
      r.guests || ''
    ]);

    const csvContent = '﻿' + [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `reservas-hotel-santo-amaro-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Helpers
  function formatDate(val, withTime = false) {
    if (!val) return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      if (withTime) {
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} às ${hours}:${mins}`;
      }
      return `${day}/${month}/${year}`;
    } catch {
      return String(val);
    }
  }

  function calculateNights(inDate, outDate) {
    if (!inDate || !outDate) return 0;
    try {
      const d1 = new Date(inDate + 'T00:00:00');
      const d2 = new Date(outDate + 'T00:00:00');
      const diffTime = d2 - d1;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
