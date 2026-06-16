const ADMIN_PASSWORD = "Barberchic@2026";
const SALON_WHATSAPP = "5521988657808";
const OPENING_HOURS = {
  0: null,
  1: { label: "segunda-feira", start: "09:00", end: "19:00" },
  2: { label: "terça-feira", start: "09:00", end: "19:00" },
  3: { label: "quarta-feira", start: "09:00", end: "19:00" },
  4: { label: "quinta-feira", start: "09:00", end: "20:00" },
  5: { label: "sexta-feira", start: "09:00", end: "20:00" },
  6: { label: "sábado", start: "09:00", end: "18:00" }
};

const productFallback =
  "Barbearia VIP — Barbearia Premium desde 1998_files/cosmeticos-vip-cinematic_c2469e2b.png";

const defaults = {
  barbers: [
    { id: crypto.randomUUID(), name: "Rafael Chic", specialty: "Degrade e corte social" },
    { id: crypto.randomUUID(), name: "Diego Navalha", specialty: "Barba completa e terapia quente" },
    { id: crypto.randomUUID(), name: "Lucas Style", specialty: "Cortes modernos e freestyle" },
    { id: crypto.randomUUID(), name: "Marcos Prime", specialty: "Pigmentacao e acabamento" }
  ],
  products: [
    {
      id: crypto.randomUUID(),
      name: "Pomada Barber Chic Matte",
      price: 59.9,
      image: "Barbearia VIP — Barbearia Premium desde 1998_files/pomada-vip-real_9018bb50.jpeg"
    },
    {
      id: crypto.randomUUID(),
      name: "Oleo premium para barba",
      price: 64.9,
      image: "Barbearia VIP — Barbearia Premium desde 1998_files/oleo-vip-barba-real_f6b9a938.jpeg"
    },
    {
      id: crypto.randomUUID(),
      name: "Shampoo fresh care",
      price: 49.9,
      image: "Barbearia VIP — Barbearia Premium desde 1998_files/shampoo-fresh-real_dd021c3c.jpeg"
    }
  ],
  appointments: [],
  finances: []
};

const state = loadState();
const formatMoney = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function loadState() {
  const saved = localStorage.getItem("barberChicState");
  if (!saved) return structuredClone(defaults);

  try {
    const parsed = JSON.parse(saved);
    return {
      barbers: parsed.barbers?.length ? parsed.barbers : structuredClone(defaults.barbers),
      products: parsed.products?.length ? parsed.products : structuredClone(defaults.products),
      appointments: parsed.appointments || [],
      finances: parsed.finances || []
    };
  } catch {
    return structuredClone(defaults);
  }
}

function saveState() {
  localStorage.setItem("barberChicState", JSON.stringify(state));
}

function byId(id) {
  return document.getElementById(id);
}

function money(value) {
  return formatMoney.format(Number(value) || 0);
}

function phoneDigits(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function whatsappLink(phone, message) {
  return `https://wa.me/${phoneDigits(phone)}?text=${encodeURIComponent(message)}`;
}

function getSchedule(dateValue) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return OPENING_HOURS[date.getDay()];
}

function validateBookingTime(dateValue, timeValue) {
  const schedule = getSchedule(dateValue);
  if (!schedule) return "A Barber Chic não abre neste dia. Escolha uma data de segunda a sábado.";
  if (timeValue < schedule.start || timeValue > schedule.end) {
    return `Horário fora do funcionamento de ${schedule.label}: ${schedule.start}-${schedule.end}.`;
  }
  return "";
}

function renderBarberOptions() {
  const options = state.barbers
    .map((barber) => `<option value="${barber.id}">${barber.name} - ${barber.specialty}</option>`)
    .join("");
  byId("bookingBarber").innerHTML = options;
  byId("financeBarber").innerHTML = options;
}

function renderBarberPreview() {
  byId("barberPreview").innerHTML = state.barbers
    .map((barber) => `<span><strong>${barber.name}</strong><small>${barber.specialty}</small></span>`)
    .join("");
}

function renderProducts() {
  byId("productsGrid").innerHTML = state.products
    .map(
      (product) => `
        <article class="product-card">
          <div class="image"><img src="${product.image || productFallback}" alt="${product.name}" /></div>
          <div class="content">
            <h3>${product.name}</h3>
            <span class="price">${money(product.price)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAdminBarbers() {
  byId("barbersList").innerHTML = state.barbers
    .map(
      (barber) => `
        <article>
          <div><h3>${barber.name}</h3><p>${barber.specialty}</p></div>
          <div class="item-actions">
            <button class="small-btn warn" type="button" data-remove-barber="${barber.id}">Remover</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAdminProducts() {
  byId("productsList").innerHTML = state.products
    .map(
      (product) => `
        <article>
          <div><h3>${product.name}</h3><p>${money(product.price)}</p></div>
          <div class="item-actions">
            <button class="small-btn warn" type="button" data-remove-product="${product.id}">Remover</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAppointments() {
  byId("appointmentsCount").textContent = `${state.appointments.length} registros`;
  byId("appointmentsList").innerHTML =
    state.appointments
      .map((appointment) => {
        const barber = state.barbers.find((item) => item.id === appointment.barberId);
        const message = `Olá ${appointment.clientName}, sua marcação na Barber Chic para ${appointment.service} com ${barber?.name || "nosso barbeiro"} em ${appointment.date} às ${appointment.time} está em análise.`;
        return `
          <article>
            <div>
              <h3>${appointment.clientName} - ${appointment.service}</h3>
              <p>${appointment.date} às ${appointment.time} com ${barber?.name || "Barbeiro removido"} | WhatsApp: ${appointment.clientPhone}</p>
              ${appointment.notes ? `<p>${appointment.notes}</p>` : ""}
              <span class="status ${appointment.status === "Aprovado" ? "approved" : ""}">${appointment.status}</span>
            </div>
            <div class="item-actions">
              <button class="small-btn ok" type="button" data-approve="${appointment.id}">Aprovar</button>
              <a class="small-btn" href="${whatsappLink(appointment.clientPhone, message)}" target="_blank" rel="noreferrer">WhatsApp</a>
              <button class="small-btn warn" type="button" data-remove-appointment="${appointment.id}">Remover</button>
            </div>
          </article>
        `;
      })
      .join("") || `<article><div><h3>Nenhum agendamento ainda</h3><p>As novas solicitacoes aparecem aqui.</p></div></article>`;
}

function renderFinance() {
  const totalsByBarber = state.barbers.map((barber) => {
    const entries = state.finances.filter((entry) => entry.barberId === barber.id);
    const income = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
    const expense = entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
    return { barber, income, expense, balance: income - expense };
  });

  const totalIncome = totalsByBarber.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = totalsByBarber.reduce((sum, item) => sum + item.expense, 0);

  byId("financeSummary").innerHTML = [
    `<div class="summary-card"><small>Total arrecadado</small><strong>${money(totalIncome)}</strong></div>`,
    `<div class="summary-card"><small>Total gasto</small><strong>${money(totalExpense)}</strong></div>`,
    `<div class="summary-card"><small>Saldo geral</small><strong>${money(totalIncome - totalExpense)}</strong></div>`,
    `<div class="summary-card"><small>Lancamentos</small><strong>${state.finances.length}</strong></div>`,
    ...totalsByBarber.map(
      (item) => `<div class="summary-card"><small>${item.barber.name}</small><strong>${money(item.balance)}</strong></div>`
    )
  ].join("");

  byId("financeList").innerHTML =
    state.finances
      .map((entry) => {
        const barber = state.barbers.find((item) => item.id === entry.barberId);
        return `
          <article>
            <div>
              <h3>${entry.type === "income" ? "Entrada" : "Saida"} - ${money(entry.amount)}</h3>
              <p>${entry.description} | ${barber?.name || "Barbeiro removido"} | ${entry.date}</p>
            </div>
            <div class="item-actions">
              <button class="small-btn warn" type="button" data-remove-finance="${entry.id}">Remover</button>
            </div>
          </article>
        `;
      })
      .join("") || `<article><div><h3>Nenhum lancamento financeiro</h3><p>Adicione entradas e saidas acima.</p></div></article>`;
}

function renderAll() {
  renderBarberOptions();
  renderBarberPreview();
  renderProducts();
  renderAdminBarbers();
  renderAdminProducts();
  renderAppointments();
  renderFinance();
}

byId("bookingForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const validationMessage = validateBookingTime(data.date, data.time);
  if (validationMessage) {
    byId("bookingStatus").textContent = validationMessage;
    return;
  }
  state.appointments.unshift({
    id: crypto.randomUUID(),
    ...data,
    status: "Pendente",
    createdAt: new Date().toISOString()
  });
  saveState();
  renderAppointments();
  byId("bookingStatus").textContent = "Solicitacao enviada. A equipe Barber Chic confirmara pelo WhatsApp.";
  event.currentTarget.reset();
});

byId("adminOpen").addEventListener("click", () => {
  byId("loginModal").showModal();
  byId("adminPassword").focus();
});

byId("loginClose").addEventListener("click", () => {
  byId("loginModal").close();
  byId("loginStatus").textContent = "";
});

byId("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (byId("adminPassword").value !== ADMIN_PASSWORD) {
    byId("loginStatus").textContent = "Senha incorreta.";
    return;
  }
  byId("loginModal").close();
  byId("financeiro").classList.remove("hidden");
  byId("loginStatus").textContent = "";
  byId("adminPassword").value = "";
  byId("financeiro").scrollIntoView({ behavior: "smooth" });
});

byId("adminClose").addEventListener("click", () => {
  byId("financeiro").classList.add("hidden");
});

document.querySelector(".admin-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tab]");
  if (!button) return;
  document.querySelectorAll(".admin-tabs button").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".admin-panel").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  byId(`tab-${button.dataset.tab}`).classList.add("active");
});

byId("barberForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.barbers.push({ id: crypto.randomUUID(), name: data.name, specialty: data.specialty });
  saveState();
  event.currentTarget.reset();
  renderAll();
});

byId("productForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.products.unshift({
    id: crypto.randomUUID(),
    name: data.name,
    price: Number(String(data.price).replace(",", ".")),
    image: data.image || productFallback
  });
  saveState();
  event.currentTarget.reset();
  renderAll();
});

byId("financeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.finances.unshift({
    id: crypto.randomUUID(),
    barberId: data.barberId,
    type: data.type,
    amount: Number(String(data.amount).replace(",", ".")),
    description: data.description,
    date: new Date().toLocaleDateString("pt-BR")
  });
  saveState();
  event.currentTarget.reset();
  renderFinance();
});

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-remove-barber],[data-remove-product],[data-remove-appointment],[data-remove-finance],[data-approve]");
  if (!action) return;

  if (action.dataset.approve) {
    const appointment = state.appointments.find((item) => item.id === action.dataset.approve);
    if (appointment) appointment.status = "Aprovado";
  }
  if (action.dataset.removeBarber) {
    state.barbers = state.barbers.filter((item) => item.id !== action.dataset.removeBarber);
  }
  if (action.dataset.removeProduct) {
    state.products = state.products.filter((item) => item.id !== action.dataset.removeProduct);
  }
  if (action.dataset.removeAppointment) {
    state.appointments = state.appointments.filter((item) => item.id !== action.dataset.removeAppointment);
  }
  if (action.dataset.removeFinance) {
    state.finances = state.finances.filter((item) => item.id !== action.dataset.removeFinance);
  }
  saveState();
  renderAll();
});

document.addEventListener("DOMContentLoaded", renderAll);
