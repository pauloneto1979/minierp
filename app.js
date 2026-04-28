const STORAGE_KEY = "minierp-state-v1";
const REMEMBERED_LOGIN_KEY = "minierp-remembered-login";
const ACCESS_REGISTRY_KEY = "minierp-access-registry-v1";
const MIGRATION_ID_MAP_KEY = "minierp-supabase-id-map-v1";
const DEFAULT_TENANT = "Minha Empresa LTDA";
const DEFAULT_TENANT_DOCUMENT = "11.444.777/0001-61";
const SUPABASE_CONFIG = window.MINIERP_CONFIG?.supabase || {};
const onlineDataModules = ["clientes", "fornecedores", "produtos", "vendas", "contasReceber", "contasPagar", "planoContas", "contasBancarias", "movimentacoes"];
const supabaseTables = {
  clientes: "clientes",
  fornecedores: "fornecedores",
  produtos: "produtos",
  vendas: "vendas",
  contasReceber: "contas_receber",
  contasPagar: "contas_pagar",
  planoContas: "plano_contas",
  contasBancarias: "contas_bancarias",
  movimentacoes: "movimentacoes_financeiras"
};

const makeId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeUuid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ Math.random() * 16 >> Number(char) / 4).toString(16)
  );
};

const initialState = {
  clientes: [],
  fornecedores: [],
  produtos: [],
  vendas: [],
  contasReceber: [],
  contasPagar: [],
  planoContas: [],
  contasBancarias: [],
  movimentacoes: []
};

const initialAccessRegistry = {
  empresas: [],
  usuarios: []
};

const demoState = {
  clientes: [
    { id: makeUuid(), nome: "Ana Souza", documento: "123.456.789-00", telefone: "(11) 98888-1010", cidade: "Sao Paulo", status: "Ativo" },
    { id: makeUuid(), nome: "Mercado Central", documento: "12.345.678/0001-95", telefone: "(21) 3333-4400", cidade: "Rio de Janeiro", status: "Ativo" },
    { id: makeUuid(), nome: "Oficina Lima", documento: "45.723.174/0001-10", telefone: "(31) 3444-9000", cidade: "Belo Horizonte", status: "Prospect" }
  ],
  fornecedores: [
    { id: makeUuid(), nome: "Imobiliaria Centro", documento: "04.252.011/0001-10", telefone: "(11) 3000-1000", cidade: "Sao Paulo", status: "Ativo" },
    { id: makeUuid(), nome: "Operadora Fibra", documento: "11.222.333/0001-81", telefone: "(11) 4000-2020", cidade: "Campinas", status: "Ativo" }
  ],
  produtos: [
    { id: makeUuid(), nome: "Cadeira Operacional", categoria: "Moveis", preco: 420, estoque: 8, status: "Ativo" },
    { id: makeUuid(), nome: "Monitor 24 polegadas", categoria: "Informatica", preco: 980, estoque: 3, status: "Ativo" },
    { id: makeUuid(), nome: "Kit Expediente", categoria: "Suprimentos", preco: 75, estoque: 22, status: "Ativo" }
  ],
  vendas: [],
  contasReceber: [],
  contasPagar: [],
  planoContas: [
    { id: makeUuid(), nome: "Receita de vendas", tipo: "Receita", centroCusto: "Comercial", status: "Ativo" },
    { id: makeUuid(), nome: "Fornecedores", tipo: "Despesa", centroCusto: "Administrativo", status: "Ativo" }
  ],
  contasBancarias: [
    { id: makeUuid(), nome: "Caixa interno", banco: "Caixa", agencia: "", conta: "", tipo: "Caixa", saldoInicial: 0, status: "Ativa" }
  ],
  movimentacoes: []
};

demoState.vendas = [
  { id: makeUuid(), data: today(), cliente: "Ana Souza", produto: "Cadeira Operacional", status: "Faturada", total: 840 },
  { id: makeUuid(), data: today(-2), cliente: "Mercado Central", produto: "Kit Expediente", status: "Pendente", total: 375 }
];

demoState.contasReceber = [
  { id: makeUuid(), emissao: today(-1), vencimento: today(5), documento: "VEN-001", parcela: "1/1", descricao: "Venda Ana Souza", cliente: "Ana Souza", categoria: "Receita de vendas", contaBancaria: "Caixa interno", forma: "PIX", status: "Aberto", valor: 840, juros: 0, multa: 0, desconto: 0, valorRecebido: 0, dataBaixa: "" },
  { id: makeUuid(), emissao: today(-4), vencimento: today(-1), documento: "VEN-002", parcela: "1/1", descricao: "Venda Mercado Central", cliente: "Mercado Central", categoria: "Receita de vendas", contaBancaria: "Caixa interno", forma: "Transferencia", status: "Recebido", valor: 375, juros: 0, multa: 0, desconto: 0, valorRecebido: 375, dataBaixa: today(-1) }
];

demoState.contasPagar = [
  { id: makeUuid(), emissao: today(), vencimento: today(10), documento: "ALU-001", parcela: "1/1", descricao: "Aluguel sala", fornecedor: "Imobiliaria Centro", categoria: "Fornecedores", contaBancaria: "Caixa interno", forma: "Boleto", status: "Aberto", valor: 1200, juros: 0, multa: 0, desconto: 0, valorPago: 0, dataBaixa: "" },
  { id: makeUuid(), emissao: today(), vencimento: today(3), documento: "NET-001", parcela: "1/1", descricao: "Internet", fornecedor: "Operadora Fibra", categoria: "Fornecedores", contaBancaria: "Caixa interno", forma: "PIX", status: "Aberto", valor: 149.9, juros: 0, multa: 0, desconto: 0, valorPago: 0, dataBaixa: "" }
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
    { name: "emissao", label: "Emissao", type: "date", required: true },
    { name: "vencimento", label: "Vencimento", type: "date", required: true },
    { name: "documento", label: "Documento/NF", type: "text" },
    { name: "parcela", label: "Parcela", type: "text" },
    { name: "descricao", label: "Descricao", type: "text", required: true },
    { name: "cliente", label: "Cliente", type: "select", relation: "clientes", required: true },
    { name: "categoria", label: "Plano de contas", type: "select", relation: "planoContas" },
    { name: "contaBancaria", label: "Conta bancaria", type: "select", relation: "contasBancarias" },
    { name: "forma", label: "Forma", type: "select", options: ["PIX", "Boleto", "Cartao", "Dinheiro", "Transferencia"] },
    { name: "status", label: "Status", type: "select", options: ["Aberto", "Recebido parcial", "Recebido", "Atrasado", "Cancelado"] },
    { name: "valor", label: "Valor original", type: "number", step: "0.01", required: true },
    { name: "juros", label: "Juros", type: "number", step: "0.01" },
    { name: "multa", label: "Multa", type: "number", step: "0.01" },
    { name: "desconto", label: "Desconto", type: "number", step: "0.01" },
    { name: "valorRecebido", label: "Valor recebido", type: "number", step: "0.01" },
    { name: "dataBaixa", label: "Data baixa", type: "date" }
  ],
  contasPagar: [
    { name: "emissao", label: "Emissao", type: "date", required: true },
    { name: "vencimento", label: "Vencimento", type: "date", required: true },
    { name: "documento", label: "Documento/NF", type: "text" },
    { name: "parcela", label: "Parcela", type: "text" },
    { name: "descricao", label: "Descricao", type: "text", required: true },
    { name: "fornecedor", label: "Fornecedor", type: "select", relation: "fornecedores", required: true },
    { name: "categoria", label: "Plano de contas", type: "select", relation: "planoContas" },
    { name: "contaBancaria", label: "Conta bancaria", type: "select", relation: "contasBancarias" },
    { name: "forma", label: "Forma", type: "select", options: ["PIX", "Boleto", "Cartao", "Dinheiro", "Transferencia"] },
    { name: "status", label: "Status", type: "select", options: ["Aberto", "Pago parcial", "Pago", "Atrasado", "Cancelado"] },
    { name: "valor", label: "Valor original", type: "number", step: "0.01", required: true },
    { name: "juros", label: "Juros", type: "number", step: "0.01" },
    { name: "multa", label: "Multa", type: "number", step: "0.01" },
    { name: "desconto", label: "Desconto", type: "number", step: "0.01" },
    { name: "valorPago", label: "Valor pago", type: "number", step: "0.01" },
    { name: "dataBaixa", label: "Data baixa", type: "date" }
  ],
  planoContas: [
    { name: "nome", label: "Categoria", type: "text", required: true },
    { name: "tipo", label: "Tipo", type: "select", options: ["Receita", "Despesa", "Transferencia"], required: true },
    { name: "centroCusto", label: "Centro de custo", type: "text" },
    { name: "status", label: "Status", type: "select", options: ["Ativo", "Inativo"] }
  ],
  contasBancarias: [
    { name: "nome", label: "Conta", type: "text", required: true },
    { name: "banco", label: "Banco", type: "text" },
    { name: "agencia", label: "Agencia", type: "text" },
    { name: "conta", label: "Numero", type: "text" },
    { name: "tipo", label: "Tipo", type: "select", options: ["Conta corrente", "Poupanca", "Caixa", "Cartao"] },
    { name: "saldoInicial", label: "Saldo inicial", type: "number", step: "0.01" },
    { name: "status", label: "Status", type: "select", options: ["Ativa", "Inativa"] }
  ],
  movimentacoes: [
    { name: "data", label: "Data", type: "date", required: true },
    { name: "tipo", label: "Tipo", type: "select", options: ["Entrada", "Saida"], required: true },
    { name: "descricao", label: "Descricao", type: "text", required: true },
    { name: "contaBancaria", label: "Conta bancaria", type: "select", relation: "contasBancarias" },
    { name: "categoria", label: "Plano de contas", type: "select", relation: "planoContas" },
    { name: "centroCusto", label: "Centro de custo", type: "text" },
    { name: "forma", label: "Forma", type: "select", options: ["PIX", "Boleto", "Cartao", "Dinheiro", "Transferencia"] },
    { name: "valor", label: "Valor", type: "number", step: "0.01", required: true },
    { name: "status", label: "Status", type: "select", options: ["Realizado", "Previsto", "Conciliado"] }
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
  planoContas: "Plano de Contas",
  contasBancarias: "Contas Bancarias",
  movimentacoes: "Movimentacoes",
  fluxoCaixa: "Fluxo de Caixa",
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
let currentUsername = "";
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

document.querySelector("#seed-data").addEventListener("click", async () => {
  state = structuredClone(demoState);
  if (isSupabaseConfigured()) {
    await Promise.all(onlineDataModules.map((module) => saveOnlineModule(module)));
  } else {
    saveState();
  }
  render();
});

document.querySelector("#open-create").addEventListener("click", () => {
  const target = currentView === "dashboard" ? "contasReceber" : currentView === "acessos" ? "usuarios" : currentView === "fluxoCaixa" ? "movimentacoes" : currentView;
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
    await completeLogin(accessCheck.companies[0]);
    return;
  }

  showTenantSelection(accessCheck.companies);
});

tenantForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingLogin || !tenantSelect.value) {
    tenantError.textContent = "Selecione uma empresa.";
    return;
  }
  await completeLogin(tenantSelect.value);
});

tenantSwitcher.addEventListener("change", async () => {
  if (tenantSwitcher.value) {
    await setTenant(tenantSwitcher.value);
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

form.addEventListener("submit", async (event) => {
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
  const previousCollection = collection;
  const previousAccessRegistry = structuredClone(accessRegistry);
  if (editing.id) {
    setModuleCollection(editing.module, collection.map((item) =>
      item.id === editing.id ? { ...item, ...record } : item
    ));
  } else {
    setModuleCollection(editing.module, [...collection, { id: usesOnlineData(editing.module) ? makeUuid() : makeId(), ...record }]);
  }

  try {
    await saveModuleCollection(editing.module);
    refreshCurrentSessionCompanies();
  } catch {
    setModuleCollection(editing.module, previousCollection);
    accessRegistry = previousAccessRegistry;
    dialogError.textContent = "Nao foi possivel salvar no banco online.";
    return;
  }
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
        <span class="truncate-text option-label" title="${escapeAttr(option.fullLabel || option.label || option)}">${escapeHtml(option.shortLabel || option.label || option)}</span>
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
        const optionDisplay = option.shortLabel || optionLabel;
        return `<option value="${escapeAttr(optionValue)}" title="${escapeAttr(optionLabel)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(optionDisplay)}</option>`;
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
  if (["contasReceber", "contasPagar"].includes(module)) {
    ["valor", "juros", "multa", "desconto", "valorRecebido", "valorPago"].forEach((field) => {
      if (field in record) record[field] = Number(record[field] || 0);
    });
    if (!record.emissao) record.emissao = today();
    if (["Recebido", "Pago"].includes(record.status) && !record.dataBaixa) record.dataBaixa = today();
    if (module === "contasReceber" && record.status === "Recebido" && !record.valorRecebido) record.valorRecebido = totalReceivable(record);
    if (module === "contasPagar" && record.status === "Pago" && !record.valorPago) record.valorPago = totalPayable(record);
  }
  if (module === "contasBancarias") {
    record.saldoInicial = Number(record.saldoInicial || 0);
  }
  if (module === "movimentacoes") {
    record.valor = Number(record.valor || 0);
    if (!record.status) record.status = "Realizado";
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
  renderPlanoContas();
  renderContasBancarias();
  renderMovimentacoes();
  renderFluxoCaixa();
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
      <td>${escapeHtml(entry.descricao)}<br><small>${escapeHtml(entry.documento || "Sem documento")} ${escapeHtml(entry.parcela || "")}</small></td>
      <td>${escapeHtml(entry.cliente || "-")}</td>
      <td>${badge(entry.status)}</td>
      <td class="align-right">${money(totalReceivable(entry))}</td>
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
      <td>${escapeHtml(entry.descricao)}<br><small>${escapeHtml(entry.documento || "Sem documento")} ${escapeHtml(entry.parcela || "")}</small></td>
      <td>${escapeHtml(entry.fornecedor || "-")}</td>
      <td>${badge(entry.status)}</td>
      <td class="align-right">${money(totalPayable(entry))}</td>
      <td class="align-right">${rowActions("contasPagar", entry.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#contasPagar-table").innerHTML = rows || emptyRow(6, "Nenhuma conta a pagar encontrada.");
}

function renderPlanoContas() {
  const query = getQuery("planoContas");
  const rows = state.planoContas.filter((item) => matches(item, query)).map((account) => `
    <tr>
      <td>${escapeHtml(account.nome)}</td>
      <td>${badge(account.tipo, account.tipo === "Receita" ? "success" : account.tipo === "Despesa" ? "danger" : "warn")}</td>
      <td>${escapeHtml(account.centroCusto || "-")}</td>
      <td>${badge(account.status)}</td>
      <td class="align-right">${rowActions("planoContas", account.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#planoContas-table").innerHTML = rows || emptyRow(5, "Nenhuma categoria cadastrada.");
}

function renderContasBancarias() {
  const query = getQuery("contasBancarias");
  const rows = state.contasBancarias.filter((item) => matches(item, query)).map((account) => `
    <tr>
      <td>${escapeHtml(account.nome)}</td>
      <td>${escapeHtml(account.banco || "-")}</td>
      <td>${escapeHtml(account.tipo || "-")}</td>
      <td class="align-right">${money(bankBalance(account.nome))}</td>
      <td>${badge(account.status)}</td>
      <td class="align-right">${rowActions("contasBancarias", account.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#contasBancarias-table").innerHTML = rows || emptyRow(6, "Nenhuma conta bancaria cadastrada.");
}

function renderMovimentacoes() {
  const query = getQuery("movimentacoes");
  const rows = state.movimentacoes.filter((item) => matches(item, query)).map((movement) => `
    <tr>
      <td>${formatDate(movement.data)}</td>
      <td>${badge(movement.tipo, movement.tipo === "Entrada" ? "success" : "danger")}</td>
      <td>${escapeHtml(movement.descricao)}</td>
      <td>${escapeHtml(movement.contaBancaria || "-")}</td>
      <td>${escapeHtml(movement.categoria || "-")}</td>
      <td class="align-right">${money(movement.valor)}</td>
      <td>${badge(movement.status || "Realizado")}</td>
      <td class="align-right">${rowActions("movimentacoes", movement.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#movimentacoes-table").innerHTML = rows || emptyRow(8, "Nenhuma movimentacao encontrada.");
}

function renderFluxoCaixa() {
  const initialBalance = state.contasBancarias.reduce((sum, account) => sum + Number(account.saldoInicial || 0), 0);
  const realizedIn = state.movimentacoes.filter((item) => item.tipo === "Entrada").reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const realizedOut = state.movimentacoes.filter((item) => item.tipo === "Saida").reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const plannedIn = state.contasReceber.filter((item) => !["Recebido", "Cancelado"].includes(item.status)).reduce((sum, item) => sum + totalReceivable(item), 0);
  const plannedOut = state.contasPagar.filter((item) => !["Pago", "Cancelado"].includes(item.status)).reduce((sum, item) => sum + totalPayable(item), 0);
  const projected = initialBalance + realizedIn - realizedOut + plannedIn - plannedOut;

  document.querySelector("#cash-initial").textContent = money(initialBalance);
  document.querySelector("#cash-planned-in").textContent = money(plannedIn);
  document.querySelector("#cash-planned-out").textContent = money(plannedOut);
  document.querySelector("#cash-projected").textContent = money(projected);

  let runningBalance = initialBalance;
  const rows = cashFlowRows().map((item) => {
    runningBalance += item.tipo === "Entrada" ? item.valor : -item.valor;
    return `
      <tr>
        <td>${formatDate(item.data)}</td>
        <td>${escapeHtml(item.origem)}</td>
        <td>${escapeHtml(item.descricao)}</td>
        <td>${escapeHtml(item.contaBancaria || "-")}</td>
        <td class="align-right">${item.tipo === "Entrada" ? money(item.valor) : "-"}</td>
        <td class="align-right">${item.tipo === "Saida" ? money(item.valor) : "-"}</td>
        <td class="align-right">${money(runningBalance)}</td>
      </tr>
    `;
  }).join("");
  document.querySelector("#fluxoCaixa-table").innerHTML = rows || emptyRow(7, "Nenhum movimento financeiro encontrado.");
}

function renderAcessos() {
  renderEmpresas();
  renderUsuarios();
}

function renderEmpresas() {
  const query = getQuery("empresas");
  const rows = accessRegistry.empresas.filter((item) => matches(item, query)).map((company) => `
    <tr>
      <td><span class="truncate-text company-name-cell" title="${escapeAttr(company.nome)}">${escapeHtml(company.nome)}</span></td>
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
      <td>${companyLinksTemplate(userCompanies(user))}</td>
      <td>${escapeHtml(user.perfil || "-")}</td>
      <td>${badge(user.status)}</td>
      <td class="align-right">${rowActions("usuarios", user.id)}</td>
    </tr>
  `).join("");
  document.querySelector("#usuarios-table").innerHTML = rows || emptyRow(5, "Nenhum usuario autorizado.");
}

function companyLinksTemplate(companyDocuments) {
  const companyNames = companyDocuments.map(companyNameByDocument).filter(Boolean);
  if (!companyNames.length) return "-";
  const visibleCompanies = companyNames.slice(0, 3);
  const remaining = companyNames.length - visibleCompanies.length;
  const fullTitle = companyNames.join(", ");
  const chips = visibleCompanies.map((name) =>
    `<span class="company-chip truncate-text" title="${escapeAttr(name)}">${escapeHtml(name)}</span>`
  ).join("");
  const moreChip = remaining > 0 ? `<span class="company-chip muted-chip" title="${escapeAttr(fullTitle)}">+${remaining}</span>` : "";
  return `<div class="company-chip-list" title="${escapeAttr(fullTitle)}">${chips}${moreChip}</div>`;
}

function rowActions(module, id) {
  return `
    <button class="ghost-button" type="button" onclick="openForm('${module}', '${id}')">Editar</button>
    <button class="danger-button" type="button" onclick="removeRecord('${module}', '${id}')">Excluir</button>
  `;
}

async function removeRecord(module, id) {
  const collection = getModuleCollection(module);
  const removedRecord = collection.find((item) => item.id === id);
  const nextCollection = collection.filter((item) => item.id !== id);
  const previousAccessRegistry = structuredClone(accessRegistry);
  setModuleCollection(module, nextCollection);
  try {
    await deleteModuleRecord(module, id, removedRecord);
    refreshCurrentSessionCompanies();
  } catch {
    setModuleCollection(module, collection);
    accessRegistry = previousAccessRegistry;
  }
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
    .filter((item) => !["Inativo", "Inativa", "Suspenso", "Suspensa"].includes(item.status))
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
    .map((company) => companyOption(company.nome, company.documento))
    .filter((company) => company.value);
  if (currentValue && !options.some((company) => company.value === currentValue)) {
    const company = companyByDocument(currentValue);
    options.push(companyOption(company?.nome || currentValue, currentValue));
  }
  return options;
}

function companyOption(name, value) {
  return {
    label: name,
    fullLabel: name,
    shortLabel: compactCompanyName(name),
    value
  };
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function totalReceivable(entry) {
  return Number(entry.valor || 0) + Number(entry.juros || 0) + Number(entry.multa || 0) - Number(entry.desconto || 0);
}

function totalPayable(entry) {
  return Number(entry.valor || 0) + Number(entry.juros || 0) + Number(entry.multa || 0) - Number(entry.desconto || 0);
}

function bankBalance(accountName) {
  const account = state.contasBancarias.find((item) => sameText(item.nome, accountName));
  const initial = Number(account?.saldoInicial || 0);
  return state.movimentacoes
    .filter((movement) => sameText(movement.contaBancaria, accountName) && movement.status !== "Previsto")
    .reduce((balance, movement) => balance + (movement.tipo === "Entrada" ? Number(movement.valor || 0) : -Number(movement.valor || 0)), initial);
}

function cashFlowRows() {
  const realized = state.movimentacoes.map((movement) => ({
    data: movement.data,
    origem: movement.origem || "Movimento",
    descricao: movement.descricao,
    contaBancaria: movement.contaBancaria,
    tipo: movement.tipo,
    valor: Number(movement.valor || 0)
  }));
  const plannedReceivables = state.contasReceber
    .filter((entry) => !["Recebido", "Cancelado"].includes(entry.status))
    .map((entry) => ({
      data: entry.vencimento,
      origem: "A receber",
      descricao: entry.descricao,
      contaBancaria: entry.contaBancaria,
      tipo: "Entrada",
      valor: totalReceivable(entry)
    }));
  const plannedPayables = state.contasPagar
    .filter((entry) => !["Pago", "Cancelado"].includes(entry.status))
    .map((entry) => ({
      data: entry.vencimento,
      origem: "A pagar",
      descricao: entry.descricao,
      contaBancaria: entry.contaBancaria,
      tipo: "Saida",
      valor: totalPayable(entry)
    }));
  return [...realized, ...plannedReceivables, ...plannedPayables]
    .filter((item) => item.data && item.valor)
    .sort((left, right) => left.data.localeCompare(right.data));
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
  Object.keys(initialState).forEach((module) => {
    if (!Array.isArray(savedState[module])) savedState[module] = [];
  });
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
  savedState.contasReceber = savedState.contasReceber.map((entry) => ({
    ...entry,
    emissao: entry.emissao || entry.vencimento || today(),
    documento: entry.documento || "",
    parcela: entry.parcela || "1/1",
    categoria: entry.categoria || "",
    contaBancaria: entry.contaBancaria || "",
    forma: entry.forma || "",
    juros: Number(entry.juros || 0),
    multa: Number(entry.multa || 0),
    desconto: Number(entry.desconto || 0),
    valorRecebido: Number(entry.valorRecebido || 0),
    dataBaixa: entry.dataBaixa || ""
  }));
  savedState.contasPagar = savedState.contasPagar.map((entry) => ({
    ...entry,
    emissao: entry.emissao || entry.vencimento || today(),
    documento: entry.documento || "",
    parcela: entry.parcela || "1/1",
    categoria: entry.categoria || "",
    contaBancaria: entry.contaBancaria || "",
    forma: entry.forma || "",
    juros: Number(entry.juros || 0),
    multa: Number(entry.multa || 0),
    desconto: Number(entry.desconto || 0),
    valorPago: Number(entry.valorPago || 0),
    dataBaixa: entry.dataBaixa || ""
  }));
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

async function saveModuleCollection(module) {
  if (module === "empresas" || module === "usuarios") {
    if (isSupabaseConfigured()) {
      await saveOnlineAccessRegistry(module);
    }
    saveAccessRegistry();
    return;
  }
  const movementUpdated = syncFinancialMovement(module);
  if (usesOnlineData(module)) {
    await saveOnlineModule(module);
    if (movementUpdated) await saveOnlineModule("movimentacoes");
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

function syncFinancialMovement(module) {
  if (!["contasReceber", "contasPagar"].includes(module)) return false;
  let changed = false;
  const isReceivable = module === "contasReceber";
  const paidStatus = isReceivable ? "Recebido" : "Pago";
  const entries = getModuleCollection(module);

  entries.forEach((entry) => {
    const existingIndex = state.movimentacoes.findIndex((movement) => movement.origemId === entry.id && movement.origem === module);
    if (entry.status !== paidStatus && existingIndex >= 0) {
      state.movimentacoes.splice(existingIndex, 1);
      changed = true;
      return;
    }
    if (entry.status !== paidStatus) return;

    const movement = {
      id: existingIndex >= 0 ? state.movimentacoes[existingIndex].id : makeUuid(),
      origem: module,
      origemId: entry.id,
      data: entry.dataBaixa || today(),
      tipo: isReceivable ? "Entrada" : "Saida",
      descricao: entry.descricao,
      contaBancaria: entry.contaBancaria || "",
      categoria: entry.categoria || "",
      centroCusto: costCenterByCategory(entry.categoria),
      forma: entry.forma || "",
      valor: isReceivable ? Number(entry.valorRecebido || totalReceivable(entry)) : Number(entry.valorPago || totalPayable(entry)),
      status: "Realizado"
    };

    if (existingIndex >= 0) {
      state.movimentacoes[existingIndex] = movement;
    } else {
      state.movimentacoes.push(movement);
    }
    changed = true;
  });
  return changed;
}

function costCenterByCategory(category) {
  return state.planoContas.find((item) => sameText(item.nome, category))?.centroCusto || "";
}

function usesOnlineData(module) {
  return isSupabaseConfigured() && onlineDataModules.includes(module);
}

async function migrateLocalDataToSupabase() {
  if (!isSupabaseConfigured()) return false;
  const localState = loadLocalStateForActiveTenant();
  const hasLocalRecords = onlineDataModules.some((module) => localState[module]?.length);
  const hasAccessRecords = accessRegistry.empresas.length || accessRegistry.usuarios.length;
  if (!hasLocalRecords && !hasAccessRecords) return false;

  const previousState = state;
  try {
    if (hasAccessRecords) {
      await migrateAccessRegistryToSupabase();
    }
    state = normalizeLocalStateForSupabase(localState);
    if (hasLocalRecords) {
      await Promise.all(onlineDataModules.map((module) => saveOnlineModule(module)));
      state = await loadOnlineState();
    }
    render();
  } catch (error) {
    state = previousState;
    throw error;
  }
  return true;
}

async function migrateAccessRegistryToSupabase() {
  await saveOnlineAccessRegistry("empresas");
  await saveOnlineAccessRegistry("usuarios");
}

async function saveOnlineAccessRegistry(module) {
  const companiesPayload = accessRegistry.empresas
    .map((company) => ({
      nome: company.nome,
      documento: normalizeCompanyDocument(company.documento),
      status: company.status || "Ativa"
    }))
    .filter((company) => company.nome && company.documento);

  const usersPayload = accessRegistry.usuarios
    .map((user) => ({
      usuario: user.usuario,
      senha: user.senha || "1234",
      perfil: user.perfil || "Administrador",
      status: user.status || "Ativo"
    }))
    .filter((user) => user.usuario && user.senha);

  if (module === "empresas" && companiesPayload.length) {
    await supabaseUpsert("empresas", companiesPayload, { onConflict: "documento" });
    return;
  }

  if (module !== "usuarios") return;

  const onlineCompanies = companiesPayload.length
    ? await supabaseUpsert("empresas", companiesPayload, { onConflict: "documento", returnRows: true })
    : [];
  const onlineUsers = usersPayload.length
    ? await supabaseUpsert("usuarios", usersPayload, { onConflict: "usuario", returnRows: true })
    : [];

  const companyIds = new Map(onlineCompanies.map((company) => [normalizeCompanyDocument(company.documento), company.id]));
  const userIds = new Map(onlineUsers.map((user) => [normalizeLookup(user.usuario), user.id]));
  const links = [];

  accessRegistry.usuarios.forEach((user) => {
    const userId = userIds.get(normalizeLookup(user.usuario));
    if (!userId) return;
    userCompanies(user).forEach((companyDocument) => {
      const companyId = companyIds.get(normalizeCompanyDocument(companyDocument));
      if (companyId) {
        links.push({ usuario_id: userId, empresa_id: companyId });
      }
    });
  });

  await Promise.all(onlineUsers.map((user) =>
    supabaseDelete("usuario_empresas", { usuario_id: `eq.${user.id}` })
  ));

  if (links.length) {
    await supabaseUpsert("usuario_empresas", links, { onConflict: "usuario_id,empresa_id" });
  }
}

async function loadOnlineAccessRegistry() {
  const [companies, users, links] = await Promise.all([
    supabaseGetMany("empresas", { select: "id,nome,documento,status" }),
    supabaseGetMany("usuarios", { select: "id,usuario,senha,perfil,status" }),
    supabaseGetMany("usuario_empresas", { select: "usuario_id,empresa_id" })
  ]);

  const companyDocumentsById = new Map(companies.map((company) => [company.id, normalizeCompanyDocument(company.documento)]));
  const companyLinksByUserId = new Map();
  links.forEach((link) => {
    const companyDocument = companyDocumentsById.get(link.empresa_id);
    if (!companyDocument) return;
    const currentLinks = companyLinksByUserId.get(link.usuario_id) || [];
    currentLinks.push(companyDocument);
    companyLinksByUserId.set(link.usuario_id, currentLinks);
  });

  accessRegistry = migrateAccessRegistry({
    empresas: companies.map((company) => ({
      id: company.id,
      nome: company.nome,
      documento: normalizeCompanyDocument(company.documento),
      status: company.status
    })),
    usuarios: users.map((user) => ({
      id: user.id,
      usuario: user.usuario,
      senha: user.senha,
      perfil: user.perfil,
      status: user.status,
      empresas: companyLinksByUserId.get(user.id) || []
    }))
  });
  saveAccessRegistry();
}

function loadLocalStateForActiveTenant() {
  const candidateKeys = [
    storageKeyForTenant(activeTenantKey),
    storageKeyForTenant(tenantKey(activeTenant)),
    storageKeyForTenant(tenantKey(activeTenantDocument)),
    STORAGE_KEY
  ];
  const mergedState = structuredClone(initialState);
  candidateKeys.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const savedState = migrateState({ ...structuredClone(initialState), ...JSON.parse(raw) });
      onlineDataModules.forEach((module) => {
        savedState[module].forEach((record) => {
          if (!mergedState[module].some((item) => sameText(item.id, record.id))) {
            mergedState[module].push(record);
          }
        });
      });
    } catch {
      // Ignore unreadable legacy entries and keep migrating the rest.
    }
  });
  return mergedState;
}

function normalizeLocalStateForSupabase(localState) {
  const idMap = loadMigrationIdMap();
  const nextState = structuredClone(initialState);
  onlineDataModules.forEach((module) => {
    nextState[module] = localState[module].map((record) => {
      const legacyId = `${module}:${String(record.id || makeId())}`;
      const mappedId = idMap[legacyId] || makeUuid();
      idMap[legacyId] = mappedId;
      const { empresa_documento, created_at, ...cleanRecord } = record;
      return { ...cleanRecord, id: mappedId };
    });
  });
  saveMigrationIdMap(idMap);
  return nextState;
}

function loadMigrationIdMap() {
  const raw = localStorage.getItem(MIGRATION_ID_MAP_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveMigrationIdMap(idMap) {
  localStorage.setItem(MIGRATION_ID_MAP_KEY, JSON.stringify(idMap));
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

async function supabaseUpsert(table, rows, options = {}) {
  if (!rows.length) return options.returnRows ? [] : undefined;
  const baseUrl = SUPABASE_CONFIG.url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const url = new URL(`${baseUrl}/rest/v1/${table}`);
  if (options.onConflict) {
    url.searchParams.set("on_conflict", options.onConflict);
  }

  const prefer = [
    "resolution=merge-duplicates",
    options.returnRows ? "return=representation" : ""
  ].filter(Boolean).join(",");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_CONFIG.anonKey,
      Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      "Content-Type": "application/json",
      Prefer: prefer
    },
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    throw new Error(`Supabase upsert failed: ${response.status}`);
  }

  return options.returnRows ? response.json() : undefined;
}

async function supabaseDelete(table, params) {
  const baseUrl = SUPABASE_CONFIG.url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const url = new URL(`${baseUrl}/rest/v1/${table}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_CONFIG.anonKey,
      Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase delete failed: ${response.status}`);
  }
}

async function loadOnlineState() {
  const nextState = structuredClone(initialState);
  await Promise.all(onlineDataModules.map(async (module) => {
    try {
      nextState[module] = await supabaseGetMany(supabaseTables[module], {
        empresa_documento: `eq.${activeTenantDocument}`,
        select: "*"
      });
    } catch {
      nextState[module] = [];
    }
  }));
  return nextState;
}

async function saveOnlineModule(module) {
  const table = supabaseTables[module];
  const rows = getModuleCollection(module).map((item) => ({
    ...item,
    empresa_documento: activeTenantDocument
  }));
  if (rows.length) {
    await supabaseUpsert(table, rows);
  }
}

async function deleteModuleRecord(module, id, removedRecord) {
  if (module === "empresas" || module === "usuarios") {
    if (isSupabaseConfigured() && removedRecord) {
      if (module === "empresas") {
        await supabaseDelete("empresas", { documento: `eq.${normalizeCompanyDocument(removedRecord.documento)}` });
      } else {
        await supabaseDelete("usuarios", { usuario: `eq.${removedRecord.usuario}` });
      }
    }
    saveAccessRegistry();
    return;
  }

  if (["contasReceber", "contasPagar"].includes(module)) {
    state.movimentacoes = state.movimentacoes.filter((movement) => movement.origemId !== id);
  }

  if (usesOnlineData(module)) {
    if (["contasReceber", "contasPagar"].includes(module)) {
      await supabaseDelete("movimentacoes_financeiras", { origemId: `eq.${id}` });
    }
    await supabaseDelete(supabaseTables[module], {
      id: `eq.${id}`,
      empresa_documento: `eq.${activeTenantDocument}`
    });
    return;
  }

  saveModuleCollection(module);
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
      { id: makeUuid(), nome: tenant, documento: DEFAULT_TENANT_DOCUMENT, status: "Ativa" }
    ],
    usuarios: [
      { id: makeUuid(), usuario: username, senha: password, empresas: [DEFAULT_TENANT_DOCUMENT], perfil: "Administrador", status: "Ativo" }
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

  company = { id: makeUuid(), nome: DEFAULT_TENANT, documento: DEFAULT_TENANT_DOCUMENT, status: "Ativa" };
  accessRegistry.empresas.push(company);
  return company;
}

function companyByDocument(document) {
  return accessRegistry.empresas.find((company) => sameText(company.documento, document));
}

function companyNameByDocument(document) {
  return companyByDocument(document)?.nome || document;
}

function compactCompanyName(name, maxLength = 38) {
  const value = String(name || "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
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

async function setTenant(tenantName) {
  const company = companyByDocument(tenantName);
  activeTenantDocument = company?.documento || tenantName;
  activeTenant = company?.nome || tenantName;
  activeTenantKey = tenantKey(company?.documento || tenantName);
  if (usesOnlineData("clientes")) {
    try {
      state = await loadOnlineState();
    } catch {
      state = loadState();
    }
  } else {
    state = loadState();
  }
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
    .map((companyDocument) => {
      const companyName = companyNameByDocument(companyDocument);
      return `<option value="${escapeAttr(companyDocument)}" title="${escapeAttr(companyName)}">${escapeHtml(compactCompanyName(companyName, 42))}</option>`;
    })
    .join("");
  tenantError.textContent = "";
  loginScreen.classList.add("is-hidden");
  tenantScreen.classList.remove("is-hidden");
  tenantSelect.focus();
}

async function completeLogin(tenant) {
  currentUsername = pendingLogin?.username || currentUsername;
  sessionCompanies = pendingLogin?.companies || [tenant];
  await setTenant(tenant);
  if (isSupabaseConfigured()) {
    try {
      await saveOnlineAccessRegistry("empresas");
      await saveOnlineAccessRegistry("usuarios");
      await loadOnlineAccessRegistry();
      refreshCurrentSessionCompanies();
    } catch {
      // Keep the session available even if the access registry cannot refresh now.
    }
  }
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
  render();
}

function refreshCurrentSessionCompanies() {
  if (!currentUsername) return;
  const currentUser = accessRegistry.usuarios.find((user) => sameText(user.usuario, currentUsername));
  if (!currentUser) return;
  const availableCompanies = userCompanies(currentUser).filter((companyDocument) =>
    accessRegistry.empresas.some((company) => sameText(company.documento, companyDocument) && company.status === "Ativa")
  );
  if (!availableCompanies.length) return;
  sessionCompanies = availableCompanies;
  if (!sessionCompanies.some((companyDocument) => sameText(companyDocument, activeTenantDocument))) {
    const company = companyByDocument(sessionCompanies[0]);
    activeTenantDocument = company?.documento || sessionCompanies[0];
    activeTenant = company?.nome || sessionCompanies[0];
    activeTenantKey = tenantKey(activeTenantDocument);
  }
}

function renderTenantSwitcher() {
  const tenantContainer = tenantSwitcher.closest(".sidebar-tenant");
  const availableCompanies = sessionCompanies.filter((companyDocument) => companyByDocument(companyDocument)?.status === "Ativa");
  tenantContainer.classList.toggle("has-switcher", availableCompanies.length > 1);
  tenantSwitcher.innerHTML = availableCompanies
    .map((companyDocument) => {
      const companyName = companyNameByDocument(companyDocument);
      return `<option value="${escapeAttr(companyDocument)}" title="${escapeAttr(companyName)}" ${sameText(companyDocument, activeTenantDocument) ? "selected" : ""}>${escapeHtml(compactCompanyName(companyName, 30))}</option>`;
    })
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

