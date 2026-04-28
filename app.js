const STORAGE_KEY = "minierp-state-v1";
const REMEMBERED_LOGIN_KEY = "minierp-remembered-login";
const ACCESS_REGISTRY_KEY = "minierp-access-registry-v1";
const DEFAULT_TENANT = "Minha Empresa LTDA";
const DEFAULT_TENANT_DOCUMENT = "11.444.777/0001-61";
const SUPABASE_CONFIG = window.MINIERP_CONFIG?.supabase || {};

const makeId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const initialState = {
  clientes: [],
  fornecedores: [],
  produtos: [],
  vendas: [],
  contasReceber: [],
  contasPagar: []
};

const initialAccessRegistry = {
  empresas: [],
  usuarios: []
};

const demoState = {
  clientes: [
    { id: makeId(), nome: "Ana Souza", documento: "123.456.789-00", telefone: "(11) 98888-1010", cidade: "Sao Paulo", status: "Ativo" },
    { id: makeId(), nome: "Mercado Central", documento: "12.345.678/0001-95", telefone: "(21) 3333-4400", cidade: "Rio de Janeiro", status: "Ativo" },
    { id: makeId(), nome: "Oficina Lima", documento: "45.723.174/0001-10", telefone: "(31) 3444-9000", cidade: "Belo Horizonte", status: "Prospect" }
  ],
  fornecedores: [
    { id: makeId(), nome: "Imobiliaria Centro", documento: "04.252.011/0001-10", telefone: "(11) 3000-1000", cidade: "Sao Paulo", status: "Ativo" },
    { id: makeId(), nome: "Operadora Fibra", documento: "11.222.333/0001-81", telefone: "(11) 4000-2020", cidade: "Campinas", status: "Ativo" }
  ],
  produtos: [
    { id: makeId(), nome: "Cadeira Operacional", categoria: "Moveis", preco: 420, estoque: 8, status: "Ativo" },
    { id: makeId(), nome: "Monitor 24 polegadas", categoria: "Informatica", preco: 980, estoque: 3, status: "Ativo" },
    { id: makeId(), nome: "Kit Expediente", categoria: "Suprimentos", preco: 75, estoque: 22, status: "Ativo" }
  ],
  vendas: [],
  contasReceber: [],
  contasPagar: []
};

demoState.vendas = [
  { id: makeId(), data: today(), cliente: "Ana Souza", produto: "Cadeira Operacional", status: "Faturada", total: 840 },
  { id: makeId(), data: today(-2), cliente: "Mercado Central", produto: "Kit Expediente", status: "Pendente", total: 375 }
];

demoState.contasReceber = [
  { id: makeId(), vencimento: today(5), descricao: "Venda Ana Souza", cliente: "Ana Souza", status: "Aberto", valor: 840 },
  { id: makeId(), vencimento: today(-1), descricao: "Venda Mercado Central", cliente: "Mercado Central", status: "Recebido", valor: 375 }
];

demoState.contasPagar = [
  { id: makeId(), vencimento: today(10), descricao: "Aluguel sala", fornecedor: "Imobiliaria Centro", status: "Aberto", valor: 1200 },
  { id: makeId(), vencimento: today(3), descricao: "Internet", fornecedor: "Operadora Fibra", status: "Aberto", valor: 149.9 }
];

const fields = {
  clientes: [
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "documento", label: "CNPJ", type: "text", required: true, cnpj: true },
    { name: "telefone", label: "Telefone", type: "text" },
    { name: "cidade", label: "Cidade", type: "text" },
    { name: "status", label: "Status", type: "select", options: ["Ativo", "Prospect", "Inativo"] }
  ],
  fornecedores: [
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "documento", label: "CNPJ", type: "text", required: true, cnpj: true },
    { name: "telefone", label: "Telefone", type: "text" },
    { name: "cidade", label: "Cidade", type: "text" },
    { name: "status", label: "Status", type: "select", options: ["Ativo", "Suspenso", "Inativo"] }
  ],
  produtos: [
    { name: "nome", label: "Produto", type: "text", required: true },
    { name: "categoria", label: "Categoria", type: "text" },
    { name: "preco", label: "Preco", type: "number", step: "0.01", required: true },
    { name: "estoque", label: "Estoque", type: "number", required: true },
    { name: "status", label: "Status", type: "select", options: ["Ativo", "Pausado", "Inativo"] }
  ],
  vendas: [
    { name: "data", label: "Data", type: "date", required: true },
    { name: "cliente", label: "Cliente", type: "select", relation: "clientes", required: true },
    { name: "produto", label: "Produto", type: "text", required: true },
    { name: "status", label: "Status", type: "select", options: ["Pendente", "Faturada", "Cancelada"] },
    { name: "total", label: "Total", type: "number", step: "0.01", required: true }
  ],
  contasReceber: [
    { name: "vencimento", label: "Vencimento", type: "date", required: true },
    { name: "descricao", label: "Descricao", type: "text", required: true },
    { name: "cliente", label: "Cliente", type: "select", relation: "clientes", required: true },
    { name: "status", label: "Status", type: "select", options: ["Aberto", "Recebido", "Atrasado", "Cancelado"] },
    { name: "valor", label: "Valor", type: "number", step: "0.01", required: true }
  ],
  contasPagar: [
    { name: "vencimento", label: "Vencimento", type: "date", required: true },
    { name: "descricao", label: "Descricao", type: "text", required: true },
    { name: "fornecedor", label: "Fornecedor", type: "select", relation: "fornecedores", required: true },
    { name: "status", label: "Status", type: "select", options: ["Aberto", "Pago", "Atrasado", "Cancelado"] },
    { name: "valor", label: "Valor", type: "number", step: "0.01", required: true }
  ],
  empresas: [
    { name: "nome", label: "Empresa", type: "text", required: true },
    { name: "documento", label: "CNPJ", type: "text", required: true, cnpj: true },
    { name: "status", label: "Status", type: "select", options: ["Ativa", "Suspensa", "Inativa"] }
  ],
  usuarios: [
    { name: "usuario", label: "Usuario", type: "text", required: true },
    { name: "senha", label: "Senha", type: "password", required: true },
    { name: "empresas", label: "Empresas autorizadas", type: "multiselect", relation: "empresas", required: true },
    { name: "perfil", label: "Perfil", type: "select", options: ["Administrador", "Operador", "Consulta"] },
    { name: "status", label: "Status", type: "select", options: ["Ativo", "Suspenso", "Inativo"] }
  ]
};

const moduleNames = {
  clientes: "Clientes",
  fornecedores: "Fornecedores",
  produtos: "Produtos",
  vendas: "Vendas",
  contasReceber: "Contas a Receber",
  contasPagar: "Contas a Pagar",
  acessos: "Acessos",
  empresas: "Empresas",
  usuarios: "Usuarios autorizados"
};

let activeTenant = DEFAULT_TENANT;
let activeTenantKey = tenantKey(DEFAULT_TENANT);
let activeTenantDocument = DEFAULT_TENANT_DOCUMENT;
let state = structuredClone(initialState);
let accessRegistry = loadAccessRegistry();
let currentView = "dashboard";
let editing = { module: null, id: null };
let pendingLogin = null;
let sessionCompanies = [];
let cnpjLookupTimer = null;
let lastCnpjLookupKey = "";

const dialog = document.querySelector("#record-dialog");
const form = document.querySelector("#record-form");
const dynamicFields = document.querySelector("#dynamic-fields");
const dialogError = document.querySelector("#dialog-error");
const loginScreen = document.querySelector("#login-screen");
const tenantScreen = document.querySelector("#tenant-screen");
const appShell = document.querySelector("#app-shell");
const loginForm = document.querySelector("#login-form");
const loginUser = document.querySelector("#login-user");
const loginPassword = document.querySelector("#login-password");
const rememberLogin = document.querySelector("#remember-login");
const loginError = document.querySelector("#login-error");
const tenantForm = document.querySelector("#tenant-form");
const tenantSelect = document.querySelector("#tenant-select");
const tenantError = document.querySelector("#tenant-error");
const activeTenantName = document.querySelector("#active-tenant-name");
const tenantSwitcher = document.querySelector("#tenant-switcher");
const menuToggle = document.querySelector("#menu-toggle");
const sidebarBackdrop = document.querySelector("#sidebar-backdrop");

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    setView(button.dataset.view);
    closeMenuOnMobile();
  });
});

menuToggle.addEventListener("click", () => {
  const isOpen = appShell.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

sidebarBackdrop.addEventListener("click", closeMenuOnMobile);

document.querySelector("#seed-data").addEventListener("click", () => {
  state = structuredClone(demoState);
  saveState();
  render();
});

document.querySelector("#open-create").addEventListener("click", () => {
  const target = currentView === "dashboard" ? "contasReceber" : currentView === "acessos" ? "usuarios" : currentView;
  openForm(target);
});

document.querySelectorAll(".module-create").forEach((button) => {
  button.addEventListener("click", () => openForm(button.dataset.module));
});

document.querySelectorAll('input[type="search"]').forEach((input) => {
  input.addEventListener("input", render);
});

document.querySelectorAll(".dialog-cancel").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});

dynamicFields.addEventListener("input", (event) => {
  if (isCnpjField(editing.module, event.target.name)) {
    event.target.value = formatCnpj(event.target.value);
    scheduleCnpjLookup(event.target);
  }
});

dynamicFields.addEventListener("blur", (event) => {
  if (isCnpjField(editing.module, event.target.name)) {
    lookupCnpjCompany(event.target);
  }
}, true);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = loginUser.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    loginError.textContent = "Informe usuario e senha.";
    return;
  }

  loginError.textContent = "Validando acesso...";
  const accessCheck = await authorizeLogin(username, password);
  if (!accessCheck.allowed) {
    loginError.textContent = accessCheck.message;
    return;
  }

  pendingLogin = { username, password, companies: accessCheck.companies };
  loginError.textContent = "";
  if (accessCheck.companies.length === 1) {
    completeLogin(accessCheck.companies[0]);
    return;
  }

  showTenantSelection(accessCheck.companies);
});

tenantForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!pendingLogin || !tenantSelect.value) {
    tenantError.textContent = "Selecione uma empresa.";
    return;
  }
  completeLogin(tenantSelect.value);
});

tenantSwitcher.addEventListener("change", () => {
  if (tenantSwitcher.value) {
    setTenant(tenantSwitcher.value);
  }
});

document.querySelector("#tenant-back").addEventListener("click", () => {
  pendingLogin = null;
  tenantScreen.classList.add("is-hidden");
  loginScreen.classList.remove("is-hidden");
  loginPassword.focus();
});

document.querySelector("#logout-button").addEventListener("click", () => {
  sessionCompanies = [];
  appShell.classList.add("is-hidden");
  loginScreen.classList.remove("is-hidden");
  tenantScreen.classList.add("is-hidden");
  loginPassword.select();
  loginPassword.focus();
});

form.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") {
    return;
  }

  event.preventDefault();
  const record = collectFormRecord();
  normalizeRecord(record, editing.module);
  const validation = validateRecord(record, editing.module);
  if (!validation.valid) {
    dialogError.textContent = validation.message;
    return;
  }

  const collection = getModuleCollection(editing.module);
  if (editing.id) {
    setModuleCollection(editing.module, collection.map((item) =>
      item.id === editing.id ? { ...item, ...record } : item
    ));
  } else {
    setModuleCollection(editing.module, [...collection, { id: makeId(), ...record }]);
  }

  saveModuleCollection(editing.module);
  dialog.close();
  render();
});

function setView(view) {
  currentView = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}-view`);
  });
  document.querySelector("#page-title").textContent = view === "dashboard" ? "Dashboard" : moduleNames[view];
}

function openForm(module, id = null) {
  editing = { module, id };
  const record = id ? getModuleCollection(module).find((item) => item.id === id) : {};

  dialogError.textContent = "";
  lastCnpjLookupKey = "";
  document.querySelector("#dialog-module").textContent = moduleNames[module];
  document.querySelector("#dialog-title").textContent = id ? "Editar registro" : "Novo registro";
  dynamicFields.innerHTML = fields[module].map((field) => fieldTemplate(field, record[field.name])).join("");

  dialog.showModal();
}

function fieldTemplate(field, value = "") {
  const required = field.required ? "required" : "";
  if (field.type === "multiselect") {
    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
    const options = relatedOptions(field.relation, "").map((option) => `
      <label class="check-field option-check">
        <input name="${field.name}" type="checkbox" value="${escapeAttr(option.value || option)}" ${selectedValues.includes(option.value || option) ? "checked" : ""} />
        <span>${escapeHtml(option.label || option)}</span>
      </label>
    `).join("");
    return `
      <fieldset class="field option-group" ${required ? "data-required-group" : ""}>
        <legend>${field.label}</legend>
        ${options || `<span class="empty-inline">Cadastre uma empresa ativa antes.</span>`}
      </fieldset>
    `;
  }

  if (field.type === "select") {
    const optionsSource = field.relation ? relatedOptions(field.relation, value) : field.options;
    const placeholder = field.relation ? `<option value="">Selecione</option>` : "";
    const options = optionsSource
      .map((option) => {
        const optionValue = option.value || option;
        const optionLabel = option.label || option;
        return `<option value="${escapeAttr(optionValue)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
      })
      .join("");
    return `<label class="field"><span>${field.label}</span><select name="${field.name}" ${required}>${placeholder}${options}</select></label>`;
  }

  const inputValue = field.cnpj ? formatCnpj(value || "") : value || "";
  return `<label class="field"><span>${field.label}</span><input name="${field.name}" type="${field.type}" step="${field.step || ""}" value="${escapeAttr(inputValue)}" ${required}></label>`;
}

function collectFormRecord() {
  const formData = new FormData(form);
  const record = Object.fromEntries(formData.entries());
  fields[editing.module].forEach((field) => {
    if (field.type === "multiselect") {
      record[field.name] = formData.getAll(field.name);
    }
  });
  return record;
}

function normalizeRecord(record, module) {
  if (module === "usuarios" && (!record.empresas || !record.empresas.length)) {
    record.empresas = [];
  }
  normalizeCnpjFields(record, module);
  if (module === "produtos") {
    record.preco = Number(record.preco || 0);
    record.estoque = Number(record.estoque || 0);
  }
  if (module === "vendas") {
    record.total = Number(record.total || 0);
  }
  if (module === "contasReceber" || module === "contasPagar") {
    record.valor = Number(record.valor || 0);
  }
}

function validateRecord(record, module) {
  const invalidCnpjField = fields[module].find((field) => field.cnpj && !isValidCnpj(record[field.name]));
  if (invalidCnpjField) {
    return { valid: false, message: `Informe um ${invalidCnpjField.label} valido.` };
  }
  return { valid: true };
}

function normalizeCnpjFields(record, module) {
  fields[module].forEach((field) => {
    if (field.cnpj) {
      record[field.name] = formatCnpj(record[field.name]);
    }
  });
}

function isCnpjField(module, fieldName) {
  return Boolean(fields[module]?.find((field) => field.name === fieldName && field.cnpj));
}

function render() {
  activeTenantName.textContent = activeTenant;
  renderTenantSwitcher();
  renderDashboard();
  renderClientes();
  renderFornecedores();
  renderProdutos();
  renderVendas();
  renderContasReceber();
  renderContasPagar();
  renderAcessos();
}

function renderDashboard() {
  const revenue = state.vendas
    .filter((sale) => sale.status !== "Cancelada")
    .reduce((sum, sale) => sum + Number(sale.total), 0);
  const receivableTotal = state.contasReceber
    .filter((item) => item.status !== "Cancelado")
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const payableTotal = state.contasPagar
    .filter((item) => item.status !== "Cancelado")
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const balance = receivableTotal - payableTotal;
  const lowStock = state.produtos.filter((product) => Number(product.estoque) <= 5);

  document.querySelector("#metric-revenue").textContent = money(revenue);
  document.querySelector("#metric-revenue-detail").textContent = `${state.vendas.length} vendas registradas`;
  document.querySelector("#metric-customers").textContent = state.clientes.length;
  document.querySelector("#metric-products").textContent = state.produtos.length;
  document.querySelector("#metric-stock-alert").textContent = lowStock.length ? `${lowStock.length} itens com estoque baixo` : "sem alertas de estoque";
  document.querySelector("#metric-balance").textContent = money(balance);

  document.querySelector("#recent-sales").innerHTML = state.vendas.slice(-5).reverse().map((sale) => `
    <tr>
      <td>${escapeHtml(sale.cliente)}</td>
      <td>${escapeHtml(sale.produto)}</td>
      <td>${badge(sale.status)}</td>
      <td class="align-right">${money(sale.total)}</td>
    </tr>
  `).join("") || `<tr><td colspan="4" class="empty-state">Nenhuma venda registrada.</td></tr>`;

  document.querySelector("#stock-list").innerHTML = lowStock.map((product) => `
    <div class="stack-item">
      <div>
        <strong>${escapeHtml(product.nome)}</strong>
        <span>${escapeHtml(product.categoria || "Sem categoria")}</span>
      </div>
      ${badge(`${product.estoque} un`, "warn")}
    </div>
  `).join("") || `<div class="empty-state">Nenhum produto em estoque baixo.</div>`;
}

function renderClientes() {
  const query = getQuery("clientes");
  const rows = state.clientes.filter((item) => matches(item, query)).map((client) => `
    <tr>
      <td>${escapeHtml(client.nome)}</td>
      <td>${escapeHtml(client.documento ? formatCnpj(client.documento) : "-")}</td>
      <td>${escapeHtml(client.telefone || "-")}</td>
      <td>${escapeHtml(client.cidade || "-")}</td>
      <td>${badge(client.status)}</td>
      <td class="align-right">${rowActions("clientes", client.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#clientes-table").innerHTML = rows || emptyRow(6, "Nenhum cliente encontrado.");
}

function renderFornecedores() {
  const query = getQuery("fornecedores");
  const rows = state.fornecedores.filter((item) => matches(item, query)).map((supplier) => `
    <tr>
      <td>${escapeHtml(supplier.nome)}</td>
      <td>${escapeHtml(supplier.documento ? formatCnpj(supplier.documento) : "-")}</td>
      <td>${escapeHtml(supplier.telefone || "-")}</td>
      <td>${escapeHtml(supplier.cidade || "-")}</td>
      <td>${badge(supplier.status)}</td>
      <td class="align-right">${rowActions("fornecedores", supplier.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#fornecedores-table").innerHTML = rows || emptyRow(6, "Nenhum fornecedor encontrado.");
}

function renderProdutos() {
  const query = getQuery("produtos");
  const rows = state.produtos.filter((item) => matches(item, query)).map((product) => `
    <tr>
      <td>${escapeHtml(product.nome)}</td>
      <td>${escapeHtml(product.categoria || "-")}</td>
      <td class="align-right">${money(product.preco)}</td>
      <td class="align-right">${product.estoque}</td>
      <td>${badge(Number(product.estoque) <= 5 ? "Baixo" : product.status, Number(product.estoque) <= 5 ? "warn" : undefined)}</td>
      <td class="align-right">${rowActions("produtos", product.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#produtos-table").innerHTML = rows || emptyRow(6, "Nenhum produto encontrado.");
}

function renderVendas() {
  const query = getQuery("vendas");
  const rows = state.vendas.filter((item) => matches(item, query)).map((sale) => `
    <tr>
      <td>${formatDate(sale.data)}</td>
      <td>${escapeHtml(sale.cliente)}</td>
      <td>${escapeHtml(sale.produto)}</td>
      <td>${badge(sale.status)}</td>
      <td class="align-right">${money(sale.total)}</td>
      <td class="align-right">${rowActions("vendas", sale.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#vendas-table").innerHTML = rows || emptyRow(6, "Nenhuma venda encontrada.");
}

function renderContasReceber() {
  const query = getQuery("contasReceber");
  const rows = state.contasReceber.filter((item) => matches(item, query)).map((entry) => `
    <tr>
      <td>${formatDate(entry.vencimento)}</td>
      <td>${escapeHtml(entry.descricao)}</td>
      <td>${escapeHtml(entry.cliente || "-")}</td>
      <td>${badge(entry.status)}</td>
      <td class="align-right">${money(entry.valor)}</td>
      <td class="align-right">${rowActions("contasReceber", entry.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#contasReceber-table").innerHTML = rows || emptyRow(6, "Nenhuma conta a receber encontrada.");
}

function renderContasPagar() {
  const query = getQuery("contasPagar");
  const rows = state.contasPagar.filter((item) => matches(item, query)).map((entry) => `
    <tr>
      <td>${formatDate(entry.vencimento)}</td>
      <td>${escapeHtml(entry.descricao)}</td>
      <td>${escapeHtml(entry.fornecedor || "-")}</td>
      <td>${badge(entry.status)}</td>
      <td class="align-right">${money(entry.valor)}</td>
      <td class="align-right">${rowActions("contasPagar", entry.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#contasPagar-table").innerHTML = rows || emptyRow(6, "Nenhuma conta a pagar encontrada.");
}

function renderAcessos() {
  renderEmpresas();
  renderUsuarios();
}

function renderEmpresas() {
  const query = getQuery("empresas");
  const rows = accessRegistry.empresas.filter((item) => matches(item, query)).map((company) => `
    <tr>
      <td>${escapeHtml(company.nome)}</td>
      <td>${escapeHtml(company.documento ? formatCnpj(company.documento) : "-")}</td>
      <td>${badge(company.status)}</td>
      <td class="align-right">${rowActions("empresas", company.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#empresas-table").innerHTML = rows || emptyRow(4, "Nenhuma empresa cadastrada.");
}

function renderUsuarios() {
  const query = getQuery("usuarios");
  const rows = accessRegistry.usuarios.filter((item) => matches(item, query)).map((user) => `
    <tr>
      <td>${escapeHtml(user.usuario)}</td>
      <td>${escapeHtml(userCompanies(user).map(companyNameByDocument).join(", ") || "-")}</td>
      <td>${escapeHtml(user.perfil || "-")}</td>
      <td>${badge(user.status)}</td>
      <td class="align-right">${rowActions("usuarios", user.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#usuarios-table").innerHTML = rows || emptyRow(5, "Nenhum usuario autorizado.");
}

function rowActions(module, id) {
  return `
    <button class="ghost-button" type="button" onclick="openForm('${module}', '${id}')">Editar</button>
    <button class="danger-button" type="button" onclick="removeRecord('${module}', '${id}')">Excluir</button>
  `;
}

function removeRecord(module, id) {
  const collection = getModuleCollection(module);
  const nextCollection = collection.filter((item) => item.id !== id);
  setModuleCollection(module, nextCollection);
  saveModuleCollection(module);
  render();
}

function badge(text, tone) {
  const chosenTone = tone || (["Ativo", "Ativa", "Faturada", "Pago", "Recebido"].includes(text) ? "success" : ["Atrasado", "Cancelada", "Cancelado", "Inativo", "Inativa", "Suspensa", "Suspenso"].includes(text) ? "danger" : "warn");
  return `<span class="badge ${chosenTone}">${escapeHtml(text)}</span>`;
}

function emptyRow(colspan, text) {
  return `<tr><td colspan="${colspan}" class="empty-state">${text}</td></tr>`;
}

function matches(item, query) {
  if (!query) return true;
  return Object.values(item).flat().join(" ").toLowerCase().includes(query);
}

function getQuery(module) {
  return document.querySelector(`#${module}-search`)?.value.trim().toLowerCase() || "";
}

function relatedOptions(module, currentValue) {
  if (module === "empresas") {
    return relatedCompanyOptions(currentValue);
  }

  const options = getModuleCollection(module)
    .filter((item) => item.status !== "Inativo" && item.status !== "Suspenso")
    .map((item) => item.nome || item.usuario)
    .filter(Boolean);
  if (currentValue && !options.includes(currentValue)) {
    options.push(currentValue);
  }
  return options;
}

function relatedCompanyOptions(currentValue) {
  const options = accessRegistry.empresas
    .filter((company) => company.status === "Ativa")
    .map((company) => ({ label: company.nome, value: company.documento }))
    .filter((company) => company.value);
  if (currentValue && !options.some((company) => company.value === currentValue)) {
    const company = companyByDocument(currentValue);
    options.push({ label: company?.nome || currentValue, value: currentValue });
  }
  return options;
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function today(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function loadState() {
  const raw = localStorage.getItem(storageKeyForTenant(activeTenantKey));
  if (!raw) return structuredClone(initialState);
  try {
    return migrateState({ ...structuredClone(initialState), ...JSON.parse(raw) });
  } catch {
    return structuredClone(initialState);
  }
}

function migrateState(savedState) {
  if (Array.isArray(savedState.clientes)) {
    savedState.clientes = savedState.clientes.map((client) => ({
      ...client,
      documento: normalizeCompanyDocument(client.documento)
    }));
  }
  if (!Array.isArray(savedState.fornecedores)) {
    savedState.fornecedores = [];
  }
  savedState.fornecedores = savedState.fornecedores.map((supplier) => ({
    ...supplier,
    documento: normalizeCompanyDocument(supplier.documento)
  }));
  const legacyFinancial = Array.isArray(savedState.financeiro) ? savedState.financeiro : [];
  if (legacyFinancial.length && !savedState.contasReceber.length && !savedState.contasPagar.length) {
    savedState.contasReceber = legacyFinancial
      .filter((item) => item.tipo !== "Saida")
      .map(({ tipo, ...item }) => ({ ...item, cliente: item.cliente || "Cliente nao informado" }));
    savedState.contasPagar = legacyFinancial
      .filter((item) => item.tipo === "Saida")
      .map(({ tipo, ...item }) => ({ ...item, fornecedor: item.fornecedor || "Fornecedor nao informado" }));
  }
  delete savedState.financeiro;
  return savedState;
}

function getModuleCollection(module) {
  if (module === "empresas" || module === "usuarios") {
    return accessRegistry[module];
  }
  return state[module];
}

function setModuleCollection(module, collection) {
  if (module === "empresas" || module === "usuarios") {
    accessRegistry[module] = collection;
    return;
  }
  state[module] = collection;
}

function saveModuleCollection(module) {
  if (module === "empresas" || module === "usuarios") {
    saveAccessRegistry();
    return;
  }
  saveState();
}

function closeMenuOnMobile() {
  if (window.matchMedia("(max-width: 980px)").matches) {
    appShell.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
}

function saveState() {
  localStorage.setItem(storageKeyForTenant(activeTenantKey), JSON.stringify(state));
}

function loadAccessRegistry() {
  const raw = localStorage.getItem(ACCESS_REGISTRY_KEY);
  if (!raw) return structuredClone(initialAccessRegistry);
  try {
    return migrateAccessRegistry({ ...structuredClone(initialAccessRegistry), ...JSON.parse(raw) });
  } catch {
    return structuredClone(initialAccessRegistry);
  }
}

function migrateAccessRegistry(registry) {
  registry.empresas = Array.isArray(registry.empresas) ? registry.empresas : [];
  registry.usuarios = Array.isArray(registry.usuarios) ? registry.usuarios : [];
  const legacyCompanyDocuments = new Map();
  registry.empresas = registry.empresas.map((company) => {
    const document = normalizeCompanyDocument(company.documento) || legacyCompanyDocument(company.nome);
    legacyCompanyDocuments.set(normalizeLookup(company.nome), document);
    return { ...company, documento: document };
  });
  registry.usuarios = registry.usuarios.map((user) => ({
    ...user,
    empresas: (Array.isArray(user.empresas) ? user.empresas : user.empresa ? [user.empresa] : [])
      .map((companyRef) => companyDocumentFromReference(companyRef, registry.empresas, legacyCompanyDocuments))
      .filter(Boolean)
  }));
  return registry;
}

function saveAccessRegistry() {
  localStorage.setItem(ACCESS_REGISTRY_KEY, JSON.stringify(accessRegistry));
}

async function authorizeLogin(username, password) {
  if (isSupabaseConfigured()) {
    const onlineAccess = await authorizeLoginOnline(username, password);
    if (onlineAccess.available) {
      return onlineAccess;
    }
  }

  return authorizeLoginLocal(username, password);
}

function authorizeLoginLocal(username, password) {
  if (!accessRegistry.empresas.length && !accessRegistry.usuarios.length) {
    bootstrapAccessRegistry(username, DEFAULT_TENANT, password);
    return { allowed: true, companies: [DEFAULT_TENANT_DOCUMENT] };
  }

  const user = accessRegistry.usuarios.find((item) =>
    sameText(item.usuario, username) &&
    item.senha === password &&
    item.status === "Ativo"
  );
  if (!user) {
    return { allowed: false, message: "Usuario ou senha nao autorizados." };
  }

  const companies = userCompanies(user).filter((companyDocument) =>
    accessRegistry.empresas.some((company) => sameText(company.documento, companyDocument) && company.status === "Ativa")
  );
  if (!companies.length) {
    const recoveredCompanies = recoverUserCompanies(user);
    if (recoveredCompanies.length) {
      return { allowed: true, companies: recoveredCompanies };
    }
    return { allowed: false, message: "Usuario sem empresa ativa autorizada." };
  }

  return { allowed: true, companies };
}

async function authorizeLoginOnline(username, password) {
  try {
    const user = await supabaseGetSingle("usuarios", {
      usuario: `eq.${username}`,
      senha: `eq.${password}`,
      status: "eq.Ativo",
      select: "id,usuario,perfil,status"
    });

    if (!user) {
      return { available: true, allowed: false, message: "Usuario ou senha nao autorizados." };
    }

    const links = await supabaseGetMany("usuario_empresas", {
      usuario_id: `eq.${user.id}`,
      select: "empresas(id,nome,documento,status)"
    });

    const companies = links
      .map((link) => link.empresas)
      .filter((company) => company?.status === "Ativa" && company.documento);

    if (!companies.length) {
      return { available: true, allowed: false, message: "Usuario sem empresa ativa autorizada." };
    }

    mergeOnlineCompanies(companies);
    return { available: true, allowed: true, companies: companies.map((company) => company.documento) };
  } catch {
    return { available: false, allowed: false, message: "Nao foi possivel validar online." };
  }
}

function isSupabaseConfigured() {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
}

async function supabaseGetSingle(table, params) {
  const rows = await supabaseGetMany(table, { ...params, limit: "1" });
  return rows[0] || null;
}

async function supabaseGetMany(table, params) {
  const baseUrl = SUPABASE_CONFIG.url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const url = new URL(`${baseUrl}/rest/v1/${table}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_CONFIG.anonKey,
      Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  return response.json();
}

function mergeOnlineCompanies(companies) {
  companies.forEach((company) => {
    const existing = accessRegistry.empresas.find((item) => sameText(item.documento, company.documento));
    if (existing) {
      existing.nome = company.nome;
      existing.status = company.status;
      return;
    }

    accessRegistry.empresas.push({
      id: company.id || makeId(),
      nome: company.nome,
      documento: company.documento,
      status: company.status || "Ativa"
    });
  });
  saveAccessRegistry();
}

function bootstrapAccessRegistry(username, tenant, password) {
  accessRegistry = {
    empresas: [
      { id: makeId(), nome: tenant, documento: DEFAULT_TENANT_DOCUMENT, status: "Ativa" }
    ],
    usuarios: [
      { id: makeId(), usuario: username, senha: password, empresas: [DEFAULT_TENANT_DOCUMENT], perfil: "Administrador", status: "Ativo" }
    ]
  };
  saveAccessRegistry();
}

function userCompanies(user) {
  return Array.isArray(user.empresas) ? user.empresas : user.empresa ? [user.empresa] : [];
}

function recoverUserCompanies(user) {
  const activeCompanies = accessRegistry.empresas.filter((company) => company.status === "Ativa");
  const company = activeCompanies[0] || ensureDefaultCompany();
  if (!company?.documento) return [];

  user.empresas = [company.documento];
  delete user.empresa;
  saveAccessRegistry();
  return [company.documento];
}

function ensureDefaultCompany() {
  let company = accessRegistry.empresas.find((item) => sameText(item.documento, DEFAULT_TENANT_DOCUMENT));
  if (company) {
    company.status = "Ativa";
    return company;
  }

  company = { id: makeId(), nome: DEFAULT_TENANT, documento: DEFAULT_TENANT_DOCUMENT, status: "Ativa" };
  accessRegistry.empresas.push(company);
  return company;
}

function companyByDocument(document) {
  return accessRegistry.empresas.find((company) => sameText(company.documento, document));
}

function companyNameByDocument(document) {
  return companyByDocument(document)?.nome || document;
}

function companyDocumentFromReference(reference, companies, legacyCompanyDocuments) {
  const normalizedReference = normalizeDocument(reference);
  const formattedReference = normalizeCompanyDocument(reference);
  if (companies.some((company) => sameText(company.documento, formattedReference))) {
    return formattedReference;
  }
  if (companies.some((company) => sameText(company.documento, normalizedReference))) {
    return normalizedReference;
  }
  return legacyCompanyDocuments.get(normalizeLookup(reference)) || normalizedReference;
}

function legacyCompanyDocument(companyName) {
  return `LEGADO-${tenantKey(companyName).toUpperCase()}`;
}

function normalizeDocument(document) {
  return String(document || "").trim();
}

function normalizeCompanyDocument(document) {
  const digits = onlyDigits(document);
  if (digits.length === 14) return formatCnpj(digits);
  return normalizeDocument(document);
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function isValidCnpj(value) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (base, weights) => {
    const total = weights.reduce((sum, weight, index) => sum + Number(base[index]) * weight, 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}

function scheduleCnpjLookup(input) {
  clearTimeout(cnpjLookupTimer);
  cnpjLookupTimer = setTimeout(() => lookupCnpjCompany(input), 650);
}

async function lookupCnpjCompany(input) {
  const cnpj = onlyDigits(input.value);
  if (!isValidCnpj(cnpj)) return;

  const lookupKey = `${editing.module}:${cnpj}`;
  if (lookupKey === lastCnpjLookupKey) return;
  lastCnpjLookupKey = lookupKey;

  const nameInput = form.querySelector('[name="nome"]');
  if (!nameInput) return;

  try {
    dialogError.textContent = "Consultando CNPJ...";
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!response.ok) {
      dialogError.textContent = "CNPJ valido, mas nao encontrado na consulta publica.";
      return;
    }

    const company = await response.json();
    const companyName = company.razao_social || company.nome_fantasia;
    if (companyName) {
      nameInput.value = companyName;
      dialogError.textContent = "";
    } else {
      dialogError.textContent = "CNPJ encontrado, mas sem razao social retornada.";
    }
  } catch {
    dialogError.textContent = "Nao foi possivel consultar a razao social agora.";
  }
}

function normalizeLookup(value) {
  return String(value || "").trim().toLowerCase();
}

function sameText(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

function initLogin() {
  migrateLegacyStateToTenant();
  const remembered = loadRememberedLogin();
  if (remembered) {
    loginUser.value = remembered.username;
    loginPassword.value = remembered.password;
    rememberLogin.checked = true;
  }
  loginScreen.classList.remove("is-hidden");
  tenantScreen.classList.add("is-hidden");
  appShell.classList.add("is-hidden");
  (loginUser.value ? loginPassword : loginUser).focus();
}

function loadRememberedLogin() {
  const raw = localStorage.getItem(REMEMBERED_LOGIN_KEY);
  if (!raw) return null;
  try {
    const remembered = JSON.parse(raw);
    if (!remembered.username || !remembered.password) return null;
    return remembered;
  } catch {
    localStorage.removeItem(REMEMBERED_LOGIN_KEY);
    return null;
  }
}

function setTenant(tenantName) {
  const company = companyByDocument(tenantName);
  activeTenantDocument = company?.documento || tenantName;
  activeTenant = company?.nome || tenantName;
  activeTenantKey = tenantKey(company?.documento || tenantName);
  state = loadState();
  setView("dashboard");
  render();
}

function storageKeyForTenant(key) {
  return `${STORAGE_KEY}:${key}`;
}

function tenantKey(tenantName) {
  return tenantName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "empresa";
}

function migrateLegacyStateToTenant() {
  const legacyRaw = localStorage.getItem(STORAGE_KEY);
  const defaultTenantStorageKey = storageKeyForTenant(tenantKey(DEFAULT_TENANT));
  if (!legacyRaw || localStorage.getItem(defaultTenantStorageKey)) return;
  localStorage.setItem(defaultTenantStorageKey, legacyRaw);
}

function showApp() {
  loginScreen.classList.add("is-hidden");
  tenantScreen.classList.add("is-hidden");
  appShell.classList.remove("is-hidden");
  const shouldOpenMenu = !window.matchMedia("(max-width: 980px)").matches;
  appShell.classList.toggle("menu-open", shouldOpenMenu);
  menuToggle.setAttribute("aria-expanded", String(shouldOpenMenu));
}

function showTenantSelection(companies) {
  tenantSelect.innerHTML = companies
    .map((companyDocument) => `<option value="${escapeAttr(companyDocument)}">${escapeHtml(companyNameByDocument(companyDocument))}</option>`)
    .join("");
  tenantError.textContent = "";
  loginScreen.classList.add("is-hidden");
  tenantScreen.classList.remove("is-hidden");
  tenantSelect.focus();
}

function completeLogin(tenant) {
  sessionCompanies = pendingLogin?.companies || [tenant];
  setTenant(tenant);
  if (rememberLogin.checked && pendingLogin) {
    localStorage.setItem(REMEMBERED_LOGIN_KEY, JSON.stringify({
      username: pendingLogin.username,
      password: pendingLogin.password
    }));
  } else {
    localStorage.removeItem(REMEMBERED_LOGIN_KEY);
  }
  pendingLogin = null;
  showApp();
}

function renderTenantSwitcher() {
  const tenantContainer = tenantSwitcher.closest(".sidebar-tenant");
  const availableCompanies = sessionCompanies.filter((companyDocument) => companyByDocument(companyDocument)?.status === "Ativa");
  tenantContainer.classList.toggle("has-switcher", availableCompanies.length > 1);
  tenantSwitcher.innerHTML = availableCompanies
    .map((companyDocument) => `<option value="${escapeAttr(companyDocument)}" ${sameText(companyDocument, activeTenantDocument) ? "selected" : ""}>${escapeHtml(companyNameByDocument(companyDocument))}</option>`)
    .join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}

initLogin();
